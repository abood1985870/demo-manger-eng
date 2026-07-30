ALTER TABLE "User" ADD COLUMN "canCreateCase" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Matter" ADD COLUMN "beneficiaryAccountId" TEXT REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Matter_beneficiaryAccountId_idx" ON "Matter"("beneficiaryAccountId");
