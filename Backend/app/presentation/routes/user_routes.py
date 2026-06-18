"""
User-profile management routes.
"""

from pathlib import Path

from fastapi import APIRouter, UploadFile, status

from app.application.services.user_service import UserService
from app.core.config import get_settings
from app.core.dependencies import CurrentUserId, SessionDep
from app.infrastructure.repositories.user_repository import UserRepository
from app.presentation.schemas.auth import UserResponse
from app.presentation.schemas.user import (
    AvatarUploadResponse,
    ChangePasswordRequest,
    UpdateProfileRequest,
)

router = APIRouter(prefix="/users", tags=["Users"])


def _user_service(session: SessionDep) -> UserService:
    return UserService(UserRepository(session))


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    user_id: CurrentUserId,
    session: SessionDep,
) -> UserResponse:
    """Return the authenticated user's profile details."""
    service = UserService(UserRepository(session))
    user = await service.get_by_id(user_id)
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
    )


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    body: UpdateProfileRequest,
    user_id: CurrentUserId,
    session: SessionDep,
) -> UserResponse:
    """Update display name and/or avatar."""
    service = UserService(UserRepository(session))
    user = await service.update_profile(
        user_id,
        display_name=body.display_name,
        avatar_url=body.avatar_url,
    )
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
    )


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: ChangePasswordRequest,
    user_id: CurrentUserId,
    session: SessionDep,
) -> None:
    """Change the authenticated user's password."""
    service = UserService(UserRepository(session))
    await service.change_password(user_id, body.current_password, body.new_password)


@router.post("/me/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: UploadFile,
    user_id: CurrentUserId,
    session: SessionDep,
) -> AvatarUploadResponse:
    """Upload a new avatar image for the authenticated user."""
    settings = get_settings()

    # Validate extension
    if file.filename is None:
        raise ValueError("No filename provided.")
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise ValueError(
            f"Unsupported image format. Allowed: {', '.join(sorted(settings.ALLOWED_IMAGE_EXTENSIONS))}"
        )

    # Validate size (read into memory, limit by configured max)
    contents = await file.read()
    max_bytes = settings.MAX_AVATAR_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise ValueError(f"Avatar must be under {settings.MAX_AVATAR_SIZE_MB} MB.")

    # Save to media/avatars/<user_id><ext> (async I/O via aiofiles)
    import aiofiles
    avatars_dir = settings.MEDIA_ROOT / "avatars"
    avatars_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{user_id}{ext}"
    filepath = avatars_dir / filename
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(contents)

    # Build URL path
    avatar_url = f"/media/avatars/{filename}"

    # Update user's avatar_url in the database
    service = UserService(UserRepository(session))
    await service.update_profile(user_id, avatar_url=avatar_url)

    return AvatarUploadResponse(avatar_url=avatar_url)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    user_id: CurrentUserId,
    session: SessionDep,
) -> None:
    """Permanently delete the authenticated user's account and all data."""
    service = UserService(UserRepository(session))
    await service.delete_account(user_id)


@router.get("/me/export")
async def export_my_data(
    user_id: CurrentUserId,
    session: SessionDep,
) -> JSONResponse:
    """Export all user data in JSON format (LGPD right to portability)."""
    from app.infrastructure.models.user import UserModel
    from app.infrastructure.models.track import TrackModel
    from app.infrastructure.models.playlist import PlaylistModel
    from app.infrastructure.repositories.track_repository import TrackRepository
    from app.infrastructure.repositories.playlist_repository import PlaylistRepository

    repo = UserRepository(session)
    user = await repo.get_by_id(user_id)
    if not user:
        return JSONResponse(status_code=404, content={"error": "User not found"})

    # ── Gather all user data ──
    tracks = await session.execute(
        select(TrackModel).where(TrackModel.user_id == user_id)
    )
    user_tracks = [{"title": t.title, "artist": t.artist, "album": t.album, "format": t.file_format.value if t.file_format else None} for t in tracks.scalars().all()]

    playlists = await session.execute(
        select(PlaylistModel).where(PlaylistModel.user_id == user_id)
    )
    user_playlists = [{"name": p.name, "visibility": p.visibility.value if p.visibility else None} for p in playlists.scalars().all()]

    export_data = {
        "exported_at": str(user_id),
        "profile": {
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "provider": user.provider,
        },
        "tracks": user_tracks,
        "playlists": user_playlists,
    }

    return JSONResponse(content=export_data, headers={
        "Content-Disposition": "attachment; filename=clarkplayer-export.json"
    })
