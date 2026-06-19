"""add genre cover columns to catalog_genres

Revision ID: 0006_genre_cover_columns
Revises: 0005_consent_tracking
Create Date: 2026-06-19

Adds columns needed by GenreCoverPrecomputation:
- cover_image_url   : URL of the most popular artist's image for this genre
- cover_artist_id   : FK to the most popular artist in this genre
- updated_at        : timestamp tracking last genre metadata update
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0006_genre_cover_columns"
down_revision: Union[str, None] = "0005_consent_tracking"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "catalog_genres",
        sa.Column("cover_image_url", sa.String(1000), nullable=True),
    )
    op.add_column(
        "catalog_genres",
        sa.Column(
            "cover_artist_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("catalog_artists.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_catalog_genres_cover_artist_id",
        "catalog_genres",
        ["cover_artist_id"],
    )
    op.add_column(
        "catalog_genres",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("catalog_genres", "updated_at")
    op.drop_index("ix_catalog_genres_cover_artist_id")
    op.drop_column("catalog_genres", "cover_artist_id")
    op.drop_column("catalog_genres", "cover_image_url")
