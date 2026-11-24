# Kubernetes guide

Manifests are in `k8s/` and applied with Kustomize. All 20 resources pass strict schema validation against Kubernetes 1.30 (`kubernetes-validate --strict`).

| File | Resources |
|---|---|
| `namespace.yaml` | `hiresmart` namespace with the baseline Pod Security level |
| `configmap.yaml` | Non-secret settings |
| `secret.example.yaml` | Reference only; not applied |
| `mongodb.yaml` | Headless Service and a one-replica StatefulSet with a 10 Gi PVC |
| `ai-service.yaml` | Service and Deployment (2 replicas, startup/readiness/liveness probes, 500m/1Gi requests, 2 CPU/2.5Gi limits) |
| `backend.yaml` | Service, 20 Gi uploads PVC and Deployment (1 replica, `Recreate` strategy) |
| `frontend.yaml` | Service and Deployment (2 replicas) |
| `ingress.yaml` | NGINX Ingress: `/api` to the backend, everything else to the frontend; TLS via cert-manager |
| `networkpolicy.yaml` | Default-deny ingress; ingress controller to frontend and backend; backend only to AI service and Mongo |
| `hpa.yaml` | Autoscaling for ai-service (2 to 6) and frontend (2 to 5) on CPU |

## Deploy

```bash
# 1. Build and push images (CI does this on main)
for s in frontend backend ai-service; do
  docker build -t ghcr.io/<owner>/hiresmart-ai/$s:<tag> $s && docker push ghcr.io/<owner>/hiresmart-ai/$s:<tag>
done

# 2. Namespace and secret (secrets never live in git)
kubectl apply -f k8s/namespace.yaml
kubectl -n hiresmart create secret generic hiresmart-secrets \
  --from-literal=MONGO_ROOT_USER=hiresmart \
  --from-literal=MONGO_ROOT_PASSWORD="$(openssl rand -hex 24)" \
  --from-literal=MONGO_URI="mongodb://hiresmart:<password>@mongo:27017/hiresmart?authSource=admin" \
  --from-literal=JWT_ACCESS_SECRET="$(openssl rand -hex 32)" \
  --from-literal=JWT_REFRESH_SECRET="$(openssl rand -hex 32)" \
  --from-literal=AI_SERVICE_TOKEN="$(openssl rand -hex 32)" \
  --from-literal=GROQ_API_KEY=""

# 3. Edit k8s/configmap.yaml and k8s/ingress.yaml for your domain, then
kubectl apply -k k8s/
for d in frontend backend ai-service; do
  kubectl -n hiresmart set image deploy/$d $d=ghcr.io/<owner>/hiresmart-ai/$d:<tag>
done
kubectl -n hiresmart rollout status deploy/backend

# 4. Optional demo data (refused unless SEED_ALLOW_PRODUCTION=true is set on the pod)
kubectl -n hiresmart exec deploy/backend -- node dist/seed/seed.js
```

## Managed database

To use MongoDB Atlas or another managed service, set `MONGO_URI` in the secret to its connection string and remove `mongodb.yaml` from `kustomization.yaml`. Also remove the `backend-to-mongo` NetworkPolicy.

## Scaling the backend

The uploads PVC is `ReadWriteOnce`, so the backend runs one replica with the `Recreate` strategy. To scale out:

1. Switch the PVC to a `ReadWriteMany` storage class (EFS, Azure Files, Filestore), or move resumes to object storage.
2. Change the strategy to `RollingUpdate` and raise `replicas`.
3. Point `express-rate-limit` at a shared store such as Redis.

## Security context

All app pods run as non-root with a read-only root filesystem, no privilege escalation, every capability dropped, `seccompProfile: RuntimeDefault` and no service-account token mounted.
