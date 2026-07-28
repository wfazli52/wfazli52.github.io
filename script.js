(() => {
  const profile = window.PORTFOLIO || {};

  function hideEmptyElement(element) {
    if (!element.hasAttribute('data-hide-empty')) return;
    element.hidden = true;
  }

  function setProfileContent() {
    document.querySelectorAll('[data-profile]').forEach((element) => {
      const key = element.dataset.profile;
      const value = profile[key];
      if (value) {
        element.textContent = value;
      } else {
        hideEmptyElement(element);
      }
    });

    document.querySelectorAll('[data-profile-href]').forEach((element) => {
      const key = element.dataset.profileHref;
      const value = profile[key];
      if (!value) {
        hideEmptyElement(element);
        return;
      }

      element.href = key === 'email' ? `mailto:${value}` : value;
      if (element.hasAttribute('data-use-profile-as-text')) {
        element.textContent = value;
      }
    });

    document.querySelectorAll('[data-resume-link]').forEach((link) => {
      link.href = profile.resumeFile || 'resume.html';
    });
  }

  function setYear() {
    document.querySelectorAll('[data-year]').forEach((element) => {
      element.textContent = new Date().getFullYear();
    });
  }

  function setupNavigation() {
    const button = document.querySelector('[data-menu-button]');
    const menu = document.querySelector('[data-menu]');
    if (!button || !menu) return;

    const closeMenu = () => {
      button.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('is-open', !expanded);
    });

    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });

    document.addEventListener('click', (event) => {
      if (!menu.classList.contains('is-open')) return;
      if (menu.contains(event.target) || button.contains(event.target)) return;
      closeMenu();
    });
  }

  function setupCopyEmail() {
    const button = document.querySelector('[data-copy-email]');
    if (!button) return;
    if (!profile.email) {
      hideEmptyElement(button);
      return;
    }

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(profile.email);
        const original = button.textContent;
        button.textContent = 'Email copied';
        setTimeout(() => { button.textContent = original; }, 1800);
      } catch {
        window.location.href = `mailto:${profile.email}`;
      }
    });
  }

  function setupReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach((item) => observer.observe(item));
  }

  function setupPrint() {
    const button = document.querySelector('[data-print]');
    if (button) button.addEventListener('click', () => window.print());
  }

  function setupPageTransitions() {
    const root = document.documentElement;
    root.classList.toggle('supports-view-transitions', 'startViewTransition' in document);

    const cards = Array.from(document.querySelectorAll('[data-project-transition], .project-card'));
    const markCard = (card) => {
      cards.forEach((item) => { item.style.viewTransitionName = ''; });
      card.style.viewTransitionName = 'project-hero';
      root.dataset.transitioning = 'project';
    };

    cards.forEach((card) => {
      card.addEventListener('pointerdown', () => markCard(card));
      card.addEventListener('click', () => markCard(card));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') markCard(card);
      });
    });

    window.addEventListener('pageshow', () => {
      cards.forEach((card) => { card.style.viewTransitionName = ''; });
      delete root.dataset.transitioning;
      root.classList.add('page-ready');
    });
  }

  function setupCinematicNavigationFallback() {
    const links = Array.from(document.querySelectorAll('.project-card[href]'));
    if (!links.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'page-transition-wipe';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
        const href = link.href;
        if (!href) return;
        event.preventDefault();
        link.classList.add('is-launching');
        document.body.classList.add('cinematic-leaving');
        overlay.classList.add('is-active');
        window.setTimeout(() => window.location.assign(href), reduceMotion.matches ? 0 : 460);
      });
    });

    window.addEventListener('pageshow', () => {
      document.body.classList.remove('cinematic-leaving');
      overlay.classList.remove('is-active');
      links.forEach((link) => link.classList.remove('is-launching'));
    });
  }

  function setupCommandCenterLoader() {
    if (!document.querySelector('#dashboard')) return;
    if (document.querySelector('script[data-command-center-loader]')) return;

    const script = document.createElement('script');
    script.src = 'command-center.js?v=3';
    script.dataset.commandCenterLoader = '';
    script.async = true;
    script.addEventListener('error', () => {
      console.error('The interactive command center could not be loaded.');
    });
    document.body.appendChild(script);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setProfileContent();
    setYear();
    setupNavigation();
    setupCopyEmail();
    setupReveal();
    setupPrint();
    setupPageTransitions();
    setupCinematicNavigationFallback();
    setupCommandCenterLoader();
  });
})();
