# PowerShell Windows Server Baseline

**Status:** Ready to build. Not completed yet.

## Goal
Run a reusable PowerShell inventory and health baseline on a Windows Server lab VM, capture the result as JSON and text, then use the report during a controlled break/fix exercise.

## What this proves
- Windows Server administration
- PowerShell automation
- Storage / network / service inventory
- Event-log triage
- Repeatable before/after validation

## Build path
1. Create a disposable Windows Server VM.
2. Run PowerShell as an administrator.
3. Execute `Get-ServerBaseline.ps1 -OutputPath .\evidence`.
4. Review the JSON and text summary.
5. Create a safe controlled fault, such as stopping a non-critical lab service.
6. Run the baseline again, diagnose the change, recover it, then run one final baseline.
7. Publish only sanitized evidence.

## Evidence to publish later
- Baseline JSON/text output before the fault.
- Screenshot of the controlled fault.
- Relevant event-log entries.
- PowerShell commands used for diagnosis/recovery.
- Baseline after recovery showing the expected state.
