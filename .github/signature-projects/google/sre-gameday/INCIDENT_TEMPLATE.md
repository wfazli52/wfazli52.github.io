# Incident review template

Use this only after running the lab.

## Summary
- Start time:
- End time:
- Duration:
- User-visible symptom:
- Scope:

## Detection
What signal first showed the problem? Include screenshots or command output.

## Timeline
- T+00: failure introduced
- T+__: symptom confirmed
- T+__: evidence collected
- T+__: recovery action taken
- T+__: service validated

## Root cause
Describe the actual failure you introduced and why it caused the symptom.

## Recovery
List the exact commands or configuration changes used to restore service.

## Validation
Include rollout status, pod health, endpoints and any relevant metric screenshots.

## Prevention / next iteration
What alert, probe, runbook or automation would make this easier next time?
