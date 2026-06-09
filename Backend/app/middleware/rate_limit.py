import time
from fastapi import Request, HTTPException, status
from app.core.redis import get_ratelimit_redis


async def sliding_window_rate_limit(
    request: Request,
    key_prefix: str,
    max_requests: int,
    window_seconds: int,
) -> None:
    redis = await get_ratelimit_redis()
    ip = request.client.host
    key = f"clark:rl:{key_prefix}:{ip}"
    now = time.time()

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, now - window_seconds)  # remove expired entries
    pipe.zcard(key)                                       # count remaining
    pipe.zadd(key, {str(now): now})                       # record this request
    pipe.expire(key, window_seconds)                      # auto-cleanup
    results = await pipe.execute()

    if results[1] >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Limit: {max_requests} per {window_seconds}s.",
            headers={"Retry-After": str(window_seconds)},
        )