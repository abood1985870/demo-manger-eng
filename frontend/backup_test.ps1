# Backup and Restore Simulation Script for SQLite

$dbPath = "prisma\dev.db"
$backupPath = "prisma\dev_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"

Write-Host "=== Starting Backup Process ==="
if (Test-Path $dbPath) {
    Copy-Item $dbPath -Destination $backupPath
    Write-Host "[PASS] Database backed up to $backupPath"
} else {
    Write-Host "[FAIL] Source database not found."
    exit 1
}

Write-Host "`n=== Simulating Disaster (Deleting original DB) ==="
Remove-Item $dbPath -Force
Write-Host "Original DB deleted."

Write-Host "`n=== Starting Restore Process ==="
Copy-Item $backupPath -Destination $dbPath
Write-Host "[PASS] Database restored from $backupPath"

Write-Host "`n=== Verification ==="
# Run a quick check using Prisma
npx prisma db pull
if ($LASTEXITCODE -eq 0) {
    Write-Host "[PASS] Prisma successfully connected to restored database."
} else {
    Write-Host "[FAIL] Prisma failed to connect to restored database."
}
