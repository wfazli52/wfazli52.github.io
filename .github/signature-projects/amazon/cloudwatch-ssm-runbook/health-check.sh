#!/usr/bin/env bash
set -euo pipefail

printf '=== SYSTEM ===\n'
hostnamectl || true
uptime

printf '\n=== CPU / MEMORY ===\n'
command -v free >/dev/null && free -h || true
command -v vmstat >/dev/null && vmstat 1 3 || true

printf '\n=== FILESYSTEMS ===\n'
df -hT

printf '\n=== NETWORK ===\n'
ip -brief address || true
ip route || true

printf '\n=== FAILED SERVICES ===\n'
systemctl --failed --no-pager || true

printf '\n=== RECENT HIGH-PRIORITY LOGS ===\n'
journalctl -p warning -n 30 --no-pager || true

printf '\nHealth check complete. Save this output only as real evidence after running it on your own lab instance.\n'
