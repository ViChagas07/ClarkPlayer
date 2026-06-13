"""
Metrics middleware — automatically records API response times.

Must be added as the **last** middleware so it wraps all other
middleware and records the full request lifecycle.
"""

from __future__ import annotations

import time
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.metrics import MetricsService


_metrics = MetricsService()


def get_metrics_service() -> MetricsService:
    """Return the singleton metrics service instance."""
    return _metrics


class MetricsMiddleware(BaseHTTPMiddleware):
    """
    Records request count, duration, and HTTP status for every API call.

    Does NOT record requests to static files or health checks to keep
    the signal clean.
    """

    SKIP_PREFIXES: tuple[str, ...] = (
        "/media/",
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/metrics",
    )

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        path = request.url.path

        # Short-circuit static / health / docs / metrics to avoid noise
        if any(path.startswith(prefix) for prefix in self.SKIP_PREFIXES):
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        # Use route path template if available, otherwise raw path
        route_path = (
            request.scope.get("route", {}).get("path") if request.scope.get("route") else None
        )
        endpoint = route_path or path

        await _metrics.record_api_call(endpoint, elapsed_ms, response.status_code)
        return response
