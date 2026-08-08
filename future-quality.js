(() => {
  'use strict';
  if (window.__FUTURE_QUALITY_V7__) return;
  window.__FUTURE_QUALITY_V7__ = true;

  let frames = 0;
  let started = performance.now();
  let lowSamples = 0;
  let highSamples = 0;
  let lowered = false;
  let raf = 0;

  function applyCap(cap) {
    window.__FUTURE_DPR_CAP__ = cap;
    lowered = Number.isFinite(cap);
    document.body.classList.toggle('adaptive-quality-low', lowered);
    window.dispatchEvent(new Event('resize'));
  }

  function sample(now) {
    frames += 1;
    const elapsed = now - started;
    if (elapsed >= 1500) {
      const fps = (frames * 1000) / elapsed;
      frames = 0;
      started = now;

      if (fps < 42) {
        lowSamples += 1;
        highSamples = 0;
      } else if (fps > 55) {
        highSamples += 1;
        lowSamples = 0;
      } else {
        lowSamples = 0;
        highSamples = 0;
      }

      if (!lowered && lowSamples >= 2) {
        applyCap(innerWidth < 760 ? 1.0 : 1.2);
        lowSamples = 0;
      } else if (lowered && highSamples >= 4 && !document.body.classList.contains('power-save')) {
        applyCap(Infinity);
        highSamples = 0;
      }
    }
    raf = requestAnimationFrame(sample);
  }

  raf = requestAnimationFrame(sample);
  addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();