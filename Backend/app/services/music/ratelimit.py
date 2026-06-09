"""
Rate limiter for external music APIs.

- MusicBrainz: max 1 req/s
- Last.fm: max 5 req/s

Uses Redis sorted sets for sliding window rate limiting.
"""

import asyncio
import time

logger = __import__("logging").getLogger("ratelimit")

_RATE_LIMITS: dict[str, tuple[int, float]] = {
    "musicbrainz": (1, 1.5),   # 1 request per second, with 1.5s inter-request
    "lastfm": (5, 0.25),       # 5 requests per second, ~0.25s inter-request
}

# Simple token-bucket implementation using in-memory state
# (avoids Redis roundtrips for rate limiting on a single server)
_buckets: dict[str, tuple[float, float, int]] = {}


async def rate_limited(source: str) -> None:
    """
    Ensure we don't exceed rate limits for the given API source.

    Uses a simple local token bucket. For production multi-worker,
    replace with Redis-based sliding window.
    """
    limits = _RATE_LIMITS.get(source)
    if not limits:
        return  # No limits for this source

    max_per_second, min_interval = limits
    now = time.monotonic()

    if source not in _buckets:
        _buckets[source] = (now, max_per_second, max_per_second)

    last_refill, tokens, _max_tokens = _buckets[source]

    # Refill tokens
    elapsed = now - last_refill
    new_tokens = min(_max_tokens, tokens + elapsed * max_per_second)
    refill_time = now
    if new_tokens >= 1.0:
        _buckets[source] = (refill_time, new_tokens - 1.0, _max_tokens)
        return

    # Need to wait
    wait_time = (1.0 - new_tokens) / max_per_second
    wait_time = max(wait_time, min_interval * 0.5)
    await asyncio.sleep(wait_time)
    # After waiting, reset bucket
    _buckets[source] = (time.monotonic(), _max_tokens - 1.0, _max_tokens)
