# DC//NET Portfolio Platform

The site is a dependency-free static portfolio designed for GitHub Pages. It combines a recruiter-safe evidence layer with optional browser-based simulations.

## Runtime layers

1. `config.js` — public profile fields.
2. `script.js` — core profile injection, navigation, page transitions, and loader orchestration.
3. `proof-data.js`, `proof-mode.js`, `proof-mode.css` — verified evidence versus simulation separation.
4. `command-center.js` — interactive incident, terminal, rack, and operations simulator.
5. `portfolio-data.js` — centralized project and command-palette data.
6. `portfolio-suite.js`, `portfolio-suite.css` — metadata, PWA, command palette, recruiter actions, keyboard support, and global polish.
7. `case-study.js`, `case-study.css` — Project Pages 2.0 for all four technical labs.

## Main keyboard shortcuts

- `Ctrl/Command + K` — command palette
- `Alt + P` — Verified Evidence / Simulation mode
- `Alt + R` — recruiter tour
- `Alt + T` — troubleshooting terminal
- `O` — operations mode when focus is not in a form field
- `Esc` — close the active overlay

## PWA and offline behavior

`manifest.webmanifest` makes the portfolio installable where supported. `sw.js` uses:

- Network-first navigation so fresh HTML is preferred
- Stale-while-revalidate for CSS, JavaScript, images, and manifests
- A dedicated offline fallback page
- Versioned cache cleanup
- An update prompt when a new service worker is ready

## Project data workflow

`portfolio-data.js` controls the interactive case-study architecture, build phases, planned tests, configuration templates, training incidents, evidence slots, and recruiter summary. It is not the source of verification truth; `proof-data.js` remains authoritative for public evidence status.

## Quality gate

Run:

```bash
node scripts/validate-site.mjs
```

The GitHub Actions workflow runs the same check on pushes and pull requests. It validates required files, JavaScript syntax, manifest JSON, internal links, duplicate IDs, project data, proof integrity, and obvious secret patterns.
