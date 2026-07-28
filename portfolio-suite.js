(() => {
  'use strict';

  if (window.__PORTFOLIO_PRODUCTION_SUITE__) return;
  window.__PORTFOLIO_PRODUCTION_SUITE__ = true;

  const data = window.PORTFOLIO_PLATFORM || { projects: {}, commands: [], shortcuts: [] };
  const profile = window.PORTFOLIO || {};
  const ownScript = Array.from(document.scripts).find((script) => /(?:^|\/)portfolio-suite\.js(?:\?|$)/.test(script.src));
  const siteRoot = ownScript?.src ? new URL('.', ownScript.src) : new URL('./', document.baseURI);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {
    paletteOpen: false,
    selectedIndex: 0,
    filteredCommands: [],
    previousFocus: null,
    deferredInstallPrompt: null,
    activeModal: null,
    fallbackTour: null,
    tourIndex: 0,
    toastCounter: 0
  };

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const rootUrl = (path = '') => new URL(path, siteRoot).href;
  const pageUrl = () => new URL(document.baseURI || location.href);
  const isHome = () => {
    const pathname = pageUrl().pathname;
    return /(?:^|\/)index\.html$/.test(pathname) || pathname.endsWith('/') || pathname === '';
  };
  const isTyping = (target) => target instanceof HTMLElement && (
    target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );

  function currentProject() {
    const pathname = pageUrl().pathname.replace(/\/+$/, '');
    return Object.entries(data.projects || {}).find(([, project]) => {
      const projectPath = new URL(project.route, siteRoot).pathname.replace(/\/+$/, '');
      return projectPath === pathname;
    }) || null;
  }

  function setMeta(name, content, { property = false } = {}) {
    if (!content) return;
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let tag = document.head.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(property ? 'property' : 'name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  function setLink(rel, href, attributes = {}) {
    let link = document.head.querySelector(`link[rel="${rel}"]${attributes.sizes ? `[sizes="${attributes.sizes}"]` : ''}`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
    Object.entries(attributes).forEach(([key, value]) => link.setAttribute(key, value));
    return link;
  }

  function setupMetadata() {
    const projectEntry = currentProject();
    const project = projectEntry?.[1];
    const title = project ? `${project.title} | ${data.brand?.product || 'DC//NET Portfolio'}` : document.title;
    const description = project?.summary || document.querySelector('meta[name="description"]')?.content || data.brand?.tagline;
    const canonicalPath = pageUrl().pathname.replace(/index\.html$/, '');
    const canonical = new URL(canonicalPath.replace(/^\//, ''), siteRoot).href;
    const image = rootUrl('assets/social-card.svg');

    setLink('canonical', canonical);
    setLink('manifest', rootUrl('manifest.webmanifest'));
    setLink('icon', rootUrl('assets/brand-mark.svg'), { type: 'image/svg+xml' });
    setLink('apple-touch-icon', rootUrl('assets/icon.svg'));
    setMeta('theme-color', data.brand?.themeColor || '#07111f');
    setMeta('color-scheme', 'dark light');
    setMeta('referrer', 'strict-origin-when-cross-origin');
    setMeta('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    setMeta('og:type', project ? 'article' : 'website', { property: true });
    setMeta('og:title', title, { property: true });
    setMeta('og:description', description, { property: true });
    setMeta('og:url', canonical, { property: true });
    setMeta('og:image', image, { property: true });
    setMeta('og:site_name', data.brand?.product || 'DC//NET Portfolio', { property: true });
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    let jsonLd = document.head.querySelector('script[data-platform-jsonld]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.dataset.platformJsonld = '';
      document.head.appendChild(jsonLd);
    }
    const person = {
      '@type': 'Person',
      name: profile.name || data.brand?.mark || 'Portfolio owner',
      url: data.siteUrl || siteRoot.href,
      sameAs: [profile.github, profile.linkedin].filter(Boolean),
      alumniOf: profile.school ? { '@type': 'CollegeOrUniversity', name: profile.school } : undefined,
      jobTitle: profile.headline || 'Aspiring Data Center Technician and Network Engineer'
    };
    const structured = {
      '@context': 'https://schema.org',
      '@graph': [
        person,
        {
          '@type': 'WebSite',
          name: data.brand?.product || 'DC//NET Portfolio',
          url: data.siteUrl || siteRoot.href,
          description: data.brand?.tagline,
          author: { '@type': 'Person', name: person.name }
        },
        ...(project ? [{
          '@type': 'CreativeWork',
          name: project.title,
          url: canonical,
          description: project.summary,
          author: { '@type': 'Person', name: person.name },
          learningResourceType: 'Technical portfolio case study',
          educationalUse: 'Portfolio and training plan'
        }] : [])
      ]
    };
    jsonLd.textContent = JSON.stringify(structured).replaceAll('<', '\\u003c');
  }

  function createUtilities() {
    if (!document.querySelector('[data-platform-live]')) {
      const live = document.createElement('div');
      live.className = 'platform-sr-only';
      live.dataset.platformLive = '';
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    if (!document.querySelector('[data-platform-toast-stack]')) {
      const stack = document.createElement('div');
      stack.className = 'platform-toast-stack';
      stack.dataset.platformToastStack = '';
      document.body.appendChild(stack);
    }
  }

  function announce(message) {
    const live = document.querySelector('[data-platform-live]');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(() => { live.textContent = message; }, 20);
  }

  function toast(title, message = '', options = {}) {
    const stack = document.querySelector('[data-platform-toast-stack]');
    if (!stack) return;
    const item = document.createElement('div');
    item.className = 'platform-toast';
    item.dataset.toastId = String(++state.toastCounter);
    item.innerHTML = `
      <span class="platform-toast-icon" aria-hidden="true">${escapeHtml(options.icon || '●')}</span>
      <span class="platform-toast-copy"><strong>${escapeHtml(title)}</strong>${message ? `<span>${escapeHtml(message)}</span>` : ''}</span>
      ${options.action ? `<button type="button" data-toast-action>${escapeHtml(options.action.label)}</button>` : '<button type="button" data-toast-close aria-label="Dismiss">×</button>'}`;
    stack.appendChild(item);

    const remove = () => {
      if (!item.isConnected) return;
      item.classList.add('is-leaving');
      window.setTimeout(() => item.remove(), reduceMotion.matches ? 0 : 190);
    };
    item.querySelector('[data-toast-close]')?.addEventListener('click', remove);
    item.querySelector('[data-toast-action]')?.addEventListener('click', () => {
      options.action.handler?.();
      remove();
    });
    window.setTimeout(remove, options.duration || 5200);
    announce(`${title}. ${message}`.trim());
  }

  function projectCommands() {
    return Object.entries(data.projects || {}).map(([id, project]) => ({
      id: `project-${id}`,
      label: `Open ${project.shortTitle}`,
      keywords: `${project.title} ${project.tools?.join(' ') || ''} project case study`,
      action: 'navigate',
      target: project.route,
      group: 'Projects',
      icon: project.number
    }));
  }

  function baseCommands() {
    const commands = [...(data.commands || []), ...projectCommands()];
    const here = currentProject();
    if (here) {
      const [id] = here;
      commands.unshift(
        { id: 'case-overview', label: 'Project: Overview', keywords: 'case study overview', action: 'case-tab', target: 'overview', group: 'This project', icon: 'OV' },
        { id: 'case-architecture', label: 'Project: Architecture', keywords: 'topology diagram rack workflow', action: 'case-tab', target: 'architecture', group: 'This project', icon: 'AR' },
        { id: 'case-testing', label: 'Project: Test matrix', keywords: 'acceptance validation test evidence', action: 'case-tab', target: 'testing', group: 'This project', icon: 'TS' },
        { id: 'case-evidence', label: 'Project: Evidence package', keywords: 'proof artifacts screenshots configs', action: 'case-tab', target: 'evidence', group: 'This project', icon: 'EV' }
      );
    }
    return commands;
  }

  function commandDescription(command) {
    const descriptions = {
      navigate: 'Open a portfolio page',
      external: 'Open in a new tab',
      section: 'Jump to a section',
      'proof-mode': `Activate ${command.target} mode`,
      tour: 'Guided recruiter presentation',
      operations: 'Interactive full-screen lab',
      terminal: 'Troubleshooting command input',
      effects: 'Motion preference control',
      install: 'Installable offline portfolio',
      'copy-link': 'Copy the current public URL',
      'download-brief': 'Generate a recruiter-ready Markdown summary',
      shortcuts: 'Keyboard and accessibility help',
      'case-tab': 'Open this case-study section'
    };
    return command.group || descriptions[command.action] || command.keywords || '';
  }

  function commandIcon(command) {
    if (command.icon) return command.icon;
    const icons = {
      navigate: '↗', external: 'GH', section: '§', 'proof-mode': '✓', tour: '▶', operations: 'OP', terminal: '>_', effects: 'FX', install: 'APP', 'copy-link': '⧉', 'download-brief': 'MD', shortcuts: '?', 'case-tab': 'CS'
    };
    return icons[command.action] || '•';
  }

  function createCommandPalette() {
    if (document.querySelector('[data-platform-overlay]')) return;
    const overlay = document.createElement('div');
    overlay.className = 'platform-overlay';
    overlay.dataset.platformOverlay = '';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="platform-palette" role="dialog" aria-modal="true" aria-labelledby="platform-palette-title">
        <h2 class="platform-sr-only" id="platform-palette-title">Portfolio command palette</h2>
        <div class="platform-palette-search">
          <span class="platform-palette-mark" aria-hidden="true">⌘</span>
          <input class="platform-palette-input" type="search" autocomplete="off" spellcheck="false" placeholder="Search projects, evidence, actions, and sections…" aria-controls="platform-command-results" aria-activedescendant="">
          <button class="platform-palette-close" type="button" data-platform-close aria-label="Close command palette">×</button>
        </div>
        <div class="platform-palette-context"><span>DC//NET command layer</span><strong>${escapeHtml(currentProject()?.[1]?.shortTitle || (isHome() ? 'Portfolio home' : document.title))}</strong></div>
        <ul class="platform-palette-results" id="platform-command-results" role="listbox"></ul>
        <div class="platform-palette-footer"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> run</span><span><kbd>Esc</kbd> close</span><span><kbd>Alt</kbd><kbd>R</kbd> tour</span></div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('mousedown', (event) => {
      if (event.target === overlay) closePalette();
    });
    overlay.querySelector('[data-platform-close]')?.addEventListener('click', closePalette);
    const input = overlay.querySelector('.platform-palette-input');
    input?.addEventListener('input', () => renderCommands(input.value));
    input?.addEventListener('keydown', handlePaletteKeys);
    overlay.querySelector('.platform-palette-results')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-command-index]');
      if (!button) return;
      const command = state.filteredCommands[Number(button.dataset.commandIndex)];
      if (command) executeCommand(command);
    });
    renderCommands('');
  }

  function scoreCommand(command, query) {
    if (!query) return 1;
    const normalized = query.toLowerCase().trim();
    const terms = normalized.split(/\s+/).filter(Boolean);
    const label = command.label.toLowerCase();
    const haystack = `${label} ${command.keywords || ''} ${commandDescription(command)}`.toLowerCase();
    if (label.startsWith(normalized)) return 100;
    if (label.includes(normalized)) return 80;
    let score = 0;
    for (const term of terms) {
      if (!haystack.includes(term)) return 0;
      score += label.includes(term) ? 18 : 8;
    }
    return score;
  }

  function renderCommands(query = '') {
    const list = document.querySelector('.platform-palette-results');
    const input = document.querySelector('.platform-palette-input');
    if (!list) return;
    state.filteredCommands = baseCommands()
      .map((command, order) => ({ ...command, _score: scoreCommand(command, query), _order: order }))
      .filter((command) => command._score > 0)
      .sort((a, b) => b._score - a._score || a._order - b._order)
      .slice(0, 14);
    state.selectedIndex = Math.min(state.selectedIndex, Math.max(state.filteredCommands.length - 1, 0));

    if (!state.filteredCommands.length) {
      list.innerHTML = '<li class="platform-palette-empty"><div><strong>No command found</strong>Try a project name, “proof,” “resume,” “tour,” or “install.”</div></li>';
      input?.setAttribute('aria-activedescendant', '');
      return;
    }

    list.innerHTML = state.filteredCommands.map((command, index) => `
      <li role="option" id="platform-command-${index}" aria-selected="${index === state.selectedIndex}">
        <button class="platform-command" type="button" data-command-index="${index}" aria-selected="${index === state.selectedIndex}" tabindex="-1">
          <span class="platform-command-icon" aria-hidden="true">${escapeHtml(commandIcon(command))}</span>
          <span class="platform-command-copy"><strong>${escapeHtml(command.label)}</strong><span>${escapeHtml(commandDescription(command))}</span></span>
          <span class="platform-command-hint">${escapeHtml(command.group || command.action)}</span>
        </button>
      </li>`).join('');
    input?.setAttribute('aria-activedescendant', `platform-command-${state.selectedIndex}`);
  }

  function updateCommandSelection(nextIndex) {
    if (!state.filteredCommands.length) return;
    state.selectedIndex = (nextIndex + state.filteredCommands.length) % state.filteredCommands.length;
    document.querySelectorAll('.platform-palette-results [role="option"]').forEach((item, index) => {
      const active = index === state.selectedIndex;
      item.setAttribute('aria-selected', String(active));
      item.querySelector('.platform-command')?.setAttribute('aria-selected', String(active));
      if (active) item.scrollIntoView({ block: 'nearest' });
    });
    document.querySelector('.platform-palette-input')?.setAttribute('aria-activedescendant', `platform-command-${state.selectedIndex}`);
  }

  function handlePaletteKeys(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      updateCommandSelection(state.selectedIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      updateCommandSelection(state.selectedIndex - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const command = state.filteredCommands[state.selectedIndex];
      if (command) executeCommand(command);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      document.querySelector('[data-platform-close]')?.focus();
    }
  }

  function openPalette(initialQuery = '') {
    createCommandPalette();
    const overlay = document.querySelector('[data-platform-overlay]');
    const input = overlay?.querySelector('.platform-palette-input');
    if (!overlay || !input) return;
    state.previousFocus = document.activeElement;
    state.paletteOpen = true;
    state.selectedIndex = 0;
    input.value = initialQuery;
    renderCommands(initialQuery);
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('platform-overlay-open');
    document.body.classList.add('platform-overlay-open');
    window.setTimeout(() => input.focus(), reduceMotion.matches ? 0 : 80);
  }

  function closePalette({ restoreFocus = true } = {}) {
    const overlay = document.querySelector('[data-platform-overlay]');
    if (!overlay || !state.paletteOpen) return;
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('platform-overlay-open');
    document.body.classList.remove('platform-overlay-open');
    state.paletteOpen = false;
    if (restoreFocus && state.previousFocus instanceof HTMLElement) state.previousFocus.focus();
  }

  function absoluteTarget(target) {
    if (!target) return siteRoot.href;
    if (/^https?:\/\//i.test(target)) return target;
    return rootUrl(target.replace(/^\.\//, ''));
  }

  function jumpToSection(target) {
    const id = target.startsWith('#') ? target.slice(1) : target;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      try { history.replaceState(null, '', `#${id}`); } catch { /* Embedded previews can block history updates. */ }
      return;
    }
    location.href = `${rootUrl('')}${target.startsWith('#') ? target : `#${target}`}`;
  }

  function setProofMode(mode) {
    const button = document.querySelector(`[data-proof-set="${CSS.escape(mode)}"]`);
    if (button) {
      button.click();
      return true;
    }
    try { localStorage.setItem('dc-portfolio-proof-mode', mode); } catch { /* no-op */ }
    const url = new URL(isHome() ? location.href : rootUrl(''));
    url.searchParams.set('proof', mode);
    if (mode === 'simulation') url.hash = 'command-center';
    location.href = url.href;
    return false;
  }

  function focusTerminal() {
    const terminal = document.querySelector('[data-terminal-input], .command-terminal input, .cc-terminal input');
    const proofMode = document.body.dataset.proofMode || document.documentElement.dataset.proofMode;
    if (proofMode === 'verified') {
      setProofMode('simulation');
      window.setTimeout(() => document.querySelector('[data-terminal-input], .command-terminal input, .cc-terminal input')?.focus(), 420);
      return;
    }
    if (terminal) {
      terminal.focus();
      terminal.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      toast('Terminal focused', 'Type help to view the supported diagnostic commands.', { icon: '>_' });
    } else {
      location.href = `${rootUrl('')}?proof=simulation#command-center`;
    }
  }

  function startRecruiterTour() {
    const existing = document.querySelector('[data-tour-start]');
    if (existing) {
      existing.click();
      return;
    }
    startFallbackTour();
  }

  function executeCommand(command) {
    closePalette({ restoreFocus: false });
    switch (command.action) {
      case 'navigate':
        location.href = absoluteTarget(command.target);
        break;
      case 'external':
        window.open(command.target, '_blank', 'noopener,noreferrer');
        break;
      case 'section':
        jumpToSection(command.target);
        break;
      case 'proof-mode':
        setProofMode(command.target);
        break;
      case 'tour':
        startRecruiterTour();
        break;
      case 'operations': {
        const button = document.querySelector('[data-ops-open]');
        if (button) {
          if ((document.body.dataset.proofMode || '') === 'verified') setProofMode('simulation');
          window.setTimeout(() => button.click(), 120);
        } else location.href = `${rootUrl('')}?proof=simulation#command-center`;
        break;
      }
      case 'terminal':
        focusTerminal();
        break;
      case 'effects':
        document.querySelector('[data-fx-toggle]')?.click();
        break;
      case 'install':
        requestInstall();
        break;
      case 'copy-link':
        shareOrCopyLink();
        break;
      case 'download-brief':
        downloadRecruiterBrief();
        break;
      case 'shortcuts':
        openShortcutsModal();
        break;
      case 'case-tab':
        window.dispatchEvent(new CustomEvent('portfolio:case-tab', { detail: { tab: command.target } }));
        break;
      default:
        break;
    }
  }

  function createDock() {
    if (document.querySelector('[data-platform-dock]')) return;
    const dock = document.createElement('div');
    dock.className = 'platform-dock';
    dock.dataset.platformDock = '';
    dock.setAttribute('aria-label', 'Portfolio quick actions');
    dock.innerHTML = `
      <button class="platform-dock-button is-primary" type="button" data-dock-command aria-label="Open command palette"><span class="platform-dock-icon" aria-hidden="true">⌘</span><span>Command</span><kbd>Ctrl K</kbd></button>
      <button class="platform-dock-button" type="button" data-dock-tour aria-label="Start recruiter tour"><span class="platform-dock-icon" aria-hidden="true">▶</span><span>Tour</span></button>
      <button class="platform-dock-button" type="button" data-dock-share aria-label="Share portfolio"><span class="platform-dock-icon" aria-hidden="true">⧉</span><span>Share</span></button>`;
    document.body.appendChild(dock);
    dock.querySelector('[data-dock-command]')?.addEventListener('click', () => openPalette());
    dock.querySelector('[data-dock-tour]')?.addEventListener('click', startRecruiterTour);
    dock.querySelector('[data-dock-share]')?.addEventListener('click', shareOrCopyLink);
  }

  function createModal() {
    if (document.querySelector('[data-platform-modal]')) return document.querySelector('[data-platform-modal]');
    const modal = document.createElement('div');
    modal.className = 'platform-modal';
    modal.dataset.platformModal = '';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = '<div class="platform-modal-card" role="dialog" aria-modal="true"><div class="platform-modal-head"><h2 data-platform-modal-title>Portfolio help</h2><button class="platform-palette-close" type="button" data-platform-modal-close aria-label="Close">×</button></div><div class="platform-modal-body" data-platform-modal-body></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('mousedown', (event) => { if (event.target === modal) closeModal(); });
    modal.querySelector('[data-platform-modal-close]')?.addEventListener('click', closeModal);
    return modal;
  }

  function openModal(title, html) {
    const modal = createModal();
    state.previousFocus = document.activeElement;
    state.activeModal = modal;
    modal.querySelector('[data-platform-modal-title]').textContent = title;
    modal.querySelector('[data-platform-modal-body]').innerHTML = html;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('platform-overlay-open');
    document.body.classList.add('platform-overlay-open');
    window.setTimeout(() => modal.querySelector('[data-platform-modal-close]')?.focus(), 20);
  }

  function closeModal() {
    const modal = document.querySelector('[data-platform-modal]');
    if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('platform-overlay-open');
    document.body.classList.remove('platform-overlay-open');
    state.activeModal = null;
    if (state.previousFocus instanceof HTMLElement) state.previousFocus.focus();
  }

  function openShortcutsModal() {
    const rows = (data.shortcuts || []).map((shortcut) => `<div class="platform-shortcut-row"><span>${escapeHtml(shortcut.label)}</span><kbd>${escapeHtml(shortcut.keys)}</kbd></div>`).join('');
    openModal('Keyboard shortcuts', `<p>Every major interaction is available without a mouse. Shortcuts are ignored while you are typing in a field.</p><div class="platform-shortcut-grid">${rows}</div>`);
  }

  function setupGlobalShortcuts() {
    window.addEventListener('keydown', (event) => {
      const typing = isTyping(event.target);
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        event.stopImmediatePropagation();
        state.paletteOpen ? closePalette() : openPalette();
        return;
      }
      if (event.altKey && key === 'r') {
        event.preventDefault();
        event.stopImmediatePropagation();
        startRecruiterTour();
        return;
      }
      if (event.altKey && key === 't') {
        event.preventDefault();
        event.stopImmediatePropagation();
        focusTerminal();
        return;
      }
      if (!typing && event.key === '?' && !state.paletteOpen) {
        event.preventDefault();
        openShortcutsModal();
        return;
      }
      if (event.key === 'Escape') {
        if (state.paletteOpen) {
          event.preventDefault();
          closePalette();
        } else if (state.activeModal) {
          event.preventDefault();
          closeModal();
        } else if (state.fallbackTour) {
          event.preventDefault();
          closeFallbackTour();
        }
      }
    }, true);
  }

  function tourStepsForPage() {
    const project = currentProject()?.[1];
    if (project) {
      return [
        { selector: '.page-hero', kicker: '01 · Mission', title: project.title, description: 'Start with the project objective, target role value, and honest evidence status.' },
        { selector: '.proof-project-panel, .proof-mode-bar', kicker: '02 · Integrity', title: 'Proof before claims', description: 'The project stays planned until public artifacts support the build, test, and recovery statements.' },
        { selector: '.case-study-shell', kicker: '03 · Case study', title: 'One technical story', description: 'Architecture, build sequence, testing, configuration, incidents, and evidence are organized in one recruiter-friendly interface.' },
        { selector: '[data-case-tab="architecture"]', kicker: '04 · Design', title: 'Clickable infrastructure', description: 'The architecture view explains device roles, paths, rack positions, or troubleshooting stages.' },
        { selector: '[data-case-tab="testing"]', kicker: '05 · Validation', title: 'Acceptance tests', description: 'Expected results are defined before the lab is treated as complete.' },
        { selector: '[data-case-tab="evidence"]', kicker: '06 · Evidence', title: 'What unlocks verification', description: 'The evidence package lists the exact artifacts that must be published before the resume bullet unlocks.' }
      ];
    }
    if (document.body.classList.contains('resume-page')) {
      return [
        { selector: '.resume-head', kicker: '01 · Positioning', title: 'Role-targeted introduction', description: 'The resume leads with the data-center and networking direction.' },
        { selector: '.resume-section', kicker: '02 · Evidence', title: 'Verified work only', description: 'Project bullets should be used only after the linked evidence package is complete.' },
        { selector: '.platform-resume-qr', kicker: '03 · Portfolio', title: 'One scan to the proof', description: 'The QR code returns a recruiter to the live portfolio and verified evidence ledger.' }
      ];
    }
    return [
      { selector: '.hero', kicker: '01 · Career target', title: 'Data center now. Network engineering next.', description: 'The opening establishes the role target, education path, and proof-first approach.' },
      { selector: '.proof-mode-bar, #verified-proof', kicker: '02 · Integrity', title: 'Claims are separated from simulations', description: 'Recruiters can see exactly what is verified, planned, in progress, or simulated.' },
      { selector: '#command-center', kicker: '03 · Interactive thinking', title: 'Troubleshooting under controlled faults', description: 'The simulator demonstrates process and is explicitly labeled training—not production experience.' },
      { selector: '#projects', kicker: '04 · Technical roadmap', title: 'Four labs, one career story', description: 'Networking, Linux, incident response, and physical operations build on one another.' },
      { selector: '#skills', kicker: '05 · Honest skill labels', title: 'Evidence level is visible', description: 'Skills are described precisely instead of using unsupported expert claims.' },
      { selector: '#contact', kicker: '06 · Next action', title: 'Resume, GitHub, and contact', description: 'The final step makes it easy to inspect the source, open the resume, or contact the candidate.' }
    ];
  }

  function createFallbackTour() {
    if (document.querySelector('[data-platform-tour]')) return document.querySelector('[data-platform-tour]');
    const layer = document.createElement('div');
    layer.className = 'platform-tour-layer';
    layer.dataset.platformTour = '';
    layer.hidden = true;
    layer.innerHTML = `
      <div class="platform-tour-backdrop" data-platform-tour-close></div>
      <div class="platform-tour-highlight" aria-hidden="true"></div>
      <div class="platform-tour-card" role="dialog" aria-modal="true" aria-labelledby="platform-tour-title">
        <div class="platform-tour-card-top"><span class="platform-tour-step" data-platform-tour-step>Step</span><button class="platform-palette-close" type="button" data-platform-tour-close aria-label="Close tour">×</button></div>
        <h2 id="platform-tour-title" data-platform-tour-title>Recruiter tour</h2>
        <p data-platform-tour-copy></p>
        <div class="platform-tour-progress" aria-hidden="true"><span></span></div>
        <div class="platform-tour-actions"><button class="platform-tour-button" type="button" data-platform-tour-back>Back</button><button class="platform-tour-button primary" type="button" data-platform-tour-next>Next</button></div>
      </div>`;
    document.body.appendChild(layer);
    layer.querySelectorAll('[data-platform-tour-close]').forEach((button) => button.addEventListener('click', closeFallbackTour));
    layer.querySelector('[data-platform-tour-back]')?.addEventListener('click', () => showFallbackTourStep(state.tourIndex - 1));
    layer.querySelector('[data-platform-tour-next]')?.addEventListener('click', () => {
      const steps = state.fallbackTour || [];
      if (state.tourIndex >= steps.length - 1) closeFallbackTour();
      else showFallbackTourStep(state.tourIndex + 1);
    });
    return layer;
  }

  function startFallbackTour() {
    state.fallbackTour = tourStepsForPage().filter((step) => document.querySelector(step.selector));
    if (!state.fallbackTour.length) {
      toast('Tour unavailable', 'This page has no guided steps yet.');
      return;
    }
    const layer = createFallbackTour();
    state.previousFocus = document.activeElement;
    layer.hidden = false;
    document.documentElement.classList.add('platform-overlay-open');
    document.body.classList.add('platform-overlay-open');
    showFallbackTourStep(0);
  }

  function updateTourHighlight() {
    const layer = document.querySelector('[data-platform-tour]');
    const steps = state.fallbackTour || [];
    const step = steps[state.tourIndex];
    const target = step ? document.querySelector(step.selector) : null;
    const highlight = layer?.querySelector('.platform-tour-highlight');
    if (!target || !highlight) return;
    const rect = target.getBoundingClientRect();
    const pad = 8;
    highlight.style.top = `${Math.max(8, rect.top - pad)}px`;
    highlight.style.left = `${Math.max(8, rect.left - pad)}px`;
    highlight.style.width = `${Math.min(innerWidth - 16, rect.width + pad * 2)}px`;
    highlight.style.height = `${Math.min(innerHeight - 16, rect.height + pad * 2)}px`;
  }

  function showFallbackTourStep(index) {
    const layer = document.querySelector('[data-platform-tour]');
    const steps = state.fallbackTour || [];
    if (!layer || !steps.length) return;
    state.tourIndex = Math.max(0, Math.min(index, steps.length - 1));
    const step = steps[state.tourIndex];
    const target = document.querySelector(step.selector);
    target?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    layer.querySelector('[data-platform-tour-step]').textContent = `${step.kicker} · ${state.tourIndex + 1}/${steps.length}`;
    layer.querySelector('[data-platform-tour-title]').textContent = step.title;
    layer.querySelector('[data-platform-tour-copy]').textContent = step.description;
    layer.querySelector('.platform-tour-progress span').style.setProperty('--tour-progress', `${((state.tourIndex + 1) / steps.length) * 100}%`);
    layer.querySelector('[data-platform-tour-back]').disabled = state.tourIndex === 0;
    layer.querySelector('[data-platform-tour-next]').textContent = state.tourIndex === steps.length - 1 ? 'Finish' : 'Next';
    window.setTimeout(updateTourHighlight, reduceMotion.matches ? 0 : 360);
    layer.querySelector('[data-platform-tour-next]')?.focus();
  }

  function closeFallbackTour() {
    const layer = document.querySelector('[data-platform-tour]');
    if (!layer || layer.hidden) return;
    layer.hidden = true;
    state.fallbackTour = null;
    document.documentElement.classList.remove('platform-overlay-open');
    document.body.classList.remove('platform-overlay-open');
    if (state.previousFocus instanceof HTMLElement) state.previousFocus.focus();
  }

  async function shareOrCopyLink() {
    const project = currentProject()?.[1];
    const shareData = {
      title: project?.title || document.title,
      text: project?.summary || data.brand?.tagline,
      url: location.href
    };
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(location.href);
      toast('Portfolio link copied', 'The current public URL is ready to share.', { icon: '⧉' });
    } catch {
      window.prompt('Copy this portfolio link:', location.href);
    }
  }

  function proofStatusForProject(id, project) {
    const milestones = window.PORTFOLIO_PROOF?.milestones || [];
    const match = milestones.find((milestone) => milestone.id === id || milestone.route?.endsWith(project.route));
    return match?.status || project.status || 'planned';
  }

  function downloadRecruiterBrief() {
    const lines = [];
    const owner = profile.name || data.brand?.mark || 'Portfolio owner';
    lines.push(`# ${owner} — Data Center & Networking Recruiter Brief`, '');
    lines.push(`**Target:** ${profile.headline || 'Data Center Technician and Network Engineering path'}`);
    if (profile.school) lines.push(`**Education:** ${profile.school}`);
    lines.push(`**Portfolio:** ${data.siteUrl || siteRoot.href}`);
    lines.push(`**Source:** ${data.repository || profile.github || ''}`, '');
    lines.push('## Evidence policy', '', 'Only public, inspectable artifacts are presented as verified. Plans, templates, and browser simulations are labeled separately.', '');
    lines.push('## Project pipeline', '');
    Object.entries(data.projects || {}).forEach(([id, project]) => {
      const status = proofStatusForProject(id, project).replace('-', ' ');
      lines.push(`### ${project.title} — ${status.toUpperCase()}`, '', project.summary, '', '**Planned evidence:**');
      project.evidence?.forEach((item) => lines.push(`- ${item.label} (${item.path})`));
      lines.push('');
    });
    lines.push('## Recruiter navigation', '', `- Verified proof: ${(data.siteUrl || siteRoot.href)}?proof=verified#verified-proof`, `- Resume: ${rootUrl(profile.resumeFile || 'resume.html')}`, `- GitHub: ${profile.github || data.repository}`, '');
    lines.push(`Generated ${new Date().toISOString().slice(0,10)} from the public portfolio data model.`);

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data-center-networking-recruiter-brief.md';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    toast('Recruiter brief generated', 'A Markdown summary was downloaded from the current public data.', { icon: 'MD' });
  }

  function installGuidance() {
    const mobile = matchMedia('(pointer: coarse)').matches;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const copy = ios
      ? 'Open the browser Share menu, choose “Add to Home Screen,” then confirm. The portfolio will launch like an app and retain an offline fallback.'
      : mobile
        ? 'Open your browser menu and choose “Install app” or “Add to Home screen.”'
        : 'Use the install icon in the browser address bar, or open the browser menu and choose “Install DC//NET Portfolio.”';
    openModal('Install the portfolio app', `<p>${escapeHtml(copy)}</p><p>The install option appears only when the browser supports it and the site has been visited over HTTPS.</p>`);
  }

  async function requestInstall() {
    if (!state.deferredInstallPrompt) {
      installGuidance();
      return;
    }
    state.deferredInstallPrompt.prompt();
    try {
      const result = await state.deferredInstallPrompt.userChoice;
      toast(result.outcome === 'accepted' ? 'Installation started' : 'Installation dismissed', result.outcome === 'accepted' ? 'The portfolio can now open like an app.' : 'You can install it later from the command palette.', { icon: 'APP' });
    } finally {
      state.deferredInstallPrompt = null;
    }
  }

  function setupPwa() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      toast('Portfolio app available', 'Install it for a fast, full-screen, offline-capable experience.', {
        icon: 'APP',
        duration: 9000,
        action: { label: 'Install', handler: requestInstall }
      });
    });
    window.addEventListener('appinstalled', () => {
      state.deferredInstallPrompt = null;
      toast('Portfolio installed', 'The app shortcut is ready.', { icon: '✓' });
    });

    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register(rootUrl('sw.js'), { scope: new URL('.', siteRoot).pathname });
        if (registration.waiting) showUpdateToast(registration);
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateToast(registration);
          });
        });
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    }, { once: true });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });

    window.addEventListener('offline', () => toast('Offline mode', 'Cached portfolio pages remain available.', { icon: '○', duration: 8000 }));
    window.addEventListener('online', () => toast('Connection restored', 'Fresh content and links are available again.', { icon: '●' }));
  }

  function showUpdateToast(registration) {
    toast('New portfolio version ready', 'Refresh once to activate the latest experience.', {
      icon: '↻',
      duration: 12000,
      action: {
        label: 'Update',
        handler: () => registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      }
    });
  }

  function enhanceResume() {
    if (!document.body.classList.contains('resume-page') || document.querySelector('.platform-resume-qr')) return;
    const target = document.querySelector('.resume-contact') || document.querySelector('.resume-head');
    if (!target) return;
    const block = document.createElement('div');
    block.className = 'platform-resume-qr';
    block.innerHTML = `<img src="${rootUrl('assets/portfolio-qr.svg')}" alt="QR code linking to the live portfolio"><div><strong>Scan the proof-first portfolio</strong><span>${escapeHtml(data.siteUrl || siteRoot.href)}</span></div>`;
    target.appendChild(block);
  }

  function addRecruiterLinks() {
    document.querySelectorAll('.footer-links, .site-footer .footer-row, .resume-actions').forEach((container) => {
      if (container.querySelector('[data-recruiter-link]')) return;
      const link = document.createElement('a');
      link.href = rootUrl('recruiter.html');
      link.textContent = 'Recruiter view';
      link.className = 'platform-recruiter-link';
      link.dataset.recruiterLink = '';
      container.appendChild(link);
    });
  }

  function normalizeCommandCenterShortcuts(root = document) {
    root.querySelectorAll('.command-center-note, [data-command-help], .cc-hint').forEach((element) => {
      if (element.dataset.platformShortcutNormalized) return;
      const text = element.textContent || '';
      if (/ctrl\s*\+?\s*k/i.test(text) && /terminal/i.test(text)) {
        element.innerHTML = element.innerHTML
          .replace(/<kbd>Ctrl<\/kbd>\s*\+?\s*<kbd>K<\/kbd>\s*terminal/gi, '<kbd>Alt</kbd>+<kbd>T</kbd> terminal')
          .replace(/Ctrl\+K\s+terminal/gi, 'Alt+T terminal')
          .replace(/Ctrl\+K\s+focuses this terminal/gi, 'Alt+T focuses this terminal');
      }
      element.dataset.platformShortcutNormalized = 'true';
    });
  }

  function setupMutationEnhancements() {
    normalizeCommandCenterShortcuts();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          normalizeCommandCenterShortcuts(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    setupMetadata();
    createUtilities();
    window.addEventListener('portfolio:toast', (event) => {
      const detail = event.detail || {};
      toast(detail.title || 'Portfolio update', detail.message || '', { icon: detail.icon || '●' });
    });
    createCommandPalette();
    createDock();
    setupGlobalShortcuts();
    setupPwa();
    enhanceResume();
    addRecruiterLinks();
    setupMutationEnhancements();
    document.documentElement.classList.add('platform-ready');
    window.dispatchEvent(new CustomEvent('portfolio:platform-ready', { detail: { version: data.version || '4' } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
