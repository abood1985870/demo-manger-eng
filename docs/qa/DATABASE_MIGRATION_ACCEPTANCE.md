# قبول قاعدة البيانات والهجرات

تاريخ التنفيذ: 2026-07-24

## النسخة الاحتياطية

تم أخذ نسخة احتياطية قبل تسجيل migration:

`frontend/prisma/dev_backup_before_migrations_20260724.db`

## Migration المنشأة

`20260724233000_initial_schema`

الملف: `frontend/prisma/migrations/20260724233000_initial_schema/migration.sql`

تم توليدها من `schema.prisma` الحالي وتشمل الجداول والعلاقات الحالية: Tenant وUser وClient وMatter وMatterTeam وMatterMessage وMatterMessageMention وNotification وHearing وTask وDocument وInvoice وContract، مع المفاتيح الخارجية والفهارس المعرفة في المخطط. `Matter.clientId` معرف كحقل اختياري.

## التحقق على قاعدة نظيفة

| الأمر | النتيجة |
|---|---|
| `prisma generate` | PASS |
| `DATABASE_URL=file:./qa-clean.db prisma migrate deploy` | PASS |
| `DATABASE_URL=file:./qa-clean.db prisma db seed` | PASS |
| `DATABASE_URL=file:./qa-clean.db prisma migrate status` | PASS |
| `npm run build` | PASS |

قاعدة الاختبار النظيفة: `frontend/prisma/qa-clean.db`.

## ملاحظات

- تم تحويل datasource إلى `env("DATABASE_URL")` كي تعمل قواعد الاختبار المنفصلة ولا يتم تثبيت التطبيق على `dev.db`.
- تم تعديل ترتيب تنظيف seed لحذف الإشارات والرسائل والإشعارات قبل القضايا، منعاً لفشل قيود المفاتيح الخارجية عند إعادة التشغيل.
- جدول audit logs غير موجود في المخطط الحالي ولم تتم إضافته، التزاماً بعدم إضافة ميزات أو بنية جديدة خارج المطلوب لإصلاح قبول الهجرات.
