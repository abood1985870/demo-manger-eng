# Case Collaboration Acceptance Report

## Latest Evidence

Date: 2026-07-25

Environment: `frontend`, QA SQLite database at `frontend/prisma/qa-clean.db`, server `http://127.0.0.1:3100`.

| Test ID | Feature | Account | Steps | Expected | Actual | Status | Evidence | Error | Fix | Retest |
|---|---|---|---|---|---|---|---|---|---|---|
| CHAT-01 | Create message | Firm A admin/member | Login, open matter, send message | One persisted message with author/time | E2E created and displayed message | PASS | `tests/e2e.spec.ts` | None | Existing chat flow | PASS |
| CHAT-02 | Mention | Firm A admin/member | Send message containing assigned lawyer mention | Mention is stored/displayed and request succeeds | POST returned 201 and mention rendered | PASS | `tests/e2e.spec.ts` | Notification row not independently asserted | Covered by endpoint implementation | PASS |
| CHAT-03 | Reply | Matter member | Reply to a specific message | `replyToMessageId` links to target | Not independently exercised in latest browser run | BLOCKED | No dedicated test | Coverage gap | Add targeted reply flow | NOT RUN |
| CHAT-04 | Owner edit window | Message owner | PATCH own fresh message | Edit succeeds within 15 minutes | Not independently exercised in latest browser run | BLOCKED | No dedicated test | Coverage gap | Add targeted edit flow | NOT RUN |
| CHAT-05 | Cross-company edit/delete | Secondary firm user | PATCH/DELETE Firm A message | Backend rejects request | Both requests returned 404 | PASS | `tests/security.spec.ts` | None | Existing matter access guard | PASS |
| CHAT-06 | Soft delete | Message owner | DELETE own message | `deletedAt` set; row retained | Not independently exercised in latest browser run | BLOCKED | No dedicated test | Coverage gap | Add targeted DB assertion | NOT RUN |
| CHAT-07 | Duplicate prevention | Matter member | Repeat same `clientRequestId` | One row only | Not independently exercised in latest browser run | BLOCKED | Schema/API support exists | Coverage gap | Add concurrent API test | NOT RUN |
| CASE-01 | Same-tenant active lawyer | Firm A lawyer | Create matter with assigned lawyer | Same-tenant active lawyer accepted | E2E creation passed; foreign lawyer rejected | PASS | `tests/e2e.spec.ts`, `tests/security.spec.ts` | None | Tenant validation | PASS |
| CASE-02 | Team membership | Firm A admin | Select multiple team members | Members saved and authorized | Not independently exercised in latest browser run | BLOCKED | No dedicated team mutation assertion | Coverage gap | Add team DB assertion | NOT RUN |
| CASE-03 | Optional client/person/entity | Firm A admin | Create external-party matter without client | `clientId` remains null | E2E external party matter passed | PASS | `tests/e2e.spec.ts`, schema | None | Optional relation and fields | PASS |
| SEC-01 | Matter/message tenant isolation | Secondary firm lawyer | Change matter/message IDs | Backend rejects access | 404 for matter/messages and message mutations | PASS | `tests/security.spec.ts` | None | Membership and tenant guards | PASS |
| SEC-02 | Spoofed lawyer/client IDs | Firm A lawyer | Submit IDs from Firm B | Backend rejects request | Both requests returned 400 | PASS | `tests/security.spec.ts` | None | Same-tenant validation | PASS |
| DB-01 | Schema/migrations | QA database | Validate and deploy migrations | Schema valid and migrations applied | `prisma validate` PASS; deploy reports no pending migrations | PASS | Prisma command output | None | Migration present | PASS |
| DB-02 | Referential integrity | QA database | Run foreign-key check | Zero violations | `foreignKeyViolations: 0` | PASS | `tests/db-integrity.cjs` | None | None | PASS |
| UI-01 | Login, RTL, desktop flow | Firm A admin | Browser login and matter/chat flow | No console-blocking UI failure | 5/5 Playwright tests passed on desktop | PASS | Playwright output | None | Stable selectors/setup | PASS |
| UI-02 | Mobile widths and full visual states | QA browser | 375/430/768/1366, loading/empty/error | All states verified | Not independently completed in latest run | BLOCKED | No complete viewport matrix | Coverage gap | Run viewport matrix on target server | NOT RUN |

## Latest Counts

- PASS: 11
- FAIL: 0
- BLOCKED: 6
- Playwright suite: 5 passed, 0 failed, 0 flaky retries.

The application is **CONDITIONALLY_PASS** for a controlled pilot, not a claim that every unimplemented screen or every manual viewport scenario is complete.
