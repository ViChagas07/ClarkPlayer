"""
One-shot script to mark known Brazilian artists in the catalog.

Run once: python -m scripts.mark_brazilian_artists
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy import select, update
from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import CatalogArtistModel

# Artists whose names are known to be Brazilian
BRAZILIAN_NAMES = {
    # Sertanejo
    "Jorge & Mateus", "Henrique & Juliano", "Marília Mendonça",
    "Gusttavo Lima", "Luan Santana", "Zé Neto & Cristiano",
    "Maiara & Maraisa", "Matheus & Kauan", "Simone & Simaria",
    "Fernando & Sorocaba", "Israel & Rodolffo", "Hugo & Guilherme",
    "Victor & Leo", "César Menotti & Fabiano", "Bruno & Marrone",
    "Edson & Hudson", "Chitãozinho & Xororó", "Leandro & Leonardo",
    "Zezé Di Camargo & Luciano", "Daniel", "Paula Fernandes",
    "Cristiano Araújo", "Naiara Azevedo", "Michel Teló",
    # MPB
    "Caetano Veloso", "Gilberto Gil", "Chico Buarque", "Milton Nascimento",
    "Elis Regina", "Marisa Monte", "Djavan", "Nando Reis",
    "Vanessa da Mata", "Zeca Baleiro", "Lenine", "Céu",
    "Adriana Calcanhotto", "Gal Costa", "Belchior", "Tom Jobim",
    "Vinícius de Moraes", "Toquinho", "João Gilberto",
    "Jorge Ben Jor", "Tim Maia", "Cassia Eller", "Ana Carolina",
    "Seu Jorge", "Roberta Sá", "Maria Gadú", "Tiago Iorc",
    "AnaVitória", "Tulipa Ruiz",
    # Samba/Pagode
    "Zeca Pagodinho", "Beth Carvalho", "Martinho da Vila", "Alcione",
    "Jorge Aragão", "Arlindo Cruz", "Diogo Nogueira", "Cartola",
    "Noel Rosa", "Clara Nunes", "Fundo de Quintal", "Paulinho da Viola",
    "Grupo Revelação", "Exaltasamba", "Thiaguinho", "Raça Negra",
    "Soweto", "Turma do Pagode", "Sorriso Maroto", "Péricles",
    "Ferrugem", "Dilsinho", "Menos é Mais", "Belo", "Alexandre Pires",
    # Forró
    "Wesley Safadão", "Elba Ramalho", "Alceu Valença",
    "Dominguinhos", "Dorgival Dantas", "Falamansa",
    "Luiz Gonzaga", "Zé Ramalho", "Geraldo Azevedo",
    # Funk brasileiro
    "Anitta", "Kevin O Chris", "MC Livinho", "MC Kevinho",
    "Ludmilla", "Pabllo Vittar", "MC Loma", "MC Rebecca",
    "Lexa", "Valesca Popozuda", "MC Don Juan", "Gloria Groove",
    "Pedro Sampaio", "Luisa Sonza", "Pocah",
    # Gospel brasileiro
    "Fernandinho", "Aline Barros", "Gabriela Rocha",
    "André Valadão", "Isaias Saad", "Cassiane",
    "Damares", "Anderson Freire", "Bruna Karla", "Nívea Soares",
    # Rock brasileiro
    "Legião Urbana", "Titãs", "Paralamas do Sucesso", "Cazuza",
    "Barão Vermelho", "Capital Inicial", "Skank", "Charlie Brown Jr.",
    "Nação Zumbi", "O Rappa", "Os Mutantes", "Engenheiros do Hawaii",
    "Raimundos", "Planet Hemp", "Supercombo", "NX Zero",
    "CPM 22", "Detonautas", "Jota Quest", "Sepultura", "Angra",
    # Rap brasileiro
    "Racionais MC's", "Sabotage", "Criolo", "Haikaiss",
    "Hungria Hip Hop", "Projota", "Filipe Ret", "Djonga",
    "BK'", "Baco Exu do Blues", "Emicida", "Rashid",
    "Matuê", "Xamã", "Froid", "Sant",
}

async def main():
    async with _async_session_factory() as session:
        count = 0
        for name in BRAZILIAN_NAMES:
            result = await session.execute(
                select(CatalogArtistModel).where(CatalogArtistModel.name == name)
            )
            artist = result.scalar_one_or_none()
            if artist and not artist.is_brazilian:
                artist.is_brazilian = True
                count += 1
        await session.commit()
        print(f"Marked {count} artists as Brazilian")

if __name__ == "__main__":
    asyncio.run(main())
