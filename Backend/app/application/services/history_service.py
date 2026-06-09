import time
from app.core.redis import get_cache_redis

HISTORY_KEY_PREFIX = "clark:history:"
MAX_HISTORY_SIZE = 50


async def record_play(user_id: str, track_id: str) -> None:
    redis = await get_cache_redis()
    key = f"{HISTORY_KEY_PREFIX}{user_id}"
    await redis.zadd(key, {track_id: time.time()})
    await redis.zremrangebyrank(key, 0, -(MAX_HISTORY_SIZE + 1))
    await redis.expire(key, 60 * 60 * 24 * 90)  # 90-day TTL


async def get_recently_played(user_id: str, limit: int = 20) -> list[str]:
    """Returns track_ids ordered most-recent first."""
    redis = await get_cache_redis()
    return await redis.zrevrange(f"{HISTORY_KEY_PREFIX}{user_id}", 0, limit - 1)


async def clear_history(user_id: str) -> None:
    redis = await get_cache_redis()
    await redis.delete(f"{HISTORY_KEY_PREFIX}{user_id}")