"""
FastAPI dependency-injection helpers.

Every dependency is a callable that can be used with ``Depends()``,
making routes thin and keeping business logic out of the presentation layer.
"""

from collections.abc import AsyncGenerator
from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import CredentialsError, TokenInvalidError
from app.core.security import decode_access_token
from app.infrastructure.database import get_async_session
from app.infrastructure.repositories.user_repository import UserRepository


# Database session 

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]

# Current user 

async def get_current_user_id(
    authorization: Annotated[str, Header(alias="Authorization")],
    session: SessionDep,
) -> UUID:
    """
    Extract and validate the Bearer token from the ``Authorization`` header,
    then return the authenticated user's UUID.

    Raises :class:`CredentialsError` if the token is missing, malformed,
    expired, or belongs to a non-existent user.
    """
    if not authorization:
        raise CredentialsError("Missing authorization header.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise CredentialsError("Invalid authorization header format. Use 'Bearer <token>'.")

    try:
        claims = decode_access_token(token)
    except TokenInvalidError:
        raise
    except Exception as exc:
        raise TokenInvalidError(str(exc)) from exc

    user_id_str: str | None = claims.get("sub")
    if not user_id_str:
        raise TokenInvalidError("Token missing subject claim.")

    user_id = UUID(user_id_str)
    repo = UserRepository(session)
    user = await repo.get_by_id(user_id)
    if user is None:
        raise CredentialsError("User associated with this token no longer exists.")
    if not user.is_active:
        raise CredentialsError("Account is deactivated.")

    return user_id


CurrentUserId = Annotated[UUID, Depends(get_current_user_id)]
