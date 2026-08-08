(() => {
  'use strict';
  if (window.__AF_FOCUS_CHROME_V9__) return;
  window.__AF_FOCUS_CHROME_V9__ = true;

  const html = document.documentElement;
  const body = document.body;
  const root = document.createElement('div');
  root.className = 'focus-mode-chrome';
  root.setAttribute('aria-hidden', 'true');
  body.appendChild(root);

  const markup = {
    original: '',
    google: `
      <div class="google-search-shell">
        <span class="google-search-symbol">⌕</span>
        <strong>Search Abdul's infrastructure portfolio</strong>
        <span class="google-search-cursor"></span>
        <div class="google-search-chips"><i>Data Center</i><i>Networking</i><i>Linux</i><i>Cybersecurity</i></div>
      </div>
      <div class="google-lab-status"><b>Material Lab</b><span>Explore</span><span>Build</span><span>Verify</span></div>`,
    amazon: `
      <div class="amazon-console-shell">
        <div class="amazon-console-id"><b>INFRASTRUCTURE OPERATIONS</b><span>portfolio / dc-lab / abdul-fazli</span></div>
        <div class="amazon-console-states">
          <span><i></i>NETWORK&nbsp;OK</span><span><i></i>BMC&nbsp;OK</span><span><i></i>STORAGE&nbsp;OK</span><span><i></i>POWER&nbsp;A/B</span>
        </div>
      </div>
      <div class="amazon-health-rail">
        <div><b>RESOURCE HEALTH</b><em>LIVE</em></div>
        <span><i></i><b>PWR</b><small>nominal</small></span>
        <span><i></i><b>NET</b><small>10G uplink</small></span>
        <span><i></i><b>TEMP</b><small>within range</small></span>
        <span><i></i><b>BMC</b><small>reachable</small></span>
        <span><i></i><b>DISK</b><small>SMART clean</small></span>
      </div>`,
    microsoft: `
      <div class="ms-command-shell">
        <div class="ms-app-mark"><i></i><i></i><i></i><i></i></div>
        <div class="ms-breadcrumb"><span>Home</span><b>›</b><span>Infrastructure</span><b>›</b><strong>Abdul Fazli</strong></div>
        <div class="ms-command-actions"><i>DCIM</i><i>NET</i><i>OPS</i><i>LAB</i></div>
        <em><u></u>Connected</em>
      </div>
      <div class="ms-workspace-title"><span>CLOUD WORKSPACE</span><b>Systems & infrastructure portfolio</b></div>`
  };

  function render(name) {
    const mode = markup[name] !== undefined ? name : 'original';
    root.dataset.chrome = mode;
    root.innerHTML = markup[mode];
  }

  window.addEventListener('future:focus-theme', (event) => render(event.detail?.name || html.dataset.focus || 'original'));
  new MutationObserver(() => render(html.dataset.focus || 'original')).observe(html, { attributes: true, attributeFilter: ['data-focus'] });
  render(html.dataset.focus || 'original');
})();