# CloudWatch + Systems Manager Operations Runbook

**Status:** Ready to build. Not completed yet.

## Goal
Create an EC2 operations workflow where infrastructure health is checked with Systems Manager, a CloudWatch status-check alarm catches instance problems, and the troubleshooting output is saved as evidence.

## What this proves
- CloudWatch alarm design
- EC2 status monitoring
- AWS Systems Manager Run Command / Session Manager workflow
- Linux health checks and repeatable operational evidence

## Build path
1. Use a disposable EC2 instance managed by Systems Manager.
2. Apply `alarm.tf` with the instance ID.
3. Run `health-check.sh` locally on the instance or through Systems Manager Run Command.
4. Capture the alarm state and command output.
5. Create a controlled symptom only in your lab, document it, recover it, and re-run the health check.
6. Destroy cloud resources after the lab.

## Evidence to publish later
- CloudWatch alarm details and state history.
- Systems Manager managed-node view.
- Run Command or Session Manager execution output.
- `health-check.sh` output before and after recovery.
- A short runbook explaining detection, diagnosis, remediation and validation.
