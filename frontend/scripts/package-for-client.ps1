$ErrorActionPreference = "Stop"

$BuildDir = ".\client-release"
$ZipFile = ".\enterprise-legal-app-release.zip"

Write-Host "Creating client release package..."

# 1. Clean previous build
if (Test-Path $BuildDir) {
    Remove-Item -Recurse -Force $BuildDir
}
New-Item -ItemType Directory -Path $BuildDir | Out-Null

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
if (Test-Path "..\docker-compose.yml") { Copy-Item -Force "..\docker-compose.yml" "$BuildDir\" }
Copy-Item -Force ".\.env.production.example" "$BuildDir\.env"
Copy-Item -Force ".\run-production.cmd" "$BuildDir\"
Copy-Item -Recurse -Force ".\scripts" "$BuildDir\scripts"

# Remove test/qa scripts from release
if (Test-Path "$BuildDir\scripts\migrate-passwords.ts") { Remove-Item "$BuildDir\scripts\migrate-passwords.ts" -Force }

# Create a setup script for the client's server
$SetupScript = @"
@echo off
echo ==============================================
echo Installing Enterprise Legal App for Client
echo ==============================================
echo.
echo 1. Installing production dependencies (Prisma)...
call npm install prisma @prisma/client --no-save

echo.
echo 2. Applying Database Migrations (PostgreSQL)...
call npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma

echo.
echo 3. Installation complete.
echo You can now start the system by running: run-production.cmd
pause
"@

Set-Content -Path "$BuildDir\setup.cmd" -Value $SetupScript -Encoding UTF8

Write-Host "Zipping the release package..."
if (Test-Path $ZipFile) {
    Remove-Item -Force $ZipFile
}
Compress-Archive -Path "$BuildDir\*" -DestinationPath $ZipFile -Force

Write-Host "Done! The client installation file is ready at: $ZipFile" -ForegroundColor Green
Write-Host "You can send '$ZipFile' to the client server and run 'setup.cmd' after extracting."
