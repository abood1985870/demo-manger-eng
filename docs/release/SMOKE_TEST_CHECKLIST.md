# Smoke Test Checklist

Execute these manual tests after production deployment:

1. **Authentication**: Login with MFA. Verify session creation.
2. **Ethical Walls**: Attempt to access a Matter ID you are not assigned to. Verify 403 Forbidden.
3. **Billing Authority**: Attempt to finalize an Invoice without Partner/Finance role. Verify 403 Forbidden.
4. **Compliance Sync**: Attempt to activate a Matter for a Client that has an active `legal_compliance_restriction` of type `block_matter_activation`. Verify activation fails.
5. **Document Retrieval**: Download an S3 document. Verify URL is signed and expires quickly.
