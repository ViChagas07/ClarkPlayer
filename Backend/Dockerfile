# ── Stage 1: Build dependencies ──────────────────────────────────────────
FROM python:3.13-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
ARG POETRY_VERSION=2.4.1
RUN pip install poetry==${POETRY_VERSION}

WORKDIR /app

# Copy only dependency files first (better caching)
COPY pyproject.toml poetry.lock ./

# Install dependencies without dev packages
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root --without dev

# ── Stage 2: Production image ───────────────────────────────────────────
FROM python:3.13-slim AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --gid 1001 appuser \
    && useradd --uid 1001 --gid 1001 --no-create-home --shell /bin/bash appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.13/site-packages/ /usr/local/lib/python3.13/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy application source
COPY --chown=appuser:appuser . .

# Create media directory
RUN mkdir -p /app/media && chown -R appuser:appuser /app/media

USER appuser

EXPOSE 8000

# Health check using the /health endpoint (port may be overridden by $PORT on Render)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost:${PORT:-8000}/health || exit 1

# Use shell form so $PORT is expanded (Render injects PORT env var; defaults to 8000 locally)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
