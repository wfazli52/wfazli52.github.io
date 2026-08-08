(() => {
  'use strict';
  if (window.__AF_AMAZON_FOCUS_APP__) return;
  window.__AF_AMAZON_FOCUS_APP__ = true;

  const html = document.documentElement;
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  let observer;

  function app() { return document.querySelector('.focus-v60-app'); }

  function collect() {
    const links = {
      github: document.querySelector('#root a[href*="github.com/wfazli52"]')?.href || 'https://github.com/wfazli52',
      email: document.querySelector('#root a[href^="mailto:"]')?.href || 'mailto:your.email@example.com',
      linkedin: document.querySelector('#root a[href*="linkedin.com"]')?.href || '#'
    };
    const projects = [];
    document.querySelectorAll('#root .index-table tbody tr:not(.idx-detail), #root .project-row').forEach((row) => {
      if (projects.length >= 8) return;
      const title = row.querySelector('.idx-title, h3, [data-project-title]')?.textContent?.replace(/\s+/g, ' ').trim();
      if (!title || projects.some((p) => p.title === title)) return;
      const desc = row.nextElementSibling?.querySelector('.idx-detail-inner p')?.textContent?.replace(/\s+/g, ' ').trim()
        || row.querySelector('.idx-desc, p')?.textContent?.replace(/\s+/g, ' ').trim()
        || 'Infrastructure lab plan with evidence required before completion is claimed.';
      const tags = Array.from(row.querySelectorAll('.idx-tags span, .tag')).map((n) => n.textContent.trim()).filter(Boolean).slice(0, 3);
      projects.push({ title, desc, tags, link: row.querySelector('a[href]')?.getAttribute('href') || '#work' });
    });
    if (!projects.length) projects.push(
      { title:'NetBox DCIM & IPAM Source of Truth', desc:'Model racks, devices, interfaces, cabling, VLANs, prefixes and IP assignments.', tags:['DCIM','IPAM'], link:'/labs/netbox-dcim.html' },
      { title:'BMC / IPMI Hardware Telemetry', desc:'Document server hardware-health signals, triage paths and response runbooks.', tags:['BMC','IPMI'], link:'/labs/ipmi-telemetry.html' },
      { title:'SMART Storage Health & Break/Fix', desc:'Tie storage-health evidence to replacement and validation workflow.', tags:['SMART','Storage'], link:'/labs/storage-health.html' },
      { title:'Bare-Metal Provisioning & Lifecycle', desc:'Document inspection, provisioning, power control and decommission workflow.', tags:['Bare Metal','Lifecycle'], link:'/labs/bare-metal-lifecycle.html' },
      { title:'Enterprise VLAN & Routing Lab', desc:'Segmentation, routing, services, access policy and troubleshooting validation.', tags:['VLAN','Routing'], link:'/labs/enterprise-network.html' },
      { title:'Linux Operations & Recovery Lab', desc:'Services, logs, SSH, firewall and recovery checks with evidence-first validation.', tags:['Linux','Operations'], link:'/labs/linux-operations.html' }
    );
    const education = (document.querySelector('#root #education')?.textContent || 'Northern Virginia Community College · Associate in Cybersecurity · WGU B.S. Network Engineering planned next.').replace(/\s+/g, ' ').trim();
    return { ...links, projects, education };
  }

  function resourceRows(projects) {
    return projects.slice(0, 8).map((p, index) => {
      const search = `${p.title} ${p.desc} ${p.tags.join(' ')}`.toLowerCase();
      return `<a class="amazon-focus-resource-row" href="${esc(p.link)}" data-search="${esc(search)}">
        <span class="amazon-focus-state"><i></i>Planned</span>
        <span class="amazon-focus-id">LAB-${String(index + 1).padStart(2, '0')}</span>
        <span class="amazon-focus-resource"><b>${esc(p.title)}</b><small>${esc(p.desc)}</small></span>
        <span class="amazon-focus-tags">${p.tags.slice(0, 2).map((tag) => `<em>${esc(tag)}</em>`).join('')}</span>
        <span class="amazon-focus-proof">Evidence required</span><span class="amazon-focus-open">Open ›</span>
      </a>`;
    }).join('');
  }

  function render() {
    const target = app();
    if (!target || html.dataset.focus !== 'amazon') return;
    const data = collect();
    target.dataset.mode = 'amazon';
    target.innerHTML = `<div class="amazon-focus-shell">
      <header class="amazon-focus-global">
        <div class="amazon-focus-brand"><span>AF</span><b>Infrastructure Portfolio</b></div>
        <label class="amazon-focus-global-search"><i>⌕</i><input type="search" data-amazon-search placeholder="Search lab resources" aria-label="Search lab resources"><kbd>/</kbd></label>
        <div class="amazon-focus-global-actions"><span>Northern Virginia</span><a href="${esc(data.github)}">GitHub ↗</a></div>
      </header>

      <aside class="amazon-focus-nav">
        <div class="amazon-focus-service"><small>PORTFOLIO SERVICE</small><b>Data Center Operations</b></div>
        <nav>
          <a class="active" href="#amazon-overview"><i>⌂</i>Overview</a>
          <a href="#amazon-resources"><i>▤</i>Lab resources</a>
          <a href="#amazon-topology"><i>◇</i>Topology model</a>
          <a href="#amazon-runbooks"><i>↻</i>Runbooks</a>
          <a href="#amazon-profile"><i>◉</i>Candidate profile</a>
        </nav>
        <div class="amazon-focus-nav-note"><b>Evidence policy</b><p>Projects stay planned until configs, screenshots, test output or other proof are published.</p></div>
      </aside>

      <main class="amazon-focus-main">
        <div class="amazon-focus-breadcrumb">Portfolio <b>›</b> Infrastructure <b>›</b> Operations overview</div>
        <section id="amazon-overview" class="amazon-focus-page-header">
          <div><small>DATA CENTER OPERATIONS</small><h1>Infrastructure portfolio</h1><p>Cybersecurity foundation with hands-on lab plans for DCIM/IPAM, server telemetry, storage health, Linux, networking and bare-metal operations.</p></div>
          <div class="amazon-focus-header-actions"><a href="${esc(data.email)}">Contact</a><a class="primary" href="${esc(data.github)}">Open GitHub</a></div>
        </section>

        <section class="amazon-focus-info"><i>i</i><div><b>Portfolio lab environment</b><span>This interface models operational workflows. It does not claim production systems or completed evidence.</span></div></section>

        <section class="amazon-focus-summary">
          <article><small>LAB PLANS</small><b>${String(data.projects.length).padStart(2, '0')}</b><span>documented paths</span></article>
          <article><small>EVIDENCE</small><b>REQ</b><span>proof before completion</span></article>
          <article><small>LOCATION</small><b>NOVA</b><span>Northern Virginia</span></article>
          <article><small>ROLE FOCUS</small><b>DC</b><span>data center / infra</span></article>
        </section>

        <section class="amazon-focus-grid">
          <article class="amazon-focus-container">
            <div class="amazon-focus-container-head"><div><small>READINESS MODEL</small><h2>Operational coverage</h2></div><span class="amazon-focus-badge">Lab plan</span></div>
            <div class="amazon-focus-health">
              <div><span>DCIM / IPAM documentation</span><b>Planned</b><i><u style="width:78%"></u></i></div>
              <div><span>Hardware telemetry runbook</span><b>Planned</b><i><u style="width:66%"></u></i></div>
              <div><span>Network validation matrix</span><b>Planned</b><i><u style="width:72%"></u></i></div>
              <div><span>Linux recovery workflow</span><b>Planned</b><i><u style="width:62%"></u></i></div>
            </div>
          </article>
          <article class="amazon-focus-container" id="amazon-profile">
            <div class="amazon-focus-container-head"><div><small>CANDIDATE SNAPSHOT</small><h2>Abdul Fazli</h2></div></div>
            <dl><dt>Education</dt><dd>${esc(data.education)}</dd><dt>Target roles</dt><dd>Data center technician · deployment · NOC · infrastructure support</dd><dt>Core domains</dt><dd>Networking · Linux · hardware · DCIM · troubleshooting</dd></dl>
            <div class="amazon-focus-profile-links"><a href="${esc(data.email)}">Email</a><a href="${esc(data.linkedin)}">LinkedIn</a></div>
          </article>
        </section>

        <section id="amazon-resources" class="amazon-focus-container amazon-focus-resources">
          <div class="amazon-focus-container-head"><div><small>RESOURCE INVENTORY</small><h2>Lab plans & operational proof</h2></div><label>Filter <select data-amazon-filter><option value="all">All domains</option><option value="network">Network</option><option value="linux">Linux</option><option value="hardware">Hardware</option><option value="dcim">DCIM</option></select></label></div>
          <div class="amazon-focus-table-head"><span>STATE</span><span>ID</span><span>RESOURCE</span><span>DOMAIN</span><span>PROOF</span><span></span></div>
          <div data-amazon-rows>${resourceRows(data.projects)}</div>
          <div class="amazon-focus-empty" data-amazon-empty hidden>No matching lab resources.</div>
        </section>

        <section id="amazon-topology" class="amazon-focus-container amazon-focus-topology">
          <div class="amazon-focus-container-head"><div><small>TOPOLOGY MODEL</small><h2>How the lab domains connect</h2></div><span class="amazon-focus-badge">Documentation view</span></div>
          <div class="amazon-focus-map">
            <div class="node dcim"><b>DCIM / IPAM</b><small>source of truth</small></div><div class="node net"><b>Network</b><small>VLAN / routing</small></div><div class="node compute"><b>Compute</b><small>BMC / bare metal</small></div><div class="node storage"><b>Storage</b><small>SMART / break-fix</small></div><div class="node linux"><b>Linux</b><small>services / recovery</small></div>
            <svg viewBox="0 0 1000 270" preserveAspectRatio="none" aria-hidden="true"><path d="M190 75 C300 75 300 135 415 135"/><path d="M190 205 C300 205 300 135 415 135"/><path d="M585 135 C700 135 700 70 815 70"/><path d="M585 135 C700 135 700 205 815 205"/></svg>
          </div>
        </section>

        <section id="amazon-runbooks" class="amazon-focus-container amazon-focus-runbooks">
          <div class="amazon-focus-container-head"><div><small>RUNBOOK MODEL</small><h2>Evidence-first troubleshooting</h2></div></div>
          <div class="amazon-focus-steps"><article><b>1</b><div><strong>Observe</strong><span>Capture baseline, symptoms and recent change.</span></div></article><article><b>2</b><div><strong>Diagnose</strong><span>Collect logs, counters and configuration evidence.</span></div></article><article><b>3</b><div><strong>Recover</strong><span>Apply a controlled fix with rollback available.</span></div></article><article><b>4</b><div><strong>Validate</strong><span>Run acceptance tests and publish real evidence.</span></div></article></div>
        </section>
      </main>
    </div>`;
    bind(target);
  }

  function bind(target) {
    const search = target.querySelector('[data-amazon-search]');
    const filter = target.querySelector('[data-amazon-filter]');
    const rows = Array.from(target.querySelectorAll('.amazon-focus-resource-row'));
    const empty = target.querySelector('[data-amazon-empty]');

    const updateRows = () => {
      const q = (search?.value || '').trim().toLowerCase();
      const domain = (filter?.value || 'all').toLowerCase();
      let visible = 0;
      rows.forEach((row) => {
        const haystack = row.dataset.search || '';
        const show = (!q || haystack.includes(q)) && (domain === 'all' || haystack.includes(domain));
        row.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    };
    search?.addEventListener('input', updateRows);
    filter?.addEventListener('change', updateRows);

    target.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
      const section = target.querySelector(link.getAttribute('href'));
      if (!section) return;
      event.preventDefault();
      section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }));

    document.addEventListener('keydown', function slash(event) {
      if (html.dataset.focus !== 'amazon') return;
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
      if (event.key === '/' && !typing) { event.preventDefault(); search?.focus(); }
    });

    observer?.disconnect();
    const nav = Array.from(target.querySelectorAll('.amazon-focus-nav a[href^="#"]'));
    observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      nav.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.target.id}`));
    }, { root: target, rootMargin: '-18% 0px -68%', threshold: [0, .2, .5] });
    nav.forEach((link) => { const section = target.querySelector(link.getAttribute('href')); if (section) observer.observe(section); });
  }

  function maybeRender() {
    if (html.dataset.focus === 'amazon') requestAnimationFrame(render);
  }

  window.addEventListener('future:focus-theme', (event) => { if (event.detail?.name === 'amazon') setTimeout(render, 0); });
  new MutationObserver(maybeRender).observe(html, { attributes: true, attributeFilter: ['data-focus'] });
  maybeRender();
})();