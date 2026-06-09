"""
TTL STRATEGY:
  artwork          → 3600s (1h):  Binary/URL, never changes after set
  artist / album   → 300s  (5m):  Low mutation rate
  genre_tracks     → 120s  (2m):  Changes when files are added/removed
  search           → 60s   (1m):  User expects fresh results
"""

import json
import functools
from typing import Callable, Any
from app.core.redis import get_cache_redis

# Decorator for caching the results of async functions in Redis. The cache key is constructed from a prefix and the function's arguments, and 
# the result is stored as JSON with a specified TTL. On subsequent calls with the same arguments, the cached result will be returned if it
# exists and hasn't expired.

def cached(key_prefix: str, ttl_seconds: int):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            redis = await get_cache_redis()
            parts = [key_prefix] + [str(a) for a in args] + [f"{k}={v}" for k, v in kwargs.items()]
            cache_key = "clark:cache:" + ":".join(parts)

            hit = await redis.get(cache_key)
            if hit:
                return json.loads(hit)

            result = await func(*args, **kwargs)
            await redis.setex(cache_key, ttl_seconds, json.dumps(result))
            return result
        return wrapper
    return decorator


#This one serves as a helper function to invalidate cache entries when underlying data changes. It constructs the cache key in the same way as
# the decorator and deletes the corresponding entry from Redis, ensuring that stale data isn't served after updates. This is important for 
# maintaining data consistency, especially for endpoints with a short TTL (i.e. search results) or high mutation rate (e.g. genre tracks,
# search results).
async def invalidate_cache(key_prefix: str, *args) -> None:
    redis = await get_cache_redis()
    parts = [key_prefix] + [str(a) for a in args]
    await redis.delete("clark:cache:" + ":".join(parts))