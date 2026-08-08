from __future__ import annotations

import html
import os
import re
from pathlib import Path

APP = Path(os.environ.get("REFERENCE_APP", "_reference/app")).resolve()
SRC = APP / "src"
PUBLIC = APP / "public"

if not (APP / "package.json").exists():
    raise SystemExit(f"Reference app was not checked out at {APP}")


def replace_in(path: Path, replacements: list[tuple[str, str]]) -> None:
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    for old, new in replacements:
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")


projects_block = r'''export const PROJECTS: Project[] = [
  {
    n: "01", title: "Enterprise VLAN & Routing Lab",
    desc: "A Cisco lab for segmentation, addressing, inter-VLAN routing, services, policy, testing, and fault isolation.",
    long: "Plan four VLANs, document the subnet map, configure trunks and inter-VLAN routing, add DHCP and DNS, apply an ACL, then run a repeatable acceptance-test matrix and controlled troubleshooting scenarios. Status remains planned until Abdul publishes his own configs and test evidence.",
    tags: ["Cisco", "VLAN", "Networking", "Packet Tracer"],
    year: "2026", status: "planned", type: "Networking lab",
    link: "/labs/enterprise-network.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 7, deps: 4 },
    trend: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
  },
  {
    n: "02", title: "NetBox DCIM & IPAM Source of Truth",
    desc: "A data-center inventory lab built around NetBox: racks, devices, interfaces, cabling, VLANs, prefixes, and change records.",
    long: "Build an original lab around the open-source NetBox platform. Model a small data-center room with racks, device roles, interfaces, patch paths, VLANs, prefixes, and IP assignments; import a sanitized inventory; then practice add/move/change documentation and reconciliation against the source of truth. NetBox is credited as upstream tooling; the portfolio only claims Abdul's future lab configuration and evidence.",
    tags: ["NetBox", "DCIM", "IPAM", "Rack Inventory"],
    year: "2026", status: "planned", type: "Data-center operations lab",
    link: "/labs/netbox-dcim.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 8, deps: 2 },
    trend: [0, 0, 0, 1, 1, 2, 2, 3, 4, 4],
  },
  {
    n: "03", title: "BMC / IPMI Hardware Telemetry",
    desc: "A hardware-health monitoring lab using IPMI telemetry, Prometheus, alert rules, and a documented response workflow.",
    long: "Use prometheus-community/ipmi_exporter as upstream tooling to collect BMC/IPMI sensor data from lab hardware or a safe simulated endpoint. Build dashboards for temperatures, fan state, voltage and chassis power signals, define test alerts, then document what a technician should inspect when telemetry disappears or crosses a lab threshold. No production uptime or hardware claims are made until the lab is run and captured.",
    tags: ["IPMI", "BMC", "Prometheus", "Hardware"],
    year: "2026", status: "planned", type: "Hardware monitoring lab",
    link: "/labs/ipmi-telemetry.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 8, deps: 3 },
    trend: [0, 0, 0, 0, 1, 1, 2, 3, 3, 4],
  },
  {
    n: "04", title: "SMART Storage Health & Break/Fix",
    desc: "A disk-health and replacement lab using SMART telemetry, alerting, evidence capture, and post-replacement validation.",
    long: "Build an original storage-operations exercise around prometheus-community/smartctl_exporter and SMART data. Monitor lab-drive health and temperature signals, create a dashboard and warning workflow, inject or replay safe test conditions, document the replacement checklist, and verify the device returns to a healthy monitored state. Upstream exporter code is credited and never presented as Abdul's work.",
    tags: ["SMART", "Storage", "Prometheus", "Break/Fix"],
    year: "2026", status: "planned", type: "Storage operations lab",
    link: "/labs/storage-health.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 8, deps: 3 },
    trend: [0, 0, 0, 0, 0, 1, 2, 2, 3, 4],
  },
  {
    n: "05", title: "Bare-Metal Provisioning & Lifecycle",
    desc: "A lab for BMC enrollment, inspection, provisioning, power control, deprovisioning, and lifecycle documentation.",
    long: "Use Metal3's baremetal-operator as upstream reference tooling to understand a modern bare-metal lifecycle. In a lab or virtual BMC environment, document enrollment, hardware inspection, image provisioning, power-state changes, deprovisioning, and failure recovery. The deliverable is Abdul's workflow, diagrams, manifests, screenshots, and validation notes—not a claim of authorship over Metal3.",
    tags: ["Bare Metal", "BMC", "Lifecycle", "Automation"],
    year: "2026", status: "planned", type: "Provisioning lab",
    link: "/labs/bare-metal-lifecycle.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 9, deps: 4 },
    trend: [0, 0, 0, 0, 1, 1, 2, 2, 3, 4],
  },
  {
    n: "06", title: "Linux Operations & Recovery Lab",
    desc: "Two Linux servers for secure access, services, logging, storage, monitoring, backup, and controlled recovery.",
    long: "Build a repeatable Linux operations environment, establish a healthy baseline, introduce safe service, DNS, storage, and firewall failures, inspect logs and system state, restore service, and publish the exact commands and validation evidence Abdul produced.",
    tags: ["Linux", "SSH", "Systemd", "Troubleshooting"],
    year: "2026", status: "planned", type: "Systems lab",
    link: "/labs/linux-operations.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 8, deps: 2 },
    trend: [0, 0, 0, 1, 1, 2, 2, 3, 3, 4],
  },
  {
    n: "07", title: "Rack, Cabling & Asset Operations",
    desc: "A rack elevation, cable map, asset register, A/B power model, replacement workflow, and shift-handoff package.",
    long: "Model a serviceable rack, label every network and power path, document dependencies, simulate a controlled component replacement, update inventory, and validate cabling, management access, and service recovery. Final status changes only when the diagrams, photos or simulated evidence, checklists, and handoff notes exist.",
    tags: ["Data Center", "Cabling", "Hardware", "Operations"],
    year: "2026", status: "planned", type: "Data-center lab",
    link: "/labs/rack-operations.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 8, deps: 1 },
    trend: [0, 0, 0, 0, 1, 1, 2, 2, 3, 4],
  },
  {
    n: "08", title: "This Interactive Infrastructure Portfolio",
    desc: "A permission-based React, TypeScript, and Three.js portfolio customized for Abdul Fazli's data-center career path.",
    long: "The website is an inspectable artifact: responsive layout, keyboard navigation, two themes, data visualizations, recruiter mode, adaptive performance controls, and scroll-driven 3D infrastructure scenes. Open-source/reference architecture is credited separately; the customization and career narrative are maintained in Abdul's repository.",
    tags: ["React", "TypeScript", "Three.js", "Portfolio"],
    year: "2026", status: "live", type: "Portfolio",
    link: "https://wfazli52.github.io/",
    metrics: { loc: 0, commits: 0, stars: 0, files: 1, deps: 0 },
    trend: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  },
];'''


data_path = SRC / "specimen" / "data.ts"
data = data_path.read_text(encoding="utf-8")
data, count = re.subn(
    r"export const PROJECTS: Project\[\] = \[.*?\n\];(?=\n\nexport const TOTALS)",
    projects_block,
    data,
    flags=re.S,
)
if count != 1:
    raise SystemExit(f"Could not replace project array cleanly; replacements={count}")

data_replacements = [
    ('{ label: "WGU coursework", value: 35, color: "var(--accent)" }', '{ label: "Cybersecurity coursework", value: 35, color: "var(--accent)" }'),
    ('title: "B.S. Network Engineering · Cisco track", sub: "Western Governors University"', 'title: "Associate in Cybersecurity", sub: "Northern Virginia Community College"'),
    ('desc: "[ADD EXPECTED GRADUATION DATE AND RELEVANT COMPLETED COURSEWORK.]"', 'desc: "Cybersecurity associate-degree coursework. Add expected graduation date and completed courses when ready."'),
    ('{ name: "Cisco", weight: 4 }', '{ name: "NetBox", weight: 4 }'),
    ('{ name: "VLAN", weight: 3 }', '{ name: "Prometheus", weight: 3 }'),
    ('{ name: "Packet Tracer", weight: 2 }', '{ name: "IPMI", weight: 2 }'),
    ('{ name: "Three.js", weight: 1 }', '{ name: "SMART", weight: 2 }'),
    ('{ name: "Web", weight: 1 }', '{ name: "Bare Metal", weight: 2 }'),
    ('Cisco Packet Tracer, GitHub, virtual machines, command-line troubleshooting, [ADD TOOLS]', 'NetBox, Prometheus, IPMI/SMART lab tooling, GitHub, virtual machines, command-line troubleshooting'),
]
for old, new in data_replacements:
    data = data.replace(old, new)
data_path.write_text(data, encoding="utf-8")


# Personal identity and education supplied by the portfolio owner.
identity_replacements = [
    ("[YOUR NAME]", "Abdul Fazli"),
    ("[FIRST NAME]", "Abdul"),
    ('logo: "YN"', 'logo: "AF"'),
    ("network engineering at WGU, Cisco track.", "cybersecurity at Northern Virginia Community College."),
    ("Network Engineering, B.S.", "Cybersecurity, Associate"),
    ("WGU · Cisco track.", "Northern Virginia Community College."),
    ("coursework plus hands-on labs.", "cybersecurity coursework plus infrastructure labs."),
    ("Studying: Network engineering", "Studying: Cybersecurity at NOVA"),
    ("WGU coursework", "Cybersecurity coursework"),
    ("B.S. Network Engineering · Cisco track", "Associate in Cybersecurity"),
    ("Western Governors University", "Northern Virginia Community College"),
]

for path in SRC.rglob("*"):
    if path.is_file() and path.suffix.lower() in {".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json", ".md", ".txt", ".svg"}:
        try:
            replace_in(path, identity_replacements)
        except UnicodeDecodeError:
            pass

for path in PUBLIC.rglob("*"):
    if path.is_file() and path.suffix.lower() in {".js", ".css", ".html", ".json", ".md", ".txt", ".svg"}:
        try:
            replace_in(path, identity_replacements)
        except UnicodeDecodeError:
            pass

replace_in(APP / "index.html", identity_replacements)

# Update a few portfolio-specific phrases that the base adapter intentionally
# left as generic placeholders.
copy_path = SRC / "specimen" / "copy.ts"
replace_in(copy_path, [
    ('v: "[YOUR CITY] · [COORDINATE]"', 'v: "Northern Virginia · [COORDINATE]"'),
    ('location: "[YOUR CITY] · [COORDINATE]"', 'location: "Northern Virginia · [COORDINATE]"'),
    ('{ k: "Currently", v: "Cybersecurity, Associate", taps: ["finishing the degree. slowly but surely.", "the analytics track, the useful one."] }', '{ k: "Currently", v: "Cybersecurity, Associate", taps: ["Northern Virginia Community College.", "cybersecurity coursework plus infrastructure labs."] }'),
])

site_config = SRC / "specimen" / "site-config.ts"
replace_in(site_config, [
    ('tagline: "i build infrastructure skills, test them, and publish the proof."', 'tagline: "cybersecurity student building data-center, networking, Linux, and hardware proof."'),
    ('{ label: "learning", value: "cybersecurity at Northern Virginia Community College." }', '{ label: "learning", value: "Associate in Cybersecurity · Northern Virginia Community College." }'),
])


TOOL_CREDITS = [
    ("NetBox", "netbox-community/netbox", "https://github.com/netbox-community/netbox", "DCIM/IPAM source-of-truth platform"),
    ("IPMI Exporter", "prometheus-community/ipmi_exporter", "https://github.com/prometheus-community/ipmi_exporter", "Prometheus exporter for IPMI/BMC telemetry"),
    ("SMART Exporter", "prometheus-community/smartctl_exporter", "https://github.com/prometheus-community/smartctl_exporter", "Prometheus exporter for SMART storage telemetry"),
    ("Node Exporter", "prometheus/node_exporter", "https://github.com/prometheus/node_exporter", "Linux host metrics exporter"),
    ("Metal3 Bare Metal Operator", "metal3-io/baremetal-operator", "https://github.com/metal3-io/baremetal-operator", "Bare-metal lifecycle automation reference"),
]


def lab_page(title: str, subtitle: str, goals: list[str], evidence: list[str], credits: list[str]) -> str:
    credit_html = "".join(f'<li><a href="{html.escape(url)}" rel="noreferrer">{html.escape(name)}</a></li>' for name, url in [
        (name, url) for name, _, url, _ in TOOL_CREDITS if name in credits
    ]) or '<li>No external tooling required for this lab.</li>'
    goals_html = "".join(f"<li>{html.escape(item)}</li>" for item in goals)
    evidence_html = "".join(f"<li>{html.escape(item)}</li>" for item in evidence)
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} · Abdul Fazli</title><meta name="description" content="Planned data-center portfolio lab for Abdul Fazli.">
<style>:root{{color-scheme:dark}}*{{box-sizing:border-box}}body{{margin:0;background:#080a10;color:#eef3ff;font:16px/1.65 system-ui,sans-serif}}main{{max-width:920px;margin:auto;padding:64px 24px 100px}}a{{color:#66eaff}}.mono{{font:12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#7f899e}}h1{{font-size:clamp(42px,8vw,82px);line-height:.94;letter-spacing:-.055em;margin:18px 0 24px}}h2{{margin-top:44px;font-size:24px}}.status{{display:inline-block;border:1px solid #557cff;padding:7px 10px;color:#9fb2ff;font:11px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase}}.card{{border:1px solid #27304a;background:#0d111b;padding:24px;margin-top:26px}}li{{margin:.55rem 0}}.warn{{border-left:2px solid #ffc85e;padding-left:14px;color:#c8cfdd}}footer{{margin-top:64px;padding-top:22px;border-top:1px solid #27304a}}</style></head>
<body><main><a class="mono" href="/">← Back to portfolio</a><p class="mono">Abdul Fazli · Data Center Lab Plan</p><span class="status">Planned · evidence not yet claimed</span><h1>{html.escape(title)}</h1><p>{html.escape(subtitle)}</p>
<p class="warn">This is a build plan, not a claim that the lab is complete. Status changes only after Abdul runs the work and publishes his own sanitized evidence.</p>
<section class="card"><h2>Build goals</h2><ul>{goals_html}</ul></section><section class="card"><h2>Evidence checklist</h2><ul>{evidence_html}</ul></section><section class="card"><h2>Upstream tools / references</h2><ul>{credit_html}</ul><p>Upstream source remains credited to its original maintainers. Abdul's portfolio will document only his lab configuration, testing, troubleshooting, and conclusions.</p></section>
<footer><a href="https://github.com/wfazli52">GitHub profile</a> · <a href="/">Portfolio home</a></footer></main></body></html>'''

labs = {
    "enterprise-network.html": ("Enterprise VLAN & Routing Lab", "A repeatable Cisco networking exercise focused on segmentation, services, policy, acceptance testing, and troubleshooting.", ["Design VLANs and IPv4 subnets", "Configure access/trunk ports and inter-VLAN routing", "Add DHCP/DNS services and an ACL", "Inject at least three controlled faults and restore service"], ["Topology diagram", "Address/VLAN plan", "Sanitized configs", "Acceptance-test matrix", "Troubleshooting log", "Final validation summary"], []),
    "netbox-dcim.html": ("NetBox DCIM & IPAM Source of Truth", "A less-generic entry-level portfolio project centered on the inventory and documentation work data-center technicians touch every day.", ["Model sites, racks, device roles, devices, interfaces and cables", "Create VLANs, prefixes and IP assignments", "Import or reconcile a sanitized asset list", "Document add/move/change and decommission workflows"], ["Rack elevations", "Device inventory export", "Cable-path screenshots", "IPAM/VLAN screenshots", "Change checklist", "Reconciliation report", "Redacted source data"], ["NetBox"]),
    "ipmi-telemetry.html": ("BMC / IPMI Hardware Telemetry", "A hardware-health monitoring project focused on out-of-band signals and technician response.", ["Collect IPMI/BMC sensor data from lab hardware or a safe simulated endpoint", "Visualize temperature, fan, voltage and power-state signals", "Create test alerts and a response runbook", "Simulate unreachable telemetry and document triage"], ["Exporter configuration", "Dashboard screenshots", "Alert rules", "Sensor inventory", "Failure injection notes", "Recovery validation", "Runbook"], ["IPMI Exporter"]),
    "storage-health.html": ("SMART Storage Health & Break/Fix", "A storage-health lab that connects monitoring signals to a documented replacement and validation workflow.", ["Collect SMART telemetry from lab disks", "Build a health dashboard and warning workflow", "Create a safe test/replay condition", "Document removal/replacement/retest steps"], ["SMART metric samples", "Dashboard screenshots", "Alert rule", "Break/fix checklist", "Before/after evidence", "Post-replacement validation"], ["SMART Exporter", "Node Exporter"]),
    "bare-metal-lifecycle.html": ("Bare-Metal Provisioning & Lifecycle", "A modern bare-metal operations lab focused on BMC enrollment, inspection, provisioning and decommissioning.", ["Create a virtual or lab BMC environment", "Document enrollment and hardware inspection", "Provision and power-cycle a test node", "Deprovision and recover from one controlled failure"], ["Architecture diagram", "Sanitized manifests/configuration", "Provisioning timeline", "Power-state evidence", "Failure/recovery notes", "Decommission checklist"], ["Metal3 Bare Metal Operator"]),
    "linux-operations.html": ("Linux Operations & Recovery Lab", "A two-host operations exercise for services, logs, storage, firewall/DNS failures, and recovery.", ["Establish a documented healthy baseline", "Harden SSH and service access", "Inject controlled service, DNS, firewall and disk-space failures", "Restore service and verify with a test matrix"], ["Build notes", "Baseline commands", "Failure screenshots", "Journal/log excerpts", "Recovery commands", "Validation checklist"], ["Node Exporter"]),
    "rack-operations.html": ("Rack, Cabling & Asset Operations", "A physical-operations style lab for rack elevations, cabling, A/B power, asset control and shift handoff.", ["Create a rack elevation", "Map network and power paths", "Build an asset register and labeling standard", "Simulate a component swap and shift handoff"], ["Rack elevation", "Cable/port map", "Asset register", "Power map", "Replacement checklist", "Handoff note"], ["NetBox"]),
}

for filename, (title, subtitle, goals, evidence, credits) in labs.items():
    path = PUBLIC / "labs" / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(lab_page(title, subtitle, goals, evidence, credits), encoding="utf-8")

credit_md = "# Data-center lab tooling credits\n\nThese upstream projects are references/tools for Abdul Fazli's planned labs. Their code is not presented as Abdul's work.\n\n"
for name, repo, url, purpose in TOOL_CREDITS:
    credit_md += f"- **{name}** — `{repo}` — {purpose} — {url}\n"
(PUBLIC / "LAB_TOOLING.md").write_text(credit_md, encoding="utf-8")
