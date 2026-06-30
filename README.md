# ClarkPlayer — Your Personal Fortress of Sound

<div align="center">

**A full-stack music streaming platform — upload, organize, discover, and play your music collection across web and desktop.**

[![Python](https://img.shields.io/badge/python-3.11%2B-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131?logo=tauri&logoColor=white)](https://tauri.app)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Directory Structure](#directory-structure)
6. [Prerequisites](#prerequisites)
7. [Installation & Setup](#installation--setup)
8. [Configuration](#configuration)
9. [API Documentation](#api-documentation)
10. [Database Schema](#database-schema)
11. [Usage Guide](#usage-guide)
12. [Desktop App (Tauri)](#desktop-app-tauri)
13. [Development Guide](#development-guide)
14. [Deployment](#deployment)
15. [Monitoring & Observability](#monitoring--observability)
16. [Troubleshooting](#troubleshooting)
17. [License & Contributing](#license--contributing)

---

## Project Overview

ClarkPlayer is a production-grade, full-stack music streaming platform that gives users complete control over their music library. Unlike closed-wall streaming services, ClarkPlayer lets you **upload your own audio files**, **browse a rich metadata catalog**, **discover new music**, and **play everything through a polished web interface** — all backed by a high-performance async Python backend.

The platform is built on a **clean architecture** foundation with strict separation of concerns: domain entities are pure Python dataclasses, application services orchestrate business logic through abstract repository interfaces, infrastructure adapters handle persistence (PostgreSQL, Redis), and presentation routes remain thin delegation layers.

**Key differentiators:**

- **Self-hosted music library** — upload your own FLAC, MP3, WAV, AAC, OGG, Opus, and more. Files are streamed with byte-range support.
- **Rich music catalog** — a pre-populated catalog of artists, albums, tracks, and genres sourced from MusicBrainz, Spotify, iTunes, and Last.fm, with preview clips for discovery.
- **Desktop experience** — native Windows app via Tauri v2 with local filesystem scanning, embedded SQLite library database, and system tray integration.
- **Google OAuth + email/password** — dual authentication with JWT access/refresh tokens stored as HttpOnly cookies.
- **Redis-powered performance** — multi-DB Redis setup for caching (read-through), session storage, rate limiting, and real-time metrics.
- **SEO-optimized frontend** — server-rendered React via Next.js 16 with structured data, Open Graph metadata, sitemap generation, and canonical URLs.

---

## Features

### Music Player
- **Web Audio API engine** — gapless playback with gain control and analyzer node for visualization data
- **Preview player** — 30-second catalog track previews via HTML5 Audio element
- **Queue management** — add tracks, albums, or artists to the play queue
- **Shuffle & Repeat** — shuffle, repeat-one, and repeat-all modes
- **Sleep timer** — Redis-backed auto-expiring timer; survives page refresh
- **Recently played** — persistent history via Redis Sorted Sets (90-day TTL)
- **Volume control** — synced across the Web Audio API gain node
- **Progress tracking** — real-time seek bar with requestAnimationFrame precision

### Library Management
- **Audio upload** — drag-and-drop or file picker; validates format and size (configurable, default 500 MB)
- **Metadata editing** — update title, artist, album, genre, year per-track
- **Favorites** — one-click toggle with dedicated favorites view
- **Playlists** — create, rename, delete; add/remove/reorder tracks (drag-and-drop via @dnd-kit)
- **Bulk track listing** — paginated, filterable by artist, album, genre, search query
- **Lyrics drawer** — slide-up panel for synced lyrics display

### Music Catalog
- **Discovery home page** — precomputed sections: top artists, trending tracks, featured albums, popular genres, Brazilian/international artists, genre-specific sections (Pop, Rock, Rap, Electronic, R&B)
- **Full-text search** — ILIKE-based across artists, tracks, albums, and genres with Redis caching
- **Autocomplete** — prefix-matched suggestions for type-ahead search boxes
- **Categorized search suggestions** — rich search-as-you-type dropdown with artist images and album covers
- **Artist pages** — bio, genre tags, popularity, album grid, track listing
- **Album pages** — cover art, release date, country, full track listing with durations
- **Genre pages** — mosaic cover images, artist/track counts, gradient theming
- **Brazilian music focus** — dedicated `/brazilian` endpoint with flag indicators
- **30-second previews** — catalog tracks include preview URLs for sampling before purchase/addition

### Authentication & Security
- **Email/Password registration** — bcrypt-hashed passwords with username uniqueness check
- **Google OIDC** — full OAuth 2.0 flow with ID token validation; automatic account linking by email
- **JWT access tokens** — HS256-signed, 30-minute expiry (configurable)
- **Refresh tokens** — opaque UUIDs stored in Redis with 7-day expiry; rotated on each refresh
- **HttpOnly cookies** — refresh tokens set as `SameSite=Strict` cookies for XSS protection
- **Token blacklisting** — revoked tokens tracked in PostgreSQL with scheduled cleanup
- **Logout all devices** — bulk token revocation via Redis scan
- **Email verification** — Resend-powered transactional emails with time-limited tokens
- **Password reset** — time-limited reset tokens with no user enumeration (generic response)
- **LGPD compliance** — consent version tracking, data export JSON, account deletion with cascade
- **Rate limiting** — configurable Redis-backed rate limiter middleware

### User Experience
- **Dark theme** — Midnight, Dark, and Light themes with CSS custom properties
- **Accent color picker** — 10 preset accent colors with hover state mapping
- **Font size scaling** — Small, Default, Large options via CSS `--font-scale`
- **Bold mode** — typographic boldness toggle
- **Multi-language** — i18n-ready with Arabic RTL support
- **Equalizer** — 10-band graphic EQ with presets (Normal, Classical, Dance, Folk, Heavy Metal, Hip-Hop, Jazz, Pop, Rock)
- **Crossfade & gapless playback** — configurable in settings
- **Toast notifications** — success, error, info, warning with action buttons
- **Skeleton loaders** — shimmer placeholders during data fetching
- **SEO** — structured data (WebSite, Organization, BreadcrumbList), Open Graph, Twitter Cards, sitemap.xml, robots.txt
- **Accessibility** — skip-to-content link, keyboard navigation, ARIA labels

### Desktop App (Tauri)
- **Local library scanning** — scans music folders and extracts metadata via Rust-side audio parsing
- **Embedded SQLite** — local database for library indexing and playback history
- **Native file access** — Web Audio API decoding from file bytes read by Tauri IPC
- **Folder watching** — filesystem events trigger automatic re-scan
- **Album art extraction** — embedded cover art read from audio files
- **System tray** — minimize to tray with playback controls
- **Global shortcuts** — platform-level keyboard shortcuts for media control
- **Native dialogs** — OS-native folder picker for adding music folders
- **MSI/NSIS installers** — Windows deployment packaging

---

## Architecture

### High-Level System Design

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
│                                                                      │
│  ┌──────────────┐  ┌───────────────────────┐  ┌───────────────────┐ │
│  │  Web Browser  │  │  Tauri Desktop App    │  │  Mobile Browser   │ │
│  │  (Next.js)    │  │  (Next.js + Rust)     │  │  (Responsive)     │ │
│  └──────┬───────┘  └───────────┬───────────┘  └────────┬──────────┘ │
│         │                      │                        │            │
└─────────┼──────────────────────┼────────────────────────┼────────────┘
          │                      │                        │
          ▼                      ▼                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (UISaaS/)                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Next.js 16 App Router (React 19 Server Components)           │   │
│  │                                                                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │   │
│  │  │  Pages   │  │ Layouts  │  │ Metadata │  │  Middleware   │ │   │
│  │  │ (routes) │  │ (shells) │  │ (SEO)    │  │ (auth check)  │ │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │   │
│  │       │              │             │               │          │   │
│  │       ▼              ▼             ▼               ▼          │   │
│  │  ┌─────────────────────────────────────────────────────────┐  │   │
│  │  │  Client Components (Client Boundaries)                   │  │   │
│  │  │                                                          │  │   │
│  │  │  ┌────────────┐ ┌──────────────┐ ┌────────────────────┐ │  │   │
│  │  │  │  Zustand   │ │ TanStack     │ │  Audio Engine      │ │  │   │
│  │  │  │  Stores    │ │ React Query  │ │  Web Audio / HTML5 │ │  │   │
│  │  │  │            │ │              │ │                    │ │  │   │
│  │  │  └────────────┘ └──────────────┘ └────────────────────┘ │  │   │
│  │  └─────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Tauri Bridge (Desktop Only)                                   │   │
│  │  Rust backend: file scanning, SQLite, IPC, system tray         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
          │
          │  HTTPS (Next.js rewrites proxy /api/* → backend)
          │  or direct CORS access
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     BACKEND API (Backend/app/)                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Middleware Pipeline (order matters)                           │   │
│  │  CORS → GZip → JWTAuthMiddleware → MetricsMiddleware          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────────────────────────────┐ │
│  │  Exception       │  │  API Router  /api/v1/                     │ │
│  │  Handlers        │  │                                           │ │
│  │  AppError → JSON │  │  ┌─────────┐ ┌─────────┐ ┌───────────┐ │ │
│  │  Unhandled → 500 │  │  │ Auth    │ │ Users   │ │ Tracks    │ │ │
│  └──────────────────┘  │  ├─────────┤ ├─────────┤ ├───────────┤ │ │
│                        │  │ Catalog │ │ Music   │ │ Playlists │ │ │
│                        │  ├─────────┤ ├─────────┤ ├───────────┤ │ │
│                        │  │ Player  │ │ Metrics │ │ Static    │ │ │
│                        │  └─────────┘ └─────────┘ └───────────┘ │ │
│                        └──────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Application Layer                                            │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │   │
│  │  │ AuthService  │ │ TrackService │ │ PlaylistService      │ │   │
│  │  │ UserService  │ │HistoryService│ │ CatalogSyncScheduler │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Domain Layer (pure Python, zero framework dependencies)      │   │
│  │  User, Track, Playlist, CatalogArtist, CatalogAlbum, ...     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Infrastructure Layer                                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │   │
│  │  │ Repositories │ │ SQLAlchemy   │ │ Redis Client Pool    │ │   │
│  │  │ (PostgreSQL) │ │ Async Engine │ │ (3 pools, lazy init) │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  External Integrations                                        │   │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────┐ ┌───────────┐ │   │
│  │  │ Google │ │ Resend │ │MusicBrainz│ │Spotify│ │ iTunes    │ │   │
│  │  │ OIDC   │ │ Email  │ │           │ │       │ │ Last.fm   │ │   │
│  │  └────────┘ └────────┘ └──────────┘ └──────┘ └───────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
          │                           │
          ▼                           ▼
┌──────────────────┐     ┌──────────────────────┐
│  PostgreSQL 16   │     │  Redis 7             │
│  ─────────────── │     │  ─────────────────── │
│  - users         │     │  DB 0: Sessions      │
│  - tracks        │     │    (refresh tokens,  │
│  - playlists     │     │     sleep timers,    │
│  - playbacklist  │     │     verification     │
│  - token_black-  │     │     tokens)          │
│    list          │     │  DB 1: Cache         │
│  - catalog_*     │     │    (read-through     │
│    (6 tables)    │     │     catalog cache)   │
│                  │     │  DB 2: Rate Limiting │
│                  │     │    (sliding window)  │
│                  │     │  + Metrics storage   │
└──────────────────┘     └──────────────────────┘
```

### Data Flow

1. **Browser loads page** → Next.js renders server component → client component mounts → Zustand store rehydrates from `localStorage`
2. **TanStack React Query fetches data** → `lib/api.ts` calls fetch → Next.js rewrites proxy to backend → FastAPI route → Service layer → Repository → PostgreSQL (with Redis cache check)
3. **Authentication** → user logs in → backend returns JWT access token + sets HttpOnly refresh cookie → `authStore` persists tokens → subsequent requests include `Authorization: Bearer <token>` header → middleware extracts user_id → dependency validates
4. **Audio playback** → `useDesktopAudioEngine` loads track via Tauri IPC (desktop) or HTTP streaming (browser) → Web Audio API decodes and plays → `requestAnimationFrame` updates progress in `playerStore`
5. **Preview playback** → `usePreviewPlayer` creates HTML5 Audio element → plays 30-second preview URL → auto-stops on ended

---

## Tech Stack

### Backend

| Category | Technology | Version |
|----------|-----------|---------|
| Language | Python | 3.11 – 3.14 |
| Framework | FastAPI | ≥0.135.0 |
| ASGI Server | uvicorn | ≥0.42.0 |
| ORM | SQLAlchemy (async) | ≥2.0.48 |
| Database Driver | asyncpg | ≥0.31.0 |
| Database | PostgreSQL | 16 |
| Cache / Sessions | Redis | 7 |
| Redis Client | redis-py (async) | 5.0.4 |
| Migrations | Alembic | ≥1.18.0 |
| JWT / JWE | joserfc | ≥1.0.0 |
| Password Hashing | passlib + bcrypt | ≥1.7.4 |
| Email | Resend | ≥2.2.0 |
| HTTP Client | httpx | ≥0.28.0 |
| Validation | Pydantic v2 | ≥2.12.0 |
| Config | python-dotenv | ≥1.2.0 |
| File I/O | aiofiles | ≥25.1.0 |
| Linting | Ruff | ≥0.11.0 |
| Type Checking | mypy | ≥1.15.0 |
| Testing | pytest + pytest-asyncio | ≥8.0 |

### Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| Language | TypeScript | 6.0 |
| Framework | Next.js (App Router) | 16.2 |
| UI Library | React | 19.2 |
| State Management | Zustand | 5.0 |
| Server State | TanStack React Query | 5.101 |
| Styling | Tailwind CSS | 4.3 |
| Forms | React Hook Form + Zod | 7.75 / 4.4 |
| Drag & Drop | @dnd-kit/core + sortable | 6.3 / 10.0 |
| Icons | lucide-react | 1.14 |
| Virtualization | react-window | 2.2 |
| Linting | ESLint 9 (flat config) | 9.39 |
| Desktop | Tauri v2 (Rust) | 2.x |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| Containerization | Docker / Docker Compose |
| Multi-stage Build | Python 3.13-slim (builder + production) |
| CI/CD Ready | Dockerfile health checks, Render-compatible |

---

## Directory Structure

```
ClarkPlayer/
│
├── Backend/                           # Python FastAPI backend
│   ├── app/                           # Application root
│   │   ├── main.py                    # App factory, lifespan, exception handlers
│   │   ├── core/                      # Cross-cutting concerns
│   │   │   ├── config.py              # Settings from env vars (pydantic-like)
│   │   │   ├── security.py            # JWT, JWE, bcrypt password hashing
│   │   │   ├── dependencies.py        # FastAPI Depends() — current user, DB session
│   │   │   ├── exceptions.py          # AppError hierarchy (HTTP-mapped error codes)
│   │   │   ├── redis.py               # Lazy Redis connection pools (3 DBs)
│   │   │   ├── cache.py               # Redis cache decorator with TTL
│   │   │   └── cache_keys.py          # Standardized cache key builder + TTL policy
│   │   ├── domain/                    # Pure domain entities (no framework deps)
│   │   │   ├── entities.py            # User, Track, Playlist, Catalog* dataclasses
│   │   │   └── enums.py               # AudioFormat, PlaylistVisibility, TokenType
│   │   ├── application/               # Use-case orchestration
│   │   │   ├── interfaces/
│   │   │   │   └── repositories.py    # Abstract repository protocols (ISP)
│   │   │   └── services/
│   │   │       ├── auth_service.py     # Registration, login, Google OIDC, token mgmt
│   │   │       ├── user_service.py     # Profile updates, password change, deletion
│   │   │       ├── track_service.py    # Upload, metadata, favorites, streaming
│   │   │       ├── playlist_service.py # CRUD + track management + reordering
│   │   │       └── history_service.py  # Recently played (Redis Sorted Set)
│   │   ├── infrastructure/            # Persistence adapters
│   │   │   ├── database.py            # Async engine, session factory, session dep
│   │   │   ├── models/                # SQLAlchemy ORM models
│   │   │   │   ├── base.py            # Base, TimestampMixin, pk_column() helper
│   │   │   │   ├── user.py            # UserModel (OAuth, consent, relationships)
│   │   │   │   ├── track.py           # TrackModel (audio files)
│   │   │   │   ├── playlist.py        # PlaylistModel + PlaylistTrackModel (M2M)
│   │   │   │   ├── catalog.py         # CatalogArtist/Album/Track/Genre + junction
│   │   │   │   └── token_blacklist.py # TokenBlacklistModel
│   │   │   └── repositories/          # Concrete repository implementations
│   │   │       ├── user_repository.py
│   │   │       ├── track_repository.py
│   │   │       ├── playlist_repository.py
│   │   │       ├── catalog_repository.py
│   │   │       └── token_blacklist_repository.py
│   │   ├── presentation/              # HTTP layer
│   │   │   ├── router.py              # Aggregated /api/v1 router
│   │   │   ├── routes/                # Route handlers (thin delegation)
│   │   │   │   ├── auth_routes.py     # /auth/* — 11 endpoints
│   │   │   │   ├── user_routes.py     # /users/me/* — profile, avatar, export
│   │   │   │   ├── track_routes.py    # /tracks/* — upload, stream, favorites
│   │   │   │   ├── playlist_routes.py # /playlists/* — CRUD + tracks
│   │   │   │   ├── catalog_routes.py  # /catalog/* — discovery, search, browse
│   │   │   │   ├── music_routes.py    # /music/* — external metadata aggregation
│   │   │   │   ├── player.py          # /player/* — sleep timer, history
│   │   │   │   └── metrics_routes.py  # /metrics/* — performance stats
│   │   │   └── schemas/               # Pydantic request/response models
│   │   │       ├── auth.py, user.py, track.py, playlist.py, catalog.py
│   │   ├── middleware/                 # Starlette middleware
│   │   │   ├── auth_middleware.py      # JWT extraction (non-blocking)
│   │   │   ├── metrics_middleware.py   # API response time tracking
│   │   │   └── rate_limit.py          # Redis sliding-window rate limiter
│   │   └── services/                  # Infrastructure services
│   │       ├── catalog/               # Catalog ingestion & search
│   │       │   ├── ingestion.py       # Pipeline: fetch → dedup → store
│   │       │   ├── search_engine.py   # ILIKE + Redis-cached search
│   │       │   ├── cache_service.py   # Catalog-specific Redis caching
│   │       │   ├── precomputation.py  # Discovery section precomputation
│   │       │   ├── sync_scheduler.py  # Background catalog refresh scheduler
│   │       │   ├── seed_data.py       # Initial catalog seeding
│   │       │   ├── massive_seed.py    # Bulk seeding pipeline
│   │       │   └── dedup.py           # Entity de-duplication logic
│   │       ├── music/                 # External music API aggregation
│   │       │   ├── aggregator.py      # MusicAggregator — unified multi-source
│   │       │   ├── clients/           # Spotify, MusicBrainz, iTunes, Last.fm clients
│   │       │   ├── schemas.py         # Unified API response models
│   │       │   └── ratelimit.py       # API rate limit handling
│   │       ├── email_service.py       # Resend transactional emails (6 templates)
│   │       ├── email_templates.py     # HTML email templates
│   │       └── metrics.py             # MetricsService — Redis-based telemetry
│   ├── alembic/                       # Database migrations
│   │   ├── env.py                     # Async Alembic environment
│   │   └── versions/                  # Migration scripts (0001–0006+)
│   ├── tests/                         # Test suite
│   ├── scripts/                       # Utility scripts
│   ├── pyproject.toml                 # Poetry project config, tools config
│   ├── Dockerfile                     # Multi-stage production Docker build
│   ├── .env.example                   # Documented environment template
│   └── requirements.txt               # pip-compiled dependency lock
│
├── Front-end/UISaaS/                  # Next.js + React frontend
│   ├── app/                           # Next.js App Router pages
│   │   ├── layout.tsx                 # Root layout (SEO meta, theme, providers)
│   │   ├── page.tsx                   # Home page (Now Playing / Discovery)
│   │   ├── (auth)/                    # Auth-related pages (grouped layout)
│   │   ├── auth/                      # Auth callback pages
│   │   ├── search/                    # Search page
│   │   ├── artists/                   # Artist detail pages
│   │   ├── albums/                    # Album detail pages
│   │   ├── genres/                    # Genre browse pages
│   │   ├── library/                   # User library (tracks, favorites)
│   │   ├── playlists/                 # Playlist management
│   │   ├── settings/                  # User settings
│   │   ├── account/                   # Account management
│   │   ├── music/track/               # Track detail pages
│   │   ├── verify-email/              # Email verification page
│   │   ├── reset-password/            # Password reset page
│   │   ├── privacy-policy/            # Privacy policy page
│   │   ├── audios/                    # Audio content pages
│   │   ├── globals.css                # Global styles (Tailwind + custom variables)
│   │   ├── sitemap.ts                 # Dynamic sitemap generation
│   │   └── robots.ts                  # Robots.txt generation
│   ├── components/                    # React components
│   │   ├── auth/                      # Login, register, auth modal, Google button
│   │   ├── layout/                    # AppShell, PersistentShell, GlobalFooter
│   │   ├── library/                   # Track list, favorite toggle, upload
│   │   ├── player/                    # LyricsDrawer
│   │   ├── playlist/                  # Playlist CRUD components
│   │   ├── search/                    # Search bar, suggestions, results
│   │   ├── track/                     # Track cards, metadata forms
│   │   ├── ui/                        # LazyImage, Toast, SkeletonLoader, ShareSheet
│   │   ├── providers/                 # QueryProvider (React Query)
│   │   ├── seo/                       # Structured data components
│   │   ├── CatalogPrefetcher.tsx      # Pre-warms catalog queries
│   │   ├── GenreMosaic.tsx            # Genre cover mosaic grid
│   │   ├── NowPlayingContent.tsx      # Home page discovery sections
│   │   ├── SleepTimerRestore.tsx      # Rehydrates sleep timer on load
│   │   └── ThemeRestore.tsx           # Applies saved theme on load
│   ├── hooks/                         # Custom React hooks
│   │   ├── useCatalog.ts             # All catalog queries (TanStack React Query)
│   │   ├── usePreviewPlayer.ts       # 30-second preview playback
│   │   ├── useDesktopAudioEngine.ts  # Web Audio API + Tauri fallback
│   │   ├── useGenreFilter.ts         # Genre filtering state
│   │   ├── useGooglePicker.ts        # Google OAuth picker integration
│   │   ├── useGoogleScripts.ts       # Google SDK script loading
│   │   ├── useDeferredImport.tsx     # Dynamic import with loading state
│   │   ├── useToast.ts               # Toast notification state
│   │   └── useTranslation.ts         # i18n translation hook
│   ├── store/                         # Zustand state stores
│   │   ├── authStore.ts              # Authentication (persisted to localStorage)
│   │   ├── playerStore.ts            # Player state (track, queue, shuffle, repeat)
│   │   ├── playlistStore.ts          # Local playlist state (persisted)
│   │   ├── settingsStore.ts          # Theme, accent, font, EQ (persisted)
│   │   └── sidebarStore.ts           # Sidebar open/close state
│   ├── lib/                           # Utility libraries
│   │   ├── api.ts                     # Typed API client with auto-refresh
│   │   ├── desktopApi.ts             # Tauri IPC bindings (type-safe wrappers)
│   │   ├── queryClient.ts            # TanStack Query client configuration
│   │   ├── catalogCache.ts           # Frontend catalog cache helpers
│   │   ├── albumQueue.ts             # Album-to-queue conversion
│   │   ├── genre-image-map.ts        # Genre → cover image mapping
│   │   ├── mockData.ts               # Development mock data
│   │   ├── translations.ts           # i18n translation dictionaries
│   │   ├── seedCatalog.ts            # Catalog seeding utilities
│   │   └── utils.ts                  # General utility functions
│   ├── src/                           # Additional source
│   │   ├── api/                       # API route handlers
│   │   └── types/                     # Additional type definitions
│   ├── types/index.ts                # Core TypeScript type definitions (500+ lines)
│   ├── src-tauri/                     # Tauri desktop app (Rust)
│   │   ├── src/                       # Rust source code
│   │   ├── Cargo.toml                # Rust dependencies
│   │   ├── tauri.conf.json           # Tauri configuration
│   │   └── capabilities/             # Tauri capability permissions
│   ├── public/                        # Static assets
│   │   ├── ClarkPlayer_Transparent.png
│   │   ├── ClarkPlayer_Favicon.png
│   │   └── manifest.json
│   ├── next.config.ts                # Next.js config (rewrites, images, headers)
│   ├── next.config.tauri.ts          # Tauri-specific Next.js config
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── postcss.config.mjs            # PostCSS config (Tailwind + Autoprefixer)
│   ├── eslint.config.js              # ESLint flat config
│   ├── middleware.ts                 # Edge middleware (auth cookie check)
│   └── package.json                  # Frontend dependencies & scripts
│
├── docker-compose.yml                # PostgreSQL + Redis + Backend services
├── AGENTS.md                         # Agent configuration notes
├── MEMORY.md                         # Project memory / context notes
└── .github/                          # GitHub workflows & templates
```

---

## Prerequisites

### Required

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.11 – 3.14 | Backend runtime |
| **Node.js** | 20+ | Frontend runtime |
| **PostgreSQL** | 16 | Primary database |
| **Redis** | 7+ | Cache, sessions, rate limiting |
| **Git** | Any | Version control |

### Optional

| Tool | Purpose |
|------|---------|
| **Docker & Docker Compose** | Containerized development/production |
| **Rust (rustup)** | Tauri desktop app compilation |
| **Poetry** | Python dependency management |
| **Google Cloud Console project** | Google OAuth SSO |
| **Resend account** | Transactional email delivery |
| **Spotify Developer account** | Spotify metadata enrichment |
| **Last.fm API account** | Artist metadata enrichment |

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/clarkplayer.git
cd clarkplayer
```

### 2. Infrastructure (PostgreSQL + Redis)

**Option A: Docker Compose (recommended)**

```bash
docker compose up -d postgres redis
```

This starts PostgreSQL 16 on port 5432 and Redis 7 on port 6379 with persistent volumes.

**Option B: Local installation**

Install PostgreSQL 16 and Redis 7 natively, then create the database:

```sql
CREATE DATABASE "ClarkPlayer";
```

### 3. Backend Setup

```bash
cd Backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
alembic upgrade head

# (Optional) Seed the catalog with sample data
python -m app.services.catalog.seed_data

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Open `http://localhost:8000/docs` for the interactive Swagger UI.

### 4. Frontend Setup

```bash
cd Front-end/UISaaS

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local  # if template exists
# edit .env.local to set NEXT_PUBLIC_API_URL

# Start the development server (with Turbopack)
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### 5. Full Stack Development (Concurrently)

From `Front-end/UISaaS/`:

```bash
npm run dev:all
```

This runs both the Next.js dev server and the FastAPI backend concurrently using `concurrently`.

---

## Configuration

### Backend Environment Variables (`Backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | `development`, `staging`, or `production` |
| `DEBUG` | `false` | Enables debug mode (redact errors, enable docs) |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:...@localhost:5432/ClarkPlayer` | PostgreSQL connection string |
| `DATABASE_ECHO` | `false` | Log all SQL queries |
| `JWT_SECRET_KEY` | `clarkplayer-dev-secret-...` | HMAC signing key (change in production!) |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |
| `REDIS_URL` | *(empty)* | Redis connection URL (`redis://host:port`). If empty, Redis features are gracefully disabled. |
| `REDIS_PASSWORD` | *(empty)* | Redis AUTH password |
| `REDIS_SESSION_DB` | `0` | Redis DB for sessions/tokens |
| `REDIS_CACHE_DB` | `1` | Redis DB for catalog caching |
| `REDIS_RATELIMIT_DB` | `2` | Redis DB for rate limiting |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins |
| `MEDIA_ROOT` | `../media` | Uploaded files directory |
| `MAX_UPLOAD_SIZE_MB` | `500` | Maximum audio file upload size |
| `GOOGLE_CLIENT_ID` | *(empty)* | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | *(empty)* | Google OAuth 2.0 Client Secret |
| `GOOGLE_OIDC_REDIRECT_URI` | *(empty)* | Google OAuth redirect URI |
| `SPOTIFY_CLIENT_ID` | *(empty)* | Spotify API Client ID |
| `SPOTIFY_CLIENT_SECRET` | *(empty)* | Spotify API Client Secret |
| `GENIUS_ACCESS_TOKEN` | *(empty)* | Genius API access token |
| `LASTFM_API_KEY` | *(empty)* | Last.fm API key |
| `RESEND_API_KEY` | *(empty)* | Resend API key for emails |
| `RESEND_FROM` | `onboarding@resend.dev` | Email sender address |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend base URL (for email links) |

### Frontend Environment Variables (`Front-end/UISaaS/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical frontend URL for SEO |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | *(empty)* | Google OAuth client ID (for frontend SDK) |

### Docker Compose Environment

The `docker-compose.yml` pre-configures PostgreSQL, Redis, and the backend service with all necessary environment variables. Sensitive values should be provided via `.env` file or shell environment variables:

```bash
JWT_SECRET_KEY=your-production-secret \
GOOGLE_CLIENT_ID=xxx \
GOOGLE_CLIENT_SECRET=xxx \
docker compose up -d
```

---

## API Documentation

All endpoints are prefixed with `/api/v1`. The interactive Swagger UI is available at `/docs` in development mode.

### Authentication — `/api/v1/auth`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/register` | Create a new user account | No |
| `POST` | `/auth/login` | Email/password login; sets HttpOnly refresh cookie | No |
| `POST` | `/auth/refresh` | Exchange refresh token for new access token | No (cookie) |
| `POST` | `/auth/logout` | Revoke refresh token, clear cookie | No |
| `POST` | `/auth/logout-all` | Revoke all refresh tokens for user | Bearer |
| `GET` | `/auth/me` | Get authenticated user's profile | Bearer |
| `POST` | `/auth/google/callback` | Exchange Google authorization code for JWT pair | No |
| `POST` | `/auth/verify-email` | Consume email verification token | No |
| `POST` | `/auth/resend-verification` | Re-send verification email | No |
| `POST` | `/auth/forgot-password` | Request password reset email | No |
| `POST` | `/auth/reset-password` | Set new password using reset token | No |
| `POST` | `/auth/consent` | Record LGPD consent acceptance | Bearer |

**Example — Register:**

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "musicfan42",
  "email": "fan@example.com",
  "password": "s3cur3P@ssw0rd",
  "display_name": "Music Fan"
}
```

**Response (201):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "musicfan42",
  "email": "fan@example.com",
  "display_name": "Music Fan",
  "avatar_url": null,
  "is_active": true,
  "email_verified": false
}
```

**Example — Login:**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "fan@example.com",
  "password": "s3cur3P@ssw0rd"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "ae45d21b-38c2-4d9b-a123-...",
  "token_type": "bearer"
}
```

A `clark_refresh_token` HttpOnly cookie is also set on the response.

### Users — `/api/v1/users`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/users/me` | Get current user profile | Bearer |
| `PATCH` | `/users/me` | Update display name or avatar URL | Bearer |
| `POST` | `/users/me/change-password` | Change password (requires current password) | Bearer |
| `POST` | `/users/me/avatar` | Upload avatar image (multipart) | Bearer |
| `DELETE` | `/users/me` | Permanently delete account and all data | Bearer |
| `GET` | `/users/me/export` | Export all user data as JSON (LGPD) | Bearer |

### Tracks — `/api/v1/tracks`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/tracks/upload` | Upload an audio file (multipart + metadata fields) | Bearer |
| `GET` | `/tracks` | List user's tracks (paginated, filterable) | Bearer |
| `GET` | `/tracks/favorites` | List favorited tracks only | Bearer |
| `GET` | `/tracks/{id}` | Get track metadata | Bearer |
| `PATCH` | `/tracks/{id}` | Update track metadata | Bearer |
| `POST` | `/tracks/{id}/favorite` | Toggle favorite status | Bearer |
| `POST` | `/tracks/{id}/play` | Record a play event | Bearer |
| `GET` | `/tracks/{id}/stream` | Stream raw audio file (Range support) | Bearer |
| `DELETE` | `/tracks/{id}` | Delete track (file + DB record) | Bearer |

Supported audio formats for upload: `.mp3`, `.flac`, `.wav`, `.aac`, `.ogg`, `.wma`, `.m4a`, `.opus`

### Playlists — `/api/v1/playlists`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/playlists` | Create a new playlist | Bearer |
| `GET` | `/playlists` | List user's playlists (with track counts) | Bearer |
| `GET` | `/playlists/{id}` | Get playlist details | Bearer |
| `PATCH` | `/playlists/{id}` | Update playlist (name, description, visibility) | Bearer |
| `DELETE` | `/playlists/{id}` | Delete playlist | Bearer |
| `GET` | `/playlists/{id}/tracks` | List tracks in a playlist | Bearer |
| `POST` | `/playlists/{id}/tracks` | Add a track to a playlist | Bearer |
| `DELETE` | `/playlists/{id}/tracks/{track_id}` | Remove a track from a playlist | Bearer |
| `PUT` | `/playlists/{id}/tracks/reorder` | Reorder tracks in a playlist | Bearer |

### Player — `/api/v1/player`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/player/sleep-timer` | Set a sleep timer (expires_at in Unix ms) | Bearer |
| `GET` | `/player/sleep-timer` | Get current sleep timer | Bearer |
| `DELETE` | `/player/sleep-timer` | Cancel sleep timer | Bearer |
| `POST` | `/player/played/{track_id}` | Record a play event in history | Bearer |
| `GET` | `/player/recently-played` | Get recently played tracks (with full resolution) | Bearer |
| `DELETE` | `/player/history` | Clear playback history | Bearer |

### Catalog — `/api/v1/catalog`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/catalog/discovery` | Precomputed discovery sections for home screen | No |
| `GET` | `/catalog/search?q={query}` | Multi-entity search (ILIKE, cached) | No |
| `GET` | `/catalog/autocomplete?q={prefix}` | Prefix type-ahead suggestions | No |
| `GET` | `/catalog/search/suggestions?q={prefix}` | Categorized search-as-you-type | No |
| `GET` | `/catalog/artists` | List artists (filterable by genre, country, Brazilian) | No |
| `GET` | `/catalog/artists/{id}` | Artist detail with albums + track count | No |
| `GET` | `/catalog/artists/{id}/tracks` | Artist's tracks (paginated, previewable only) | No |
| `GET` | `/catalog/artists/{id}/albums` | Artist's albums (paginated) | No |
| `GET` | `/catalog/albums/{id}` | Album detail with full track listing | No |
| `GET` | `/catalog/albums/{id}/tracks` | Album's tracks (ordered by track number) | No |
| `GET` | `/catalog/tracks` | List tracks (genre/artist filter, previewable) | No |
| `GET` | `/catalog/tracks/{id}` | Track detail with external IDs | No |
| `GET` | `/catalog/genres` | List genres with mosaic cover images | No |
| `GET` | `/catalog/genres/{slug}` | Genre by slug with artist/track counts | No |
| `GET` | `/catalog/genres/{slug}/tracks` | Genre's tracks (popularity-sorted) | No |
| `GET` | `/catalog/brazilian` | Brazilian artists list | No |
| `POST` | `/catalog/ingestion/start` | Trigger background catalog ingestion | No |
| `GET` | `/catalog/ingestion/status` | Check ingestion pipeline status | No |

### Music Metadata — `/api/v1/music`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/music/search?q={query}` | Aggregated search (MusicBrainz + Spotify + iTunes + Last.fm) | No |
| `GET` | `/music/track/{mbid}` | Full track metadata by MusicBrainz ID | No |
| `GET` | `/music/artist/{mbid}` | Full artist profile by MusicBrainz ID | No |
| `GET` | `/music/artist/{mbid}/similar` | Similar artists (Last.fm) | No |

### Metrics — `/api/v1/metrics`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/metrics/summary` | Full metrics: API perf, cache, catalog, errors, sync | No |
| `GET` | `/metrics/cache` | Cache hit/miss statistics by prefix | No |
| `GET` | `/metrics/api` | Per-endpoint API response times (windowed) | No |
| `GET` | `/metrics/catalog` | Catalog size counts | No |
| `GET` | `/metrics/sync` | Catalog sync scheduler status | No |

### System

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/health` | Liveness probe (PostgreSQL + Redis connectivity) | No |

---

## Database Schema

### Core Tables

**`users`** — User accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, default: `gen_random_uuid()` | User unique identifier |
| `username` | `VARCHAR(50)` | UNIQUE, NOT NULL, INDEX | Username |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL, INDEX | Email address |
| `hashed_password` | `VARCHAR(255)` | NULLABLE | bcrypt hash (NULL for OAuth users) |
| `display_name` | `VARCHAR(100)` | NULLABLE | Display name |
| `avatar_url` | `VARCHAR(500)` | NULLABLE | Avatar image URL |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT: true | Account active status |
| `email_verified` | `BOOLEAN` | NOT NULL, DEFAULT: false | Email verification status |
| `provider` | `VARCHAR(20)` | NULLABLE, INDEX | OAuth provider (e.g. "google") |
| `provider_id` | `VARCHAR(255)` | NULLABLE, INDEX | External provider user ID |
| `terms_version` | `VARCHAR(20)` | NULLABLE | Accepted terms version |
| `privacy_version` | `VARCHAR(20)` | NULLABLE | Accepted privacy version |
| `consent_accepted_at` | `TIMESTAMPTZ` | NULLABLE | Consent timestamp |
| `consent_ip` | `VARCHAR(45)` | NULLABLE | Consent IP address |
| `consent_user_agent` | `VARCHAR(500)` | NULLABLE | Consent user agent |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT: now() | Account creation time |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT: now() | Last update time |

**`tracks`** — User-uploaded audio files

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | Track unique identifier |
| `user_id` | `UUID` | FK → users.id ON DELETE CASCADE, INDEX | Owning user |
| `title` | `VARCHAR(300)` | NOT NULL | Track title |
| `artist` | `VARCHAR(200)` | NULLABLE, INDEX | Artist name |
| `album` | `VARCHAR(200)` | NULLABLE, INDEX | Album name |
| `genre` | `VARCHAR(100)` | NULLABLE | Genre |
| `year` | `INTEGER` | NULLABLE | Release year |
| `duration` | `FLOAT` | NULLABLE | Duration in seconds |
| `file_path` | `TEXT` | NOT NULL | Filesystem path to audio file |
| `file_size` | `BIGINT` | NOT NULL, DEFAULT: 0 | File size in bytes |
| `file_format` | `VARCHAR(10)` | NOT NULL | Audio format (mp3, flac, etc.) |
| `cover_art_path` | `TEXT` | NULLABLE | Cover art image path |
| `play_count` | `INTEGER` | NOT NULL, DEFAULT: 0 | Play count |
| `last_played_at` | `TIMESTAMPTZ` | NULLABLE | Last play timestamp |
| `is_favorite` | `BOOLEAN` | NOT NULL, DEFAULT: false | Favorite status |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Upload time |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Last update time |

**`playlists`** — User playlists

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | Playlist unique identifier |
| `user_id` | `UUID` | FK → users.id ON DELETE CASCADE, INDEX | Owning user |
| `name` | `VARCHAR(200)` | NOT NULL | Playlist name |
| `description` | `TEXT` | NULLABLE | Playlist description |
| `cover_art_path` | `TEXT` | NULLABLE | Cover art image |
| `visibility` | `VARCHAR(20)` | NOT NULL, DEFAULT: 'private' | 'private', 'public', 'unlisted' |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Creation time |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Last update time |

**`playlist_tracks`** — Playlist-Track junction (M:N)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `playlist_id` | `UUID` | PK, FK → playlists.id ON DELETE CASCADE | Playlist |
| `track_id` | `UUID` | PK, FK → tracks.id ON DELETE CASCADE | Track |
| `position` | `INTEGER` | NOT NULL, DEFAULT: 0 | Track order position |

**`token_blacklist`** — Revoked JWT tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | Record ID |
| `token_jti` | `VARCHAR(255)` | UNIQUE, NOT NULL, INDEX | JWT ID (jti claim) |
| `user_id` | `VARCHAR(36)` | NOT NULL, INDEX | User ID |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL, INDEX | Token natural expiry (for cleanup) |
| `revoked_at` | `TIMESTAMPTZ` | NOT NULL | When token was revoked |
| `reason` | `VARCHAR(50)` | NULLABLE | Revocation reason |

### Catalog Tables

**`catalog_artists`** — Music artists in the local catalog

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Artist unique identifier |
| `name` | `VARCHAR(500)` UNIQUE, NOT NULL, INDEX | Artist name |
| `bio` | `TEXT` NULLABLE | Artist biography |
| `image_url` | `VARCHAR(1000)` NULLABLE | Artist image URL |
| `external_mb_id` | `VARCHAR(100)` NULLABLE, INDEX | MusicBrainz ID |
| `external_spotify_id` | `VARCHAR(100)` NULLABLE, INDEX | Spotify ID |
| `external_itunes_id` | `VARCHAR(100)` NULLABLE | iTunes ID |
| `external_lastfm_url` | `VARCHAR(1000)` NULLABLE | Last.fm URL |
| `popularity` | `INTEGER` NOT NULL, DEFAULT: 0, INDEX | Popularity score |
| `country` | `VARCHAR(10)` NULLABLE | Country code |
| `is_brazilian` | `BOOLEAN` NOT NULL, DEFAULT: false | Brazilian music flag |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | Timestamps |

**`catalog_albums`** — Music albums

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Album unique identifier |
| `title` | `VARCHAR(500)` NOT NULL, INDEX | Album title |
| `artist_id` | `UUID` FK → catalog_artists ON DELETE CASCADE | Owning artist |
| `cover_url` | `VARCHAR(1000)` NULLABLE | Album cover URL |
| `release_date` | `VARCHAR(50)` NULLABLE | Release date |
| `country` | `VARCHAR(10)` NULLABLE | Country code |
| `track_count` | `INTEGER` NOT NULL, DEFAULT: 0 | Number of tracks |
| `external_mb_id` | `VARCHAR(100)` NULLABLE, INDEX | MusicBrainz ID |
| `external_spotify_id` | `VARCHAR(100)` NULLABLE, INDEX | Spotify ID |
| `external_itunes_id` | `VARCHAR(100)` NULLABLE | iTunes ID |
| Unique constraint: | `(title, artist_id)` | Prevents duplicate albums |

**`catalog_tracks`** — Catalog track entries

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Track unique identifier |
| `title` | `VARCHAR(500)` NOT NULL, INDEX | Track title |
| `artist_id` | `UUID` FK → catalog_artists ON DELETE CASCADE | Artist |
| `album_id` | `UUID` FK → catalog_albums ON DELETE SET NULL | Album (nullable) |
| `duration_ms` | `INTEGER` NULLABLE | Duration in milliseconds |
| `track_number` | `INTEGER` NULLABLE | Track number on album |
| `disc_number` | `INTEGER` NULLABLE | Disc number |
| `preview_url` | `VARCHAR(1000)` NULLABLE | 30-second preview URL |
| `isrc` | `VARCHAR(20)` NULLABLE, UNIQUE, INDEX | International Standard Recording Code |
| `external_mb_id` | `VARCHAR(100)` NULLABLE, INDEX | MusicBrainz ID |
| `external_spotify_id` | `VARCHAR(100)` NULLABLE, INDEX | Spotify ID |
| `external_itunes_id` | `VARCHAR(100)` NULLABLE | iTunes ID |
| `explicit` | `BOOLEAN` NOT NULL, DEFAULT: false | Explicit content flag |
| `popularity` | `INTEGER` NOT NULL, DEFAULT: 0, INDEX | Popularity score |
| Unique constraint: | `(title, artist_id)` | Prevents duplicate tracks |

**`catalog_genres`** — Genre taxonomy

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Genre unique identifier |
| `name` | `VARCHAR(100)` UNIQUE, NOT NULL, INDEX | Genre name |
| `slug` | `VARCHAR(100)` UNIQUE, NOT NULL, INDEX | URL-safe slug |
| `gradient_from` | `VARCHAR(7)` DEFAULT: '#1a1a2e' | Theme gradient start color |
| `gradient_to` | `VARCHAR(7)` DEFAULT: '#16213e' | Theme gradient end color |
| `cover_image_url` | `VARCHAR(1000)` NULLABLE | Genre cover image |
| `cover_artist_id` | `UUID` FK → catalog_artists NULLABLE | Artist for cover image |
| `created_at` | `TIMESTAMPTZ` | Creation time |
| `updated_at` | `TIMESTAMPTZ` NULLABLE | Update time |

**`catalog_artist_genres`** — Artist-Genre junction (M:N)

| Column | Type | Description |
|--------|------|-------------|
| `artist_id` | `UUID` PK, FK → catalog_artists ON DELETE CASCADE | Artist |
| `genre_id` | `UUID` PK, FK → catalog_genres ON DELETE CASCADE | Genre |

**`catalog_track_previews`** — Track preview URLs

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Preview unique identifier |
| `track_id` | `UUID` FK → catalog_tracks ON DELETE CASCADE, UNIQUE | Track |
| `url` | `VARCHAR(1000)` NOT NULL | Preview audio URL |
| `expires_at` | `TIMESTAMPTZ` NULLABLE | URL expiration time |
| `fetched_at` | `TIMESTAMPTZ` NOT NULL, DEFAULT: now() | When URL was fetched |

---

## Usage Guide

### Authentication Flow

1. **Register** — Navigate to the sign-up form. Provide a username, email, and password. A verification email is sent automatically.
2. **Verify Email** — Click the link in your verification email (or visit `/verify-email?token=...`).
3. **Login** — Use email + password, or click "Continue with Google" for OAuth SSO.
4. **Google OAuth** — The frontend initiates Google's OAuth flow. After consent, Google redirects back with a code, which the frontend POSTs to `/api/v1/auth/google/callback`. New Google users are auto-provisioned; existing users' accounts are linked by email.
5. **Session Management** — Access tokens expire after 30 minutes. The `api.ts` client automatically detects 401 responses and refreshes the token silently. Refresh tokens (HttpOnly cookies) are rotated on each refresh.

### Browsing the Music Catalog

1. **Home Page** (`/`) — Precomputed discovery sections load automatically: top artists, trending tracks, featured albums, popular genres, Brazilian artists, international artists, and genre-curated sections.
2. **Search** — Use the search bar in the navigation header. Results are categorized into Artists, Tracks, Albums, and Genres. Prefix-based autocomplete provides real-time suggestions.
3. **Artists** — Browse catalog artists at `/artists` (sorted by popularity, filterable by genre). Click an artist to see their albums, tracks, and genre tags.
4. **Genres** — Browse all genres at `/genres`. Each genre tile shows a mosaic of 4 artist cover images. Click to explore tracks in that genre.
5. **Albums** — Album detail pages show cover art, release info, and the full track listing with durations.

### Playing Music

1. **Playing a track** — Click any track item. The audio engine loads the file via Web Audio API (desktop) or HTTP streaming (browser).
2. **Queue management** — Click "Add to Queue" on any track, album, or artist. The queue persists in the player store.
3. **Catalog previews** — Catalog tracks with a preview URL can be sampled for 30 seconds. Click the play button on any catalog track item. Previews auto-stop and do not advance the queue.
4. **Shuffle & Repeat** — Toggle shuffle for random playback order. Cycle through repeat modes: off → all → one → off.
5. **Sleep Timer** — Set a timer in Settings or from the player controls. The timer is stored server-side in Redis and survives page refreshes.

### Managing Your Library

1. **Upload Audio** — Navigate to your library (`/library`). Use the upload dialog to select audio files. Supported formats: MP3, FLAC, WAV, AAC, OGG, WMA, M4A, OPUS.
2. **Edit Metadata** — Click the edit icon on any track to update its title, artist, album, genre, or year.
3. **Favorites** — Click the heart icon to toggle favorite status. View all favorites at `/library/favorites`.
4. **Playlists** — Create playlists from the sidebar. Add tracks via the context menu. Reorder tracks by drag-and-drop. Playlists are persisted both locally (Zustand) and server-side.

### Desktop App Features

1. **Add Music Folders** — In the desktop app, use the native folder picker to add directories containing your music files.
2. **Scan Library** — The Rust backend scans folders recursively, extracts metadata and album art from audio files, and indexes everything in a local SQLite database.
3. **File Watching** — The desktop app monitors added folders for changes. New files are automatically scanned.
4. **Native Playback** — Audio is read via Tauri IPC, decoded by the Web Audio API, and played with low latency.

---

## Desktop App (Tauri)

The Tauri desktop application is located at `Front-end/UISaaS/src-tauri/`. It bundles the Next.js frontend with a Rust backend that provides:

- **Local SQLite database** — Tracks library, play history, and settings
- **Audio metadata extraction** — Reads ID3 tags, duration, bitrate, sample rate, album art from files
- **Filesystem access** — Recursive directory scanning, file watching, and audio file reading
- **System integration** — System tray, global keyboard shortcuts, native dialogs
- **Windows installers** — MSI and NSIS packaging targets

### Development Commands

```bash
cd Front-end/UISaaS

# Start Tauri dev (opens desktop window + Next.js HMR)
npm run tauri

# Build desktop app
npm run tauri:build
```

### Configuration

The Tauri config (`src-tauri/tauri.conf.json`) defines:
- Window dimensions (1200×800, min 800×600)
- Build pipeline (frontendDist from `out/` directory)
- Bundle targets (MSI/NSIS for Windows)
- System tray icon and tooltip
- Security permissions per capability

---

## Development Guide

### Backend Development

**Code style** is enforced via Ruff (replaces flake8/isort) and mypy (strict mode):

```bash
# Lint
ruff check app/

# Type check
mypy app/

# Run tests
pytest tests/ -v --cov=app --cov-report=term
```

**Architecture rules:**
- Domain entities (`app/domain/entities.py`) must have **zero framework dependencies** — pure Python dataclasses only
- Application services depend on **abstract interfaces** (`app/application/interfaces/repositories.py`), not concrete implementations
- Infrastructure adapters implement those interfaces with SQLAlchemy/Redis
- Route handlers delegate to services immediately — no business logic in presentation layer
- All exceptions extend `AppError` for consistent JSON error envelopes
- Immutable entities: mutating methods return new instances, never modify in-place

**Running migrations:**

```bash
# Create a new migration
alembic revision --autogenerate -m "description_of_change"

# Apply migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1
```

Migrations also run automatically on app startup (safe for production — idempotent).

### Frontend Development

**Code style** via ESLint 9 flat config with TypeScript, React Hooks, and React Refresh plugins:

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build
```

**Architecture guidelines:**
- Server Components by default; add `'use client'` only when needed (state, effects, browser APIs)
- Zustand stores for **client state** (auth, player, settings, sidebar, playlists)
- TanStack React Query for **server state** (API data with caching, refetching, pagination)
- Custom hooks encapsulate audio playback, catalog queries, and UI logic
- API client (`lib/api.ts`) handles auth tokens, auto-refresh on 401, and error normalization
- `next.config.ts` proxies `/api/*` requests to the backend via rewrites
- Next.js edge middleware checks `auth_token` cookie for protected route access

**TypeScript strictness:**
- `erasableSyntaxOnly: true` — forbids enums, namespaces, parameter properties
- `verbatimModuleSyntax: true` — requires `import type` for type-only imports
- `noUnusedLocals` and `noUnusedParameters` both enabled
- All API types in `types/index.ts` mirror backend Pydantic schemas

---

## Deployment

### Docker Compose (Full Stack)

```bash
# Clone and configure
cp Backend/.env.example Backend/.env
# Edit Backend/.env with production values

# Build and start all services
docker compose up -d --build
```

This starts three services:
- **postgres** — PostgreSQL 16 with health check and persistent volume
- **redis** — Redis 7 with health check and persistent volume
- **backend** — FastAPI behind uvicorn, depends on postgres and redis being healthy

### Render / Railway / Fly.io

The backend `Dockerfile` is ready for Platform-as-a-Service deployment:

- **Multi-stage build** — Builder stage installs Poetry deps; production stage copies only needed artifacts
- **Non-root user** — Runs as `appuser` (UID 1001)
- **Health check** — `curl -sf http://localhost:${PORT:-8000}/health`
- **PORT variable** — Respects `$PORT` env var (Render standard)
- **SSR-compatible** — Next.js frontend can be deployed to Vercel with API rewrites pointing to the backend URL

### Frontend Deployment (Vercel)

1. Connect the `Front-end/UISaaS/` directory to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your backend URL (e.g., `https://clarkplayer.onrender.com`)
3. Set `NEXT_PUBLIC_SITE_URL` to your frontend domain
4. Configure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` for OAuth
5. Deploy — Next.js builds with `next build`

The `vercel.json` at the project root configures Vercel-specific settings.

### Production Checklist

- [ ] Change `JWT_SECRET_KEY` to a long, random string
- [ ] Set `ENVIRONMENT=production` and `DEBUG=false`
- [ ] Configure `CORS_ORIGINS` explicitly (not `*`)
- [ ] Set up Google OAuth credentials with production redirect URIs
- [ ] Configure Resend with a verified sending domain
- [ ] Set `FRONTEND_URL` to the production domain (used in email links)
- [ ] Set `RESEND_FROM` to a verified Resend sender
- [ ] Run database with `POSTGRES_PASSWORD` set via environment
- [ ] Enable `REDIS_URL` with a password if Redis is exposed
- [ ] Set up SSL/TLS termination (via reverse proxy or platform)
- [ ] Run `alembic upgrade head` before first production start
- [ ] Seed the catalog: `python -m app.services.catalog.massive_seed`

---

## Monitoring & Observability

ClarkPlayer includes a built-in metrics system accessible at `/api/v1/metrics`:

- **API Metrics** — Request count, average/p50/p95/p99 latency per endpoint, sliding window
- **Cache Metrics** — Hit/miss counts and rates per cache prefix
- **Catalog Metrics** — Entity counts (artists, albums, tracks, genres)
- **Sync Status** — Catalog sync scheduler running state and job progress
- **Error Rates** — Per-endpoint error counts (in-memory)
- **Health Check** — Liveness probe with PostgreSQL and Redis connectivity status at `/health`

All metrics are stored in Redis with time-bucketed keys and automatic expiry. The `MetricsMiddleware` wraps every API call and records duration at the 1-minute bucket level.

---

## Troubleshooting

### Backend

| Issue | Solution |
|-------|----------|
| **`No module named 'fast'`** | The backend stub (`main.py` reference in AGENTS.md) is outdated — the actual entrypoint is `app.main:app`. Run: `uvicorn app.main:app --reload` |
| **Redis connection refused** | If `REDIS_URL` is not set, Redis is optional. The app operates in PostgreSQL-only mode. Set `REDIS_URL=redis://localhost:6379/0` if Redis is available. |
| **PostgreSQL connection error** | Verify `DATABASE_URL` in `.env`. Ensure PostgreSQL is running and the database exists. Run `docker compose up -d postgres` for Docker-based setup. |
| **Alembic migration fails** | Check that the database URL in `alembic.ini` or `.env` is correct. Migrations are also run at startup — check startup logs. |
| **Google OAuth callback fails** | Verify `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_OIDC_REDIRECT_URI` are set. Ensure the redirect URI is registered in Google Cloud Console. |
| **Email verification not sending** | Check `RESEND_API_KEY` is set. In development, Resend uses `onboarding@resend.dev` and only sends to verified addresses. |
| **Upload fails** | Check `MAX_UPLOAD_SIZE_MB` (default 500 MB). Verify the file extension is in `ALLOWED_AUDIO_EXTENSIONS`. Ensure `MEDIA_ROOT` directory is writable. |

### Frontend

| Issue | Solution |
|-------|----------|
| **CORS errors** | Ensure backend `CORS_ORIGINS` includes the frontend origin. In Next.js dev mode, the proxy (`next.config.ts` rewrites) avoids CORS entirely. |
| **401 on every request** | The refresh token may be expired or invalid. Clear `localStorage` and log in again. Check that the `auth_token` cookie is being set. |
| **Build fails on unused variables** | TypeScript `noUnusedLocals` and `noUnusedParameters` are strict. Remove or prefix unused variables with `_`. |
| **Catalog not loading** | The catalog requires seeding. Run `python -m app.services.catalog.massive_seed` from the `Backend/` directory. |
| **Audio not playing** | For catalog previews, ensure the track has a `preview_url`. For uploaded tracks, ensure the file exists on disk and the backend can stream it. |
| **Next.js Turbopack issues** | Use `npm run dev` (Turbopack) for development. Standard dev is available via `next dev` without the `--turbopack` flag. |

---

## License & Contributing

ClarkPlayer is open source under the **MIT License**.

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Write code following the architecture guidelines above
4. Run backend tests: `pytest tests/ -v`
5. Run frontend build: `npm run build` (ensures type safety)
6. Run linters: `ruff check app/ && npm run lint`
7. Submit a pull request with a clear description

### Code Standards

- **Python**: Ruff (pycodestyle, pyflakes, isort, pep8-naming, pyupgrade, bugbear), mypy strict mode
- **TypeScript**: ESLint 9 flat config, strict TypeScript, `verbatimModuleSyntax`, `erasableSyntaxOnly`
- **Commits**: Conventional commits preferred (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- **Tests**: pytest (backend), no frontend test suite yet

---

<div align="center">

**Built with passion for music lovers everywhere.**

ClarkPlayer — Your Personal Fortress of Sound

</div>
