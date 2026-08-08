# Sample evidence checklist

This is a template only. Do not present it as completed evidence until you run the lab.

- Screenshot: GKE cluster overview with project/cluster name visible.
- Terminal capture: `kubectl get pods -n abdul-sre-lab -o wide`.
- Terminal capture: successful `kubectl rollout status deployment/demo-web`.
- Screenshot or terminal capture: service endpoints populated.
- Screenshot: metrics target / PodMonitoring status when supported.
- Failure test: intentionally break the readiness path or scale replicas, then capture the symptom.
- Recovery proof: restore the correct configuration and re-run `validate.sh`.
- Short incident note: symptom, evidence, root cause, fix, validation, cleanup.
