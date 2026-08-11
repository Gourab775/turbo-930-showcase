@echo off
echo ============================================
echo   TURBO 930 — Local Server
echo ============================================
echo.
echo   Main site:    http://localhost:8000
echo   No-3D ver:    http://localhost:8000/no-3d/
echo.
echo   Press Ctrl+C to stop
echo ============================================
echo.
python -m http.server 8000
