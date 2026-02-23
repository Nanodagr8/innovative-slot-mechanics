# 📖 URANUS SPINS: OPS RUNBOOK

## 🚀 Deployment Hierarchy

1. **Local**: `docker-compose up --build`
2. **Staging**: Push to `staging` branch (Auto-deploy to K8s)
3. **Production**: Push to `main` branch (Requires manual approval in GitHub Actions)

## 📊 Monitoring & Observability

- **Prometheus**: Scrapes `/api/admin/telemetry` for system health.
- **Grafana**: Visualizes RTP drift, jackpot pool growth, and error rates.
- **Loki**: Centralized log aggregation for ticket verification and claim failures.

## 🚨 Emergency Procedures

### Stop Jackpot Contributions

If a mathematical anomaly is detected:

1. Access the God Panel: `POST /api/admin/config`
2. Body: `{"jackpotTiers": {"mini": 0, "major": 0, "mega": 0}}`
3. This pauses pool growth immediately without a redeploy.

### Manual RTP Override

1. Use the `/api/admin/config` endpoint to swap to the `flat` profile if volatility is too high.
2. Body: `{"probabilities": {"miss": 0.65, "small": 0.30, ...}}`

## 💾 Database Operations

- **Migrations**: Handled automatically in the CI/CD pipeline.
- **Backups**: Standard `pg_dump` cronjobs should be active in the K8s namespace.

## ⚖️ Compliance Auditing

- Run `POST /api/admin/audit` to generate a 10M-shot RTP proof on demand.
- MD5 hashes of the configuration are logged for every audit request.
