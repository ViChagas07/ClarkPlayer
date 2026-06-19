"""
Player routes — sleep timer and recently-played history.

Sleep timer is stored in Redis DB 0 with an auto-expiring TTL equal to the
remaining duration. If Redis restarts, an already-expired timer disappears naturally.

Recently played uses a Redis Sorted Set where score = Unix timestamp.
"""

from datetime import UTC, datetime
import json
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.application.services.history_service import (
    clear_history,
    get_recently_played,
    record_play,
)
from app.core.dependencies import CurrentUserId, SessionDep
from app.core.redis import get_cache_redis, get_session_redis
from app.infrastructure.repositories.track_repository import TrackRepository

router = APIRouter(prefix="/player", tags=["Player"])

SLEEP_KEY_PREFIX = "clark:sleep:"


# ── Request / Response models ────────────────────────────────────────────────

class SleepTimerRequest(BaseModel):
    expires_at: int  # Unix timestamp (ms)


class SleepTimerResponse(BaseModel):
    expires_at: int | None


class TrackResponse(BaseModel):
    id: str
    title: str
    artist: str | None = None
    album: str | None = None
    duration: float | None = None


class RecentlyPlayedResponse(BaseModel):
    track_ids: list[str]
    tracks: list[TrackResponse] | None = None


# ── Sleep Timer endpoints ────────────────────────────────────────────────────

@router.post("/sleep-timer", response_model=SleepTimerResponse)
async def set_sleep_timer(
    body: SleepTimerRequest,
    user_id: CurrentUserId,
) -> SleepTimerResponse:
    """
    Set a sleep timer. The timer auto-expires in Redis — no background worker needed.
    Body: { "expires_at": <Unix timestamp in ms> }
    """

    now_ms = int(datetime.now(UTC).timestamp() * 1000)
    if body.expires_at <= now_ms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="expires_at must be in the future",
        )

    ttl_seconds = (body.expires_at - now_ms) // 1000
    redis = await get_session_redis()
    if redis is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sleep timer requires Redis (not configured).",
        )
    key = f"{SLEEP_KEY_PREFIX}{user_id}"
    await redis.setex(key, ttl_seconds, str(body.expires_at))

    return SleepTimerResponse(expires_at=body.expires_at)


@router.get("/sleep-timer", response_model=SleepTimerResponse)
async def get_sleep_timer(
    user_id: CurrentUserId,
) -> SleepTimerResponse:
    """Return the current sleep timer if set and not yet expired."""
    redis = await get_session_redis()
    if redis is None:
        return SleepTimerResponse(expires_at=None)
    key = f"{SLEEP_KEY_PREFIX}{user_id}"
    value = await redis.get(key)

    if value is None:
        return SleepTimerResponse(expires_at=None)

    expires_at = int(value)
    now_ms = int(datetime.now(UTC).timestamp() * 1000)
    if expires_at <= now_ms:
        # Already expired, clean up
        await redis.delete(key)
        return SleepTimerResponse(expires_at=None)

    return SleepTimerResponse(expires_at=expires_at)


@router.delete("/sleep-timer", response_model=SleepTimerResponse)
async def delete_sleep_timer(
    user_id: CurrentUserId,
) -> SleepTimerResponse:
    """Cancel the sleep timer."""
    redis = await get_session_redis()
    if redis is not None:
        key = f"{SLEEP_KEY_PREFIX}{user_id}"
        await redis.delete(key)
    return SleepTimerResponse(expires_at=None)


# ── Recently Played endpoints ─────────────────────────────────────────────────

@router.post("/played/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
async def report_played(
    track_id: UUID,
    user_id: CurrentUserId,
) -> None:
    """Record that a track was played (adds to recently-played history)."""
    await record_play(str(user_id), str(track_id))


@router.get("/recently-played", response_model=RecentlyPlayedResponse)
async def get_recently_played_tracks(
    user_id: CurrentUserId,
    session: SessionDep,
    limit: int = 20,
) -> RecentlyPlayedResponse:
    """
    Fetch recently played track IDs and resolve them to full track objects.
    Results are cached in Redis for 60 seconds.
    """
    cache_key = f"clark:cache:recently_played:{user_id}:{limit}"
    cache_redis = await get_cache_redis()
    if cache_redis is not None:
        cached = await cache_redis.get(cache_key)
        if cached:
            data = json.loads(cached)
            return RecentlyPlayedResponse(**data)

    track_ids = await get_recently_played(str(user_id), limit)

    if not track_ids:
        return RecentlyPlayedResponse(track_ids=[], tracks=[])

    # Batch-resolve full track objects — single IN query instead of N queries
    from sqlalchemy import select as _select
    from app.infrastructure.models.track import TrackModel

    track_repo = TrackRepository(session)
    result = await session.execute(
        _select(TrackModel).where(TrackModel.id.in_([UUID(t) for t in track_ids]))
    )
    models_by_id = {m.id: m for m in result.scalars().all()}

    tracks = []
    for track_id in track_ids:
        model = models_by_id.get(UUID(track_id))
        if model:
            tracks.append(TrackResponse(
                id=str(model.id),
                title=model.title,
                artist=model.artist,
                album=model.album,
                duration=model.duration,
            ))

    response = RecentlyPlayedResponse(track_ids=track_ids, tracks=tracks)
    if cache_redis is not None:
        await cache_redis.setex(cache_key, 60, response.model_dump_json())
    return response


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    user_id: CurrentUserId,
) -> None:
    """Clear the user's recently-played history."""
    await clear_history(str(user_id))
