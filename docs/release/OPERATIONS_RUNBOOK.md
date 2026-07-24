# Operations Runbook

## 1. High CPU / API Latency
- Check DB Locks: `SELECT * FROM pg_stat_activity WHERE wait_event_type = 'Lock';`
- Check Redis memory usage.
- Scale backend containers if CPU bound.

## 2. External Provider Outage (ZATCA/Nafath)
- System is designed to handle this via the `Foundation` fallback.
- Invoices will queue or require manual review.
- Do NOT bypass compliance or billing requirements with mock responses.

## 3. Suspected Data Leak / Secret Compromise
1. Rotate `APP_KEY` (Logs out all users).
2. Rotate AWS S3 Credentials.
3. Rotate Database Passwords.
4. Review `audit_logs` table for enumeration attacks.
