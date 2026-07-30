-- Remove only known seed records whose referenced files were never shipped.
-- Real uploads use private: storage keys and are intentionally untouched.

DELETE FROM "Document"
WHERE "fileUrl" IN (
  '/uploads/lawsuit_base.pdf',
  '/uploads/evidence.docx',
  '/uploads/master-plan-approval.pdf',
  '/uploads/progress-report.docx'
);
