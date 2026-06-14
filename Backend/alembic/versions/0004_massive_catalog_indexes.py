"""massive catalog performance indexes

Revision ID: 0004_massive_indexes
Revises: 0003_catalog_indexes
Create Date: 2026-06-14

Adds composite, partial unique, and full-text indexes for
massive catalog queries (5000+ artists, 50000+ tracks).
"""

from typing import Sequence, Union

from alembic import op


revision: str = "0004_massive_indexes"
down_revision: Union[str, None] = "0003_catalog_indexes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Composite indexes for common queries ────────────────────────

    # Tracks by artist_id + popularity (pagination)
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_tracks_artist_pop_desc "
        "ON catalog_tracks (artist_id, popularity DESC)"
    )

    # Albums by artist_id + title (pagination)
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_albums_artist_title "
        "ON catalog_albums (artist_id, title)"
    )

    # Tracks filtered by preview_url
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_tracks_preview_notnull "
        "ON catalog_tracks (popularity DESC) WHERE preview_url IS NOT NULL"
    )

    # ── Partial unique indexes for deduplication ────────────────────

    # Unique Spotify ID (partial — only non-null values)
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_artists_spotify_id "
        "ON catalog_artists (external_spotify_id) "
        "WHERE external_spotify_id IS NOT NULL"
    )

    # Unique iTunes artist ID
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_artists_itunes_id "
        "ON catalog_artists (external_itunes_id) "
        "WHERE external_itunes_id IS NOT NULL"
    )

    # Unique Preview URL (partial — one URL per track)
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_tracks_preview_url "
        "ON catalog_tracks (preview_url) "
        "WHERE preview_url IS NOT NULL"
    )

    # ── Full-text search indexes ────────────────────────────────────

    # GIN trigram indexes for fuzzy search
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_tracks_title_gin "
        "ON catalog_tracks USING gin (title gin_trgm_ops)"
    )

    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_artists_name_gin "
        "ON catalog_artists USING gin (name gin_trgm_ops)"
    )

    # ── Genre lookup indexes ────────────────────────────────────────

    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_artist_genres_artist "
        "ON catalog_artist_genres (artist_id)"
    )

    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_artist_genres_genre "
        "ON catalog_artist_genres (genre_id)"
    )

    # ── Cover URL partial index for album lookups ───────────────────

    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_catalog_albums_cover_notnull "
        "ON catalog_albums (artist_id) WHERE cover_url IS NOT NULL"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_catalog_albums_cover_notnull")
    op.execute("DROP INDEX IF EXISTS idx_catalog_artist_genres_genre")
    op.execute("DROP INDEX IF EXISTS idx_catalog_artist_genres_artist")
    op.execute("DROP INDEX IF EXISTS idx_catalog_artists_name_gin")
    op.execute("DROP INDEX IF EXISTS idx_catalog_tracks_title_gin")
    op.execute("DROP INDEX IF EXISTS uq_catalog_tracks_preview_url")
    op.execute("DROP INDEX IF EXISTS uq_catalog_artists_itunes_id")
    op.execute("DROP INDEX IF EXISTS uq_catalog_artists_spotify_id")
    op.execute("DROP INDEX IF EXISTS idx_catalog_tracks_preview_notnull")
    op.execute("DROP INDEX IF EXISTS idx_catalog_albums_artist_title")
    op.execute("DROP INDEX IF EXISTS idx_catalog_tracks_artist_pop_desc")
