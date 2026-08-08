# Signature infrastructure project packs

These project packs are **ready to build**, not claimed as completed. They are designed to make the Google, Amazon, and Microsoft portfolio modes feel technically distinct while staying relevant to data-center / infrastructure roles.

## Google focus
- `google/gke-sre-observability` — GKE workload health, probes, Managed Prometheus-style monitoring, rollout validation.
- `google/sre-gameday` — controlled Kubernetes failure, recovery validation, SLI/SLO and incident evidence.

## Amazon focus
- `amazon/private-ec2-ops` — private EC2 operations with Systems Manager and VPC endpoints instead of public SSH.
- `amazon/cloudwatch-ssm-runbook` — EC2 health dashboard, CloudWatch alarm design, Systems Manager troubleshooting workflow.

## Microsoft focus
- `microsoft/azure-arc-hybrid-ops` — Azure Arc hybrid-server verification, extensions, monitoring and remote operations plan.
- `microsoft/powershell-server-baseline` — runnable PowerShell inventory / health baseline for Windows Server operations.

## Evidence rule
Do not mark a pack complete until you have run it and published real evidence such as configs, terminal output, screenshots, test results, incident notes, or before/after validation. Any `SAMPLE_EVIDENCE.md` file is an example format only.