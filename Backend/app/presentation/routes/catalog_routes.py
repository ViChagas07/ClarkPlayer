"""
Catalog REST API — browse, search, and discover music from the local catalog.

All data is sourced from PostgreSQL — **no external APIs are called**.
Redis caching is used as a read-through acceleration layer, but the database
remains the source of truth.

Endpoints:
  - GET  /catalog/discovery                    → precomputed discovery sections
  - GET  /catalog/search                       → multi-entity search
  - GET  /catalog/autocomplete                 → prefix suggestions
  - GET  /catalog/artists                      → list artists with pagination
  - GET  /catalog/artists/{artist_id}          → single artist detail
  - GET  /catalog/artists/{artist_id}/tracks   → artist's tracks
  - GET  /catalog/artists/{artist_id}/albums   → artist's albums
  - GET  /catalog/albums/{album_id}            → single album detail
  - GET  /catalog/albums/{album_id}/tracks     → album's tracks
  - GET  /catalog/tracks/{track_id}            → single track detail
  - GET  /catalog/genres                       → list all genres
  - GET  /catalog/genres/{slug}                → single genre by slug
  - GET  /catalog/genres/{slug}/tracks         → tracks for a genre
  - GET  /catalog/brazilian                    → brazilian artists list
  - POST /catalog/ingestion/start              → start background ingestion
  - GET  /catalog/ingestion/status             → check ingestion progress
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.dependencies import SessionDep
from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
)
from app.infrastructure.repositories.catalog_repository import CatalogRepository
from app.presentation.schemas.catalog import (
    CatalogAlbumDetailResponse,
    CatalogAlbumListResponse,
    CatalogAlbumResponse,
    CatalogAlbumSummary,
    CatalogArtistDetailResponse,
    CatalogArtistListResponse,
    CatalogArtistResponse,
    CatalogArtistSummary,
    CatalogGenreResponse,
    CatalogSearchResponse,
    CatalogTrackDetailResponse,
    CatalogTrackItem,
    CatalogTrackListResponse,
    CatalogTrackResponse,
    DiscoveryResponse,
    GenreResponse,
    IngestionStatusResponse,
    PaginatedResponse,
)
from app.services.catalog.cache_service import CatalogCacheService
from app.services.catalog.ingestion import create_ingestion_worker
from app.services.catalog.precomputation import DiscoveryPrecomputation
from app.services.catalog.search_engine import CatalogSearchEngine

router = APIRouter(prefix="/catalog", tags=["Catalog"])


def _catalog_repo(session: SessionDep) -> CatalogRepository:
    return CatalogRepository(session)


def _cache_service() -> CatalogCacheService:
    return CatalogCacheService()


# ── Mapping helpers ─────────────────────────────────────────────────────────


def _artist_to_summary(artist: CatalogArtistModel) -> CatalogArtistSummary:
    return CatalogArtistSummary(
        id=str(artist.id),
        name=artist.name,
        image_url=artist.image_url,
        popularity=artist.popularity,
        country=artist.country,
        is_brazilian=artist.is_brazilian,
    )


def _artist_to_response(artist: CatalogArtistModel, track_count: int = 0) -> CatalogArtistResponse:
    genres = [
        assoc.genre.name
        for assoc in artist.genre_associations
        if assoc.genre is not None
    ]
    return CatalogArtistResponse(
        id=str(artist.id),
        name=artist.name,
        image_url=artist.image_url,
        genres=genres,
        popularity=artist.popularity,
        playcount=0,
        country=artist.country,
        bio=artist.bio,
        verified=False,
        track_count=track_count,
    )


def _track_to_item(track: CatalogTrackModel) -> CatalogTrackItem:
    # Artwork fallback chain: album cover → artist image → None
    album_cover = (
        track.album.cover_url
        if (track.album and track.album.cover_url)
        else (track.artist.image_url if track.artist else None)
    )
    return CatalogTrackItem(
        id=str(track.id),
        title=track.title,
        artist_id=str(track.artist_id),
        artist_name=track.artist.name if track.artist else "Unknown",
        album_id=str(track.album_id) if track.album_id else None,
        album_title=track.album.title if track.album else None,
        album_cover=album_cover,
        preview_url=track.preview_url,
        duration_ms=track.duration_ms,
        popularity=track.popularity,
        explicit=track.explicit,
        isrc=track.isrc,
    )


def _track_to_response(track: CatalogTrackModel) -> CatalogTrackResponse:
    artist_name = track.artist.name if track.artist else "Unknown"
    album_title = track.album.title if track.album else None
    # Artwork fallback chain: album cover → artist image → None
    album_cover = (
        track.album.cover_url
        if (track.album and track.album.cover_url)
        else (track.artist.image_url if track.artist else None)
    )

    return CatalogTrackResponse(
        id=str(track.id),
        title=track.title,
        artist_id=str(track.artist_id),
        artist_name=artist_name,
        album_id=str(track.album_id) if track.album_id else None,
        album_title=album_title,
        album_cover=album_cover,
        source=None,
        preview_url=track.preview_url,
        duration_ms=track.duration_ms,
        popularity=track.popularity,
        genres=[],
        bpm=None,
        energy=None,
        danceability=None,
        track_number=track.track_number,
        disc_number=track.disc_number,
        explicit=track.explicit,
        isrc=track.isrc,
    )


def _album_to_summary(album: CatalogAlbumModel) -> CatalogAlbumSummary:
    return CatalogAlbumSummary(
        id=str(album.id),
        title=album.title,
        artist_id=str(album.artist_id),
        artist_name=album.artist.name if album.artist else "Unknown",
        cover_url=album.cover_url,
        release_date=album.release_date,
        track_count=album.track_count,
    )


def _album_to_response(album: CatalogAlbumModel) -> CatalogAlbumResponse:
    return CatalogAlbumResponse(
        id=str(album.id),
        title=album.title,
        artist_id=str(album.artist_id),
        artist_name=album.artist.name if album.artist else "Unknown",
        cover_url=album.cover_url,
        release_date=album.release_date,
        country=album.country,
        track_count=album.track_count,
        external_mb_id=album.external_mb_id,
        external_spotify_id=album.external_spotify_id,
    )


# ── Discovery ───────────────────────────────────────────────────────────────


@router.get(
    "/discovery",
    response_model=DiscoveryResponse,
    summary="Get discovery sections",
    description="Return precomputed discovery sections for the home screen. "
    "Data is cached in Redis (TTL 5m).  All content comes from the local "
    "PostgreSQL catalog.",
)
async def get_discovery(session: SessionDep) -> DiscoveryResponse:
    """Serve precomputed discovery sections, computing on cache miss."""
    cache = _cache_service()
    precomp = DiscoveryPrecomputation(session, cache)

    # ── Fetch sections sequentially (shared SQLAlchemy session) ──
    top_artists = await precomp.get_top_artists()
    trending_tracks = await precomp.get_trending_tracks()
    featured_albums = await precomp.get_featured_albums()
    popular_genres_raw = await precomp.get_popular_genres()
    brazilian_artists = await precomp.get_brazilian_artists()
    international_artists = await precomp.get_international_artists()

    genre_sections: dict[str, list[CatalogTrackItem]] = {}
    for slug in ["pop", "rock", "rap", "electronic", "rnb"]:
        genre_tracks_raw = await precomp.get_genre_section(slug)
        genre_sections[slug] = [
            CatalogTrackItem(
                id=t["id"],
                title=t["title"],
                artist_id=t["artist_id"],
                artist_name=t["artist_name"],
                album_id=t.get("album_id"),
                album_title=t.get("album_title"),
                album_cover=t.get("album_cover"),
                preview_url=t.get("preview_url"),
                duration_ms=t.get("duration_ms"),
                popularity=t.get("popularity", 0),
                explicit=t.get("explicit", False),
                isrc=t.get("isrc"),
            )
            for t in genre_tracks_raw
        ]

    return DiscoveryResponse(
        top_artists=[
            CatalogArtistSummary(
                id=a["id"],
                name=a["name"],
                image_url=a.get("image_url"),
                popularity=a.get("popularity", 0),
                country=a.get("country"),
                is_brazilian=a.get("is_brazilian", False),
            )
            for a in top_artists
        ],
        trending_tracks=[
            CatalogTrackItem(
                id=t["id"],
                title=t["title"],
                artist_id=t["artist_id"],
                artist_name=t["artist_name"],
                album_id=t.get("album_id"),
                album_title=t.get("album_title"),
                album_cover=t.get("album_cover"),
                preview_url=t.get("preview_url"),
                duration_ms=t.get("duration_ms"),
                popularity=t.get("popularity", 0),
                explicit=t.get("explicit", False),
                isrc=t.get("isrc"),
            )
            for t in trending_tracks
        ],
        featured_albums=[
            CatalogAlbumSummary(
                id=a["id"],
                title=a["title"],
                artist_id=a["artist_id"],
                artist_name=a.get("artist_name", "Unknown"),
                cover_url=a.get("cover_url"),
                release_date=a.get("release_date"),
                track_count=a.get("track_count", 0),
            )
            for a in featured_albums
        ],
        popular_genres=[
            CatalogGenreResponse(
                id=g["id"],
                name=g["name"],
                slug=g["slug"],
                artist_count=g.get("artist_count", 0),
                track_count=0,
            )
            for g in popular_genres_raw
        ],
        brazilian_artists=[
            CatalogArtistSummary(
                id=a["id"],
                name=a["name"],
                image_url=a.get("image_url"),
                popularity=a.get("popularity", 0),
                country=a.get("country"),
                is_brazilian=True,
            )
            for a in brazilian_artists
        ],
        international_artists=[
            CatalogArtistSummary(
                id=a["id"],
                name=a["name"],
                image_url=a.get("image_url"),
                popularity=a.get("popularity", 0),
                country=a.get("country"),
                is_brazilian=False,
            )
            for a in international_artists
        ],
        sections=genre_sections,
    )


# ── Search ──────────────────────────────────────────────────────────────────


@router.get(
    "/search",
    response_model=CatalogSearchResponse,
    summary="Search the catalog",
    description="Search across artists, tracks, albums, and genres using "
    "ILIKE matching.  Results are cached with a 2m TTL.  All data comes "
    "from PostgreSQL.",
)
async def search_catalog(
    session: SessionDep,
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results per category"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
) -> CatalogSearchResponse:
    """Search across all catalog entities using the local search engine."""
    engine = CatalogSearchEngine(session)
    cache = _cache_service()

    cached = await cache.get_cached_search(
        q.lower().strip(), limit, offset
    )
    if cached:
        return CatalogSearchResponse(**cached)

    results = await engine.search_everything(q, limit=limit, offset=offset)

    response = CatalogSearchResponse(
        query=results.query,
        artists=[
            CatalogArtistSummary(
                id=a["id"],
                name=a["name"],
                image_url=a.get("image_url"),
                popularity=a.get("popularity", 0),
                country=a.get("country"),
                is_brazilian=a.get("is_brazilian", False),
            )
            for a in results.artists
        ],
        tracks=[
            CatalogTrackItem(
                id=t["id"],
                title=t["title"],
                artist_id=t["artist_id"],
                artist_name=t["artist_name"],
                album_id=t.get("album_id"),
                album_title=t.get("album_title"),
                album_cover=t.get("album_cover"),
                preview_url=t.get("preview_url"),
                duration_ms=t.get("duration_ms"),
                popularity=t.get("popularity", 0),
                explicit=t.get("explicit", False),
                isrc=t.get("isrc"),
            )
            for t in results.tracks
        ],
        albums=[
            CatalogAlbumSummary(
                id=a["id"],
                title=a["title"],
                artist_id=a["artist_id"],
                artist_name=a.get("artist_name", "Unknown"),
                cover_url=a.get("cover_url"),
                release_date=a.get("release_date"),
                track_count=a.get("track_count", 0),
            )
            for a in results.albums
        ],
        genres=[
            CatalogGenreResponse(
                id=g["id"],
                name=g["name"],
                slug=g["slug"],
                artist_count=g.get("artist_count", 0),
                track_count=0,
            )
            for g in results.genres
        ],
        total=results.total,
    )

    await cache.set_cached_search(
        q.lower().strip(), limit, offset,
        response.model_dump(),
    )
    return response


# ── Autocomplete ────────────────────────────────────────────────────────────


@router.get(
    "/autocomplete",
    response_model=list[str],
    summary="Autocomplete suggestions",
    description="Return prefix-matched suggestions from artist names, "
    "track titles, and album titles for type-ahead use.",
)
async def autocomplete(
    session: SessionDep,
    q: str = Query(..., min_length=1, max_length=100, description="Search prefix"),
    limit: int = Query(8, ge=1, le=20, description="Maximum suggestions"),
) -> list[str]:
    """Fast prefix search for autocomplete / type-ahead."""
    engine = CatalogSearchEngine(session)
    return await engine.autocomplete(q, limit=limit)


# ── Artists ─────────────────────────────────────────────────────────────────


@router.get(
    "/artists",
    response_model=CatalogArtistListResponse,
    summary="List catalog artists",
    description="List catalog artists with optional genre, country, and "
    "Brazilian filters.  Results are ordered by popularity descending.",
)
async def list_artists(
    session: SessionDep,
    genre: str | None = Query(
        None, description="Filter artists by genre name (e.g. 'rock', 'jazz')"
    ),
    country: str | None = Query(
        None, description="Filter artists by country code (e.g. 'US', 'BR')"
    ),
    brazilian_only: bool | None = Query(
        None, description="When true, only return Brazilian artists"
    ),
    sort: str = Query(
        "popularity",
        description="Sort field: 'popularity', 'name', or 'track_count'",
    ),
    offset: int = Query(0, ge=0, description="Number of artists to skip"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of artists"),
) -> CatalogArtistListResponse:
    repo = _catalog_repo(session)
    artists = await repo.get_artists(
        genre=genre,
        country=country,
        brazilian_only=brazilian_only,
        offset=offset,
        limit=limit,
    )
    total = await repo.count_artists(genre=genre)

    available_genres_result = await session.execute(
        select(CatalogGenreModel.name).order_by(CatalogGenreModel.name)
    )
    available_genres = [row[0] for row in available_genres_result.fetchall()]

    return CatalogArtistListResponse(
        artists=[_artist_to_response(a) for a in artists],
        total=total,
        offset=offset,
        limit=limit,
        genres=available_genres,
    )


@router.get(
    "/artists/{artist_id}",
    response_model=CatalogArtistDetailResponse,
    summary="Get a catalog artist",
    description="Get a single catalog artist by ID, including associated "
    "albums and a computed track count.",
)
async def get_artist(
    artist_id: UUID,
    session: SessionDep,
) -> CatalogArtistDetailResponse:
    repo = _catalog_repo(session)
    artist = await repo.get_artist_by_id(artist_id)
    if artist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artist '{artist_id}' not found in catalog.",
        )

    count_result = await session.execute(
        select(func.count()).select_from(CatalogTrackModel).where(
            CatalogTrackModel.artist_id == artist_id
        )
    )
    track_count: int = count_result.scalar_one()

    albums_result = await session.execute(
        select(CatalogAlbumModel)
        .options(selectinload(CatalogAlbumModel.artist))
        .where(CatalogAlbumModel.artist_id == artist_id)
        .order_by(CatalogAlbumModel.title)
    )
    albums = list(albums_result.scalars())

    return CatalogArtistDetailResponse(
        id=str(artist.id),
        name=artist.name,
        image_url=artist.image_url,
        genres=[
            assoc.genre.name
            for assoc in artist.genre_associations
            if assoc.genre is not None
        ],
        popularity=artist.popularity,
        playcount=0,
        country=artist.country,
        bio=artist.bio,
        verified=False,
        track_count=track_count,
        albums=[_album_to_summary(a) for a in albums],
    )


@router.get(
    "/artists/{artist_id}/tracks",
    response_model=CatalogTrackListResponse,
    summary="Get artist's catalog tracks",
    description="Get all catalog tracks for a specific artist with pagination. "
    "Only returns tracks that have a preview URL available.",
)
async def get_artist_tracks(
    artist_id: UUID,
    session: SessionDep,
    offset: int = Query(0, ge=0, description="Number of tracks to skip"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of tracks"),
) -> CatalogTrackListResponse:
    repo = _catalog_repo(session)
    artist = await repo.get_artist_by_id(artist_id)
    if artist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artist '{artist_id}' not found in catalog.",
        )

    tracks = await repo.get_tracks(
        artist_id=artist_id, has_preview=True, offset=offset, limit=limit
    )

    count_result = await session.execute(
        select(func.count()).select_from(CatalogTrackModel).where(
            CatalogTrackModel.artist_id == artist_id,
            CatalogTrackModel.preview_url.isnot(None),
        )
    )
    total: int = count_result.scalar_one()

    return CatalogTrackListResponse(
        tracks=[_track_to_response(t) for t in tracks],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get(
    "/artists/{artist_id}/albums",
    response_model=CatalogAlbumListResponse,
    summary="Get artist's albums",
    description="Get all albums for a specific artist with pagination.",
)
async def get_artist_albums(
    artist_id: UUID,
    session: SessionDep,
    offset: int = Query(0, ge=0, description="Number of albums to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of albums"),
) -> CatalogAlbumListResponse:
    repo = _catalog_repo(session)
    artist = await repo.get_artist_by_id(artist_id)
    if artist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artist '{artist_id}' not found in catalog.",
        )

    count_result = await session.execute(
        select(func.count()).select_from(CatalogAlbumModel).where(
            CatalogAlbumModel.artist_id == artist_id
        )
    )
    total: int = count_result.scalar_one()

    albums_result = await session.execute(
        select(CatalogAlbumModel)
        .options(selectinload(CatalogAlbumModel.artist))
        .where(CatalogAlbumModel.artist_id == artist_id)
        .order_by(CatalogAlbumModel.title)
        .offset(offset)
        .limit(limit)
    )
    albums = list(albums_result.scalars())

    return CatalogAlbumListResponse(
        albums=[_album_to_response(a) for a in albums],
        total=total,
        offset=offset,
        limit=limit,
    )


# ── Albums ──────────────────────────────────────────────────────────────────


@router.get(
    "/albums/{album_id}",
    response_model=CatalogAlbumDetailResponse,
    summary="Get a catalog album",
    description="Get a single catalog album by ID, including its full track listing.",
)
async def get_album(
    album_id: UUID,
    session: SessionDep,
) -> CatalogAlbumDetailResponse:
    album_result = await session.execute(
        select(CatalogAlbumModel)
        .options(selectinload(CatalogAlbumModel.artist))
        .where(CatalogAlbumModel.id == album_id)
    )
    album = album_result.scalar_one_or_none()
    if album is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Album '{album_id}' not found in catalog.",
        )

    tracks_result = await session.execute(
        select(CatalogTrackModel)
        .options(selectinload(CatalogTrackModel.artist), selectinload(CatalogTrackModel.album))
        .where(CatalogTrackModel.album_id == album_id)
        .order_by(CatalogTrackModel.track_number)
    )
    tracks = list(tracks_result.scalars())

    return CatalogAlbumDetailResponse(
        id=str(album.id),
        title=album.title,
        artist_id=str(album.artist_id),
        artist_name=album.artist.name if album.artist else "Unknown",
        cover_url=album.cover_url,
        release_date=album.release_date,
        country=album.country,
        track_count=album.track_count,
        external_mb_id=album.external_mb_id,
        external_spotify_id=album.external_spotify_id,
        tracks=[_track_to_item(t) for t in tracks],
    )


@router.get(
    "/albums/{album_id}/tracks",
    response_model=CatalogTrackListResponse,
    summary="Get album's tracks",
    description="Get all tracks for a specific album, ordered by track number.",
)
async def get_album_tracks(
    album_id: UUID,
    session: SessionDep,
) -> CatalogTrackListResponse:
    album = await session.get(CatalogAlbumModel, album_id)
    if album is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
             detail=f"Album '{album_id}' not found in catalog.",
        )

    tracks_result = await session.execute(
        select(CatalogTrackModel)
        .options(selectinload(CatalogTrackModel.artist), selectinload(CatalogTrackModel.album))
        .where(CatalogTrackModel.album_id == album_id)
        .order_by(CatalogTrackModel.track_number)
    )
    tracks = list(tracks_result.scalars())

    return CatalogTrackListResponse(
        tracks=[_track_to_response(t) for t in tracks],
        total=len(tracks),
        offset=0,
        limit=len(tracks),
    )


# ── Tracks ──────────────────────────────────────────────────────────────────


@router.get(
    "/tracks",
    response_model=CatalogTrackListResponse,
    summary="List catalog tracks",
    description="List catalog tracks with optional genre or artist filters. "
    "By default only returns tracks that have a preview URL.",
)
async def list_tracks(
    session: SessionDep,
    genre: str | None = Query(
        None, description="Filter tracks by genre (e.g. 'electronic', 'hip-hop')"
    ),
    artist_id: UUID | None = Query(
        None, description="Filter tracks by artist ID"
    ),
    has_preview: bool = Query(
        True, description="When true, only return tracks with an available preview URL"
    ),
    offset: int = Query(0, ge=0, description="Number of tracks to skip"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of tracks"),
) -> CatalogTrackListResponse:
    repo = _catalog_repo(session)
    tracks = await repo.get_tracks(
        artist_id=artist_id,
        genre=genre,
        has_preview=has_preview,
        offset=offset,
        limit=limit,
    )

    if artist_id is not None:
        count_stmt = (
            select(func.count()).select_from(CatalogTrackModel).where(
                CatalogTrackModel.artist_id == artist_id
            )
        )
        if has_preview:
            count_stmt = count_stmt.where(CatalogTrackModel.preview_url.isnot(None))
        count_result = await session.execute(count_stmt)
        total: int = count_result.scalar_one()
    else:
        total = await repo.count_tracks(genre=genre, has_preview=has_preview)

    return CatalogTrackListResponse(
        tracks=[_track_to_response(t) for t in tracks],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get(
    "/tracks/{track_id}",
    response_model=CatalogTrackDetailResponse,
    summary="Get a catalog track",
    description="Get a single catalog track by ID with full metadata.",
)
async def get_track(
    track_id: UUID,
    session: SessionDep,
) -> CatalogTrackDetailResponse:
    track = await session.get(CatalogTrackModel, track_id)
    if track is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track '{track_id}' not found in catalog.",
        )

    return CatalogTrackDetailResponse(
        id=str(track.id),
        title=track.title,
        artist_id=str(track.artist_id),
        artist_name=track.artist.name if track.artist else "Unknown",
        album_id=str(track.album_id) if track.album_id else None,
        album_title=track.album.title if track.album else None,
        album_cover=track.album.cover_url if track.album else None,
        source=None,
        preview_url=track.preview_url,
        duration_ms=track.duration_ms,
        popularity=track.popularity,
        genres=[],
        bpm=None,
        energy=None,
        danceability=None,
        track_number=track.track_number,
        disc_number=track.disc_number,
        explicit=track.explicit,
        isrc=track.isrc,
        external_mb_id=track.external_mb_id,
        external_spotify_id=track.external_spotify_id,
        external_itunes_id=track.external_itunes_id,
    )


# ── Genres ──────────────────────────────────────────────────────────────────


@router.get(
    "/genres",
    response_model=list[CatalogGenreResponse],
    summary="List catalog genres",
    description="List all genres available in the catalog with artist counts.",
)
async def list_genres(session: SessionDep) -> list[CatalogGenreResponse]:
    genres_result = await session.execute(
        select(CatalogGenreModel).order_by(CatalogGenreModel.name)
    )
    genres = list(genres_result.scalars())

    response: list[CatalogGenreResponse] = []
    for g in genres:
        artist_count_result = await session.execute(
            select(func.count()).select_from(CatalogArtistModel)
            .join(CatalogArtistGenreModel)
            .where(CatalogArtistGenreModel.genre_id == g.id)
        )
        artist_count: int = artist_count_result.scalar_one()

        track_count_result = await session.execute(
            select(func.count()).select_from(CatalogTrackModel)
            .join(CatalogArtistGenreModel, CatalogTrackModel.artist_id == CatalogArtistGenreModel.artist_id)
            .where(CatalogArtistGenreModel.genre_id == g.id)
        )
        track_count: int = track_count_result.scalar_one()

        response.append(
            CatalogGenreResponse(
                id=str(g.id),
                name=g.name,
                slug=g.slug,
                artist_count=artist_count,
                track_count=track_count,
            )
        )

    return response


@router.get(
    "/genres/{slug}",
    response_model=CatalogGenreResponse,
    summary="Get a genre by slug",
    description="Get a single genre by its URL-safe slug identifier.",
)
async def get_genre(
    slug: str,
    session: SessionDep,
) -> CatalogGenreResponse:
    result = await session.execute(
        select(CatalogGenreModel).where(CatalogGenreModel.slug == slug)
    )
    genre = result.scalar_one_or_none()
    if genre is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Genre '{slug}' not found in catalog.",
        )

    artist_count_result = await session.execute(
        select(func.count()).select_from(CatalogArtistModel)
        .join(CatalogArtistGenreModel)
        .where(CatalogArtistGenreModel.genre_id == genre.id)
    )
    artist_count: int = artist_count_result.scalar_one()

    track_count_result = await session.execute(
        select(func.count()).select_from(CatalogTrackModel)
        .join(CatalogArtistGenreModel, CatalogTrackModel.artist_id == CatalogArtistGenreModel.artist_id)
        .where(CatalogArtistGenreModel.genre_id == genre.id)
    )
    track_count: int = track_count_result.scalar_one()

    return CatalogGenreResponse(
        id=str(genre.id),
        name=genre.name,
        slug=genre.slug,
        artist_count=artist_count,
        track_count=track_count,
    )


@router.get(
    "/genres/{slug}/tracks",
    response_model=CatalogTrackListResponse,
    summary="Get tracks for a genre",
    description="Get tracks associated with a genre slug, ordered by popularity.",
)
async def get_genre_tracks(
    slug: str,
    session: SessionDep,
    limit: int = Query(50, ge=1, le=200, description="Maximum number of tracks"),
    offset: int = Query(0, ge=0, description="Number of tracks to skip"),
) -> CatalogTrackListResponse:
    genre_result = await session.execute(
        select(CatalogGenreModel).where(CatalogGenreModel.slug == slug)
    )
    genre = genre_result.scalar_one_or_none()
    if genre is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Genre '{slug}' not found in catalog.",
        )

    count_result = await session.execute(
        select(func.count())
        .select_from(CatalogTrackModel)
        .join(
            CatalogArtistGenreModel,
            CatalogTrackModel.artist_id == CatalogArtistGenreModel.artist_id,
        )
        .where(CatalogArtistGenreModel.genre_id == genre.id)
        .where(CatalogTrackModel.preview_url.is_not(None))
    )
    total: int = count_result.scalar_one()

    tracks_result = await session.execute(
        select(CatalogTrackModel)
        .options(selectinload(CatalogTrackModel.artist), selectinload(CatalogTrackModel.album))
        .join(
            CatalogArtistGenreModel,
            CatalogTrackModel.artist_id == CatalogArtistGenreModel.artist_id,
        )
        .where(CatalogArtistGenreModel.genre_id == genre.id)
        .where(CatalogTrackModel.preview_url.is_not(None))
        .order_by(CatalogTrackModel.popularity.desc())
        .offset(offset)
        .limit(limit)
    )
    tracks = list(tracks_result.scalars().unique())

    return CatalogTrackListResponse(
        tracks=[_track_to_response(t) for t in tracks],
        total=total,
        offset=offset,
        limit=limit,
    )


# ── Brazilian ───────────────────────────────────────────────────────────────


@router.get(
    "/brazilian",
    response_model=CatalogArtistListResponse,
    summary="List Brazilian artists",
    description="List Brazilian catalog artists ordered by popularity.",
)
async def list_brazilian_artists(
    session: SessionDep,
    offset: int = Query(0, ge=0, description="Number of artists to skip"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of artists"),
) -> CatalogArtistListResponse:
    repo = _catalog_repo(session)
    artists = await repo.get_artists(
        brazilian_only=True,
        offset=offset,
        limit=limit,
    )
    total = await session.execute(
        select(func.count()).select_from(CatalogArtistModel).where(
            CatalogArtistModel.is_brazilian == True  # noqa: E712
        )
    )
    total_brazilian: int = total.scalar_one()

    return CatalogArtistListResponse(
        artists=[_artist_to_response(a) for a in artists],
        total=total_brazilian,
        offset=offset,
        limit=limit,
        genres=[],
    )


# ── Ingestion (backward-compatible) ─────────────────────────────────────────


@router.post(
    "/ingestion/start",
    response_model=IngestionStatusResponse,
    summary="Start catalog ingestion",
    description="Start a background pipeline that populates the catalog database "
    "from external music metadata APIs.",
)
async def start_ingestion(
    session: SessionDep,
) -> IngestionStatusResponse:
    """Start the catalog ingestion pipeline and return initial status."""
    from app.infrastructure.database import _async_session_factory

    worker = create_ingestion_worker(_async_session_factory)

    try:
        async with worker._http:
            stats = await worker.run_full_ingestion()
    except Exception:
        stats = {}

    return IngestionStatusResponse(
        status="completed",
        progress={
            "artists_done": stats.get("artists", 0),
            "tracks_done": stats.get("tracks", 0),
        },
        last_run=None,
        stats={
            "total_artists": stats.get("artists", 0),
            "total_tracks": stats.get("tracks", 0),
            "total_with_preview": stats.get("previews", 0),
        },
    )


@router.get(
    "/ingestion/status",
    response_model=IngestionStatusResponse,
    summary="Get ingestion status",
    description="Return the current status of the catalog ingestion pipeline.",
)
async def get_ingestion_status(
    session: SessionDep,
) -> IngestionStatusResponse:
    """Get current catalog statistics as ingestion status."""
    repo = _catalog_repo(session)
    artist_count = await repo.count_artists()
    track_count = await repo.count_tracks()
    preview_count = await repo.count_tracks(has_preview=True)

    return IngestionStatusResponse(
        status="idle",
        progress=None,
        last_run=None,
        stats={
            "total_artists": artist_count,
            "total_tracks": track_count,
            "total_with_preview": preview_count,
        },
    )
