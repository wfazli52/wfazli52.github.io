# Data Center & Networking Portfolio

A no-framework, responsive portfolio site for GitHub user `wfazli52`, an aspiring data center technician and future network engineer. It intentionally labels projects as **planned** until they are completed and documented.

## Start here

1. Open `config.js` and replace the GitHub handle with your preferred public name. Add an email, location, or LinkedIn URL only when you are comfortable publishing it.
2. Open `index.html` in a browser.
3. Read `ROADMAP.md` and begin Project 01.
4. Save real screenshots, command output, diagrams, configuration files, test results, and incident notes.
5. Update each project page only after the acceptance tests pass.
6. Edit `resume.html` and remove every yellow placeholder before applying.

## Files

- `index.html` — portfolio home page
- `config.js` — your name, location, contact links, and headline
- `styles.css` — the complete visual design
- `script.js` — navigation, profile injection, email copy, and print behavior
- `resume.html` — editable, print-ready resume template
- `projects/` — four detailed lab plans
- `docs/` — project, incident, test, IP, asset, and cable templates
- `ROADMAP.md` — 90-day weekly plan
- `CHATGPT_WORKFLOW.md` — safe, practical prompts for using ChatGPT as a tutor, reviewer, and documentation assistant

## Preview locally

Double-click `index.html`, or run a simple local web server from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Publish with GitHub Pages

1. Create a public repository named `wfazli52.github.io`.
2. Upload all files from this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/(root)`.
5. Save. The intended public address is `https://wfazli52.github.io/`.

Before publishing, remove private information, passwords, real public IP addresses, device serial numbers, school IDs, API keys, and unredacted screenshots.

## Portfolio evidence standard

A project is complete only when it contains:

- A clear objective and constraints
- A diagram or architecture view
- Build notes and relevant configuration
- A test matrix with expected and actual results
- At least one problem you encountered and how you isolated it
- Sanitized evidence such as screenshots, logs, or command output
- A reflection describing what you would improve

## Suggested folder pattern for each completed project

```text
project-name/
├── README.md
├── diagrams/
├── configs/
├── evidence/
├── tests/
└── incidents/
```
