@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo.
  echo [SCHEMA BUREAU] Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo [SCHEMA BUREAU] npm install failed. Check Node.js and internet access.
    pause
    exit /b 1
  )
)
echo.
echo [SCHEMA BUREAU] Starting Relational Systems Lab...
call npm run dev
pause
