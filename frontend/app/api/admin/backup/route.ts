import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit-logger';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    // Role check: Admin / Owner / Superadmin only
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    if (!isManager) {
      return NextResponse.json({ error: 'غير مصرح لك بإنشاء نسخ احتياطية للنظام' }, { status: 403 });
    }

    const backupDir = path.join(process.cwd(), 'data', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dbPath = path.join(process.cwd(), 'dev.db');
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'ملف قاعدة البيانات الرئيسي غير موجود' }, { status: 404 });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-db-${timestamp}.db`;
    const backupFilePath = path.join(backupDir, backupFileName);

    fs.copyFileSync(dbPath, backupFilePath);

    const stat = fs.statSync(backupFilePath);

    // Audit Log
    await logAudit({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'SYSTEM_BACKUP_CREATE',
      entityType: 'SystemBackup',
      entityId: backupFileName,
      metadata: { fileName: backupFileName, sizeBytes: stat.size },
      req: request,
    });

    return NextResponse.json({
      success: true,
      backup: {
        fileName: backupFileName,
        sizeBytes: stat.size,
        sizeFormatted: `${(stat.size / (1024 * 1024)).toFixed(2)} MB`,
        createdAt: stat.mtime.toISOString(),
      },
      message: 'تم إنشاء النسخة الاحتياطية بنجاح'
    });

  } catch (error: any) {
    console.error('Error creating database backup:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء النسخة الاحتياطية.' }, { status: 500 });
  }
}
