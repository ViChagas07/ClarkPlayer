"""
Concrete SQLAlchemy implementation of :class:`IUserRepository`.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.interfaces.repositories import IUserRepository
from app.domain.entities import User
from app.infrastructure.models.user import UserModel
from app.infrastructure.repositories.base import user_to_entity, user_to_model


class UserRepository(IUserRepository):
    """SQLAlchemy-backed user persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        return user_to_entity(model) if model else None

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.email == email)
        )
        model = result.scalar_one_or_none()
        return user_to_entity(model) if model else None

    async def get_by_username(self, username: str) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.username == username)
        )
        model = result.scalar_one_or_none()
        return user_to_entity(model) if model else None

    async def get_by_provider(self, provider: str, provider_id: str) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(
                UserModel.provider == provider,
                UserModel.provider_id == provider_id,
            )
        )
        model = result.scalar_one_or_none()
        return user_to_entity(model) if model else None

    async def create(self, user: User) -> User:
        model = user_to_model(user)
        self._session.add(model)
        await self._session.flush()
        return user_to_entity(model)

    async def update(self, user: User) -> User:
        model = await self._session.get(UserModel, user.id)
        if model is None:
            return await self.create(user)

        for field, value in user_to_model(user).__dict__.items():
            if not field.startswith("_") and field not in ("id", "created_at"):
                setattr(model, field, value)

        await self._session.flush()
        return user_to_entity(model)

    async def delete(self, user_id: UUID) -> None:
        model = await self._session.get(UserModel, user_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.flush()
