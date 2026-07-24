# Production Security Checklist

- [ ] `APP_DEBUG` is false.
- [ ] Ethical Wall Guard middleware is applied globally to Matter/Client endpoints.
- [ ] Compliance Access Resolver strictly limits sensitive SARs and Matches to the Compliance Officer role.
- [ ] File uploads restrict executable formats (.php, .exe, .sh, .js).
- [ ] Next.js CSP headers are active (no `unsafe-eval` in production).
- [ ] Database credentials are removed from version control.
- [ ] All APIs require Bearer Authentication (except Login/MFA).
