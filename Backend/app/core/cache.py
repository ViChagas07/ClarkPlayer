"""
TTL STRATEGY:
  artwork          → 3600s (1h):  Binary/URL, never changes after set
  artist / album   → 300s  (5m):  Low mutation rate
  genre_tracks     → 120s  (2m):  Changes when files are added/removed
  search           → 60s   (1m):  User expects fresh results
"""

import functools
import json
from collections.abc import Awaitable, Callable
from typing import Any, ParamSpec, TypeVar

from app.core.redis import get_cache_redis

P = ParamSpec("P")
R = TypeVar("R")


def cached(key_prefix: str, ttl_seconds: int) -> Callable[[Callable[P, Awaitable[R]]], Callable[P, Awaitable[R]]]:
    def decorator(func: Callable[P, Awaitable[R]]) -> Callable[P, Awaitable[R]]:
        @functools.wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            redis = await get_cache_redis()
            parts = [key_prefix] + [str(a) for a in args] + [f"{k}={v}" for k, v in kwargs.items()]
            cache_key = "clark:cache:" + ":".join(parts)

            hit = await redis.get(cache_key)
            if hit:
                return json.loads(hit)  # type: ignore[no-any-return]

            result = await func(*args, **kwargs)
            await redis.setex(cache_key, ttl_seconds, json.dumps(result))
            return result
        return wrapper
    return decorator


async def invalidate_cache(key_prefix: str, *args: Any) -> None:
    redis = await get_cache_redis()
    parts = [key_prefix] + [str(a) for a in args]
    await redis.delete("clark:cache:" + ":".join(parts))
