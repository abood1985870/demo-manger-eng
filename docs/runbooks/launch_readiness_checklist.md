# Launch Readiness Checklist (STEP L8)

Prior to flipping the DNS to Production, all items below MUST be verified.

## 1. Security & Environments
- [ ] Debug mode is disabled (`APP_DEBUG=false`, `NEXT_TELEMETRY_DISABLED=1`).
- [ ] No mock providers are active. All external configs (Nafath, Sanctions, ZATCA) point to real production endpoints.
- [ ] Database passwords and encryption keys are strong and NOT default.
- [ ] CSP (Content Security Policy) Headers are strictly enforced on Next.js.
- [ ] HTTPS/TLS is enforced at the Load Balancer level. HSTS is active.

## 2. Operations & Backups
- [ ] Database backup cron job is confirmed active and writing to secure remote storage.
- [ ] Log rotation is active (preventing disk space exhaustion).
- [ ] Monitoring agents (DataDog/NewRelic) are reporting metrics.

## 3. Application State
- [ ] Default Super Admin password has been changed.
- [ ] Seed data (Test Clients, Test Matters) has been wiped. Only core lookup tables (Countries, Currencies) remain.
- [ ] Rate limits are active on all public and authentication routes.
