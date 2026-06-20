"""
Remove genres whose `name` is a raw MBID or barcode (technical leak from sync).

Strategy:
  1. Identify dirty genres (same regex as diagnose script).
  2. Export them + their artist associations to a JSON backup.
  3. Delete the artist-genre associations for those genres.
  4. Delete the dirty genre rows themselves.

Usage:
    python scripts/clean_dirty_genres.py --dry-run   # report only, no changes
    python scripts/clean_dirty_genres.py              # execute for real
"""

import argparse
import asyncio
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import delete, select

from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import CatalogGenreModel, CatalogArtistGenreModel

MBID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE
)
BARCODE_PATTERN = re.compile(r"^\d{8,14}$")


def is_dirty_genre_name(name: str) -> bool:
    stripped = name.strip()
    return bool(MBID_PATTERN.match(stripped) or BARCODE_PATTERN.match(stripped))


async def main(dry_run: bool) -> None:
    async with _async_session_factory() as session:
        result = await session.execute(select(CatalogGenreModel))
        genres = list(result.scalars().all())
        dirty = [g for g in genres if is_dirty_genre_name(g.name)]

        if not dirty:
            print("Nenhum gênero sujo encontrado. Nada a fazer.")
            return

        print(f"Encontrados {len(dirty)} gêneros sujos.")

        # ── Backup antes de qualquer alteração ────────────────────────────
        backup_dir = Path("scripts/backups")
        backup_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_path = backup_dir / f"dirty_genres_{timestamp}.json"

        backup_data = []
        for g in dirty:
            assoc_result = await session.execute(
                select(CatalogArtistGenreModel.artist_id).where(
                    CatalogArtistGenreModel.genre_id == g.id
                )
            )
            artist_ids = [str(row) for row in assoc_result.scalars().all()]
            backup_data.append({
                "id": str(g.id),
                "name": g.name,
                "slug": g.slug,
                "linked_artist_ids": artist_ids,
            })

        backup_path.write_text(json.dumps(backup_data, indent=2, ensure_ascii=False))
        print(f"Backup salvo em: {backup_path}")

        if dry_run:
            print("\n[DRY RUN] Nenhuma alteração foi feita. Registros que SERIAM removidos:")
            for entry in backup_data:
                artist_count = len(entry["linked_artist_ids"])
                print(f"  - {entry['name']!r}  (id={entry['id']}, {artist_count} artista(s) linkado(s))")
            return

        # ── Execução real ─────────────────────────────────────────────────
        dirty_ids = [g.id for g in dirty]

        # Remove associações primeiro (evita FK violation)
        del_assoc = await session.execute(
            delete(CatalogArtistGenreModel).where(
                CatalogArtistGenreModel.genre_id.in_(dirty_ids)
            )
        )
        removed_assoc = del_assoc.rowcount

        del_genre = await session.execute(
            delete(CatalogGenreModel).where(CatalogGenreModel.id.in_(dirty_ids))
        )
        removed_genres = del_genre.rowcount

        await session.commit()

        print(f"\n{removed_assoc} associação(ões) removida(s).")
        print(f"{removed_genres} gênero(s) sujo(s) removido(s) com sucesso.")
        print()
        print("IMPORTANTE: limpe o cache Redis de gêneros após rodar este script:")
        print('  redis-cli KEYS "clarkplayer:catalog:genre*" | xargs redis-cli DEL')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Remove gêneros com nomes técnicos crus (MBIDs, barcodes)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Apenas reporta o que seria removido, sem alterar o banco",
    )
    args = parser.parse_args()
    asyncio.run(main(dry_run=args.dry_run))
