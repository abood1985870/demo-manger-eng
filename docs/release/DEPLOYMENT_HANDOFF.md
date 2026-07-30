# Deployment Handoff

## Docker (Recommended)

From the repository root:

```text
set JWT_SECRET=<long-random-secret>
docker compose build
docker compose up -d
```

The image runs Prisma migrations before starting the standalone Next.js server. The database and uploads are persistent Docker volumes. Verify with:

```text
curl.exe -i http://127.0.0.1:3000/login
curl.exe -i http://127.0.0.1:3000/api/health
```

Docker was not available on the development host, so the target operator must perform the image build before accepting the deployment.

## Direct Node Deployment

From `frontend`:

```text
npm.cmd ci
set NODE_ENV=production
set PORT=3000
set HOSTNAME=0.0.0.0
set DATABASE_URL=file:C:/absolute/path/to/production.db
set JWT_SECRET=<long-random-secret>
npm.cmd run prisma -- generate
npm.cmd run prisma -- migrate deploy
npm.cmd run build
node .next\standalone\server.js
```

Use a service manager rather than an interactive terminal on the target server. Keep the database and `public/uploads` on persistent storage.

## Before Handoff

- Back up the production database before every migration and daily thereafter.
- Do not run `prisma db seed` against production.
- Put the service behind HTTPS and a reverse proxy.
- Configure log rotation, health checks, alerting, and restore drills.
- Replace all demo credentials and verify deactivated-user access is rejected.
