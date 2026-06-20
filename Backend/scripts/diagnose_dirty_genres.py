"""
Diagnose genres with technical/raw values in the `name` field
(MBIDs, UPC/EAN barcodes, or other non-human-readable strings).

Usage:
    python scripts/diagnose_dirty_genres.py
"""

import asyncio
import re
from collections.abc import AsyncGenerator

from sqlalchemy import select

from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import CatalogGenreModel, CatalogArtistGenreModel

# MBID: formato UUID v4 padrão
MBID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE
)
# Barcode UPC/EAN: 8 a 14 dígitos numéricos puros
BARCODE_PATTERN = re.compile(r"^\d{8,14}$")


def is_dirty_genre_name(name: str) -> bool:
    """Return True if the genre name looks like a raw MBID or barcode."""
    stripped = name.strip()
    return bool(MBID_PATTERN.match(stripped) or BARCODE_PATTERN.match(stripped))


async def main() -> None:
    async with _async_session_factory() as session:
        result = await session.execute(select(CatalogGenreModel))
        genres = list(result.scalars().all())

        dirty = [g for g in genres if is_dirty_genre_name(g.name)]

        print(f"Total de gêneros no banco: {len(genres)}")
        print(f"Gêneros com nome técnico (sujo): {len(dirty)}")
        print("-" * 60)

        for g in dirty:
            assoc_result = await session.execute(
                select(CatalogArtistGenreModel).where(
                    CatalogArtistGenreModel.genre_id == g.id
                )
            )
            assoc_count = len(list(assoc_result.scalars().all()))
            print(f"  id={g.id}  name={g.name!r}  artistas_linkados={assoc_count}")


if __name__ == "__main__":
    asyncio.run(main())
