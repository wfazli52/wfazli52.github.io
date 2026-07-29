import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const scrollHost = document.querySelector('[data-showcase-scroll]');
const sticky = scrollHost?.querySelector('.showcase-sticky');
const fallbackCanvas = sticky?.querySelector('[data-showcase-canvas]');

if (!scrollHost || !sticky || !fallbackCanvas || !window.WebGLRenderingContext) {
  throw new Error('The cinematic 3D showcase requires its showcase container and WebGL.');
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const projectData = (window.PORTFOLIO_SPECIMEN?.projects || []).slice(0, 3);
const STAGES = 9;
const SPREAD = 22;

const PROJECT_DEFAULTS = [
  {
    number: '01',
    title: 'Enterprise VLAN & Routing Lab',
    type: 'Networking',
    status: 'Planned',
    link: 'projects/enterprise-network.html',
    phases: [
      { title: 'Map the network.', body: 'Create the requirements, subnet plan, device names, VLAN boundaries, and physical and logical topology.' },
      { title: 'Make traffic move.', body: 'Configure switching, trunks, gateways, routing, DHCP, DNS, and an access-control policy.' },
      { title: 'Prove the result.', body: 'Run acceptance tests, inject controlled faults, and publish only sanitized evidence.' }
    ]
  },
  {
    number: '02',
    title: 'Linux Server Operations Lab',
    type: 'Systems',
    status: 'Planned',
    link: 'projects/linux-monitoring.html',
    phases: [
      { title: 'Build the hosts.', body: 'Define compute, storage, naming, users, SSH, firewall rules, patching, and the normal operating baseline.' },
      { title: 'Open the chassis.', body: 'Inspect services, storage, logs, processes, and the components behind the operating system.' },
      { title: 'Recover on purpose.', body: 'Introduce safe failures, restore service, and document the validation path.' }
    ]
  },
  {
    number: '03',
    title: 'Rack, Cabling & Incident Operations',
    type: 'Data center',
    status: 'Planned',
    link: 'projects/rack-inventory.html',
    phases: [
      { title: 'Someone enters the aisle.', body: 'A controlled motion event begins while rack equipment, management paths, and power feeds remain under observation.' },
      { title: 'Track and isolate.', body: 'The person crosses the monitored boundary, the rack enters alert state, and the affected service path is identified.' },
      { title: 'Replace and validate.', body: 'A failed node is removed, cabling and power are traced, and the recovery is verified before handoff.' }
    ]
  }
];

const projects = PROJECT_DEFAULTS.map((fallback, index) => ({
  ...fallback,
  ...(projectData[index] || {}),
  phases: (projectData[index]?.scenePhases?.length ? projectData[index].scenePhases : fallback.phases)
}));

const SCENE_SPECS = [
  [
    ['Core', 'Layer-3 switching'],
    ['Segments', '4 VLANs'],
    ['Services', 'DHCP · DNS'],
    ['Policy', 'ACL boundary'],
    ['Evidence', '0 / 7 public']
  ],
  [
    ['Hosts', '2 Linux servers'],
    ['Access', 'SSH · least privilege'],
    ['Signals', 'services · logs · disk'],
    ['Recovery', 'controlled failures'],
    ['Evidence', '0 / 7 public']
  ],
  [
    ['Rack', '42U operations model'],
    ['Power', 'A/B feeds'],
    ['Detection', 'motion · timestamp'],
    ['Response', 'isolate · replace · test'],
    ['Evidence', '0 / 7 public']
  ]
];

const SHOT_CAPTIONS = [
  'Topology online · core and access layers visible',
  'Live packet flow · VLAN boundaries in motion',
  'Policy enforced · blocked traffic isolated',
  'Two Linux hosts online · baseline established',
  'Chassis open · serviceable components exposed',
  'Recovery validated · logs and health signals normal',
  'Motion detected · rack aisle event started',
  'Tracked and flagged · incident controls active',
  'Node replaced · power, cabling, and service restored'
];

const PANEL_PLACEMENTS = [
  'side-left', 'side-right', 'side-left',
  'side-top', 'side-left', 'side-right',
  'side-top', 'side-left', 'side-right'
];

const CAMERA_SHOTS = [
  { position: [-2.8, 1.65, 10.8], look: [1.3, 1.0, 0.0], fov: 37, roll: -0.008 },
  { position: [1.6, 6.5, 4.3], look: [-0.3, 0.25, 0.0], fov: 39, roll: 0.012 },
  { position: [-2.4, 1.35, 5.7], look: [1.15, 0.8, 0.3], fov: 34, roll: -0.014 },
  { position: [-3.3, 1.75, 10.4], look: [0.0, 1.0, 0.0], fov: 38, roll: 0.006 },
  { position: [1.35, 5.4, 3.8], look: [0.15, 0.65, 0.2], fov: 36, roll: -0.01 },
  { position: [-1.85, 1.45, 5.6], look: [0.45, 0.72, 0.55], fov: 33, roll: 0.016 },
  { position: [1.3, 1.35, 11.4], look: [0.45, 0.85, 0.0], fov: 39, roll: -0.006 },
  { position: [-3.0, 1.9, 6.2], look: [-0.4, 1.0, 0.0], fov: 35, roll: 0.012 },
  { position: [-0.85, 2.45, 6.6], look: [1.3, 1.0, 0.15], fov: 35, roll: -0.01 }
];

const MOBILE_SHOTS = {
  0: { position: [-1.1, 1.7, 13.2], look: [1.1, 0.6, 0], fov: 46, roll: 0 },
  1: { position: [0.5, 6.2, 7.1], look: [0, 0.1, 0], fov: 48, roll: 0 },
  2: { position: [-0.8, 1.6, 8.1], look: [1.2, 0.55, 0.3], fov: 44, roll: 0 },
  3: { position: [-0.5, 1.9, 13.6], look: [0, 0.7, 0], fov: 47, roll: 0 },
  4: { position: [0.8, 5.5, 6.3], look: [0, 0.4, 0.3], fov: 46, roll: 0 },
  5: { position: [-0.3, 1.65, 7.6], look: [0.35, 0.55, 0.5], fov: 43, roll: 0 },
  6: { position: [0.4, 1.6, 15.2], look: [0, 0.35, 0], fov: 48, roll: 0 },
  7: { position: [-1.2, 1.8, 9.0], look: [-0.3, 0.8, 0], fov: 45, roll: 0 },
  8: { position: [-0.2, 2.2, 8.5], look: [1.0, 0.7, 0.2], fov: 44, roll: 0 }
};

const canvas = document.createElement('canvas');
canvas.className = 'showcase-webgl showcase-webgl-cinematic';
canvas.dataset.showcaseWebgl = '';
canvas.setAttribute('aria-hidden', 'true');
sticky.insertBefore(canvas, fallbackCanvas.nextSibling);

const chrome = document.createElement('div');
chrome.className = 'showcase-3d-chrome mono';
chrome.innerHTML = `
  <div class="showcase-3d-badge"><i></i><span>CINEMATIC 3D · LIVE</span></div>
  <button class="showcase-3d-pause" type="button" aria-pressed="false">PAUSE 3D</button>
`;
sticky.appendChild(chrome);

const rail = document.createElement('div');
rail.className = 'showcase-stage-rail mono';
rail.setAttribute('aria-label', 'Jump to a cinematic 3D stage');
rail.innerHTML = Array.from({ length: STAGES }, (_, index) => `<button type="button" data-three-stage="${index}" aria-label="Open showcase stage ${index + 1}">${String(index + 1).padStart(2, '0')}</button>`).join('');
sticky.appendChild(rail);

const aim = document.createElement('div');
aim.className = 'showcase-aim';
aim.setAttribute('aria-hidden', 'true');
aim.innerHTML = '<i></i><i></i>';
sticky.appendChild(aim);

const shotCaption = document.createElement('div');
shotCaption.className = 'showcase-shot-caption mono';
shotCaption.setAttribute('aria-live', 'polite');
shotCaption.textContent = SHOT_CAPTIONS[0];
sticky.appendChild(shotCaption);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
    logarithmicDepthBuffer: false
  });
} catch (error) {
  canvas.remove();
  chrome.remove();
  rail.remove();
  aim.remove();
  shotCaption.remove();
  throw error;
}

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x090b10, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(37, 1, 0.08, 140);
const world = new THREE.Group();
const environmentRoot = new THREE.Group();
scene.add(environmentRoot, world);

const PALETTES = {
  paper: {
    background: 0xececf0,
    fog: 0xe9eaf0,
    paper: 0xf6f5f1,
    ink: 0x11131a,
    accent: 0x1c52df,
    accent2: 0x00a8cf,
    green: 0x2bcc7e,
    amber: 0xf2b340,
    red: 0xe54c49,
    metalDark: 0x1b2029,
    metalMid: 0x343b4b,
    bezel: 0x454e63,
    panel: 0x262c38,
    pcb: 0x123725,
    gold: 0xc9a54a,
    grid: 0x8b99b7,
    dust: 0x1c52df,
    white: 0xf8fbff
  },
  carbon: {
    background: 0x080a0f,
    fog: 0x080a0f,
    paper: 0x101217,
    ink: 0xf0f3f8,
    accent: 0x4d7dff,
    accent2: 0x26d8ff,
    green: 0x7affb7,
    amber: 0xffc65a,
    red: 0xff5f62,
    metalDark: 0x111620,
    metalMid: 0x252c3a,
    bezel: 0x343d52,
    panel: 0x1b2230,
    pcb: 0x0f3524,
    gold: 0xd8b75c,
    grid: 0x17347b,
    dust: 0x3768ff,
    white: 0xf7f9ff
  }
};

let paletteName = document.documentElement.dataset.theme === 'paper' ? 'paper' : 'carbon';
let palette = PALETTES[paletteName];
let envTexture = null;
const themedMaterials = new Set();
const materialCache = new Map();
const textureCache = new Map();
const dynamicLights = [];

const BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 20, 14);
const SMALL_SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 12, 8);
const CYLINDER_GEOMETRY = new THREE.CylinderGeometry(1, 1, 1, 24);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function smooth(start, end, value) {
  const t = clamp01((value - start) / Math.max(0.0001, end - start));
  return t * t * (3 - 2 * t);
}

function bell(value, center, radius) {
  return smooth(center - radius, center, value) * (1 - smooth(center, center + radius, value));
}

function lerpArray(a, b, t) {
  return a.map((value, index) => THREE.MathUtils.lerp(value, b[index], t));
}

function seededRandom(seed = 0x1a2b3c4d) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function material(role, options = {}) {
  const {
    metalness = 0.55,
    roughness = 0.38,
    clearcoat = 0.15,
    clearcoatRoughness = 0.28,
    emissiveRole = '',
    emissiveIntensity = 0,
    opacity = 1,
    transparent = opacity < 1,
    wireframe = false,
    side = THREE.FrontSide,
    shared = true,
    depthWrite = true
  } = options;

  const key = `${role}|${metalness}|${roughness}|${clearcoat}|${clearcoatRoughness}|${emissiveRole}|${emissiveIntensity}|${opacity}|${wireframe}|${side}|${depthWrite}`;
  if (shared && materialCache.has(key)) return materialCache.get(key);

  const instance = new THREE.MeshPhysicalMaterial({
    color: palette[role] ?? palette.metalMid,
    metalness,
    roughness,
    clearcoat,
    clearcoatRoughness,
    emissive: emissiveRole ? (palette[emissiveRole] ?? 0x000000) : 0x000000,
    emissiveIntensity,
    transparent,
    opacity,
    wireframe,
    side,
    depthWrite
  });
  instance.userData.themeRole = role;
  instance.userData.emissiveRole = emissiveRole;
  themedMaterials.add(instance);
  if (shared) materialCache.set(key, instance);
  return instance;
}

function lineMaterial(role, opacity = 1, blending = THREE.NormalBlending) {
  const instance = new THREE.LineBasicMaterial({
    color: palette[role] ?? palette.accent,
    transparent: opacity < 1,
    opacity,
    blending,
    depthWrite: false
  });
  instance.userData.themeRole = role;
  themedMaterials.add(instance);
  return instance;
}

function pointsMaterial(role, size, opacity = 1) {
  const instance = new THREE.PointsMaterial({
    color: palette[role] ?? palette.accent,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  instance.userData.themeRole = role;
  themedMaterials.add(instance);
  return instance;
}

function box(size, role = 'metalMid', position = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(BOX_GEOMETRY, material(role, options));
  mesh.scale.set(size[0], size[1], size[2]);
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  return mesh;
}

function cylinder(size, role = 'metalMid', position = [0, 0, 0], rotation = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(CYLINDER_GEOMETRY, material(role, options));
  mesh.scale.set(size[0], size[1], size[0]);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  return mesh;
}

function sphere(radius, role = 'accent', position = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(options.lowPoly ? SMALL_SPHERE_GEOMETRY : SPHERE_GEOMETRY, material(role, options));
  mesh.scale.setScalar(radius);
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  return mesh;
}

function radialTexture(inner, outer) {
  const key = `${inner}|${outer}`;
  if (textureCache.has(key)) return textureCache.get(key);
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const context = cv.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 4, 128, 128, 128);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

function labelTexture(text, danger = false) {
  const key = `label:${danger ? 'danger' : 'normal'}:${text}`;
  if (textureCache.has(key)) return textureCache.get(key);
  const cv = document.createElement('canvas');
  cv.width = 768;
  cv.height = 160;
  const context = cv.getContext('2d');
  context.fillStyle = danger ? 'rgba(78, 8, 14, 0.93)' : 'rgba(7, 11, 19, 0.92)';
  context.fillRect(5, 5, 758, 150);
  context.strokeStyle = danger ? '#ff6c70' : '#8baaff';
  context.lineWidth = 5;
  context.strokeRect(8, 8, 752, 144);
  context.fillStyle = '#f8fbff';
  context.font = '700 48px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 384, 82);
  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

function makeLabel(text, position, scale = [2.2, 0.46, 1], danger = false) {
  const spriteMaterial = new THREE.SpriteMaterial({
    map: labelTexture(text, danger),
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(...position);
  sprite.scale.set(...scale);
  sprite.renderOrder = 50;
  return sprite;
}

function makeGlowSprite(role, scale = 2.5, opacity = 0.5) {
  const texture = radialTexture('rgba(255,255,255,0.92)', 'rgba(255,255,255,0)');
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    color: palette[role] ?? palette.accent,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  spriteMaterial.userData.themeRole = role;
  themedMaterials.add(spriteMaterial);
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(scale, scale, 1);
  return sprite;
}

function contactShadow(position = [0, -0.4, 0], scale = [6, 3.2], opacity = 0.54) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: radialTexture('rgba(0,0,0,0.92)', 'rgba(0,0,0,0)'),
      transparent: true,
      opacity,
      depthWrite: false,
      toneMapped: false
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(...position);
  mesh.scale.set(scale[0], scale[1], 1);
  return mesh;
}

function curveLine(points, role = 'accent', opacity = 0.5) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
  const line = new THREE.Line(geometry, lineMaterial(role, opacity, THREE.AdditiveBlending));
  return { curve, line };
}

function tube(points, radius = 0.025, role = 'accent', opacity = 1) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.TubeGeometry(curve, 56, radius, 8, false);
  const mesh = new THREE.Mesh(geometry, material(role, {
    metalness: 0.08,
    roughness: 0.28,
    clearcoat: 0.35,
    emissiveRole: role,
    emissiveIntensity: 0.25,
    opacity,
    transparent: opacity < 1,
    shared: false
  }));
  return { curve, mesh };
}

function makeLed(role = 'green', radius = 0.035) {
  const ledMaterial = material(role, {
    metalness: 0.02,
    roughness: 0.18,
    clearcoat: 0.7,
    emissiveRole: role,
    emissiveIntensity: 3.2,
    shared: false
  });
  const led = new THREE.Mesh(SMALL_SPHERE_GEOMETRY, ledMaterial);
  led.scale.setScalar(radius);
  led.userData.baseIntensity = 3.2;
  return led;
}

function createDriveBay(width = 0.36) {
  const group = new THREE.Group();
  const bay = box([width, 0.17, 0.06], 'bezel', [0, 0, 0], { metalness: 0.7, roughness: 0.3 });
  group.add(bay);
  const pull = box([width * 0.82, 0.035, 0.022], 'metalDark', [0, -0.04, 0.046], { metalness: 0.55, roughness: 0.4 });
  group.add(pull);
  const led = makeLed('green', 0.018);
  led.position.set(width * 0.33, 0.045, 0.052);
  group.add(led);
  group.userData.led = led;
  return group;
}

function createServerUnit({ width = 3.0, depth = 1.8, height = 0.34, internal = false, role = 'metalMid' } = {}) {
  const root = new THREE.Group();
  const chassis = box([width, height, depth], role, [0, 0, 0], { metalness: 0.82, roughness: 0.27, clearcoat: 0.18 });
  root.add(chassis);

  const face = box([width * 0.97, height * 0.78, 0.055], 'bezel', [0, 0, depth / 2 + 0.04], { metalness: 0.74, roughness: 0.31 });
  root.add(face);

  const handleMaterial = material('metalDark', { metalness: 0.76, roughness: 0.26 });
  root.add(box([0.10, height * 0.72, 0.12], 'metalDark', [-width / 2 + 0.12, 0, depth / 2 + 0.09], { metalness: 0.76, roughness: 0.26 }));
  root.add(box([0.10, height * 0.72, 0.12], 'metalDark', [width / 2 - 0.12, 0, depth / 2 + 0.09], { metalness: 0.76, roughness: 0.26 }));
  void handleMaterial;

  const bays = [];
  for (let index = 0; index < 4; index += 1) {
    const bay = createDriveBay(0.34);
    bay.position.set(-0.92 + index * 0.39, 0, depth / 2 + 0.085);
    root.add(bay);
    bays.push(bay);
  }

  const ventMaterial = material('metalDark', { metalness: 0.65, roughness: 0.34 });
  for (let index = 0; index < 14; index += 1) {
    const vent = new THREE.Mesh(BOX_GEOMETRY, ventMaterial);
    vent.scale.set(0.042, 0.10, 0.022);
    vent.position.set(0.12 + index * 0.075, 0, depth / 2 + 0.078);
    root.add(vent);
  }

  const leds = [];
  ['green', 'amber', 'accent'].forEach((ledRole, index) => {
    const led = makeLed(ledRole, 0.024);
    led.position.set(1.03 + index * 0.10, 0, depth / 2 + 0.096);
    led.userData.phase = index * 1.6;
    root.add(led);
    leds.push(led);
  });

  const cover = box([width * 0.98, 0.035, depth * 0.96], 'panel', [0, height / 2 + 0.035, -0.015], { metalness: 0.8, roughness: 0.26, shared: false });
  root.add(cover);

  const internalRoot = new THREE.Group();
  internalRoot.position.set(0, height / 2 + 0.03, 0);
  internalRoot.visible = internal;
  root.add(internalRoot);

  const parts = [];
  const fans = [];
  if (internal) {
    const board = box([width * 0.78, 0.035, depth * 0.67], 'pcb', [0.03, 0.02, -0.02], { metalness: 0.12, roughness: 0.62 });
    internalRoot.add(board);

    const cpuBase = box([0.54, 0.09, 0.54], 'gold', [0.16, 0.11, 0.10], { metalness: 0.76, roughness: 0.24 });
    internalRoot.add(cpuBase);
    const heatsink = new THREE.Group();
    heatsink.position.set(0.16, 0.22, 0.10);
    const finMaterial = material('metalMid', { metalness: 0.9, roughness: 0.22 });
    for (let index = 0; index < 10; index += 1) {
      const fin = new THREE.Mesh(BOX_GEOMETRY, finMaterial);
      fin.scale.set(0.42, 0.025, 0.48);
      fin.position.y = index * 0.033;
      heatsink.add(fin);
    }
    internalRoot.add(heatsink);
    parts.push({ object: heatsink, base: heatsink.position.clone(), target: new THREE.Vector3(0.30, 0.48, 0.02) });

    for (let index = 0; index < 6; index += 1) {
      const ram = box([0.08, 0.44, 0.74], index % 2 ? 'accent2' : 'accent', [-0.82 + index * 0.18, 0.26, 0.04], {
        metalness: 0.18,
        roughness: 0.45,
        clearcoat: 0.2,
        emissiveRole: index % 2 ? 'accent2' : 'accent',
        emissiveIntensity: 0.18,
        shared: false
      });
      internalRoot.add(ram);
      parts.push({ object: ram, base: ram.position.clone(), target: new THREE.Vector3(-1.05 + index * 0.22, 0.56 + index * 0.03, 0.02) });
    }

    for (let index = 0; index < 3; index += 1) {
      const gpu = box([0.22, 0.54, 1.10], 'metalDark', [0.62 + index * 0.28, 0.31, -0.18], { metalness: 0.78, roughness: 0.28, shared: false });
      const edge = box([0.24, 0.035, 1.12], 'accent', [0, 0.28, 0], { metalness: 0.2, roughness: 0.3, emissiveRole: 'accent', emissiveIntensity: 1.4, shared: false });
      gpu.add(edge);
      internalRoot.add(gpu);
      parts.push({ object: gpu, base: gpu.position.clone(), target: new THREE.Vector3(0.70 + index * 0.38, 0.70 + index * 0.08, -0.22) });
    }

    const psu = box([0.72, 0.34, 0.74], 'metalDark', [1.05, 0.21, 0.45], { metalness: 0.82, roughness: 0.27 });
    internalRoot.add(psu);
    parts.push({ object: psu, base: psu.position.clone(), target: new THREE.Vector3(1.35, 0.55, 0.64) });

    for (let index = 0; index < 4; index += 1) {
      const fanGroup = new THREE.Group();
      fanGroup.position.set(-1.02 + index * 0.68, 0.22, -0.63);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.026, 10, 32), material('metalMid', { metalness: 0.78, roughness: 0.26 }));
      fanGroup.add(ring);
      for (let bladeIndex = 0; bladeIndex < 6; bladeIndex += 1) {
        const blade = box([0.055, 0.32, 0.025], 'metalDark', [0, 0.15, 0], { metalness: 0.32, roughness: 0.48 });
        blade.rotation.z = bladeIndex * Math.PI / 3;
        fanGroup.add(blade);
      }
      internalRoot.add(fanGroup);
      fans.push(fanGroup);
      parts.push({ object: fanGroup, base: fanGroup.position.clone(), target: new THREE.Vector3(-1.35 + index * 0.82, 0.62, -0.82) });
    }
  }

  return { root, chassis, face, cover, internalRoot, parts, fans, leds, bays };
}

function createSwitchUnit(width = 3.0) {
  const root = new THREE.Group();
  root.add(box([width, 0.30, 1.75], 'metalDark', [0, 0, 0], { metalness: 0.82, roughness: 0.26 }));
  root.add(box([width * 0.97, 0.23, 0.055], 'bezel', [0, 0, 0.915], { metalness: 0.72, roughness: 0.32 }));
  const ports = [];
  for (let row = 0; row < 2; row += 1) {
    for (let index = 0; index < 12; index += 1) {
      const port = box([0.095, 0.065, 0.03], 'metalDark', [-1.15 + index * 0.20, 0.045 - row * 0.10, 0.955], { metalness: 0.18, roughness: 0.65 });
      root.add(port);
      ports.push(port);
    }
  }
  const leds = [];
  ['green', 'accent2', 'amber'].forEach((role, index) => {
    const led = makeLed(role, 0.022);
    led.position.set(1.10 + index * 0.10, 0, 0.97);
    led.userData.phase = index;
    root.add(led);
    leds.push(led);
  });
  return { root, ports, leds };
}

function createRack({ units = 8, width = 3.7, height = 4.4, depth = 2.15, includeInternal = false } = {}) {
  const root = new THREE.Group();
  const frameMaterial = material('metalDark', { metalness: 0.9, roughness: 0.2, clearcoat: 0.18 });
  const railMaterial = material('metalMid', { metalness: 0.85, roughness: 0.23 });
  const x = width / 2;
  const z = depth / 2;
  [[-x, height / 2, -z], [x, height / 2, -z], [-x, height / 2, z], [x, height / 2, z]].forEach((position) => {
    const post = new THREE.Mesh(BOX_GEOMETRY, frameMaterial);
    post.scale.set(0.12, height, 0.12);
    post.position.set(...position);
    post.castShadow = true;
    root.add(post);
  });
  root.add(box([width + 0.12, 0.12, depth + 0.12], 'metalDark', [0, 0.02, 0], { metalness: 0.9, roughness: 0.2 }));
  root.add(box([width + 0.12, 0.12, depth + 0.12], 'metalDark', [0, height, 0], { metalness: 0.9, roughness: 0.2 }));
  root.add(box([width - 0.22, 0.075, depth - 0.12], 'metalMid', [0, 0.23, 0], { metalness: 0.85, roughness: 0.25 }));
  root.add(box([width - 0.22, 0.075, depth - 0.12], 'metalMid', [0, height - 0.22, 0], { metalness: 0.85, roughness: 0.25 }));

  for (let side = -1; side <= 1; side += 2) {
    const rail = new THREE.Mesh(BOX_GEOMETRY, railMaterial);
    rail.scale.set(0.055, height - 0.42, 0.055);
    rail.position.set(side * (x - 0.18), height / 2, z - 0.10);
    root.add(rail);
  }

  const servers = [];
  const unitSpacing = (height - 0.78) / Math.max(1, units);
  for (let index = 0; index < units; index += 1) {
    const server = index === units - 1
      ? createSwitchUnit(width - 0.48)
      : createServerUnit({ width: width - 0.48, depth: depth - 0.34, height: Math.min(0.34, unitSpacing * 0.78), internal: includeInternal && index === Math.floor(units / 2) });
    server.root.position.set(0, 0.48 + index * unitSpacing, 0.02);
    root.add(server.root);
    servers.push(server);
  }

  const rackLabel = makeLabel('LAB-RACK-01', [0, height + 0.34, 0], [2.25, 0.46, 1]);
  rackLabel.material.opacity = 0.78;
  root.add(rackLabel);

  return { root, servers, rackLabel, height, width, depth };
}

function createWirePerson() {
  const root = new THREE.Group();
  const wire = material('red', {
    metalness: 0,
    roughness: 1,
    wireframe: true,
    emissiveRole: 'red',
    emissiveIntensity: 1.2,
    shared: false
  });

  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), wire);
  head.position.y = 2.36;
  root.add(head);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.92, 0.38, 2, 3, 2), wire);
  torso.position.y = 1.63;
  root.add(torso);

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.30, 0.34, 2, 1, 2), wire);
  pelvis.position.y = 1.02;
  root.add(pelvis);

  const makeLimb = (length, radius = 0.10) => {
    const pivot = new THREE.Group();
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8, 2, false), wire);
    limb.position.y = -length / 2;
    pivot.add(limb);
    return { pivot, limb };
  };

  const leftUpperArm = makeLimb(0.62, 0.085);
  const rightUpperArm = makeLimb(0.62, 0.085);
  leftUpperArm.pivot.position.set(-0.46, 1.98, 0);
  rightUpperArm.pivot.position.set(0.46, 1.98, 0);
  root.add(leftUpperArm.pivot, rightUpperArm.pivot);

  const leftForearm = makeLimb(0.58, 0.075);
  const rightForearm = makeLimb(0.58, 0.075);
  leftForearm.pivot.position.y = -0.62;
  rightForearm.pivot.position.y = -0.62;
  leftUpperArm.pivot.add(leftForearm.pivot);
  rightUpperArm.pivot.add(rightForearm.pivot);

  const leftThigh = makeLimb(0.78, 0.105);
  const rightThigh = makeLimb(0.78, 0.105);
  leftThigh.pivot.position.set(-0.20, 0.92, 0);
  rightThigh.pivot.position.set(0.20, 0.92, 0);
  root.add(leftThigh.pivot, rightThigh.pivot);

  const leftShin = makeLimb(0.76, 0.085);
  const rightShin = makeLimb(0.76, 0.085);
  leftShin.pivot.position.y = -0.78;
  rightShin.pivot.position.y = -0.78;
  leftThigh.pivot.add(leftShin.pivot);
  rightThigh.pivot.add(rightShin.pivot);

  const glow = makeGlowSprite('red', 3.0, 0.0);
  glow.position.y = 1.45;
  root.add(glow);

  return {
    root,
    head,
    torso,
    glow,
    leftUpperArm: leftUpperArm.pivot,
    rightUpperArm: rightUpperArm.pivot,
    leftForearm: leftForearm.pivot,
    rightForearm: rightForearm.pivot,
    leftThigh: leftThigh.pivot,
    rightThigh: rightThigh.pivot,
    leftShin: leftShin.pivot,
    rightShin: rightShin.pivot
  };
}

function buildNetworkScene() {
  const root = new THREE.Group();
  root.position.x = 0;
  root.add(contactShadow([1.8, -0.39, 0.1], [6.4, 4.1], 0.54));

  const rack = createRack({ units: 7, width: 3.55, height: 4.15, depth: 2.05 });
  rack.root.position.set(2.0, -0.18, 0.1);
  rack.root.rotation.y = -0.07;
  root.add(rack.root);

  const coreSwitch = createSwitchUnit(3.05);
  coreSwitch.root.position.set(-0.55, 0.68, 0.25);
  coreSwitch.root.rotation.y = 0.16;
  root.add(coreSwitch.root);

  const nodePositions = [
    [-3.55, 0.05, 1.55], [-3.45, 0.05, -0.85], [-2.05, 0.05, -2.35],
    [-0.25, 0.05, -2.95], [1.65, 0.05, -2.55], [3.15, 0.05, -1.35],
    [3.45, 0.05, 1.50], [0.35, 0.05, 2.85], [-2.15, 0.05, 2.55]
  ];
  const nodeRoles = ['accent', 'accent2', 'green', 'amber', 'accent', 'accent2', 'green', 'amber', 'accent'];
  const nodes = [];
  const packets = [];
  const deniedPacket = sphere(0.075, 'red', [0, 0, 0], { emissiveRole: 'red', emissiveIntensity: 5, metalness: 0.02, roughness: 0.15, shared: false });
  deniedPacket.visible = false;
  root.add(deniedPacket);

  nodePositions.forEach((position, index) => {
    const node = new THREE.Group();
    const base = cylinder([0.34, 0.10], 'metalDark', position, [0, 0, 0], { metalness: 0.72, roughness: 0.3 });
    const glow = sphere(0.12, nodeRoles[index], [position[0], position[1] + 0.20, position[2]], {
      emissiveRole: nodeRoles[index], emissiveIntensity: 3.0, metalness: 0.04, roughness: 0.18, shared: false
    });
    const halo = makeGlowSprite(nodeRoles[index], 0.85, 0.32);
    halo.position.set(position[0], position[1] + 0.22, position[2]);
    node.add(base, glow, halo);
    root.add(node);

    const lineInfo = curveLine([
      [position[0], position[1] + 0.22, position[2]],
      [position[0] * 0.48, 0.72 + (index % 2) * 0.20, position[2] * 0.48],
      [-0.55, 0.83, 0.42]
    ], nodeRoles[index], 0.20);
    root.add(lineInfo.line);

    const packet = sphere(0.055, nodeRoles[index], [0, 0, 0], {
      emissiveRole: nodeRoles[index], emissiveIntensity: 5.0, metalness: 0.01, roughness: 0.15, shared: false
    });
    packet.visible = false;
    root.add(packet);
    packets.push({ object: packet, curve: lineInfo.curve, offset: index / nodePositions.length, speed: 0.075 + index * 0.004 });
    nodes.push({ node, base, glow, halo, line: lineInfo.line, phase: index * 0.73, basePosition: new THREE.Vector3(...position) });
  });

  const vlanZones = ['accent', 'accent2', 'green', 'amber'].map((role, index) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.25 + index * 0.53, 1.28 + index * 0.53, 128),
      material(role, { metalness: 0.03, roughness: 0.45, emissiveRole: role, emissiveIntensity: 1.2, opacity: 0.0, transparent: true, side: THREE.DoubleSide, shared: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.31 + index * 0.004;
    root.add(ring);
    return ring;
  });

  const aclGate = new THREE.Group();
  const gatePanel = box([0.10, 2.4, 3.15], 'amber', [0, 0, 0], { opacity: 0.13, transparent: true, emissiveRole: 'amber', emissiveIntensity: 0.8, shared: false });
  const gateFrame = box([0.15, 2.62, 3.38], 'amber', [0, 0, 0], { opacity: 0.34, transparent: true, emissiveRole: 'amber', emissiveIntensity: 0.35, shared: false });
  aclGate.add(gateFrame, gatePanel);
  aclGate.position.set(0.72, -2.2, 0.15);
  root.add(aclGate);
  const denyLabel = makeLabel('ACL · DENY', [0.72, 2.25, 0.15], [1.9, 0.42, 1], true);
  root.add(denyLabel);

  const vlanLabels = [
    makeLabel('VLAN 10 · OPS', [-3.0, 0.55, 2.0], [1.75, 0.36, 1]),
    makeLabel('VLAN 20 · ENG', [-2.7, 0.55, -2.35], [1.75, 0.36, 1]),
    makeLabel('VLAN 30 · GUEST', [2.6, 0.55, -2.25], [1.85, 0.36, 1]),
    makeLabel('VLAN 99 · MGMT', [2.85, 0.55, 2.05], [1.85, 0.36, 1])
  ];
  vlanLabels.forEach((label) => root.add(label));

  root.userData.update = (local, time, dt, active) => {
    const assemble = smooth(0.02, 0.82, local);
    const traffic = smooth(0.82, 1.35, local);
    const policy = smooth(1.32, 1.96, local);

    rack.root.position.y = -0.18 + Math.sin(time * 0.0008) * 0.025;
    rack.root.rotation.y = -0.07 + Math.sin(time * 0.00022) * 0.045;
    rack.root.scale.setScalar(0.86 + assemble * 0.14);
    coreSwitch.root.position.z = THREE.MathUtils.lerp(-1.65, 0.25, assemble);
    coreSwitch.root.rotation.x = THREE.MathUtils.lerp(-0.12, 0, assemble);

    nodes.forEach((entry, index) => {
      const radiusScale = 0.84 + assemble * 0.16 + traffic * 0.035;
      entry.base.position.x = entry.basePosition.x * radiusScale;
      entry.base.position.z = entry.basePosition.z * radiusScale;
      entry.glow.position.x = entry.basePosition.x * radiusScale;
      entry.glow.position.z = entry.basePosition.z * radiusScale;
      entry.halo.position.x = entry.basePosition.x * radiusScale;
      entry.halo.position.z = entry.basePosition.z * radiusScale;
      const lift = Math.sin(time * 0.0014 + entry.phase) * 0.035;
      entry.node.position.y = lift;
      entry.glow.scale.setScalar(0.11 + Math.sin(time * 0.003 + entry.phase) * 0.012 + traffic * 0.035);
      entry.halo.material.opacity = 0.16 + traffic * 0.30;
      entry.line.material.opacity = 0.06 + traffic * 0.48;
      entry.node.visible = active || local < 2.35;
      entry.glow.material.emissiveIntensity = 2.0 + traffic * 3.4 + Math.sin(time * 0.004 + index) * 0.5;
    });

    vlanZones.forEach((ring, index) => {
      ring.material.opacity = 0.02 + traffic * (0.19 + index * 0.025);
      ring.rotation.z = time * (0.000045 + index * 0.000012) * (index % 2 ? -1 : 1);
      ring.scale.setScalar(0.96 + traffic * 0.06 + Math.sin(time * 0.0008 + index) * 0.006);
    });

    packets.forEach((entry, index) => {
      entry.object.visible = traffic > 0.04 && !(policy > 0.45 && index === 3);
      const progress = (time * entry.speed * 0.001 + entry.offset) % 1;
      entry.object.position.copy(entry.curve.getPoint(progress));
      entry.object.scale.setScalar(0.7 + traffic * 0.7 + Math.sin(time * 0.005 + index) * 0.1);
    });

    aclGate.position.y = THREE.MathUtils.lerp(-2.2, 0.72, policy);
    aclGate.rotation.y = Math.sin(time * 0.00055) * 0.035;
    gatePanel.material.opacity = 0.04 + policy * 0.16;
    gateFrame.material.opacity = 0.06 + policy * 0.35;
    denyLabel.material.opacity = policy * 0.95;

    vlanLabels.forEach((label, index) => {
      label.material.opacity = traffic * (0.52 + Math.sin(time * 0.001 + index) * 0.06) * (1 - policy * 0.25);
    });

    deniedPacket.visible = policy > 0.05;
    const deniedProgress = clamp(policy * 1.2, 0, 1);
    deniedPacket.position.set(
      THREE.MathUtils.lerp(-2.4, 0.55, deniedProgress),
      0.75 + Math.sin(time * 0.003) * 0.08,
      THREE.MathUtils.lerp(-1.75, 0.05, deniedProgress)
    );
    deniedPacket.scale.setScalar(0.85 + bell(policy, 0.62, 0.42) * 0.9);
  };

  return root;
}

function buildLinuxScene() {
  const root = new THREE.Group();
  root.position.x = SPREAD;
  root.add(contactShadow([0, -0.39, 0.2], [7.0, 4.1], 0.58));

  const left = createServerUnit({ width: 3.25, depth: 2.15, height: 0.46, internal: false });
  const open = createServerUnit({ width: 3.45, depth: 2.35, height: 0.50, internal: true });
  left.root.position.set(-1.9, 0.85, 0.15);
  open.root.position.set(1.15, 0.85, 0.15);
  left.root.rotation.y = 0.08;
  open.root.rotation.y = -0.10;
  root.add(left.root, open.root);

  const rails = new THREE.Group();
  rails.add(box([3.8, 0.06, 0.10], 'metalMid', [1.15, 0.58, -1.1], { metalness: 0.85, roughness: 0.24 }));
  rails.add(box([3.8, 0.06, 0.10], 'metalMid', [1.15, 0.58, 1.1], { metalness: 0.85, roughness: 0.24 }));
  root.add(rails);

  const serviceLabels = [
    makeLabel('SSH · ACTIVE', [-2.0, 1.55, 0.0], [1.65, 0.34, 1]),
    makeLabel('SYSTEMD · HEALTHY', [1.20, 1.75, -0.10], [2.05, 0.38, 1]),
    makeLabel('/VAR · 42%', [2.05, 0.95, 1.55], [1.45, 0.32, 1]),
    makeLabel('RECOVERY · PASS', [0.0, 3.05, 0.0], [2.1, 0.42, 1])
  ];
  serviceLabels.forEach((label) => root.add(label));

  const monitoringRings = ['green', 'accent2', 'accent'].map((role, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.38 + index * 0.46, 0.022, 8, 96),
      material(role, { opacity: 0, transparent: true, emissiveRole: role, emissiveIntensity: 1.4, metalness: 0.02, roughness: 0.25, shared: false })
    );
    ring.rotation.x = Math.PI / 2.35 + index * 0.11;
    ring.rotation.y = index * 0.42;
    ring.position.set(0.35, 0.85, 0.1);
    root.add(ring);
    return ring;
  });

  const alertDisk = box([0.62, 0.12, 0.86], 'red', [2.20, 1.22, 0.5], { emissiveRole: 'red', emissiveIntensity: 0, shared: false });
  root.add(alertDisk);
  const alertGlow = makeGlowSprite('red', 2.2, 0);
  alertGlow.position.copy(alertDisk.position);
  root.add(alertGlow);

  const logCount = finePointer.matches ? 150 : 90;
  const random = seededRandom(0x7710aacc);
  const logPositions = new Float32Array(logCount * 3);
  const logSeeds = [];
  for (let index = 0; index < logCount; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 0.65 + random() * 2.4;
    logPositions[index * 3] = Math.cos(angle) * radius;
    logPositions[index * 3 + 1] = random() * 3.5 - 0.2;
    logPositions[index * 3 + 2] = Math.sin(angle) * radius;
    logSeeds.push({ angle, radius, speed: 0.18 + random() * 0.32, offset: random() * 3.7 });
  }
  const logGeometry = new THREE.BufferGeometry();
  logGeometry.setAttribute('position', new THREE.BufferAttribute(logPositions, 3));
  const logPoints = new THREE.Points(logGeometry, pointsMaterial('green', 0.045, 0));
  logPoints.position.x = 0.35;
  root.add(logPoints);

  const componentBase = open.parts.map((entry) => entry.base.clone());
  const coverBase = open.cover.position.clone();

  root.userData.update = (local, time, dt) => {
    const baseline = smooth(0.02, 0.72, local);
    const openAmount = smooth(0.62, 1.35, local);
    const recovery = smooth(1.26, 1.96, local);

    left.root.position.x = THREE.MathUtils.lerp(-1.2, -2.2, baseline);
    open.root.position.x = THREE.MathUtils.lerp(1.15, 1.80, baseline) + openAmount * 0.55;
    left.root.rotation.y = 0.08 + Math.sin(time * 0.00032) * 0.035;
    open.root.rotation.y = -0.10 - openAmount * 0.08;

    open.cover.position.y = THREE.MathUtils.lerp(coverBase.y, 1.42, openAmount);
    open.cover.position.z = THREE.MathUtils.lerp(coverBase.z, -0.38, openAmount);
    open.cover.rotation.x = THREE.MathUtils.lerp(0, -0.18, openAmount);
    open.internalRoot.visible = openAmount > 0.015;
    open.internalRoot.scale.setScalar(0.25 + openAmount * 0.80);
    open.internalRoot.position.y = 0.27 + openAmount * 0.36;

    open.parts.forEach((entry, index) => {
      const base = componentBase[index];
      const target = entry.target;
      entry.object.position.lerpVectors(base, target, openAmount);
      const pointerPush = finePointer.matches && openAmount > 0.75
        ? (pointerTargetX * (index % 2 ? 0.12 : -0.12))
        : 0;
      entry.object.position.x += pointerPush * openAmount;
      entry.object.rotation.y = openAmount * (index - open.parts.length / 2) * 0.018 + time * 0.00004 * (index % 2 ? 1 : -1);
    });

    open.fans.forEach((fan, index) => {
      fan.rotation.z = time * (0.0024 + index * 0.00033);
    });

    monitoringRings.forEach((ring, index) => {
      ring.material.opacity = recovery * (0.22 + index * 0.055);
      ring.rotation.z = time * (0.00017 + index * 0.00004) * (index % 2 ? -1 : 1);
      ring.scale.setScalar(0.88 + recovery * 0.17 + Math.sin(time * 0.001 + index) * 0.012);
    });

    serviceLabels[0].material.opacity = baseline * (1 - openAmount * 0.35) * 0.8;
    serviceLabels[1].material.opacity = baseline * (1 - recovery * 0.25) * 0.75;
    serviceLabels[2].material.opacity = recovery * 0.82;
    serviceLabels[3].material.opacity = recovery * 0.96;

    const failPulse = bell(local, 1.18, 0.52);
    alertDisk.material.emissiveIntensity = failPulse * 2.8;
    alertGlow.material.opacity = failPulse * 0.52 * (1 - recovery);
    alertDisk.position.x = THREE.MathUtils.lerp(2.20, 2.75, openAmount);
    alertDisk.position.y = THREE.MathUtils.lerp(1.22, 1.62, openAmount);
    alertDisk.material.color.setHex(recovery > 0.78 ? palette.green : palette.red);
    alertDisk.material.emissive.setHex(recovery > 0.78 ? palette.green : palette.red);

    logPoints.material.opacity = recovery * 0.78;
    const attribute = logGeometry.attributes.position;
    for (let index = 0; index < logCount; index += 1) {
      const seed = logSeeds[index];
      const y = ((time * 0.001 * seed.speed + seed.offset) % 3.7) - 0.2;
      attribute.setXYZ(index, Math.cos(seed.angle + time * 0.00005) * seed.radius, y, Math.sin(seed.angle + time * 0.00005) * seed.radius);
    }
    attribute.needsUpdate = true;
  };

  return root;
}

function buildRackMotionScene() {
  const root = new THREE.Group();
  root.position.x = SPREAD * 2;
  root.add(contactShadow([1.7, -0.39, 0.0], [7.2, 4.4], 0.62));

  const rack = createRack({ units: 8, width: 3.65, height: 4.35, depth: 2.10 });
  rack.root.position.set(2.05, -0.22, 0.05);
  rack.root.rotation.y = -0.08;
  root.add(rack.root);

  const pduA = box([0.13, 3.85, 0.12], 'metalDark', [0.02, 1.85, -1.18], { metalness: 0.78, roughness: 0.28 });
  const pduB = box([0.13, 3.85, 0.12], 'metalDark', [4.08, 1.85, -1.18], { metalness: 0.78, roughness: 0.28 });
  root.add(pduA, pduB);

  const pduLeds = [];
  for (let index = 0; index < 11; index += 1) {
    [[0.02, 'green'], [4.08, 'accent2']].forEach(([x, role], side) => {
      const led = makeLed(role, 0.024);
      led.position.set(x, 0.28 + index * 0.32, -1.10);
      led.userData.phase = index * 0.42 + side;
      root.add(led);
      pduLeds.push(led);
    });
  }

  const person = createWirePerson();
  person.root.position.set(-5.9, -0.36, 0.72);
  person.root.scale.setScalar(0.98);
  root.add(person.root);

  const tripLine = tube([[-2.0, 0.0, -1.8], [-1.55, 0.05, 0.0], [-1.95, 0.0, 1.8]], 0.018, 'red', 0.85);
  tripLine.mesh.material.emissiveIntensity = 2.2;
  root.add(tripLine.mesh);
  const tripGlow = makeGlowSprite('red', 2.2, 0);
  tripGlow.position.set(-1.65, 0.15, 0);
  root.add(tripGlow);

  const beaconBase = cylinder([0.30, 0.12], 'metalDark', [2.05, 4.36, 0.05], [0, 0, 0], { metalness: 0.8, roughness: 0.25 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), material('red', {
    opacity: 0.88,
    transparent: true,
    emissiveRole: 'red',
    emissiveIntensity: 0,
    metalness: 0.08,
    roughness: 0.18,
    shared: false
  }));
  beacon.position.set(2.05, 4.49, 0.05);
  root.add(beaconBase, beacon);
  const beaconLight = new THREE.PointLight(palette.red, 0, 10, 2);
  beaconLight.position.set(2.05, 4.42, 0.1);
  root.add(beaconLight);
  dynamicLights.push({ light: beaconLight, role: 'red' });

  const lockRing = new THREE.Mesh(
    new THREE.RingGeometry(1.35, 1.43, 128),
    material('red', { opacity: 0, transparent: true, emissiveRole: 'red', emissiveIntensity: 2.0, metalness: 0.02, roughness: 0.25, side: THREE.DoubleSide, shared: false })
  );
  lockRing.rotation.x = -Math.PI / 2;
  lockRing.position.set(2.05, -0.30, 0.05);
  root.add(lockRing);

  const trackingRings = [0.55, 0.82, 1.08].map((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.016, 8, 64),
      material('red', { opacity: 0, transparent: true, emissiveRole: 'red', emissiveIntensity: 1.8, metalness: 0.02, roughness: 0.25, shared: false })
    );
    ring.rotation.y = index * 0.7;
    ring.rotation.x = Math.PI / 2 + index * 0.25;
    person.root.add(ring);
    return ring;
  });

  const cableRoles = ['accent', 'accent2', 'green', 'amber', 'accent', 'accent2'];
  const cables = [];
  for (let index = 0; index < 6; index += 1) {
    const side = index % 2 ? 1 : -1;
    const y = 0.55 + index * 0.49;
    const cable = tube([
      [2.05 + side * 1.25, y, -1.02],
      [2.05 + side * (2.15 + index * 0.08), y + 0.14, -1.42],
      [2.05 + side * 2.05, 3.58 - index * 0.18, -0.40]
    ], 0.026, cableRoles[index], 0.22);
    root.add(cable.mesh);
    cables.push(cable);
  }

  const failedServer = rack.servers[3];
  const failedServerBaseY = failedServer.root.position.y;
  const failedServerBaseZ = failedServer.root.position.z;
  const restoreLight = new THREE.PointLight(palette.green, 0, 6, 2);
  restoreLight.position.set(2.05, 1.75, 2.5);
  root.add(restoreLight);
  dynamicLights.push({ light: restoreLight, role: 'green' });

  const scanPlane = box([3.50, 0.025, 2.1], 'accent2', [2.05, 0.0, 0.05], { opacity: 0.0, transparent: true, emissiveRole: 'accent2', emissiveIntensity: 1.8, shared: false });
  root.add(scanPlane);

  const alertLabel = makeLabel('MOTION · EVENT', [-2.65, 2.85, 0.7], [2.0, 0.43, 1], true);
  const restoreLabel = makeLabel('SERVICE · RESTORED', [2.05, 3.25, 0.4], [2.35, 0.45, 1]);
  root.add(alertLabel, restoreLabel);

  root.userData.update = (local, time, dt) => {
    const enter = smooth(0.02, 0.82, local);
    const approach = smooth(0.82, 1.34, local);
    const alert = smooth(1.12, 1.60, local);
    const service = smooth(1.45, 1.83, local);
    const restore = smooth(1.76, 1.99, local);

    const personX = -5.9 + enter * 3.35 + approach * 1.20 - alert * 0.15;
    person.root.position.x = personX;
    person.root.position.z = 0.72 + Math.sin(time * 0.0013) * 0.035;
    const moving = (enter > 0.02 && enter < 0.98) || (approach > 0.02 && approach < 0.98);
    const walk = moving ? Math.sin(time * 0.0062) : 0;
    person.leftUpperArm.rotation.x = walk * 0.72;
    person.rightUpperArm.rotation.x = -walk * 0.72;
    person.leftForearm.rotation.x = -0.15 + Math.max(0, -walk) * 0.45;
    person.rightForearm.rotation.x = -0.15 + Math.max(0, walk) * 0.45;
    person.leftThigh.rotation.x = -walk * 0.68;
    person.rightThigh.rotation.x = walk * 0.68;
    person.leftShin.rotation.x = Math.max(0, walk) * 0.55;
    person.rightShin.rotation.x = Math.max(0, -walk) * 0.55;
    person.head.rotation.y = Math.sin(time * 0.0011) * 0.12;

    const alarmPulse = alert * (0.65 + Math.sin(time * 0.009) * 0.35);
    person.glow.material.opacity = alert * 0.26;
    person.glow.scale.setScalar(2.6 + alarmPulse * 0.9);
    trackingRings.forEach((ring, index) => {
      ring.material.opacity = alert * (0.22 + index * 0.08);
      ring.rotation.z = time * (0.0008 + index * 0.0003) * (index % 2 ? -1 : 1);
      ring.scale.setScalar(0.9 + alert * 0.22 + Math.sin(time * 0.002 + index) * 0.025);
    });

    tripGlow.material.opacity = bell(local, 1.06, 0.42) * 0.52;
    tripLine.mesh.material.opacity = 0.28 + alert * 0.65;
    alertLabel.material.opacity = alert * (1 - restore) * 0.96;

    beacon.material.emissiveIntensity = alert * (2.6 + alarmPulse * 3.8);
    beaconLight.intensity = alert * (4.5 + alarmPulse * 4.0) * (1 - restore * 0.78);
    beaconLight.color.setHex(palette.red);
    lockRing.material.opacity = alert * (0.18 + alarmPulse * 0.22) * (1 - restore * 0.6);
    lockRing.scale.setScalar(0.75 + alert * 0.42 + Math.sin(time * 0.004) * 0.03);

    failedServer.root.position.z = failedServerBaseZ + service * 2.80;
    failedServer.root.position.y = failedServerBaseY + Math.sin(time * 0.0015) * 0.012;
    failedServer.root.rotation.x = service * -0.055;
    failedServer.root.rotation.y = service * 0.08;
    failedServer.chassis.material.emissive.setHex(restore > 0.72 ? palette.green : palette.red);
    failedServer.chassis.material.emissiveIntensity = service * (restore > 0.72 ? 0.55 : 0.78);

    cables.forEach((cable, index) => {
      cable.mesh.material.opacity = 0.08 + service * 0.28 + restore * (0.34 + index * 0.025);
      cable.mesh.material.emissiveIntensity = 0.16 + restore * 1.15;
      cable.mesh.scale.setScalar(1 + Math.sin(time * 0.0018 + index) * 0.012 * restore);
    });

    pduLeds.forEach((led, index) => {
      const pulse = 2.8 + Math.sin(time * 0.005 + led.userData.phase) * 1.1;
      led.material.emissiveIntensity = pulse + restore * 1.6;
      led.scale.setScalar(0.9 + Math.sin(time * 0.004 + index) * 0.13);
    });

    restoreLight.intensity = restore * (4.2 + Math.sin(time * 0.004) * 0.6);
    restoreLight.color.setHex(palette.green);
    scanPlane.position.y = -0.2 + ((time * 0.00028) % 1) * 4.2;
    scanPlane.material.opacity = service * (0.03 + restore * 0.17);
    restoreLabel.material.opacity = restore * 0.98;
    rack.root.rotation.y = -0.08 + Math.sin(time * 0.00025) * 0.045 + service * 0.05;
  };

  return root;
}

const networkScene = buildNetworkScene();
const linuxScene = buildLinuxScene();
const rackMotionScene = buildRackMotionScene();
const projectGroups = [networkScene, linuxScene, rackMotionScene];
world.add(...projectGroups);

const floor = new THREE.GridHelper(70, 70, palette.accent, palette.grid);
floor.position.y = -0.43;
floor.material.transparent = true;
floor.material.opacity = 0.20;
floor.material.depthWrite = false;
floor.material.userData.themeRole = 'grid';
themedMaterials.add(floor.material);
environmentRoot.add(floor);

const architectureGeometry = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.2, 1));
const architecture = new THREE.LineSegments(architectureGeometry, lineMaterial('accent', 0.13, THREE.AdditiveBlending));
architecture.position.set(0.7, 2.2, -5.8);
architecture.scale.set(1.6, 1.0, 1.2);
environmentRoot.add(architecture);

const secondArchitecture = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.8, 3.6, 4.2, 3, 3, 3)), lineMaterial('accent2', 0.07, THREE.AdditiveBlending));
secondArchitecture.position.set(-7.2, 1.2, -7.2);
secondArchitecture.rotation.set(0.2, 0.4, 0.1);
environmentRoot.add(secondArchitecture);

const ambientWash = makeGlowSprite('accent', 13, 0.14);
ambientWash.position.set(1.2, 1.0, -3.0);
environmentRoot.add(ambientWash);

const dustCount = finePointer.matches ? 620 : 300;
const dustRandom = seededRandom(0x2244aacc);
const dustPositions = new Float32Array(dustCount * 3);
const dustSeeds = [];
for (let index = 0; index < dustCount; index += 1) {
  dustPositions[index * 3] = (dustRandom() - 0.5) * 30;
  dustPositions[index * 3 + 1] = dustRandom() * 8.2 - 1.2;
  dustPositions[index * 3 + 2] = (dustRandom() - 0.5) * 18;
  dustSeeds.push({ speed: 0.025 + dustRandom() * 0.055, drift: dustRandom() * Math.PI * 2 });
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(dustGeometry, pointsMaterial('dust', finePointer.matches ? 0.026 : 0.038, paletteName === 'carbon' ? 0.66 : 0.26));
environmentRoot.add(dust);

scene.fog = new THREE.FogExp2(palette.fog, 0.031);

const hemisphere = new THREE.HemisphereLight(palette.white, palette.background, 0.72);
scene.add(hemisphere);
const keyLight = new THREE.DirectionalLight(0xffffff, 4.4);
keyLight.position.set(5.5, 9.5, 7.5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 36;
keyLight.shadow.camera.left = -9;
keyLight.shadow.camera.right = 9;
keyLight.shadow.camera.top = 9;
keyLight.shadow.camera.bottom = -9;
keyLight.shadow.bias = -0.0008;
scene.add(keyLight);
const fillLight = new THREE.PointLight(palette.accent2, 3.8, 24, 2);
fillLight.position.set(-5.0, 3.6, 4.8);
scene.add(fillLight);
const rimLight = new THREE.PointLight(palette.accent, 7.5, 28, 2);
rimLight.position.set(5.4, 4.8, -4.2);
scene.add(rimLight);
const floorLight = new THREE.PointLight(palette.accent, 2.6, 18, 2);
floorLight.position.set(0, -0.1, 3.2);
scene.add(floorLight);

function rebuildEnvironmentMap() {
  if (envTexture) envTexture.dispose();
  const cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 512;
  const context = cv.getContext('2d');
  const top = paletteName === 'carbon' ? '#090c14' : '#dfe4ef';
  const bottom = paletteName === 'carbon' ? '#1d2b55' : '#6689d9';
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.45, paletteName === 'carbon' ? '#11192a' : '#f4f5f8');
  gradient.addColorStop(1, bottom);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1024, 512);
  const glow = context.createRadialGradient(760, 180, 10, 760, 180, 360);
  glow.addColorStop(0, paletteName === 'carbon' ? 'rgba(90,130,255,0.95)' : 'rgba(68,106,220,0.85)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, 1024, 512);
  const texture = new THREE.CanvasTexture(cv);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  envTexture = pmrem.fromEquirectangular(texture).texture;
  texture.dispose();
  pmrem.dispose();
  scene.environment = envTexture;
}

function applyTheme() {
  paletteName = document.documentElement.dataset.theme === 'paper' ? 'paper' : 'carbon';
  palette = PALETTES[paletteName];
  themedMaterials.forEach((instance) => {
    const role = instance.userData.themeRole;
    if (role && palette[role] !== undefined && instance.color) instance.color.setHex(palette[role]);
    const emissiveRole = instance.userData.emissiveRole;
    if (instance.emissive && emissiveRole && palette[emissiveRole] !== undefined) instance.emissive.setHex(palette[emissiveRole]);
  });
  dynamicLights.forEach(({ light, role }) => light.color.setHex(palette[role]));
  scene.background = new THREE.Color(palette.background);
  scene.fog.color.setHex(palette.fog);
  renderer.setClearColor(palette.background, 1);
  renderer.toneMappingExposure = paletteName === 'carbon' ? 1.28 : 1.06;
  hemisphere.color.setHex(palette.white);
  hemisphere.groundColor.setHex(palette.background);
  fillLight.color.setHex(palette.accent2);
  rimLight.color.setHex(palette.accent);
  floorLight.color.setHex(palette.accent);
  ambientWash.material.color.setHex(palette.accent);
  dust.material.opacity = paletteName === 'carbon' ? 0.68 : 0.27;
  rebuildEnvironmentMap();
  sticky.style.setProperty('--scene-accent', `#${new THREE.Color(palette.accent).getHexString()}`);
}

applyTheme();

const panel = sticky.querySelector('[data-showcase-panel]');
const panelKicker = sticky.querySelector('[data-showcase-kicker]');
const panelTitle = sticky.querySelector('[data-showcase-title]');
const panelPhase = sticky.querySelector('[data-showcase-phase]');
const panelBody = sticky.querySelector('[data-showcase-body]');
const panelSpecs = sticky.querySelector('[data-showcase-specs]');
const panelDots = sticky.querySelector('[data-showcase-dots]');
const panelLink = sticky.querySelector('[data-showcase-link]');
const progressElement = sticky.querySelector('[data-showcase-progress]');
const stageButtons = Array.from(rail.querySelectorAll('[data-three-stage]'));
const pauseButton = chrome.querySelector('.showcase-3d-pause');

let targetStage = 0;
let displayStage = 0;
let activeStage = -1;
let paused = false;
let visible = false;
let frameId = 0;
let lastTime = performance.now();
let pointerX = 0;
let pointerY = 0;
let pointerTargetX = 0;
let pointerTargetY = 0;
let dragYaw = 0;
let dragPitch = 0;
let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragBaseYaw = 0;
let dragBasePitch = 0;
let scrollEnergy = 0;
let previousScrollY = window.scrollY;
let mobileLayout = false;
let snapTimer = 0;

function projectOffset(stage) {
  const first = smooth(2.06, 2.94, stage);
  const second = smooth(5.06, 5.94, stage);
  return first + second;
}

function localStage(stage, projectIndex) {
  return clamp(stage - projectIndex * 3, 0, 2);
}

function magnetizeStage(position) {
  const bounded = clamp(position, 0, STAGES - 1);
  if (bounded >= STAGES - 1) return STAGES - 1;
  const base = Math.floor(bounded);
  return base + smooth(0.04, 0.96, bounded - base);
}

function updatePanel(stageIndex) {
  if (stageIndex === activeStage) return;
  activeStage = stageIndex;
  const projectIndex = Math.floor(stageIndex / 3);
  const phaseIndex = stageIndex % 3;
  const project = projects[projectIndex] || projects[0];
  const phase = project.phases?.[phaseIndex] || PROJECT_DEFAULTS[projectIndex].phases[phaseIndex];
  const specRows = SCENE_SPECS[projectIndex];

  panelKicker.textContent = `FEATURED ${String(projectIndex + 1).padStart(2, '0')} · ${(project.type || 'Infrastructure').toUpperCase()}`;
  panelTitle.textContent = project.title;
  panelPhase.textContent = `${String(phaseIndex + 1).padStart(2, '0')} / 03 · ${(phase.title || '').replace(/[.]$/, '').toUpperCase()}`;
  panelBody.textContent = phase.body;
  panelLink.href = project.link || '#projects';
  panelLink.textContent = project.status === 'Placeholder' ? 'Open placeholder plan ↗' : 'Open project plan ↗';
  panelSpecs.innerHTML = specRows.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('');
  panelDots.innerHTML = Array.from({ length: STAGES }, (_, index) => `<i class="${index === stageIndex ? 'is-active' : ''}"></i>`).join('');

  panel.classList.remove('side-left', 'side-right', 'side-top', 'is-stage-changing');
  panel.classList.add(PANEL_PLACEMENTS[stageIndex]);
  void panel.offsetWidth;
  panel.classList.add('is-stage-changing');

  shotCaption.textContent = SHOT_CAPTIONS[stageIndex];
  shotCaption.classList.remove('is-changing');
  void shotCaption.offsetWidth;
  shotCaption.classList.add('is-changing');

  stageButtons.forEach((button, index) => {
    const selected = index === stageIndex;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-current', selected ? 'step' : 'false');
  });

  const accentRoles = ['accent', 'accent2', 'red'];
  sticky.style.setProperty('--scene-accent', `#${new THREE.Color(palette[accentRoles[projectIndex]]).getHexString()}`);
  sticky.dataset.scene = String(projectIndex + 1);
}

function updateTargetStage() {
  const rect = scrollHost.getBoundingClientRect();
  const travel = Math.max(1, scrollHost.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / travel, 0, 1);
  const rawStage = progress * (STAGES - 0.0001);
  targetStage = magnetizeStage(rawStage);
  progressElement.style.transform = `scaleX(${progress})`;

  const delta = window.scrollY - previousScrollY;
  previousScrollY = window.scrollY;
  scrollEnergy = clamp(scrollEnergy + delta * 0.0016, -1.4, 1.4);
  updatePanel(Math.round(targetStage));

  window.clearTimeout(snapTimer);
  if (!reduceMotion.matches && Math.abs(delta) < 140) {
    snapTimer = window.setTimeout(() => {
      if (!visible || dragging) return;
      const nearest = Math.round(targetStage);
      if (Math.abs(targetStage - nearest) < 0.18) return;
      const top = window.scrollY + scrollHost.getBoundingClientRect().top;
      window.scrollTo({ top: top + (nearest / (STAGES - 1)) * travel, behavior: 'smooth' });
    }, 160);
  }
}

function resize() {
  const rect = sticky.getBoundingClientRect();
  mobileLayout = rect.width < 780 || (rect.height > rect.width && rect.width < 1100);
  const dpr = Math.min(window.devicePixelRatio || 1, mobileLayout ? 1.45 : 2.0);
  renderer.setPixelRatio(dpr);
  renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
  keyLight.shadow.mapSize.set(mobileLayout ? 1024 : 2048, mobileLayout ? 1024 : 2048);
}

function updateDust(time) {
  const attribute = dustGeometry.attributes.position;
  for (let index = 0; index < dustCount; index += 1) {
    const xIndex = index * 3;
    const yIndex = xIndex + 1;
    let y = attribute.array[yIndex] + dustSeeds[index].speed * 0.007;
    if (y > 6.9) y = -1.2;
    attribute.array[yIndex] = y;
    attribute.array[xIndex] += Math.sin(time * 0.00008 + dustSeeds[index].drift) * 0.00035;
  }
  attribute.needsUpdate = true;
  dust.rotation.y = time * 0.000012;
}

const cameraPosition = new THREE.Vector3();
const cameraLook = new THREE.Vector3();
const cameraUp = new THREE.Vector3(0, 1, 0);

function updateCamera(stage, dt) {
  const bounded = clamp(stage, 0, STAGES - 1);
  const lower = Math.min(STAGES - 2, Math.floor(bounded));
  const fraction = smooth(0, 1, bounded - lower);
  const shotA = mobileLayout && MOBILE_SHOTS[lower] ? MOBILE_SHOTS[lower] : CAMERA_SHOTS[lower];
  const shotB = mobileLayout && MOBILE_SHOTS[lower + 1] ? MOBILE_SHOTS[lower + 1] : CAMERA_SHOTS[lower + 1];
  const position = lerpArray(shotA.position, shotB.position, fraction);
  const look = lerpArray(shotA.look, shotB.look, fraction);
  const fov = THREE.MathUtils.lerp(shotA.fov, shotB.fov, fraction);
  const roll = THREE.MathUtils.lerp(shotA.roll || 0, shotB.roll || 0, fraction);

  const parallaxScale = mobileLayout ? 0.14 : 0.30;
  cameraPosition.set(
    position[0] + pointerX * parallaxScale,
    position[1] - pointerY * parallaxScale * 0.45,
    position[2]
  );
  cameraLook.set(
    look[0] + pointerX * parallaxScale * 0.18,
    look[1] - pointerY * parallaxScale * 0.10,
    look[2]
  );

  camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraPosition.x, 5.5, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraPosition.y, 5.5, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraPosition.z, 5.5, dt);
  camera.fov = THREE.MathUtils.damp(camera.fov, fov, 5.5, dt);
  camera.updateProjectionMatrix();
  camera.up.copy(cameraUp).applyAxisAngle(new THREE.Vector3(0, 0, 1), roll + scrollEnergy * -0.012);
  camera.lookAt(cameraLook);
}

function render(time) {
  if (!visible || document.hidden) {
    frameId = 0;
    return;
  }

  const dt = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
  lastTime = time;

  if (!paused && !reduceMotion.matches) {
    displayStage = THREE.MathUtils.damp(displayStage, targetStage, 4.4, dt);
  } else {
    displayStage = targetStage;
  }

  const offset = projectOffset(displayStage);
  world.position.x = THREE.MathUtils.damp(world.position.x, -offset * SPREAD, 7.2, dt);
  scrollEnergy = THREE.MathUtils.damp(scrollEnergy, 0, 3.5, dt);
  pointerX = THREE.MathUtils.damp(pointerX, pointerTargetX, 5.8, dt);
  pointerY = THREE.MathUtils.damp(pointerY, pointerTargetY, 5.8, dt);

  world.rotation.set(0, 0, 0);

  updateCamera(displayStage, dt);

  projectGroups.forEach((group, index) => {
    const local = localStage(displayStage, index);
    const distance = Math.abs(offset - index);
    group.visible = distance < 1.20;
    group.userData.update?.(local, paused || reduceMotion.matches ? 0 : time, dt, distance < 0.58);
    group.position.y = Math.sin(time * 0.00031 + index * 1.8) * (paused || reduceMotion.matches ? 0 : 0.025);
    const orbitAmount = distance < 0.58 ? 1 : 0;
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, (dragYaw + pointerX * 0.035) * orbitAmount, 5.2, dt);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, (dragPitch + pointerY * 0.018) * orbitAmount, 5.2, dt);
  });

  architecture.rotation.x = time * 0.000035;
  architecture.rotation.y = time * 0.000055;
  secondArchitecture.rotation.y = -time * 0.000025;
  ambientWash.material.opacity = 0.10 + Math.sin(time * 0.0006) * 0.025;
  if (!paused && !reduceMotion.matches) updateDust(time);

  const activeProject = Math.round(offset);
  const incidentAmount = smooth(6.9, 7.8, displayStage);
  rimLight.color.setHex(activeProject === 2 ? palette.red : activeProject === 1 ? palette.accent2 : palette.accent);
  rimLight.intensity = 6.2 + incidentAmount * 4.0;
  fillLight.intensity = 3.4 + Math.sin(time * 0.0008) * 0.3;
  floorLight.intensity = 2.0 + Math.abs(scrollEnergy) * 1.4;

  renderer.render(scene, camera);
  frameId = requestAnimationFrame(render);
}

function startRendering() {
  if (frameId || !visible || document.hidden) return;
  lastTime = performance.now();
  frameId = requestAnimationFrame(render);
}

function stopRendering() {
  if (!frameId) return;
  cancelAnimationFrame(frameId);
  frameId = 0;
}

function setPaused(nextPaused) {
  paused = nextPaused;
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.textContent = paused ? 'RESUME 3D' : 'PAUSE 3D';
  sticky.classList.toggle('is-3d-paused', paused);
  if (!paused) startRendering();
}

pauseButton.addEventListener('click', () => setPaused(!paused));

stageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const stage = Number(button.dataset.threeStage || 0);
    const travel = Math.max(1, scrollHost.offsetHeight - innerHeight);
    const top = window.scrollY + scrollHost.getBoundingClientRect().top;
    window.scrollTo({ top: top + (stage / (STAGES - 1)) * travel, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
});

sticky.addEventListener('pointermove', (event) => {
  const rect = sticky.getBoundingClientRect();
  pointerTargetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
  pointerTargetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
  if (dragging) {
    dragYaw = clamp(dragBaseYaw + (event.clientX - dragStartX) * 0.0024, -0.28, 0.28);
    dragPitch = clamp(dragBasePitch + (event.clientY - dragStartY) * 0.0016, -0.13, 0.13);
  }
});

sticky.addEventListener('pointerleave', () => {
  pointerTargetX = 0;
  pointerTargetY = 0;
  dragging = false;
  sticky.classList.remove('is-dragging-3d');
});

sticky.addEventListener('pointerdown', (event) => {
  if (!finePointer.matches || event.button !== 0) return;
  if (event.target.closest('button, a, .showcase-panel')) return;
  dragging = true;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragBaseYaw = dragYaw;
  dragBasePitch = dragPitch;
  sticky.classList.add('is-dragging-3d');
});

sticky.addEventListener('dblclick', (event) => {
  if (event.target.closest('button, a, .showcase-panel')) return;
  dragYaw = 0;
  dragPitch = 0;
});

window.addEventListener('pointerup', () => {
  dragging = false;
  sticky.classList.remove('is-dragging-3d');
});

window.addEventListener('scroll', updateTargetStage, { passive: true });
window.addEventListener('resize', resize, { passive: true });
document.addEventListener('visibilitychange', () => document.hidden ? stopRendering() : startRendering());

const themeObserver = new MutationObserver(() => applyTheme());
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

const visibilityObserver = new IntersectionObserver((entries) => {
  visible = entries.some((entry) => entry.isIntersecting);
  if (visible) startRendering();
  else stopRendering();
}, { rootMargin: '70% 0px 70% 0px', threshold: 0.001 });
visibilityObserver.observe(sticky);

reduceMotion.addEventListener?.('change', () => {
  if (reduceMotion.matches) displayStage = targetStage;
  startRendering();
});

resize();
updateTargetStage();
updatePanel(0);
updateCamera(0, 1);
renderer.render(scene, camera);
sticky.classList.add('has-webgl-3d', 'has-cinematic-3d');
startRendering();
