"""Diagnostic script to check catalog database state."""
import asyncio
import sys

sys.path.insert(0, "D:\\ClarkPlayer\\Backend")


async def check():
    from app.infrastructure.database import _async_session_factory
    from sqlalchemy import text

    async with _async_session_factory() as session:
        # Check if catalog tables exist
        result = await session.execute(
            text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_name LIKE 'catalog_%' "
                "ORDER BY table_name"
            )
        )
        tables = result.fetchall()
        print("=== CATALOG TABLES IN DATABASE ===")
        for t in tables:
            print(f"  {t[0]}")
        if not tables:
            print("  NENHUMA TABELA DE CATALOGO ENCONTRADA!")
            return

        print()
        print("=== ROW COUNTS ===")
        tables_to_check = [
            "catalog_artists",
            "catalog_albums",
            "catalog_tracks",
            "catalog_genres",
            "catalog_artist_genres",
            "catalog_track_previews",
        ]
        for table in tables_to_check:
            try:
                result = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"  {table}: {count}")
            except Exception as e:
                print(f"  {table}: ERRO - {e}")

        # Check if artists have any data
        print()
        print("=== SAMPLE DATA (catalog_artists) ===")
        result = await session.execute(
            text("SELECT id, name, popularity, is_brazilian FROM catalog_artists LIMIT 5")
        )
        rows = result.fetchall()
        for r in rows:
            print(f"  {r}")
        if not rows:
            print("  VAZIO!")

        # Check if tracks have preview URLs
        print()
        print("=== TRACKS WITH PREVIEW URLS ===")
        result = await session.execute(
            text(
                "SELECT COUNT(*) FROM catalog_tracks WHERE preview_url IS NOT NULL"
            )
        )
        preview_count = result.scalar()
        print(f"  Tracks with preview: {preview_count}")

        # Check tracks without preview
        result = await session.execute(
            text("SELECT COUNT(*) FROM catalog_tracks WHERE preview_url IS NULL")
        )
        no_preview = result.scalar()
        print(f"  Tracks without preview: {no_preview}")

        # Check sample tracks
        print()
        print("=== SAMPLE TRACKS ===")
        result = await session.execute(
            text(
                "SELECT ct.title, ca.name as artist, ct.preview_url, ct.popularity "
                "FROM catalog_tracks ct "
                "JOIN catalog_artists ca ON ct.artist_id = ca.id "
                "LIMIT 5"
            )
        )
        rows = result.fetchall()
        for r in rows:
            preview = "YES" if r[2] else "NO"
            print(f"  '{r[0]}' by {r[1]} (preview: {preview}, pop: {r[3]})")
        if not rows:
            print("  VAZIO!")


asyncio.run(check())
