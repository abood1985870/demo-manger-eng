param (
    [string]$DbUrl = $env:DATABASE_URL,
    [string]$BackupDir = ".\backups",
    [string]$UploadsDir = $env:DOCUMENT_STORAGE_PATH
)

if (-not $DbUrl) {
    Write-Host "DATABASE_URL environment variable is not set." -ForegroundColor Red
    exit 1
}

if (-not $UploadsDir) {
    $UploadsDir = ".\data\uploads"
}

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$DbBackupFile = Join-Path $BackupDir "db_backup_$Timestamp.sql"
$UploadsBackupFile = Join-Path $BackupDir "uploads_backup_$Timestamp.zip"

Write-Host "Starting backup..."

# 1. Backup PostgreSQL Database
Write-Host "Backing up database to $DbBackupFile..."
pg_dump --dbname=$DbUrl -f $DbBackupFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database backup failed." -ForegroundColor Red
    exit 1
}

# 2. Backup Uploads Directory
if (Test-Path $UploadsDir) {
    Write-Host "Compressing uploads directory to $UploadsBackupFile..."
    Compress-Archive -Path "$UploadsDir\*" -DestinationPath $UploadsBackupFile -Force
    if ($?) {
        Write-Host "Uploads backup successful."
    } else {
        Write-Host "Uploads backup failed." -ForegroundColor Red
    }
} else {
    Write-Host "Uploads directory not found at $UploadsDir. Skipping." -ForegroundColor Yellow
}

Write-Host "Backup completed successfully!" -ForegroundColor Green
