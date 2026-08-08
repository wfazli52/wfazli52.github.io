# Private EC2 Operations with Systems Manager

**Status:** Ready to build. Not completed yet.

## Goal
Operate a private EC2 instance without a public IPv4 address or inbound SSH. Use AWS Systems Manager through private VPC interface endpoints for administration and verification.

## Why this is a strong Amazon-focused project
It demonstrates VPC design, EC2, IAM instance roles, Systems Manager, private service endpoints, security groups, and operational access without exposing SSH to the internet.

## Build
1. Install Terraform and configure AWS credentials for your own lab account.
2. Review `main.tf` carefully.
3. Run `terraform init` and `terraform plan`.
4. Apply only in a disposable account / lab environment.
5. Confirm the instance appears as a managed node in Systems Manager.
6. Start a Session Manager session and capture real evidence.
7. Destroy the lab when finished.

## Cost warning
This design uses an EC2 instance and multiple **interface VPC endpoints**, which can create hourly and data-processing charges. Destroy the lab after validation.

## Evidence to capture
- Terraform plan/apply summary with secrets excluded.
- EC2 details showing no public IPv4 address.
- Security group showing no inbound SSH rule.
- Systems Manager managed-node status.
- Successful Session Manager terminal.
- VPC endpoint list for SSM-related services.
- `terraform destroy` completion.
