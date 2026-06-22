"""add cover image columns to catalog_genres — idempotent

Revision ID: 0006_genre_cover_columns
Revises: 0005_consent_tracking
Create Date: 2026-06-20

Adds optional cover-image support for genres so the front-end can display
a representative artist photo instead of a gradient swatch.

This migration is **idempotent** — it checks whether each column already
exists before attempting to add it, so it is safe to run even when the
columns were previously applied via raw SQL or a prior partial migration.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0006_genre_cover_columns"
down_revision: Union[str, None] = "0005_consent_tracking"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ── Helpers ─────────────────────────────────────────────────────────────

def _column_exists(table: str, column: str) -> bool:
    """Return True if *column* already exists in *table*."""
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = :t AND column_name = :c"
        ),
        {"t": table, "c": column},
    )
    return result.scalar() is not None


def _add_column_if_missing(
    table: str,
    column: sa.Column,
) -> None:
    """Add *column* to *table* only if it does not already exist."""
    if not _column_exists(table, column.name):
        op.add_column(table, column)


# ── Migration ───────────────────────────────────────────────────────────

def upgrade() -> None:
    _add_column_if_missing(
        "catalog_genres",
        sa.Column("cover_image_url", sa.String(1000), nullable=True),
    )

    if not _column_exists("catalog_genres", "cover_artist_id"):
        op.add_column(
            "catalog_genres",
            sa.Column("cover_artist_id", postgresql.UUID(as_uuid=True), nullable=True),
        )
        op.create_foreign_key(
            "catalog_genres_cover_artist_id_fkey",
            "catalog_genres",
            "catalog_artists",
            ["cover_artist_id"],
            ["id"],
            ondelete="SET NULL",
        )

    _add_column_if_missing(
        "catalog_genres",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("catalog_genres", "updated_at")
    op.drop_constraint(
        "catalog_genres_cover_artist_id_fkey",
        "catalog_genres",
        type_="foreignkey",
    )
    op.drop_column("catalog_genres", "cover_artist_id")
    op.drop_column("catalog_genres", "cover_image_url")
