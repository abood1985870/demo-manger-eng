-- Convert only the two known legacy demo records from the original legal seed.
-- User-created records and any differently named records are intentionally untouched.
INSERT INTO "DevelopmentProjectProfile" (
    "id", "tenantId", "matterId", "projectCode", "city", "region", "stage",
    "plannedStart", "plannedEnd", "projectValue", "budgetAtCompletion",
    "plannedValue", "earnedValue", "actualCost", "totalUnits", "soldUnits",
    "collectedAmount", "offPlanStatus", "buildingPermitStatus",
    "buildingCodeStatus", "occupancyStatus", "createdAt", "updatedAt"
)
SELECT
    'rusukh-profile-' || "id", "tenantId", "id", 'RUS-001', 'الرياض', 'منطقة الرياض', 'STRUCTURE',
    '2025-01-01 00:00:00', '2027-06-30 00:00:00', 380000000, 300000000,
    150000000, 144000000, 141000000, 420, 278,
    165000000, 'APPROVED', 'APPROVED', 'COMPLIANT', 'NOT_STARTED',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Matter"
WHERE "title" = 'استئناف حكم عمالي'
  AND NOT EXISTS (
    SELECT 1 FROM "DevelopmentProjectProfile" p WHERE p."matterId" = "Matter"."id"
  );

INSERT INTO "DevelopmentProjectProfile" (
    "id", "tenantId", "matterId", "projectCode", "city", "region", "stage",
    "plannedStart", "plannedEnd", "projectValue", "budgetAtCompletion",
    "plannedValue", "earnedValue", "actualCost", "totalUnits", "soldUnits",
    "collectedAmount", "offPlanStatus", "buildingPermitStatus",
    "buildingCodeStatus", "occupancyStatus", "createdAt", "updatedAt"
)
SELECT
    'rusukh-profile-' || "id", "tenantId", "id", 'RUS-002', 'جدة', 'منطقة مكة المكرمة', 'DESIGN',
    '2025-09-01 00:00:00', '2028-03-31 00:00:00', 210000000, 165000000,
    65000000, 52000000, 58000000, 190, 90,
    48000000, 'IN_REVIEW', 'APPROVED', 'IN_REVIEW', 'NOT_STARTED',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Matter"
WHERE "title" = 'قضية تعويض تجاري ضد شركة المقاولات'
  AND NOT EXISTS (
    SELECT 1 FROM "DevelopmentProjectProfile" p WHERE p."matterId" = "Matter"."id"
  );

UPDATE "Matter"
SET "title" = 'مشروع واحة النخيل السكني', "caseNumber" = 'RUS-001', "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'استئناف حكم عمالي';

UPDATE "Matter"
SET "title" = 'مجمع أفق الأعمال', "caseNumber" = 'RUS-002', "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'قضية تعويض تجاري ضد شركة المقاولات';
