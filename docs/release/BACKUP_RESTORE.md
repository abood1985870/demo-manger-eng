# Backup & Restore Procedures

## Backups
- **Database**: Automated `pg_dump` every 6 hours via cron. Sent to `s3://ewos-backups/pg_dumps/`.
- **Files**: Legal documents stored in S3 with Versioning ENABLED. Cross-Region Replication (CRR) recommended.

## Restores
To perform a point-in-time recovery:
1. Stop backend services: `docker-compose stop backend`
2. Fetch the backup: `aws s3 cp s3://ewos-backups/pg_dumps/latest.dump ./`
3. Restore DB: `docker-compose exec -T postgres pg_restore -U postgres -d legal_db < latest.dump`
4. Verify application health.
5. Start backend: `docker-compose start backend`
