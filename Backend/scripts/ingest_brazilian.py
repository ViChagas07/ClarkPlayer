"""
Insert Brazilian artists directly into the catalog database.
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import (
    CatalogArtistModel, CatalogAlbumModel, CatalogTrackModel,
)
from app.services.music.clients.itunes import ITunesClient
from app.core.config import get_settings


BRAZILIAN_ARTISTS = [
    "Jorge & Mateus", "Henrique & Juliano", "Marília Mendonça",
    "Gusttavo Lima", "Luan Santana", "Zé Neto & Cristiano",
    "Maiara & Maraisa", "Matheus & Kauan",
    "Caetano Veloso", "Gilberto Gil", "Chico Buarque", "Milton Nascimento",
    "Marisa Monte", "Djavan", "Seu Jorge", "Tim Maia",
    "Zeca Pagodinho", "Alcione", "Fundo de Quintal",
    "Grupo Revelação", "Thiaguinho", "Ferrugem",
    "Anitta", "Ludmilla", "MC Kevinho", "MC Livinho",
    "Pabllo Vittar", "Luisa Sonza", "Pedro Sampaio",
    "Wesley Safadão", "Elba Ramalho", "Falamansa",
    "Legião Urbana", "Titãs", "Charlie Brown Jr.", "Skank",
    "Capital Inicial", "Os Mutantes",
    "Racionais MC's", "Criolo", "Emicida",
]


async def main():
    settings = get_settings()
    print(f"DB: {settings.DATABASE_URL[:50]}...")
    total = 0

    async with httpx.AsyncClient(timeout=httpx.Timeout(30.0), follow_redirects=True) as http:
        itunes = ITunesClient(http)

        for name in BRAZILIAN_ARTISTS:
            async with _async_session_factory() as session:
                # Skip if exists
                existing = await session.execute(
                    select(CatalogArtistModel).where(CatalogArtistModel.name == name)
                )
                if existing.scalar_one_or_none():
                    print(f"  SKIP: {name}")
                    continue

                print(f"  INGEST: {name}...", end=" ", flush=True)

                try:
                    tracks_data = await itunes.search(term=name, media="music", entity="musicTrack", limit=8, country="BR")
                    if not tracks_data:
                        print("no tracks")
                        continue

                    first_art = tracks_data[0].get("artworkUrl100", "")
                    image_url = ITunesClient.get_best_artwork(first_art, 600) if first_art else None

                    # Use ON CONFLICT DO NOTHING for idempotent inserts
                    artist_stmt = pg_insert(CatalogArtistModel).values(
                        name=name, image_url=image_url, popularity=0,
                        is_brazilian=True, country="BR",
                    ).on_conflict_do_nothing()
                    await session.execute(artist_stmt)
                    await session.flush()

                    # Get the artist (might already exist from conflict)
                    result = await session.execute(
                        select(CatalogArtistModel).where(CatalogArtistModel.name == name)
                    )
                    artist = result.scalar_one()

                    track_count = 0
                    for td in tracks_data:
                        preview = td.get("previewUrl")
                        if not preview:
                            continue
                        title = td.get("trackName") or td.get("collectionName", "")
                        if not title:
                            continue

                        album_title = td.get("collectionName")
                        cover = ITunesClient.get_best_artwork(td.get("artworkUrl100", ""), 600)

                        album_id = None
                        if album_title:
                            alb_stmt = pg_insert(CatalogAlbumModel).values(
                                title=album_title, artist_id=artist.id,
                                cover_url=cover or None,
                                release_date=(td.get("releaseDate", "") or "")[:10] or None,
                                track_count=td.get("trackCount") or 1,
                            ).on_conflict_do_nothing()
                            await session.execute(alb_stmt)
                            await session.flush()
                            alb = await session.execute(
                                select(CatalogAlbumModel).where(
                                    CatalogAlbumModel.title == album_title,
                                    CatalogAlbumModel.artist_id == artist.id,
                                )
                            )
                            album = alb.scalar_one_or_none()
                            if album:
                                album_id = album.id

                        track_stmt = pg_insert(CatalogTrackModel).values(
                            title=title, artist_id=artist.id, album_id=album_id,
                            duration_ms=td.get("trackTimeMillis"),
                            preview_url=preview, popularity=0, explicit=False,
                        ).on_conflict_do_nothing()
                        await session.execute(track_stmt)
                        track_count += 1

                    await session.commit()
                    total += 1
                    print(f"{track_count} tracks")
                except Exception as e:
                    await session.rollback()
                    print(f"ERR: {e}")
                    continue

    print(f"\nDone! {total} Brazilian artists ingested.")


if __name__ == "__main__":
    asyncio.run(main())
