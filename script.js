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

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('is-open', !expanded);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        button.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
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

  document.addEventListener('DOMContentLoaded', () => {
    setProfileContent();
    setYear();
    setupNavigation();
    setupCopyEmail();
    setupReveal();
    setupPrint();
  });
})();
