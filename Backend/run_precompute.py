"""Run precomputation and verify discovery endpoints."""
import asyncio
import sys
sys.path.insert(0, "D:\\ClarkPlayer\\Backend")


async def main():
    from app.infrastructure.database import _async_session_factory
    from app.services.catalog.precomputation import DiscoveryPrecomputation

    async with _async_session_factory() as session:
        from app.services.catalog.cache_service import CatalogCacheService
        cache = CatalogCacheService()
        precomp = DiscoveryPrecomputation(session, cache)
        result = await precomp.precompute_all()

        print("=== PRECOMPUTATION RESULTS ===")
        for section, data in result.items():
            count = len(data) if isinstance(data, list) else "N/A"
            print(f"  {section}: {count} items")
            if isinstance(data, list) and data:
                if section == "top_artists":
                    for a in data[:3]:
                        print(f"    - {a.get('name')} (pop: {a.get('popularity')})")
                elif section == "trending_tracks":
                    for t in data[:3]:
                        print(f"    - '{t.get('title')}' by {t.get('artist_name')} (preview: {bool(t.get('preview_url'))})")
                elif section == "genre_sections":
                    for genre, tracks in data.items():
                        print(f"    {genre}: {len(tracks)} tracks")
                        for t in tracks[:2]:
                            print(f"      - '{t.get('title')}'")
                elif section == "popular_genres":
                    for g in data[:3]:
                        print(f"    - {g.get('name')} ({g.get('artist_count')} artists)")

    print("\n=== DONE ===")


asyncio.run(main())
