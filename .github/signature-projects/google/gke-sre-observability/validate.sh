#!/usr/bin/env bash
set -euo pipefail

NS="abdul-sre-lab"

echo "== Deployment =="
kubectl -n "$NS" get deployment demo-web -o wide
kubectl -n "$NS" rollout status deployment/demo-web --timeout=120s

echo "== Pods =="
kubectl -n "$NS" get pods -l app=demo-web -o wide

echo "== Service endpoints =="
kubectl -n "$NS" get service demo-web
kubectl -n "$NS" get endpoints demo-web

echo "== Probe-related events =="
kubectl -n "$NS" get events --sort-by=.lastTimestamp | tail -n 25

echo "== PodMonitoring, if installed =="
kubectl -n "$NS" get podmonitoring demo-web 2>/dev/null || true

echo "Validation complete. Capture this output as real evidence only after you run the lab."
