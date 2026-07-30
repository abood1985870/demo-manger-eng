import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== BEGINNING RE-TEST QA AUDIT ===");
  
  // 1. Fetch our test tenants and data
  const tenantA = await prisma.tenant.findFirst({ where: { domain: 'firma.com' } });
  const tenantB = await prisma.tenant.findFirst({ where: { domain: 'firmb.com' } });
  const userA = await prisma.user.findFirst({ where: { email: 'a@firma.com' } });
  const userB = await prisma.user.findFirst({ where: { email: 'b@firmb.com' } });

  if (!tenantA || !tenantB || !userA || !userB) {
    console.error("Test data not found.");
    return;
  }

  // Generate mock session cookie for User B (Attacker)
  const sessionDataB = JSON.stringify({ userId: userB.id, tenantId: tenantB.id, role: userB.role });
  const attackerCookie = `auth-session=${sessionDataB}`;

  console.log("\n[!] RE-TEST 1: Tenant Isolation Spoofing on /api/lawyer/clients (Attempting to fetch Firm A clients using Firm B cookie)");
  
  try {
    // Attempt to access Firm A's data while logged in as Firm B
    const res = await fetch(`http://localhost:3000/api/lawyer/clients?tenantId=${tenantA.id}`, {
      headers: {
        'Cookie': attackerCookie
      }
    });
    
    const data = await res.json() as any;
    
    // The server should IGNORE tenantA.id in the query, and only return Firm B's clients (which is empty)
    if (res.status === 200 && Array.isArray(data) && data.length === 0) {
       console.log("    => [PASS] Server successfully ignored the query spoofing and scoped data strictly to the Cookie's tenantId (Firm B).");
    } else if (data.length > 0 && data[0].name === 'Secret Client A') {
       console.log("    => [FAIL] Server leaked Firm A data!");
    } else {
       console.log("    => [UNEXPECTED] Status: " + res.status + " Data: " + JSON.stringify(data));
    }

  } catch (e: any) {
    console.log("    => Fetch failed. " + e.message);
  }

  // Re-Test Tasks API existence
  console.log("\n[!] RE-TEST 2: Check Tasks API");
  try {
    const res = await fetch(`http://localhost:3000/api/lawyer/tasks`);
    if (res.status === 404) {
      console.log("    => [FAIL] Missing API");
    } else {
      console.log("    => [PASS] API /api/lawyer/tasks now exists. Responded with status " + res.status); // Expect 401 Unauthorized since no cookie provided here
    }
  } catch(e) {}

  console.log("\n=== QA AUDIT COMPLETE ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
