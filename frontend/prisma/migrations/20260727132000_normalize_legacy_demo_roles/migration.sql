-- Normalize the exact legacy demo display names without touching real users.
UPDATE "User"
SET "name" = 'م. أحمد القحطاني — مدير مشروع', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'أحمد المحامي (العادي)';

UPDATE "User"
SET "name" = 'QA Secondary Project Manager', "updatedAt" = CURRENT_TIMESTAMP
WHERE "name" = 'QA Secondary Lawyer';
