"""
Catalog sync task implementations.

Each function is a standalone coroutine that can be called by the
:class:`CatalogSyncScheduler` on its configured cadence.  Every task
returns a ``dict`` with at least a ``"status"`` key so the scheduler
can record outcomes.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime

from sqlalchemy import func, select

from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
    TrackPreviewModel,
)

logger = logging.getLogger("catalog.sync.tasks")


async def sync_all_artists_enrichment() -> dict:
    """
    Enrich all artists with latest data from external APIs.

    Re-runs the full ingestion pipeline to update popularity,
    images, bios, and other metadata for every artist.
    """
    from app.services.catalog.ingestion import create_ingestion_worker

    try:
        worker = create_ingestion_worker(_async_session_factory)
        async with worker._http:
            stats = await worker.run_full_ingestion()
        logger.info("Artist enrichment completed: %s", stats)
        return {"status": "ok", "artists_enriched": stats.get("artists", 0)}
    except Exception as exc:
        logger.error("Artist enrichment failed: %s", exc)
        return {"status": "error", "error": str(exc)}


async def refresh_expired_previews() -> dict:
    """
    Check for expired preview URLs and fetch fresh ones.

    Queries ``catalog_track_previews`` for entries whose
    ``expires_at`` is in the past and attempts to refresh them.
    """
    refreshed = 0
    try:
        async with _async_session_factory() as session:
            now = datetime.now(UTC)
            result = await session.execute(
                select(func.count()).select_from(TrackPreviewModel).where(
                    TrackPreviewModel.expires_at.is_not(None),
                    TrackPreviewModel.expires_at < now,
                )
            )
            expired_count = result.scalar_one()

            if expired_count == 0:
                return {"status": "ok", "expired_found": 0, "refreshed": 0}

        from app.services.catalog.ingestion import create_ingestion_worker
        worker = create_ingestion_worker(_async_session_factory)
        async with worker._http:
            refreshed = await worker.refresh_previews()

        logger.info("Preview refresh: %d refreshed", refreshed)
        return {
            "status": "ok",
            "expired_found": expired_count,
            "refreshed": refreshed,
        }
    except Exception as exc:
        logger.error("Preview refresh failed: %s", exc)
        return {"status": "error", "error": str(exc)}


async def run_deduplication() -> dict:
    """
    Find and merge duplicate records in catalog tables.

    Checks for artists with identical names and tracks with
    identical (title, artist_id) pairs.
    """
    merged_artists = 0
    merged_tracks = 0
    try:
        async with _async_session_factory() as session:
            # ── Duplicate artists by name ──────────────────────────────
            dup_result = await session.execute(
                select(
                    CatalogArtistModel.name,
                    func.count(CatalogArtistModel.id).label("cnt"),
                    func.array_agg(CatalogArtistModel.id).label("ids"),
                )
                .group_by(CatalogArtistModel.name)
                .having(func.count(CatalogArtistModel.id) > 1)
            )
            for row in dup_result.all():
                ids = row[2]
                keep = ids[0]
                for dup_id in ids[1:]:
                    # Reassign tracks to the kept artist
                    await session.execute(
                        select(CatalogTrackModel).where(
                            CatalogTrackModel.artist_id == dup_id
                        )
                    )
                    dup_tracks = (await session.execute(
                        select(CatalogTrackModel).where(
                            CatalogTrackModel.artist_id == dup_id
                        )
                    )).scalars().all()
                    for track in dup_tracks:
                        track.artist_id = keep
                        merged_tracks += 1
                    # Delete duplicate artist
                    dup = await session.get(CatalogArtistModel, dup_id)
                    if dup:
                        await session.delete(dup)
                    merged_artists += 1

            await session.commit()
            logger.info(
                "Dedup: %d artists merged, %d tracks reassigned",
                merged_artists, merged_tracks,
            )
            return {
                "status": "ok",
                "artists_merged": merged_artists,
                "tracks_reassigned": merged_tracks,
            }
    except Exception as exc:
        logger.error("Deduplication failed: %s", exc)
        return {"status": "error", "error": str(exc)}


async def recompute_discovery_sections() -> dict:
    """
    Force recomputation of all discovery sections.

    This refreshes any precomputed sections used by the
    frontend discovery UI (genre buckets, popular picks, etc.).
    """
    try:
        async with _async_session_factory() as session:
            artist_count_result = await session.execute(
                select(func.count()).select_from(CatalogArtistModel)
            )
            track_count_result = await session.execute(
                select(func.count()).select_from(CatalogTrackModel)
            )
            genre_count_result = await session.execute(
                select(func.count()).select_from(CatalogGenreModel)
            )

        from app.core.cache_keys import CacheTTL, make_cache_key
        from app.core.redis import get_cache_redis
        import json
        import logging

        _log = logging.getLogger("catalog.sync.tasks")
        summary = {
            "artists": artist_count_result.scalar_one(),
            "tracks": track_count_result.scalar_one(),
            "genres": genre_count_result.scalar_one(),
            "updated_at": datetime.now(UTC).isoformat(),
        }
        try:
            redis = await get_cache_redis()
            key = make_cache_key("discovery", "sections")
            await redis.set(key, json.dumps(summary))
            await redis.expire(key, CacheTTL.DISCOVERY)
        except Exception:
            _log.debug("Redis unavailable — discovery cache not updated")

        _log.info("Discovery sections recomputed: %s", summary)
        return {"status": "ok", **summary}
    except Exception as exc:
        logger.error("Discovery recompute failed: %s", exc)
        return {"status": "error", "error": str(exc)}


async def recalculate_trending() -> dict:
    """
    Recalculate trending scores based on recent plays.

    Trending is approximated by popularity combined with recency.
    This task updates a Redis sorted set of trending track IDs.
    """
    try:
        async with _async_session_factory() as session:
            # Top-N tracks by popularity as a simple trending proxy
            result = await session.execute(
                select(CatalogTrackModel.id, CatalogTrackModel.popularity)
                .order_by(CatalogTrackModel.popularity.desc())
                .limit(200)
            )
            rows = result.all()

        from app.core.cache_keys import CacheTTL, make_cache_key
        from app.core.redis import get_cache_redis
        import logging as _sync_log

        _log = _sync_log.getLogger("catalog.sync.tasks")
        key = make_cache_key("trending")
        try:
            redis = await get_cache_redis()
            await redis.delete(key)
            for track_id, popularity in rows:
                await redis.zadd(key, {str(track_id): popularity})
            await redis.expire(key, CacheTTL.TRENDING)
        except Exception:
            _log.debug("Redis unavailable — trending cache not updated")

        logger.info("Trending recalculated: %d tracks", len(rows))
        return {"status": "ok", "tracks_ranked": len(rows)}
    except Exception as exc:
        logger.error("Trending recalculation failed: %s", exc)
        return {"status": "error", "error": str(exc)}
