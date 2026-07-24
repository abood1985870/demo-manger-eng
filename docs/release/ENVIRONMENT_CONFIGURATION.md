# Environment Configuration Guidelines

Ensure the following rules are met in the production `.env` file:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY=base64:...` (Must be a strong, randomly generated key).

## Database
- `DB_CONNECTION=pgsql`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` must be set. (Use Vault/Secret Manager where applicable).

## Security & Providers
- No `MOCK_PROVIDER=true` or similar fake flags.
- ZATCA_API_KEY, NAFATH_API_KEY, SANCTIONS_API_KEY must be real or left blank (falling back to manual foundations).
- `SESSION_SECURE_COOKIE=true`
- `FILESYSTEM_DISK=s3` (Do not use `local` in production for legal documents).
