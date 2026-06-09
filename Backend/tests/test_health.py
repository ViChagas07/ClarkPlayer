"""Basic smoke tests for the ClarkPlayer API."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    """The /health endpoint should return 200 OK."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "ClarkPlayer"
    assert data["version"] == "0.1.0"


@pytest.mark.asyncio
async def test_api_docs_available(client: AsyncClient) -> None:
    """In DEBUG mode, the OpenAPI docs should be reachable."""
    response = await client.get("/docs")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_redoc_available(client: AsyncClient) -> None:
    """In DEBUG mode, the ReDoc endpoint should be reachable."""
    response = await client.get("/redoc")
    assert response.status_code == 200
