"""
Alembic environment configuration — async PostgreSQL.

Uses the application's ``DATABASE_URL`` and SQLAlchemy ``Base`` metadata
so that ``alembic revision --autogenerate`` can detect model changes.
"""

import asyncio
from logging.config import fileConfig
from typing import Any

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from app.core.config import get_settings
from app.infrastructure.models import Base

# Alembic Config object, which provides access to the .ini values.
config = context.config

# Set the actual DB URL from application settings.
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Configure Python logging (reads the [loggers] section in alembic.ini).
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogenerate support.
target_metadata = Base.metadata

# Migration functions for offline and online modes. The offline mode generates SQL scripts without connecting to the database, while the online
# mode creates an async engine and runs migrations against the live database. The online mode uses an async context to ensure that the event 
# loop is properly managed.

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (generates SQL script)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

# Helper function to run migrations synchronously, which is needed because Alembic's context.run_migrations() is not async-aware. This function
# will be called inside an async context using connection.run_sync() to ensure that the event loop is properly managed while still allowing us
# to use the synchronous migration API.


# ...
def do_run_migrations(connection: Any) -> None:
    """Execute migrations synchronously inside an async context."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

# Async function to create an async engine and run migrations in online mode. It connects to the database using the URL from the config, runs the
# migrations using the synchronous helper function, and then disposes of the engine to clean up resources. This function is called using asyncio.run() to ensure that the event loop is properly managed.
async def run_async_migrations() -> None:
    """Create an async engine and run migrations."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

# Main entry points for offline and online migration modes. Alembic will call the appropriate function based on the context, and the online 
# mode will use asyncio.run() to execute the async migration function, ensuring that the event loop is properly managed throughout the process.
def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connects to the live database)."""
    asyncio.run(run_async_migrations())

# Determine whether to run in offline or online mode based on the Alembic context, and call the appropriate function.
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
