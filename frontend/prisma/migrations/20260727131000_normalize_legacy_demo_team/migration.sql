-- Rename only the known legacy demo account; user-created names remain untouched.
UPDATE "User"
SET "name" = 'أحمد القحطاني — مدير مشروع', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'أحمد المحامي';
