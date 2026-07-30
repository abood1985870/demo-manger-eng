-- CreateTable
CREATE TABLE "MatterStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matterId" TEXT NOT NULL,
    "oldStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatterStatusHistory_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseFolder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaseFolder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatterImportDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "sourceDocumentId" TEXT,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "extractedData" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "confirmedAt" DATETIME,
    "confirmedById" TEXT,
    CONSTRAINT "MatterImportDraft_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterImportDraft_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterImportDraft_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "practiceArea" TEXT NOT NULL DEFAULT 'GENERAL',
    "templateType" TEXT NOT NULL DEFAULT 'GENERAL',
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentTemplate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatterConflictCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "matterId" TEXT,
    "checkedName" TEXT NOT NULL,
    "matchedEntityType" TEXT NOT NULL,
    "matchedEntityId" TEXT,
    "riskLevel" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "acknowledgedById" TEXT,
    "acknowledgedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatterConflictCheck_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterConflictCheck_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MatterConflictCheck_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatterParty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matterId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partyType" TEXT NOT NULL DEFAULT 'PERSON',
    "role" TEXT NOT NULL DEFAULT 'THIRD_PARTY',
    "nationalIdOrCr" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatterParty_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterParty_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatterDeadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matterId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deadlineType" TEXT NOT NULL DEFAULT 'SUBMISSION_DEADLINE',
    "dueDate" DATETIME NOT NULL,
    "reminderDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatterDeadline_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterDeadline_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterDeadline_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatterDeadline_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatterFeeAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matterId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "totalFee" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatterFeeAgreement_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterFeeAgreement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatterPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matterId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "reference" TEXT,
    "notes" TEXT,
    "receivedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatterPayment_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterPayment_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatterAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matterId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessRole" TEXT NOT NULL DEFAULT 'ASSIGNED_LAWYER',
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canManageDocuments" BOOLEAN NOT NULL DEFAULT true,
    "canManageTasks" BOOLEAN NOT NULL DEFAULT true,
    "canManageHearings" BOOLEAN NOT NULL DEFAULT true,
    "canViewFinancials" BOOLEAN NOT NULL DEFAULT false,
    "canManageFinancials" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatterAccess_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterAccess_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterAccess_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_FolderViewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FolderViewers_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseFolder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FolderViewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hearing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "matterId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'HEARING',
    "title" TEXT,
    "date" DATETIME NOT NULL,
    "court" TEXT NOT NULL,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hearing_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Hearing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Hearing" ("court", "createdAt", "date", "id", "matterId", "status", "summary", "updatedAt") SELECT "court", "createdAt", "date", "id", "matterId", "status", "summary", "updatedAt" FROM "Hearing";
DROP TABLE "Hearing";
ALTER TABLE "new_Hearing" RENAME TO "Hearing";
CREATE INDEX "Hearing_matterId_date_idx" ON "Hearing"("matterId", "date");
CREATE INDEX "Hearing_tenantId_date_idx" ON "Hearing"("tenantId", "date");
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
    "subscriptionEndDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tenant" ("createdAt", "domain", "id", "name", "updatedAt") SELECT "createdAt", "domain", "id", "name", "updatedAt" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE TABLE "new_Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Contract" ("clientId", "content", "createdAt", "id", "status", "tenantId", "title", "updatedAt") SELECT "clientId", "content", "createdAt", "id", "status", "tenantId", "title", "updatedAt" FROM "Contract";
DROP TABLE "Contract";
ALTER TABLE "new_Contract" RENAME TO "Contract";
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "matterId" TEXT,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("createdAt", "dueDate", "id", "isDone", "isUrgent", "matterId", "title", "updatedAt", "userId") SELECT "createdAt", "dueDate", "id", "isDone", "isUrgent", "matterId", "title", "updatedAt", "userId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_matterId_idx" ON "Task"("matterId");
CREATE INDEX "Task_tenantId_status_idx" ON "Task"("tenantId", "status");
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "createdAt", "entityId", "entityType", "id", "metadata", "tenantId", "userId") SELECT "action", "createdAt", "entityId", "entityType", "id", "metadata", "tenantId", "userId" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");
CREATE INDEX "AuditLog_tenantId_entityType_entityId_idx" ON "AuditLog"("tenantId", "entityType", "entityId");
CREATE TABLE "new_Matter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT,
    "beneficiaryAccountId" TEXT,
    "title" TEXT NOT NULL,
    "caseNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "statusUpdatedAt" DATETIME,
    "statusUpdatedById" TEXT,
    "lawyerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "folderId" TEXT,
    "externalPartyName" TEXT,
    "externalPartyType" TEXT,
    "externalPartyPhone" TEXT,
    "externalPartyEmail" TEXT,
    "externalPartyNotes" TEXT,
    "notes" TEXT,
    "dueDate" DATETIME,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "archivedById" TEXT,
    "archiveReason" TEXT,
    CONSTRAINT "Matter_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Matter_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Matter_beneficiaryAccountId_fkey" FOREIGN KEY ("beneficiaryAccountId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Matter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Matter_statusUpdatedById_fkey" FOREIGN KEY ("statusUpdatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Matter_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "CaseFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Matter_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Matter" ("beneficiaryAccountId", "caseNumber", "clientId", "createdAt", "externalPartyEmail", "externalPartyName", "externalPartyNotes", "externalPartyPhone", "externalPartyType", "id", "lawyerId", "notes", "status", "tenantId", "title", "updatedAt") SELECT "beneficiaryAccountId", "caseNumber", "clientId", "createdAt", "externalPartyEmail", "externalPartyName", "externalPartyNotes", "externalPartyPhone", "externalPartyType", "id", "lawyerId", "notes", "status", "tenantId", "title", "updatedAt" FROM "Matter";
DROP TABLE "Matter";
ALTER TABLE "new_Matter" RENAME TO "Matter";
CREATE INDEX "Matter_tenantId_lawyerId_idx" ON "Matter"("tenantId", "lawyerId");
PRAGMA foreign_key_check("Hearing");
PRAGMA foreign_key_check("Tenant");
PRAGMA foreign_key_check("Contract");
PRAGMA foreign_key_check("Task");
PRAGMA foreign_key_check("AuditLog");
PRAGMA foreign_key_check("Matter");
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "MatterStatusHistory_matterId_createdAt_idx" ON "MatterStatusHistory"("matterId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseFolder_tenantId_idx" ON "CaseFolder"("tenantId");

-- CreateIndex
CREATE INDEX "MatterImportDraft_tenantId_status_idx" ON "MatterImportDraft"("tenantId", "status");

-- CreateIndex
CREATE INDEX "MatterImportDraft_uploadedById_idx" ON "MatterImportDraft"("uploadedById");

-- CreateIndex
CREATE INDEX "DocumentTemplate_tenantId_category_idx" ON "DocumentTemplate"("tenantId", "category");

-- CreateIndex
CREATE INDEX "DocumentTemplate_tenantId_practiceArea_isActive_idx" ON "DocumentTemplate"("tenantId", "practiceArea", "isActive");

-- CreateIndex
CREATE INDEX "MatterConflictCheck_tenantId_checkedName_idx" ON "MatterConflictCheck"("tenantId", "checkedName");

-- CreateIndex
CREATE INDEX "MatterParty_matterId_idx" ON "MatterParty"("matterId");

-- CreateIndex
CREATE INDEX "MatterParty_tenantId_name_idx" ON "MatterParty"("tenantId", "name");

-- CreateIndex
CREATE INDEX "MatterDeadline_matterId_dueDate_idx" ON "MatterDeadline"("matterId", "dueDate");

-- CreateIndex
CREATE INDEX "MatterDeadline_tenantId_status_idx" ON "MatterDeadline"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MatterFeeAgreement_matterId_key" ON "MatterFeeAgreement"("matterId");

-- CreateIndex
CREATE INDEX "MatterFeeAgreement_tenantId_paymentStatus_idx" ON "MatterFeeAgreement"("tenantId", "paymentStatus");

-- CreateIndex
CREATE INDEX "MatterPayment_matterId_idx" ON "MatterPayment"("matterId");

-- CreateIndex
CREATE INDEX "MatterPayment_tenantId_idx" ON "MatterPayment"("tenantId");

-- CreateIndex
CREATE INDEX "MatterAccess_tenantId_userId_idx" ON "MatterAccess"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MatterAccess_matterId_userId_key" ON "MatterAccess"("matterId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_FolderViewers_AB_unique" ON "_FolderViewers"("A", "B");

-- CreateIndex
CREATE INDEX "_FolderViewers_B_index" ON "_FolderViewers"("B");
