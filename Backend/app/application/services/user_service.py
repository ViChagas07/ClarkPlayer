"""
User-profile service — read / update account details.
"""

from uuid import UUID

from app.application.interfaces.repositories import IUserRepository
from app.core.exceptions import ConflictError, NotFoundError
from app.domain.entities import User


class UserService:
    def __init__(self, user_repo: IUserRepository) -> None:
        self._user_repo = user_repo

    async def get_by_id(self, user_id: UUID) -> User:
        user = await self._user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found.")
        return user

    async def update_profile(
        self,
        user_id: UUID,
        *,
        display_name: str | None = None,
        avatar_url: str | None = None,
    ) -> User:
        user = await self.get_by_id(user_id)
        if display_name is not None:
            user = User(
                id=user.id,
                username=user.username,
                email=user.email,
                hashed_password=user.hashed_password,
                display_name=display_name,
                avatar_url=user.avatar_url,
                is_active=user.is_active,
                created_at=user.created_at,
            )
        if avatar_url is not None:
            user = User(
                id=user.id,
                username=user.username,
                email=user.email,
                hashed_password=user.hashed_password,
                display_name=user.display_name,
                avatar_url=avatar_url,
                is_active=user.is_active,
                created_at=user.created_at,
            )
        return await self._user_repo.update(user)

    async def change_password(
        self, user_id: UUID, current_password: str, new_password: str
    ) -> None:
        from app.core.security import hash_password, verify_password

        user = await self.get_by_id(user_id)
        if not verify_password(current_password, user.hashed_password):
            raise ConflictError("Current password is incorrect.")

        user = User(
            id=user.id,
            username=user.username,
            email=user.email,
            hashed_password=hash_password(new_password),
            display_name=user.display_name,
        )
        await self._user_repo.update(user)

    async def delete_account(self, user_id: UUID) -> None:
        await self._user_repo.delete(user_id)
