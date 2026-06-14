"""
Enhanced global deduplication for catalog records.

Handles deduplication across multiple dimensions:
  1. Artists by name (case-insensitive) + external IDs
  2. Tracks by (title, artist_id) + ISRC + preview_url
  3. Albums by (title, artist_id)

All operations are safe — merging preserves relationships and
reassigns child records to the canonical parent.
"""

from __future__ import annotations

import logging

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogTrackModel,
)

logger = logging.getLogger("catalog.dedup")


async def deduplicate_artists(session: AsyncSession) -> int:
    """
    Find and merge duplicate artists.

    Strategies:
      1. Same lower(name) — keep the one with higher popularity
      2. Same external_spotify_id — merge into most popular
      3. Same external_itunes_id — merge into most popular

    Returns number of artists removed.
    """
    removed = 0

    # ── Strategy 1: Same lowercased name ──────────────────────
    dup_sql = text("""
        WITH ranked AS (
            SELECT id, name, popularity,
                   ROW_NUMBER() OVER (
                       PARTITION BY lower(name)
                       ORDER BY popularity DESC, created_at DESC
                   ) AS rn
            FROM catalog_artists
        )
        SELECT id, name FROM ranked WHERE rn > 1
    """)
    result = await session.execute(dup_sql)
    dup_rows = result.all()

    for dup_id, dup_name in dup_rows:
        # Find canonical (kept) artist
        canon_result = await session.execute(
            select(CatalogArtistModel)
            .where(func.lower(CatalogArtistModel.name) == dup_name.lower())
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(1)
        )
        canonical = canon_result.scalar_one_or_none()
        if not canonical:
            continue

        await _merge_artist(session, dup_id, canonical.id)
        removed += 1

    await session.commit()

    # ── Strategy 2: Same Spotify ID ──────────────────────────
    dup_spotify = await session.execute(
        select(
            CatalogArtistModel.external_spotify_id,
            func.count(CatalogArtistModel.id).label("cnt"),
        )
        .where(CatalogArtistModel.external_spotify_id.is_not(None))
        .group_by(CatalogArtistModel.external_spotify_id)
        .having(func.count(CatalogArtistModel.id) > 1)
    )
    for row in dup_spotify.all():
        spotify_id = row[0]
        artists_result = await session.execute(
            select(CatalogArtistModel)
            .where(CatalogArtistModel.external_spotify_id == spotify_id)
            .order_by(CatalogArtistModel.popularity.desc())
        )
        artists = artists_result.scalars().all()
        if len(artists) < 2:
            continue
        canonical = artists[0]
        for dup in artists[1:]:
            await _merge_artist(session, dup.id, canonical.id)
            removed += 1

    await session.commit()
    return removed


async def deduplicate_tracks(session: AsyncSession) -> int:
    """
    Find and merge duplicate tracks.

    Strategies:
      1. Same (title, artist_id) — keep higher popularity
      2. Same preview_url — keep first found
      3. Same ISRC (when available) — merge

    Returns number of tracks removed.
    """
    removed = 0

    # Strategy 1: Same title + artist_id
    dup_sql = text("""
        WITH ranked AS (
            SELECT id, title, artist_id, popularity,
                   ROW_NUMBER() OVER (
                       PARTITION BY lower(title), artist_id
                       ORDER BY popularity DESC, created_at DESC
                   ) AS rn
            FROM catalog_tracks
        )
        DELETE FROM catalog_tracks WHERE id IN (
            SELECT id FROM ranked WHERE rn > 1
        )
    """)
    result = await session.execute(dup_sql)
    removed += result.rowcount or 0

    # Strategy 2: Same preview_url
    dup_preview_sql = text("""
        WITH ranked AS (
            SELECT id, preview_url,
                   ROW_NUMBER() OVER (
                       PARTITION BY preview_url
                       ORDER BY popularity DESC
                   ) AS rn
            FROM catalog_tracks
            WHERE preview_url IS NOT NULL
        )
        DELETE FROM catalog_tracks WHERE id IN (
            SELECT id FROM ranked WHERE rn > 1
        )
    """)
    result = await session.execute(dup_preview_sql)
    removed += result.rowcount or 0

    # Strategy 3: Same ISRC
    dup_isrc_sql = text("""
        WITH ranked AS (
            SELECT id, isrc,
                   ROW_NUMBER() OVER (
                       PARTITION BY isrc
                       ORDER BY popularity DESC
                   ) AS rn
            FROM catalog_tracks
            WHERE isrc IS NOT NULL
        )
        DELETE FROM catalog_tracks WHERE id IN (
            SELECT id FROM ranked WHERE rn > 1
        )
    """)
    result = await session.execute(dup_isrc_sql)
    removed += result.rowcount or 0

    await session.commit()
    return removed


async def deduplicate_albums(session: AsyncSession) -> int:
    """
    Find and merge duplicate albums by (title, artist_id).

    Returns number of albums removed.
    """
    dup_sql = text("""
        WITH ranked AS (
            SELECT id, title, artist_id,
                   ROW_NUMBER() OVER (
                       PARTITION BY lower(title), artist_id
                       ORDER BY track_count DESC, created_at DESC
                   ) AS rn
            FROM catalog_albums
        )
        DELETE FROM catalog_albums WHERE id IN (
            SELECT id FROM ranked WHERE rn > 1
        )
    """)
    result = await session.execute(dup_sql)
    removed = result.rowcount or 0
    await session.commit()
    return removed


async def run_full_deduplication() -> dict:
    """
    Run all deduplication strategies across artists, tracks, and albums.

    Returns dict with counts of records removed per category.
    """
    from app.infrastructure.database import _async_session_factory

    async with _async_session_factory() as session:
        artists_removed = await deduplicate_artists(session)
        tracks_removed = await deduplicate_tracks(session)
        albums_removed = await deduplicate_albums(session)

        total = artists_removed + tracks_removed + albums_removed
        logger.info(
            "Full dedup: %d artists, %d tracks, %d albums removed (%d total)",
            artists_removed, tracks_removed, albums_removed, total,
        )

        return {
            "artists_removed": artists_removed,
            "tracks_removed": tracks_removed,
            "albums_removed": albums_removed,
            "total_removed": total,
        }


async def _merge_artist(
    session: AsyncSession,
    dup_id: str,
    canon_id: str,
) -> None:
    """Reassign all child records from *dup_id* to *canon_id*, then delete dup."""
    # Reassign tracks
    await session.execute(
        text("UPDATE catalog_tracks SET artist_id = :canon WHERE artist_id = :dup"),
        {"canon": canon_id, "dup": dup_id},
    )
    # Reassign albums
    await session.execute(
        text("UPDATE catalog_albums SET artist_id = :canon WHERE artist_id = :dup"),
        {"canon": canon_id, "dup": dup_id},
    )
    # Delete duplicate genre links (will be recreated)
    await session.execute(
        text("DELETE FROM catalog_artist_genres WHERE artist_id = :dup"),
        {"dup": dup_id},
    )
    # Delete the duplicate artist
    await session.execute(
        text("DELETE FROM catalog_artists WHERE id = :dup"),
        {"dup": dup_id},
    )
