from __future__ import annotations

import os
from pathlib import Path

APP = Path(os.environ.get("REFERENCE_APP", "_reference/app")).resolve()
SRC = APP / "src"


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Expected education marker not found in {path}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


data = SRC / "specimen" / "data.ts"
replace_once(
    data,
    '''export const EDUCATION: ResumeEntry[] = [
  { period: "In progress", title: "Associate in Cybersecurity", sub: "Northern Virginia Community College", desc: "Cybersecurity associate-degree coursework. Add expected graduation date and completed courses when ready." },
];''',
    '''export const EDUCATION: ResumeEntry[] = [
  { period: "In progress", title: "Associate in Cybersecurity", sub: "Northern Virginia Community College", desc: "Current degree path focused on cybersecurity fundamentals while building hands-on networking, Linux, hardware, and data-center operations labs." },
  { period: "Planned next", title: "B.S. Network Engineering · Cisco track", sub: "Western Governors University", desc: "Planned bachelor's path after the associate degree. Not presented as current enrollment; intended to deepen routing, switching, network design, automation, and infrastructure operations skills." },
];''',
)

config = SRC / "specimen" / "site-config.ts"
replace_once(
    config,
    '{ label: "learning", value: "Associate in Cybersecurity · Northern Virginia Community College." },',
    '{ label: "learning", value: "Associate in Cybersecurity · NOVA now; B.S. Network Engineering · WGU planned next." },',
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
copy.write_text(text, encoding="utf-8")

# Keep the non-JavaScript fallback aligned with the same honest education story.
index = APP / "index.html"
html = index.read_text(encoding="utf-8")
html = html.replace(
    '<h2>Education</h2><p>Northern Virginia Community College · Associate in Cybersecurity · In progress</p>',
    '<h2>Education</h2><p>Northern Virginia Community College · Associate in Cybersecurity · In progress<br>Western Governors University · B.S. Network Engineering · Cisco track · Planned next</p>',
)
index.write_text(html, encoding="utf-8")
