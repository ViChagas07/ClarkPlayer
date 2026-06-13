"""
Metrics REST API — exposes performance and catalog statistics.
"""

from typing import Any

from fastapi import APIRouter, Query

from app.middleware.metrics_middleware import get_metrics_service

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("/summary")
async def get_metrics_summary() -> dict[str, Any]:
    """Full metrics summary: API performance, cache stats, catalog size, errors."""
    service = get_metrics_service()
    summary = await service.get_metrics_summary()

    # Fetch sync status from scheduler if available
    sync_status: dict[str, Any] = {}
    try:
        from app.services.catalog.sync_scheduler import _global_scheduler
        if _global_scheduler is not None:
            sync_status = await _global_scheduler.get_sync_status()
    except Exception:
        pass

    return {
        "api": {
            "total_requests": summary.api.total_requests,
            "avg_ms": round(summary.api.avg_ms, 2),
            "p50_ms": round(summary.api.p50_ms, 2),
            "p95_ms": round(summary.api.p95_ms, 2),
            "p99_ms": round(summary.api.p99_ms, 2),
            "by_endpoint": summary.api.by_endpoint,
        },
        "cache": {
            "hit_count": summary.cache.hit_count,
            "miss_count": summary.cache.miss_count,
            "hit_rate": (
                round(
                    summary.cache.hit_count
                    / max(summary.cache.hit_count + summary.cache.miss_count, 1),
                    4,
                )
            ),
            "by_prefix": summary.cache.by_prefix,
        },
        "catalog": {
            "artists": summary.catalog.artists,
            "albums": summary.catalog.albums,
            "tracks": summary.catalog.tracks,
            "genres": summary.catalog.genres,
        },
        "errors": summary.error_rate,
        "sync": sync_status,
    }


@router.get("/cache")
async def get_cache_stats() -> dict[str, Any]:
    """Cache hit/miss statistics across all cache prefixes."""
    service = get_metrics_service()
    stats = await service.get_cache_stats()
    return {
        "hit_count": stats.hit_count,
        "miss_count": stats.miss_count,
        "hit_rate": round(
            stats.hit_count / max(stats.hit_count + stats.miss_count, 1), 4
        ),
        "by_prefix": stats.by_prefix,
    }


@router.get("/api")
async def get_api_stats(window_minutes: int = Query(60, ge=1, le=1440)) -> dict[str, Any]:
    """Per-endpoint API response times for a sliding window."""
    service = get_metrics_service()
    stats = await service.get_api_stats(window_minutes=window_minutes)
    return {
        "window_minutes": window_minutes,
        "total_requests": stats.total_requests,
        "avg_ms": round(stats.avg_ms, 2),
        "p50_ms": round(stats.p50_ms, 2),
        "p95_ms": round(stats.p95_ms, 2),
        "p99_ms": round(stats.p99_ms, 2),
        "by_endpoint": stats.by_endpoint,
    }


@router.get("/catalog")
async def get_catalog_stats() -> dict[str, Any]:
    """Counts of artists, albums, tracks, and genres in the catalog."""
    service = get_metrics_service()
    size = await service.get_catalog_size()
    return {
        "artists": size.artists,
        "albums": size.albums,
        "tracks": size.tracks,
        "genres": size.genres,
    }


@router.get("/sync")
async def get_sync_status() -> dict[str, Any]:
    """Current status of the catalog sync scheduler."""
    try:
        from app.services.catalog.sync_scheduler import _global_scheduler
        if _global_scheduler is not None:
            return await _global_scheduler.get_sync_status()
    except Exception:
        pass
    return {"running": False, "jobs": {}, "detail": "Scheduler not started."}
