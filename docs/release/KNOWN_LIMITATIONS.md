# Known Limitations

- **Performance**: Deep ownership chain generation (> 50 levels) in Compliance (Step L7) may experience timeouts.
- **Search**: Global search across encrypted identity fields (National ID) is exact-match only due to at-rest encryption.
- **Physical Test Execution**: In this exact local sandbox environment, physical Docker builds, physical Flutter compilation, and physical PHPUnit database execution were skipped due to host constraints.
- **Deployment**: Zero-downtime deployment is architecturally supported but untested in an active traffic cluster.
