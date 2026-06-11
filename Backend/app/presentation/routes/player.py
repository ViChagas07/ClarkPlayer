"""
Player routes — sleep timer and recently-played history.

Sleep timer is stored in Redis DB 0 with an auto-expiring TTL equal to the
remaining duration. If Redis restarts, an already-expired timer disappears naturally.

Recently played uses a Redis Sorted Set where score = Unix timestamp.
"""

from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.application.services.history_service import (
    clear_history,
    get_recently_played,
    record_play,
)
from app.core.dependencies import CurrentUserId, SessionDep
from app.core.redis import get_session_redis
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
    key = f"{SLEEP_KEY_PREFIX}{user_id}"
    await redis.setex(key, ttl_seconds, str(body.expires_at))

    return SleepTimerResponse(expires_at=body.expires_at)


@router.get("/sleep-timer", response_model=SleepTimerResponse)
async def get_sleep_timer(
    user_id: CurrentUserId,
) -> SleepTimerResponse:
    """Return the current sleep timer if set and not yet expired."""
    redis = await get_session_redis()
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
    """
    track_ids = await get_recently_played(str(user_id), limit)

    if not track_ids:
        return RecentlyPlayedResponse(track_ids=[], tracks=[])

    # Resolve full track objects from DB
    track_repo = TrackRepository(session)
    tracks = []
    for track_id in track_ids:
        try:
            track = await track_repo.get_by_id(UUID(track_id))
            if track:
                tracks.append(TrackResponse(
                    id=str(track.id),
                    title=track.title,
                    artist=track.artist,
                    album=track.album,
                    duration=track.duration,
                ))
        except Exception:
            pass

    return RecentlyPlayedResponse(track_ids=track_ids, tracks=tracks)


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    user_id: CurrentUserId,
) -> None:
    """Clear the user's recently-played history."""
    await clear_history(str(user_id))
