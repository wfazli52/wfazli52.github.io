# GKE SRE Observability Lab

**Status:** Ready to build. Not completed yet.

## Goal
Deploy a small workload to Google Kubernetes Engine, validate readiness/liveness behavior, collect application metrics, and document an SRE-style operational check.

## What this proves
- Kubernetes deployment and service operations
- Health probes and rollout validation
- Metrics collection / observability workflow
- Evidence-first troubleshooting

## Suggested build
1. Create a disposable GKE Autopilot cluster.
2. Apply `workload.yaml`.
3. Apply `podmonitoring.yaml` if Managed Service for Prometheus is enabled.
4. Run `validate.sh` from Cloud Shell or a machine with `kubectl` configured.
5. Capture the evidence listed in `SAMPLE_EVIDENCE.md`.
6. Delete the cluster when finished to avoid ongoing charges.

## Validation target
- Deployment reaches Available state.
- Service has healthy endpoints.
- Readiness/liveness probes remain healthy.
- PodMonitoring resource is accepted when supported.
- A short incident note explains one induced failure and the recovery.

## Files
- `workload.yaml` — namespace, deployment and service.
- `podmonitoring.yaml` — Managed Prometheus-style scrape configuration.
- `validate.sh` — repeatable validation commands.
- `SAMPLE_EVIDENCE.md` — what proof to publish later.
