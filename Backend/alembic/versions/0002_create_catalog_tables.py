"""create catalog tables

Revision ID: 0002_catalog_tables
Revises: 0001_oauth_provider
Create Date: 2026-06-13

Creates the local music catalog tables:

- catalog_artists       — music artists with external IDs and metadata
- catalog_albums        — albums linked to artists
- catalog_tracks        — tracks linked to artists and optionally albums
- catalog_genres        — genre taxonomy with gradient theming
- catalog_artist_genres — many-to-many junction: artists ↔ genres
- catalog_track_previews — preview audio URLs for tracks
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0002_catalog_tables"
down_revision: Union[str, None] = "0001_oauth_provider"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. catalog_artists ──────────────────────────────────────────────
    op.create_table(
        "catalog_artists",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.func.gen_random_uuid(),
        ),
        sa.Column("name", sa.String(500), nullable=False, unique=True),
        sa.Column("bio", sa.Text()),
        sa.Column("image_url", sa.String(1000)),
        sa.Column("external_mb_id", sa.String(100), index=True),
        sa.Column("external_spotify_id", sa.String(100), index=True),
        sa.Column("external_itunes_id", sa.String(100)),
        sa.Column("external_lastfm_url", sa.String(1000)),
        sa.Column(
            "popularity",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
            index=True,
        ),
        sa.Column("country", sa.String(10)),
        sa.Column(
            "is_brazilian",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ── 2. catalog_albums ───────────────────────────────────────────────
    op.create_table(
        "catalog_albums",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.func.gen_random_uuid(),
        ),
        sa.Column("title", sa.String(500), nullable=False, index=True),
        sa.Column(
            "artist_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("catalog_artists.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("cover_url", sa.String(1000)),
        sa.Column("release_date", sa.String(50)),
        sa.Column("country", sa.String(10)),
        sa.Column(
            "track_count",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column("external_mb_id", sa.String(100), index=True),
        sa.Column("external_spotify_id", sa.String(100), index=True),
        sa.Column("external_itunes_id", sa.String(100)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "title", "artist_id", name="uq_catalog_albums_title_artist_id"
        ),
    )

    # ── 3. catalog_tracks ───────────────────────────────────────────────
    op.create_table(
        "catalog_tracks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.func.gen_random_uuid(),
        ),
        sa.Column("title", sa.String(500), nullable=False, index=True),
        sa.Column(
            "artist_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("catalog_artists.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "album_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("catalog_albums.id", ondelete="SET NULL"),
            nullable=True,
            index=True,
        ),
        sa.Column("duration_ms", sa.Integer()),
        sa.Column("track_number", sa.Integer()),
        sa.Column("disc_number", sa.Integer()),
        sa.Column("preview_url", sa.String(1000)),
        sa.Column("isrc", sa.String(20), unique=True, index=True),
        sa.Column("external_mb_id", sa.String(100), index=True),
        sa.Column("external_spotify_id", sa.String(100), index=True),
        sa.Column("external_itunes_id", sa.String(100)),
        sa.Column(
            "explicit",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "popularity",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
            index=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "title", "artist_id", name="uq_catalog_tracks_title_artist_id"
        ),
    )

    # ── 4. catalog_genres ───────────────────────────────────────────────
    op.create_table(
        "catalog_genres",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.func.gen_random_uuid(),
        ),
        sa.Column("name", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column(
            "gradient_from",
            sa.String(7),
            nullable=False,
            server_default=sa.text("'#1a1a2e'"),
        ),
        sa.Column(
            "gradient_to",
            sa.String(7),
            nullable=False,
            server_default=sa.text("'#16213e'"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ── 5. catalog_artist_genres (junction) ─────────────────────────────
    op.create_table(
        "catalog_artist_genres",
        sa.Column(
            "artist_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("catalog_artists.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "genre_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("catalog_genres.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )

    # ── 6. catalog_track_previews ───────────────────────────────────────
    op.create_table(
        "catalog_track_previews",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.func.gen_random_uuid(),
        ),
        sa.Column(
            "track_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("catalog_tracks.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("url", sa.String(1000), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True)),
        sa.Column(
            "fetched_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("catalog_track_previews")
    op.drop_table("catalog_artist_genres")
    op.drop_table("catalog_genres")
    op.drop_table("catalog_tracks")
    op.drop_table("catalog_albums")
    op.drop_table("catalog_artists")
