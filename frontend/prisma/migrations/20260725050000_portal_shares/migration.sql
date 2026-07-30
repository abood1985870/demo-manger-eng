CREATE TABLE "PortalShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "clientId" TEXT,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "lastAccessAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortalShare_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PortalShare_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PortalShare_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PortalShare_tokenHash_key" ON "PortalShare"("tokenHash");
CREATE INDEX "PortalShare_tenantId_createdAt_idx" ON "PortalShare"("tenantId", "createdAt");
CREATE INDEX "PortalShare_matterId_revokedAt_idx" ON "PortalShare"("matterId", "revokedAt");
CREATE INDEX "PortalShare_expiresAt_idx" ON "PortalShare"("expiresAt");
