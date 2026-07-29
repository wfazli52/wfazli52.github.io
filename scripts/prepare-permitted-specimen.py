from __future__ import annotations

import json
import os
import re
from pathlib import Path

APP = Path(os.environ.get("REFERENCE_APP", "_reference/app")).resolve()
SRC = APP / "src"
PUBLIC = APP / "public"

if not (APP / "package.json").exists():
    raise SystemExit(f"Reference app was not checked out at {APP}")


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")


def replace_in(path: Path, replacements: list[tuple[str, str]]) -> None:
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    for old, new in replacements:
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")


# Keep the original owner's architecture and motion system, but replace all
# structured portfolio claims with honest placeholders and planned lab content.
data_ts = r'''
// Editable template content for the permitted specimen-sheet redesign.
// Replace bracketed values only with information you can honestly support.

export interface Project {
  n: string;
  title: string;
  desc: string;
  long: string;
  tags: string[];
  year: string;
  status: string;
  type: string;
  link: string;
  metrics: { loc: number; commits: number; stars: number; files: number; deps: number };
  trend: number[];
}

export const PROJECTS: Project[] = [
  {
    n: "01", title: "Enterprise VLAN Lab",
    desc: "A planned Cisco lab for segmentation, routing, addressing, services, policy, and fault isolation.",
    long: "Design four VLANs, document the subnet plan, configure trunks and inter-VLAN routing, add DHCP and DNS, apply an ACL, then publish a test matrix and sanitized troubleshooting evidence after the lab is complete.",
    tags: ["Cisco", "VLAN", "Networking", "Packet Tracer"],
    year: "2026", status: "planned", type: "Networking lab",
    link: "/projects/enterprise-network.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 7, deps: 4 },
    trend: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
  },
  {
    n: "02", title: "Linux Operations Lab",
    desc: "Two Linux servers for secure access, services, logging, storage, monitoring, backup, and recovery.",
    long: "Build a repeatable Linux operations environment, establish the healthy baseline, introduce safe failures, inspect logs and system state, restore service, and publish only the evidence you personally produced.",
    tags: ["Linux", "SSH", "Systemd", "Monitoring"],
    year: "2026", status: "planned", type: "Systems lab",
    link: "/projects/linux-monitoring.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 7, deps: 2 },
    trend: [0, 0, 0, 1, 1, 2, 2, 3, 3, 4],
  },
  {
    n: "03", title: "Rack & Cabling Operations",
    desc: "A rack elevation, cable map, asset register, A/B power plan, replacement workflow, and handoff package.",
    long: "Model a serviceable rack, label every path, document dependencies, simulate a controlled component replacement, update inventory, and validate power, cabling, management, and service recovery.",
    tags: ["Data Center", "Cabling", "Hardware", "Operations"],
    year: "2026", status: "planned", type: "Data-center lab",
    link: "/projects/rack-inventory.html",
    metrics: { loc: 0, commits: 0, stars: 0, files: 7, deps: 1 },
    trend: [0, 0, 0, 0, 1, 1, 2, 2, 3, 4],
  },
  {
    n: "04", title: "Incident Response Simulator",
    desc: "A browser-based training environment for VLAN, DNS, uplink, service, and storage incidents.",
    long: "Use synthetic incidents to practice scope identification, command selection, root-cause analysis, recovery validation, ticket notes, and shift handoff. Clearly labeled as simulation rather than production experience.",
    tags: ["Troubleshooting", "DNS", "Linux", "Simulation"],
    year: "2026", status: "live demo", type: "Interactive training",
    link: "/#command-center",
    metrics: { loc: 0, commits: 0, stars: 0, files: 4, deps: 0 },
    trend: [0, 1, 1, 2, 2, 3, 3, 4, 4, 4],
  },
  {
    n: "05", title: "Monitoring & Alerting Lab",
    desc: "[ADD A REAL MONITORING PROJECT: HOSTS, SIGNALS, ALERT RULES, DASHBOARDS, AND VALIDATION.]",
    long: "[DESCRIBE WHAT YOU MONITORED, HOW YOU ESTABLISHED NORMAL BEHAVIOR, WHICH ALERTS YOU TESTED, AND WHAT PUBLIC EVIDENCE SUPPORTS THE RESULT.]",
    tags: ["Monitoring", "Linux", "Metrics", "[TOOL]"],
    year: "[YEAR]", status: "placeholder", type: "[PROJECT TYPE]",
    link: "#contact",
    metrics: { loc: 0, commits: 0, stars: 0, files: 0, deps: 0 },
    trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    n: "06", title: "Hardware Break/Fix Log",
    desc: "[ADD A PROJECT THAT DOCUMENTS COMPONENT IDENTIFICATION, DIAGNOSIS, REPLACEMENT, AND RETESTING.]",
    long: "[DESCRIBE THE DEVICE, SYMPTOMS, SAFETY STEPS, DIAGNOSTIC METHOD, REPLACEMENT PROCESS, AND FINAL VALIDATION. REMOVE PRIVATE SERIAL NUMBERS.]",
    tags: ["Hardware", "Break/Fix", "Documentation"],
    year: "[YEAR]", status: "placeholder", type: "[PROJECT TYPE]",
    link: "#contact",
    metrics: { loc: 0, commits: 0, stars: 0, files: 0, deps: 0 },
    trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    n: "07", title: "Operations Automation Toolkit",
    desc: "[ADD A SAFE AUTOMATION PROJECT: INVENTORY, LOG PARSING, HEALTH CHECKS, OR DOCUMENT GENERATION.]",
    long: "[EXPLAIN THE MANUAL PROCESS, YOUR SCRIPT OR TOOL, ERROR HANDLING, TEST CASES, AND MEASURABLE RESULT. DO NOT INVENT TIME SAVINGS.]",
    tags: ["Python", "Automation", "Git"],
    year: "[YEAR]", status: "placeholder", type: "[PROJECT TYPE]",
    link: "https://github.com/wfazli52",
    metrics: { loc: 0, commits: 0, stars: 0, files: 0, deps: 0 },
    trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    n: "08", title: "This Portfolio",
    desc: "A permission-based React, TypeScript, and Three.js specimen portfolio adapted for infrastructure work.",
    long: "The public website itself is the first inspectable artifact: responsive design, animated data visualizations, keyboard navigation, two themes, a command palette, and a scroll-driven 3D hardware showcase.",
    tags: ["React", "TypeScript", "Three.js", "Web"],
    year: "2026", status: "live", type: "Portfolio",
    link: "https://wfazli52.github.io/",
    metrics: { loc: 0, commits: 0, stars: 0, files: 1, deps: 0 },
    trend: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  },
];

export const TOTALS = PROJECTS.reduce(
  (a, p) => ({
    loc: a.loc + p.metrics.loc,
    commits: a.commits + p.metrics.commits,
    stars: a.stars + p.metrics.stars,
    files: a.files + p.metrics.files,
  }),
  { loc: 0, commits: 0, stars: 0, files: 0 },
);

export interface DonutSlice { label: string; value: number; color: string }
export const LANG_DIST: DonutSlice[] = [
  { label: "Networking", value: 30, color: "var(--accent)" },
  { label: "Linux", value: 24, color: "oklch(0.70 0.16 205)" },
  { label: "Documentation", value: 20, color: "oklch(0.72 0.16 95)" },
  { label: "Hardware", value: 14, color: "oklch(0.62 0.16 25)" },
  { label: "Automation", value: 12, color: "var(--ink-3)" },
];

export const STACK_USAGE = [
  { label: "TCP/IP & subnetting", value: 62 },
  { label: "Cisco IOS", value: 48 },
  { label: "Linux", value: 52 },
  { label: "Git & documentation", value: 58 },
  { label: "Hardware operations", value: 42 },
  { label: "Automation", value: 30 },
];

export interface ChartSeries { label: string; color: string; data: { x: number; y: number }[] }
export const SHIP_TREND: ChartSeries[] = [
  {
    label: "Verified", color: "var(--accent)", data: [
      { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
      { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 },
    ],
  },
  {
    label: "Planned", color: "var(--ink-3)", data: [
      { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
      { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 },
    ],
  },
];

export interface TagWeight { name: string; weight: number }
export const TAG_WEIGHTS: TagWeight[] = [
  { name: "Networking", weight: 5 },
  { name: "Linux", weight: 5 },
  { name: "Cisco", weight: 4 },
  { name: "Hardware", weight: 4 },
  { name: "Data Center", weight: 4 },
  { name: "Troubleshooting", weight: 4 },
  { name: "Documentation", weight: 3 },
  { name: "VLAN", weight: 3 },
  { name: "Monitoring", weight: 3 },
  { name: "Automation", weight: 2 },
  { name: "Python", weight: 2 },
  { name: "Git", weight: 2 },
  { name: "Packet Tracer", weight: 2 },
  { name: "Three.js", weight: 1 },
  { name: "Web", weight: 1 },
];

export const SKILLS = [
  { label: "Operations", items: "Incident notes, runbooks, escalation, change validation, asset tracking" },
  { label: "Systems & Networking", items: "TCP/IP, IPv4 subnetting, VLANs, trunks, DNS, DHCP, Linux fundamentals" },
  { label: "Data Center & Hardware", items: "Component identification, rack planning, cable labeling, break/fix logic, ESD" },
  { label: "Tools & Learning", items: "Cisco Packet Tracer, GitHub, virtual machines, command-line troubleshooting, [ADD TOOLS]" },
  { label: "Languages", items: "[ADD LANGUAGES YOU SPEAK]" },
];

export interface ResumeEntry { period: string; title: string; sub: string; desc: string; upcoming?: boolean }

export const EDUCATION: ResumeEntry[] = [
  { period: "In progress", title: "B.S. Network Engineering · Cisco track", sub: "Western Governors University", desc: "[ADD EXPECTED GRADUATION DATE AND RELEVANT COMPLETED COURSEWORK.]" },
];

export const CERTS: ResumeEntry[] = [
  { period: "In progress", title: "CCNA", sub: "Cisco", desc: "[ADD TARGET DATE OR REMOVE THIS ENTRY.]", upcoming: true },
  { period: "[STATUS]", title: "[CERTIFICATION]", sub: "[ISSUER]", desc: "[ADD ONLY A CERTIFICATION YOU EARNED OR ARE ACTIVELY PURSUING.]", upcoming: true },
  { period: "[STATUS]", title: "[CERTIFICATION]", sub: "[ISSUER]", desc: "[OPTIONAL THIRD CREDENTIAL.]", upcoming: true },
];

export const EXPERIENCE: ResumeEntry[] = [
  { period: "[YEAR–YEAR]", title: "[YOUR CURRENT OR MOST RECENT ROLE]", sub: "[COMPANY] · [CITY, STATE]", desc: "[DESCRIBE YOUR RESPONSIBILITIES, SYSTEMS OR CUSTOMERS SUPPORTED, AND ONE VERIFIABLE RESULT. DO NOT INVENT METRICS.]" },
  { period: "[YEAR–YEAR]", title: "[PREVIOUS ROLE]", sub: "[COMPANY] · [CITY, STATE]", desc: "[ADD RELEVANT TRANSFERABLE EXPERIENCE: TROUBLESHOOTING, SHIFT WORK, DOCUMENTATION, SAFETY, CUSTOMER SERVICE, OR PHYSICAL OPERATIONS.]" },
  { period: "[OPTIONAL]", title: "[OPTIONAL THIRD ROLE]", sub: "[COMPANY] · [LOCATION]", desc: "[REMOVE THIS ENTRY IF YOU DO NOT NEED IT.]" },
];

export const CONTACTS = [
  { num: "01", name: "GitHub", desc: "public code and documentation", href: "https://github.com/wfazli52" },
  { num: "02", name: "LinkedIn", desc: "[ADD YOUR LINKEDIN PROFILE]", href: "https://www.linkedin.com/in/your-handle" },
  { num: "03", name: "Email", desc: "[YOUR PROFESSIONAL EMAIL]", href: "mailto:your.email@example.com" },
  { num: "04", name: "Resume", desc: "add your PDF when ready", href: "/resume" },
];

export interface RadarAxis { axis: string; value: number }
export const RADAR_SKILLS: RadarAxis[] = [
  { axis: "Operations", value: 0.52 },
  { axis: "Networking", value: 0.58 },
  { axis: "Linux", value: 0.48 },
  { axis: "Hardware", value: 0.46 },
  { axis: "Documentation", value: 0.62 },
  { axis: "Automation", value: 0.34 },
];

export interface Gauge { label: string; value: number; unit: string; digits?: number }
export const GAUGES: Gauge[] = [
  { label: "Portfolio", value: 35, unit: "%" },
  { label: "Networking lab", value: 15, unit: "%" },
  { label: "Linux lab", value: 10, unit: "%" },
  { label: "Evidence", value: 5, unit: "%" },
];

export interface WaffleSlice { label: string; value: number; color: string }
export const TIME_ALLOC: WaffleSlice[] = [
  { label: "WGU coursework", value: 35, color: "var(--accent)" },
  { label: "Hands-on labs", value: 30, color: "oklch(0.72 0.16 205)" },
  { label: "Documentation", value: 20, color: "oklch(0.72 0.16 95)" },
  { label: "Career preparation", value: 15, color: "oklch(0.62 0.16 25)" },
];
'''
write(SRC / "specimen" / "data.ts", data_ts)

site_config_ts = r'''
export interface SiteConfig {
  personal: { name: string; firstName: string; logo: string; tagline: string; email: string; github: string; githubHandle: string };
  socialLinks: { platform: string; url: string }[];
  idleMessages: string[];
  scrollQuirks: { speedWarnings: string[]; bottomMessages: string[] };
  tldr: { title: string; unlockMessage: string; summaryText: string; items: { label: string; value: string }[]; backText: string; footerHint: string };
  commandPalette: {
    placeholder: string; hintTyping: string; hintKeys: string; phone: string; statsHeading: string; secretHeading: string;
    secretFoundText: string; txtHeading: string; txtChatLink: string; backText: string; commandDescriptions: Record<string, string>;
    secretSections: { commands: string; shortcuts: string; hidden: string; shortcutItems: { key: string; desc: string }[]; hiddenItems: { key: string; desc: string }[] };
  };
  easterEgg: { consoleGreeting: string; consoleMessage: string; consoleTech: string; consoleRecruiter: string; overlayTitle: string; overlayMessage: string; overlayButtonText: string };
}

export const SITE: SiteConfig = {
  personal: {
    name: "[YOUR NAME]",
    firstName: "[FIRST NAME]",
    logo: "YN",
    tagline: "i build infrastructure skills, test them, and publish the proof.",
    email: "your.email@example.com",
    github: "https://github.com/wfazli52",
    githubHandle: "wfazli52",
  },
  socialLinks: [
    { platform: "GitHub", url: "https://github.com/wfazli52" },
    { platform: "LinkedIn", url: "https://www.linkedin.com/in/your-handle" },
    { platform: "Email", url: "mailto:your.email@example.com" },
  ],
  idleMessages: [
    "the network is quiet.", "the rack lights keep blinking.", "still here. the systems are still moving.",
    "the page is waiting for your real evidence.", "every placeholder is a future artifact.",
  ],
  scrollQuirks: {
    speedWarnings: ["high scroll velocity logged.", "skim mode detected.", "the short version lives at /tldr."],
    bottomMessages: ["you reached the final rack unit.", "100% scroll completion unlocked.", "now replace the placeholders with proof."],
  },
  tldr: {
    title: "/tldr",
    unlockMessage: "the recruiter-speed version.",
    summaryText: "the whole portfolio in 30 seconds.",
    items: [
      { label: "target", value: "entry-level data center technician and network-support roles." },
      { label: "learning", value: "network engineering at WGU, Cisco track." },
      { label: "stack", value: "Cisco IOS, TCP/IP, Linux, Git, hardware operations." },
      { label: "status", value: "portfolio live; hands-on evidence being built." },
    ],
    backText: "back to the full site",
    footerHint: "the detailed version is still up there.",
  },
  commandPalette: {
    placeholder: "type a command...", hintTyping: "press / anywhere", hintKeys: "enter to run · esc to close",
    phone: "[YOUR PHONE]", statsHeading: "your session", secretHeading: "all secrets", secretFoundText: "you found the control plane.",
    txtHeading: "get in touch", txtChatLink: "or jump to the contact section →", backText: "← back",
    commandDescriptions: {
      stats: "your browsing stats for this site", tldr: "the whole site in 30 seconds", txt: "contact details", email: "open email",
      secret: "all hidden commands & shortcuts", home: "go back to home", about: "open the dossier", projects: "view planned and verified work",
      github: "view github", linkedin: "open linkedin", clear: "close this prompt",
    },
    secretSections: {
      commands: "type commands", shortcuts: "keyboard shortcuts", hidden: "hidden behaviors",
      shortcutItems: [
        { key: "ctrl/cmd + u", desc: "source-code easter egg" },
        { key: "ctrl/cmd + i", desc: "inspection easter egg" },
      ],
      hiddenItems: [
        { key: "skip sections", desc: "unlocks /tldr" }, { key: "scroll fast", desc: "speed warning" },
        { key: "idle", desc: "ambient messages" }, { key: "reach bottom", desc: "completion message" },
        { key: "↑↑↓↓←→←→BA", desc: "overdrive mode" }, { key: "toggle theme", desc: "lightswitch counter" },
      ],
    },
  },
  easterEgg: {
    consoleGreeting: "You found the infrastructure console.",
    consoleMessage: "The public source lives on GitHub.",
    consoleTech: "React + TypeScript + Three.js.",
    consoleRecruiter: "Hiring? Replace the resume placeholder, then open /resume.",
    overlayTitle: "source code.",
    overlayMessage: "Inspect the public repository and the evidence behind each claim.",
    overlayButtonText: "View on GitHub",
  },
};
'''
write(SRC / "specimen" / "site-config.ts", site_config_ts)

# Replace the original PDF reader with an honest, styled placeholder until the
# portfolio owner supplies a resume. The rest of the route animation remains.
resume_tsx = r'''
import { Link } from 'react-router-dom';
import '../specimen/specimen.css';

export default function Resume() {
  return (
    <main className="notfound shell" style={{ minHeight: '100svh', display: 'grid', alignContent: 'center', gap: '1.25rem' }}>
      <div className="notfound-num mono">RESUME</div>
      <h1 className="notfound-title serif">Add your <em>paper version.</em></h1>
      <p className="notfound-sub mono">REPLACE THIS PAGE WITH YOUR SANITIZED RESUME PDF WHEN IT IS READY</p>
      <p style={{ maxWidth: '62ch', color: 'var(--ink-2)' }}>
        Keep the same name, dates, education, certifications, and project status used across the portfolio. Remove private addresses, school IDs, credentials, serial numbers, and employer-confidential information.
      </p>
      <Link className="idx-link" to="/">Back to the specimen ↖</Link>
    </main>
  );
}
'''
write(SRC / "resume" / "Resume.tsx", resume_tsx)
resume_pdf = PUBLIC / "resume.pdf"
if resume_pdf.exists():
    resume_pdf.unlink()

# Targeted copy changes preserve every original interaction and component while
# adapting the narrative to an entry-level infrastructure portfolio.
copy_path = SRC / "specimen" / "copy.ts"
copy_replacements = [
    ('topLeft: "IMRAN WAFA"', 'topLeft: "[YOUR NAME]"'),
    ('topRight: "SPECIMEN SHEET · v3"', 'topRight: "INFRASTRUCTURE SPECIMEN · v1"'),
    ('location: "Washington · 38.9° N"', 'location: "[YOUR CITY] · [COORDINATE]"'),
    ('center: "A SPECIMEN SHEET · IMRAN WAFA"', 'center: "A SPECIMEN SHEET · [YOUR NAME]"'),
    ('{ k: "SUBJECT", v: "Imran H. Wafa", copy: "Imran H. Wafa" }', '{ k: "SUBJECT", v: "[YOUR NAME]", copy: "[YOUR NAME]" }'),
    ('{ k: "DISCIPLINE", v: "Operations · Data · Systems", taps: ["operations · data · systems: keeping things up and making sense of them.", "i wear all three hats. badly photographed."] }', '{ k: "DISCIPLINE", v: "Data Center · Network · Systems", taps: ["hands-on infrastructure, one verified lab at a time.", "build it. break it safely. document it."] }'),
    ('{ k: "EST.", v: "2020", taps: ["active since 2020.", "five years of keeping things up."] }', '{ k: "EST.", v: "2026", taps: ["building in public.", "the evidence starts here."] }'),
    ('wordPre: "I build "', 'wordPre: "I build "'),
    ('wordEm: "things."', 'wordEm: "systems."'),
    ('wordmark: [{ text: "I build" }, { br: true }, { text: "things.", className: "it" }]', 'wordmark: [{ text: "I build" }, { br: true }, { text: "systems.", className: "it" }]'),
    ('wordmarkSub: "and I keep them running"', 'wordmarkSub: "and I learn how to keep them running"'),
    ('{ text: "Operations & data. I keep network and database systems up in 24/7 environments, then turn the mess into dashboards people can act on, and I sweat the details: " }', '{ text: "I am building hands-on evidence in networking, Linux, server operations, hardware troubleshooting, and technical documentation. I care about the details: " }'),
    ('{ text: "uptime, signals, all of it.", className: "tag-em" }', '{ text: "safe changes, clear tests, and proof.", className: "tag-em" }'),
    ('{ k: "Currently", v: "Data Analytics, B.S.", taps: ["finishing the degree. slowly but surely.", "the analytics track, the useful one."] }', '{ k: "Currently", v: "Network Engineering, B.S.", taps: ["WGU · Cisco track.", "coursework plus hands-on labs."] }'),
    ('{ k: "Stack", v: "Linux · SQL · Python", copy: "Linux · SQL · Python" }', '{ k: "Stack", v: "Cisco IOS · Linux · Git", copy: "Cisco IOS · Linux · Git" }'),
    ('{ k: "Lately", v: "uptime · automation · data", taps: ["monitoring, automation, and sweating the details.", "reliability is just caring out loud."] }', '{ k: "Lately", v: "routing · Linux · break/fix", taps: ["networking, server operations, and evidence.", "repeatable tests beat confident guesses."] }'),
    ('{ k: "Homelab", v: "mail · NAS · AI rig", taps: ["self-hosted: a box for SMTP + a couple of APIs, a NAS for storage, and a dedicated AI rig.", "yes, I run my own mail server. on purpose."] }', '{ k: "Homelab", v: "[ADD YOUR LAB]", taps: ["replace this with hardware you actually operate.", "virtual labs count when they are documented honestly."] }'),
    ('v: "Black, no sugar"', 'v: "[ADD A PERSONAL DETAIL]"'),
    ('label: "Uptime sustained", value: "99.9", unit: "%"', 'label: "Verified projects", value: "0", unit: "public"'),
    ('label: "MTTD cut", value: "30", unit: "%"', 'label: "Career roadmap", value: "90", unit: "days"'),
    ('label: "Daily volume", value: "$2B+", unit: "/day"', 'label: "Lab blueprints", value: "4", unit: "ready"'),
    ('label: "Dedup accuracy lift", value: "23", unit: "%"', 'label: "Evidence templates", value: "6", unit: "ready"'),
    ('label: "Years in ops / data", value: "5", unit: "yrs"', 'label: "Public portfolio", value: "1", unit: "live"'),
    ('"Now shipping: miLoader v0.4"', '"Now building: Enterprise VLAN lab"'),
    ('"Reading: The Pragmatic Engineer"', '"Studying: Network engineering"'),
    ('"Listening: lo-fi & jazz"', '"Practicing: Linux operations"'),
    ('"Currently learning: Rust"', '"Documenting: break/fix workflows"'),
    ('"Open to collaborations"', '"Open to data center technician roles"'),
    ('"Based in Washington, DC"', '"Based in [YOUR CITY, STATE]"'),
    ('"contact@imranwafa.com"', '"your.email@example.com"'),
    ('meta: "DATA · 2020-2025"', 'meta: "LEARNING SYSTEM · 2026"'),
    ('kicker: "FEATURED 01 · HOMELAB / INFRA"', 'kicker: "FEATURED 01 · NETWORKING LAB"'),
    ('title: "The home lab."', 'title: "Enterprise network."'),
    ('["Hypervisor", "Proxmox VE"]', '["Platform", "Cisco Packet Tracer"]'),
    ('["Memory", "1.5 TB RAM"]', '["Segmentation", "4 VLANs"]'),
    ('["GPU", "4× NVIDIA V100 · local LLMs"]', '["Services", "DHCP · DNS"]'),
    ('["Provisioning", "Terraform + Ansible"]', '["Routing", "Inter-VLAN"]'),
    ('["Security", "VLANs · hardened access"]', '["Policy", "ACL · validation"]'),
    ('{ h: "The rack.", body: "Proxmox VE on a full rack: 1.5 TB of RAM, four NVIDIA V100s, and every VM and container the lab runs. This is where anything I build gets tested before it touches something that matters." }', '{ h: "Map the topology.", body: "Start with requirements, naming, addressing, VLAN boundaries, trunks, and the physical and logical diagram before entering configuration." }'),
    ('{ h: "One node, on rails.", body: "Slide a node out and everything is serviceable: compute, storage, and the GPU box that handles local LLM inference. Hardware problems get fixed at the rack, not debugged in software." }', '{ h: "Make traffic move.", body: "Configure switching, gateways, routing, DHCP, DNS, and an access policy; then observe packet flow across the segmented network." }'),
    ('{ h: "Provisioned as code.", body: "Inside: four V100s for LLM work, ZFS-backed storage, segmented VLANs. All of it declared in Terraform and Ansible — the whole lab rebuilds from a repo, not from memory." }', '{ h: "Prove the result.", body: "Run the acceptance matrix, inject controlled faults, capture the troubleshooting path, and publish sanitized evidence only after the tests pass." }'),
    ('kicker: "FEATURED 02 · HOMELAB / SECURITY"', 'kicker: "FEATURED 02 · LINUX OPERATIONS"'),
    ('title: "Rack Motion."', 'title: "Linux operations."'),
    ('["Detection", "Camera + motion tracking"]', '["Hosts", "2 Linux servers"]'),
    ('["Stack", "Python · OpenCV"]', '["Access", "SSH · firewall"]'),
    ('["Trigger", "~10 ft from the rack"]', '["Signals", "logs · storage · services"]'),
    ('["Response", "Lockdown + alert + log"]', '["Recovery", "backup · restore · retest"]'),
    ('{ h: "Someone walks in.", body: "A camera watches the room. Motion detection picks up a person the moment they enter and starts tracking their path — every entry becomes an event with a timestamp." }', '{ h: "Build the hosts.", body: "Define compute, storage, naming, users, SSH access, firewall rules, patching, and a normal operating baseline for two Linux servers." }'),
    ('{ h: "Tracked and flagged.", body: "The figure is followed frame to frame and flagged red. The system doesn\'t care who you say you are — only what the camera sees near the lab." }', '{ h: "Open the chassis.", body: "Inspect services, processes, logs, filesystems, and the hardware components behind the operating system so the failure domain is visible." }'),
    ('{ h: "Ten feet out, it locks.", body: "Close within range of the rack and it locks down: access shut, alert fired, footage kept. It answers one question — who touched my servers — with logs to prove it." }', '{ h: "Recover on purpose.", body: "Introduce safe failures, restore service, validate health, and document what changed, why it worked, and what should be handed to the next shift." }'),
    ('kicker: "FEATURED 03 · HOMELAB / COMPUTE"', 'kicker: "FEATURED 03 · DATA CENTER OPERATIONS"'),
    ('title: "Compute cluster."', 'title: "Rack operations."'),
    ('["Orchestration", "Kubernetes"]', '["Layout", "rack elevation"]'),
    ('["Hardware", "Compute blades · one pool"]', '["Paths", "power · copper · fiber"]'),
    ('["IaC", "Terraform + declarative manifests"]', '["Records", "assets · ports · labels"]'),
    ('["Rebuild", "Bare metal → one command"]', '["Recovery", "replace · validate · handoff"]'),
    ('{ h: "Every part, in the open.", body: "Mainboard, CPU, RAM, GPUs, NVMe storage, and power float apart before anything becomes a node. The hardware is legible because every piece has a job." }', '{ h: "Lay out the rack.", body: "Place switching, compute, patching, and A/B power so rack units, labels, service paths, and dependencies are readable at a glance." }'),
    ('{ h: "One node, assembled.", body: "The parts seat into one serviceable compute blade: status live, and one complete worker ready to join the pool." }', '{ h: "Pull the failed node.", body: "Trace dependencies, isolate power and network paths, remove the affected server safely, and keep the incident timeline current." }'),
    ('{ h: "One Kubernetes stack.", body: "Six nodes lock into a single cluster. Kubernetes lights the control plane, which schedules workloads across the six nodes; Terraform can rebuild it from zero." }', '{ h: "Restore every path.", body: "Replace the component, reconnect power and cabling, validate management and service health, then update inventory and handoff records." }'),
    ('body: "Most of my professional work lives behind NDAs and locked-down systems: NOC monitoring, dashboards, internal tooling, and data pipelines built on the clock. Case studies are available on request."', 'body: "Add professional or volunteer work here only when you can describe it without exposing confidential information. Keep client systems, credentials, serial numbers, and private network details out of the public site."'),
    ('ctaHref: "mailto:contact@imranwafa.com?subject=Work%20projects"', 'ctaHref: "mailto:your.email@example.com?subject=Portfolio%20work"'),
    ('{ text: "My background splits between keeping the lights on in a NOC and querying the resulting data to figure out why they flickered. I care about infrastructure that " }', '{ text: "I am working toward an entry-level infrastructure role and building the habits that make technical work trustworthy: clear requirements, safe changes, repeatable tests, and documentation that another technician can follow. I care about systems that " }'),
    ('{ text: "actually stays up", className: "tag-em" }', '{ text: "can be explained and verified", className: "tag-em" }'),
    ('{ text: ", not just works on a good day. There\'s a difference and most setups skip it." }', '{ text: ", not just screenshots that look finished." }'),
    ('{ text: "When I\'m not watching a NOC queue or a wall of dashboards, I\'m probably tearing down an engine, or scripting away a chore that took less time by hand. Worth it though. I also run a homelab: a server for my own mail and a couple of APIs, a NAS for storage, and an AI rig for local models." }', '{ text: "[ADD A PERSONAL PARAGRAPH ABOUT YOUR BACKGROUND, HOME LAB, WORK STYLE, OR WHAT MADE YOU INTERESTED IN DATA CENTERS AND NETWORK ENGINEERING.]" }'),
    ('{ label: "Years in the field", value: "5", unit: "active" }', '{ label: "Verified projects", value: "0", unit: "public" }'),
    ('{ label: "Certifications", value: "5", unit: "earned" }', '{ label: "Certifications", value: "0", unit: "add yours" }'),
    ('{ label: "Coffee / day", value: "3.2", unit: "cups" }', '{ label: "Career sprint", value: "90", unit: "days" }'),
    ('sub: "Open to work · collaborations · long emails about typography"', 'sub: "Open to data center · deployment · NOC · network-support opportunities"'),
    ('name: { v: "Imran Wafa"', 'name: { v: "[YOUR NAME]"'),
    ('email: { v: "contact@imranwafa.com", copy: "contact@imranwafa.com"', 'email: { v: "your.email@example.com", copy: "your.email@example.com"'),
    ('github: { v: "github.com/imranhwafa", copy: "github.com/imranhwafa"', 'github: { v: "github.com/wfazli52", copy: "github.com/wfazli52"'),
]
replace_in(copy_path, copy_replacements)

# Global identity and URL cleanup across source and public text files.
global_replacements = [
    ("Imran H. Wafa", "[YOUR NAME]"),
    ("Imran Wafa", "[YOUR NAME]"),
    ("IMRAN WAFA", "[YOUR NAME]"),
    ("imranhwafa", "wfazli52"),
    ("contact@imranwafa.com", "your.email@example.com"),
    ("https://imranwafa.com", "https://wfazli52.github.io"),
    ("https://www.imranwafa.com", "https://wfazli52.github.io"),
    ("www.imranwafa.com", "wfazli52.github.io"),
    ("imranwafa.com", "wfazli52.github.io"),
    ("https://www.linkedin.com/in/imran-w-9741082a3", "https://www.linkedin.com/in/your-handle"),
    ("+1 (703) 364-9357", "[YOUR PHONE]"),
    ("+17033649357", "0000000000"),
    ("iw_theme", "portfolio_theme"),
]
for base in (SRC, PUBLIC, APP):
    for path in base.rglob("*"):
        if path.is_file() and path.suffix.lower() in {".ts", ".tsx", ".js", ".jsx", ".html", ".json", ".css", ".md", ".txt", ".svg"}:
            try:
                replace_in(path, global_replacements)
            except UnicodeDecodeError:
                pass

# Replace the long no-JavaScript biography with a truthful compact fallback.
index_path = APP / "index.html"
index_text = index_path.read_text(encoding="utf-8")
index_text = index_text.replace(
    "[YOUR NAME] · Operations technician and data analyst. 24/7 NOC monitoring, network and database infrastructure, and data-quality engineering.",
    "[YOUR NAME] · Aspiring data center technician and network engineer building proof-first networking, Linux, hardware, and operations projects."
)
index_text = index_text.replace(
    "Operations & data. 24/7 NOC monitoring, infrastructure, and data-quality engineering — set like a type-specimen sheet.",
    "Data center, networking, Linux, hardware operations, and proof-first technical projects — set like an interactive specimen sheet."
)
index_text = index_text.replace('"jobTitle": "Operations Technician · Data Analyst"', '"jobTitle": "Aspiring Data Center Technician and Network Engineer"')
index_text = index_text.replace('<h1>I build<br><em>things.</em></h1>', '<h1>I build<br><em>systems.</em></h1>')
index_text = index_text.replace("[YOUR NAME] · specimen sheet", "[YOUR NAME] · infrastructure specimen")
index_text = re.sub(
    r"<noscript>.*?</noscript>",
    '''<noscript><main style="max-width:760px;margin:0 auto;padding:64px 24px;font-family:system-ui,sans-serif"><p style="font:12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#777">Infrastructure specimen · JavaScript disabled</p><h1 style="font-size:clamp(48px,10vw,96px);line-height:.92;margin:28px 0">I build<br><em style="color:#557cff">systems.</em></h1><p style="font-size:18px;line-height:1.6;color:#666">[ADD YOUR 3–5 SENTENCE INTRODUCTION.] This portfolio is designed for data center, deployment, NOC, and network-support opportunities.</p><hr style="border:0;border-top:1px solid #ccc;margin:36px 0"><h2>Projects</h2><p>Enterprise VLAN Lab · Linux Operations Lab · Rack & Cabling Operations · [YOUR NEXT PROJECT]</p><h2>Education</h2><p>WGU · B.S. Network Engineering · Cisco track · In progress</p><h2>Contact</h2><p><a href="https://github.com/wfazli52">GitHub</a> · <a href="mailto:your.email@example.com">your.email@example.com</a> · <a href="https://www.linkedin.com/in/your-handle">LinkedIn</a></p></main></noscript>''',
    index_text,
    flags=re.S,
)
index_path.write_text(index_text, encoding="utf-8")

# Safe learning-oriented KPI values are hardcoded by the original component.
specimen_path = SRC / "specimen" / "Specimen.tsx"
specimen = specimen_path.read_text(encoding="utf-8")
specimen = specimen.replace('aria-label="[YOUR NAME] — I build things, and I keep them running"', 'aria-label="[YOUR NAME] — I build systems and learn how to keep them running"')
specimen = specimen.replace('value={99.9} unit={COPY.hero.kpis[0].unit} digits={1}', 'value={0} unit={COPY.hero.kpis[0].unit} digits={0}')
specimen = specimen.replace('trend={[99.2, 99.5, 99.7, 99.8, 99.9, 99.9]}', 'trend={[0, 0, 0, 0, 0, 0]}')
specimen = specimen.replace('value={30} unit={COPY.hero.kpis[1].unit}', 'value={90} unit={COPY.hero.kpis[1].unit}')
specimen = specimen.replace('trend={[8, 14, 20, 26, 30, 30]}', 'trend={[0, 15, 30, 45, 65, 90]}')
specimen = specimen.replace('trend={[1.0, 1.3, 1.6, 1.8, 1.9, 2.0]}', 'trend={[0, 1, 2, 3, 4, 4]}')
specimen = specimen.replace('value={23} unit={COPY.hero.kpis[3].unit}', 'value={6} unit={COPY.hero.kpis[3].unit}')
specimen = specimen.replace('trend={[6, 10, 14, 18, 21, 23]}', 'trend={[0, 1, 2, 3, 5, 6]}')
specimen = specimen.replace('value={5} unit={COPY.hero.kpis[4].unit}', 'value={1} unit={COPY.hero.kpis[4].unit}')
specimen = specimen.replace('trend={[1, 2, 3, 4, 5, 5]}', 'trend={[0, 0, 0, 1, 1, 1]}', 1)
specimen_path.write_text(specimen, encoding="utf-8")

# Give the permitted adaptation a distinctive electric-indigo system while
# keeping the reference layout and type architecture intact.
css_path = SRC / "specimen" / "specimen.css"
css = css_path.read_text(encoding="utf-8")
css = css.replace("--accent: oklch(0.50 0.23 264);", "--accent: oklch(0.56 0.25 276);")
css = css.replace("--accent-soft: oklch(0.50 0.23 264 / 0.10);", "--accent-soft: oklch(0.56 0.25 276 / 0.12);")
css = css.replace("--highlight: oklch(0.50 0.23 264 / 0.16);", "--highlight: oklch(0.56 0.25 276 / 0.18);")
css = css.replace("--accent: oklch(0.70 0.19 264);", "--accent: oklch(0.73 0.21 276);")
css = css.replace("--accent-soft: oklch(0.70 0.19 264 / 0.14);", "--accent-soft: oklch(0.73 0.21 276 / 0.16);")
css = css.replace("--highlight: oklch(0.70 0.19 264 / 0.24);", "--highlight: oklch(0.73 0.21 276 / 0.26);")
css_path.write_text(css, encoding="utf-8")

# Manifest and brand assets.
manifest_path = PUBLIC / "manifest.json"
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest.update({
        "name": "[YOUR NAME] · Infrastructure Specimen",
        "short_name": "Infra Specimen",
        "description": "An interactive data center and networking portfolio template.",
        "start_url": "/",
        "scope": "/",
        "theme_color": "#101014",
        "background_color": "#101014",
    })
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

favicon = r'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#101014"/><g fill="none" stroke="#7896ff" stroke-width="3"><path d="M16 17h32v30H16z"/><path d="M21 24h22M21 31h22M21 38h22"/></g><g fill="#71f5d0"><circle cx="24" cy="24" r="2"/><circle cx="24" cy="31" r="2"/><circle cx="24" cy="38" r="2"/></g></svg>'''
write(PUBLIC / "favicon.svg", favicon)

og_svg = r'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b0d14"/><stop offset="1" stop-color="#171c35"/></linearGradient><radialGradient id="r"><stop stop-color="#6f8cff" stop-opacity=".55"/><stop offset="1" stop-color="#6f8cff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="url(#g)"/><circle cx="930" cy="240" r="360" fill="url(#r)"/><g stroke="#788fff" stroke-opacity=".22"><path d="M0 90h1200M0 180h1200M0 270h1200M0 360h1200M0 450h1200M0 540h1200"/><path d="M120 0v630M240 0v630M360 0v630M480 0v630M600 0v630M720 0v630M840 0v630M960 0v630M1080 0v630"/></g><text x="80" y="120" fill="#8d9cff" font-family="monospace" font-size="22" letter-spacing="6">INFRASTRUCTURE SPECIMEN</text><text x="75" y="310" fill="#f4f5f8" font-family="Arial, sans-serif" font-size="112" font-weight="700">I build systems.</text><text x="80" y="390" fill="#b7becc" font-family="Arial, sans-serif" font-size="34">[YOUR NAME] · Data Center · Networking · Linux</text><text x="80" y="540" fill="#7184ff" font-family="monospace" font-size="20">BUILD IT · TEST IT · DOCUMENT IT · PUBLISH THE PROOF</text></svg>'''
write(PUBLIC / "og.svg", og_svg)

# Point metadata at the generated SVG card and the GitHub Pages URL.
index_text = index_path.read_text(encoding="utf-8")
index_text = re.sub(r'https://wfazli52\.github\.io/og\.png', 'https://wfazli52.github.io/og.svg', index_text)
index_text = index_text.replace('/og.png', '/og.svg')
index_path.write_text(index_text, encoding="utf-8")

# Keep a plain-language editing guide in the final static output.
edit_guide = r'''
# Replace the placeholders

This site uses the permitted React/TypeScript specimen architecture from `imranwafa.com`, adapted for an infrastructure portfolio.

Send ChatGPT your real details and ask it to update the source template and rebuild. Do not publish passwords, private IP addresses from an employer, device serial numbers, school IDs, API keys, private tickets, or unredacted screenshots.

Replace these first:

- `[YOUR NAME]`, `[FIRST NAME]`, `[YOUR CITY]`, `[COORDINATE]`
- `your.email@example.com`
- `https://www.linkedin.com/in/your-handle`
- Experience and certification placeholders
- Home-lab and project evidence placeholders
- The resume placeholder route

A project should move from planned to completed only after its public artifacts show the configuration, tests, troubleshooting, and final result.
'''
write(PUBLIC / "EDIT_CONTENT.md", edit_guide)

credits = r'''
# Design permission and credits

This deployment adapts the public React/TypeScript specimen architecture of `imranhwafa/Imranwafacom` with the original site owner's permission, as stated by the portfolio owner. Personal content, claims, contact information, and resume material were removed and replaced with editable infrastructure-portfolio placeholders.
'''
write(PUBLIC / "CREDITS.md", credits)

print("Prepared permitted specimen source at", APP)
