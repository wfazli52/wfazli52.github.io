(() => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let effectsPaused = motionQuery.matches;

  function applyEffectsState() {
    document.body.classList.toggle('fx-paused', effectsPaused);

    const button = document.querySelector('[data-fx-toggle]');
    const label = document.querySelector('[data-fx-label]');
    if (button) {
      button.setAttribute('aria-pressed', String(effectsPaused));
      button.title = effectsPaused ? 'Resume visual effects' : 'Pause visual effects';
    }
    if (label) label.textContent = effectsPaused ? 'Resume FX' : 'Pause FX';

    window.dispatchEvent(new CustomEvent('portfolio:fxchange', {
      detail: { paused: effectsPaused }
    }));
  }

  function setupEffectsToggle() {
    const button = document.querySelector('[data-fx-toggle]');
    button?.addEventListener('click', () => {
      effectsPaused = !effectsPaused;
      applyEffectsState();
    });

    motionQuery.addEventListener?.('change', (event) => {
      if (!event.matches) return;
      effectsPaused = true;
      applyEffectsState();
    });

    applyEffectsState();
  }

  function setupScrollProgress() {
    const bar = document.querySelector('[data-scroll-progress]');
    if (!bar) return;

    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function setupTerminal() {
    const output = document.querySelector('[data-terminal-text]');
    if (!output) return;

    const commands = [
      'boot portfolio --mode=proof-first',
      'load blueprints --count=4',
      'mount evidence-templates --count=6',
      'next-lab enterprise-vlan-routing',
      'status --site=live --projects=planned'
    ];

    let commandIndex = 0;
    let characterIndex = commands[0].length;
    let deleting = false;
    let timer = 0;

    const schedule = (delay) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, delay);
    };

    const tick = () => {
      if (effectsPaused) {
        output.textContent = commands[0];
        return;
      }

      const command = commands[commandIndex];
      output.textContent = command.slice(0, characterIndex);

      if (!deleting && characterIndex < command.length) {
        characterIndex += 1;
        schedule(34 + Math.random() * 34);
        return;
      }
      if (!deleting) {
        deleting = true;
        schedule(1450);
        return;
      }
      if (characterIndex > 0) {
        characterIndex -= 1;
        schedule(18);
        return;
      }

      deleting = false;
      commandIndex = (commandIndex + 1) % commands.length;
      schedule(280);
    };

    const restart = () => {
      window.clearTimeout(timer);
      if (effectsPaused) output.textContent = commands[0];
      else schedule(150);
    };

    window.addEventListener('portfolio:fxchange', restart);
    restart();
  }

  function setupCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animate = (element) => {
      if (element.dataset.counted === 'true') return;
      element.dataset.counted = 'true';
      const target = Number.parseInt(element.dataset.target || '0', 10);
      if (!Number.isFinite(target) || effectsPaused || motionQuery.matches) {
        element.textContent = String(target || 0);
        return;
      }

      const start = performance.now();
      const duration = 950;
      const frame = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(frame);
      };
      window.requestAnimationFrame(frame);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.55 });

    counters.forEach((counter) => observer.observe(counter));
  }

  function setupTiltAndSpotlight() {
    const items = document.querySelectorAll('[data-tilt]');
    if (!items.length) return;
    const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    items.forEach((item) => {
      item.addEventListener('pointermove', (event) => {
        const rect = item.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        item.style.setProperty('--spot-x', `${x}px`);
        item.style.setProperty('--spot-y', `${y}px`);

        if (!canTilt || effectsPaused) return;
        const rotateY = ((x / rect.width) - 0.5) * 5.5;
        const rotateX = (0.5 - (y / rect.height)) * 5.5;
        item.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });

      item.addEventListener('pointerleave', () => {
        item.style.transform = '';
        item.style.removeProperty('--spot-x');
        item.style.removeProperty('--spot-y');
      });
    });

    window.addEventListener('portfolio:fxchange', () => {
      if (!effectsPaused) return;
      items.forEach((item) => { item.style.transform = ''; });
    });
  }

  function setupNetworkCanvas() {
    const canvas = document.querySelector('[data-network-canvas]');
    const hero = canvas?.closest('.hero');
    if (!canvas || !hero || !canvas.getContext) return;

    const context = canvas.getContext('2d');
    const nodes = [
      { x: 0.04, y: 0.23, r: 2.4 }, { x: 0.17, y: 0.12, r: 3.2 },
      { x: 0.28, y: 0.34, r: 2.7 }, { x: 0.43, y: 0.16, r: 2.3 },
      { x: 0.55, y: 0.42, r: 3.4 }, { x: 0.68, y: 0.2, r: 2.6 },
      { x: 0.8, y: 0.36, r: 3.1 }, { x: 0.94, y: 0.17, r: 2.4 },
      { x: 0.1, y: 0.62, r: 2.7 }, { x: 0.25, y: 0.77, r: 3.1 },
      { x: 0.42, y: 0.63, r: 2.4 }, { x: 0.61, y: 0.79, r: 3.3 },
      { x: 0.77, y: 0.61, r: 2.5 }, { x: 0.92, y: 0.75, r: 2.9 }
    ];
    const edges = [
      [0, 1], [0, 8], [1, 2], [1, 3], [2, 4], [2, 9], [3, 4], [3, 5],
      [4, 6], [4, 10], [4, 11], [5, 6], [5, 7], [6, 7], [6, 12], [8, 9],
      [9, 10], [10, 11], [11, 12], [11, 13], [12, 13]
    ];

    let width = 0;
    let height = 0;
    let frameId = 0;

    const point = (node) => ({ x: node.x * width, y: node.y * height });

    const draw = (time) => {
      context.clearRect(0, 0, width, height);

      edges.forEach(([fromIndex, toIndex], edgeIndex) => {
        const from = point(nodes[fromIndex]);
        const to = point(nodes[toIndex]);
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.strokeStyle = edgeIndex % 4 === 0
          ? 'rgba(128, 240, 192, 0.11)'
          : 'rgba(99, 211, 255, 0.095)';
        context.lineWidth = 1;
        context.stroke();

        if (!effectsPaused) {
          const speed = 0.000045 + (edgeIndex % 5) * 0.000006;
          const progress = (time * speed + edgeIndex * 0.137) % 1;
          const x = from.x + (to.x - from.x) * progress;
          const y = from.y + (to.y - from.y) * progress;
          context.beginPath();
          context.arc(x, y, 1.7, 0, Math.PI * 2);
          context.fillStyle = edgeIndex % 3 === 0
            ? 'rgba(128, 240, 192, 0.9)'
            : 'rgba(99, 211, 255, 0.9)';
          context.shadowBlur = 12;
          context.shadowColor = context.fillStyle;
          context.fill();
          context.shadowBlur = 0;
        }
      });

      nodes.forEach((node, index) => {
        const position = point(node);
        const pulse = effectsPaused ? 0 : Math.sin(time * 0.002 + index) * 0.55;
        context.beginPath();
        context.arc(position.x, position.y, node.r + pulse, 0, Math.PI * 2);
        context.fillStyle = index % 3 === 0
          ? 'rgba(128, 240, 192, 0.78)'
          : 'rgba(99, 211, 255, 0.74)';
        context.shadowBlur = 14;
        context.shadowColor = context.fillStyle;
        context.fill();
        context.shadowBlur = 0;
      });
    };

    const animate = (time) => {
      draw(time);
      frameId = window.requestAnimationFrame(animate);
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now());
    };

    const setAnimation = () => {
      window.cancelAnimationFrame(frameId);
      if (effectsPaused) draw(performance.now());
      else frameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('portfolio:fxchange', setAnimation);
    resize();
    setAnimation();
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupEffectsToggle();
    setupScrollProgress();
    setupTerminal();
    setupCounters();
    setupTiltAndSpotlight();
    setupNetworkCanvas();
  });
})();
