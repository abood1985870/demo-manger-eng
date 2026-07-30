-- CreateTable
CREATE TABLE "DevelopmentProjectProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "projectCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'PLANNING',
    "plannedStart" DATETIME,
    "plannedEnd" DATETIME,
    "projectValue" REAL NOT NULL DEFAULT 0,
    "budgetAtCompletion" REAL NOT NULL DEFAULT 0,
    "plannedValue" REAL NOT NULL DEFAULT 0,
    "earnedValue" REAL NOT NULL DEFAULT 0,
    "actualCost" REAL NOT NULL DEFAULT 0,
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "soldUnits" INTEGER NOT NULL DEFAULT 0,
    "collectedAmount" REAL NOT NULL DEFAULT 0,
    "offPlanStatus" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "buildingPermitStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "buildingCodeStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "occupancyStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DevelopmentProjectProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DevelopmentProjectProfile_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentProjectProfile_matterId_key" ON "DevelopmentProjectProfile"("matterId");

-- CreateIndex
CREATE INDEX "DevelopmentProjectProfile_tenantId_stage_idx" ON "DevelopmentProjectProfile"("tenantId", "stage");
