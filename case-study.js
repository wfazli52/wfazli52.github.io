(() => {
  'use strict';

  if (window.__PORTFOLIO_CASE_STUDY__) return;
  window.__PORTFOLIO_CASE_STUDY__ = true;

  const platform = window.PORTFOLIO_PLATFORM || { projects: {} };
  const ownScript = Array.from(document.scripts).find((script) => /(?:^|\/)case-study\.js(?:\?|$)/.test(script.src));
  const siteRoot = ownScript?.src ? new URL('.', ownScript.src) : new URL('../', document.baseURI);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {
    projectId: '',
    project: null,
    activeTab: 'overview',
    testFilter: 'all',
    activeConfig: '',
    activeNode: '',
    initialized: false
  };

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const slug = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const rootUrl = (path = '') => new URL(path, siteRoot).href;

  function identifyProject() {
    const path = new URL(document.baseURI || location.href).pathname.replace(/\/+$/, '');
    return Object.entries(platform.projects || {}).find(([, project]) => {
      const route = new URL(project.route, siteRoot).pathname.replace(/\/+$/, '');
      return route === path;
    }) || null;
  }

  function proofMilestone() {
    const milestones = window.PORTFOLIO_PROOF?.milestones || [];
    return milestones.find((milestone) => milestone.id === state.projectId || milestone.route?.endsWith(state.project.route));
  }

  function proofStatus() {
    return proofMilestone()?.status || state.project.status || 'planned';
  }

  function statusLabel(status) {
    return ({ verified: 'Verified evidence', 'in-progress': 'Evidence in progress', planned: 'Planned · evidence pending', simulation: 'Simulation' })[status] || status;
  }

  function proofMode() {
    return document.body.dataset.proofMode || document.documentElement.dataset.proofMode || 'verified';
  }

  function tabDefinitions() {
    return [
      ['overview', 'Overview'],
      ['architecture', 'Architecture'],
      ['build', 'Build plan'],
      ['testing', 'Testing'],
      ['configuration', 'Configuration'],
      ['incidents', 'Incidents'],
      ['evidence', 'Evidence'],
      ['recruiter', 'Recruiter summary']
    ];
  }

  function statusChip(status = proofStatus()) {
    return `<span class="case-study-status" data-case-status data-status="${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</span>`;
  }

  function createShell() {
    const project = state.project;
    const section = document.createElement('section');
    section.className = 'case-study-section';
    section.id = 'case-study';
    section.setAttribute('aria-labelledby', 'case-study-title');
    section.innerHTML = `
      <div class="container">
        <div class="case-study-shell">
          <header class="case-study-hero">
            <div>
              <span class="case-study-kicker">${escapeHtml(project.eyebrow)} · Project ${escapeHtml(project.number)}</span>
              <h2 id="case-study-title">${escapeHtml(project.title)}</h2>
              <p class="case-study-summary">${escapeHtml(project.summary)}</p>
              <div class="case-study-status-row">
                ${statusChip()}
                <span class="case-study-mode" data-case-mode>${proofMode() === 'simulation' ? 'Simulation context enabled' : 'Verified-evidence context'}</span>
                <span class="case-study-proof-chip">Updated ${escapeHtml(platform.updated || '')}</span>
              </div>
              <div class="case-study-tool-row">${project.tools.map((tool) => `<span class="case-study-tool">${escapeHtml(tool)}</span>`).join('')}</div>
            </div>
            <aside class="case-study-hero-side" aria-label="Project snapshot">
              <div class="case-study-metrics">${project.metrics.map((metric) => `<div class="case-study-metric"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`).join('')}</div>
              <div class="case-study-actions">
                <button class="case-study-action primary" type="button" data-case-tour>Tour this case study</button>
                <button class="case-study-action" type="button" data-case-print>Print / PDF</button>
                <button class="case-study-action" type="button" data-case-copy-summary>Copy summary</button>
              </div>
            </aside>
          </header>
          <div class="case-study-tabs-wrap">
            <div class="case-study-tabs" role="tablist" aria-label="Project case study sections">
              ${tabDefinitions().map(([id, label], index) => `<button class="case-study-tab" id="case-tab-${id}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="case-panel-${id}" tabindex="${index === 0 ? 0 : -1}" data-case-tab="${id}">${escapeHtml(label)}</button>`).join('')}
            </div>
          </div>
          <div class="case-study-panels">
            ${renderOverview()}
            ${renderArchitecture()}
            ${renderBuild()}
            ${renderTesting()}
            ${renderConfiguration()}
            ${renderIncidents()}
            ${renderEvidence()}
            ${renderRecruiter()}
          </div>
        </div>
      </div>`;
    return section;
  }

  function panelHead(kicker, title, copy) {
    return `<div class="case-study-panel-head"><div><span class="case-study-kicker">${escapeHtml(kicker)}</span><h3>${escapeHtml(title)}</h3></div><p>${escapeHtml(copy)}</p></div>`;
  }

  function renderOverview() {
    const project = state.project;
    const milestone = proofMilestone();
    const status = proofStatus();
    const evidenceCount = milestone?.evidence?.length || project.evidence.filter((item) => item.status === 'verified').length;
    return `
      <section class="case-study-panel" id="case-panel-overview" role="tabpanel" aria-labelledby="case-tab-overview" data-case-panel="overview">
        ${panelHead('Mission and scope', 'What this project is designed to prove.', project.careerValue)}
        <div class="case-study-grid two">
          <article class="case-study-card"><h4>Career alignment</h4><p>${escapeHtml(project.careerValue)}</p></article>
          <article class="case-study-card"><h4>Current evidence state</h4><p><strong>${escapeHtml(statusLabel(status))}.</strong> ${evidenceCount} public evidence link${evidenceCount === 1 ? '' : 's'} currently attached. The project is not described as completed until its required artifacts are inspectable.</p></article>
          <article class="case-study-card"><h4>Planned deliverables</h4><ul>${project.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>
          <article class="case-study-card"><h4>Definition of done</h4><ul><li>The architecture matches the documented requirements.</li><li>Expected and actual test results are published.</li><li>At least one fault is diagnosed from evidence.</li><li>Sanitized artifacts support every resume claim.</li></ul></article>
        </div>
        <div class="case-study-integrity"><div class="case-study-integrity-icon">PROOF</div><div><strong>No fabricated completion claims.</strong><p>Templates, sample output, and incident examples on this page are labeled as planning or simulation material. Verification unlocks only after real, sanitized evidence is linked through Proof Mode.</p></div></div>
      </section>`;
  }

  function networkSvg(architecture) {
    const nodesById = Object.fromEntries(architecture.nodes.map((node) => [node.id, node]));
    const width = 1000;
    const height = 600;
    const px = (node) => ({ x: node.x / 100 * width, y: node.y / 100 * height });
    const links = architecture.links.map((link, index) => {
      const from = px(nodesById[link.from]);
      const to = px(nodesById[link.to]);
      const curve = Math.abs(from.y - to.y) < 20 ? 0 : (index % 2 ? 22 : -22);
      const cx = (from.x + to.x) / 2;
      const cy = (from.y + to.y) / 2 + curve;
      const path = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
      return `<g><path class="case-link" id="case-link-${index}" data-kind="${escapeHtml(link.kind || '')}" d="${path}"/><text class="case-link-label" x="${cx}" y="${cy - 7}" text-anchor="middle">${escapeHtml(link.label || '')}</text>${index < 5 ? `<circle class="case-packet" r="4"><animateMotion dur="${5 + index * .7}s" repeatCount="indefinite" path="${path}"/></circle>` : ''}</g>`;
    }).join('');

    const nodes = architecture.nodes.map((node, index) => {
      const p = px(node);
      const words = node.label.split(/\s+/);
      let first = node.label;
      let second = '';
      if (node.label.length > 18 && words.length > 1) {
        const splitAt = Math.ceil(words.length / 2);
        first = words.slice(0, splitAt).join(' ');
        second = words.slice(splitAt).join(' ');
      }
      return `<g class="case-node" data-case-node="${escapeHtml(node.id)}" data-type="${escapeHtml(node.type)}" role="button" tabindex="0" aria-pressed="${index === 0}" aria-label="Inspect ${escapeHtml(node.label)}">
        <rect x="${p.x - 78}" y="${p.y - 34}" width="156" height="68" rx="14"/>
        <text x="${p.x}" y="${p.y - (second ? 8 : 2)}"><tspan x="${p.x}">${escapeHtml(first)}</tspan>${second ? `<tspan x="${p.x}" dy="15">${escapeHtml(second)}</tspan>` : ''}<tspan class="case-node-type" x="${p.x}" dy="16">${escapeHtml(node.type.toUpperCase())}</tspan></text>
      </g>`;
    }).join('');

    return `<svg class="case-architecture-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="case-architecture-svg-title case-architecture-svg-desc"><title id="case-architecture-svg-title">${escapeHtml(state.project.title)} architecture</title><desc id="case-architecture-svg-desc">Interactive planned architecture. Select a node for details.</desc><defs><marker id="cs-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(128,240,192,.55)"/></marker></defs>${links}${nodes}</svg>`;
  }

  function rackMarkup(architecture) {
    const units = Array.from({ length: architecture.rackUnits }, (_, index) => architecture.rackUnits - index);
    const devices = architecture.nodes.filter((node) => node.u > 0).map((node, index) => {
      const bottom = ((node.u - 1) / architecture.rackUnits) * 100;
      const height = (node.height / architecture.rackUnits) * 100;
      return `<button class="case-rack-device" type="button" data-case-node="${escapeHtml(node.id)}" aria-pressed="${index === 0}" style="bottom:${bottom}%;height:calc(${height}% - 2px)" aria-label="Inspect ${escapeHtml(node.label)}"><span class="case-rack-led" aria-hidden="true"></span><span>${escapeHtml(node.label)}</span><span class="case-rack-power">${escapeHtml(node.power || '')}</span></button>`;
    }).join('');
    return `<div class="case-rack-stage" style="--rack-units:${architecture.rackUnits}"><div class="case-rack-rail"><div class="case-rack-units">${units.map((unit) => `<span class="case-rack-unit">U${unit}</span>`).join('')}</div></div><div class="case-rack-body">${devices}</div><button class="case-rack-pdu" type="button" data-case-node="pdu" aria-pressed="false">PDU A / B</button></div>`;
  }

  function renderArchitecture() {
    const architecture = state.project.architecture;
    const first = architecture.nodes[0];
    const canvas = architecture.type === 'rack' ? rackMarkup(architecture) : networkSvg(architecture);
    return `
      <section class="case-study-panel" id="case-panel-architecture" role="tabpanel" aria-labelledby="case-tab-architecture" data-case-panel="architecture" hidden>
        ${panelHead('Interactive design', architecture.type === 'rack' ? 'Inspect the planned rack.' : 'Trace the planned system.', architecture.caption)}
        <div class="case-architecture-layout">
          <div><div class="case-architecture-canvas">${canvas}</div><p class="case-architecture-caption">${escapeHtml(architecture.caption)}</p></div>
          <aside class="case-architecture-inspector" aria-live="polite">
            <div class="case-inspector-head"><span>Selected component</span><h4 data-case-inspector-title>${escapeHtml(first.label)}</h4></div>
            <div class="case-inspector-body"><p data-case-inspector-copy>${escapeHtml(first.detail)}</p><div class="case-inspector-meta" data-case-inspector-meta>${inspectorMeta(first)}</div><button class="case-study-action" type="button" data-case-next-node>Inspect next component</button></div>
          </aside>
        </div>
      </section>`;
  }

  function inspectorMeta(node) {
    const rows = [
      ['Type', node.type],
      ...(typeof node.x === 'number' ? [['View position', `${node.x}% / ${node.y}%`]] : []),
      ...(node.u ? [['Rack position', `U${node.u}${node.height > 1 ? `–U${node.u + node.height - 1}` : ''}`]] : []),
      ...(node.power ? [['Power assumption', node.power]] : []),
      ['Evidence status', proofStatus() === 'verified' ? 'See linked proof' : 'Planned']
    ];
    return rows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  }

  function renderBuild() {
    return `
      <section class="case-study-panel" id="case-panel-build" role="tabpanel" aria-labelledby="case-tab-build" data-case-panel="build" hidden>
        ${panelHead('Implementation sequence', 'Build in controlled stages.', 'Each phase has a defined output and validation point. No phase is marked complete from the browser alone.')}
        <div class="case-build-timeline">${state.project.phases.map((phase, index) => `<article class="case-build-step"><span class="case-build-number">${String(index + 1).padStart(2,'0')}</span><div class="case-build-copy"><h4>${escapeHtml(phase.title)}</h4><p>${escapeHtml(phase.detail)}</p></div><span class="case-build-state">${escapeHtml(phase.status)}</span></article>`).join('')}</div>
      </section>`;
  }

  function testCategories() {
    return ['all', ...new Set(state.project.tests.map((test) => test.category))];
  }

  function renderTesting() {
    const tests = state.project.tests;
    return `
      <section class="case-study-panel" id="case-panel-testing" role="tabpanel" aria-labelledby="case-tab-testing" data-case-panel="testing" hidden>
        ${panelHead('Acceptance criteria', 'Define success before touching the configuration.', 'The public test matrix will eventually show expected, actual, evidence, retest, and final status. Every row is pending until real output is attached.')}
        <div class="case-test-summary"><div class="case-test-stat"><strong>${tests.length}</strong><span>Total tests</span></div><div class="case-test-stat"><strong>0</strong><span>Passed</span></div><div class="case-test-stat"><strong>0</strong><span>Failed</span></div><div class="case-test-stat"><strong>${tests.length}</strong><span>Pending evidence</span></div></div>
        <div class="case-test-toolbar"><div class="case-test-filters" role="group" aria-label="Filter tests">${testCategories().map((category, index) => `<button class="case-test-filter" type="button" data-test-filter="${escapeHtml(category)}" aria-pressed="${index === 0}">${escapeHtml(category === 'all' ? 'All tests' : category)}</button>`).join('')}</div><button class="case-test-export" type="button" data-test-export>Export planned matrix</button></div>
        <div class="case-test-table-wrap"><table class="case-test-table"><thead><tr><th scope="col">ID</th><th scope="col">Category</th><th scope="col">Requirement</th><th scope="col">Expected result</th><th scope="col">Status</th></tr></thead><tbody>${tests.map((test) => `<tr class="case-test-row" data-test-category="${escapeHtml(test.category)}"><td>${escapeHtml(test.id)}</td><td>${escapeHtml(test.category)}</td><td><strong>${escapeHtml(test.requirement)}</strong></td><td>${escapeHtml(test.expected)}</td><td><span class="case-test-status">${escapeHtml(test.status)}</span></td></tr>`).join('')}</tbody></table></div>
      </section>`;
  }

  function renderCodeLines(code = '') {
    return String(code).split('\n').map((line, index) => `<span class="case-code-line"><span class="case-code-line-number">${index + 1}</span><span>${escapeHtml(line) || ' '}</span></span>`).join('');
  }

  function configBody(config) {
    if (config.before !== undefined && config.after !== undefined) {
      return `<div class="case-diff-grid"><div class="case-diff-pane before"><span class="case-diff-label">Before · simulated fault</span><div class="case-code-body">${renderCodeLines(config.before)}</div></div><div class="case-diff-pane after"><span class="case-diff-label">After · corrective example</span><div class="case-code-body">${renderCodeLines(config.after)}</div></div></div>${config.note ? `<div class="case-code-note">${escapeHtml(config.note)}</div>` : ''}`;
    }
    return `<div class="case-code-body">${renderCodeLines(config.code)}</div>${config.note ? `<div class="case-code-note">${escapeHtml(config.note)}</div>` : ''}`;
  }

  function renderConfiguration() {
    const configs = state.project.configs;
    const first = configs[0];
    state.activeConfig = first?.id || '';
    return `
      <section class="case-study-panel" id="case-panel-configuration" role="tabpanel" aria-labelledby="case-tab-configuration" data-case-panel="configuration" hidden>
        ${panelHead('Templates and training diffs', 'Show the configuration reasoning.', 'These snippets are starting templates or simulated comparisons. Replace them with sanitized, verified configuration after the lab is complete.')}
        <div class="case-config-layout case-simulation-only">
          <div class="case-config-list" role="listbox" aria-label="Configuration examples">${configs.map((config, index) => `<button class="case-config-choice" type="button" data-config-id="${escapeHtml(config.id)}" aria-selected="${index === 0}"><strong>${escapeHtml(config.label)}</strong><span>${escapeHtml(config.kind)} · ${escapeHtml(config.language)}</span></button>`).join('')}</div>
          <div class="case-code-window"><div class="case-code-head"><div class="case-code-meta"><span class="case-code-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="case-code-title" data-code-title>${escapeHtml(first?.label || '')} · ${escapeHtml(first?.language || '')}</span></div><button class="case-code-copy" type="button" data-code-copy>Copy</button></div><div data-code-content>${first ? configBody(first) : ''}</div></div>
        </div>
      </section>`;
  }

  function renderIncidents() {
    return `
      <section class="case-study-panel" id="case-panel-incidents" role="tabpanel" aria-labelledby="case-tab-incidents" data-case-panel="incidents" hidden>
        ${panelHead('Controlled training scenarios', 'Practice the diagnostic process.', 'Each scenario is synthetic and clearly labeled. Real incident evidence will be attached only after the lab is run and documented.')}
        <div class="case-incident-grid case-simulation-only">${state.project.incidents.map((incident, index) => `<details class="case-incident" ${index === 0 ? 'open' : ''}><summary><span class="case-incident-code">${escapeHtml(incident.code)}</span><strong>${escapeHtml(incident.title)}</strong><span class="case-incident-severity">${escapeHtml(incident.severity)}</span></summary><div class="case-incident-body"><div><span>Symptom</span><p>${escapeHtml(incident.symptom)}</p></div><div><span>Diagnostic direction</span><p>${escapeHtml(incident.diagnosis)}</p></div><div><span>Recovery and validation</span><p>${escapeHtml(incident.recovery)}</p></div></div></details>`).join('')}</div>
      </section>`;
  }

  function renderEvidence() {
    const project = state.project;
    return `
      <section class="case-study-panel" id="case-panel-evidence" role="tabpanel" aria-labelledby="case-tab-evidence" data-case-panel="evidence" hidden>
        ${panelHead('Verification package', 'The artifacts that unlock a completion claim.', 'Publish sanitized files at stable public links, then update proof-data.js. Missing evidence remains visible rather than being replaced by invented results.')}
        <div class="case-evidence-grid">${project.evidence.map((item) => `<article class="case-evidence-card"><span class="case-evidence-icon">${escapeHtml(item.type.slice(0,3).toUpperCase())}</span><h4>${escapeHtml(item.label)}</h4><p>${item.status === 'verified' ? 'Public evidence is linked and inspectable.' : 'No public artifact has been attached yet.'}</p><span class="case-evidence-state">${escapeHtml(item.status)}</span><code class="case-evidence-path">${escapeHtml(item.path)}</code></article>`).join('')}</div>
        <div class="case-evidence-guide"><div><h4>Build the evidence package once, then let Proof Mode update the whole site.</h4><p>Use the repository guide for folder structure, sanitization, acceptance results, screenshots, and verification rules.</p></div><a class="button primary" href="${rootUrl('docs/EVIDENCE_PACKAGE_GUIDE.md')}">Open evidence guide</a></div>
      </section>`;
  }

  function renderRecruiter() {
    const recruiter = state.project.recruiter;
    const unlocked = proofStatus() === 'verified';
    return `
      <section class="case-study-panel" id="case-panel-recruiter" role="tabpanel" aria-labelledby="case-tab-recruiter" data-case-panel="recruiter" hidden>
        ${panelHead('Sixty-second explanation', 'Translate the technical work into a clear interview story.', 'The summary stays honest about the current status and points the reviewer toward evidence, reasoning, and validation.')}
        <div class="case-recruiter-layout">
          <article class="case-recruiter-brief"><span class="case-study-kicker">Recruiter-ready narrative</span><h4>${escapeHtml(recruiter.headline)}</h4><p data-case-recruiter-summary>${escapeHtml(recruiter.summary)}</p><div class="case-recruiter-points">${recruiter.talkingPoints.map((point, index) => `<div class="case-recruiter-point"><i>${index + 1}</i><span>${escapeHtml(point)}</span></div>`).join('')}</div><div class="case-recruiter-actions"><button class="button primary" type="button" data-case-copy-summary>Copy 60-second summary</button><a class="button" href="${rootUrl('recruiter.html')}">Open recruiter view</a></div></article>
          <aside class="case-resume-lock" data-unlocked="${unlocked}"><span class="case-resume-lock-icon" aria-hidden="true">${unlocked ? '✓' : '⌁'}</span><h4>${unlocked ? 'Resume bullet unlocked' : 'Resume bullet locked'}</h4><p>${unlocked ? 'The linked evidence package supports this project statement.' : 'Do not use this completion bullet until the project is verified through public evidence.'}</p><div class="case-resume-bullet">${escapeHtml(recruiter.resumeBullet)}</div>${unlocked ? '<button class="case-study-action" type="button" data-case-copy-bullet>Copy verified bullet</button>' : '<button class="case-study-action" type="button" data-case-open-evidence>View unlock requirements</button>'}</aside>
        </div>
      </section>`;
  }

  function wrapOriginalPlan() {
    const contentGrid = document.querySelector('main > .section .content-grid, main .section .content-grid');
    const legacySection = contentGrid?.closest('section');
    if (!legacySection || legacySection.classList.contains('case-study-section')) return;
    const wrapper = document.createElement('section');
    wrapper.className = 'case-study-original-section';
    wrapper.innerHTML = '<div class="container"><details class="case-study-original"><summary><strong>Original written project plan</strong><span>Open the source requirements and evidence checklist</span></summary><div class="case-study-original-content"></div></details></div>';
    wrapper.querySelector('.case-study-original-content').appendChild(contentGrid);
    legacySection.replaceWith(wrapper);
  }

  function insertionPoint() {
    return document.querySelector('.proof-project-panel') || document.querySelector('.page-hero');
  }

  function updateProofUi() {
    const status = proofStatus();
    document.querySelectorAll('[data-case-status]').forEach((chip) => {
      chip.dataset.status = status;
      chip.textContent = statusLabel(status);
    });
    document.querySelectorAll('[data-case-mode]').forEach((chip) => {
      chip.textContent = proofMode() === 'simulation' ? 'Simulation context enabled' : 'Verified-evidence context';
    });
    const lock = document.querySelector('.case-resume-lock');
    if (lock) {
      const unlocked = status === 'verified';
      lock.dataset.unlocked = String(unlocked);
      const icon = lock.querySelector('.case-resume-lock-icon');
      const title = lock.querySelector('h4');
      const copy = lock.querySelector('p');
      if (icon) icon.textContent = unlocked ? '✓' : '⌁';
      if (title) title.textContent = unlocked ? 'Resume bullet unlocked' : 'Resume bullet locked';
      if (copy) copy.textContent = unlocked ? 'The linked evidence package supports this project statement.' : 'Do not use this completion bullet until the project is verified through public evidence.';
    }
  }

  function setActiveTab(tab, { focus = false, updateHash = true } = {}) {
    if (!tabDefinitions().some(([id]) => id === tab)) tab = 'overview';
    state.activeTab = tab;
    document.querySelectorAll('[data-case-tab]').forEach((button) => {
      const active = button.dataset.caseTab === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });
    document.querySelectorAll('[data-case-panel]').forEach((panel) => { panel.hidden = panel.dataset.casePanel !== tab; });
    if (updateHash) {
      try { history.replaceState(null, '', `#case-${tab}`); } catch { /* Embedded previews can block history updates. */ }
    }
    if (tab === 'architecture') window.setTimeout(() => selectNode(state.activeNode || state.project.architecture.nodes[0]?.id), 40);
  }

  function selectNode(id) {
    const node = state.project.architecture.nodes.find((item) => item.id === id) || state.project.architecture.nodes[0];
    if (!node) return;
    state.activeNode = node.id;
    document.querySelectorAll('[data-case-node]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.caseNode === node.id)));
    const title = document.querySelector('[data-case-inspector-title]');
    const copy = document.querySelector('[data-case-inspector-copy]');
    const meta = document.querySelector('[data-case-inspector-meta]');
    if (title) title.textContent = node.label;
    if (copy) copy.textContent = node.detail;
    if (meta) meta.innerHTML = inspectorMeta(node);
  }

  function nextNode() {
    const nodes = state.project.architecture.nodes;
    const index = Math.max(0, nodes.findIndex((node) => node.id === state.activeNode));
    selectNode(nodes[(index + 1) % nodes.length]?.id);
  }

  function setTestFilter(category) {
    state.testFilter = category;
    document.querySelectorAll('[data-test-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.testFilter === category)));
    document.querySelectorAll('[data-test-category]').forEach((row) => { row.hidden = category !== 'all' && row.dataset.testCategory !== category; });
  }

  function setConfig(id) {
    const config = state.project.configs.find((item) => item.id === id) || state.project.configs[0];
    if (!config) return;
    state.activeConfig = config.id;
    document.querySelectorAll('[data-config-id]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.configId === config.id)));
    const title = document.querySelector('[data-code-title]');
    const content = document.querySelector('[data-code-content]');
    if (title) title.textContent = `${config.label} · ${config.language}`;
    if (content) content.innerHTML = configBody(config);
  }

  async function copyText(value, success = 'Copied') {
    try {
      await navigator.clipboard.writeText(value);
      window.dispatchEvent(new CustomEvent('portfolio:toast', { detail: { title: success } }));
      const live = document.querySelector('[data-platform-live]');
      if (live) live.textContent = success;
    } catch {
      window.prompt('Copy this text:', value);
    }
  }

  function configText(config) {
    if (!config) return '';
    if (config.before !== undefined) return `BEFORE — simulated fault\n${config.before}\n\nAFTER — corrective example\n${config.after}\n\n${config.note || ''}`;
    return config.code || '';
  }

  function exportTests() {
    const headers = ['Test ID','Category','Requirement','Expected Result','Actual Result','Evidence','Status'];
    const rows = state.project.tests.map((test) => [test.id,test.category,test.requirement,test.expected,'','','Pending']);
    const csv = [headers,...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${state.projectId}-planned-test-matrix.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function copySummary() {
    const project = state.project;
    const text = `${project.title}\nStatus: ${statusLabel(proofStatus())}\n\n${project.recruiter.summary}\n\nEvidence policy: No completion claim is made until public artifacts support the architecture, testing, troubleshooting, and results.`;
    copyText(text, 'Recruiter summary copied');
  }

  function openEvidenceRequirements() {
    setActiveTab('evidence');
    document.querySelector('#case-study')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }

  function bindEvents() {
    const shell = document.querySelector('.case-study-shell');
    shell?.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-case-tab]');
      if (tab) { setActiveTab(tab.dataset.caseTab); return; }
      const node = event.target.closest('[data-case-node]');
      if (node) { selectNode(node.dataset.caseNode); return; }
      const filter = event.target.closest('[data-test-filter]');
      if (filter) { setTestFilter(filter.dataset.testFilter); return; }
      const config = event.target.closest('[data-config-id]');
      if (config) { setConfig(config.dataset.configId); return; }
      if (event.target.closest('[data-test-export]')) { exportTests(); return; }
      if (event.target.closest('[data-code-copy]')) { copyText(configText(state.project.configs.find((item) => item.id === state.activeConfig)), 'Configuration copied'); return; }
      if (event.target.closest('[data-case-copy-summary]')) { copySummary(); return; }
      if (event.target.closest('[data-case-copy-bullet]')) { copyText(state.project.recruiter.resumeBullet, 'Verified resume bullet copied'); return; }
      if (event.target.closest('[data-case-open-evidence]')) { openEvidenceRequirements(); return; }
      if (event.target.closest('[data-case-print]')) { window.print(); return; }
      if (event.target.closest('[data-case-tour]')) {
        const launcher = document.querySelector('[data-dock-tour]');
        if (launcher) launcher.click();
        else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', altKey: true, bubbles: true }));
        return;
      }
      if (event.target.closest('[data-case-next-node]')) nextNode();
    });

    shell?.addEventListener('keydown', (event) => {
      const tab = event.target.closest('[data-case-tab]');
      if (tab && ['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) {
        event.preventDefault();
        const tabs = Array.from(shell.querySelectorAll('[data-case-tab]'));
        const index = tabs.indexOf(tab);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : event.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[next].dataset.caseTab, { focus: true });
      }
      const node = event.target.closest('[data-case-node]');
      if (node && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        selectNode(node.dataset.caseNode);
      }
    });

    window.addEventListener('portfolio:case-tab', (event) => {
      setActiveTab(event.detail?.tab || 'overview');
      document.querySelector('#case-study')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    });
    window.addEventListener('portfolio:proofmode', updateProofUi);
    window.addEventListener('resize', () => {
      if (state.activeTab === 'architecture') selectNode(state.activeNode);
    }, { passive: true });
  }

  function initialTab() {
    const match = location.hash.match(/^#case-(overview|architecture|build|testing|configuration|incidents|evidence|recruiter)$/);
    return match?.[1] || 'overview';
  }

  function init() {
    if (state.initialized || !document.querySelector('.page-hero')) return;
    const entry = identifyProject();
    if (!entry) return;
    state.initialized = true;
    [state.projectId, state.project] = entry;
    state.activeNode = state.project.architecture.nodes[0]?.id || '';

    const shell = createShell();
    const point = insertionPoint();
    if (point) point.insertAdjacentElement('afterend', shell);
    else document.querySelector('main')?.prepend(shell);
    wrapOriginalPlan();
    bindEvents();
    setActiveTab(initialTab(), { updateHash: false });
    selectNode(state.activeNode);
    updateProofUi();
    document.querySelector('.page-hero')?.style.setProperty('view-transition-name', 'project-hero');
    document.documentElement.classList.add('case-study-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
