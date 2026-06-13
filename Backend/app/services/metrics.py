"""
Application performance metrics service.

Stores all metrics in Redis with time-bucketed keys:
  clark:metrics:api:{endpoint}:{minute_bucket}  →  count, total_ms
  clark:metrics:cache:{prefix}:hits              →  count
  clark:metrics:cache:{prefix}:misses            →  count
  clark:metrics:search:{minute_bucket}           →  count, total_ms, total_results
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any

from app.core.redis import get_cache_redis


def _minute_bucket() -> int:
    """Return the current Unix minute (floored to minute boundary)."""
    return int(time.time() // 60)


@dataclass
class CacheStats:
    hit_count: int = 0
    miss_count: int = 0
    by_prefix: dict[str, dict[str, int]] = field(default_factory=dict)


@dataclass
class ApiStats:
    total_requests: int = 0
    avg_ms: float = 0.0
    p50_ms: float = 0.0
    p95_ms: float = 0.0
    p99_ms: float = 0.0
    by_endpoint: dict[str, dict[str, Any]] = field(default_factory=dict)


@dataclass
class CatalogSize:
    artists: int = 0
    albums: int = 0
    tracks: int = 0
    genres: int = 0


@dataclass
class MetricsSummary:
    api: ApiStats = field(default_factory=ApiStats)
    cache: CacheStats = field(default_factory=CacheStats)
    catalog: CatalogSize = field(default_factory=CatalogSize)
    last_sync: dict[str, float] = field(default_factory=dict)
    error_rate: dict[str, int] = field(default_factory=dict)


class MetricsService:
    """
    Application performance metrics.

    Tracks:
      - API response times (avg, p50, p95, p99)
      - Cache hit/miss rates
      - Search response times
      - Catalog size (artists, albums, tracks, genres)
      - Last sync timestamps
      - Database query counts
      - Error rates
    """

    def __init__(self) -> None:
        self._error_counts: dict[str, int] = {}

    async def record_api_call(
        self, endpoint: str, duration_ms: float, status: int
    ) -> None:
        bucket = _minute_bucket()
        key = f"clark:metrics:api:{endpoint}:{bucket}"
        redis = await get_cache_redis()

        pipe = redis.pipeline()
        pipe.hincrby(key, "count", 1)
        pipe.hincrbyfloat(key, "total_ms", duration_ms)
        pipe.expire(key, 3600)
        await pipe.execute()

        # Track error counts
        if status >= 400:
            self._error_counts[endpoint] = self._error_counts.get(endpoint, 0) + 1

    async def record_cache_hit(self, key_prefix: str) -> None:
        redis = await get_cache_redis()
        k = f"clark:metrics:cache:{key_prefix}:hits"
        await redis.incr(k)
        await redis.expire(k, 86400)

    async def record_cache_miss(self, key_prefix: str) -> None:
        redis = await get_cache_redis()
        k = f"clark:metrics:cache:{key_prefix}:misses"
        await redis.incr(k)
        await redis.expire(k, 86400)

    async def record_search(
        self, query: str, duration_ms: float, result_count: int
    ) -> None:
        bucket = _minute_bucket()
        key = f"clark:metrics:search:{bucket}"
        redis = await get_cache_redis()

        pipe = redis.pipeline()
        pipe.hincrby(key, "count", 1)
        pipe.hincrbyfloat(key, "total_ms", duration_ms)
        pipe.hincrby(key, "total_results", result_count)
        pipe.expire(key, 86400)
        await pipe.execute()

    async def record_ingestion(
        self, entity_type: str, count: int, duration_ms: float
    ) -> None:
        bucket = _minute_bucket()
        key = f"clark:metrics:ingestion:{entity_type}:{bucket}"
        redis = await get_cache_redis()

        pipe = redis.pipeline()
        pipe.hincrby(key, "count", count)
        pipe.hincrbyfloat(key, "total_ms", duration_ms)
        pipe.expire(key, 86400)
        await pipe.execute()
        # Also store latest ingestion timestamp
        await redis.set(
            f"clark:metrics:ingestion:last:{entity_type}",
            str(time.time()),
        )
        await redis.expire(f"clark:metrics:ingestion:last:{entity_type}", 86400 * 7)

    async def get_metrics_summary(self) -> MetricsSummary:
        api = await self.get_api_stats(window_minutes=60)
        cache = await self.get_cache_stats()
        catalog = await self.get_catalog_size()
        return MetricsSummary(
            api=api,
            cache=cache,
            catalog=catalog,
            error_rate=self._error_counts,
        )

    async def get_cache_stats(self) -> CacheStats:
        redis = await get_cache_redis()
        stats = CacheStats()

        # Scan for all cache metrics keys
        cursor: int = 0
        while True:
            cursor, keys = await redis.scan(
                cursor, match="clark:metrics:cache:*:hits", count=100
            )
            for key in keys:
                prefix = key.rsplit(":", 1)[0].replace("clark:metrics:cache:", "")
                hits = int(await redis.get(key) or 0)
                misses_key = f"clark:metrics:cache:{prefix}:misses"
                misses = int(await redis.get(misses_key) or 0)
                stats.hit_count += hits
                stats.miss_count += misses
                stats.by_prefix[prefix] = {"hits": hits, "misses": misses}
            if cursor == 0:
                break

        return stats

    async def get_api_stats(self, window_minutes: int = 60) -> ApiStats:
        redis = await get_cache_redis()
        now_bucket = _minute_bucket()
        start_bucket = now_bucket - window_minutes

        stats = ApiStats()
        all_durations: list[float] = []

        # Scan API metric keys for the time window
        cursor: int = 0
        while True:
            cursor, keys = await redis.scan(
                cursor, match="clark:metrics:api:*", count=100
            )
            for key in keys:
                parts = key.split(":")
                if len(parts) < 6:
                    continue
                try:
                    bucket = int(parts[-1])
                except (ValueError, IndexError):
                    continue
                if bucket < start_bucket:
                    continue

                endpoint = ":".join(parts[3:-1])
                data = await redis.hgetall(key)
                if not data:
                    continue
                count = int(data.get("count", 0))
                total_ms = float(data.get("total_ms", 0))

                stats.total_requests += count
                if count > 0:
                    avg = total_ms / count
                    all_durations.append(avg)
                    if endpoint not in stats.by_endpoint:
                        stats.by_endpoint[endpoint] = {
                            "count": 0,
                            "total_ms": 0.0,
                        }
                    stats.by_endpoint[endpoint]["count"] += count
                    stats.by_endpoint[endpoint]["total_ms"] += total_ms

            if cursor == 0:
                break

        if all_durations:
            sorted_d = sorted(all_durations)
            stats.avg_ms = sum(sorted_d) / len(sorted_d)
            stats.p50_ms = sorted_d[int(len(sorted_d) * 0.50)]
            stats.p95_ms = sorted_d[int(len(sorted_d) * 0.95)]
            stats.p99_ms = sorted_d[int(len(sorted_d) * 0.99)]

        # Compute per-endpoint averages
        for ep_data in stats.by_endpoint.values():
            if ep_data["count"] > 0:
                ep_data["avg_ms"] = ep_data["total_ms"] / ep_data["count"]

        return stats

    async def get_catalog_size(self) -> CatalogSize:
        """Read cached catalog counts or compute from DB."""
        redis = await get_cache_redis()
        cached = await redis.get("clark:metrics:catalog:size")
        if cached:
            import json
            data = json.loads(cached)
            return CatalogSize(**data)

        from app.infrastructure.database import _async_session_factory
        from app.infrastructure.models.catalog import (
            CatalogAlbumModel,
            CatalogArtistModel,
            CatalogGenreModel,
            CatalogTrackModel,
        )
        from sqlalchemy import func, select

        async with _async_session_factory() as session:
            artists = await session.scalar(
                select(func.count()).select_from(CatalogArtistModel)
            )
            albums = await session.scalar(
                select(func.count()).select_from(CatalogAlbumModel)
            )
            tracks = await session.scalar(
                select(func.count()).select_from(CatalogTrackModel)
            )
            genres = await session.scalar(
                select(func.count()).select_from(CatalogGenreModel)
            )

        size = CatalogSize(
            artists=artists or 0,
            albums=albums or 0,
            tracks=tracks or 0,
            genres=genres or 0,
        )
        # Cache for 5 minutes
        import json
        await redis.set("clark:metrics:catalog:size", json.dumps(size.__dict__))
        await redis.expire("clark:metrics:catalog:size", 300)
        return size
