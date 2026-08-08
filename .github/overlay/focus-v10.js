(() => {
  'use strict';
  if (window.__AF_FOCUS_V10__) return;
  window.__AF_FOCUS_V10__ = true;

  const html = document.documentElement;
  const body = document.body;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const shell = document.createElement('div');
  shell.className = 'focus-v10-shell';
  shell.setAttribute('aria-hidden', 'true');
  body.appendChild(shell);

  const transition = document.createElement('div');
  transition.className = 'focus-v10-transition';
  transition.setAttribute('aria-hidden', 'true');
  body.appendChild(transition);

  const modeCopy = {
    original: { label: 'Original', sub: 'Cinematic infrastructure specimen' },
    google: { label: 'Google Focus', sub: 'Search · discover · build · verify' },
    amazon: { label: 'AWS Operations Focus', sub: 'Observe · diagnose · operate · recover' },
    microsoft: { label: 'Microsoft Systems Focus', sub: 'Workspace · cloud · systems · delivery' }
  };

  const shellMarkup = {
    original: '',
    google: `
      <div class="v10-google-ambient">
        <i class="g-blob g-blue"></i><i class="g-blob g-red"></i><i class="g-blob g-yellow"></i><i class="g-blob g-green"></i>
        <i class="g-ring g-ring-a"></i><i class="g-ring g-ring-b"></i>
      </div>
      <div class="v10-google-toolbar">
        <span class="g-mark"><i></i><i></i><i></i><i></i></span>
        <div class="g-toolbar-copy"><b>Abdul Infrastructure Lab</b><small>Search the proof, not the buzzwords</small></div>
        <div class="g-toolbar-tabs"><span>Explore</span><span>Projects</span><span>Skills</span><span>Contact</span></div>
      </div>
      <div class="v10-google-search-card">
        <span class="g-search-icon">⌕</span><b>data center technician portfolio</b><i></i>
        <div><em>NetBox</em><em>Linux</em><em>IPMI</em><em>Networking</em></div>
      </div>
      <div class="v10-google-dock"><span class="active">Overview</span><span>Labs</span><span>Evidence</span><span>Resume</span></div>
      <div class="v10-mode-stamp"><b>GOOGLE / MATERIAL LAB</b><small>expressive workspace</small></div>`,
    amazon: `
      <aside class="v10-amazon-rail">
        <div class="a-brand"><b>AF</b><small>OPS</small></div>
        <div class="a-region"><span>REGION</span><b>us-east-1</b></div>
        <nav><span class="active">OVERVIEW</span><span>RACKS</span><span>NETWORK</span><span>STORAGE</span><span>TELEMETRY</span><span>RUNBOOKS</span></nav>
        <div class="a-rail-health"><i></i><b>SYSTEMS NORMAL</b><small>portfolio lab</small></div>
      </aside>
      <div class="v10-amazon-topbar">
        <div><span>Infrastructure Operations</span><b>Abdul Fazli / Portfolio Lab</b></div>
        <div class="a-top-states"><span><i></i>NET OK</span><span><i></i>BMC OK</span><span><i></i>POWER A/B</span></div>
      </div>
      <div class="v10-amazon-metrics">
        <span><small>DEVICES</small><b>08</b><i></i></span><span><small>UPLINK</small><b>10G</b><i></i></span><span><small>ALERTS</small><b>00</b><i></i></span><span><small>LABS</small><b>07</b><i></i></span>
      </div>
      <div class="v10-amazon-eventbar"><b>LIVE EVENT STREAM</b><span>NETBOX source-of-truth synchronized</span><span>BMC sensors reachable</span><span>SMART health nominal</span><i></i></div>
      <div class="v10-mode-stamp"><b>AWS / OPERATIONS CONSOLE</b><small>resource and incident view</small></div>`,
    microsoft: `
      <aside class="v10-ms-rail">
        <div class="ms-grid-mark"><i></i><i></i><i></i><i></i></div>
        <nav><span class="active">⌂</span><span>▦</span><span>≋</span><span>◇</span><span>⚙</span></nav>
        <div class="ms-user">AF</div>
      </aside>
      <div class="v10-ms-commandbar">
        <div class="ms-title"><span>Infrastructure Workspace</span><b>Abdul Fazli</b></div>
        <div class="ms-command-search">⌕ <span>Search projects, skills, evidence</span></div>
        <div class="ms-command-actions"><i>DCIM</i><i>NET</i><i>LINUX</i><i>OPS</i></div>
        <em><u></u>Synced</em>
      </div>
      <div class="v10-ms-panes">
        <i class="ms-pane pane-a"></i><i class="ms-pane pane-b"></i><i class="ms-pane pane-c"></i><i class="ms-pane pane-d"></i>
      </div>
      <div class="v10-ms-taskbar"><span class="active">Portfolio</span><span>Projects</span><span>Education</span><span>Contact</span></div>
      <div class="v10-mode-stamp"><b>MICROSOFT / CLOUD WORKSPACE</b><small>layered systems view</small></div>`
  };

  let active = html.dataset.focus || 'original';
  let timer = 0;
  let scrollTick = false;

  function annotateSections() {
    document.querySelectorAll('section[id], .section').forEach((section, index) => {
      section.dataset.v10Section = String(index + 1).padStart(2, '0');
      const heading = section.querySelector('h1,h2,h3,.sec-title,.section-title');
      const label = heading?.textContent?.replace(/\s+/g, ' ').trim();
      if (label) section.dataset.v10Label = label.slice(0, 34);
    });
  }

  function render(mode) {
    active = shellMarkup[mode] !== undefined ? mode : 'original';
    shell.dataset.mode = active;
    shell.innerHTML = shellMarkup[active];
    body.dataset.v10Focus = active;
    body.classList.toggle('v10-focus-active', active !== 'original');
    annotateSections();
  }

  function animateSwap(next) {
    if (reduceMotion.matches) {
      render(next);
      return;
    }
    transition.dataset.target = next;
    transition.classList.remove('is-running');
    void transition.offsetWidth;
    transition.classList.add('is-running');
    body.classList.add('v10-switching');
    clearTimeout(timer);
    setTimeout(() => render(next), 120);
    timer = setTimeout(() => {
      transition.classList.remove('is-running');
      body.classList.remove('v10-switching');
    }, 760);
  }

  function syncFromHtml() {
    const next = html.dataset.focus || 'original';
    if (next !== active) animateSwap(next);
  }

  function updateParallax() {
    scrollTick = false;
    const y = scrollY || 0;
    body.style.setProperty('--v10-scroll', `${y}px`);
    body.style.setProperty('--v10-scroll-small', `${Math.min(120, y * .04)}px`);
  }

  addEventListener('pointermove', (event) => {
    body.style.setProperty('--v10-x', `${event.clientX}px`);
    body.style.setProperty('--v10-y', `${event.clientY}px`);
    body.style.setProperty('--v10-nx', ((event.clientX / Math.max(1, innerWidth)) - .5).toFixed(4));
    body.style.setProperty('--v10-ny', ((event.clientY / Math.max(1, innerHeight)) - .5).toFixed(4));
  }, { passive: true });

  addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(updateParallax);
  }, { passive: true });

  window.addEventListener('future:focus-theme', (event) => {
    animateSwap(event.detail?.name || html.dataset.focus || 'original');
  });

  new MutationObserver(syncFromHtml).observe(html, { attributes: true, attributeFilter: ['data-focus'] });
  new MutationObserver(annotateSections).observe(document.body, { childList: true, subtree: true });

  render(active);
  updateParallax();
})();