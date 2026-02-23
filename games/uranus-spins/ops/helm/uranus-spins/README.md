# Uranus Spins Helm Chart

A production-grade Helm chart for deploying the Uranus Spins arcade slot ecosystem to Kubernetes.

## Prerequisites

- Kubernetes 1.22+
- Helm 3.0+
- Ingress NGINX controller
- Cert-manager (for TLS)
- Prometheus Operator (for monitoring)

## Deployment Commands

```bash
# Install (Staging)
helm install uranus-spins ./ops/helm/uranus-spins \
  --namespace uranus-spins \
  --create-namespace \
  --set hmacSecret="REPLACE_WITH_SECRET" \
  --values values.yaml

# Upgrade
helm upgrade uranus-spins ./ops/helm/uranus-spins \
  --namespace uranus-spins \
  --values values.yaml

# Uninstall
helm uninstall uranus-spins -n uranus-spins
```

## Configuration

Refer to `values.yaml` for a complete list of configurable parameters.

## Security & Operational Notes

- **Secrets**: Never store real secrets in `values.yaml`. Use Sealed Secrets, Vault, or Cloud Secret Managers.
- **Monitoring**: Enable the `ServiceMonitor` by ensuring the Prometheus operator is running in your cluster.
- **Backups**: Test backups by restoring to a staging DB quarterly.
