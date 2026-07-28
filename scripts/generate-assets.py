#!/usr/bin/env python3
"""Generate deterministic branded raster assets for the static portfolio.

The source artwork remains in SVG form in the repository. This script creates
PNG/WebP variants used by social cards, PWA icons, and install screenshots.
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

BG = (7, 17, 31)
BG2 = (10, 27, 45)
SURFACE = (16, 31, 51)
SURFACE2 = (20, 41, 68)
TEXT = (236, 245, 255)
MUTED = (167, 185, 205)
CYAN = (99, 211, 255)
MINT = (128, 240, 192)
GOLD = (255, 211, 122)
RED = (255, 126, 146)

FONT_REGULAR = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
FONT_BOLD = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
FONT_MONO = Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf")
FONT_MONO_BOLD = Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf")


def font(size: int, *, bold: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    path = FONT_MONO_BOLD if mono and bold else FONT_MONO if mono else FONT_BOLD if bold else FONT_REGULAR
    try:
        return ImageFont.truetype(str(path), size=size)
    except OSError:
        return ImageFont.load_default()


def rounded_gradient(size: tuple[int, int], start=BG, end=BG2) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size, start)
    px = img.load()
    for y in range(h):
        ty = y / max(h - 1, 1)
        for x in range(w):
            tx = x / max(w - 1, 1)
            t = min(1.0, 0.68 * ty + 0.32 * tx)
            px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(start, end))
    return img


def add_glow(base: Image.Image, center: tuple[int, int], radius: int, color: tuple[int, int, int], opacity=120) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = center
    d.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, opacity))
    layer = layer.filter(ImageFilter.GaussianBlur(radius // 2))
    base.paste(layer, (0, 0), layer)


def draw_grid(draw: ImageDraw.ImageDraw, size: tuple[int, int], spacing: int, alpha=32) -> None:
    w, h = size
    color = (*CYAN, alpha)
    for x in range(0, w, spacing):
        draw.line((x, 0, x, h), fill=color, width=1)
    for y in range(0, h, spacing):
        draw.line((0, y, w, y), fill=color, width=1)


def draw_logo(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], letters="WF") -> None:
    x0, y0, x1, y1 = box
    s = min(x1 - x0, y1 - y0)
    draw.rounded_rectangle(box, radius=max(8, s // 5), fill=(*SURFACE2, 245), outline=CYAN, width=max(2, s // 40))
    pad = s * 0.18
    for i, height in enumerate((0.42, 0.78, 0.58)):
        bx = x0 + pad + i * (s * 0.18)
        bw = s * 0.08
        by = y1 - pad
        draw.rounded_rectangle((bx, by - s * height * 0.55, bx + bw, by), radius=max(2, int(bw / 2)), fill=MINT if i == 1 else CYAN)
    f = font(max(12, int(s * 0.21)), bold=True, mono=True)
    bbox = draw.textbbox((0, 0), letters, font=f)
    draw.text((x1 - pad - (bbox[2] - bbox[0]), y0 + pad * 0.78), letters, font=f, fill=TEXT)


def draw_rack(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, *, alert_index: int | None = None) -> None:
    draw.rounded_rectangle((x, y, x + w, y + h), radius=max(12, w // 16), fill=(3, 11, 20), outline=(71, 103, 132), width=max(2, w // 100))
    pad = max(9, w // 18)
    gap = max(6, h // 70)
    units = 6
    unit_h = (h - 2 * pad - gap * (units - 1)) // units
    labels = ["EDGE-RTR-01", "CORE-SW-01", "DNS-SRV-01", "APP-SRV-01", "MON-SRV-01", "PDU-A / B"]
    small = font(max(8, w // 22), mono=True)
    for i in range(units):
        uy = y + pad + i * (unit_h + gap)
        border = RED if alert_index == i else (70, 95, 120)
        fill = (36, 29, 39) if alert_index == i else SURFACE
        draw.rounded_rectangle((x + pad, uy, x + w - pad, uy + unit_h), radius=max(5, unit_h // 7), fill=fill, outline=border, width=max(1, w // 160))
        led = RED if alert_index == i else MINT
        r = max(3, unit_h // 12)
        draw.ellipse((x + pad * 1.6, uy + unit_h / 2 - r, x + pad * 1.6 + 2 * r, uy + unit_h / 2 + r), fill=led)
        draw.text((x + pad * 2.8, uy + unit_h * 0.32), labels[i], font=small, fill=MUTED)
        for j in range(3):
            bx = x + w - pad * 2.2 + j * max(4, pad // 3)
            bh = unit_h * (0.28 + 0.17 * ((i + j) % 3))
            draw.rounded_rectangle((bx, uy + unit_h - bh - unit_h * 0.18, bx + max(2, pad // 5), uy + unit_h * 0.82), radius=2, fill=CYAN if j == 1 else (80, 104, 129))


def draw_network(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, *, alert=False) -> None:
    nodes = [
        (0.12, 0.50, "EDGE"), (0.36, 0.50, "CORE"), (0.63, 0.25, "DNS"),
        (0.63, 0.72, "APP"), (0.88, 0.25, "OPS"), (0.88, 0.72, "ENG")
    ]
    links = [(0, 1), (1, 2), (1, 3), (2, 4), (3, 5), (2, 3)]
    points = [(x + int(nx * w), y + int(ny * h)) for nx, ny, _ in nodes]
    for idx, (a, b) in enumerate(links):
        color = RED if alert and idx == 2 else (70, 121, 151)
        draw.line((*points[a], *points[b]), fill=color, width=max(2, w // 260))
        for k in range(1, 4):
            t = (k * 0.23 + idx * 0.11) % 1
            px = points[a][0] + (points[b][0] - points[a][0]) * t
            py = points[a][1] + (points[b][1] - points[a][1]) * t
            r = max(2, w // 220)
            draw.ellipse((px - r, py - r, px + r, py + r), fill=MINT if idx % 2 else CYAN)
    nf = font(max(9, w // 55), bold=True, mono=True)
    for i, ((nx, ny, label), (px, py)) in enumerate(zip(nodes, points)):
        r = max(16, w // 24)
        fill = (50, 26, 38) if alert and i == 3 else SURFACE2
        outline = RED if alert and i == 3 else CYAN if i < 2 else MINT
        draw.ellipse((px - r, py - r, px + r, py + r), fill=fill, outline=outline, width=max(2, w // 180))
        bbox = draw.textbbox((0, 0), label, font=nf)
        draw.text((px - (bbox[2] - bbox[0]) / 2, py - (bbox[3] - bbox[1]) / 2 - 1), label, font=nf, fill=TEXT)


def make_icon(size: int, path: Path, *, maskable=False) -> None:
    img = rounded_gradient((size, size), BG, (11, 45, 64)).convert("RGBA")
    add_glow(img, (int(size * 0.22), int(size * 0.18)), int(size * 0.48), CYAN, 90)
    add_glow(img, (int(size * 0.82), int(size * 0.78)), int(size * 0.45), MINT, 75)
    draw = ImageDraw.Draw(img, "RGBA")
    margin = int(size * (0.20 if maskable else 0.12))
    draw_logo(draw, (margin, margin, size - margin, size - margin))
    img.convert("RGB").save(path, "PNG", optimize=True)


def make_social_card(path: Path) -> None:
    size = (1200, 630)
    img = rounded_gradient(size, BG, (11, 38, 58)).convert("RGBA")
    add_glow(img, (130, 70), 360, CYAN, 90)
    add_glow(img, (1050, 590), 360, MINT, 70)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_grid(draw, size, 54, 22)
    draw_logo(draw, (72, 66, 170, 164))
    draw.text((198, 88), "DC//NET PORTFOLIO", font=font(28, bold=True, mono=True), fill=MINT)
    draw.text((72, 218), "Infrastructure proof,\nnot empty claims.", font=font(64, bold=True), fill=TEXT, spacing=5)
    draw.text((75, 385), "Data center operations • Cisco networking • Linux • Troubleshooting", font=font(24), fill=MUTED)
    draw.rounded_rectangle((75, 465, 475, 530), radius=18, fill=(16, 31, 51, 230), outline=(99, 211, 255, 95), width=2)
    draw.ellipse((100, 489, 116, 505), fill=MINT)
    draw.text((132, 482), "PROOF-FIRST • SIMULATION-LABELED", font=font(18, bold=True, mono=True), fill=TEXT)
    draw_rack(draw, 835, 65, 275, 500)
    img.convert("RGB").save(path, "PNG", optimize=True)


def panel(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str, *, accent=CYAN) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=22, fill=(9, 23, 39, 242), outline=(99, 211, 255, 55), width=2)
    draw.text((x0 + 20, y0 + 16), title.upper(), font=font(13, bold=True, mono=True), fill=accent)


def make_wide_screenshot(path: Path) -> None:
    size = (1440, 900)
    img = rounded_gradient(size, BG, (9, 34, 52)).convert("RGBA")
    add_glow(img, (120, 80), 360, CYAN, 65)
    add_glow(img, (1320, 820), 400, MINT, 55)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_grid(draw, size, 42, 18)
    draw.rounded_rectangle((38, 28, 1402, 92), radius=20, fill=(5, 14, 25, 240), outline=(99, 211, 255, 48), width=2)
    draw_logo(draw, (56, 40, 103, 87))
    draw.text((120, 51), "DC//NET COMMAND CENTER", font=font(20, bold=True, mono=True), fill=TEXT)
    draw.text((1100, 52), "● SYSTEM ONLINE", font=font(15, bold=True, mono=True), fill=MINT)
    panel(draw, (38, 116, 920, 536), "Interactive topology")
    draw_network(draw, 70, 165, 810, 325, alert=True)
    panel(draw, (944, 116, 1402, 536), "Rack explorer", accent=MINT)
    draw_rack(draw, 1008, 160, 330, 335, alert_index=3)
    panel(draw, (38, 558, 920, 862), "Troubleshooting terminal", accent=GOLD)
    mono = font(17, mono=True)
    terminal_lines = [
        "$ nslookup intranet.lab", ";; connection timed out; no servers could be reached", "", "$ systemctl status named", "● named.service — failed (configuration syntax error)", "", "$ restore last-known-good && systemctl restart named", "✓ service active • resolver validation passed"
    ]
    yy = 605
    for line in terminal_lines:
        color = MINT if line.startswith("✓") else RED if "failed" in line or "timed out" in line else CYAN if line.startswith("$") else MUTED
        draw.text((67, yy), line, font=mono, fill=color)
        yy += 29
    panel(draw, (944, 558, 1402, 862), "Incident brief", accent=RED)
    draw.text((974, 607), "INC-204  •  P2", font=font(16, bold=True, mono=True), fill=GOLD)
    draw.text((974, 648), "DNS service outage", font=font(28, bold=True), fill=TEXT)
    lines = ["Names fail; IP traffic works", "Root cause isolated", "Recovery validated", "Ticket handoff ready"]
    yy = 706
    for i, line in enumerate(lines):
        draw.ellipse((978, yy + 4, 990, yy + 16), fill=MINT if i > 0 else CYAN)
        draw.text((1004, yy), line, font=font(16), fill=MUTED)
        yy += 34
    img.convert("RGB").save(path, "WEBP", quality=88, method=6)


def make_mobile_screenshot(path: Path) -> None:
    size = (390, 844)
    img = rounded_gradient(size, BG, (9, 35, 52)).convert("RGBA")
    add_glow(img, (45, 35), 160, CYAN, 65)
    add_glow(img, (350, 790), 180, MINT, 55)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_grid(draw, size, 30, 17)
    draw.rounded_rectangle((15, 16, 375, 70), radius=17, fill=(4, 13, 23, 245), outline=(99, 211, 255, 48), width=1)
    draw_logo(draw, (27, 26, 60, 59))
    draw.text((73, 33), "DC//NET", font=font(17, bold=True, mono=True), fill=TEXT)
    draw.text((274, 34), "● ONLINE", font=font(11, bold=True, mono=True), fill=MINT)
    draw.text((22, 101), "Proof-first\ninfrastructure portfolio", font=font(31, bold=True), fill=TEXT, spacing=3)
    draw.text((23, 185), "Verified evidence and training simulations\nstay clearly separated.", font=font(14), fill=MUTED, spacing=4)
    panel(draw, (16, 242, 374, 472), "Live topology")
    draw_network(draw, 27, 282, 334, 166, alert=True)
    panel(draw, (16, 491, 374, 676), "Incident simulator", accent=GOLD)
    draw.text((35, 535), "INC-204  DNS OUTAGE", font=font(15, bold=True, mono=True), fill=GOLD)
    draw.text((35, 572), "Names fail; IP traffic works", font=font(17, bold=True), fill=TEXT)
    draw.rounded_rectangle((35, 618, 210, 653), radius=10, fill=(99, 211, 255, 40), outline=(99, 211, 255, 90))
    draw.text((51, 627), "RUN DIAGNOSTIC", font=font(12, bold=True, mono=True), fill=CYAN)
    panel(draw, (16, 695, 374, 827), "Verified proof ledger", accent=MINT)
    draw.text((35, 739), "1 / 5 milestones verified", font=font(18, bold=True), fill=TEXT)
    draw.rounded_rectangle((35, 780, 350, 795), radius=8, fill=(50, 70, 90))
    draw.rounded_rectangle((35, 780, 98, 795), radius=8, fill=MINT)
    img.convert("RGB").save(path, "WEBP", quality=88, method=6)


def main() -> None:
    make_icon(32, ASSETS / "icon-32.png")
    make_icon(192, ASSETS / "icon-192.png")
    make_icon(512, ASSETS / "icon-512.png")
    make_icon(180, ASSETS / "apple-touch-icon.png")
    make_icon(512, ASSETS / "maskable-icon-512.png", maskable=True)
    make_social_card(ASSETS / "social-card.png")
    make_wide_screenshot(ASSETS / "screenshot-wide.webp")
    make_mobile_screenshot(ASSETS / "screenshot-mobile.webp")
    print("Generated 8 branded raster assets.")


if __name__ == "__main__":
    main()
