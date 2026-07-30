param (
    [string]$DbUrl = $env:DATABASE_URL,
    [string]$DbBackupFile,
    [string]$UploadsBackupFile,
    [string]$UploadsDir = $env:DOCUMENT_STORAGE_PATH
)

if (-not $DbUrl) {
    Write-Host "DATABASE_URL environment variable is not set." -ForegroundColor Red
    exit 1
}

if (-not $UploadsDir) {
    $UploadsDir = ".\data\uploads"
}

if (-not $DbBackupFile -and -not $UploadsBackupFile) {
    Write-Host "You must provide either -DbBackupFile or -UploadsBackupFile." -ForegroundColor Red
    exit 1
}

Write-Host "Starting restore..."

# 1. Restore PostgreSQL Database
if ($DbBackupFile) {
    if (-not (Test-Path $DbBackupFile)) {
        Write-Host "Database backup file not found: $DbBackupFile" -ForegroundColor Red
        exit 1
    }
    Write-Host "Restoring database from $DbBackupFile..."
    # Note: Using psql because pg_dump plain text output is executed via psql
    psql --dbname=$DbUrl -f $DbBackupFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Database restore failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "Database restore successful."
}

# 2. Restore Uploads Directory
if ($UploadsBackupFile) {
    if (-not (Test-Path $UploadsBackupFile)) {
        Write-Host "Uploads backup file not found: $UploadsBackupFile" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path $UploadsDir)) {
        New-Item -ItemType Directory -Path $UploadsDir | Out-Null
    }

    Write-Host "Extracting uploads to $UploadsDir..."
    Expand-Archive -Path $UploadsBackupFile -DestinationPath $UploadsDir -Force
    if ($?) {
        Write-Host "Uploads restore successful."
    } else {
        Write-Host "Uploads restore failed." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Restore completed successfully!" -ForegroundColor Green
