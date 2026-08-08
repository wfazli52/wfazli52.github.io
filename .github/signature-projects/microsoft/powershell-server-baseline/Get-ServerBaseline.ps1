param(
    [string]$OutputPath = ".\evidence"
)

$ErrorActionPreference = 'Continue'
New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

$report = [ordered]@{
    GeneratedAt = (Get-Date).ToString('o')
    Computer = Get-ComputerInfo | Select-Object CsName, WindowsProductName, WindowsVersion, OsBuildNumber, CsTotalPhysicalMemory
    Volumes = Get-Volume | Select-Object DriveLetter, FileSystemLabel, FileSystem, HealthStatus, SizeRemaining, Size
    Disks = Get-Disk | Select-Object Number, FriendlyName, SerialNumber, BusType, OperationalStatus, HealthStatus, Size
    Network = Get-NetIPConfiguration | Select-Object InterfaceAlias, NetProfile, IPv4Address, IPv4DefaultGateway, DNSServer
    FailedServices = Get-Service | Where-Object Status -ne 'Running' | Select-Object -First 40 Status, Name, DisplayName, StartType
    CriticalEvents = Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2; StartTime=(Get-Date).AddHours(-24)} -ErrorAction SilentlyContinue |
        Select-Object -First 50 TimeCreated, Id, LevelDisplayName, ProviderName, Message
}

$jsonPath = Join-Path $OutputPath "server-baseline-$timestamp.json"
$textPath = Join-Path $OutputPath "server-baseline-$timestamp.txt"

$report | ConvertTo-Json -Depth 7 | Set-Content -Path $jsonPath -Encoding UTF8

@(
    "Server baseline generated: $($report.GeneratedAt)"
    "Host: $($report.Computer.CsName)"
    "OS: $($report.Computer.WindowsProductName) build $($report.Computer.OsBuildNumber)"
    "Volumes: $(@($report.Volumes).Count)"
    "Disks: $(@($report.Disks).Count)"
    "Non-running services captured: $(@($report.FailedServices).Count)"
    "Critical/error system events captured: $(@($report.CriticalEvents).Count)"
    "JSON evidence: $jsonPath"
) | Set-Content -Path $textPath -Encoding UTF8

Write-Host "Baseline complete."
Write-Host "JSON: $jsonPath"
Write-Host "Summary: $textPath"
Write-Host "Review and redact sensitive hostnames, serial numbers, addresses, or identifiers before publishing evidence."
