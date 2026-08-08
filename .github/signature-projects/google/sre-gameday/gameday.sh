#!/usr/bin/env bash
set -euo pipefail

NS="${NS:-abdul-sre-lab}"
DEPLOYMENT="${DEPLOYMENT:-demo-web}"
ACTION="${1:-validate}"

case "$ACTION" in
  fail)
    echo "Scaling $NS/$DEPLOYMENT to zero replicas to create a controlled lab incident."
    kubectl -n "$NS" scale deployment "$DEPLOYMENT" --replicas=0
    ;;
  recover)
    echo "Restoring $NS/$DEPLOYMENT to two replicas."
    kubectl -n "$NS" scale deployment "$DEPLOYMENT" --replicas=2
    kubectl -n "$NS" rollout status deployment/"$DEPLOYMENT" --timeout=120s
    ;;
  validate)
    kubectl -n "$NS" get deployment "$DEPLOYMENT" -o wide
    kubectl -n "$NS" get pods -l app=demo-web -o wide
    kubectl -n "$NS" get endpoints demo-web
    kubectl -n "$NS" get events --sort-by=.lastTimestamp | tail -n 20
    ;;
  *)
    echo "Usage: $0 {fail|recover|validate}" >&2
    exit 2
    ;;
esac
