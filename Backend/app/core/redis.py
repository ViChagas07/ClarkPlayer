"""
ClarkPlayer Redis client module.

Key naming convention (enforced across all services):
  clark:{domain}:{identifier}

  DB 0 — Sessions:
    clark:refresh:{uuid}          → refresh token → user_id
    clark:sleep:{user_id}         → sleep timer Unix timestamp

  DB 1 — Cache:
    clark:cache:artist:{id}       → artist metadata JSON
    clark:cache:album:{id}        → album metadata JSON
    clark:cache:genre_tracks:{slug}:{page}:{size} → paginated track list
    clark:cache:search:{query}:{limit}            → search results
    clark:cache:artwork:{track_id}                → artwork URL/data
    clark:history:{user_id}       → recently played sorted set

  DB 2 — Rate limiting:
    clark:rl:login:{ip}           → sliding window sorted set
    clark:rl:register:{ip}        → sliding window sorted set
    clark:rl:forgot_pw:{ip}       → sliding window sorted set
"""

import redis.asyncio as aioredis
from app.core.config import get_settings

# Redis connection pools for different databases to optimize resource usage and performance.
def _make_pool(db: int, max_connections: int) -> aioredis.ConnectionPool: 
    settings = get_settings()
    url = settings.REDIS_URL.rsplit("/", 1)[0] + f"/{db}"
    return aioredis.ConnectionPool.from_url(
        url,
        max_connections=max_connections,
        decode_responses=True,
    )

# Separate connection pools for sessions, cache, and rate limiting to prevent contention and allow for different performance tuning.
_session_pool = _make_pool(get_settings().REDIS_SESSION_DB, max_connections=20)
_cache_pool = _make_pool(get_settings().REDIS_CACHE_DB, max_connections=20)
_ratelimit_pool = _make_pool(get_settings().REDIS_RATELIMIT_DB, max_connections=10)

# Factory functions to get Redis clients for each purpose, ensuring that the correct connection pool is used and allowing for easy dependency 
# injection in FastAPI routes and services.
async def get_session_redis() -> aioredis.Redis:
    return aioredis.Redis(connection_pool=_session_pool)


async def get_cache_redis() -> aioredis.Redis:
    return aioredis.Redis(connection_pool=_cache_pool)


async def get_ratelimit_redis() -> aioredis.Redis:
    return aioredis.Redis(connection_pool=_ratelimit_pool)