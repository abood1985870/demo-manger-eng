# Disaster Recovery & Backup Plan

## Overview
This document outlines the backup and recovery procedures for the Saudi Law Firm Enterprise Edition.

## 1. Backup Strategy
- **PostgreSQL Database**: Automated pg_dump backups every 6 hours stored in encrypted S3 bucket `s3://legal-firm-backups/db/`.
- **Uploaded Documents (S3)**: S3 bucket versioning is ENABLED. Cross-region replication to a secondary data center.
- **Secrets & Configs**: Backed up via HashiCorp Vault snapshots.
- **Retention**: Daily backups retained for 90 days. Weekly for 1 year. Monthly for 7 years (compliance requirement).

## 2. Recovery Objectives
- **Recovery Point Objective (RPO)**: 6 Hours (Max data loss).
- **Recovery Time Objective (RTO)**: 2 Hours (Time to restore operations).

## 3. Restore Procedure
1. Halt all backend app instances to prevent writing during restore.
2. Download latest DB snapshot from S3.
3. Run: `pg_restore -U postgres -d legal_db /path/to/backup.dump`
4. Verify DB integrity against application logs.
5. Restart backend instances.
