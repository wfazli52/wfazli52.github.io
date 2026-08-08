(() => {
  'use strict';
  if (window.__AF_CINEMATIC_REEL__) return;
  window.__AF_CINEMATIC_REEL__ = true;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [
    { cls:'scene-rack', eyebrow:'OPENING / DATA CENTER', title:'ENTER THE RACK.', body:'A cinematic summary of Abdul Fazli’s infrastructure portfolio — hardware, networking, Linux, operations and the path into cloud systems.' },
    { cls:'scene-network', eyebrow:'SYSTEMS / TOPOLOGY', title:'EVERYTHING CONNECTS.', body:'DCIM, network, compute, storage and Linux are presented as one operational system instead of isolated skills.' },
    { cls:'scene-ops', eyebrow:'OPERATIONS / METHOD', title:'OBSERVE. DIAGNOSE. RECOVER. VALIDATE.', body:'The portfolio is built around evidence-first troubleshooting, rollback discipline and proof before claims.' },
    { cls:'scene-roadmap', eyebrow:'ROADMAP / NEXT', title:'BUILD THE NEXT LAYER.', body:'Cybersecurity foundation, planned network-engineering degree, certification roadmap and ready-to-build cloud/automation project packs.' },
    { cls:'scene-finale', eyebrow:'ABDUL FAZLI / INFRASTRUCTURE', title:'BUILD. TEST. PROVE.', body:'Original cinematic portfolio · Data center · Networking · Linux · Hardware · Infrastructure operations.' }
  ];

  let reel, stage, progress, paused = false, director = false, current = 0, timer = 0;
  const normalDuration = 5200;
  const directorDuration = 2700;

  function sceneVisual(index) {
    if (index === 0) return '<div class="cinematic-rack" aria-hidden="true"></div><div class="cinematic-aisle" aria-hidden="true"><i></i><i></i><i></i></div>';
    if (index === 1) return `<div class="cinematic-grid" aria-hidden="true"></div><div class="cinematic-topology" aria-hidden="true"><svg viewBox="0 0 1000 520"><path d="M145 90 C310 90 330 250 500 250"/><path d="M855 90 C690 90 670 250 500 250"/><path d="M250 440 C330 350 390 280 500 250"/><path d="M750 440 C670 350 610 280 500 250"/></svg><div class="node">DCIM / IPAM</div><div class="node">NETWORK</div><div class="node">LINUX / OPS</div><div class="node">STORAGE</div><div class="node">CORE SYSTEM</div></div>`;
    if (index === 2) return '<div class="cinematic-grid" aria-hidden="true"></div><div class="cinematic-ops-board" aria-hidden="true"><article><small>BASELINE</small><b>OBSERVE</b><i></i></article><article><small>EVIDENCE</small><b>DIAGNOSE</b><i></i></article><article><small>CONTROL</small><b>RECOVER</b><i></i></article><article><small>PROOF</small><b>VALIDATE</b><i></i></article></div>';
    if (index === 3) return '<div class="cinematic-grid" aria-hidden="true"></div><div class="cinematic-roadmap" aria-hidden="true"><article><span>NOW</span><b>Cybersecurity</b><small>Northern Virginia Community College</small></article><article><span>NEXT</span><b>Network Engineering</b><small>WGU · Cisco track · planned</small></article><article><span>BUILD</span><b>Cloud + Automation</b><small>Kubernetes · AWS · Azure · PowerShell</small></article><article><span>PROVE</span><b>Evidence</b><small>Configs · screenshots · validation output</small></article></div>';
    return '<div class="cinematic-grid" aria-hidden="true"></div>';
  }

  function markup() {
    return `<section class="cinematic-reel" aria-label="Cinematic portfolio summary">
      <div class="cinematic-reel-stage"></div>
      <div class="cinematic-flare" aria-hidden="true"></div>
      <div class="cinematic-embers" aria-hidden="true">${Array.from({length:36},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${3.4+(i%8)*.44}s;--delay:-${(i%11)*.38}s;--drift:${-70+(i%9)*18}px"></i>`).join('')}</div>
      <button class="cinematic-director-exit" type="button">EXIT DIRECTOR CUT · ESC</button>
      <div class="cinematic-hud">
        <div class="cinematic-progress" aria-label="Cinematic scenes"></div>
        <button class="cinematic-toggle" type="button">PAUSE</button>
        <button class="cinematic-director" type="button">DIRECTOR CUT</button>
      </div>
    </section>`;
  }

  function build() {
    if (document.querySelector('.cinematic-reel')) return;
    const hero = document.querySelector('.hero');
    if (!hero || !hero.parentElement) return requestAnimationFrame(build);
    hero.insertAdjacentHTML('beforebegin', markup());
    reel = document.querySelector('.cinematic-reel');
    stage = reel.querySelector('.cinematic-reel-stage');
    progress = reel.querySelector('.cinematic-progress');

    stage.innerHTML = scenes.map((s,i)=>`<article class="cinematic-scene ${s.cls}${i===0?' is-active':''}" data-scene="${i}"><div class="cinematic-bg"></div>${sceneVisual(i)}<div class="cinematic-copy"><div class="eyebrow">${s.eyebrow}</div><h2>${s.title}</h2><p>${s.body}</p></div></article>`).join('');
    progress.innerHTML = scenes.map((_,i)=>`<button type="button" aria-label="Show scene ${i+1}" data-scene-jump="${i}"${i===0?' class="is-active"':''}></button>`).join('');
    reel.style.setProperty('--scene-duration', `${normalDuration}ms`);

    progress.addEventListener('click', (e)=>{ const b=e.target.closest('[data-scene-jump]'); if(!b)return; show(Number(b.dataset.sceneJump), true); });
    reel.querySelector('.cinematic-toggle').addEventListener('click', togglePause);
    reel.querySelector('.cinematic-director').addEventListener('click', enterDirector);
    reel.querySelector('.cinematic-director-exit').addEventListener('click', exitDirector);
    reel.addEventListener('dblclick', enterDirector);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'&&director) exitDirector(); if(!director)return; if(e.key==='ArrowRight') show((current+1)%scenes.length,true); if(e.key==='ArrowLeft') show((current-1+scenes.length)%scenes.length,true); });
    document.addEventListener('visibilitychange', ()=>{ if(document.hidden){clearTimeout(timer);} else if(!paused) schedule(); });
    if (!reduce.matches) schedule(); else paused = true;
  }

  function duration(){ return director ? directorDuration : normalDuration; }
  function schedule(){ clearTimeout(timer); if(paused || reduce.matches) return; timer=setTimeout(()=>show((current+1)%scenes.length),duration()); }

  function show(index, manual=false){
    if (!reel) return;
    current = ((index % scenes.length)+scenes.length)%scenes.length;
    reel.classList.remove('is-cutting'); void reel.offsetWidth; reel.classList.add('is-cutting');
    reel.querySelectorAll('.cinematic-scene').forEach((el,i)=>el.classList.toggle('is-active',i===current));
    progress.querySelectorAll('button').forEach((b,i)=>{ b.classList.toggle('is-active',i===current); b.style.animation='none'; void b.offsetWidth; b.style.animation=''; });
    reel.style.setProperty('--scene-duration', `${duration()}ms`);
    if(manual) paused=false;
    schedule();
  }

  function togglePause(){
    paused=!paused;
    const b=reel.querySelector('.cinematic-toggle');
    b.textContent=paused?'PLAY':'PAUSE';
    if(paused) clearTimeout(timer); else schedule();
  }

  function enterDirector(){
    if(director || !reel) return;
    director=true; paused=false;
    reel.classList.add('is-director');
    document.documentElement.style.overflow='hidden';
    document.body.style.overflow='hidden';
    reel.style.setProperty('--scene-duration', `${directorDuration}ms`);
    window.dispatchEvent(new CustomEvent('future:hero-pause',{detail:{paused:true}}));
    show(current,true);
  }

  function exitDirector(){
    if(!director || !reel) return;
    director=false;
    reel.classList.remove('is-director');
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    reel.style.setProperty('--scene-duration', `${normalDuration}ms`);
    window.dispatchEvent(new CustomEvent('future:hero-pause',{detail:{paused:false}}));
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once:true }); else build();
})();
