"""
JWT authentication middleware.

Validates the ``Authorization: Bearer <token>`` header on every request
to protected routes.  Injects the authenticated user ID into
``request.state.user_id`` for downstream access if needed outside of
the normal FastAPI dependency chain.
"""

from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.security import decode_access_token


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """
    Light-weight middleware that extracts the user ID from a valid Bearer
    token and stores it in ``request.state``.

    This middleware does **not** block unauthenticated requests — it only
    populates the state when a valid token is present.  For enforcement,
    use the :func:`get_current_user_id` dependency on individual routes.
    """

    # Paths that should be skipped entirely (e.g. public endpoints).
    PUBLIC_PREFIXES: tuple[str, ...] = (
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/logout",
        "/api/v1/auth/refresh",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/health",
    )

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        # Skip auth for public paths
        path = request.url.path
        if any(path.startswith(prefix) for prefix in self.PUBLIC_PREFIXES):
            return await call_next(request)

        auth_header: str | None = request.headers.get("Authorization")
        if auth_header:
            scheme, _, token = auth_header.partition(" ")
            if scheme.lower() == "bearer" and token:
                try:
                    claims = decode_access_token(token)
                    request.state.user_id = claims.get("sub")
                except Exception:
                    # Token is present but invalid — don't fail here;
                    # let the route-level dependency decide.
                    pass

        return await call_next(request)
