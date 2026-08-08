(() => {
  'use strict';
  if (window.__AF_ACTIVE_FOCUS_EFFECTS__) return;
  window.__AF_ACTIVE_FOCUS_EFFECTS__ = true;

  const html = document.documentElement;
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let mode = 'original';
  let width = innerWidth;
  let height = innerHeight;
  let dpr = 1;
  let pointerX = width * .5;
  let pointerY = height * .35;
  let targetX = pointerX;
  let targetY = pointerY;
  let particles = [];
  let last = 0;
  let running = false;

  const colorSets = {
    google: ['#4285f4','#ea4335','#fbbc05','#34a853'],
    amazon: ['#ff9900','#0972d3','#1d8102','#8a2be2'],
    microsoft: ['#0078d4','#00bcf2','#7f58af','#107c10']
  };

  const rand = (min, max) => min + Math.random() * (max - min);
  const rgba = (hex, alpha) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  };

  function ensureCanvas() {
    const app = document.querySelector('.focus-v60-app');
    if (!app) return false;
    if (!canvas || !canvas.isConnected) {
      canvas = document.createElement('canvas');
      canvas.className = 'focus-active-effects';
      canvas.setAttribute('aria-hidden', 'true');
      app.prepend(canvas);
      ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    }
    resize();
    return Boolean(ctx);
  }

  function resize() {
    if (!canvas || !ctx) return;
    width = innerWidth;
    height = innerHeight;
    const memory = Number(navigator.deviceMemory || 8);
    const cores = Number(navigator.hardwareConcurrency || 8);
    const cap = width < 760 || memory <= 4 || cores <= 4 ? 1 : 1.35;
    dpr = Math.min(devicePixelRatio || 1, cap);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    particles = [];
    if (!colorSets[mode]) return;
    const base = width < 760 ? 24 : 52;
    const count = mode === 'amazon' ? Math.floor(base * .65) : base;
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: rand(0, width), y: rand(0, height),
        vx: rand(-.055, .055), vy: rand(-.045, .045),
        size: rand(1.2, mode === 'google' ? 4.6 : 3.2),
        phase: rand(0, Math.PI * 2),
        color: colorSets[mode][i % colorSets[mode].length]
      });
    }
  }

  function google(time, dt) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    colorSets.google.forEach((color, index) => {
      const phase = time * .00014 + index * 1.55;
      const x = width * (.5 + Math.cos(phase * (index % 2 ? -.7 : .65)) * .47) + (pointerX / width - .5) * 55;
      const y = height * (.46 + Math.sin(phase * .83) * .38) + (pointerY / height - .5) * 38;
      const radius = Math.max(width, height) * (.18 + index * .018);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, rgba(color, .19));
      gradient.addColorStop(.34, rgba(color, .07));
      gradient.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });
    particles.forEach((p, index) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt + Math.sin(time * .0013 + p.phase) * .008 * dt;
      if (p.x < -12) p.x = width + 12;
      if (p.x > width + 12) p.x = -12;
      if (p.y < -12) p.y = height + 12;
      if (p.y > height + 12) p.y = -12;
      const pulse = .6 + .4 * Math.sin(time * .0018 + p.phase);
      ctx.fillStyle = rgba(p.color, .22 + pulse * .24);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + pulse * .25), 0, Math.PI * 2); ctx.fill();
      if (index % 5 === 0) {
        const distance = Math.hypot(pointerX - p.x, pointerY - p.y);
        if (distance < 210) {
          ctx.strokeStyle = rgba(p.color, (1 - distance / 210) * .16);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo((p.x + pointerX) / 2 + 18, (p.y + pointerY) / 2 - 18, pointerX, pointerY); ctx.stroke();
        }
      }
    });
    ctx.restore();
  }

  function amazon(time) {
    ctx.save();
    const grid = width < 760 ? 58 : 78;
    const offsetX = (time * .012) % grid;
    const offsetY = (time * .009) % grid;
    ctx.lineWidth = 1;
    for (let x = -grid + offsetX; x < width + grid; x += grid) {
      ctx.strokeStyle = 'rgba(9,114,211,.035)';
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = -grid + offsetY; y < height + grid; y += grid) {
      ctx.strokeStyle = 'rgba(255,153,0,.028)';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const lanes = width < 760 ? 4 : 7;
    for (let i = 0; i < lanes; i += 1) {
      const y = height * (.18 + i * .105);
      const progress = (time * (.018 + i * .002) + i * 220) % (width + 260) - 130;
      const color = i % 3 === 0 ? '#ff9900' : '#0972d3';
      const gradient = ctx.createLinearGradient(progress - 140, y, progress + 30, y);
      gradient.addColorStop(0, rgba(color, 0));
      gradient.addColorStop(.7, rgba(color, .18));
      gradient.addColorStop(1, rgba(color, .42));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(progress - 140, y); ctx.lineTo(progress + 30, y); ctx.stroke();
      ctx.fillStyle = rgba(color, .55); ctx.fillRect(progress + 27, y - 1.5, 4, 4);
    }

    const pulseX = pointerX;
    const pulseY = pointerY;
    for (let i = 0; i < 3; i += 1) {
      const phase = (time * .00024 + i * .33) % 1;
      ctx.strokeStyle = `rgba(255,153,0,${(1 - phase) * .055})`;
      ctx.beginPath(); ctx.arc(pulseX, pulseY, 28 + phase * 120, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function microsoft(time) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const horizon = height * .41;
    const vanishingX = width * .52 + (pointerX / width - .5) * 70;
    for (let i = -14; i <= 14; i += 1) {
      const x = width * .5 + i * width * .08;
      ctx.strokeStyle = 'rgba(0,188,242,.045)';
      ctx.beginPath(); ctx.moveTo(vanishingX, horizon); ctx.lineTo(x, height + 40); ctx.stroke();
    }
    const travel = (time * .00007) % 1;
    for (let i = 0; i < 14; i += 1) {
      const p = (i / 14 + travel) % 1;
      const eased = p * p;
      const y = horizon + eased * (height - horizon + 60);
      ctx.strokeStyle = `rgba(0,120,212,${.016 + eased * .075})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    colorSets.microsoft.forEach((color, index) => {
      const x = width * (.2 + index * .2) + Math.sin(time * .00025 + index) * 80;
      const y = height * (.24 + (index % 2) * .42) + Math.cos(time * .00021 + index) * 55;
      const radius = Math.max(width, height) * .15;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, rgba(color, .11)); gradient.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    });
    particles.forEach((p) => {
      const pulse = .5 + .5 * Math.sin(time * .0014 + p.phase);
      ctx.strokeStyle = rgba(p.color, .06 + pulse * .08);
      const size = 8 + p.size * 4;
      ctx.strokeRect(p.x + Math.sin(time * .0003 + p.phase) * 12, p.y + Math.cos(time * .00028 + p.phase) * 9, size, size);
    });
    ctx.restore();
  }

  function frame(time) {
    if (!running || document.hidden || reduce.matches || mode === 'original') {
      raf = 0;
      return;
    }
    const dt = Math.min(33, time - last || 16);
    last = time;
    pointerX += (targetX - pointerX) * .06;
    pointerY += (targetY - pointerY) * .06;
    ctx.clearRect(0, 0, width, height);
    if (mode === 'google') google(time, dt);
    else if (mode === 'amazon') amazon(time);
    else if (mode === 'microsoft') microsoft(time);
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (ctx) ctx.clearRect(0, 0, width, height);
  }

  function start(name) {
    stop();
    mode = ['google','amazon','microsoft'].includes(name) ? name : 'original';
    if (mode === 'original' || reduce.matches || !ensureCanvas()) return;
    canvas.dataset.mode = mode;
    seed();
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('google-focus:start', () => start('google'));
  window.addEventListener('amazon-focus:start', () => start('amazon'));
  window.addEventListener('microsoft-focus:start', () => start('microsoft'));
  window.addEventListener('google-focus:stop', stop);
  window.addEventListener('amazon-focus:stop', stop);
  window.addEventListener('microsoft-focus:stop', stop);
  window.addEventListener('future:focus-theme', (event) => start(event.detail?.name || html.dataset.focus || 'original'));
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', (event) => { targetX = event.clientX; targetY = event.clientY; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start(html.dataset.focus || 'original');
  });

  start(html.dataset.focus || 'original');
})();