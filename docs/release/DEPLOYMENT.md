# EWOS Deployment Sequence

## Required Infrastructure
- Docker engine & docker-compose installed.
- PostgreSQL 15 server (or container).
- Redis 7 server (or container).
- S3-compatible Object Storage.
- Load Balancer with SSL/TLS Termination.

## 1. Environment Configuration
Copy `.env.example` to `.env` and fill in secrets (DB, Redis, S3, Provider Keys, App Key).
Do not use mock keys in production. Set `APP_DEBUG=false`.

## 2. Infrastructure Spin Up
```bash
docker-compose up -d postgres redis
```

## 3. Database Migration (MUST BE RUN BEFORE BACKEND START)
```bash
docker-compose run --rm backend php artisan migrate --force
```

## 4. Seeding (Optional / Staging Only)
Do NOT run standard seeders in production. If necessary for lookup tables:
```bash
docker-compose run --rm backend php artisan db:seed --class=LookupTablesSeeder --force
```

## 5. Backend Start
```bash
docker-compose up -d backend
```

## 6. Workers & Scheduler Start
Ensure background workers are running for notifications, compliance refresh, and audit logs.
```bash
docker-compose exec backend php artisan queue:work --daemon
docker-compose exec backend php artisan schedule:work
```

## 7. Web Frontend Start
Ensure `NEXT_PUBLIC_API_URL` is set to the production backend URL.
```bash
docker-compose up -d frontend
```

## 8. Rollback Procedure
If the deployment fails or introduces critical defects:
1. Revert the codebase to the previous stable git tag.
2. If migrations ran, rollback the specific batch: `docker-compose run --rm backend php artisan migrate:rollback --step=1 --force`
3. Restart backend containers.
