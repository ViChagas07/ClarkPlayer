"""add catalog performance indexes

Revision ID: 0003_catalog_indexes
Revises: 0002_catalog_tables
Create Date: 2026-06-13

Adds trigram indexes for fuzzy search and performance indexes for
sorting, filtering, and selective lookups on catalog tables.
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "0003_catalog_indexes"
down_revision: Union[str, None] = "0002_catalog_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable the pg_trgm extension (idempotent)
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # Trigram indexes for fuzzy / LIKE / ILIKE search
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_artists_name_trgm "
        "ON catalog_artists USING gin (name gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_tracks_title_trgm "
        "ON catalog_tracks USING gin (title gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_albums_title_trgm "
        "ON catalog_albums USING gin (title gin_trgm_ops)"
    )

    # Sort-optimised indexes (DESC for popularity-ranked queries)
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_tracks_popularity_desc "
        "ON catalog_tracks (popularity DESC)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_artists_popularity_desc "
        "ON catalog_artists (popularity DESC)"
    )

    # Partial index — only tracks that have a preview URL
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_tracks_preview_url "
        "ON catalog_tracks (preview_url) WHERE preview_url IS NOT NULL"
    )

    # Composite index for queries that filter by artist and sort by popularity
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_tracks_artist_popularity "
        "ON catalog_tracks (artist_id, popularity DESC)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_catalog_tracks_artist_popularity")
    op.execute("DROP INDEX IF EXISTS idx_catalog_tracks_preview_url")
    op.execute("DROP INDEX IF EXISTS idx_catalog_artists_popularity_desc")
    op.execute("DROP INDEX IF EXISTS idx_catalog_tracks_popularity_desc")
    op.execute("DROP INDEX IF EXISTS idx_catalog_albums_title_trgm")
    op.execute("DROP INDEX IF EXISTS idx_catalog_tracks_title_trgm")
    op.execute("DROP INDEX IF EXISTS idx_catalog_artists_name_trgm")
