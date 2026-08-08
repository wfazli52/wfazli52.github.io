(() => {
  'use strict';
  if (window.__AF_FOCUS_V60__) return;
  window.__AF_FOCUS_V60__ = true;

  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const app = document.createElement('div');
  app.className = 'focus-v60-app';
  app.setAttribute('aria-hidden', 'true');
  body.appendChild(app);

  let active = 'original';
  let swapTimer = 0;

  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function textOf(selector, fallback = '') {
    const node = document.querySelector(selector);
    return (node?.textContent || fallback).replace(/\s+/g, ' ').trim();
  }

  function collectLinks() {
    const github = document.querySelector('a[href*="github.com/wfazli52"]')?.href || 'https://github.com/wfazli52';
    const email = document.querySelector('a[href^="mailto:"]')?.href || 'mailto:your.email@example.com';
    const linkedin = document.querySelector('a[href*="linkedin.com"]')?.href || '#';
    return { github, email, linkedin };
  }

  function collectProjects() {
    const rows = Array.from(document.querySelectorAll('.index-table tbody tr:not(.idx-detail), .project-row'));
    const items = [];
    for (const row of rows) {
      const title = row.querySelector('.idx-title, h3, [data-project-title]')?.textContent?.replace(/\s+/g,' ').trim();
      if (!title || items.some((item) => item.title === title)) continue;
      const desc = row.nextElementSibling?.querySelector('.idx-detail-inner p')?.textContent?.replace(/\s+/g,' ').trim()
        || row.querySelector('.idx-desc, p')?.textContent?.replace(/\s+/g,' ').trim()
        || 'Infrastructure portfolio project with evidence-first implementation and validation.';
      const tags = Array.from(row.querySelectorAll('.idx-tags span, .tag')).map((n) => n.textContent.trim()).filter(Boolean).slice(0,4);
      const link = row.querySelector('a[href]')?.getAttribute('href') || '#work';
      items.push({ title, desc, tags, link });
      if (items.length >= 8) break;
    }
    if (items.length) return items;
    return [
      { title:'NetBox DCIM & IPAM Source of Truth', desc:'Rack, device, interface, cable, VLAN, prefix and IP modeling for data-center operations.', tags:['NetBox','DCIM','IPAM'], link:'/labs/netbox-dcim.html' },
      { title:'BMC / IPMI Hardware Telemetry', desc:'Out-of-band server health monitoring with sensor signals, alerts, triage and runbooks.', tags:['IPMI','BMC','Prometheus'], link:'/labs/ipmi-telemetry.html' },
      { title:'SMART Storage Health & Break/Fix', desc:'Storage-health monitoring tied to replacement, validation and recovery workflow.', tags:['SMART','Storage','Break/Fix'], link:'/labs/storage-health.html' },
      { title:'Bare-Metal Provisioning & Lifecycle', desc:'Enrollment, inspection, provisioning, power control and decommission workflow.', tags:['Bare Metal','Lifecycle','Automation'], link:'/labs/bare-metal-lifecycle.html' },
      { title:'Enterprise VLAN & Routing Lab', desc:'Segmentation, inter-VLAN routing, services, policy, testing and troubleshooting.', tags:['Cisco','VLAN','Routing'], link:'/labs/enterprise-network.html' },
      { title:'Linux Operations & Recovery Lab', desc:'Services, logs, SSH, firewall, storage failures and evidence-first recovery.', tags:['Linux','SSH','Operations'], link:'/labs/linux-operations.html' }
    ];
  }

  function collectProfile() {
    const links = collectLinks();
    const projects = collectProjects();
    return {
      name: textOf('.wordmark', 'Abdul Fazli') || 'Abdul Fazli',
      headline: document.querySelector('meta[name="description"]')?.content || 'Data center, networking, Linux, hardware operations, and proof-first technical projects.',
      education: textOf('#education', 'Northern Virginia Community College · Associate in Cybersecurity · WGU B.S. Network Engineering planned next.'),
      projects,
      ...links
    };
  }

  function projectCardsGoogle(projects) {
    return projects.slice(0,6).map((p,i) => `
      <a class="v60-g-card v60-g-card-${i+1}" href="${escapeHTML(p.link)}">
        <span class="v60-g-number">0${i+1}</span>
        <div class="v60-g-card-icon"><i></i><i></i><i></i><i></i></div>
        <h3>${escapeHTML(p.title)}</h3>
        <p>${escapeHTML(p.desc)}</p>
        <div>${p.tags.map(t=>`<em>${escapeHTML(t)}</em>`).join('')}</div>
      </a>`).join('');
  }

  function renderGoogle(d) {
    return `
      <div class="v60-google-page">
        <div class="v60-g-orb v60-g-blue"></div><div class="v60-g-orb v60-g-red"></div><div class="v60-g-orb v60-g-yellow"></div><div class="v60-g-orb v60-g-green"></div>
        <header class="v60-g-nav">
          <div class="v60-g-logo"><i></i><i></i><i></i><i></i><b>AF Lab</b></div>
          <nav><a href="#v60-g-work">Work</a><a href="#v60-g-about">About</a><a href="#v60-g-contact">Contact</a></nav>
          <a class="v60-g-pill" href="${escapeHTML(d.github)}">GitHub ↗</a>
        </header>
        <main>
          <section class="v60-g-hero">
            <div class="v60-g-kicker"><span></span> Infrastructure portfolio</div>
            <h1>Build. Test.<br><strong>Prove.</strong></h1>
            <p>${escapeHTML(d.headline)}</p>
            <div class="v60-g-search"><span>⌕</span><b>Search Abdul's infrastructure work</b><i></i><div><em>data center</em><em>networking</em><em>linux</em><em>cybersecurity</em></div></div>
            <div class="v60-g-actions"><a href="#v60-g-work">Explore projects</a><a href="${escapeHTML(d.email)}">Contact</a></div>
            <div class="v60-g-hero-shapes"><i></i><i></i><i></i><i></i><b>LAB</b></div>
          </section>
          <section id="v60-g-work" class="v60-g-section">
            <div class="v60-g-section-head"><span>Selected work</span><h2>Infrastructure, made visible.</h2><p>Hands-on labs organized like a modern product portfolio: clear goals, tools, evidence and outcomes.</p></div>
            <div class="v60-g-grid">${projectCardsGoogle(d.projects)}</div>
          </section>
          <section id="v60-g-about" class="v60-g-about">
            <div><span>Profile</span><h2>Cybersecurity foundation.<br>Infrastructure direction.</h2></div>
            <div><p>${escapeHTML(d.education)}</p><div class="v60-g-stat-grid"><span><b>DCIM</b><small>NetBox</small></span><span><b>OPS</b><small>Linux / BMC</small></span><span><b>NET</b><small>VLAN / Routing</small></span><span><b>HW</b><small>Storage / Rack</small></span></div></div>
          </section>
          <section id="v60-g-contact" class="v60-g-contact"><span>Ready to connect?</span><h2>Let's build reliable systems.</h2><div><a href="${escapeHTML(d.email)}">Email</a><a href="${escapeHTML(d.github)}">GitHub</a><a href="${escapeHTML(d.linkedin)}">LinkedIn</a></div></section>
        </main>
      </div>`;
  }

  function amazonRows(projects) {
    return projects.slice(0,7).map((p,i) => `
      <a class="v60-a-row" href="${escapeHTML(p.link)}">
        <span class="v60-a-status"><i></i>READY</span>
        <span class="v60-a-id">LAB-${String(i+1).padStart(2,'0')}</span>
        <div><b>${escapeHTML(p.title)}</b><small>${escapeHTML(p.desc)}</small></div>
        <span class="v60-a-tags">${p.tags.slice(0,2).map(t=>`<em>${escapeHTML(t)}</em>`).join('')}</span>
        <span>›</span>
      </a>`).join('');
  }

  function renderAmazon(d) {
    return `
      <div class="v60-amazon-page">
        <aside class="v60-a-sidebar">
          <div class="v60-a-logo"><b>AF</b><span>INFRA OPS</span></div>
          <div class="v60-a-region"><small>REGION</small><b>Northern Virginia</b></div>
          <nav><a class="active" href="#v60-a-dashboard">Dashboard</a><a href="#v60-a-resources">Resources</a><a href="#v60-a-runbooks">Runbooks</a><a href="#v60-a-profile">Profile</a></nav>
          <div class="v60-a-side-health"><i></i><div><b>All systems nominal</b><small>portfolio environment</small></div></div>
        </aside>
        <main class="v60-a-main">
          <header class="v60-a-top"><div><small>Infrastructure Operations Console</small><b>Abdul Fazli / Portfolio Environment</b></div><div><span><i></i>NET OK</span><span><i></i>BMC OK</span><span><i></i>STORAGE OK</span></div><a href="${escapeHTML(d.github)}">OPEN GITHUB ↗</a></header>
          <section id="v60-a-dashboard" class="v60-a-dashboard">
            <div class="v60-a-title"><small>DASHBOARD / OVERVIEW</small><h1>Infrastructure operations.<br><strong>Evidence first.</strong></h1><p>${escapeHTML(d.headline)}</p></div>
            <div class="v60-a-kpis"><span><small>ACTIVE LABS</small><b>07</b><i></i></span><span><small>ALERTS</small><b>00</b><i></i></span><span><small>UPLINK</small><b>10G</b><i></i></span><span><small>STATUS</small><b>OK</b><i></i></span></div>
            <div class="v60-a-chart"><div class="v60-a-chart-head"><b>LIVE TELEMETRY</b><span>last 60s</span></div><svg viewBox="0 0 900 180" preserveAspectRatio="none"><polyline points="0,140 55,121 108,132 160,92 215,105 270,76 325,88 380,52 440,61 495,44 548,68 610,36 668,52 728,28 790,47 850,24 900,35"/></svg><div class="v60-a-scan"></div></div>
          </section>
          <section id="v60-a-resources" class="v60-a-resources"><div class="v60-a-sectionhead"><div><small>RESOURCE INVENTORY</small><h2>Labs & operational proof</h2></div><div><span><i></i>healthy</span><span><i></i>planned</span></div></div><div class="v60-a-table"><div class="v60-a-table-head"><span>STATE</span><span>ID</span><span>RESOURCE</span><span>TAGS</span><span></span></div>${amazonRows(d.projects)}</div></section>
          <section id="v60-a-runbooks" class="v60-a-runbooks"><div><small>OPERATIONS MODEL</small><h2>Observe → diagnose → fix → validate.</h2><p>Every lab is structured around repeatable checks, controlled failure, troubleshooting evidence, rollback and verification.</p></div><div class="v60-a-runbook-grid"><span><b>01</b><em>Observe</em><small>Baseline + telemetry</small></span><span><b>02</b><em>Diagnose</em><small>Evidence before action</small></span><span><b>03</b><em>Recover</em><small>Controlled remediation</small></span><span><b>04</b><em>Validate</em><small>Acceptance testing</small></span></div></section>
          <section id="v60-a-profile" class="v60-a-profile"><div><small>PROFILE</small><h2>Education & direction</h2><p>${escapeHTML(d.education)}</p></div><div><a href="${escapeHTML(d.email)}">EMAIL</a><a href="${escapeHTML(d.github)}">GITHUB</a><a href="${escapeHTML(d.linkedin)}">LINKEDIN</a></div></section>
        </main>
      </div>`;
  }

  function msTiles(projects) {
    return projects.slice(0,6).map((p,i) => `<a class="v60-m-card m-card-${i+1}" href="${escapeHTML(p.link)}"><div class="v60-m-card-top"><span>${['DCIM','OPS','NET','HW','LINUX','LAB'][i] || 'LAB'}</span><i>↗</i></div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.desc)}</p><div>${p.tags.slice(0,3).map(t=>`<em>${escapeHTML(t)}</em>`).join('')}</div></a>`).join('');
  }

  function renderMicrosoft(d) {
    return `
      <div class="v60-ms-page">
        <aside class="v60-m-rail"><div class="v60-m-logo"><i></i><i></i><i></i><i></i></div><nav><a class="active">⌂</a><a>▦</a><a>≡</a><a>◇</a><a>⚙</a></nav><div class="v60-m-avatar">AF</div></aside>
        <header class="v60-m-top"><div class="v60-m-breadcrumb"><span>Home</span><b>›</b><span>Infrastructure</span><b>›</b><strong>Abdul Fazli</strong></div><div class="v60-m-search">⌕ <span>Search portfolio</span></div><div class="v60-m-top-actions"><span>DCIM</span><span>NET</span><span>OPS</span></div><em><i></i>Connected</em></header>
        <main class="v60-m-main">
          <section class="v60-m-hero"><div class="v60-m-hero-copy"><small>CLOUD & INFRASTRUCTURE WORKSPACE</small><h1>Systems,<br><strong>organized.</strong></h1><p>${escapeHTML(d.headline)}</p><div><a href="#v60-m-work">Open workspace</a><a href="${escapeHTML(d.email)}">Contact</a></div></div><div class="v60-m-hero-window"><div class="m-window-bar"><i></i><i></i><i></i><b>Infrastructure Overview</b></div><div class="m-window-body"><span class="m-big"><small>ENVIRONMENT</small><b>Portfolio Lab</b><em>Healthy</em></span><span><small>PROJECTS</small><b>07</b></span><span><small>NETWORK</small><b>10G</b></span><span><small>STATUS</small><b>READY</b></span><span class="m-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></div></div></section>
          <section id="v60-m-work" class="v60-m-work"><div class="v60-m-sectionhead"><div><small>WORKSPACE / PROJECTS</small><h2>Infrastructure modules</h2></div><p>Modular project views for data-center operations, networking, Linux and hardware.</p></div><div class="v60-m-grid">${msTiles(d.projects)}</div></section>
          <section class="v60-m-profile"><div class="v60-m-profile-card"><small>PROFILE</small><h2>Cybersecurity foundation</h2><p>${escapeHTML(d.education)}</p><div><span><b>DCIM</b><em>NetBox</em></span><span><b>NETWORK</b><em>VLAN / Routing</em></span><span><b>SYSTEMS</b><em>Linux / BMC</em></span><span><b>HARDWARE</b><em>Rack / Storage</em></span></div></div><div class="v60-m-contact-card"><small>CONNECT</small><h2>Available for infrastructure opportunities.</h2><a href="${escapeHTML(d.email)}">Email Abdul</a><a href="${escapeHTML(d.github)}">GitHub ↗</a><a href="${escapeHTML(d.linkedin)}">LinkedIn ↗</a></div></section>
        </main>
        <div class="v60-m-taskbar"><span class="active">Portfolio</span><span>Projects</span><span>Education</span><span>Contact</span></div>
      </div>`;
  }

  function activate(mode, silent = false) {
    const next = ['original','google','amazon','microsoft'].includes(mode) ? mode : 'original';
    if (next === active && !silent) return;
    active = next;

    if (next === 'original') {
      app.innerHTML = '';
      app.dataset.mode = 'original';
      app.setAttribute('aria-hidden','true');
      body.classList.remove('v60-active');
      body.style.overflow = '';
      root?.removeAttribute('aria-hidden');
      return;
    }

    const data = collectProfile();
    const markup = next === 'google' ? renderGoogle(data) : next === 'amazon' ? renderAmazon(data) : renderMicrosoft(data);
    app.dataset.mode = next;
    app.innerHTML = markup;
    app.setAttribute('aria-hidden','false');
    body.classList.add('v60-active');
    body.style.overflow = 'hidden';
    root?.setAttribute('aria-hidden','true');
    app.scrollTop = 0;
  }

  function transitionTo(mode) {
    clearTimeout(swapTimer);
    if (reduceMotion.matches) return activate(mode);
    app.classList.add('is-switching');
    swapTimer = setTimeout(() => {
      activate(mode);
      requestAnimationFrame(() => app.classList.remove('is-switching'));
    }, 180);
  }

  window.addEventListener('future:focus-theme', (event) => transitionTo(event.detail?.name || html.dataset.focus || 'original'));
  new MutationObserver(() => {
    const next = html.dataset.focus || 'original';
    if (next !== active) transitionTo(next);
  }).observe(html, { attributes:true, attributeFilter:['data-focus'] });

  activate(html.dataset.focus || 'original', true);
})();