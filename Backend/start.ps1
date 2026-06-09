# ClarkPlayer Backend Development Server
# Run this script to start the FastAPI backend
# Must be run from the Backend directory

$ErrorActionPreference = "Stop"

Write-Host "Starting ClarkPlayer Backend Server..." -ForegroundColor Cyan

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start uvicorn with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000