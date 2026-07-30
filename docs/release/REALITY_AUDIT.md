# Reality Audit

## Scope

This audit describes the current repository, not an assumed Laravel or external backend. The running product is a Next.js 14 application using Prisma 5.14 and SQLite.

## Implemented And Verified

- Cookie-based JWT authentication with active-user validation.
- Scrypt password hashing with legacy-password upgrade on successful login.
- Tenant-scoped users, clients, matters, tasks, hearings, documents, contracts, invoices, notifications, and audit logs.
- Case membership checks for matter details and internal matter chat.
- Matter chat create, reply, edit-window, owner-only edit, soft delete, mentions, notification creation, idempotent client request IDs, and cross-tenant rejection.
- Optional `Matter.clientId` with external party fields and conversion to a client.
- Active same-tenant lawyer/team validation when creating or updating a matter.
- Audit log records for matter and message lifecycle changes.
- Production build and browser/API tests.
- Data-backed dashboard, litigation, compliance, knowledge, invoice document, and office-admin overview flows.

## Evidence

- `frontend/tests/startup.spec.ts`
- `frontend/tests/login.spec.ts`
- `frontend/tests/e2e.spec.ts`
- `frontend/tests/security.spec.ts`
- `frontend/tests/db-integrity.cjs`
- `docs/qa/CASE_COLLABORATION_ACCEPTANCE_REPORT.md`
- `docs/qa/FINAL_RETEST_REPORT.md`

## Still Partial Or Mocked

- Client portal management is still an internal sharing boundary; external client identity, invitation delivery, and portal authentication are not implemented.
- Invoice output is printable HTML, not a certified ZATCA e-invoice or signed QR payload.
- MFA is a UI step, not a real second-factor integration.
- Direct local filesystem uploads require object storage or a protected persistent volume for production.
- Docker image build and restore drills still need to run on the target server.
- `npm audit --omit=dev` still reports two high-severity advisories through the current Next 14 dependency line; a tested major upgrade is still required before handling real client data.
- MFA is not a real second-factor integration.
- Local filesystem uploads need object storage or a protected persistent volume for production.

## Deployment Boundary

The application can be handed to a technical operator for a controlled pilot. It must not be described as a fully finished enterprise platform until the client portal boundary, real MFA, certified invoicing, production storage, target-server Docker build, backups, HTTPS, and monitoring are completed.
