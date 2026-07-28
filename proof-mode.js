(() => {
  'use strict';

  if (window.__PORTFOLIO_PROOF_MODE__) return;
  window.__PORTFOLIO_PROOF_MODE__ = true;

  const STORAGE_KEY = 'dc-portfolio-proof-mode';
  const FILTER_KEY = 'dc-portfolio-proof-filter';
  const STATUS = {
    verified: { label: 'Verified', short: 'Verified', progress: 100 },
    'in-progress': { label: 'In progress', short: 'In progress', progress: 55 },
    planned: { label: 'Planned', short: 'Awaiting evidence', progress: 0 },
    simulation: { label: 'Simulation', short: 'Simulation only', progress: 0 }
  };

  const scriptElement = Array.from(document.scripts).find((script) => /(?:^|\/)proof-mode\.js(?:\?|$)/.test(script.src));
  const siteRoot = scriptElement?.src ? new URL('.', scriptElement.src) : new URL('./', document.baseURI);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const data = normalizeData(window.PORTFOLIO_PROOF || {});
  const state = {
    mode: getInitialMode(),
    filter: getStoredFilter(),
    activeMilestone: null,
    lastFocused: null,
    initialized: false
  };

  function normalizeData(input) {
    const milestones = Array.isArray(input.milestones) ? input.milestones.map((item, index) => {
      const status = STATUS[item.status] ? item.status : 'planned';
      const evidence = Array.isArray(item.evidence) ? item.evidence.filter((entry) => entry && entry.label && entry.href) : [];
      const safeStatus = status === 'verified' && evidence.length === 0 ? 'in-progress' : status;
      return {
        id: item.id || `milestone-${index + 1}`,
        kind: item.kind || 'lab',
        status: safeStatus,
        title: item.title || 'Untitled milestone',
        shortTitle: item.shortTitle || item.title || 'Milestone',
        description: item.description || '',
        verifiedAt: item.verifiedAt || '',
        route: item.route || '',
        evidence,
        requirements: Array.isArray(item.requirements) ? item.requirements.filter(Boolean) : []
      };
    }) : [];

    return {
      schemaVersion: input.schemaVersion || 1,
      updated: input.updated || '',
      owner: input.owner || '',
      policy: input.policy || {
        title: 'Proof-first verification policy',
        summary: 'Claims are verified only when inspectable evidence is published.'
      },
      milestones,
      skillEvidence: input.skillEvidence || {}
    };
  }

  function getInitialMode() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('proof') || params.get('mode');
    if (requested === 'simulation' || requested === 'verified') return requested;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'simulation' || stored === 'verified') return stored;
    } catch { /* Storage can be disabled. */ }
    return 'verified';
  }

  function getStoredFilter() {
    try {
      const stored = window.localStorage.getItem(FILTER_KEY);
      if (stored === 'all' || STATUS[stored]) return stored;
    } catch { /* Storage can be disabled. */ }
    return 'all';
  }

  function statusInfo(status) {
    return STATUS[status] || STATUS.planned;
  }

  function routeUrl(route) {
    return new URL(route || '', siteRoot).href;
  }

  function milestoneById(id) {
    return data.milestones.find((milestone) => milestone.id === id) || null;
  }

  function milestoneForRoute(pathname = document.documentElement.dataset.proofRoute || window.location.pathname) {
    const normalizedPath = pathname.replace(/\/+$/, '');
    return data.milestones.find((milestone) => {
      if (!milestone.route) return false;
      const milestonePath = new URL(milestone.route, siteRoot).pathname.replace(/\/+$/, '');
      return milestonePath === normalizedPath;
    }) || null;
  }

  function getStats() {
    const stats = { verified: 0, 'in-progress': 0, planned: 0, simulation: 0, evidence: 0, total: data.milestones.length };
    data.milestones.forEach((milestone) => {
      stats[milestone.status] = (stats[milestone.status] || 0) + 1;
      stats.evidence += milestone.evidence.length;
    });
    stats.percent = stats.total ? Math.round((stats.verified / stats.total) * 100) : 0;
    return stats;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function announce(message) {
    const live = document.querySelector('[data-proof-live]');
    if (!live) return;
    live.textContent = '';
    window.requestAnimationFrame(() => { live.textContent = message; });
  }

  function showToast(message) {
    const toast = document.querySelector('[data-proof-toast]');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function setUrlMode(mode) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('proof', mode);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    } catch {
      /* Sandboxed previews can block history updates; the mode still works. */
    }
  }

  function modeCopy(mode) {
    return mode === 'verified'
      ? {
          title: 'Verified Evidence Mode',
          copy: 'Only public, inspectable evidence is presented as completed work. Simulations and plans stay visibly separated.'
        }
      : {
          title: 'Simulation Mode',
          copy: 'Explore controlled training incidents and synthetic command output. This mode is practice—not production experience.'
        };
  }

  function applyMode(mode, { persist = true, updateUrl = true, announceChange = true } = {}) {
    if (mode !== 'verified' && mode !== 'simulation') return;
    state.mode = mode;

    const apply = () => {
      document.body.dataset.proofMode = mode;
      document.documentElement.dataset.proofMode = mode;

      const copy = modeCopy(mode);
      document.querySelectorAll('[data-proof-mode-title]').forEach((element) => { element.textContent = copy.title; });
      document.querySelectorAll('[data-proof-mode-copy]').forEach((element) => { element.textContent = copy.copy; });
      document.querySelectorAll('[data-proof-set]').forEach((button) => {
        const active = button.dataset.proofSet === mode;
        button.setAttribute('aria-pressed', String(active));
      });

      updateProjectCards();
      updateSkillLabels();
      updateProjectPagePanel();
      updateSimulationGate();
    };

    // Apply synchronously so keyboard and assistive-technology state stays exact.
    // The surrounding CSS handles the visual transition without delaying the mode change.
    apply();

    if (persist) {
      try { window.localStorage.setItem(STORAGE_KEY, mode); } catch { /* Storage can be disabled. */ }
    }
    if (updateUrl) setUrlMode(mode);
    if (announceChange) announce(`${modeCopy(mode).title} active.`);
    window.dispatchEvent(new CustomEvent('portfolio:proofmode', { detail: { mode } }));
  }

  function createModeBar() {
    if (document.querySelector('[data-proof-mode-bar]')) return;
    const stats = getStats();
    const bar = document.createElement('section');
    bar.className = 'proof-mode-bar';
    bar.dataset.proofModeBar = '';
    bar.setAttribute('aria-label', 'Portfolio evidence mode');
    bar.innerHTML = `
      <div class="container proof-mode-inner">
        <div class="proof-mode-copy">
          <span class="proof-mode-kicker">Evidence integrity layer · Alt + P</span>
          <strong data-proof-mode-title>Verified Evidence Mode</strong>
          <p data-proof-mode-copy>Only public, inspectable evidence is presented as completed work.</p>
        </div>
        <div class="proof-mode-switch" role="group" aria-label="Choose portfolio mode">
          <button class="proof-mode-option" type="button" data-proof-set="verified" aria-pressed="true">Verified evidence</button>
          <button class="proof-mode-option" type="button" data-proof-set="simulation" aria-pressed="false">Simulation</button>
        </div>
        <div class="proof-mode-score" aria-label="${stats.verified} of ${stats.total} milestones verified">
          <span class="proof-mode-score-ring" style="--proof-angle:${stats.percent * 3.6}deg" aria-hidden="true"></span>
          <span class="proof-mode-score-copy"><span>${stats.verified}/${stats.total}</span><small>milestones verified</small></span>
        </div>
      </div>`;

    const header = document.querySelector('.site-header');
    if (header) header.insertAdjacentElement('afterend', bar);
    else document.body.prepend(bar);
  }

  function createLedger() {
    if (document.querySelector('#verified-proof')) return;
    const projects = document.querySelector('#projects');
    if (!projects || !data.milestones.length) return;

    const stats = getStats();
    const section = document.createElement('section');
    section.className = 'section proof-ledger-section';
    section.id = 'verified-proof';
    section.setAttribute('aria-labelledby', 'verified-proof-title');
    section.innerHTML = `
      <div class="container">
        <div class="proof-ledger-header" data-reveal>
          <div>
            <span class="eyebrow">Verified proof ledger</span>
            <h2 id="verified-proof-title">Claims a recruiter can inspect.</h2>
            <p>This ledger separates deployed proof, work in progress, planned labs, and interactive simulations. A project becomes verified only after its evidence package is public.</p>
          </div>
          <div class="proof-ledger-tools">
            <button class="proof-policy-button" type="button" data-proof-policy>Verification policy</button>
            <button class="proof-copy-link" type="button" data-proof-copy-link>Copy recruiter link</button>
          </div>
        </div>

        <div class="proof-summary-grid" data-reveal>
          <article class="proof-score-card">
            <div class="proof-score-visual">
              <div class="proof-score-large" style="--proof-angle:${stats.percent * 3.6}deg" aria-label="${stats.percent}% of milestones verified">
                <div><strong>${stats.percent}%</strong><small>verified</small></div>
              </div>
              <div class="proof-score-copy">
                <strong>${stats.verified} of ${stats.total} milestones</strong>
                <p>The deployed website is verified. Technical labs remain planned until real configurations, tests, and troubleshooting evidence are published.</p>
              </div>
            </div>
            <div class="proof-stat-row">
              <div class="proof-stat is-verified"><strong>${stats.verified}</strong><span>Verified</span></div>
              <div class="proof-stat is-progress"><strong>${stats['in-progress']}</strong><span>In progress</span></div>
              <div class="proof-stat is-planned"><strong>${stats.planned}</strong><span>Planned</span></div>
            </div>
          </article>

          <article class="proof-policy-card">
            <div class="proof-policy-copy">
              <span class="proof-mode-kicker">Integrity standard</span>
              <h3>${escapeHtml(data.policy.title || 'Proof-first verification policy')}</h3>
              <p>${escapeHtml(data.policy.summary || 'Claims are verified only when inspectable evidence is published.')}</p>
            </div>
            <div class="proof-policy-rules" aria-label="Verification rules">
              <div class="proof-policy-rule"><i>01</i><div><strong>Build it</strong><span>Complete the configuration or operational task yourself.</span></div></div>
              <div class="proof-policy-rule"><i>02</i><div><strong>Test it</strong><span>Record expected, actual, and final validation results.</span></div></div>
              <div class="proof-policy-rule"><i>03</i><div><strong>Publish it</strong><span>Link sanitized artifacts a reviewer can inspect.</span></div></div>
            </div>
          </article>
        </div>

        <div class="proof-filter-row">
          <span>${stats.evidence} public evidence links across ${stats.total} milestones</span>
          <div class="proof-filters" role="group" aria-label="Filter proof milestones">
            <button class="proof-filter-button" type="button" data-proof-filter="all" aria-pressed="true">All</button>
            <button class="proof-filter-button" type="button" data-proof-filter="verified" aria-pressed="false">Verified</button>
            <button class="proof-filter-button" type="button" data-proof-filter="in-progress" aria-pressed="false">In progress</button>
            <button class="proof-filter-button" type="button" data-proof-filter="planned" aria-pressed="false">Planned</button>
          </div>
        </div>
        <div class="proof-ledger-grid" data-proof-ledger-grid></div>
      </div>`;

    projects.insertAdjacentElement('beforebegin', section);
    // This section is injected after the site's original reveal observer runs.
    section.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
    renderLedgerCards();
  }

  function renderLedgerCards() {
    const grid = document.querySelector('[data-proof-ledger-grid]');
    if (!grid) return;
    grid.innerHTML = data.milestones.map((milestone) => {
      const info = statusInfo(milestone.status);
      const evidenceCount = milestone.evidence.length;
      const requirementCount = milestone.requirements.length;
      const progress = milestone.status === 'verified' ? 100 : milestone.status === 'in-progress' ? 55 : 0;
      const dateLabel = milestone.verifiedAt ? `Verified ${milestone.verifiedAt}` : milestone.status === 'planned' ? 'No completion claim' : 'Evidence package open';
      return `
        <article class="proof-ledger-card" data-proof-milestone="${escapeHtml(milestone.id)}" data-status="${escapeHtml(milestone.status)}">
          <div class="proof-card-head">
            <span class="proof-status-badge">${escapeHtml(info.label)}</span>
            <span class="proof-card-kind">${escapeHtml(milestone.kind)}</span>
          </div>
          <div class="proof-card-body">
            <h3>${escapeHtml(milestone.shortTitle)}</h3>
            <p>${escapeHtml(milestone.description)}</p>
            <div class="proof-card-meter">
              <div class="proof-card-meter-top"><span>Verification progress</span><strong>${progress}%</strong></div>
              <div class="proof-card-meter-track"><span style="--proof-card-progress:${progress}%"></span></div>
            </div>
            <div class="proof-card-evidence"><strong>${evidenceCount}</strong><span>public evidence link${evidenceCount === 1 ? '' : 's'} · ${requirementCount} verification requirements</span></div>
          </div>
          <div class="proof-card-footer"><span>${escapeHtml(dateLabel)}</span><button class="proof-card-open" type="button" data-proof-open="${escapeHtml(milestone.id)}">Inspect</button></div>
        </article>`;
    }).join('');
    applyFilter(state.filter, { persist: false });
  }

  function applyFilter(filter, { persist = true } = {}) {
    if (filter !== 'all' && !STATUS[filter]) filter = 'all';
    state.filter = filter;
    document.querySelectorAll('[data-proof-filter]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.proofFilter === filter));
    });
    document.querySelectorAll('[data-proof-milestone]').forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.status !== filter;
    });
    if (persist) {
      try { window.localStorage.setItem(FILTER_KEY, filter); } catch { /* Storage can be disabled. */ }
    }
  }

  function createDrawer() {
    if (document.querySelector('[data-proof-drawer]')) return;
    const drawer = document.createElement('div');
    drawer.className = 'proof-drawer';
    drawer.dataset.proofDrawer = '';
    drawer.hidden = true;
    drawer.innerHTML = `
      <div class="proof-drawer-backdrop" data-proof-close aria-hidden="true"></div>
      <section class="proof-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="proof-drawer-title" aria-describedby="proof-drawer-description" tabindex="-1">
        <button class="proof-drawer-close" type="button" data-proof-close aria-label="Close proof details">×</button>
        <div data-proof-drawer-content></div>
      </section>`;
    document.body.appendChild(drawer);
  }

  function openDrawer(id) {
    const milestone = milestoneById(id);
    const drawer = document.querySelector('[data-proof-drawer]');
    const content = drawer?.querySelector('[data-proof-drawer-content]');
    if (!milestone || !drawer || !content) return;

    const info = statusInfo(milestone.status);
    const evidenceMarkup = milestone.evidence.length
      ? milestone.evidence.map((entry) => `
          <a class="proof-evidence-link" href="${escapeHtml(new URL(entry.href, siteRoot).href)}" target="_blank" rel="noopener noreferrer">
            <span class="proof-evidence-icon">${escapeHtml((entry.type || 'LINK').slice(0, 4).toUpperCase())}</span>
            <span class="proof-evidence-copy"><strong>${escapeHtml(entry.label)}</strong><span>${escapeHtml(entry.type || 'Public evidence')}</span></span>
            <span class="proof-evidence-arrow" aria-hidden="true">↗</span>
          </a>`).join('')
      : `<div class="proof-empty-evidence"><span class="proof-evidence-icon">0</span><span><strong>No completion evidence published yet.</strong><br>This milestone remains ${escapeHtml(info.label.toLowerCase())}; its requirements are shown below.</span></div>`;

    const requirementsMarkup = milestone.requirements.length
      ? milestone.requirements.map((requirement) => `<li>${escapeHtml(requirement)}</li>`).join('')
      : '<li>No verification requirements have been defined.</li>';

    content.innerHTML = `
      <span class="proof-status-badge proof-drawer-status" style="--proof-status-color:${milestone.status === 'verified' ? 'var(--proof-verified)' : milestone.status === 'in-progress' ? 'var(--proof-progress)' : 'var(--proof-planned)'}">${escapeHtml(info.label)}</span>
      <h2 id="proof-drawer-title">${escapeHtml(milestone.title)}</h2>
      <p class="proof-drawer-description" id="proof-drawer-description">${escapeHtml(milestone.description)}</p>
      <dl class="proof-drawer-meta">
        <div><dt>Classification</dt><dd>${escapeHtml(milestone.kind)}</dd></div>
        <div><dt>Evidence links</dt><dd>${milestone.evidence.length}</dd></div>
        <div><dt>Verified date</dt><dd>${escapeHtml(milestone.verifiedAt || 'Not verified')}</dd></div>
      </dl>
      <section class="proof-drawer-section"><h3>Public evidence</h3><div class="proof-evidence-list">${evidenceMarkup}</div></section>
      <section class="proof-drawer-section"><h3>Verification requirements</h3><ul class="proof-requirements">${requirementsMarkup}</ul></section>
      <section class="proof-drawer-section"><div class="proof-drawer-actions">
        ${milestone.route ? `<a class="is-primary" href="${escapeHtml(routeUrl(milestone.route))}">${milestone.status === 'verified' ? 'Open case study' : 'Open build plan'}</a>` : ''}
        <button type="button" data-proof-set="simulation">Explore training simulator</button>
      </div></section>`;

    drawer.dataset.status = milestone.status;
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('proof-drawer-open');
    state.activeMilestone = milestone.id;
    state.lastFocused = document.activeElement;
    window.requestAnimationFrame(() => drawer.querySelector('.proof-drawer-panel')?.focus());
  }

  function closeDrawer() {
    const drawer = document.querySelector('[data-proof-drawer]');
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('proof-drawer-open');
    state.activeMilestone = null;
    if (state.lastFocused instanceof HTMLElement) state.lastFocused.focus();
  }

  function trapDrawerFocus(event) {
    const drawer = document.querySelector('[data-proof-drawer]');
    if (!drawer || drawer.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((item) => !item.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function annotateProjectCards() {
    const cards = document.querySelectorAll('.project-card[href]');
    cards.forEach((card) => {
      const path = new URL(card.href, window.location.href).pathname;
      const milestone = milestoneForRoute(path);
      if (!milestone) return;
      card.dataset.proofId = milestone.id;
      card.dataset.proofStatus = milestone.status;

      if (!card.querySelector('.proof-card-badge')) {
        const badge = document.createElement('span');
        badge.className = 'proof-card-badge';
        card.prepend(badge);
      }
      if (!card.querySelector('.proof-card-mode-note')) {
        const note = document.createElement('div');
        note.className = 'proof-card-mode-note';
        const footer = card.querySelector('.project-footer');
        if (footer) footer.insertAdjacentElement('beforebegin', note);
        else card.appendChild(note);
      }
    });
    updateProjectCards();
  }

  function updateProjectCards() {
    document.querySelectorAll('.project-card[data-proof-id]').forEach((card) => {
      const milestone = milestoneById(card.dataset.proofId);
      if (!milestone) return;
      const badge = card.querySelector('.proof-card-badge');
      const note = card.querySelector('.proof-card-mode-note');
      const statusElement = card.querySelector('.status');
      if (statusElement && !statusElement.dataset.originalProofText) statusElement.dataset.originalProofText = statusElement.textContent.trim();

      if (state.mode === 'simulation') {
        if (badge) badge.textContent = 'Training blueprint';
        if (note) note.innerHTML = '<strong>Simulation view:</strong> Open the plan or use the incident simulator. No completion claim is being made.';
        if (statusElement) statusElement.textContent = statusElement.dataset.originalProofText || 'Build planned';
      } else {
        const info = statusInfo(milestone.status);
        if (badge) badge.textContent = milestone.status === 'verified' ? 'Verified evidence' : info.short;
        if (note) note.innerHTML = milestone.status === 'verified'
          ? `<strong>Verified:</strong> ${milestone.evidence.length} public evidence link${milestone.evidence.length === 1 ? '' : 's'} available.`
          : '<strong>Evidence status:</strong> Completion has not been publicly verified yet.';
        if (statusElement) statusElement.textContent = milestone.status === 'verified' ? 'Verified' : 'Planned · evidence pending';
      }
    });
  }

  function annotateSkills() {
    document.querySelectorAll('.skill-item').forEach((item) => {
      const name = item.querySelector('span:first-child')?.textContent.trim();
      const level = item.querySelector('.skill-level');
      const proof = name ? data.skillEvidence[name] : null;
      if (!name || !level || !proof) return;
      item.dataset.proofStatus = STATUS[proof.status] ? proof.status : 'planned';
      item.dataset.proofMilestone = proof.milestone || '';
      if (!level.dataset.originalProofText) level.dataset.originalProofText = level.textContent.trim();
      item.title = `Evidence source: ${milestoneById(proof.milestone)?.shortTitle || 'planned milestone'}`;
    });
    updateSkillLabels();
  }

  function updateSkillLabels() {
    document.querySelectorAll('.skill-item[data-proof-status]').forEach((item) => {
      const level = item.querySelector('.skill-level');
      if (!level) return;
      if (state.mode === 'simulation') {
        level.textContent = level.dataset.originalProofText || 'Learning';
      } else {
        const status = item.dataset.proofStatus;
        level.textContent = status === 'verified' ? 'Verified in evidence' : status === 'in-progress' ? 'Evidence in progress' : 'Not yet verified';
      }
    });
  }

  function enhanceDashboard() {
    if (document.querySelector('.proof-dashboard-chip')) return;
    const stats = getStats();
    const target = document.querySelector('#dashboard .system-health, #dashboard .dashboard-head, #dashboard h2');
    if (!target) return;
    const chip = document.createElement('span');
    chip.className = 'proof-dashboard-chip';
    chip.textContent = `${stats.verified}/${stats.total} verified`;
    if (target.matches('.system-health')) target.insertAdjacentElement('afterend', chip);
    else target.appendChild(chip);
  }

  function createProjectPagePanel() {
    if (document.querySelector('.proof-project-panel')) return;
    const milestone = milestoneForRoute();
    const hero = document.querySelector('.page-hero');
    if (!milestone || !hero) return;
    const info = statusInfo(milestone.status);
    const panel = document.createElement('section');
    panel.className = 'proof-project-panel';
    panel.dataset.status = milestone.status;
    panel.dataset.proofProjectPanel = milestone.id;
    panel.innerHTML = `
      <div class="container proof-project-panel-inner">
        <div class="proof-project-summary">
          <span class="proof-project-status">${escapeHtml(info.label)}</span>
          <div><h2>${milestone.status === 'verified' ? 'Public evidence is available.' : 'This page is a build plan, not a completion claim.'}</h2><p data-proof-project-copy>${milestone.evidence.length} public evidence link${milestone.evidence.length === 1 ? '' : 's'} · ${milestone.requirements.length} verification requirements.</p></div>
        </div>
        <div class="proof-project-actions"><button type="button" data-proof-open="${escapeHtml(milestone.id)}">Inspect evidence standard</button><button type="button" data-proof-set="simulation">Simulation mode</button></div>
      </div>`;
    hero.insertAdjacentElement('afterend', panel);

    document.querySelectorAll('.article section').forEach((section) => {
      const title = section.querySelector('h2')?.textContent.toLowerCase() || '';
      if (title.includes('resume bullet')) section.classList.add('proof-resume-lock');
    });
    updateProjectPagePanel();
  }

  function updateProjectPagePanel() {
    const panel = document.querySelector('.proof-project-panel');
    if (!panel) return;
    const milestone = milestoneById(panel.dataset.proofProjectPanel);
    const copy = panel.querySelector('[data-proof-project-copy]');
    if (!milestone || !copy) return;
    copy.textContent = state.mode === 'verified'
      ? `${milestone.evidence.length} public evidence link${milestone.evidence.length === 1 ? '' : 's'} · ${milestone.requirements.length} verification requirements.`
      : 'Training context is enabled. Commands, incidents, and sample outputs are simulations unless linked as verified evidence.';
  }

  function enhanceSimulationSection(section) {
    if (!(section instanceof HTMLElement) || section.dataset.proofEnhanced === 'true') return;
    section.dataset.proofEnhanced = 'true';

    const ribbon = document.createElement('div');
    ribbon.className = 'proof-simulation-ribbon';
    ribbon.innerHTML = '<strong>Training simulation</strong><span>Synthetic incidents and command output for demonstrating troubleshooting process—not production work.</span>';

    const gate = document.createElement('div');
    gate.className = 'proof-simulation-gate';
    gate.setAttribute('aria-hidden', 'true');
    gate.innerHTML = `
      <div class="proof-simulation-gate-card">
        <div class="proof-simulation-gate-icon">PROOF</div>
        <span class="proof-mode-kicker">Verified evidence mode</span>
        <h3>Simulation intentionally separated.</h3>
        <p>This interactive environment demonstrates a troubleshooting workflow, but it is not presented as professional experience. Switch modes to explore it.</p>
        <div class="button-row"><button class="proof-gate-button" type="button" data-proof-set="simulation">Enter simulation mode</button><a class="button" href="#verified-proof">View verified ledger</a></div>
      </div>`;

    const container = section.querySelector(':scope > .container') || section;
    container.insertAdjacentElement('afterbegin', ribbon);
    section.appendChild(gate);
    updateSimulationGate();
  }

  function findSimulationSections() {
    const found = new Set();
    document.querySelectorAll('#command-center, .command-center-section').forEach((section) => found.add(section));
    document.querySelectorAll('.cc-shell, .operations-shell').forEach((shell) => {
      const section = shell.closest('#command-center, .command-center-section, section');
      if (section) found.add(section);
    });
    found.forEach(enhanceSimulationSection);
  }

  function updateSimulationGate() {
    const verifiedMode = state.mode === 'verified';
    document.querySelectorAll('#command-center, .command-center-section').forEach((section) => {
      const gate = section.querySelector('.proof-simulation-gate');
      if (gate) gate.setAttribute('aria-hidden', String(!verifiedMode));

      const content = section.querySelector(':scope > .container') || section.querySelector('.container');
      if (content) {
        if (verifiedMode) {
          content.setAttribute('inert', '');
          content.setAttribute('aria-hidden', 'true');
          if (content.contains(document.activeElement)) gate?.querySelector('[data-proof-set="simulation"]')?.focus();
        } else {
          content.removeAttribute('inert');
          content.removeAttribute('aria-hidden');
        }
      }

      if (verifiedMode && document.fullscreenElement && section.contains(document.fullscreenElement)) {
        document.exitFullscreen?.().catch?.(() => {});
      }
    });
  }

  async function copyRecruiterLink() {
    const url = new URL(siteRoot.href);
    url.searchParams.set('proof', 'verified');
    url.hash = 'verified-proof';
    try {
      await navigator.clipboard.writeText(url.href);
      showToast('Verified recruiter link copied.');
    } catch {
      window.prompt('Copy this verified recruiter link:', url.href);
    }
  }

  function bindEvents() {
    document.addEventListener('keydown', (event) => {
      if (state.mode !== 'verified') return;
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (typing || !document.querySelector('#command-center, .command-center-section')) return;

      const key = event.key.toLowerCase();
      const simulatorShortcut = ['1', '2', '3', '4', 'o'].includes(key) || ((event.ctrlKey || event.metaKey) && key === 'k');
      if (!simulatorShortcut) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      showToast('Switch to Simulation Mode to use incident and operations controls.');
      document.querySelector('[data-proof-set="simulation"]')?.focus();
    }, true);

    document.addEventListener('click', (event) => {
      const modeButton = event.target.closest('[data-proof-set]');
      if (modeButton) {
        event.preventDefault();
        const nextMode = modeButton.dataset.proofSet;
        closeDrawer();
        applyMode(nextMode);
        if (nextMode === 'simulation' && modeButton.closest('.proof-simulation-gate')) {
          document.querySelector('#command-center, .command-center-section')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
        }
        return;
      }

      const openButton = event.target.closest('[data-proof-open]');
      if (openButton) {
        event.preventDefault();
        openDrawer(openButton.dataset.proofOpen);
        return;
      }

      if (event.target.closest('[data-proof-close]')) {
        event.preventDefault();
        closeDrawer();
        return;
      }

      const filterButton = event.target.closest('[data-proof-filter]');
      if (filterButton) {
        applyFilter(filterButton.dataset.proofFilter);
        return;
      }

      if (event.target.closest('[data-proof-copy-link]')) {
        copyRecruiterLink();
        return;
      }

      if (event.target.closest('[data-proof-policy]')) {
        const first = data.milestones.find((milestone) => milestone.id === 'deployment') || data.milestones[0];
        if (first) openDrawer(first.id);
      }
    });

    document.addEventListener('keydown', (event) => {
      trapDrawerFocus(event);
      if (event.defaultPrevented) return;
      if (event.altKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        applyMode(state.mode === 'verified' ? 'simulation' : 'verified');
      }
    });
  }

  function createUtilities() {
    if (!document.querySelector('[data-proof-live]')) {
      const live = document.createElement('div');
      live.className = 'proof-sr-only';
      live.dataset.proofLive = '';
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    if (!document.querySelector('[data-proof-toast]')) {
      const toast = document.createElement('div');
      toast.className = 'proof-toast';
      toast.dataset.proofToast = '';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    createUtilities();
    createModeBar();
    createDrawer();
    createLedger();
    annotateProjectCards();
    annotateSkills();
    enhanceDashboard();
    createProjectPagePanel();
    findSimulationSections();
    bindEvents();
    applyFilter(state.filter, { persist: false });
    applyMode(state.mode, { persist: false, updateUrl: false, announceChange: false });

    const observer = new MutationObserver((mutations) => {
      let needsSimulationScan = false;
      let needsProjectScan = false;
      let needsDashboardScan = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('#command-center, .command-center-section, .cc-shell, .operations-shell') || node.querySelector('#command-center, .command-center-section, .cc-shell, .operations-shell')) needsSimulationScan = true;
          if (node.matches('.project-card') || node.querySelector('.project-card')) needsProjectScan = true;
          if (node.matches('#dashboard, .dashboard-head, .system-health') || node.querySelector('#dashboard, .dashboard-head, .system-health')) needsDashboardScan = true;
        });
      });

      if (needsSimulationScan) findSimulationSections();
      if (needsProjectScan) annotateProjectCards();
      if (needsDashboardScan) enhanceDashboard();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
