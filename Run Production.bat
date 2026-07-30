@echo off
setlocal
cd /d "%~dp0frontend"
title Rusukh - Real Estate Development Platform

if not exist "node_modules\.bin\prisma.cmd" (
  echo Installing Rusukh dependencies for the first run...
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed. Confirm that Node.js and internet access are available.
    pause
    exit /b 1
  )
)

echo Applying database migrations...
call npx --no-install prisma migrate deploy
if errorlevel 1 (
  echo Database migration failed. Review the error above.
  pause
  exit /b 1
)

echo Ensuring the permanent demo workspace...
call node scripts\ensure-demo-data.cjs
if errorlevel 1 (
  echo Demo workspace setup failed. Review the error above.
  pause
  exit /b 1
)

if not exist ".next\standalone\server.js" (
  echo Production build is missing. Building Rusukh now...
  call npm run build
  if errorlevel 1 (
    echo Build failed. Review the errors above.
    pause
    exit /b 1
  )
)

call run-production.cmd
endlocal
