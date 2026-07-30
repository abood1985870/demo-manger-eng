CREATE TABLE "DevelopmentProjectProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "projectCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'PLANNING',
    "plannedStart" TIMESTAMP(3),
    "plannedEnd" TIMESTAMP(3),
    "projectValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetAtCompletion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plannedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "earnedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "soldUnits" INTEGER NOT NULL DEFAULT 0,
    "collectedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "offPlanStatus" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "buildingPermitStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "buildingCodeStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "occupancyStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DevelopmentProjectProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DevelopmentProjectProfile_matterId_key" ON "DevelopmentProjectProfile"("matterId");
CREATE INDEX "DevelopmentProjectProfile_tenantId_stage_idx" ON "DevelopmentProjectProfile"("tenantId", "stage");

ALTER TABLE "DevelopmentProjectProfile" ADD CONSTRAINT "DevelopmentProjectProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentProjectProfile" ADD CONSTRAINT "DevelopmentProjectProfile_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
