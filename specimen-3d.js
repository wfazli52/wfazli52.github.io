import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const scrollHost = document.querySelector('[data-showcase-scroll]');
const sticky = scrollHost?.querySelector('.showcase-sticky');
const fallbackCanvas = sticky?.querySelector('[data-showcase-canvas]');

if (!scrollHost || !sticky || !fallbackCanvas || !window.WebGLRenderingContext) {
  throw new Error('The 3D showcase requires its showcase container and WebGL.');
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const projectData = (window.PORTFOLIO_SPECIMEN?.projects || []).slice(0, 3);
const projectDefaults = [
  {
    number: '01', title: 'Enterprise VLAN & Routing Lab', type: 'Networking',
    link: 'projects/enterprise-network.html', metrics: { scope: '4 VLANs', evidence: '0 / 7', phase: 'Design' },
    phases: [
      { title: 'Map the network.', body: 'Create the requirements, subnet plan, device names, VLAN boundaries, and physical and logical topology.' },
      { title: 'Make traffic move.', body: 'Configure switching, trunks, gateways, routing, DHCP, DNS, and an access-control policy.' },
      { title: 'Prove the result.', body: 'Run acceptance tests, inject controlled faults, and publish only sanitized evidence.' }
    ]
  },
  {
    number: '02', title: 'Linux Server Operations Lab', type: 'Systems',
    link: 'projects/linux-monitoring.html', metrics: { scope: '2 servers', evidence: '0 / 7', phase: 'Plan' },
    phases: [
      { title: 'Build the hosts.', body: 'Define compute, storage, naming, users, SSH, firewall rules, patching, and the normal baseline.' },
      { title: 'Open the chassis.', body: 'Inspect services, storage, logs, processes, and the components behind the operating system.' },
      { title: 'Recover on purpose.', body: 'Introduce safe failures, restore service, and document the validation path.' }
    ]
  },
  {
    number: '03', title: 'Rack, Cabling & Incident Operations', type: 'Data center',
    link: 'projects/rack-inventory.html', metrics: { scope: '1 rack', evidence: '0 / 7', phase: 'Plan' },
    phases: [
      { title: 'Lay out the rack.', body: 'Place compute, switching, patching, and power with readable rack units and labels.' },
      { title: 'Pull the failed node.', body: 'Trace dependencies, isolate equipment, and model a controlled replacement.' },
      { title: 'Restore every path.', body: 'Validate power, cabling, management, inventory, and the final service handoff.' }
    ]
  }
];
const projects = projectDefaults.map((fallback, index) => ({ ...fallback, ...(projectData[index] || {}) }));

const canvas = document.createElement('canvas');
canvas.className = 'showcase-webgl';
canvas.dataset.showcaseWebgl = '';
canvas.setAttribute('aria-hidden', 'true');
sticky.insertBefore(canvas, fallbackCanvas.nextSibling);

const chrome = document.createElement('div');
chrome.className = 'showcase-3d-chrome mono';
chrome.innerHTML = `
  <div class="showcase-3d-badge"><i></i><span>WEBGL 3D · LIVE</span></div>
  <button class="showcase-3d-pause" type="button" aria-pressed="false">PAUSE 3D</button>
`;
sticky.appendChild(chrome);

const rail = document.createElement('div');
rail.className = 'showcase-stage-rail mono';
rail.setAttribute('aria-label', 'Jump to a 3D showcase stage');
rail.innerHTML = Array.from({ length: 9 }, (_, index) => `<button type="button" data-three-stage="${index}" aria-label="Open showcase stage ${index + 1}">${String(index + 1).padStart(2, '0')}</button>`).join('');
sticky.appendChild(rail);

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
  chrome.remove();
  rail.remove();
  throw error;
}

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
camera.position.set(0, 2.75, 10.4);

const world = new THREE.Group();
scene.add(world);

const PALETTES = {
  paper: {
    background: 0xf6f5f1,
    surface: 0xd9dce3,
    surfaceDark: 0x69717e,
    frame: 0x202630,
    accent: 0x1c52df,
    cyan: 0x00a7c4,
    green: 0x1da76b,
    amber: 0xe3a321,
    red: 0xdb3c30,
    text: 0x11131a,
    grid: 0x98a2b3,
    dust: 0x1c52df
  },
  carbon: {
    background: 0x111216,
    surface: 0x26303d,
    surfaceDark: 0x0d1219,
    frame: 0xd7deea,
    accent: 0x6e9bff,
    cyan: 0x4fe4ff,
    green: 0x66f0a9,
    amber: 0xffcc66,
    red: 0xff6b62,
    text: 0xf3f5f8,
    grid: 0x5c6f88,
    dust: 0x6e9bff
  }
};

let paletteName = document.documentElement.dataset.theme === 'carbon' ? 'carbon' : 'paper';
let palette = PALETTES[paletteName];
const themedMaterials = [];

function makeMaterial(role, options = {}) {
  const material = new THREE.MeshStandardMaterial({
    color: palette[role] ?? palette.surface,
    metalness: options.metalness ?? 0.5,
    roughness: options.roughness ?? 0.4,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.FrontSide,
    emissive: options.emissiveRole ? palette[options.emissiveRole] : 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0
  });
  material.userData.themeRole = role;
  material.userData.emissiveRole = options.emissiveRole || '';
  themedMaterials.push(material);
  return material;
}

function makeLineMaterial(role, opacity = 1) {
  const material = new THREE.LineBasicMaterial({
    color: palette[role] ?? palette.accent,
    transparent: opacity < 1,
    opacity
  });
  material.userData.themeRole = role;
  themedMaterials.push(material);
  return material;
}

function makePointsMaterial(role, size, opacity = 1) {
  const material = new THREE.PointsMaterial({
    color: palette[role] ?? palette.accent,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  material.userData.themeRole = role;
  themedMaterials.push(material);
  return material;
}

function applyTheme() {
  paletteName = document.documentElement.dataset.theme === 'carbon' ? 'carbon' : 'paper';
  palette = PALETTES[paletteName];
  themedMaterials.forEach((material) => {
    const role = material.userData.themeRole;
    if (role && palette[role] !== undefined) material.color.setHex(palette[role]);
    const emissiveRole = material.userData.emissiveRole;
    if (material.emissive && emissiveRole && palette[emissiveRole] !== undefined) material.emissive.setHex(palette[emissiveRole]);
  });
  renderer.toneMappingExposure = paletteName === 'carbon' ? 1.3 : 1.05;
  scene.fog.color.setHex(palette.background);
  sticky.style.setProperty('--scene-accent', `#${new THREE.Color(palette.accent).getHexString()}`);
}

function box(width, height, depth, material, position = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(radius, height, material, position = [0, 0, 0], rotation = [0, 0, 0], segments = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createCurve(points, role = 'accent', opacity = 0.7) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
  const line = new THREE.Line(geometry, makeLineMaterial(role, opacity));
  return { curve, line };
}

function createTube(points, radius, role, opacity = 1) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const geometry = new THREE.TubeGeometry(curve, 44, radius, 8, false);
  const material = makeMaterial(role, {
    metalness: 0.1,
    roughness: 0.25,
    transparent: opacity < 1,
    opacity,
    emissiveRole: role,
    emissiveIntensity: 0.18
  });
  const mesh = new THREE.Mesh(geometry, material);
  return { curve, mesh };
}

function createLed(role = 'green', radius = 0.035) {
  const material = makeMaterial(role, {
    metalness: 0.05,
    roughness: 0.25,
    emissiveRole: role,
    emissiveIntensity: 3.5
  });
  const led = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), material);
  led.userData.baseIntensity = 3.5;
  return led;
}

function createServerUnit(width = 2.55, role = 'surface') {
  const group = new THREE.Group();
  const chassis = box(width, 0.32, 1.55, makeMaterial(role, { metalness: 0.75, roughness: 0.28 }));
  group.add(chassis);
  const face = box(width * 0.96, 0.25, 0.045, makeMaterial('surfaceDark', { metalness: 0.65, roughness: 0.35 }), [0, 0, 0.795]);
  group.add(face);
  const ventMaterial = makeMaterial('frame', { metalness: 0.7, roughness: 0.28 });
  for (let index = 0; index < 18; index += 1) {
    const vent = box(0.055, 0.09, 0.025, ventMaterial, [-0.78 + index * 0.09, 0, 0.825]);
    group.add(vent);
  }
  for (let index = 0; index < 3; index += 1) {
    const led = createLed(index === 1 ? 'cyan' : 'green', 0.028);
    led.position.set(0.85 + index * 0.11, 0, 0.84);
    led.userData.phase = index * 1.8;
    group.add(led);
  }
  return group;
}

function createRack(unitCount = 8) {
  const rack = new THREE.Group();
  const frameMaterial = makeMaterial('frame', { metalness: 0.85, roughness: 0.23 });
  const postPositions = [
    [-1.65, 1.45, -0.9], [1.65, 1.45, -0.9], [-1.65, 1.45, 0.9], [1.65, 1.45, 0.9]
  ];
  postPositions.forEach((position) => rack.add(box(0.1, 3.2, 0.1, frameMaterial, position)));
  rack.add(box(3.4, 0.11, 1.9, frameMaterial, [0, 3.02, 0]));
  rack.add(box(3.4, 0.11, 1.9, frameMaterial, [0, -0.12, 0]));
  const servers = [];
  for (let index = 0; index < unitCount; index += 1) {
    const server = createServerUnit(2.9, index === 1 ? 'surfaceDark' : 'surface');
    server.position.set(0, 0.13 + index * 0.36, 0);
    rack.add(server);
    servers.push(server);
  }
  return { rack, servers };
}

function buildNetworkScene() {
  const group = new THREE.Group();
  const platform = cylinder(3.8, 0.12, makeMaterial('surfaceDark', { metalness: 0.55, roughness: 0.5, transparent: true, opacity: 0.78 }), [0, -0.35, 0], [0, 0, 0], 72);
  group.add(platform);

  const core = createRack(5);
  core.rack.scale.setScalar(0.72);
  core.rack.position.set(0, -0.18, 0);
  group.add(core.rack);

  const nodePositions = [
    [-3.1, 0.15, 0.2], [-2.2, 0.1, -2.2], [-0.9, 0.08, -3.2],
    [1.6, 0.12, -2.8], [3.15, 0.14, -0.8], [2.9, 0.1, 1.75],
    [0.85, 0.08, 3.05], [-1.8, 0.1, 2.55]
  ];
  const nodeRoles = ['accent', 'cyan', 'green', 'amber', 'accent', 'cyan', 'green', 'amber'];
  const nodes = [];
  const packets = [];

  nodePositions.forEach((position, index) => {
    const node = new THREE.Group();
    const base = cylinder(0.32, 0.11, makeMaterial('surfaceDark', { metalness: 0.65, roughness: 0.35 }), position, [0, 0, 0], 32);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), makeMaterial(nodeRoles[index], {
      metalness: 0.08,
      roughness: 0.25,
      emissiveRole: nodeRoles[index],
      emissiveIntensity: 2.5
    }));
    glow.position.set(position[0], position[1] + 0.18, position[2]);
    node.add(base, glow);
    group.add(node);
    nodes.push({ node, glow, base, basePosition: new THREE.Vector3(...position), phase: index * 0.7 });

    const curveInfo = createCurve([
      [position[0], position[1] + 0.18, position[2]],
      [position[0] * 0.55, 0.75 + (index % 2) * 0.15, position[2] * 0.55],
      [0, 1.0, 0.8]
    ], nodeRoles[index], 0.34);
    group.add(curveInfo.line);

    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), makeMaterial(nodeRoles[index], {
      metalness: 0.05,
      roughness: 0.15,
      emissiveRole: nodeRoles[index],
      emissiveIntensity: 4
    }));
    group.add(packet);
    packets.push({ mesh: packet, curve: curveInfo.curve, offset: index / nodePositions.length, speed: 0.055 + index * 0.003 });
  });

  const vlanRings = ['accent', 'cyan', 'green', 'amber'].map((role, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.25 + index * 0.48, 0.018, 8, 96),
      makeMaterial(role, { metalness: 0.05, roughness: 0.25, transparent: true, opacity: 0.38, emissiveRole: role, emissiveIntensity: 1.4 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.25 + index * 0.012;
    group.add(ring);
    return ring;
  });

  const aclGate = new THREE.Group();
  const gatePlane = box(0.08, 1.8, 2.6, makeMaterial('amber', { transparent: true, opacity: 0.18, emissiveRole: 'amber', emissiveIntensity: 0.6 }), [1.5, 0.7, 0]);
  const gateFrame = box(0.12, 2.0, 2.82, makeMaterial('amber', { metalness: 0.45, roughness: 0.3, transparent: true, opacity: 0.28 }), [1.5, 0.7, 0]);
  aclGate.add(gateFrame, gatePlane);
  aclGate.visible = false;
  group.add(aclGate);

  group.userData.update = (localStage, time, dt, active) => {
    const overview = THREE.MathUtils.smoothstep(localStage, 0, 0.85);
    const traffic = THREE.MathUtils.smoothstep(localStage, 1.05, 1.95);
    core.rack.rotation.y = Math.sin(time * 0.00032) * 0.08 + overview * 0.08;
    core.rack.position.y = -0.18 + Math.sin(time * 0.0012) * 0.025;
    core.rack.scale.setScalar(THREE.MathUtils.lerp(0.72, 0.88, THREE.MathUtils.smoothstep(localStage, 0.6, 1.35)));

    nodes.forEach((entry, index) => {
      const radial = 1 + overview * 0.07;
      entry.node.position.y = Math.sin(time * 0.0014 + entry.phase) * 0.035;
      entry.glow.scale.setScalar(1 + Math.sin(time * 0.003 + entry.phase) * 0.16);
      entry.node.visible = active || localStage < 2.4;
      entry.glow.position.x = entry.basePosition.x * radial;
      entry.glow.position.z = entry.basePosition.z * radial;
      entry.base.position.x = entry.basePosition.x * radial;
      entry.base.position.z = entry.basePosition.z * radial;
    });

    vlanRings.forEach((ring, index) => {
      ring.material.opacity = 0.08 + traffic * (0.28 + index * 0.035);
      ring.rotation.z = time * (0.00008 + index * 0.000015) * (index % 2 ? -1 : 1);
      ring.scale.setScalar(0.9 + traffic * 0.12 + Math.sin(time * 0.0008 + index) * 0.008);
    });

    packets.forEach((entry, index) => {
      entry.mesh.visible = traffic > 0.02;
      const progress = (time * entry.speed * 0.001 + entry.offset) % 1;
      entry.mesh.position.copy(entry.curve.getPoint(progress));
      entry.mesh.scale.setScalar(0.7 + traffic * 0.8 + Math.sin(time * 0.004 + index) * 0.12);
    });

    aclGate.visible = traffic > 0.18;
    aclGate.position.y = THREE.MathUtils.lerp(-1.7, 0, traffic);
    aclGate.rotation.y = Math.sin(time * 0.0006) * 0.08;
    gatePlane.material.opacity = 0.08 + traffic * 0.16;
  };

  return group;
}

function buildLinuxScene() {
  const group = new THREE.Group();
  group.position.x = 12;

  const platform = cylinder(3.65, 0.12, makeMaterial('surfaceDark', { metalness: 0.55, roughness: 0.5, transparent: true, opacity: 0.78 }), [0, -0.35, 0], [0, 0, 0], 72);
  group.add(platform);

  const leftServer = createServerUnit(2.8, 'surface');
  const rightServer = createServerUnit(2.8, 'surface');
  leftServer.rotation.x = Math.PI / 2;
  rightServer.rotation.x = Math.PI / 2;
  leftServer.rotation.z = Math.PI / 2;
  rightServer.rotation.z = Math.PI / 2;
  leftServer.position.set(-1.05, 1.12, 0);
  rightServer.position.set(1.05, 1.12, 0);
  leftServer.scale.set(1.35, 1.35, 1.35);
  rightServer.scale.set(1.35, 1.35, 1.35);
  group.add(leftServer, rightServer);

  const componentRoot = new THREE.Group();
  componentRoot.position.set(0, 0.7, 0.35);
  group.add(componentRoot);

  const board = box(2.15, 0.08, 1.55, makeMaterial('surfaceDark', { metalness: 0.25, roughness: 0.55 }), [0, 0, 0]);
  componentRoot.add(board);
  const cpu = box(0.55, 0.14, 0.55, makeMaterial('frame', { metalness: 0.8, roughness: 0.22 }), [0.15, 0.14, 0]);
  componentRoot.add(cpu);
  const ram = [];
  for (let index = 0; index < 4; index += 1) {
    const stick = box(0.12, 0.5, 0.92, makeMaterial(index % 2 ? 'cyan' : 'accent', { metalness: 0.25, roughness: 0.4, emissiveRole: index % 2 ? 'cyan' : 'accent', emissiveIntensity: 0.25 }), [-0.82 + index * 0.25, 0.28, 0]);
    componentRoot.add(stick);
    ram.push(stick);
  }
  const disks = [];
  for (let index = 0; index < 4; index += 1) {
    const disk = box(0.62, 0.12, 0.86, makeMaterial('surface', { metalness: 0.75, roughness: 0.28 }), [0.9, 0.12, -0.48 + index * 0.32]);
    componentRoot.add(disk);
    disks.push(disk);
  }

  const fans = [];
  const fanMaterial = makeMaterial('surfaceDark', { metalness: 0.3, roughness: 0.55 });
  [-0.75, 0, 0.75].forEach((x) => {
    const fanGroup = new THREE.Group();
    fanGroup.position.set(x, 1.05, -0.92);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 10, 36), makeMaterial('frame', { metalness: 0.7, roughness: 0.3 }));
    fanGroup.add(ring);
    for (let blade = 0; blade < 5; blade += 1) {
      const bladeMesh = box(0.08, 0.38, 0.025, fanMaterial, [0, 0.18, 0]);
      bladeMesh.rotation.z = blade * (Math.PI * 2 / 5);
      fanGroup.add(bladeMesh);
    }
    group.add(fanGroup);
    fans.push(fanGroup);
  });

  const monitorRings = ['green', 'cyan', 'accent'].map((role, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35 + index * 0.38, 0.025, 8, 96), makeMaterial(role, { transparent: true, opacity: 0.34, emissiveRole: role, emissiveIntensity: 1.4 }));
    ring.rotation.x = Math.PI / 2.4 + index * 0.1;
    ring.rotation.y = index * 0.4;
    ring.position.y = 0.75;
    group.add(ring);
    return ring;
  });

  const logCount = 90;
  const logPositions = new Float32Array(logCount * 3);
  const logSeeds = [];
  for (let index = 0; index < logCount; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.7 + Math.random() * 2.0;
    logPositions[index * 3] = Math.cos(angle) * radius;
    logPositions[index * 3 + 1] = Math.random() * 3.1 - 0.1;
    logPositions[index * 3 + 2] = Math.sin(angle) * radius;
    logSeeds.push({ angle, radius, speed: 0.18 + Math.random() * 0.25, offset: Math.random() * 3.2 });
  }
  const logGeometry = new THREE.BufferGeometry();
  logGeometry.setAttribute('position', new THREE.BufferAttribute(logPositions, 3));
  const logPoints = new THREE.Points(logGeometry, makePointsMaterial('green', 0.055, 0));
  group.add(logPoints);

  group.userData.update = (localStage, time) => {
    const open = THREE.MathUtils.smoothstep(localStage, 0.6, 1.3);
    const monitor = THREE.MathUtils.smoothstep(localStage, 1.15, 1.95);
    leftServer.position.x = THREE.MathUtils.lerp(-1.05, -2.15, open);
    rightServer.position.x = THREE.MathUtils.lerp(1.05, 2.15, open);
    leftServer.rotation.y = open * -0.2 + Math.sin(time * 0.00035) * 0.035;
    rightServer.rotation.y = open * 0.2 - Math.sin(time * 0.00035) * 0.035;
    componentRoot.position.y = THREE.MathUtils.lerp(0.25, 1.0, open);
    componentRoot.rotation.y = time * 0.00022;
    componentRoot.scale.setScalar(0.2 + open * 0.9);
    componentRoot.visible = open > 0.03;

    ram.forEach((stick, index) => {
      stick.position.y = 0.28 + open * (0.22 + index * 0.08);
      stick.rotation.z = open * (index - 1.5) * 0.09;
    });
    disks.forEach((disk, index) => {
      disk.position.x = 0.9 + open * (0.22 + index * 0.12);
      disk.position.y = 0.12 + open * index * 0.08;
      disk.rotation.y = open * index * 0.08;
    });
    fans.forEach((fan, index) => {
      fan.rotation.z = time * (0.0022 + index * 0.00025);
      fan.position.z = THREE.MathUtils.lerp(-0.92, -1.45, open);
    });

    monitorRings.forEach((ring, index) => {
      ring.material.opacity = monitor * (0.22 + index * 0.06);
      ring.rotation.z = time * (0.00018 + index * 0.00004) * (index % 2 ? -1 : 1);
      ring.scale.setScalar(0.9 + monitor * 0.16 + Math.sin(time * 0.001 + index) * 0.012);
    });

    logPoints.material.opacity = monitor * 0.75;
    const attribute = logGeometry.attributes.position;
    for (let index = 0; index < logCount; index += 1) {
      const seed = logSeeds[index];
      const y = ((time * 0.001 * seed.speed + seed.offset) % 3.2) - 0.1;
      attribute.setXYZ(index, Math.cos(seed.angle + time * 0.00005) * seed.radius, y, Math.sin(seed.angle + time * 0.00005) * seed.radius);
    }
    attribute.needsUpdate = true;
  };

  return group;
}

function buildRackScene() {
  const group = new THREE.Group();
  group.position.x = 24;

  const platform = cylinder(3.75, 0.12, makeMaterial('surfaceDark', { metalness: 0.55, roughness: 0.5, transparent: true, opacity: 0.78 }), [0, -0.35, 0], [0, 0, 0], 72);
  group.add(platform);

  const rackData = createRack(8);
  rackData.rack.position.set(0, -0.1, 0);
  rackData.rack.scale.setScalar(0.92);
  group.add(rackData.rack);

  const pduMaterial = makeMaterial('surfaceDark', { metalness: 0.65, roughness: 0.35 });
  const pduA = box(0.14, 3.0, 0.12, pduMaterial, [-1.9, 1.45, -0.82]);
  const pduB = box(0.14, 3.0, 0.12, pduMaterial, [1.9, 1.45, -0.82]);
  group.add(pduA, pduB);
  const pduLeds = [];
  for (let index = 0; index < 10; index += 1) {
    [-1.9, 1.9].forEach((x, side) => {
      const led = createLed(side ? 'cyan' : 'green', 0.026);
      led.position.set(x, 0.15 + index * 0.29, -0.74);
      led.userData.phase = index * 0.45 + side;
      group.add(led);
      pduLeds.push(led);
    });
  }

  const cableData = [];
  const cableRoles = ['accent', 'cyan', 'green', 'amber', 'accent', 'cyan'];
  for (let index = 0; index < 6; index += 1) {
    const side = index % 2 ? 1 : -1;
    const y = 0.35 + index * 0.42;
    const tube = createTube([
      [side * 1.25, y, -0.85],
      [side * (2.2 + index * 0.06), y + 0.15, -1.25],
      [side * 2.05, 2.75 - index * 0.18, -0.35]
    ], 0.025, cableRoles[index], 0.32);
    group.add(tube.mesh);
    cableData.push(tube);
  }

  const failedServer = rackData.servers[4];
  const replacementGlow = new THREE.PointLight(palette.green, 0, 4.5, 2);
  replacementGlow.position.set(0, 1.55, 2.0);
  group.add(replacementGlow);

  const scanPlane = box(3.35, 0.035, 1.95, makeMaterial('cyan', { transparent: true, opacity: 0.1, emissiveRole: 'cyan', emissiveIntensity: 1.2 }), [0, 0, 0]);
  group.add(scanPlane);

  group.userData.update = (localStage, time) => {
    const service = THREE.MathUtils.smoothstep(localStage, 0.55, 1.25);
    const restore = THREE.MathUtils.smoothstep(localStage, 1.1, 1.95);
    rackData.rack.rotation.y = Math.sin(time * 0.00028) * 0.065 + THREE.MathUtils.lerp(-0.08, 0.08, service);
    failedServer.position.z = service * 2.45;
    failedServer.rotation.x = service * -0.055;
    failedServer.rotation.y = service * 0.08;
    failedServer.children[0].material.emissive.setHex(restore > 0.75 ? palette.green : palette.red);
    failedServer.children[0].material.emissiveIntensity = service * (restore > 0.75 ? 0.32 : 0.48);

    cableData.forEach((tube, index) => {
      tube.mesh.material.opacity = 0.08 + restore * (0.42 + index * 0.035);
      tube.mesh.material.emissiveIntensity = 0.1 + restore * 1.05;
      tube.mesh.scale.setScalar(1 + Math.sin(time * 0.0016 + index) * 0.012 * restore);
    });
    pduLeds.forEach((led, index) => {
      const pulse = 2.4 + Math.sin(time * 0.004 + led.userData.phase) * 1.25;
      led.material.emissiveIntensity = pulse + restore * 1.2;
      led.scale.setScalar(0.9 + Math.sin(time * 0.004 + index) * 0.15);
    });
    replacementGlow.intensity = restore * (2.1 + Math.sin(time * 0.004) * 0.45);
    replacementGlow.color.setHex(palette.green);
    scanPlane.position.y = -0.05 + ((time * 0.00022) % 1) * 3.0;
    scanPlane.material.opacity = 0.025 + restore * 0.14;
  };

  return group;
}

const networkScene = buildNetworkScene();
const linuxScene = buildLinuxScene();
const rackScene = buildRackScene();
const projectGroups = [networkScene, linuxScene, rackScene];
world.add(...projectGroups);

scene.fog = new THREE.FogExp2(palette.background, 0.028);

const hemisphere = new THREE.HemisphereLight(palette.text, palette.background, 1.1);
scene.add(hemisphere);
const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(5, 9, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 28;
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
scene.add(keyLight);
const rimLight = new THREE.PointLight(palette.accent, 5, 22, 2);
rimLight.position.set(-4, 4, 4);
scene.add(rimLight);
const coolLight = new THREE.PointLight(palette.cyan, 4.2, 18, 2);
coolLight.position.set(5, 2.5, -3);
scene.add(coolLight);

const floor = new THREE.GridHelper(50, 50, palette.accent, palette.grid);
floor.position.y = -0.42;
floor.material.transparent = true;
floor.material.opacity = 0.12;
floor.material.depthWrite = false;
floor.material.userData.themeRole = 'grid';
themedMaterials.push(floor.material);
world.add(floor);

const dustCount = finePointer.matches ? 550 : 260;
const dustPositions = new Float32Array(dustCount * 3);
const dustSeeds = [];
for (let index = 0; index < dustCount; index += 1) {
  dustPositions[index * 3] = Math.random() * 38 - 7;
  dustPositions[index * 3 + 1] = Math.random() * 7 - 1.3;
  dustPositions[index * 3 + 2] = Math.random() * 15 - 7.5;
  dustSeeds.push({ speed: 0.03 + Math.random() * 0.06, drift: Math.random() * Math.PI * 2 });
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(dustGeometry, makePointsMaterial('dust', finePointer.matches ? 0.022 : 0.032, paletteName === 'carbon' ? 0.55 : 0.25));
world.add(dust);

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
let stageVelocity = 0;
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

function projectOffset(stage) {
  if (stage < 2) return 0;
  if (stage < 3) return smoothstep(2, 3, stage);
  if (stage < 5) return 1;
  if (stage < 6) return 1 + smoothstep(5, 6, stage);
  return 2;
}

function localStage(stage, projectIndex) {
  return clamp(stage - projectIndex * 3, 0, 2);
}

function updatePanel(stageIndex) {
  if (stageIndex === activeStage) return;
  activeStage = stageIndex;
  const projectIndex = Math.floor(stageIndex / 3);
  const phaseIndex = stageIndex % 3;
  const project = projects[projectIndex] || projects[0];
  const phase = project.phases?.[phaseIndex] || projectDefaults[projectIndex].phases[phaseIndex];

  panelKicker.textContent = `FEATURED ${String(projectIndex + 1).padStart(2, '0')} · ${(project.type || 'Infrastructure').toUpperCase()}`;
  panelTitle.textContent = project.title;
  panelPhase.textContent = `${String(phaseIndex + 1).padStart(2, '0')} / 03 · ${(phase.title || '').replace(/[.]$/, '').toUpperCase()}`;
  panelBody.textContent = phase.body;
  panelLink.href = project.link || '#projects';
  panelLink.textContent = project.status === 'Placeholder' ? 'Open placeholder plan ↗' : 'Open project plan ↗';

  const metrics = project.metrics || {};
  panelSpecs.innerHTML = Object.entries(metrics).map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('');
  panelDots.innerHTML = Array.from({ length: 9 }, (_, index) => `<i class="${index === stageIndex ? 'is-active' : ''}"></i>`).join('');
  panel.classList.toggle('side-right', projectIndex === 1);
  panel.classList.toggle('side-top', projectIndex === 2 && phaseIndex === 2);
  panel.classList.remove('is-stage-changing');
  void panel.offsetWidth;
  panel.classList.add('is-stage-changing');

  stageButtons.forEach((button, index) => {
    const selected = index === stageIndex;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-current', selected ? 'step' : 'false');
  });

  const accentRoles = ['accent', 'cyan', 'green'];
  sticky.style.setProperty('--scene-accent', `#${new THREE.Color(palette[accentRoles[projectIndex]]).getHexString()}`);
}

function updateTargetStage() {
  const rect = scrollHost.getBoundingClientRect();
  const travel = Math.max(1, scrollHost.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / travel, 0, 1);
  const rawStage = progress * 8;
  targetStage = clamp(Math.round(rawStage), 0, 8);
  progressElement.style.transform = `scaleX(${progress})`;

  const delta = window.scrollY - previousScrollY;
  previousScrollY = window.scrollY;
  scrollEnergy = clamp(scrollEnergy + delta * 0.0012, -1.2, 1.2);
  updatePanel(targetStage);
}

function resize() {
  const rect = sticky.getBoundingClientRect();
  const mobile = rect.width < 760;
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.8);
  renderer.setPixelRatio(dpr);
  renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.fov = mobile ? 49 : 36;
  camera.updateProjectionMatrix();
  world.scale.setScalar(mobile ? 0.78 : rect.width < 1080 ? 0.9 : 1);
}

function updateParticles(time) {
  const attribute = dustGeometry.attributes.position;
  for (let index = 0; index < dustCount; index += 1) {
    const yIndex = index * 3 + 1;
    let y = attribute.array[yIndex];
    y += dustSeeds[index].speed * 0.006;
    if (y > 5.8) y = -1.3;
    attribute.array[yIndex] = y;
  }
  attribute.needsUpdate = true;
  dust.rotation.y = time * 0.000015;
}

function render(time) {
  if (!visible || document.hidden) {
    frameId = 0;
    return;
  }

  const dt = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
  lastTime = time;

  if (!paused && !reduceMotion.matches) {
    const stiffness = 24;
    const damping = 7.4;
    stageVelocity += (targetStage - displayStage) * stiffness * dt;
    stageVelocity *= Math.exp(-damping * dt);
    displayStage += stageVelocity * dt;
    displayStage = clamp(displayStage, -0.08, 8.08);
  } else {
    displayStage = targetStage;
    stageVelocity = 0;
  }

  const offset = projectOffset(displayStage);
  world.position.x = THREE.MathUtils.damp(world.position.x, -offset * 12, 8, dt);
  scrollEnergy = THREE.MathUtils.damp(scrollEnergy, 0, 3.2, dt);

  pointerX = THREE.MathUtils.damp(pointerX, pointerTargetX, 5.5, dt);
  pointerY = THREE.MathUtils.damp(pointerY, pointerTargetY, 5.5, dt);
  const autoYaw = paused || reduceMotion.matches ? 0 : Math.sin(time * 0.00016) * 0.045;
  world.rotation.y = THREE.MathUtils.damp(world.rotation.y, autoYaw + pointerX * 0.12 + dragYaw + scrollEnergy * 0.05, 5, dt);
  world.rotation.x = THREE.MathUtils.damp(world.rotation.x, pointerY * 0.045 + dragPitch, 5, dt);
  world.rotation.z = THREE.MathUtils.damp(world.rotation.z, scrollEnergy * -0.018, 4, dt);

  const stageWave = Math.sin(displayStage * Math.PI) * 0.22;
  camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.75 + stageWave + pointerY * 0.25, 5, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, (innerWidth < 760 ? 11.9 : 10.4) - Math.abs(stageWave) * 0.35, 5, dt);
  camera.position.x = THREE.MathUtils.damp(camera.position.x, pointerX * 0.35, 5, dt);
  camera.lookAt(0, 1.15, 0);

  projectGroups.forEach((group, index) => {
    const local = localStage(displayStage, index);
    const distance = Math.abs(offset - index);
    group.visible = distance < 1.25;
    group.userData.update?.(local, paused || reduceMotion.matches ? 0 : time, dt, distance < 0.55);
    group.position.y = Math.sin(time * 0.00035 + index * 1.7) * (paused || reduceMotion.matches ? 0 : 0.035);
  });

  if (!paused && !reduceMotion.matches) updateParticles(time);
  rimLight.color.setHex(palette.accent);
  coolLight.color.setHex(palette.cyan);
  hemisphere.color.setHex(palette.text);
  hemisphere.groundColor.setHex(palette.background);

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
    window.scrollTo({ top: top + (stage / 8) * travel, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
});

sticky.addEventListener('pointermove', (event) => {
  const rect = sticky.getBoundingClientRect();
  pointerTargetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
  pointerTargetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
  if (dragging) {
    dragYaw = dragBaseYaw + (event.clientX - dragStartX) * 0.0035;
    dragPitch = clamp(dragBasePitch + (event.clientY - dragStartY) * 0.002, -0.18, 0.18);
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
}, { rootMargin: '80% 0px 80% 0px', threshold: 0.001 });
visibilityObserver.observe(sticky);

reduceMotion.addEventListener?.('change', () => {
  if (reduceMotion.matches) {
    displayStage = targetStage;
    stageVelocity = 0;
  }
  startRendering();
});

resize();
updateTargetStage();
updatePanel(0);
renderer.render(scene, camera);
sticky.classList.add('has-webgl-3d');
startRendering();
