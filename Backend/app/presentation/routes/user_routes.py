"""
User-profile management routes.
"""

from fastapi import APIRouter, status

from app.application.services.user_service import UserService
from app.core.dependencies import CurrentUserId, SessionDep
from app.infrastructure.repositories.user_repository import UserRepository
from app.presentation.schemas.auth import UserResponse
from app.presentation.schemas.user import (
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


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    user_id: CurrentUserId,
    session: SessionDep,
) -> None:
    """Permanently delete the authenticated user's account and all data."""
    service = UserService(UserRepository(session))
    await service.delete_account(user_id)
