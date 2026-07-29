import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const hero = document.querySelector('.hero');
if (!hero || !window.WebGLRenderingContext) {
  throw new Error('Hero 3D requires the portfolio hero and WebGL.');
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const canvas = document.createElement('canvas');
canvas.className = 'hero-3d-canvas';
canvas.dataset.hero3d = '';
canvas.setAttribute('aria-hidden', 'true');
hero.prepend(canvas);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });
} catch (error) {
  canvas.remove();
  throw error;
}

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const world = new THREE.Group();
const environment = new THREE.Group();
scene.add(environment, world);

const PALETTES = {
  carbon: {
    metal: 0x252d3b,
    metalDark: 0x101620,
    metalLight: 0x4a566e,
    panel: 0x1b2230,
    accent: 0x557cff,
    cyan: 0x3de6ff,
    violet: 0xa66cff,
    green: 0x69f0ad,
    amber: 0xffc85e,
    red: 0xff5f73,
    white: 0xf6f8ff,
    grid: 0x183469,
    pcb: 0x113925,
    gold: 0xd7b55d,
    fog: 0x080a10
  },
  paper: {
    metal: 0x454f60,
    metalDark: 0x202630,
    metalLight: 0x7a869b,
    panel: 0x313948,
    accent: 0x1c52df,
    cyan: 0x00a8cf,
    violet: 0x7b46d8,
    green: 0x2bcc7e,
    amber: 0xe8a72d,
    red: 0xe44b55,
    white: 0xffffff,
    grid: 0x8b99b7,
    pcb: 0x17462e,
    gold: 0xc9a54a,
    fog: 0xf6f5f1
  }
};

let paletteName = document.documentElement.dataset.theme === 'paper' ? 'paper' : 'carbon';
let palette = PALETTES[paletteName];
const themed = new Set();
const materialCache = new Map();
const textureCache = new Map();
const BOX = new THREE.BoxGeometry(1, 1, 1);
const SPHERE = new THREE.SphereGeometry(1, 18, 12);
const SMALL_SPHERE = new THREE.SphereGeometry(1, 10, 8);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smooth(start, end, value) {
  const t = clamp((value - start) / Math.max(0.0001, end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

function seededRandom(seed = 0x2a3c4d5e) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function material(role, options = {}) {
  const key = JSON.stringify({
    role,
    metalness: options.metalness ?? .62,
    roughness: options.roughness ?? .34,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
    emissiveRole: options.emissiveRole || '',
    emissiveIntensity: options.emissiveIntensity ?? 0,
    wireframe: Boolean(options.wireframe),
    side: options.side ?? THREE.FrontSide
  });

  if (options.shared !== false && materialCache.has(key)) return materialCache.get(key);

  const instance = new THREE.MeshStandardMaterial({
    color: palette[role] ?? palette.metal,
    metalness: options.metalness ?? .62,
    roughness: options.roughness ?? .34,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
    emissive: options.emissiveRole ? palette[options.emissiveRole] : 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    wireframe: Boolean(options.wireframe),
    side: options.side ?? THREE.FrontSide
  });
  instance.userData.themeRole = role;
  instance.userData.emissiveRole = options.emissiveRole || '';
  themed.add(instance);
  if (options.shared !== false) materialCache.set(key, instance);
  return instance;
}

function lineMaterial(role, opacity = 1) {
  const instance = new THREE.LineBasicMaterial({
    color: palette[role] ?? palette.accent,
    transparent: opacity < 1,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  instance.userData.themeRole = role;
  themed.add(instance);
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
  themed.add(instance);
  return instance;
}

function box(size, role, position = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(BOX, material(role, options));
  mesh.scale.set(size[0], size[1], size[2]);
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  return mesh;
}

function sphere(radius, role, position = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(options.small ? SMALL_SPHERE : SPHERE, material(role, options));
  mesh.scale.setScalar(radius);
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow !== false;
  return mesh;
}

function cylinder(radius, height, role, position = [0, 0, 0], rotation = [0, 0, 0], options = {}) {
  const geometry = new THREE.CylinderGeometry(radius, radius, 1, options.segments || 28);
  const mesh = new THREE.Mesh(geometry, material(role, options));
  mesh.scale.y = height;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  return mesh;
}

function makeRadialTexture(inner, outer) {
  const key = `${inner}|${outer}`;
  if (textureCache.has(key)) return textureCache.get(key);
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const context = cv.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

function glowSprite(role, scale = 2, opacity = .5) {
  const spriteMaterial = new THREE.SpriteMaterial({
    map: makeRadialTexture('rgba(255,255,255,.95)', 'rgba(255,255,255,0)'),
    color: palette[role],
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
  spriteMaterial.userData.themeRole = role;
  themed.add(spriteMaterial);
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.setScalar(scale);
  return sprite;
}

function textTexture(text, danger = false) {
  const key = `${danger ? 'danger' : 'normal'}|${text}`;
  if (textureCache.has(key)) return textureCache.get(key);
  const cv = document.createElement('canvas');
  cv.width = 768;
  cv.height = 160;
  const context = cv.getContext('2d');
  context.fillStyle = danger ? 'rgba(64,8,18,.90)' : 'rgba(5,9,17,.84)';
  context.fillRect(4, 4, 760, 152);
  context.strokeStyle = danger ? '#ff5f73' : 'rgba(156,185,255,.70)';
  context.lineWidth = 5;
  context.strokeRect(8, 8, 752, 144);
  context.fillStyle = '#f7f9ff';
  context.font = '700 44px JetBrains Mono, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 384, 82);
  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

function label(text, position, scale = [2.2, .45, 1], danger = false) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: textTexture(text, danger),
    transparent: true,
    opacity: .82,
    depthWrite: false,
    depthTest: false,
    toneMapped: false
  }));
  sprite.position.set(...position);
  sprite.scale.set(...scale);
  return sprite;
}

function curve(points, role, opacity = .45) {
  const path = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints(72));
  const line = new THREE.Line(geometry, lineMaterial(role, opacity));
  return { path, line };
}

function tube(points, radius, role, opacity = .7) {
  const path = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.TubeGeometry(path, 64, radius, 8, false);
  const mesh = new THREE.Mesh(geometry, material(role, {
    metalness: .05,
    roughness: .25,
    transparent: true,
    opacity,
    emissiveRole: role,
    emissiveIntensity: .8,
    shared: false
  }));
  return { path, mesh };
}

function led(role, radius = .028, phase = 0) {
  const light = sphere(radius, role, [0, 0, 0], {
    emissiveRole: role,
    emissiveIntensity: 4,
    metalness: .02,
    roughness: .15,
    small: true,
    shared: false
  });
  light.userData.phase = phase;
  return light;
}

function createServer(width = 2.9, height = .33, depth = 1.72, internal = false) {
  const root = new THREE.Group();
  const chassis = box([width, height, depth], 'metal', [0, 0, 0], { metalness: .82, roughness: .25, shared: false });
  const face = box([width * .96, height * .78, .055], 'metalDark', [0, 0, depth / 2 + .035], { metalness: .72, roughness: .30 });
  root.add(chassis, face);

  const ventMaterial = material('metalLight', { metalness: .78, roughness: .25 });
  for (let index = 0; index < 22; index += 1) {
    const vent = new THREE.Mesh(BOX, ventMaterial);
    vent.scale.set(.045, .085, .024);
    vent.position.set(-.82 + index * .078, 0, depth / 2 + .073);
    root.add(vent);
  }

  const driveMaterial = material('panel', { metalness: .7, roughness: .32 });
  for (let index = 0; index < 4; index += 1) {
    const drive = new THREE.Mesh(BOX, driveMaterial);
    drive.scale.set(.25, .18, .04);
    drive.position.set(.45 + index * .28, 0, depth / 2 + .076);
    root.add(drive);
  }

  for (let index = 0; index < 3; index += 1) {
    const status = led(index === 1 ? 'cyan' : 'green', .025, index * 1.4);
    status.position.set(1.05 + index * .09, .04, depth / 2 + .105);
    root.add(status);
  }

  const handles = [-1, 1].map((side) => {
    const handle = box([.09, height * .72, .13], 'metalLight', [side * (width / 2 + .08), 0, depth / 2 + .02], { metalness: .8, roughness: .2 });
    root.add(handle);
    return handle;
  });

  let internals = null;
  if (internal) {
    internals = createInternalAssembly(width * .82, depth * .78);
    internals.root.position.set(0, .17, .04);
    internals.root.visible = false;
    root.add(internals.root);
  }

  return { root, chassis, face, handles, internals, depth, height };
}

function createInternalAssembly(width = 2.35, depth = 1.25) {
  const root = new THREE.Group();
  const board = box([width, .07, depth], 'pcb', [0, 0, 0], { metalness: .18, roughness: .58 });
  root.add(board);

  const cpu = box([.52, .15, .52], 'gold', [.18, .16, .03], { metalness: .88, roughness: .18, shared: false });
  root.add(cpu);

  const ram = [];
  for (let index = 0; index < 6; index += 1) {
    const stick = box([.09, .47, .86], index % 2 ? 'cyan' : 'accent', [-.88 + index * .22, .28, -.05], {
      metalness: .24, roughness: .36, emissiveRole: index % 2 ? 'cyan' : 'accent', emissiveIntensity: .22, shared: false
    });
    root.add(stick);
    ram.push(stick);
  }

  const disks = [];
  for (let index = 0; index < 4; index += 1) {
    const disk = box([.48, .13, .68], 'metalLight', [.88, .12, -.42 + index * .28], { metalness: .82, roughness: .24, shared: false });
    root.add(disk);
    disks.push(disk);
  }

  const gpu = [];
  for (let index = 0; index < 2; index += 1) {
    const card = box([.18, .62, 1.0], 'panel', [-.25 + index * .42, .35, .18], {
      metalness: .55, roughness: .30, emissiveRole: index ? 'violet' : 'cyan', emissiveIntensity: .22, shared: false
    });
    root.add(card);
    gpu.push(card);
  }

  const fans = [];
  [-.65, 0, .65].forEach((x, fanIndex) => {
    const fanRoot = new THREE.Group();
    fanRoot.position.set(x, .34, -.52);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.19, .035, 8, 32), material('metalLight', { metalness: .72, roughness: .28 }));
    fanRoot.add(ring);
    for (let blade = 0; blade < 5; blade += 1) {
      const bladeMesh = box([.055, .30, .018], 'metalDark', [0, .15, 0], { metalness: .25, roughness: .55 });
      bladeMesh.rotation.z = blade * (Math.PI * 2 / 5);
      fanRoot.add(bladeMesh);
    }
    root.add(fanRoot);
    fans.push(fanRoot);
    fanRoot.userData.phase = fanIndex;
  });

  const power = box([.56, .40, .72], 'metalDark', [width / 2 - .38, .22, depth / 2 - .42], { metalness: .75, roughness: .28, shared: false });
  root.add(power);

  return { root, board, cpu, ram, disks, gpu, fans, power };
}

function createRack() {
  const root = new THREE.Group();
  const width = 3.8;
  const height = 4.8;
  const depth = 2.2;
  const frameMaterial = material('metalDark', { metalness: .92, roughness: .19 });
  const railMaterial = material('metalLight', { metalness: .86, roughness: .23 });

  [[-1,-1], [1,-1], [-1,1], [1,1]].forEach(([sx, sz]) => {
    const post = new THREE.Mesh(BOX, frameMaterial);
    post.scale.set(.12, height, .12);
    post.position.set(sx * width / 2, height / 2, sz * depth / 2);
    post.castShadow = true;
    root.add(post);
  });

  root.add(box([width + .16, .13, depth + .16], 'metalDark', [0, .02, 0], { metalness: .9, roughness: .2 }));
  root.add(box([width + .16, .13, depth + .16], 'metalDark', [0, height, 0], { metalness: .9, roughness: .2 }));

  for (let side = -1; side <= 1; side += 2) {
    const rail = new THREE.Mesh(BOX, railMaterial);
    rail.scale.set(.055, height - .45, .055);
    rail.position.set(side * (width / 2 - .22), height / 2, depth / 2 - .12);
    root.add(rail);
  }

  const servers = [];
  const units = 9;
  const spacing = .43;
  for (let index = 0; index < units; index += 1) {
    const server = createServer(width - .48, .31, depth - .34, index === 4);
    server.root.position.set(0, .45 + index * spacing, .02);
    root.add(server.root);
    servers.push(server);
  }

  const switchUnit = createServer(width - .48, .25, depth - .34, false);
  switchUnit.root.position.set(0, 4.23, .02);
  root.add(switchUnit.root);
  for (let index = 0; index < 16; index += 1) {
    const port = box([.085, .055, .03], index % 4 === 0 ? 'cyan' : 'metalLight', [-1.2 + index * .16, 0, depth / 2 - .05], {
      emissiveRole: index % 4 === 0 ? 'cyan' : '', emissiveIntensity: index % 4 === 0 ? 1.4 : 0
    });
    switchUnit.root.add(port);
  }

  const name = label('LAB-RACK-01', [0, height + .34, 0], [2.2, .43, 1]);
  root.add(name);

  return { root, servers, switchUnit, width, height, depth };
}

const rack = createRack();
rack.root.position.set(3.45, -.44, -.15);
rack.root.rotation.y = -.15;
world.add(rack.root);

const pulledServer = rack.servers[4];
const pulledBaseZ = pulledServer.root.position.z;
const cover = box([3.05, .055, 1.75], 'metalMid', [0, .25, 0], { metalness: .82, roughness: .22, shared: false });
cover.visible = false;
pulledServer.root.add(cover);

const internal = pulledServer.internals;
if (internal) internal.root.visible = true;

const coreSwitch = createServer(3.15, .27, 1.48, false);
coreSwitch.root.position.set(-1.0, .58, .25);
coreSwitch.root.rotation.y = .19;
world.add(coreSwitch.root);
world.add(label('CORE-SW-01', [-1.0, 1.04, .25], [1.8, .36, 1]));

const floor = new THREE.GridHelper(55, 55, palette.accent, palette.grid);
floor.position.y = -.45;
floor.material.transparent = true;
floor.material.opacity = .22;
floor.material.depthWrite = false;
floor.material.userData.themeRole = 'grid';
themed.add(floor.material);
environment.add(floor);

const platform = cylinder(4.7, .10, 'metalDark', [2.6, -.39, -.05], [0,0,0], { transparent: true, opacity: .82, segments: 72 });
world.add(platform);

const nodePositions = [
  [-4.6, -.22, 2.1], [-4.2, -.22, -.7], [-3.0, -.22, -2.8],
  [-.75, -.22, -3.35], [1.55, -.22, -2.9], [3.4, -.22, -1.6],
  [4.2, -.22, 1.55], [1.2, -.22, 3.2], [-2.1, -.22, 3.0]
];
const nodeRoles = ['accent','cyan','green','amber','violet','cyan','green','amber','accent'];
const nodes = [];
const packets = [];

nodePositions.forEach((position, index) => {
  const root = new THREE.Group();
  const base = cylinder(.32, .11, 'metalDark', position, [0,0,0], { metalness: .75, roughness: .30 });
  const point = sphere(.105, nodeRoles[index], [position[0], position[1] + .18, position[2]], {
    emissiveRole: nodeRoles[index], emissiveIntensity: 4, metalness: .02, roughness: .12, small: true, shared: false
  });
  const halo = glowSprite(nodeRoles[index], .85, .34);
  halo.position.set(position[0], position[1] + .2, position[2]);
  root.add(base, point, halo);
  world.add(root);

  const link = curve([
    [position[0], position[1] + .2, position[2]],
    [position[0] * .52, .75 + (index % 2) * .15, position[2] * .52],
    [-1.0, .72, .48]
  ], nodeRoles[index], .23);
  world.add(link.line);

  const packet = sphere(.052, nodeRoles[index], [0,0,0], {
    emissiveRole: nodeRoles[index], emissiveIntensity: 5, metalness: .01, roughness: .1, small: true, shared: false
  });
  world.add(packet);
  packets.push({ object: packet, path: link.path, offset: index / nodePositions.length, speed: .065 + index * .004 });
  nodes.push({ root, base, point, halo, line: link.line, basePosition: new THREE.Vector3(...position), phase: index * .73 });
});

const networkRings = ['accent','cyan','green','violet'].map((role, index) => {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.45 + index * .55, .018, 8, 96),
    material(role, { transparent: true, opacity: .22, emissiveRole: role, emissiveIntensity: 1.2, metalness: .04, roughness: .30, shared: false })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(-.8, -.32 + index * .007, .25);
  world.add(ring);
  return ring;
});

const cableA = tube([
  [3.1, .6, 1.12], [4.9, 1.1, 1.5], [5.6, 2.8, .5], [4.0, 4.15, -.8]
], .026, 'cyan', .34);
const cableB = tube([
  [2.65, 1.15, 1.12], [4.4, 1.75, 1.7], [5.0, 3.2, .2], [3.6, 4.25, -.8]
], .026, 'green', .34);
world.add(cableA.mesh, cableB.mesh);

const architecture = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(4.2, 1)),
  lineMaterial('accent', .08)
);
architecture.position.set(-1.0, 2.3, -6.8);
architecture.scale.set(1.5, 1.0, 1.2);
environment.add(architecture);

const architecture2 = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(6, 4, 5, 4, 3, 4)),
  lineMaterial('violet', .05)
);
architecture2.position.set(6.5, 2.0, -8.0);
architecture2.rotation.set(.2,.4,.1);
environment.add(architecture2);

const ambientGlow = glowSprite('accent', 15, .14);
ambientGlow.position.set(2.8, 1.2, -4.2);
environment.add(ambientGlow);

const labels = [
  label('VLAN 10 · OPS', [-4.3, .42, 2.2], [1.65,.33,1]),
  label('VLAN 20 · ENG', [-3.8, .42, -1.1], [1.65,.33,1]),
  label('VLAN 30 · GUEST', [1.25, .42, -3.05], [1.8,.33,1]),
  label('VLAN 99 · MGMT', [3.9, .42, 1.9], [1.8,.33,1])
];
labels.forEach((item) => world.add(item));

const dataCards = [];
[
  ['UPLINK · 10G', [-1.7,2.85,-1.2], 'cyan'],
  ['LATENCY · 1.2MS', [4.7,2.45,.8], 'green'],
  ['FAULT DOMAIN · LAB', [-3.55,1.95,1.05], 'violet']
].forEach(([text, position, role], index) => {
  const card = label(text, position, [2.1,.42,1], false);
  card.material.opacity = .5;
  card.userData.phase = index * 1.8;
  card.userData.role = role;
  world.add(card);
  dataCards.push(card);
});

const dustCount = finePointer.matches ? 540 : 260;
const random = seededRandom(0x7a9c3b2d);
const dustPositions = new Float32Array(dustCount * 3);
const dustSeeds = [];
for (let index = 0; index < dustCount; index += 1) {
  dustPositions[index * 3] = (random() - .5) * 26;
  dustPositions[index * 3 + 1] = random() * 7.5 - 1.0;
  dustPositions[index * 3 + 2] = (random() - .5) * 17;
  dustSeeds.push({ speed: .02 + random() * .055, phase: random() * Math.PI * 2 });
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(dustGeometry, pointsMaterial('accent', finePointer.matches ? .024 : .034, paletteName === 'carbon' ? .52 : .20));
environment.add(dust);

scene.fog = new THREE.FogExp2(palette.fog, .032);

const hemisphere = new THREE.HemisphereLight(palette.white, palette.fog, .8);
scene.add(hemisphere);
const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
keyLight.position.set(5.5, 10, 7.5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 34;
keyLight.shadow.camera.left = -9;
keyLight.shadow.camera.right = 9;
keyLight.shadow.camera.top = 9;
keyLight.shadow.camera.bottom = -9;
keyLight.shadow.bias = -.0007;
scene.add(keyLight);
const rimLight = new THREE.PointLight(palette.accent, 7.5, 26, 2);
rimLight.position.set(5.5, 4.4, -4.4);
scene.add(rimLight);
const fillLight = new THREE.PointLight(palette.cyan, 4.4, 22, 2);
fillLight.position.set(-5.5, 3.0, 4.5);
scene.add(fillLight);
const nodeLight = new THREE.PointLight(palette.violet, 2.4, 14, 2);
nodeLight.position.set(0, 1.4, 2.8);
scene.add(nodeLight);

function applyTheme() {
  paletteName = document.documentElement.dataset.theme === 'paper' ? 'paper' : 'carbon';
  palette = PALETTES[paletteName];

  themed.forEach((instance) => {
    const role = instance.userData.themeRole;
    if (role && palette[role] !== undefined && instance.color) instance.color.setHex(palette[role]);
    const emissiveRole = instance.userData.emissiveRole;
    if (instance.emissive && emissiveRole && palette[emissiveRole] !== undefined) instance.emissive.setHex(palette[emissiveRole]);
  });

  scene.fog.color.setHex(palette.fog);
  hemisphere.color.setHex(palette.white);
  hemisphere.groundColor.setHex(palette.fog);
  rimLight.color.setHex(palette.accent);
  fillLight.color.setHex(palette.cyan);
  nodeLight.color.setHex(palette.violet);
  dust.material.opacity = paletteName === 'carbon' ? .55 : .20;
  renderer.toneMappingExposure = paletteName === 'carbon' ? 1.22 : 1.02;
}

const themeObserver = new MutationObserver(applyTheme);
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
applyTheme();

let paused = false;
let explodeTarget = 0;
let explodeAmount = 0;
let visible = false;
let frame = 0;
let lastTime = performance.now();
let pointerTargetX = 0;
let pointerTargetY = 0;
let pointerX = 0;
let pointerY = 0;
let dragYaw = 0;
let dragPitch = 0;
let dragStartX = 0;
let dragStartY = 0;
let dragBaseYaw = 0;
let dragBasePitch = 0;
let dragging = false;
let scrollProgress = 0;

function resize() {
  const rect = hero.getBoundingClientRect();
  const mobile = rect.width < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.fov = mobile ? 48 : 38;
  camera.updateProjectionMatrix();
  world.scale.setScalar(mobile ? .62 : rect.width < 1080 ? .80 : 1);
}

function updateScroll() {
  const rect = hero.getBoundingClientRect();
  scrollProgress = clamp(-rect.top / Math.max(1, hero.offsetHeight), 0, 1);
}

function updateExplosion(dt, time) {
  explodeAmount = THREE.MathUtils.damp(explodeAmount, explodeTarget, 5.5, dt);
  const serverSlide = .35 + explodeAmount * 2.95 + scrollProgress * .35;
  pulledServer.root.position.z = pulledBaseZ + serverSlide;
  pulledServer.root.rotation.x = -explodeAmount * .035;
  pulledServer.root.rotation.y = explodeAmount * .06;

  cover.visible = explodeAmount > .015;
  cover.position.y = .25 + explodeAmount * 1.25;
  cover.position.z = -explodeAmount * .50;
  cover.rotation.x = explodeAmount * -.18;
  cover.rotation.z = explodeAmount * .06;

  if (!internal) return;
  internal.root.visible = explodeAmount > .01;
  internal.root.position.y = .17 + explodeAmount * .35;
  internal.root.scale.setScalar(.15 + explodeAmount * .85);
  internal.root.rotation.y = time * .00008 * explodeAmount;

  internal.ram.forEach((stick, index) => {
    stick.position.y = .28 + explodeAmount * (.2 + index * .075);
    stick.position.x = -.88 + index * .22 + explodeAmount * (index - 2.5) * .055;
    stick.rotation.z = explodeAmount * (index - 2.5) * .08;
  });
  internal.disks.forEach((disk, index) => {
    disk.position.x = .88 + explodeAmount * (.24 + index * .12);
    disk.position.y = .12 + explodeAmount * index * .08;
    disk.rotation.y = explodeAmount * index * .08;
  });
  internal.gpu.forEach((card, index) => {
    card.position.z = .18 + explodeAmount * (.40 + index * .25);
    card.position.y = .35 + explodeAmount * (.18 + index * .12);
    card.rotation.x = explodeAmount * (index ? -.10 : .10);
  });
  internal.fans.forEach((fan, index) => {
    fan.rotation.z = time * (.0022 + index * .00022);
    fan.position.z = -.52 - explodeAmount * (.32 + index * .08);
  });
  internal.cpu.position.y = .16 + explodeAmount * .48;
  internal.power.position.x = (internal.board.scale.x / 2) + explodeAmount * .35;
}

function updateScene(time, dt) {
  updateExplosion(dt, time);

  rack.root.position.y = -.44 + Math.sin(time * .00065) * .022;
  rack.root.rotation.y = -.15 + Math.sin(time * .00016) * .035;
  architecture.rotation.y = time * .000035;
  architecture.rotation.x = .15 + Math.sin(time * .00010) * .06;
  architecture2.rotation.y = .4 - time * .000025;

  coreSwitch.root.position.z = .25 + Math.sin(time * .0005) * .05;
  coreSwitch.root.rotation.x = Math.sin(time * .00035) * .018;

  networkRings.forEach((ring, index) => {
    ring.rotation.z = time * (.00008 + index * .00002) * (index % 2 ? -1 : 1);
    ring.scale.setScalar(1 + Math.sin(time * .0008 + index) * .008);
    ring.material.opacity = .10 + .16 * (1 - scrollProgress) + .06 * Math.sin(time * .0005 + index);
  });

  packets.forEach((entry, index) => {
    const p = (time * entry.speed * .001 + entry.offset) % 1;
    entry.object.position.copy(entry.path.getPoint(p));
    entry.object.scale.setScalar(.8 + Math.sin(time * .004 + index) * .14);
    entry.object.material.emissiveIntensity = 4.2 + Math.sin(time * .005 + index) * 1.3;
  });

  nodes.forEach((entry, index) => {
    const lift = Math.sin(time * .0013 + entry.phase) * .035;
    entry.root.position.y = lift;
    entry.point.scale.setScalar(1 + Math.sin(time * .003 + entry.phase) * .18);
    entry.halo.material.opacity = .18 + Math.sin(time * .0018 + entry.phase) * .08;
  });

  dataCards.forEach((card, index) => {
    card.position.y += Math.sin(time * .0009 + card.userData.phase) * .0006;
    card.material.opacity = .42 + Math.sin(time * .0014 + index) * .12;
  });

  cableA.mesh.material.emissiveIntensity = .5 + Math.sin(time * .002) * .25;
  cableB.mesh.material.emissiveIntensity = .5 + Math.sin(time * .0022 + 1.4) * .25;

  const dustAttribute = dustGeometry.attributes.position;
  for (let index = 0; index < dustCount; index += 1) {
    const yIndex = index * 3 + 1;
    let y = dustAttribute.array[yIndex] + dustSeeds[index].speed * .004;
    if (y > 6.4) y = -1.0;
    dustAttribute.array[yIndex] = y;
  }
  dustAttribute.needsUpdate = true;
  dust.rotation.y = time * .000012;
}

function render(time) {
  if (!visible || document.hidden) {
    frame = 0;
    return;
  }

  const dt = Math.min(.05, Math.max(.001, (time - lastTime) / 1000));
  lastTime = time;

  pointerX = THREE.MathUtils.damp(pointerX, pointerTargetX, 5.0, dt);
  pointerY = THREE.MathUtils.damp(pointerY, pointerTargetY, 5.0, dt);

  if (!paused && !reduceMotion.matches) updateScene(time, dt);
  else updateExplosion(dt, time);

  const mobile = innerWidth < 760;
  const baseX = mobile ? .2 : -1.45;
  const baseY = mobile ? 1.95 : 2.0;
  const baseZ = mobile ? 15.0 : 12.6;
  camera.position.x = THREE.MathUtils.damp(camera.position.x, baseX + pointerX * .58 + dragYaw * .75, 4.5, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, baseY - pointerY * .32 + scrollProgress * .65 + dragPitch * .45, 4.5, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, baseZ - explodeAmount * .75 + scrollProgress * .7, 4.5, dt);
  camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, pointerX * -.009, 4, dt);
  camera.lookAt(mobile ? .8 : .9, .95 + explodeAmount * .25, .05);

  world.rotation.y = THREE.MathUtils.damp(world.rotation.y, pointerX * .035 + dragYaw * .22, 4.5, dt);
  world.rotation.x = THREE.MathUtils.damp(world.rotation.x, pointerY * .015 + dragPitch * .12, 4.5, dt);

  rimLight.intensity = 6.4 + Math.sin(time * .0015) * .8;
  fillLight.intensity = 3.8 + Math.sin(time * .0012 + 1.1) * .5;
  nodeLight.intensity = 2.0 + explodeAmount * 2.5;

  renderer.render(scene, camera);
  frame = requestAnimationFrame(render);
}

function start() {
  if (frame || !visible || document.hidden) return;
  lastTime = performance.now();
  frame = requestAnimationFrame(render);
}

function stop() {
  if (!frame) return;
  cancelAnimationFrame(frame);
  frame = 0;
}

hero.addEventListener('pointermove', (event) => {
  const rect = hero.getBoundingClientRect();
  pointerTargetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
  pointerTargetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
  if (dragging) {
    dragYaw = dragBaseYaw + (event.clientX - dragStartX) * .004;
    dragPitch = clamp(dragBasePitch + (event.clientY - dragStartY) * .003, -.32, .32);
  }
}, { passive: true });

hero.addEventListener('pointerleave', () => {
  pointerTargetX = 0;
  pointerTargetY = 0;
  dragging = false;
});

hero.addEventListener('pointerdown', (event) => {
  if (!finePointer.matches || event.button !== 0 || event.target.closest('button,a,.template-notice,.hero-foot,.kpi-strip')) return;
  dragging = true;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragBaseYaw = dragYaw;
  dragBasePitch = dragPitch;
});

addEventListener('pointerup', () => { dragging = false; });
addEventListener('resize', resize, { passive: true });
addEventListener('scroll', updateScroll, { passive: true });
document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

window.addEventListener('future:hero-explode', (event) => {
  explodeTarget = event.detail?.active ? 1 : 0;
  start();
});
window.addEventListener('future:hero-pause', (event) => {
  paused = Boolean(event.detail?.paused);
  start();
});
window.addEventListener('future:hero-reset', () => {
  dragYaw = 0;
  dragPitch = 0;
  pointerTargetX = 0;
  pointerTargetY = 0;
  explodeTarget = 0;
  start();
});

const visibilityObserver = new IntersectionObserver((entries) => {
  visible = entries.some((entry) => entry.isIntersecting);
  if (visible) start();
  else stop();
}, { rootMargin: '40% 0px 40% 0px', threshold: .001 });
visibilityObserver.observe(hero);

resize();
updateScroll();
camera.position.set(-1.45, 2.0, 12.6);
renderer.render(scene, camera);
hero.classList.add('has-future-3d');
start();
