const fs = require('fs');
const path = require('path');

function restoreBackup(backupFileName) {
  try {
    const backupDir = path.join(__dirname, '..', 'data', 'backups');
    const targetDbPath = path.join(__dirname, '..', 'dev.db');

    let sourceBackupPath = '';

    if (backupFileName) {
      sourceBackupPath = path.join(backupDir, backupFileName);
    } else {
      // Find latest backup if no file name provided
      if (!fs.existsSync(backupDir)) {
        console.error('Error: No backups directory found.');
        process.exit(1);
      }
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
      if (files.length === 0) {
        console.error('Error: No .db backup files found.');
        process.exit(1);
      }
      files.sort((a, b) => {
        const statA = fs.statSync(path.join(backupDir, a));
        const statB = fs.statSync(path.join(backupDir, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      });
      sourceBackupPath = path.join(backupDir, files[0]);
    }

    if (!fs.existsSync(sourceBackupPath)) {
      console.error(`Error: Backup file not found at ${sourceBackupPath}`);
      process.exit(1);
    }

    // Safety copy of current db before restoring
    if (fs.existsSync(targetDbPath)) {
      const preRestorePath = path.join(backupDir, `pre-restore-safety-${Date.now()}.db`);
      fs.copyFileSync(targetDbPath, preRestorePath);
      console.log(`ℹ Saved pre-restore safety copy: ${path.basename(preRestorePath)}`);
    }

    fs.copyFileSync(sourceBackupPath, targetDbPath);
    console.log(`✓ Database restored successfully from: ${path.basename(sourceBackupPath)}`);
  } catch (error) {
    console.error('Failed to restore backup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  const targetFile = process.argv[2];
  restoreBackup(targetFile);
}

module.exports = { restoreBackup };
