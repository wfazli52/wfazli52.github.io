$ErrorActionPreference = 'Continue'

Write-Host '=== Azure Arc service ==='
Get-Service -Name himds -ErrorAction SilentlyContinue | Format-Table Status, Name, DisplayName -AutoSize

Write-Host "`n=== Connected Machine Agent ==="
$agent = Get-Command azcmagent.exe -ErrorAction SilentlyContinue
if ($agent) {
    & $agent.Source show
} else {
    Write-Warning 'azcmagent.exe not found in PATH. Confirm the Azure Connected Machine Agent is installed.'
}

Write-Host "`n=== OS / host ==="
Get-ComputerInfo | Select-Object CsName, WindowsProductName, WindowsVersion, OsBuildNumber

Write-Host "`n=== Network ==="
Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway, DNSServer | Format-List

Write-Host "`n=== Recent Arc-related events ==="
Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=(Get-Date).AddHours(-24)} -ErrorAction SilentlyContinue |
    Where-Object { $_.ProviderName -match 'Azure|HIMDS|GuestConfig' -or $_.Message -match 'Azure Connected Machine' } |
    Select-Object -First 20 TimeCreated, Id, LevelDisplayName, ProviderName, Message

Write-Host "`nVerification finished. Remove/redact subscription, tenant, resource IDs, or other sensitive values before publishing evidence."
