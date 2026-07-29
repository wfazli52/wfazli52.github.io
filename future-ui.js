(() => {
  'use strict';

  if (window.__FUTURE_UI_V4__) return;
  window.__FUTURE_UI_V4__ = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const masthead = document.querySelector('.masthead');
  let toastTimer = 0;

  function showToast(message) {
    let toast = document.querySelector('.future-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'future-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-on');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-on'), 1900);
  }

  function injectFonts() {
    if (document.querySelector('link[data-future-fonts]')) return;
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    preconnect.dataset.futureFonts = '';
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
    stylesheet.dataset.futureFonts = '';
    document.head.append(preconnect, stylesheet);
  }

  function setupHero3D() {
    if (!hero || document.querySelector('script[data-future-hero-3d]')) return;

    const hud = document.createElement('div');
    hud.className = 'hero-hud';
    hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML = `
      <div class="hero-hud-card"><i></i><span>Render state</span><strong>LIVE</strong></div>
      <div class="hero-hud-card"><i></i><span>Rack telemetry</span><strong>Nominal</strong></div>
      <div class="hero-hud-card"><i></i><span>Packet fabric</span><small>Animated lab model</small></div>`;
    hero.appendChild(hud);

    const controls = document.createElement('div');
    controls.className = 'hero-3d-controls';
    controls.setAttribute('aria-label', 'Hero 3D controls');
    controls.innerHTML = `
      <button type="button" data-hero-explode aria-pressed="false">Explode node</button>
      <button type="button" data-hero-pause aria-pressed="false">Pause scene</button>
      <button type="button" data-hero-reset>Reset camera</button>`;
    hero.appendChild(controls);

    controls.querySelector('[data-hero-explode]')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const active = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'Close node' : 'Explode node';
      window.dispatchEvent(new CustomEvent('future:hero-explode', { detail: { active } }));
      showToast(active ? 'Server node exploded into serviceable components.' : 'Server node returned to the rack.');
    });

    controls.querySelector('[data-hero-pause]')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const paused = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Resume scene' : 'Pause scene';
      window.dispatchEvent(new CustomEvent('future:hero-pause', { detail: { paused } }));
    });

    controls.querySelector('[data-hero-reset]')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('future:hero-reset'));
      showToast('Hero camera reset.');
    });

    const moduleScript = document.createElement('script');
    moduleScript.type = 'module';
    moduleScript.src = 'hero-3d.js?v=1';
    moduleScript.dataset.futureHero3d = '';
    moduleScript.addEventListener('error', () => {
      hud.remove();
      controls.remove();
      console.warn('The hero 3D scene could not load.');
    });
    document.head.appendChild(moduleScript);
  }

  function setupCursor() {
    if (!finePointer.matches || reduceMotion.matches) return;
    const orb = document.createElement('div');
    orb.className = 'future-cursor-orb';
    orb.setAttribute('aria-hidden', 'true');
    document.body.appendChild(orb);

    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const tick = () => {
      x += (tx - x) * .14;
      y += (ty - y) * .14;
      orb.style.transform = `translate(${x - 110}px, ${y - 110}px)`;
      raf = requestAnimationFrame(tick);
    };

    document.addEventListener('pointermove', (event) => {
      tx = event.clientX;
      ty = event.clientY;
      document.documentElement.style.setProperty('--future-mx', `${(event.clientX / innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--future-my', `${(event.clientY / innerHeight) * 100}%`);
    }, { passive: true });

    raf = requestAnimationFrame(tick);
    addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
  }

  function setupSpotlights() {
    const selector = '.kpi, .skill-group, .about-stat, .metric-panel, .project-row, .timeline-entry';
    document.addEventListener('pointermove', (event) => {
      const target = event.target.closest?.(selector);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      target.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
  }

  function setupMagneticControls() {
    if (!finePointer.matches || reduceMotion.matches) return;
    const selector = 'a.index-link, .theme-toggle, .hero-3d-controls button, .future-scene-fullscreen, .showcase-3d-pause';
    document.addEventListener('pointermove', (event) => {
      const target = event.target.closest?.(selector);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      target.style.transform = `translate(${x * 6}px, ${y * 5}px)`;
    }, { passive: true });
    document.addEventListener('pointerout', (event) => {
      const target = event.target.closest?.(selector);
      if (target && !target.contains(event.relatedTarget)) target.style.transform = '';
    });
  }

  function setupProgressRail() {
    const sections = Array.from(document.querySelectorAll('main > section[id]'));
    if (!sections.length) return;

    sections.forEach((section, index) => {
      section.dataset.futureIndex = String(index + 1).padStart(2, '0');
    });

    const rail = document.createElement('nav');
    rail.className = 'future-site-progress';
    rail.setAttribute('aria-label', 'Page sections');
    rail.innerHTML = sections.map((section, index) => {
      const heading = section.querySelector('h1,h2,h3')?.textContent?.trim() || section.id;
      return `<button type="button" aria-label="${heading.replace(/"/g, '&quot;')}" data-future-section="${section.id}"${index === 0 ? ' class="is-active"' : ''}></button>`;
    }).join('');
    document.body.appendChild(rail);

    rail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-future-section]');
      if (!button) return;
      document.getElementById(button.dataset.futureSection)?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      rail.querySelectorAll('button').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.futureSection === visible.target.id);
      });
    }, { rootMargin: '-30% 0px -48% 0px', threshold: [0, .15, .4, .7] });

    sections.forEach((section) => observer.observe(section));
  }

  function setupScrollEffects() {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? scrollY / max : 0;
      masthead?.style.setProperty('--future-scroll', String(progress));

      if (hero) {
        const rect = hero.getBoundingClientRect();
        const heroProgress = Math.max(0, Math.min(1, -rect.top / Math.max(1, hero.offsetHeight)));
        const x = `${heroProgress * -18}px`;
        const y = `${heroProgress * 30}px`;
        hero.style.setProperty('--hero-parallax-x', x);
        hero.style.setProperty('--hero-parallax-y', y);
      }
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  function setupShowcaseEnhancements() {
    const sticky = document.querySelector('.showcase-sticky');
    if (!sticky) return;

    if (!sticky.querySelector('.future-scene-fullscreen')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'future-scene-fullscreen';
      button.textContent = 'Fullscreen scene';
      button.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
          } else {
            await sticky.requestFullscreen();
          }
        } catch {
          showToast('Fullscreen is not available in this browser.');
        }
      });
      sticky.appendChild(button);

      document.addEventListener('fullscreenchange', () => {
        button.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen scene';
      });
    }

    const rail = sticky.querySelector('.showcase-stage-rail');
    if (!rail) {
      const observer = new MutationObserver(() => setupShowcaseEnhancements());
      observer.observe(sticky, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 12000);
      return;
    }

    let previousStage = rail.querySelector('.is-active')?.textContent || '';
    const observer = new MutationObserver(() => {
      const current = rail.querySelector('.is-active')?.textContent || '';
      if (!current || current === previousStage) return;
      previousStage = current;
      sticky.classList.remove('stage-flash');
      void sticky.offsetWidth;
      sticky.classList.add('stage-flash');
      setTimeout(() => sticky.classList.remove('stage-flash'), 760);
    });
    observer.observe(rail, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }

  function setupKeyboard() {
    document.addEventListener('keydown', (event) => {
      const typing = event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName));
      if (typing || event.altKey || event.metaKey || event.ctrlKey) return;
      if (event.key.toLowerCase() === 'h') {
        event.preventDefault();
        hero?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
      if (event.key.toLowerCase() === 'f') {
        const button = document.querySelector('.future-scene-fullscreen');
        if (button) {
          event.preventDefault();
          button.click();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('futurescape');
    injectFonts();
    setupHero3D();
    setupCursor();
    setupSpotlights();
    setupMagneticControls();
    setupProgressRail();
    setupScrollEffects();
    setupShowcaseEnhancements();
    setupKeyboard();
  });
})();
