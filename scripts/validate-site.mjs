#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const warnings = [];
const checked = { html: 0, js: 0, links: 0, files: 0 };

const requiredFiles = [
  'index.html', 'resume.html', 'recruiter.html', '404.html', 'offline.html',
  'styles.css', 'script.js', 'config.js', 'command-center.js',
  'proof-data.js', 'proof-mode.js', 'proof-mode.css',
  'portfolio-data.js', 'portfolio-suite.js', 'portfolio-suite.css',
  'case-study.js', 'case-study.css', 'manifest.webmanifest', 'sw.js',
  'assets/brand-mark.svg', 'assets/icon.svg', 'assets/maskable-icon.svg',
  'assets/icon-32.png', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/apple-touch-icon.png', 'assets/maskable-icon-512.png',
  'assets/social-card.svg', 'assets/social-card.png', 'assets/portfolio-qr.svg',
  'assets/screenshot-wide.webp', 'assets/screenshot-mobile.webp',
  'projects/enterprise-network.html', 'projects/linux-monitoring.html',
  'projects/incident-response.html', 'projects/rack-inventory.html',
  'docs/EVIDENCE_PACKAGE_GUIDE.md', 'robots.txt', 'sitemap.xml', 'humans.txt',
  '.well-known/security.txt', 'recruiter.css', 'SITE_SYSTEM.md', 'CHANGELOG.md',
  '.github/workflows/site-quality.yml'
];

function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }

function walk(directory) {
  const output = [];
  for (const entry of readdirSync(directory)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) output.push(...walk(path));
    else output.push(path);
  }
  return output;
}

function localPathFromReference(sourceFile, reference) {
  if (!reference || reference.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) return null;
  const clean = reference.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (clean.startsWith('/')) return resolve(root, clean.slice(1));
  return resolve(dirname(sourceFile), clean);
}

function resolveLocalTarget(path) {
  if (existsSync(path)) return path;
  if (existsSync(`${path}.html`)) return `${path}.html`;
  if (existsSync(join(path, 'index.html'))) return join(path, 'index.html');
  return null;
}

function checkHtml(path) {
  checked.html += 1;
  const rel = relative(root, path);
  const html = readFileSync(path, 'utf8');
  if (!/^\s*<!doctype html>/i.test(html)) fail(`${rel}: missing HTML doctype`);
  if (!/<html\b[^>]*\blang=/i.test(html)) fail(`${rel}: missing html lang attribute`);
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) fail(`${rel}: missing viewport meta`);
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(`${rel}: missing non-empty title`);
  if (!/<meta\b[^>]*name=["']description["']/i.test(html)) warn(`${rel}: missing description meta`);
  if (!/<link\b[^>]*rel=["']canonical["']/i.test(html)) fail(`${rel}: missing canonical link`);
  if (!/<link\b[^>]*rel=["']manifest["']/i.test(html)) fail(`${rel}: missing web app manifest link`);
  if (!/<meta\b[^>]*property=["']og:title["']/i.test(html)) fail(`${rel}: missing Open Graph title`);
  if (!/<meta\b[^>]*property=["']og:image["']/i.test(html)) fail(`${rel}: missing Open Graph image`);
  if (!/<meta\b[^>]*name=["']twitter:card["']/i.test(html)) fail(`${rel}: missing Twitter card metadata`);
  if (!/<meta\b[^>]*name=["']robots["']/i.test(html)) fail(`${rel}: missing robots directive`);

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  duplicates.forEach((id) => fail(`${rel}: duplicate id "${id}"`));

  const references = [...html.matchAll(/(?:^|\s)(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const reference of references) {
    const local = localPathFromReference(path, reference);
    if (!local) continue;
    checked.links += 1;
    if (!resolveLocalTarget(local)) fail(`${rel}: broken local reference "${reference}"`);
  }

  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  for (const image of images) {
    if (!/\balt=["'][^"']*["']/i.test(image)) fail(`${rel}: image missing alt attribute`);
  }
}

function checkJavaScript(path) {
  checked.js += 1;
  try {
    execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' });
  } catch (error) {
    fail(`${relative(root, path)}: JavaScript syntax error\n${String(error.stderr || error.message)}`);
  }
}

function evaluateWindowData(path, property) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(path, 'utf8'), sandbox, { filename: path, timeout: 2000 });
  return sandbox.window[property];
}

function checkPortfolioData() {
  const path = join(root, 'portfolio-data.js');
  const data = evaluateWindowData(path, 'PORTFOLIO_PLATFORM');
  if (!data || typeof data !== 'object') return fail('portfolio-data.js: PORTFOLIO_PLATFORM not created');
  const projects = Object.entries(data.projects || {});
  if (projects.length !== 4) fail(`portfolio-data.js: expected 4 projects, found ${projects.length}`);
  for (const [id, project] of projects) {
    if (!project.title || !project.route) fail(`portfolio-data.js: ${id} missing title or route`);
    if (!resolveLocalTarget(join(root, project.route))) fail(`portfolio-data.js: ${id} route does not exist (${project.route})`);
    if (!Array.isArray(project.tests) || project.tests.length < 5) fail(`portfolio-data.js: ${id} needs at least 5 acceptance tests`);
    if (!Array.isArray(project.evidence) || project.evidence.length < 5) fail(`portfolio-data.js: ${id} needs at least 5 evidence requirements`);
    if (!project.architecture?.nodes?.length) fail(`portfolio-data.js: ${id} has no architecture nodes`);
    if (project.status === 'verified') warn(`portfolio-data.js: ${id} says verified; proof-data.js remains the authority`);
  }
}

function checkProofData() {
  const path = join(root, 'proof-data.js');
  if (!existsSync(path)) return fail('proof-data.js: missing');
  const data = evaluateWindowData(path, 'PORTFOLIO_PROOF');
  if (!data || typeof data !== 'object') return fail('proof-data.js: PORTFOLIO_PROOF not created');
  const allowed = new Set(['verified', 'in-progress', 'planned', 'simulation']);
  for (const milestone of data.milestones || []) {
    if (!allowed.has(milestone.status)) fail(`proof-data.js: ${milestone.id} has invalid status ${milestone.status}`);
    if (milestone.status === 'verified') {
      if (!milestone.verifiedAt) fail(`proof-data.js: verified milestone ${milestone.id} has no verifiedAt date`);
      if (!Array.isArray(milestone.evidence) || milestone.evidence.length === 0) fail(`proof-data.js: verified milestone ${milestone.id} has no evidence links`);
      for (const evidence of milestone.evidence || []) {
        if (!/^https:\/\//.test(evidence.href || '')) fail(`proof-data.js: verified evidence for ${milestone.id} must use an HTTPS public link`);
      }
    }
  }
}

function checkManifest() {
  const path = join(root, 'manifest.webmanifest');
  let manifest;
  try { manifest = JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { return fail(`manifest.webmanifest: invalid JSON (${error.message})`); }
  for (const key of ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color', 'icons']) {
    if (!manifest[key]) fail(`manifest.webmanifest: missing ${key}`);
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) fail('manifest.webmanifest: include regular and maskable icons');
  for (const icon of manifest.icons || []) {
    const target = resolveLocalTarget(join(root, icon.src || ''));
    if (!target) fail(`manifest.webmanifest: missing icon ${icon.src}`);
  }
  if (!Array.isArray(manifest.screenshots) || manifest.screenshots.length < 2) fail('manifest.webmanifest: include wide and narrow screenshots');
  for (const screenshot of manifest.screenshots || []) {
    const target = resolveLocalTarget(join(root, screenshot.src || ''));
    if (!target) fail(`manifest.webmanifest: missing screenshot ${screenshot.src}`);
  }
  const purposes = new Set((manifest.icons || []).flatMap((icon) => String(icon.purpose || '').split(/\s+/)));
  if (!purposes.has('maskable')) fail('manifest.webmanifest: missing a maskable icon');
}

function checkSecrets(files) {
  const patterns = [
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
    [/\bghp_[A-Za-z0-9]{20,}\b/, 'GitHub token'],
    [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
    [/\b(?:sk|rk)-[A-Za-z0-9_-]{20,}\b/, 'API secret-like token']
  ];
  for (const path of files) {
    if (!['.html', '.js', '.css', '.md', '.txt', '.json', '.webmanifest', '.xml', '.yml', '.yaml', '.csv'].includes(extname(path))) continue;
    const content = readFileSync(path, 'utf8');
    for (const [pattern, label] of patterns) {
      if (pattern.test(content)) fail(`${relative(root, path)}: possible ${label}`);
    }
  }
}

for (const file of requiredFiles) {
  checked.files += 1;
  if (!existsSync(join(root, file))) fail(`required file missing: ${file}`);
}

const files = walk(root);
files.filter((path) => extname(path) === '.html').forEach(checkHtml);
files.filter((path) => extname(path) === '.js').forEach(checkJavaScript);
checkManifest();
checkPortfolioData();
checkProofData();
checkSecrets(files);

console.log(`Checked ${checked.files} required files, ${checked.html} HTML pages, ${checked.js} JavaScript files, and ${checked.links} local references.`);
if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach((message) => console.log(`- ${message}`));
}
if (failures.length) {
  console.error('\nValidation failures:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log('\nSite validation passed.');
}
