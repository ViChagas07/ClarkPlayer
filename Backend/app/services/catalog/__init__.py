"""
Catalog services — caching, precomputation, search, and ingestion.

- :class:`CatalogCacheService`  — Redis caching layer with hit/miss tracking
- :class:`DiscoveryPrecomputation` — local discovery sections from PostgreSQL
- :class:`CatalogSearchEngine` — local search with pg_trgm + ILIKE
- :class:`CatalogIngestionWorker` — batch ingestion from external APIs
"""

from app.services.catalog.cache_service import CatalogCacheService  # noqa: F401
from app.services.catalog.ingestion import CatalogIngestionWorker  # noqa: F401
from app.services.catalog.precomputation import DiscoveryPrecomputation  # noqa: F401
from app.services.catalog.search_engine import CatalogSearchEngine, CatalogSearchResults  # noqa: F401
from app.services.catalog.seed_data import BRAZILIAN_ARTISTS, TOP_ARTISTS  # noqa: F401

__all__ = [
    "CatalogCacheService",
    "CatalogIngestionWorker",
    "CatalogSearchEngine",
    "CatalogSearchResults",
    "DiscoveryPrecomputation",
    "TOP_ARTISTS",
    "BRAZILIAN_ARTISTS",
]
