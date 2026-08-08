(() => {
  'use strict';

  if (window.__FUTURE_POLISH_V7__) return;
  window.__FUTURE_POLISH_V7__ = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const body = document.body;
  const html = document.documentElement;
  let recruiterActive = false;
  let powerSave = false;
  let previousHeroPause = false;
  let fps = 60;
  let fpsFrames = 0;
  let fpsStart = performance.now();
  let fpsRaf = 0;
  let toastTimer = 0;

  function toast(message) {
    let node = document.querySelector('.polish-toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'polish-toast';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      body.appendChild(node);
    }
    clearTimeout(toastTimer);
    node.textContent = message;
    node.classList.add('is-on');
    toastTimer = setTimeout(() => node.classList.remove('is-on'), 2200);
  }

  function pageHasPlaceholders() {
    return /\[YOUR |your\.email@example\.com|your-handle/i.test(body.innerText || '');
  }

  function findSection(candidates) {
    for (const id of candidates) {
      const section = document.getElementById(id);
      if (section) return section;
    }
    return null;
  }

  function sectionLabel(section, fallback) {
    return section?.querySelector('h1,h2,h3')?.textContent?.replace(/\s+/g, ' ').trim() || fallback;
  }

  function scrollToSection(section) {
    if (!section) return;
    section.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }

  function buildRecruiterDock() {
    const existing = document.querySelector('.recruiter-dock');
    if (existing) return existing;

    const about = findSection(['about']);
    const work = findSection(['work', 'projects']);
    const education = findSection(['education']);
    const experience = findSection(['experience']);
    const contact = findSection(['contact']);

    const dock = document.createElement('aside');
    dock.className = 'recruiter-dock';
    dock.setAttribute('aria-label', 'Recruiter mode navigation');
    dock.innerHTML = `
      <div class="recruiter-dock-copy">
        <span class="recruiter-kicker">60-second recruiter path</span>
        <strong>Skills → projects → education → contact</strong>
        <small>${pageHasPlaceholders() ? 'Template fields still need your real information before sharing.' : 'Profile ready to review.'}</small>
      </div>
      <nav class="recruiter-path" aria-label="Recruiter quick navigation"></nav>
      <div class="recruiter-actions">
        <button type="button" data-recruiter-copy>Copy recruiter link</button>
        <button type="button" data-recruiter-exit>Exit recruiter mode</button>
      </div>`;

    const path = dock.querySelector('.recruiter-path');
    [
      [about, 'Profile'],
      [work, 'Projects'],
      [education, 'Education'],
      [experience, 'Experience'],
      [contact, 'Contact']
    ].forEach(([section, fallback], index) => {
      if (!section) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.recruiterTarget = section.id;
      button.innerHTML = `<b>${String(index + 1).padStart(2, '0')}</b><span>${sectionLabel(section, fallback)}</span>`;
      button.addEventListener('click', () => scrollToSection(section));
      path.appendChild(button);
    });

    dock.querySelector('[data-recruiter-copy]')?.addEventListener('click', async () => {
      const url = new URL(location.href);
      url.searchParams.set('recruiter', '1');
      url.hash = '';
      try {
        await navigator.clipboard.writeText(url.href);
        toast('Recruiter link copied.');
      } catch {
        toast(url.href);
      }
    });

    dock.querySelector('[data-recruiter-exit]')?.addEventListener('click', () => setRecruiterMode(false));
    body.appendChild(dock);
    return dock;
  }

  function createRecruiterToggle() {
    if (document.querySelector('.recruiter-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recruiter-toggle';
    button.innerHTML = '<i></i><span>Recruiter mode</span><kbd>R</kbd>';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => setRecruiterMode(!recruiterActive));
    body.appendChild(button);
  }

  function setRecruiterMode(active, options = {}) {
    recruiterActive = Boolean(active);
    body.classList.toggle('recruiter-mode', recruiterActive);
    document.querySelector('.recruiter-toggle')?.setAttribute('aria-pressed', String(recruiterActive));
    buildRecruiterDock();

    const url = new URL(location.href);
    if (recruiterActive) url.searchParams.set('recruiter', '1');
    else url.searchParams.delete('recruiter');
    if (!options.skipHistory) history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);

    if (recruiterActive) {
      previousHeroPause = document.querySelector('[data-hero-pause]')?.getAttribute('aria-pressed') === 'true';
      window.dispatchEvent(new CustomEvent('future:hero-pause', { detail: { paused: true } }));
      body.classList.add('recruiter-calm');
      if (!options.silent) toast('Recruiter mode: motion reduced and the portfolio path shortened.');
    } else {
      body.classList.remove('recruiter-calm');
      if (!previousHeroPause && !powerSave) window.dispatchEvent(new CustomEvent('future:hero-pause', { detail: { paused: false } }));
      if (!options.silent) toast('Full interactive portfolio restored.');
    }
  }

  function createPerformanceControl() {
    if (document.querySelector('.performance-control')) return;
    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'performance-control';
    control.setAttribute('aria-pressed', 'false');
    control.innerHTML = '<span class="performance-dot"></span><span data-performance-label>AUTO · 60 FPS</span><kbd>P</kbd>';
    control.addEventListener('click', () => setPowerSave(!powerSave));
    body.appendChild(control);
  }

  function setPowerSave(active, silent = false) {
    powerSave = Boolean(active);
    body.classList.toggle('power-save', powerSave);
    const control = document.querySelector('.performance-control');
    control?.setAttribute('aria-pressed', String(powerSave));
    if (powerSave) {
      window.dispatchEvent(new CustomEvent('future:hero-pause', { detail: { paused: true } }));
      if (!silent) toast('Power save enabled. Heavy decorative motion is paused.');
    } else {
      if (!recruiterActive) window.dispatchEvent(new CustomEvent('future:hero-pause', { detail: { paused: false } }));
      if (!silent) toast('Full motion restored.');
    }
  }

  function startFpsMeter() {
    const label = () => document.querySelector('[data-performance-label]');
    const sample = (now) => {
      fpsFrames += 1;
      const elapsed = now - fpsStart;
      if (elapsed >= 1200) {
        fps = Math.round((fpsFrames * 1000) / elapsed);
        fpsFrames = 0;
        fpsStart = now;
        const node = label();
        if (node) node.textContent = `${powerSave ? 'ECO' : 'AUTO'} · ${Math.min(99, fps)} FPS`;
        body.classList.toggle('performance-low', fps < 36);
      }
      fpsRaf = requestAnimationFrame(sample);
    };
    fpsRaf = requestAnimationFrame(sample);
    addEventListener('pagehide', () => cancelAnimationFrame(fpsRaf), { once: true });
  }

  function setupRecruiterObserver() {
    const dock = buildRecruiterDock();
    const buttons = Array.from(dock.querySelectorAll('[data-recruiter-target]'));
    if (!buttons.length) return;

    const sections = buttons.map((button) => document.getElementById(button.dataset.recruiterTarget)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const winner = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!winner) return;
      buttons.forEach((button) => button.classList.toggle('is-active', button.dataset.recruiterTarget === winner.target.id));
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, .15, .35, .6] });
    sections.forEach((section) => observer.observe(section));
  }

  function setupProjectMicrointeractions() {
    const rows = document.querySelectorAll('.index-table tbody tr:not(.idx-detail), .project-row');
    rows.forEach((row) => {
      if (row.dataset.polishReady) return;
      row.dataset.polishReady = '1';
      row.addEventListener('pointerenter', () => body.classList.add('project-focus'));
      row.addEventListener('pointerleave', () => body.classList.remove('project-focus'));
    });
  }

  function setupKeyboard() {
    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        setRecruiterMode(!recruiterActive);
      }
      if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPowerSave(!powerSave);
      }
      if (event.key === 'Escape' && recruiterActive) setRecruiterMode(false);
    });
  }

  function autoTuneForDevice() {
    const memory = Number(navigator.deviceMemory || 8);
    const cores = Number(navigator.hardwareConcurrency || 8);
    const constrained = innerWidth < 520 || memory <= 4 || cores <= 4;
    body.classList.toggle('device-constrained', constrained);
    if (constrained && reduceMotion.matches) setPowerSave(true, true);
  }

  function init() {
    createRecruiterToggle();
    createPerformanceControl();
    setupRecruiterObserver();
    setupProjectMicrointeractions();
    setupKeyboard();
    autoTuneForDevice();
    startFpsMeter();

    const params = new URLSearchParams(location.search);
    if (params.get('recruiter') === '1') setRecruiterMode(true, { skipHistory: true, silent: true });

    const mutation = new MutationObserver(() => setupProjectMicrointeractions());
    mutation.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => mutation.disconnect(), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();