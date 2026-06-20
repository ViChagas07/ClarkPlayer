"""
Diagnose the real volume of catalog data with playable previews,
broken down by genre. Read-only -- does not modify anything.

Usage:
    python scripts/diagnose_catalog_volume.py
"""

import asyncio
import os
import sys

# Ensure the Backend/ root is on sys.path so "app" imports resolve
# regardless of the working directory.
_this_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_this_dir)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from sqlalchemy import func, select

from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import (
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
)


async def main() -> None:
    async with _async_session_factory() as session:
        # ── 1. Totais gerais ──────────────────────────────────────────
        total_artists = await session.scalar(
            select(func.count(CatalogArtistModel.id))
        )
        total_tracks = await session.scalar(
            select(func.count(CatalogTrackModel.id))
        )
        total_tracks_with_preview = await session.scalar(
            select(func.count(CatalogTrackModel.id)).where(
                CatalogTrackModel.preview_url.isnot(None),
                CatalogTrackModel.preview_url != "",
            )
        )
        total_genres = await session.scalar(
            select(func.count(CatalogGenreModel.id))
        )

        print("=" * 70)
        print("RESUMO GERAL DO CATÁLOGO")
        print("=" * 70)
        print(f"Total de artistas:                {total_artists}")
        print(f"Total de gêneros:                  {total_genres}")
        print(f"Total de tracks:                   {total_tracks}")
        print(f"Total de tracks COM preview_url:   {total_tracks_with_preview}")
        if total_tracks:
            pct = (total_tracks_with_preview / total_tracks) * 100
            print(f"% de tracks com preview:           {pct:.1f}%")
        print()

        # ── 2. Top 20 gêneros por contagem de tracks com preview ────
        stmt = (
            select(
                CatalogGenreModel.name,
                CatalogGenreModel.slug,
                func.count(CatalogTrackModel.id).label("tracks_with_preview"),
            )
            .select_from(CatalogGenreModel)
            .join(
                CatalogArtistGenreModel,
                CatalogGenreModel.id == CatalogArtistGenreModel.genre_id,
            )
            .join(
                CatalogArtistModel,
                CatalogArtistGenreModel.artist_id == CatalogArtistModel.id,
            )
            .join(
                CatalogTrackModel,
                CatalogTrackModel.artist_id == CatalogArtistModel.id,
            )
            .where(
                CatalogTrackModel.preview_url.isnot(None),
                CatalogTrackModel.preview_url != "",
            )
            .group_by(
                CatalogGenreModel.id,
                CatalogGenreModel.name,
                CatalogGenreModel.slug,
            )
            .order_by(func.count(CatalogTrackModel.id).desc())
            .limit(20)
        )
        result = await session.execute(stmt)
        rows = result.all()

        print("=" * 70)
        print("TOP 20 GENEROS - TRACKS COM PREVIEW (mais cheio -> mais vazio)")
        print("=" * 70)
        print(f"{'Gênero':<30} {'Slug':<25} {'Tracks c/ preview':>18}")
        print("-" * 75)
        for name, slug, count in rows:
            print(f"{name:<30} {slug:<25} {count:>18}")
        print()

        # ── 3. Gêneros com ZERO tracks com preview ──────────────────
        all_genres_stmt = select(CatalogGenreModel.id, CatalogGenreModel.name)
        all_genres_result = await session.execute(all_genres_stmt)
        all_genres = list(all_genres_result.all())

        zero_count = 0
        zero_names: list[str] = []
        for genre_id, genre_name in all_genres:
            count_stmt = (
                select(func.count(CatalogTrackModel.id))
                .select_from(CatalogTrackModel)
                .join(
                    CatalogArtistModel,
                    CatalogTrackModel.artist_id == CatalogArtistModel.id,
                )
                .join(
                    CatalogArtistGenreModel,
                    CatalogArtistModel.id == CatalogArtistGenreModel.artist_id,
                )
                .where(
                    CatalogArtistGenreModel.genre_id == genre_id,
                    CatalogTrackModel.preview_url.isnot(None),
                    CatalogTrackModel.preview_url != "",
                )
            )
            track_count = await session.scalar(count_stmt)
            if track_count == 0:
                zero_count += 1
                zero_names.append(genre_name)

        print("=" * 70)
        print("GÊNEROS COM ZERO TRACKS COM PREVIEW")
        print("=" * 70)
        print(f"Total de gêneros no banco:        {len(all_genres)}")
        print(f"Gêneros com ZERO tracks c/ preview: {zero_count}")
        if all_genres:
            pct_empty = (zero_count / len(all_genres)) * 100
            print(f"% de gêneros vazios (sem preview): {pct_empty:.1f}%")
        if zero_names:
            print()
            print("Lista dos gêneros vazios:")
            for zname in sorted(zero_names):
                print(f"  - {zname}")
        print()

        # ── 4. Amostra — gêneros populares (como o frontend espera) ─
        sample_slugs = ["rock", "pop", "hip-hop", "electronic", "rnb"]
        sample_result = await session.execute(
            select(CatalogGenreModel).where(CatalogGenreModel.slug.in_(sample_slugs))
        )
        sample_genres = list(sample_result.scalars().all())

        print("=" * 70)
        print("TESTE DE AMOSTRA — GÊNEROS DO FRONTEND (Home / Genres)")
        print("=" * 70)
        for g in sample_genres:
            count_stmt = (
                select(func.count(CatalogTrackModel.id))
                .select_from(CatalogTrackModel)
                .join(
                    CatalogArtistModel,
                    CatalogTrackModel.artist_id == CatalogArtistModel.id,
                )
                .join(
                    CatalogArtistGenreModel,
                    CatalogArtistModel.id == CatalogArtistGenreModel.artist_id,
                )
                .where(
                    CatalogArtistGenreModel.genre_id == g.id,
                    CatalogTrackModel.preview_url.isnot(None),
                    CatalogTrackModel.preview_url != "",
                )
            )
            count = await session.scalar(count_stmt)
            print(f"  {g.name:<15} (slug={g.slug:<15}) : {count:>6} tracks com preview")

        # ── 5. Amostra — gêneros brasileiros populares ──────────────
        br_slugs = ["samba", "mpb", "sertanejo", "forro", "funk", "pagode"]
        br_result = await session.execute(
            select(CatalogGenreModel).where(CatalogGenreModel.slug.in_(br_slugs))
        )
        br_genres = list(br_result.scalars().all())

        print()
        print("=" * 70)
        print("TESTE DE AMOSTRA — GÊNEROS BRASILEIROS")
        print("=" * 70)
        for g in br_genres:
            count_stmt = (
                select(func.count(CatalogTrackModel.id))
                .select_from(CatalogTrackModel)
                .join(
                    CatalogArtistModel,
                    CatalogTrackModel.artist_id == CatalogArtistModel.id,
                )
                .join(
                    CatalogArtistGenreModel,
                    CatalogArtistModel.id == CatalogArtistGenreModel.artist_id,
                )
                .where(
                    CatalogArtistGenreModel.genre_id == g.id,
                    CatalogTrackModel.preview_url.isnot(None),
                    CatalogTrackModel.preview_url != "",
                )
            )
            count = await session.scalar(count_stmt)
            print(f"  {g.name:<15} (slug={g.slug:<15}) : {count:>6} tracks com preview")
        print()
        print("[OK] Diagnostico concluido. Nenhum dado foi alterado.")


if __name__ == "__main__":
    asyncio.run(main())
