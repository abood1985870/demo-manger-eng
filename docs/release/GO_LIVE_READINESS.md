# Go-Live Readiness

## Current Decision

**CONDITIONALLY_READY_FOR_CONTROLLED_PILOT**

The current Next.js and Prisma application builds successfully, starts locally, serves the login page, and passes the browser and API acceptance suite. It is suitable for a controlled pilot after the deployment owner completes the operational gates below.

## Verified Evidence

- Production build: PASS.
- Prisma schema validation: PASS.
- Prisma migrations: three migrations present and `prisma migrate deploy` reports no pending migrations on the QA database.
- Browser/API suite: 7 passed, 0 failed, 0 blocked.
- Cross-tenant security test: PASS.
- SQLite foreign-key check: 0 violations.
- QA server: `next start` reaches Ready on port 3100 and `/login` returns HTTP 200.
- Health endpoint: `/api/health` returns `{ "status": "ok", "database": "ok" }`.

## Required Before Client Data

- Upgrade Next.js beyond the current 14.x line and rerun the full build/security suite; `npm audit --omit=dev` still reports two high-severity advisories in the current dependency tree.
- Set a unique long `JWT_SECRET` outside source control.
- Use an absolute production `DATABASE_URL`; never use `dev.db`, `qa-clean.db`, or the demo seed in production.
- Run migrations against a backup of the production database.
- Put the service behind HTTPS and a reverse proxy.
- Configure persistent database, uploads, backups, log retention, and monitoring.
- Create a real owner account and remove demo accounts before onboarding users.
- Prefer PostgreSQL for multiple offices or high concurrent usage; SQLite is suitable only for a controlled single-instance pilot.
- Execute the deployment smoke checklist on the target server.

## Known Product Limits

- The client portal management screen still needs a real external client identity/invitation flow; it is not being treated as production-ready.
- Dashboard export produces CSV from live data, while invoice saving currently opens a printable HTML document rather than a signed ZATCA e-invoice.
- MFA is currently a UI step; it is not backed by a real authenticator provider.
- Docker image build was not executed on the development host because Docker is not installed there.
