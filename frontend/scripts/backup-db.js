const fs = require('fs');
const path = require('path');

function createBackup() {
  try {
    const backupDir = path.join(__dirname, '..', 'data', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dbPath = path.join(__dirname, '..', 'dev.db');
    if (!fs.existsSync(dbPath)) {
      console.error('Error: dev.db file does not exist.');
      process.exit(1);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-db-${timestamp}.db`;
    const backupFilePath = path.join(backupDir, backupFileName);

    fs.copyFileSync(dbPath, backupFilePath);

    const stats = fs.statSync(backupFilePath);
    console.log(`✓ Backup created successfully: ${backupFileName} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    return backupFilePath;
  } catch (error) {
    console.error('Failed to create backup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  createBackup();
}

module.exports = { createBackup };
