"""
SQLAlchemy async engine and session factory.

Creates a single async engine bound to the PostgreSQL database and exposes
a generator-based dependency that yields async sessions with proper
lifecycle management.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

_settings = get_settings()

_engine = create_async_engine(
    _settings.DATABASE_URL,
    echo=_settings.DATABASE_ECHO,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True, # Ensure connections are alive before using them
)

_async_session_factory = async_sessionmaker(
    _engine,
    class_=AsyncSession,
    expire_on_commit=False, # Don't expire objects (e.g. user, token) after commit, so they can be returned in the response
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an :class:`AsyncSession` and close it when the request ends."""
    async with _async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
