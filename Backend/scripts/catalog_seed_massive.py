"""
Massive catalog seed runner — ingests 5000+ artists with preview-enabled tracks.

Usage:
    python -m scripts.catalog_seed_massive [--batch-size 50] [--max-artists 5000]

This script:
1. Reads all artists from massive_seed.py
2. Ingests each artist via the CatalogIngestionWorker pipeline
3. Only persists tracks with valid preview_url
4. Commits every batch_size records
5. Reports progress and final statistics
6. Runs deduplication after completion
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys
import time
from pathlib import Path

# Ensure backend is on path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import httpx
from sqlalchemy import func, select

from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistModel,
    CatalogTrackModel,
    CatalogGenreModel,
)
from app.services.catalog.ingestion import (
    CatalogIngestionWorker,
    BATCH_SIZE as DEFAULT_BATCH_SIZE,
    MAX_CONCURRENT,
)
from app.services.catalog.massive_seed import (
    ALL_ARTISTS,
    MASSIVE_SEED,
    BRAZILIAN_ARTISTS_MASSIVE,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("catalog.seed_massive")


async def get_db_stats() -> dict:
    """Return current catalog counts."""
    async with _async_session_factory() as session:
        artists = await session.execute(
            select(func.count()).select_from(CatalogArtistModel)
        )
        tracks = await session.execute(
            select(func.count()).select_from(CatalogTrackModel)
        )
        tracks_with_preview = await session.execute(
            select(func.count())
            .select_from(CatalogTrackModel)
            .where(CatalogTrackModel.preview_url.is_not(None))
        )
        albums = await session.execute(
            select(func.count()).select_from(CatalogAlbumModel)
        )
        genres = await session.execute(
            select(func.count()).select_from(CatalogGenreModel)
        )
        return {
            "artists": artists.scalar_one(),
            "tracks": tracks.scalar_one(),
            "tracks_with_preview": tracks_with_preview.scalar_one(),
            "albums": albums.scalar_one(),
            "genres": genres.scalar_one(),
        }


async def run_massive_seed(
    max_artists: int = 5000,
    batch_size: int = 50,
) -> dict:
    """
    Execute massive seeding pipeline.

    Args:
        max_artists: Maximum number of artists to ingest (from seed list)
        batch_size: Commit batch size
    """
    stats_before = await get_db_stats()
    logger.info("Stats BEFORE: %s", stats_before)

    artists_to_ingest = ALL_ARTISTS[:max_artists]
    logger.info("Will ingest %d artists", len(artists_to_ingest))

    total_attempted = 0
    total_succeeded = 0
    total_failed = 0
    start_time = time.monotonic()

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(30.0),
        limits=httpx.Limits(max_connections=100),
        follow_redirects=True,
    ) as http_client:
        worker = CatalogIngestionWorker(_async_session_factory, http_client)

        for i in range(0, len(artists_to_ingest), batch_size):
            batch = artists_to_ingest[i : i + batch_size]
            batch_start = time.monotonic()

            tasks = [worker.ingest_artist(name) for name in batch]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            batch_succeeded = 0
            batch_failed = 0
            for name, result in zip(batch, results):
                total_attempted += 1
                if isinstance(result, Exception):
                    logger.debug("Failed %r: %s", name, result)
                    batch_failed += 1
                elif result is not None:
                    batch_succeeded += 1
                else:
                    batch_failed += 1

            total_succeeded += batch_succeeded
            total_failed += batch_failed

            batch_elapsed = time.monotonic() - batch_start
            overall_elapsed = time.monotonic() - start_time
            progress_pct = (total_attempted / len(artists_to_ingest)) * 100

            logger.info(
                "Batch %d/%d | success=%d fail=%d | %.1fs | "
                "Progress: %d/%d (%.1f%%) | Elapsed: %.0fs",
                i // batch_size + 1,
                (len(artists_to_ingest) + batch_size - 1) // batch_size,
                batch_succeeded,
                batch_failed,
                batch_elapsed,
                total_attempted,
                len(artists_to_ingest),
                progress_pct,
                overall_elapsed,
            )

    elapsed = time.monotonic() - start_time
    stats_after = await get_db_stats()

    # Run deduplication after mass ingestion
    logger.info("Running deduplication...")
    async with _async_session_factory() as session:
        from app.services.catalog.ingestion import (
            CatalogIngestionWorker,
        )
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_connections=10),
            follow_redirects=True,
        ) as http:
            dedup_worker = CatalogIngestionWorker(_async_session_factory, http)
            removed = await dedup_worker.deduplicate_catalog()
            logger.info("Deduplication removed %d duplicates", removed)

    logger.info("Stats AFTER: %s", stats_after)
    logger.info(
        "SEED COMPLETE: %d artists, %d tracks (%d with preview), "
        "%d albums, %d genres | %.0fs total",
        stats_after["artists"],
        stats_after["tracks"],
        stats_after["tracks_with_preview"],
        stats_after["albums"],
        stats_after["genres"],
        elapsed,
    )

    return {
        "artists_before": stats_before["artists"],
        "artists_after": stats_after["artists"],
        "tracks_before": stats_before["tracks"],
        "tracks_after": stats_after["tracks"],
        "tracks_with_preview_before": stats_before["tracks_with_preview"],
        "tracks_with_preview_after": stats_after["tracks_with_preview"],
        "albums_before": stats_before["albums"],
        "albums_after": stats_after["albums"],
        "genres_before": stats_before["genres"],
        "genres_after": stats_after["genres"],
        "total_attempted": total_attempted,
        "total_succeeded": total_succeeded,
        "total_failed": total_failed,
        "elapsed_seconds": elapsed,
    }


async def main():
    parser = argparse.ArgumentParser(description="Massive catalog seed runner")
    parser.add_argument(
        "--max-artists",
        type=int,
        default=5000,
        help="Maximum artists to ingest (default: 5000)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=50,
        help="Batch commit size (default: 50)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Just count artists in seed without ingesting",
    )
    args = parser.parse_args()

    if args.dry_run:
        print(f"Seed data contains {len(ALL_ARTISTS)} unique artists")
        print(f"Genres: {len(MASSIVE_SEED)} global + {len(BRAZILIAN_ARTISTS_MASSIVE)} brazilian")
        for genre, artists in MASSIVE_SEED.items():
            print(f"  {genre}: {len(artists)} artists")
        for genre, artists in BRAZILIAN_ARTISTS_MASSIVE.items():
            print(f"  brazilian/{genre}: {len(artists)} artists")
        return

    result = await run_massive_seed(
        max_artists=args.max_artists,
        batch_size=args.batch_size,
    )

    print("\n" + "=" * 60)
    print("MASSIVE SEED RESULTS")
    print("=" * 60)
    print(f"Artists:      {result['artists_before']:>6} → {result['artists_after']:>6} "
          f"(+{result['artists_after'] - result['artists_before']})")
    print(f"Tracks:       {result['tracks_before']:>6} → {result['tracks_after']:>6} "
          f"(+{result['tracks_after'] - result['tracks_before']})")
    print(f"With preview: {result['tracks_with_preview_before']:>6} → "
          f"{result['tracks_with_preview_after']:>6} "
          f"(+{result['tracks_with_preview_after'] - result['tracks_with_preview_before']})")
    print(f"Albums:       {result['albums_before']:>6} → {result['albums_after']:>6} "
          f"(+{result['albums_after'] - result['albums_before']})")
    print(f"Genres:       {result['genres_before']:>6} → {result['genres_after']:>6} "
          f"(+{result['genres_after'] - result['genres_before']})")
    print(f"Succeeded:    {result['total_succeeded']}/{result['total_attempted']}")
    print(f"Elapsed:      {result['elapsed_seconds']:.0f}s")


if __name__ == "__main__":
    asyncio.run(main())
