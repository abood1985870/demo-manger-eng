# Incident Response & Outage Handling

## 1. Provider Outage (e.g. ZATCA or Nafath goes down)
**Symptoms**: Users report failure to generate e-invoices, or external clients cannot authenticate.
**Immediate Action**: 
- The system handles this gracefully. Do NOT mock a success response.
- Update the system status page.
- Inform users that actions requiring external validation are temporarily queued or disabled.
- The `ProviderHealthCheck` job will automatically alert when the service returns.

## 2. Database CPU Spike (100%)
**Symptoms**: API latency > 5000ms. Timeout errors on frontend.
**Immediate Action**:
- Identify the query causing the spike using `pg_stat_statements`.
- If caused by a heavy reporting export, kill the specific query process (`pg_cancel_backend()`).
- Temporarily disable the Analytics Module via Feature Flags if necessary to restore core service (Client Intake / Matters).

## 3. Secret Leakage Suspected
**Symptoms**: Suspicious activity on provider accounts (e.g., unexpected SMS charges, unexpected API usage).
**Immediate Action**:
- Immediately rotate the affected Provider Key in HashiCorp Vault / `.env`.
- Cycle the `APP_KEY`. Note: This will invalidate all active user sessions requiring them to re-login.
- Review Audit Logs for any unauthorized data access.
