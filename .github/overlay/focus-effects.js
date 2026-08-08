(() => {
  'use strict';
  if (window.__AF_FOCUS_EFFECTS_V9__) return;
  window.__AF_FOCUS_EFFECTS_V9__ = true;

  const html = document.documentElement;
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  const canvas = document.createElement('canvas');
  canvas.className = 'focus-world-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  body.prepend(canvas);

  const domWorld = document.createElement('div');
  domWorld.className = 'focus-world-dom';
  domWorld.setAttribute('aria-hidden', 'true');
  body.prepend(domWorld);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let w = 1, h = 1, dpr = 1, raf = 0;
  let mode = html.dataset.focus || 'original';
  let pointerX = innerWidth * .68, pointerY = innerHeight * .28;
  let targetX = pointerX, targetY = pointerY;
  let scrollY = window.scrollY || 0;
  let particles = [], packets = [], tiles = [];
  let last = performance.now();

  const colors = {
    google: ['#4285f4', '#ea4335', '#fbbc05', '#34a853'],
    amazon: ['#ff9900', '#00a8e1', '#ffb84d', '#58c77b'],
    microsoft: ['#0078d4', '#00bcf2', '#7f58af', '#107c10']
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  function resize() {
    w = innerWidth; h = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, w < 760 ? 1.25 : 1.6);
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed(mode);
  }

  function addDom(className, count, builder) {
    for (let i = 0; i < count; i += 1) {
      const el = document.createElement('span');
      el.className = className;
      el.style.setProperty('--i', i);
      el.style.setProperty('--rx', rand(-1, 1).toFixed(3));
      el.style.setProperty('--ry', rand(-1, 1).toFixed(3));
      el.style.setProperty('--delay', `${rand(-12, 0).toFixed(2)}s`);
      el.innerHTML = builder ? builder(i) : '';
      domWorld.appendChild(el);
    }
  }

  function seed(next) {
    mode = next || 'original';
    particles = []; packets = []; tiles = [];
    domWorld.replaceChildren();
    domWorld.dataset.world = mode;
    body.dataset.focusWorld = mode;
    body.classList.toggle('focus-world-active', mode !== 'original');

    if (mode === 'google') {
      for (let i = 0; i < (fine.matches ? 44 : 26); i += 1) {
        particles.push({ x: rand(0,w), y: rand(0,h), vx:rand(-.06,.06), vy:rand(-.05,.05), r:rand(1.5,5.5), c:colors.google[i%4], p:rand(0,6.28) });
      }
      addDom('google-float-card', 6, i => `<i></i><b>${['SEARCH','MAP','LAB','TRACE','BUILD','VERIFY'][i]}</b><em>0${i+1}</em>`);
      addDom('google-color-orbit', 4, i => `<i style="--c:${colors.google[i]}"></i>`);
    }

    if (mode === 'amazon') {
      for (let i = 0; i < (fine.matches ? 24 : 14); i += 1) {
        packets.push({ x:rand(-240,w), y:rand(20,h-20), speed:rand(45,135), len:rand(55,200), c:i%4===0?'#00a8e1':'#ff9900', a:rand(.16,.54), lane:i });
      }
      addDom('amazon-rack-tower', 5, i => `<b>R${String(i+1).padStart(2,'0')}</b><i></i><i></i><i></i><em>ONLINE</em>`);
      addDom('amazon-telemetry-chip', 6, i => `<b>${['PWR','NET','TEMP','FAN','IOPS','BMC'][i]}</b><i></i>`);
    }

    if (mode === 'microsoft') {
      const cols = w < 760 ? 7 : 13, rows = h < 700 ? 7 : 10;
      for (let yy=0; yy<rows; yy++) for (let xx=0; xx<cols; xx++) {
        if (Math.random() < .5) tiles.push({x:(xx+.5)/cols*w,y:(yy+.5)/rows*h,s:rand(8,30),p:rand(0,6.28),c:colors.microsoft[(xx+yy)%4]});
      }
      addDom('ms-floating-window', 8, i => `<span><i></i><i></i><i></i><i></i></span><b>${['CORE','EDGE','CLOUD','NET','OPS','LINUX','DCIM','LAB'][i]}</b>`);
      addDom('ms-data-lane', 4);
    }
  }

  function google(t, dt) {
    ctx.save(); ctx.globalCompositeOperation='screen';
    colors.google.forEach((c,i)=>{
      const a=t*.000075*(i%2?-1:1)+i*1.57;
      const x=w*(.5+Math.cos(a)*.40)+(pointerX/w-.5)*35*(i+1)*.12;
      const y=h*(.48+Math.sin(a*1.25)*.36)+(pointerY/h-.5)*24*(4-i)*.12;
      const r=Math.max(w,h)*(.20+.025*Math.sin(t*.001+i));
      const g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,rgba(c,.12)); g.addColorStop(.45,rgba(c,.038)); g.addColorStop(1,rgba(c,0));
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    });
    particles.forEach((p,i)=>{
      p.x+=p.vx*dt; p.y+=p.vy*dt+Math.sin(t*.001+p.p)*.008*dt;
      if(p.x<-20)p.x=w+20;if(p.x>w+20)p.x=-20;if(p.y<-20)p.y=h+20;if(p.y>h+20)p.y=-20;
      const b=.55+.45*Math.sin(t*.0014+p.p);
      ctx.fillStyle=rgba(p.c,.22+b*.22); ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(1+b*.35),0,6.283);ctx.fill();
      if(i%4===0){const dx=pointerX-p.x,dy=pointerY-p.y,d=Math.hypot(dx,dy);if(d<240){ctx.strokeStyle=rgba(p.c,(1-d/240)*.11);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo((p.x+pointerX)/2+Math.sin(t*.001+i)*24,(p.y+pointerY)/2,pointerX,pointerY);ctx.stroke();}}
    });
    ctx.restore();
  }

  function amazon(t, dt) {
    ctx.save();
    const grid=w<760?44:66, ox=(scrollY*.05+t*.012)%grid, oy=(t*.017)%grid;
    ctx.lineWidth=1;
    for(let x=-grid+ox;x<w+grid;x+=grid){ctx.strokeStyle='rgba(0,168,225,.04)';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=-grid+oy;y<h+grid;y+=grid){ctx.strokeStyle='rgba(255,153,0,.038)';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    const scan=(t*.055+scrollY*.18)%(h+220)-110;
    const sg=ctx.createLinearGradient(0,scan-80,0,scan+80);sg.addColorStop(0,'rgba(255,153,0,0)');sg.addColorStop(.5,'rgba(255,153,0,.085)');sg.addColorStop(1,'rgba(255,153,0,0)');ctx.fillStyle=sg;ctx.fillRect(0,scan-80,w,160);
    packets.forEach(p=>{p.x+=p.speed*dt/1000;if(p.x>w+p.len+120)p.x=-p.len-rand(20,260);const y=p.y+Math.sin(t*.0011+p.lane)*8;const g=ctx.createLinearGradient(p.x,y,p.x+p.len,y);g.addColorStop(0,rgba(p.c,0));g.addColorStop(.6,rgba(p.c,p.a*.45));g.addColorStop(1,rgba(p.c,p.a));ctx.strokeStyle=g;ctx.lineWidth=p.lane%6===0?2:1;ctx.beginPath();ctx.moveTo(p.x,y);ctx.lineTo(p.x+p.len,y);ctx.stroke();ctx.fillStyle=rgba(p.c,p.a+.12);ctx.fillRect(p.x+p.len-2,y-1,3,3);});
    const px=pointerX,py=pointerY;for(let i=0;i<3;i++){const phase=(t*.00032+i*.31)%1;ctx.strokeStyle=`rgba(255,153,0,${(1-phase)*.055})`;ctx.beginPath();ctx.arc(px,py,30+phase*170,0,6.283);ctx.stroke();}
    ctx.restore();
  }

  function microsoft(t) {
    ctx.save();
    const vanX=w*.52+(pointerX/w-.5)*46,horizon=h*.44;
    for(let i=-13;i<=13;i++){const x=w*.5+i*w*.082;ctx.strokeStyle='rgba(0,188,242,.045)';ctx.beginPath();ctx.moveTo(vanX,horizon);ctx.lineTo(x,h+60);ctx.stroke();}
    const travel=(t*.00006+scrollY*.00008)%1;
    for(let i=0;i<13;i++){const p=(i/13+travel)%1,e=p*p,y=horizon+e*(h-horizon+55);ctx.strokeStyle=`rgba(0,120,212,${.014+e*.072})`;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.globalCompositeOperation='screen';
    tiles.forEach(tile=>{const q=.5+.5*Math.sin(t*.001+tile.p+scrollY*.001);const dx=Math.sin(t*.0002+tile.p)*13,dy=Math.cos(t*.00024+tile.p)*10,s=tile.s*(1+q*.24);ctx.fillStyle=rgba(tile.c,.015+q*.036);ctx.strokeStyle=rgba(tile.c,.065+q*.055);ctx.fillRect(tile.x+dx-s/2,tile.y+dy-s/2,s,s);ctx.strokeRect(tile.x+dx-s/2,tile.y+dy-s/2,s,s);});
    const bx=(t*.035)%(w+500)-250;const bg=ctx.createLinearGradient(bx-170,0,bx+170,0);bg.addColorStop(0,'rgba(0,188,242,0)');bg.addColorStop(.5,'rgba(0,188,242,.055)');bg.addColorStop(1,'rgba(0,188,242,0)');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.restore();
  }

  function frame(t) {
    const dt=Math.min(34,t-last||16);last=t;
    pointerX+=(targetX-pointerX)*.065;pointerY+=(targetY-pointerY)*.065;
    ctx.clearRect(0,0,w,h);
    if(!reduce.matches){if(mode==='google')google(t,dt);else if(mode==='amazon')amazon(t,dt);else if(mode==='microsoft')microsoft(t);}
    raf=requestAnimationFrame(frame);
  }

  function switchMode(next) {
    body.classList.add('focus-world-switching');
    seed(next);
    clearTimeout(switchMode.timer);
    switchMode.timer=setTimeout(()=>body.classList.remove('focus-world-switching'),700);
  }

  window.addEventListener('future:focus-theme', e=>switchMode(e.detail?.name||html.dataset.focus||'original'));
  new MutationObserver(()=>{const next=html.dataset.focus||'original';if(next!==mode)switchMode(next);}).observe(html,{attributes:true,attributeFilter:['data-focus']});
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',()=>{scrollY=window.scrollY||0;},{passive:true});
  addEventListener('pointermove',e=>{targetX=e.clientX;targetY=e.clientY;},{passive:true});
  addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});

  resize(); seed(mode); raf=requestAnimationFrame(frame);
})();