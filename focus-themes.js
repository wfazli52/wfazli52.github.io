(() => {
  'use strict';

  if (window.__AF_FOCUS_THEMES_V8__) return;
  window.__AF_FOCUS_THEMES_V8__ = true;

  const html = document.documentElement;
  const body = document.body;
  const storageKey = 'af_focus_identity_v1';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const themes = {
    original: {
      label: 'Original',
      eyebrow: 'Portfolio',
      description: 'The original electric infrastructure look.',
      colors: ['#557cff', '#3de6ff', '#a66cff', '#69f0ad'],
      darkMeta: '#080a10',
      lightMeta: '#fbfbfc'
    },
    google: {
      label: 'Google Focus',
      eyebrow: 'Clarity',
      description: 'Clean, bright, search-first energy with four-color signals.',
      colors: ['#4285f4', '#ea4335', '#fbbc05', '#34a853'],
      darkMeta: '#0b1020',
      lightMeta: '#f8faff'
    },
    amazon: {
      label: 'Amazon Focus',
      eyebrow: 'Operations',
      description: 'Deep navy, orange telemetry, and infrastructure-console contrast.',
      colors: ['#ff9900', '#00a8e1', '#ffb84d', '#58c77b'],
      darkMeta: '#0b111b',
      lightMeta: '#fffaf3'
    },
    microsoft: {
      label: 'Microsoft Focus',
      eyebrow: 'Systems',
      description: 'Structured blue, cyan, violet, and green for a cloud-systems feel.',
      colors: ['#0078d4', '#00bcf2', '#7f58af', '#107c10'],
      darkMeta: '#0a111b',
      lightMeta: '#f7fbff'
    }
  };

  let active = 'original';
  let open = false;
  let root;
  let trigger;
  let panel;
  let live;
  let transitionTimer = 0;

  function safeRead() {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored && themes[stored] ? stored : 'original';
    } catch {
      return 'original';
    }
  }

  function safeWrite(value) {
    try { localStorage.setItem(storageKey, value); } catch { /* private mode */ }
  }

  function themeMetaColor(name = active) {
    const spec = themes[name] || themes.original;
    return html.dataset.theme === 'paper' ? spec.lightMeta : spec.darkMeta;
  }

  function syncMetaColor() {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeMetaColor());
  }

  function announce(message) {
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
  }

  function runTransition(name) {
    if (reduceMotion.matches) return;
    let flash = document.querySelector('.focus-theme-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.className = 'focus-theme-flash';
      flash.setAttribute('aria-hidden', 'true');
      body.appendChild(flash);
    }
    flash.dataset.focusFlash = name;
    flash.classList.remove('is-on');
    void flash.offsetWidth;
    flash.classList.add('is-on');
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => flash.classList.remove('is-on'), 720);
  }

  function renderTrigger() {
    if (!trigger) return;
    const spec = themes[active];
    trigger.querySelector('[data-focus-name]').textContent = spec.label;
    trigger.querySelector('[data-focus-preview]').innerHTML = spec.colors
      .map((color) => `<i style="--focus-dot:${color}"></i>`)
      .join('');
    trigger.setAttribute('aria-label', `Visual focus: ${spec.label}. Open theme selector.`);
  }

  function renderSelection() {
    if (!panel) return;
    panel.querySelectorAll('[data-focus-option]').forEach((button) => {
      const selected = button.dataset.focusOption === active;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function setOpen(next, options = {}) {
    open = Boolean(next);
    root?.classList.toggle('is-open', open);
    trigger?.setAttribute('aria-expanded', String(open));
    panel?.setAttribute('aria-hidden', String(!open));
    if (open && !options.skipFocus) {
      const selected = panel?.querySelector('[data-focus-option].is-selected') || panel?.querySelector('[data-focus-option]');
      setTimeout(() => selected?.focus(), reduceMotion.matches ? 0 : 90);
    }
  }

  function setFocusTheme(name, options = {}) {
    if (!themes[name]) name = 'original';
    const changed = active !== name;
    active = name;
    html.dataset.focus = active;
    safeWrite(active);
    renderTrigger();
    renderSelection();
    syncMetaColor();

    window.dispatchEvent(new CustomEvent('future:focus-theme', {
      detail: { name: active, colors: themes[active].colors.slice() }
    }));

    if (changed && !options.silent) {
      runTransition(active);
      announce(`${themes[active].label} visual focus enabled.`);
    }
    if (options.close !== false) setOpen(false, { skipFocus: true });
  }

  function optionMarkup(key, spec) {
    const dots = spec.colors.map((color) => `<i style="--focus-dot:${color}"></i>`).join('');
    return `
      <button type="button" class="focus-theme-option" data-focus-option="${key}" role="radio" aria-checked="false" tabindex="-1">
        <span class="focus-theme-option-top">
          <span class="focus-theme-option-eyebrow">${spec.eyebrow}</span>
          <span class="focus-theme-dots" aria-hidden="true">${dots}</span>
        </span>
        <strong>${spec.label}</strong>
        <small>${spec.description}</small>
        <span class="focus-theme-check" aria-hidden="true">✓</span>
      </button>`;
  }

  function createSwitcher() {
    if (document.querySelector('.focus-theme-switcher')) return;

    root = document.createElement('div');
    root.className = 'focus-theme-switcher';
    root.innerHTML = `
      <button type="button" class="focus-theme-trigger" aria-expanded="false" aria-haspopup="dialog">
        <span class="focus-theme-trigger-copy">
          <span class="focus-theme-trigger-kicker">Visual focus</span>
          <strong data-focus-name>Original</strong>
        </span>
        <span class="focus-theme-dots focus-theme-trigger-preview" data-focus-preview aria-hidden="true"></span>
        <span class="focus-theme-chevron" aria-hidden="true">⌄</span>
      </button>
      <div class="focus-theme-panel" role="dialog" aria-label="Choose portfolio visual focus" aria-hidden="true">
        <div class="focus-theme-panel-head">
          <div>
            <span>Interface identity</span>
            <strong>Choose a focus</strong>
          </div>
          <button type="button" class="focus-theme-close" aria-label="Close visual focus selector">×</button>
        </div>
        <p class="focus-theme-intro">Each focus changes the full palette, atmosphere, interface accents, and 3D lighting. No company affiliation is implied.</p>
        <div class="focus-theme-options" role="radiogroup" aria-label="Visual focus">
          ${Object.entries(themes).map(([key, spec]) => optionMarkup(key, spec)).join('')}
        </div>
        <div class="focus-theme-panel-foot">
          <span>Preference saved on this device</span>
          <kbd>Shift + F</kbd><span>cycle</span>
        </div>
      </div>
      <span class="focus-theme-live" aria-live="polite" aria-atomic="true"></span>`;

    body.appendChild(root);
    trigger = root.querySelector('.focus-theme-trigger');
    panel = root.querySelector('.focus-theme-panel');
    live = root.querySelector('.focus-theme-live');

    trigger.addEventListener('click', () => setOpen(!open));
    root.querySelector('.focus-theme-close')?.addEventListener('click', () => {
      setOpen(false, { skipFocus: true });
      trigger.focus();
    });

    panel.querySelectorAll('[data-focus-option]').forEach((button) => {
      button.addEventListener('click', () => {
        setFocusTheme(button.dataset.focusOption);
        trigger.focus();
      });
      button.addEventListener('keydown', (event) => {
        const buttons = Array.from(panel.querySelectorAll('[data-focus-option]'));
        const index = buttons.indexOf(button);
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          buttons[(index + 1) % buttons.length].focus();
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          buttons[(index - 1 + buttons.length) % buttons.length].focus();
        } else if (event.key === 'Home') {
          event.preventDefault();
          buttons[0].focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          buttons[buttons.length - 1].focus();
        }
      });
    });

    document.addEventListener('pointerdown', (event) => {
      if (open && !root.contains(event.target)) setOpen(false, { skipFocus: true });
    });

    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (typing) return;
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        setOpen(false, { skipFocus: true });
        trigger.focus();
      }
      if (event.shiftKey && event.key.toLowerCase() === 'f' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        const keys = Object.keys(themes);
        const next = keys[(keys.indexOf(active) + 1) % keys.length];
        setFocusTheme(next, { close: true });
      }
    });

    const baseThemeObserver = new MutationObserver(syncMetaColor);
    baseThemeObserver.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

    active = safeRead();
    setFocusTheme(active, { silent: true, close: false });
    setOpen(false, { skipFocus: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createSwitcher, { once: true });
  else createSwitcher();
})();