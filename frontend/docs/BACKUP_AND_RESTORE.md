# دليل النسخ الاحتياطي والاستعادة (Backup & Restore Guide)

يقدم هذا المستند توثيقاً لكيفية إنشاء واستعادة النسخ الاحتياطية لنظام إدارة المحاماة.

---

## 1. النسخ الاحتياطي لقواعد البيانات المحلية (SQLite Development & Standalone)

### النسخ الاحتياطي التلقائي أو من الواجهة:
- يمكن لمدير المكتب / الأدمن الضغط على زر **"إنشاء نسخة احتياطية الآن"** من صفحة **صحة النظام** (`/admin/health`).
- يتم حفظ النسخ الاحتياطية في المجلد: `data/backups/backup-db-[TIMESTAMP].db`.

### النسخ الاحتياطي من السطر البرمجي:
```bash
node scripts/backup-db.js
```

### الاستعادة (Restore):
```bash
# استعادة أحدث نسخة احتياطية تلقائياً
node scripts/restore-db.js

# أو استعادة ملف نسخة احتياطية مسمى محدد
node scripts/restore-db.js backup-db-2026-07-26T00-56-27-833Z.db
```

---

## 2. النسخ الاحتياطي للإنتاج (PostgreSQL Production Infrastructure)

عند الانتقال لبيئة الإنتاج بعمارة PostgreSQL:

### النسخ الاحتياطي (Backup Dump):
```bash
pg_dump -U username -h localhost -d law_firm_db -F c -b -v -f "data/backups/postgres-dump-$(date +%Y%m%d%H%M%S).dump"
```

### الاستعادة (Restore Dump):
```bash
pg_restore -U username -h localhost -d law_firm_db -v "data/backups/postgres-dump-[TIMESTAMP].dump"
```

---

## 3. النسخ الاحتياطي لمجلد المستندات المرفقة (File Uploads Storage)

### النسخ الاحتياطي لمجلد المستندات:
```bash
tar -czvf data/backups/uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

### استعادة مجلد المستندات:
```bash
tar -xzvf data/backups/uploads-backup-[DATE].tar.gz -C ./
```
