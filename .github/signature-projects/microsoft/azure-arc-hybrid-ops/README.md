# Azure Arc Hybrid Server Operations

**Status:** Ready to build. Not completed yet.

## Goal
Connect a disposable Windows or Linux server to Azure Arc, verify the connected-machine agent, document extensions/monitoring, and create a repeatable hybrid-server health check.

## Why this is a strong Microsoft-focused project
It combines Azure hybrid management, Windows/Linux server operations, agent verification, resource inventory and PowerShell-based evidence.

## Build path
1. Create a disposable VM you control (local Hyper-V/VMware or a cloud VM).
2. In your Azure subscription, create the Arc onboarding script for that server from the Azure portal or Azure CLI.
3. Run the generated onboarding command on the disposable server.
4. Run `Verify-ArcServer.ps1` on Windows, or adapt the same checks for Linux.
5. Capture the Azure Arc resource view and local agent status.
6. Optionally add Azure Monitor Agent / policy after the basic connection works.
7. Disconnect/delete the lab resource when done.

## Evidence to publish later
- Azure Arc resource showing Connected state.
- Local Azure Connected Machine Agent service status.
- `azcmagent show` output with IDs redacted if needed.
- Extension / monitoring view if configured.
- `Verify-ArcServer.ps1` output.
- Short troubleshooting note for one controlled service stop/restart test.

## Important
Do not commit tenant IDs, subscription IDs, service-principal secrets, onboarding tokens, or generated credentials to this repository.
