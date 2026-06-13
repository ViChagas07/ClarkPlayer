"""
Automated catalog synchronization scheduler.

Uses asyncio-based cron — no external dependencies (no Celery, no APScheduler).

Jobs and their default intervals:
  - Every 24h:  Full artist enrichment (popularity, images, bios)
  - Every 12h:  Refresh track previews (check expired URLs)
  - Every 6h:   Deduplication run
  - Every 1h:   Precompute discovery sections
  - Every 30m:  Trending tracks recalculation
"""

from __future__ import annotations

import asyncio
import contextlib
import logging
import time
from collections.abc import Callable, Coroutine
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger("catalog.sync.scheduler")

# Global reference set by the FastAPI lifespan — used by metrics routes.
_global_scheduler: CatalogSyncScheduler | None = None


@dataclass
class _JobDef:
    name: str
    interval_seconds: float
    coro_fn: Callable[[], Coroutine[Any, Any, dict]]
    last_run: float = 0.0
    last_result: dict | None = None


class CatalogSyncScheduler:
    """
    Lightweight async cron scheduler that runs catalog maintenance jobs.

    Usage::

        scheduler = CatalogSyncScheduler()
        await scheduler.start()
        # ... application lifetime ...
        await scheduler.stop()
    """

    def __init__(self) -> None:
        self._jobs: list[_JobDef] = []
        self._task: asyncio.Task[None] | None = None
        self._running = False
        self._started_at: float = 0.0

    def _register_jobs(self) -> None:
        from app.services.catalog.sync_tasks import (
            recalculate_trending,
            recompute_discovery_sections,
            refresh_expired_previews,
            run_deduplication,
            sync_all_artists_enrichment,
        )

        self._jobs = [
            _JobDef(
                name="artist_enrichment",
                interval_seconds=86400,  # 24h
                coro_fn=sync_all_artists_enrichment,
            ),
            _JobDef(
                name="refresh_previews",
                interval_seconds=43200,  # 12h
                coro_fn=refresh_expired_previews,
            ),
            _JobDef(
                name="deduplication",
                interval_seconds=21600,  # 6h
                coro_fn=run_deduplication,
            ),
            _JobDef(
                name="discovery_sections",
                interval_seconds=3600,  # 1h
                coro_fn=recompute_discovery_sections,
            ),
            _JobDef(
                name="trending",
                interval_seconds=1800,  # 30m
                coro_fn=recalculate_trending,
            ),
        ]

    async def start(self) -> None:
        """Begin the scheduler loop in a background task."""
        if self._running:
            return

        self._register_jobs()
        self._running = True
        self._started_at = time.time()
        self._task = asyncio.create_task(self._loop())

        logger.info(
            "CatalogSyncScheduler started with %d jobs.",
            len(self._jobs),
        )

    async def stop(self) -> None:
        """Gracefully stop the scheduler loop."""
        self._running = False
        if self._task is not None:
            self._task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._task
            self._task = None
        logger.info("CatalogSyncScheduler stopped.")

    async def run_full_sync(self) -> dict[str, Any]:
        """Manually trigger a one-off run of every job."""
        results: dict[str, Any] = {}
        for job in self._jobs:
            logger.info("Manual sync: %s", job.name)
            try:
                result = await job.coro_fn()
                results[job.name] = result
                job.last_result = result
                job.last_run = time.time()
            except Exception as exc:
                logger.error("Manual sync %s failed: %s", job.name, exc)
                results[job.name] = {"status": "error", "error": str(exc)}
        return results

    async def get_sync_status(self) -> dict[str, Any]:
        """Return the current status of every scheduled job."""
        jobs_status = {}
        for job in self._jobs:
            jobs_status[job.name] = {
                "interval_seconds": job.interval_seconds,
                "last_run_ts": job.last_run if job.last_run else None,
                "last_result": job.last_result,
            }
        return {
            "running": self._running,
            "started_at": self._started_at if self._started_at else None,
            "jobs": jobs_status,
        }

    async def _loop(self) -> None:
        """Background loop that checks each job's due time and runs it."""
        # On first start, run the shorter-interval jobs immediately
        # so the system is usable without waiting hours.
        for job in self._jobs:
            with contextlib.suppress(Exception):
                job.last_result = await job.coro_fn()
                job.last_run = time.time()
                logger.info("Initial run of %s: %s", job.name, job.last_result)

        while self._running:
            now = time.time()
            for job in self._jobs:
                if now - job.last_run >= job.interval_seconds:
                    logger.info("Running scheduled job: %s", job.name)
                    try:
                        job.last_result = await job.coro_fn()
                        job.last_run = now
                    except Exception as exc:
                        logger.error("Job %s failed: %s", job.name, exc)
                        job.last_result = {"status": "error", "error": str(exc)}
                        job.last_run = now

            await asyncio.sleep(60)  # Check every minute
