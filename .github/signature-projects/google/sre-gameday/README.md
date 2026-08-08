# Kubernetes SRE GameDay

**Status:** Ready to build. Not completed yet.

## Goal
Run a small controlled incident against a Kubernetes workload, observe the failure, restore service, and publish an SRE-style incident record with measurable validation.

## Signature angle
This project is intentionally Google/SRE-focused: service reliability, controlled failure, recovery, error-budget thinking, and evidence instead of cosmetic deployment screenshots.

## Suggested exercise
1. Use the workload from `../gke-sre-observability` or another disposable Kubernetes namespace.
2. Run `gameday.sh fail` to create an obvious availability incident by scaling the deployment to zero.
3. Capture service symptoms and events.
4. Run `gameday.sh recover`.
5. Run `gameday.sh validate` and save the output.
6. Write a short incident review using `INCIDENT_TEMPLATE.md`.

## Safety
Use only your own disposable lab namespace. Never run failure commands against a production or shared cluster.
