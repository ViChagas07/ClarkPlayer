"""
Declarative base for all SQLAlchemy ORM models.

Imports every model so Alembic can discover them for auto-generation.
"""

from app.infrastructure.models.base import Base
from app.infrastructure.models.playlist import PlaylistModel, PlaylistTrackModel  # noqa: F401
from app.infrastructure.models.token_blacklist import TokenBlacklistModel  # noqa: F401
from app.infrastructure.models.track import TrackModel  # noqa: F401
from app.infrastructure.models.user import UserModel  # noqa: F401

__all__ = ["Base"]
