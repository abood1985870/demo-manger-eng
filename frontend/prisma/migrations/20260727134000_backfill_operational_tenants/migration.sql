-- Backfill tenant ownership for operational records created before tenant columns
-- were introduced. The tenant is derived from the linked project.

UPDATE "Task"
SET
  "tenantId" = (
    SELECT "tenantId"
    FROM "Matter"
    WHERE "Matter"."id" = "Task"."matterId"
  ),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "tenantId" IS NULL
  AND "matterId" IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM "Matter"
    WHERE "Matter"."id" = "Task"."matterId"
  );

UPDATE "Hearing"
SET
  "tenantId" = (
    SELECT "tenantId"
    FROM "Matter"
    WHERE "Matter"."id" = "Hearing"."matterId"
  ),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "tenantId" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "Matter"
    WHERE "Matter"."id" = "Hearing"."matterId"
  );
