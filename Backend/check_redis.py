"""Check Redis connectivity."""
import asyncio
import sys
sys.path.insert(0, "D:\\ClarkPlayer\\Backend")

async def main():
    from app.core.config import get_settings
    s = get_settings()
    print(f"Redis URL: {s.REDIS_URL}")
    print(f"Redis cache DB: {s.REDIS_CACHE_DB}")
    
    try:
        from app.core.redis import get_cache_redis
        redis = await get_cache_redis()
        result = await redis.ping()
        print(f"Redis PING: {result}")
        print("Redis: CONNECTED")
    except Exception as e:
        print(f"Redis: DOWN — {type(e).__name__}: {e}")

asyncio.run(main())
