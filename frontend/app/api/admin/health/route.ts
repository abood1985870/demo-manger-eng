import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { privateUploadsDirectory } from '@/lib/document-storage';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
    }

    // Role check: Admin / Owner / Superadmin only
    const isManager = hasPermission(session.role, ['ADMIN', 'OWNER', 'SUPERADMIN']);
    if (!isManager) {
      return NextResponse.json({ error: 'غير مصرح لك باستعراض صحة النظام والنسخ الاحتياطية' }, { status: 403 });
    }

    // 1. Database Connection Check
    let databaseConnected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch (e) {
      databaseConnected = false;
    }

    // 2. Entity Counts
    const [mattersCount, clientsCount, usersCount, documentsCount] = await Promise.all([
      prisma.matter.count(),
      prisma.client.count(),
      prisma.user.count(),
      prisma.document.count(),
    ]);

    // 3. Storage Folder Check
    const storagePath = privateUploadsDirectory();
    let storageExists = false;
    let storageSizeBytes = 0;

    if (fs.existsSync(storagePath)) {
      storageExists = true;
      try {
        const files = fs.readdirSync(storagePath);
        for (const file of files) {
          const stats = fs.statSync(path.join(storagePath, file));
          storageSizeBytes += stats.size;
        }
      } catch (e) {
        console.error('Error calculating storage size:', e);
      }
    }

    // 4. Latest Backup File Check
    const backupDir = path.join(process.cwd(), 'data', 'backups');
    let latestBackup: any = null;

    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db') || f.endsWith('.zip') || f.endsWith('.json'));
      if (files.length > 0) {
        files.sort((a, b) => {
          const statA = fs.statSync(path.join(backupDir, a));
          const statB = fs.statSync(path.join(backupDir, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        });

        const topFile = files[0];
        const topStat = fs.statSync(path.join(backupDir, topFile));
        latestBackup = {
          fileName: topFile,
          sizeBytes: topStat.size,
          sizeFormatted: `${(topStat.size / (1024 * 1024)).toFixed(2)} MB`,
          createdAt: topStat.mtime.toISOString(),
        };
      }
    }

    // 5. Safe Environment Variables Checks (Check if set WITHOUT exposing secret string values)
    const envStatus = {
      DATABASE_URL: { isSet: Boolean(process.env.DATABASE_URL) },
      JWT_SECRET: { isSet: Boolean(process.env.JWT_SECRET) },
      DOCUMENT_STORAGE_PATH: { isSet: Boolean(process.env.DOCUMENT_STORAGE_PATH) },
      NODE_ENV: { value: process.env.NODE_ENV || 'development' },
    };

    return NextResponse.json({
      databaseConnected,
      entityCounts: {
        mattersCount,
        clientsCount,
        usersCount,
        documentsCount,
      },
      storage: {
        path: storagePath,
        exists: storageExists,
        sizeBytes: storageSizeBytes,
        sizeFormatted: `${(storageSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
      },
      latestBackup,
      envStatus,
    });

  } catch (error: any) {
    console.error('Error fetching system health:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء فحص صحة النظام.' }, { status: 500 });
  }
}
