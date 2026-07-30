$ErrorActionPreference = "Stop"

$BuildDir = ".\easy-release"
$ZipFile = ".\enterprise-legal-app-release.zip"

Write-Host "Creating Easy One-Click client release package..."

# 1. Clean previous build
# if (Test-Path $BuildDir) {
#     Remove-Item -Recurse -Force $BuildDir
# }
if (-not (Test-Path $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
}

# 2. Ensure standalone build exists
if (-not (Test-Path ".\.next\standalone")) {
    Write-Host "Error: .next\standalone not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# 3. Copy files to release directory
Write-Host "Copying files to release directory..."
Copy-Item -Recurse -Force ".\.next\standalone\*" $BuildDir
Copy-Item -Recurse -Force ".\.next\static" "$BuildDir\.next\static"
if (Test-Path ".\public") { Copy-Item -Recurse -Force ".\public" "$BuildDir\public" }
Copy-Item -Recurse -Force ".\prisma" "$BuildDir\prisma"
Copy-Item -Recurse -Force ".\scripts" "$BuildDir\scripts"

# Remove test/qa scripts from release
if (Test-Path "$BuildDir\scripts\migrate-passwords.ts") { Remove-Item "$BuildDir\scripts\migrate-passwords.ts" -Force }

# 4. Create the One-Click Start script
$StartScript = @"
@echo off
title Law Firm System - Launcher
color 0A

echo ===================================================
echo Initializing System... Please wait
echo ===================================================
echo.

if exist ".env" goto skip_env
echo [1/3] Creating configuration file...
echo DATABASE_URL="file:./database.sqlite" > .env
echo JWT_SECRET="production-secret-key-123456789" >> .env
goto done_env
:skip_env
echo [1/3] Configuration file exists.
:done_env

if exist "node_modules\@prisma" goto skip_prisma
echo [2/3] Installing database engine (First time only)...
call npm install prisma @prisma/client --no-save >nul 2>&1
goto done_prisma
:skip_prisma
echo [2/3] Database engine is ready.
:done_prisma

echo [3/4] Preparing and verifying database...
call npx prisma migrate deploy --schema=prisma/schema.prisma >nul 2>&1

echo [4/4] Configuring admin accounts...
node scripts/setup-admin.js >nul 2>&1

echo.
echo ===================================================
echo System is running successfully!
echo To access the system, open your browser and go to:
echo http://localhost:3100
echo.
echo **IMPORTANT:** DO NOT close this black window while using the system.
echo ===================================================
echo.

set PORT=3100
set HOSTNAME=127.0.0.1
node server.js

pause
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$BuildDir\Start_System.bat", $StartScript, $utf8NoBom)

# 5. Create Hidden Runner (VBS)
$VbsScript = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "Start_System.bat" & Chr(34), 0
Set WshShell = Nothing
"@
[System.IO.File]::WriteAllText("$BuildDir\Run_Hidden.vbs", $VbsScript, $utf8NoBom)

Write-Host "Zipping the release package..."
if (Test-Path $ZipFile) {
    Remove-Item -Force $ZipFile
}
Compress-Archive -Path "$BuildDir\*" -DestinationPath $ZipFile -Force

Write-Host "Done! The EASY installation file is ready at: $ZipFile" -ForegroundColor Green
