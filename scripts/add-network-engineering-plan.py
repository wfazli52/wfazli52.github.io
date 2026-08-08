from __future__ import annotations

import os
from pathlib import Path

APP = Path(os.environ.get("REFERENCE_APP", "_reference/app")).resolve()
SRC = APP / "src"


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Expected marker not found in {path}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


data = SRC / "specimen" / "data.ts"
replace_once(
    data,
    '''export const EDUCATION: ResumeEntry[] = [
  { period: "In progress", title: "Associate in Cybersecurity", sub: "Northern Virginia Community College", desc: "Cybersecurity associate-degree coursework. Add expected graduation date and completed courses when ready." },
];''',
    '''export const EDUCATION: ResumeEntry[] = [
  { period: "In progress", title: "Associate in Cybersecurity", sub: "Northern Virginia Community College", desc: "Current degree path focused on cybersecurity fundamentals while building hands-on networking, Linux, hardware, and data-center operations labs." },
  { period: "Planned next", title: "B.S. Network Engineering · Cisco track", sub: "Western Governors University", desc: "Planned bachelor's path after the associate degree. Not presented as current enrollment; intended to deepen routing, switching, network design, automation, cloud, and infrastructure operations skills." },
];''',
)

replace_once(
    data,
    '''export const CERTS: ResumeEntry[] = [
  { period: "In progress", title: "CCNA", sub: "Cisco", desc: "[ADD TARGET DATE OR REMOVE THIS ENTRY.]", upcoming: true },
  { period: "[STATUS]", title: "[CERTIFICATION]", sub: "[ISSUER]", desc: "[ADD ONLY A CERTIFICATION YOU EARNED OR ARE ACTIVELY PURSUING.]", upcoming: true },
  { period: "[STATUS]", title: "[CERTIFICATION]", sub: "[ISSUER]", desc: "[OPTIONAL THIRD CREDENTIAL.]", upcoming: true },
];''',
    '''export const CERTS: ResumeEntry[] = [
  { period: "Planned", title: "CompTIA A+", sub: "CompTIA", desc: "Planned certification target aligned with the future WGU Cisco-focused network engineering degree path. Not yet earned.", upcoming: true },
  { period: "Planned", title: "Linux Essentials", sub: "Linux Professional Institute (LPI)", desc: "Planned certification target for Linux fundamentals used in infrastructure and server operations. Not yet earned.", upcoming: true },
  { period: "Planned", title: "ITIL 4 Foundation", sub: "PeopleCert / ITIL", desc: "Planned certification target for service-management and operational-process fundamentals. Not yet earned.", upcoming: true },
  { period: "Planned", title: "Cisco Certified Network Associate (CCNA)", sub: "Cisco", desc: "Planned core networking certification covering network fundamentals, access, IP connectivity, services, security fundamentals, and automation. Not yet earned.", upcoming: true },
  { period: "Planned", title: "Cisco Certified Cybersecurity Associate", sub: "Cisco", desc: "Planned Cisco cybersecurity certification target associated with the future degree path. Not yet earned.", upcoming: true },
  { period: "Planned", title: "Cisco DevNet Associate / CCNA Automation", sub: "Cisco", desc: "Planned automation and programmability certification target associated with the future degree path. Not yet earned.", upcoming: true },
  { period: "Planned", title: "CompTIA Cloud+", sub: "CompTIA", desc: "Planned cloud-infrastructure certification target associated with the future degree path. Not yet earned.", upcoming: true },
  { period: "Planned", title: "WGU Certified Network Technician Badge", sub: "Western Governors University", desc: "Planned program credential listed with WGU's current Cisco specialization. Not yet earned.", upcoming: true },
];''',
)

config = SRC / "specimen" / "site-config.ts"
replace_once(
    config,
    '{ label: "learning", value: "Associate in Cybersecurity · Northern Virginia Community College." },',
    '{ label: "learning", value: "Associate in Cybersecurity · NOVA now; B.S. Network Engineering · WGU Cisco track planned next." },',
)

copy = SRC / "specimen" / "copy.ts"
text = copy.read_text(encoding="utf-8")
text = text.replace(
    '{ k: "Currently", v: "Cybersecurity, Associate", taps: ["Northern Virginia Community College.", "cybersecurity coursework plus infrastructure labs."] }',
    '{ k: "Currently", v: "Cybersecurity, Associate", taps: ["Northern Virginia Community College.", "next planned degree: WGU B.S. Network Engineering · Cisco track."] }',
    1,
)
text = text.replace(
    '"Studying: Cybersecurity at NOVA"',
    '"Studying: Cybersecurity at NOVA · Network Engineering next"',
    1,
)
text = text.replace(
    '"Practicing: Linux operations"',
    '"Planned certs: A+ · Linux Essentials · ITIL · CCNA · Cybersecurity · DevNet · Cloud+"',
    1,
)
copy.write_text(text, encoding="utf-8")

# Keep the non-JavaScript fallback aligned with the same honest education story.
index = APP / "index.html"
html = index.read_text(encoding="utf-8")
html = html.replace(
    '<h2>Education</h2><p>Northern Virginia Community College · Associate in Cybersecurity · In progress</p>',
    '<h2>Education</h2><p>Northern Virginia Community College · Associate in Cybersecurity · In progress<br>Western Governors University · B.S. Network Engineering · Cisco track · Planned next</p><h2>Planned certifications</h2><p>CompTIA A+ · LPI Linux Essentials · ITIL 4 Foundation · Cisco CCNA · Cisco Certified Cybersecurity Associate · Cisco DevNet Associate / CCNA Automation · CompTIA Cloud+ · WGU Certified Network Technician Badge</p>',
)
index.write_text(html, encoding="utf-8")
