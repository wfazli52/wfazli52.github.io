# Evidence Package Guide

This portfolio uses a proof-first rule: a technical claim is **verified** only when a reviewer can inspect public, sanitized artifacts showing what was built, how it was tested, and what happened.

## Recommended project structure

```text
project-name/
├── README.md
├── diagrams/
│   ├── logical-topology.svg
│   └── physical-topology.svg
├── configs/
│   ├── device-or-service-01.txt
│   └── device-or-service-02.txt
├── tests/
│   ├── test-matrix.md
│   └── raw-results/
├── incidents/
│   ├── incident-01.md
│   └── incident-02.md
├── evidence/
│   ├── screenshots/
│   ├── command-output/
│   └── walkthrough.md
└── reflection.md
```

## Minimum verification standard

A project should not move to `verified` until it has:

1. A clear objective, constraints, assumptions, and definition of done.
2. A labeled architecture diagram that matches the final build.
3. Sanitized configuration or implementation details.
4. A test matrix with expected, actual, evidence, retest, and final status.
5. At least one problem or controlled fault showing the diagnostic process.
6. Recovery validation that repeats the original failing test.
7. A short reflection explaining what changed, what was learned, and what would be improved.
8. Stable public links added to the matching milestone in `proof-data.js`.

## Evidence quality checklist

For every screenshot or command output, include enough context to answer:

- What device or host produced it?
- When in the build or incident did it occur?
- What requirement or hypothesis does it support?
- What sensitive fields were removed?
- What test was performed immediately after the change?

Do not use a screenshot alone when a text configuration, CSV, Markdown table, or copied command output would be easier to inspect and search.

## Sanitization rules

Remove or replace:

- Passwords, hashes, secrets, API keys, tokens, and private keys
- Real employer names, internal domains, public IP addresses, or production hostnames
- Device serial numbers, asset tags, student IDs, and account numbers
- Personal addresses and private contact information
- Unrelated browser tabs, notifications, and user names in screenshots

Use clear replacements such as `REDACTED`, `LAB-SRV-01`, `10.40.0.20`, or `example.invalid`. Never alter test results to make them look successful.

## Test matrix example

```markdown
| ID | Requirement | Expected | Actual | Evidence | Retest | Final |
|---|---|---|---|---|---|---|
| NET-01 | Engineering client receives the correct lease | 10.20.0.0/24, gateway 10.20.0.1 | [record after test] | `evidence/dhcp-net-01.txt` | [record] | Pending |
```

A failed first attempt is useful evidence when the correction and retest are documented.

## Incident record example

```markdown
# SIM-NET-01 — Wrong access VLAN

- **Type:** Controlled training simulation
- **Impact:** ENG-PC-01 cannot reach the Engineering gateway
- **Last known good:** Baseline test matrix completed
- **Observation 1:** Client received 10.30.0.44/24
- **Hypothesis:** Access port is assigned to Guest VLAN 30
- **Evidence:** `show vlan brief` and `show interfaces status`
- **Corrective action:** Move Gi1/0/8 to VLAN 20
- **Rollback:** Restore the previous access VLAN
- **Validation:** Renew lease, ping gateway, resolve service name, repeat policy tests
```

Keep the `SIM-` prefix for controlled training incidents.

## Promoting a project in Proof Mode

Edit `proof-data.js`:

1. Change `status` from `planned` to `in-progress` when real work begins.
2. Add public evidence objects as artifacts become available.
3. Keep incomplete requirements visible.
4. Change `status` to `verified` only after the linked package supports every material claim.
5. Add `verifiedAt` in `YYYY-MM-DD` format.
6. Run `node scripts/validate-site.mjs` before publishing.

Example:

```js
{
  label: 'Completed connectivity and policy test matrix',
  type: 'Test results',
  href: 'https://github.com/USERNAME/PROJECT/blob/main/tests/test-matrix.md'
}
```

## Resume rule

Write a completion bullet only from verified evidence. Do not add metrics, scale, uptime, incident counts, or performance improvements unless the evidence package contains those exact measurements.
