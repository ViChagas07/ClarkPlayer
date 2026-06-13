"""
Top-level API router that aggregates all sub-routers.

Every feature module registers its own router here, keeping the main
application file clean and focused on wiring.
"""

from fastapi import APIRouter

from app.presentation.routes import (
    auth_routes,
    catalog_routes,
    metrics_routes,
    music_routes,
    player,
    playlist_routes,
    track_routes,
    user_routes,
)

# Main API router with a versioned prefix. All feature-specific routers are included here, which allows 
# us to keep the main application file clean and focused on wiring. Each feature module defines its 
# own router and registers it here, making it easy to manage and scale the API as new features are added. 
# The versioned prefix (e.g. /api/v1) allows for future-proofing the API by enabling versioning from the
# start.
api_router = APIRouter(prefix="/api/v1")

# Include all feature-specific routers. Each router is responsible for a specific domain (e.g.
# authentication, user management, tracks, playlists, player), and they are all aggregated under 
# the main API router. This keeps the route definitions organized and modular, allowing for easier 
# maintenance and scalability as the application grows. Each sub-router can also have its own prefix 
# if needed (e.g. /auth, /users) to further organize the endpoints.

api_router.include_router(auth_routes.router)
api_router.include_router(user_routes.router)
api_router.include_router(track_routes.router)
api_router.include_router(playlist_routes.router)
api_router.include_router(player.router)
api_router.include_router(music_routes.router)
api_router.include_router(catalog_routes.router)
api_router.include_router(metrics_routes.router)
