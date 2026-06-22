"""Check actual database columns."""
import asyncio
import asyncpg
from app.core.config import get_settings

async def main():
    settings = get_settings()
    dsn = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn)

    # Check user columns
    user_cols = await conn.fetch(
        """SELECT column_name FROM information_schema.columns
           WHERE table_name = 'users'
           ORDER BY ordinal_position"""
    )
    print("=== users columns ===")
    for r in user_cols:
        print(f"  {r['column_name']}")

    # Check genre columns
    genre_cols = await conn.fetch(
        """SELECT column_name FROM information_schema.columns
           WHERE table_name = 'catalog_genres'
           ORDER BY ordinal_position"""
    )
    print("=== catalog_genres columns ===")
    for r in genre_cols:
        print(f"  {r['column_name']}")

    await conn.close()

asyncio.run(main())
