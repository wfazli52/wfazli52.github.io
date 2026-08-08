(() => {
  'use strict';
  if (window.__AF_FOCUS_FUNCTIONAL__) return;
  window.__AF_FOCUS_FUNCTIONAL__ = true;

  const html = document.documentElement;
  let cleanup = [];

  function on(node, type, handler, options) {
    if (!node) return;
    node.addEventListener(type, handler, options);
    cleanup.push(() => node.removeEventListener(type, handler, options));
  }

  function clearBindings() {
    cleanup.splice(0).forEach((fn) => fn());
  }

  function smoothScroll(app, selector) {
    const target = app.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  function bindGoogle() {
    clearBindings();
    const app = document.querySelector('.focus-v60-app[data-mode="google"]');
    if (!app) return;
    const searchShell = app.querySelector('.v60-g-search');
    const cards = Array.from(app.querySelectorAll('.v60-g-card'));
    if (searchShell && !searchShell.querySelector('input')) {
      const label = searchShell.querySelector('b');
      const input = document.createElement('input');
      input.type = 'search';
      input.placeholder = 'Search projects, tools, skills';
      input.setAttribute('aria-label', 'Search Google focus projects');
      label?.replaceWith(input);
      input.style.cssText = 'width:100%;border:0;outline:0;background:transparent;font:600 13px Arial,sans-serif;color:#3c4043;';
      const chips = Array.from(searchShell.querySelectorAll('em'));
      const filter = (query = input.value) => {
        const q = String(query || '').trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
          const show = !q || card.textContent.toLowerCase().includes(q);
          card.hidden = !show;
          if (show) visible += 1;
        });
        searchShell.classList.toggle('no-results', visible === 0);
      };
      on(input, 'input', () => filter());
      chips.forEach((chip) => on(chip, 'click', () => { input.value = chip.textContent.trim(); filter(); input.focus(); }));
      on(document, 'keydown', (event) => {
        if (html.dataset.focus !== 'google') return;
        if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) { event.preventDefault(); input.focus(); }
      });
    }
    app.querySelectorAll('a[href^="#"]').forEach((link) => on(link, 'click', (event) => {
      const id = link.getAttribute('href');
      if (!app.querySelector(id)) return;
      event.preventDefault(); smoothScroll(app, id);
    }));
  }

  function bindMicrosoft() {
    clearBindings();
    const app = document.querySelector('.focus-v60-app[data-mode="microsoft"]');
    if (!app) return;
    const searchShell = app.querySelector('.v60-m-search');
    const cards = Array.from(app.querySelectorAll('.v60-m-card'));
    if (searchShell && !searchShell.querySelector('input')) {
      searchShell.innerHTML = '⌕ <input type="search" aria-label="Search Microsoft focus projects" placeholder="Search infrastructure modules">';
      const input = searchShell.querySelector('input');
      input.style.cssText = 'width:100%;border:0;outline:0;background:transparent;color:inherit;font:inherit;';
      const filter = () => {
        const q = input.value.trim().toLowerCase();
        cards.forEach((card) => { card.hidden = Boolean(q) && !card.textContent.toLowerCase().includes(q); });
      };
      on(input, 'input', filter);
      on(document, 'keydown', (event) => {
        if (html.dataset.focus !== 'microsoft') return;
        if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) { event.preventDefault(); input.focus(); }
      });
    }

    const hero = app.querySelector('.v60-m-hero');
    const work = app.querySelector('#v60-m-work');
    const profile = app.querySelector('.v60-m-profile');
    const destinations = [hero, work, profile, profile, profile];
    app.querySelectorAll('.v60-m-rail nav a').forEach((link, index) => {
      link.href = '#';
      link.setAttribute('role', 'button');
      on(link, 'click', (event) => {
        event.preventDefault();
        destinations[index]?.scrollIntoView({ behavior:'smooth', block:'start' });
        app.querySelectorAll('.v60-m-rail nav a').forEach((node) => node.classList.remove('active'));
        link.classList.add('active');
      });
    });

    const taskTargets = [hero, work, profile, profile];
    app.querySelectorAll('.v60-m-taskbar span').forEach((item, index) => {
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      const go = () => taskTargets[index]?.scrollIntoView({ behavior:'smooth', block:'start' });
      on(item, 'click', go);
      on(item, 'keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); go(); } });
    });
  }

  function bind(name) {
    if (name === 'google') requestAnimationFrame(bindGoogle);
    else if (name === 'microsoft') requestAnimationFrame(bindMicrosoft);
    else if (name === 'amazon') clearBindings();
    else clearBindings();
  }

  window.addEventListener('google-focus:start', bindGoogle);
  window.addEventListener('microsoft-focus:start', bindMicrosoft);
  window.addEventListener('amazon-focus:start', clearBindings);
  window.addEventListener('future:focus-theme', (event) => setTimeout(() => bind(event.detail?.name || html.dataset.focus || 'original'), 30));
  bind(html.dataset.focus || 'original');
})();