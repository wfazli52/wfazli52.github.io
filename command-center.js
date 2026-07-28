(() => {
  'use strict';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const deviceCatalog = {
    internet: {
      type: 'WAN handoff', name: 'INTERNET',
      role: 'External documentation network used as the simulated upstream destination.',
      address: '203.0.113.10', rack: 'External handoff'
    },
    edge: {
      type: 'Edge router', name: 'EDGE-RTR-01',
      role: 'Terminates the WAN test link and forwards traffic toward the lab core.',
      address: '10.99.0.1', rack: 'RACK-A · U40'
    },
    core: {
      type: 'L3 switch', name: 'CORE-SW-01',
      role: 'Routes lab VLANs and provides the default gateways for simulated client networks.',
      address: '10.99.0.2', rack: 'RACK-A · U38'
    },
    access: {
      type: 'Access switch', name: 'ACCESS-SW-01',
      role: 'Connects the engineering workstation and carries tagged VLAN traffic to the core.',
      address: '10.99.0.12', rack: 'RACK-A · U36'
    },
    client: {
      type: 'Engineering client', name: 'ENG-WS-04',
      role: 'Simulated endpoint used for DHCP, VLAN, DNS, and application-connectivity tests.',
      address: '10.20.0.54', rack: 'Desk port · A-204'
    },
    dns: {
      type: 'DNS server', name: 'DNS-SRV-01',
      role: 'Resolves app.lab to the training application server address.',
      address: '10.30.0.10', rack: 'RACK-A · U24'
    },
    web: {
      type: 'Linux application', name: 'APP-SRV-01',
      role: 'Hosts the simulated internal application and its Nginx service.',
      address: '10.30.0.20', rack: 'RACK-A · U28'
    },
    monitor: {
      type: 'Monitoring server', name: 'MON-SRV-01',
      role: 'Collects training telemetry and raises controlled incident alerts.',
      address: '10.40.0.15', rack: 'RACK-A · U20'
    }
  };

  const rackCatalog = {
    patch: {
      type: 'Passive patching', name: 'PATCH-01', role: 'Maps labeled workstation and server drops to access-switch ports.',
      position: 'U42', power: 'Passive', ports: '14 patched / 24', topology: 'access'
    },
    core: {
      type: 'L3 switch', name: 'CORE-SW-01', role: 'Routes the training VLANs and aggregates access and server links.',
      position: 'U38', power: 'A+B feeds', ports: '12 active / 24', topology: 'core'
    },
    access: {
      type: 'Access switch', name: 'ACCESS-SW-01', role: 'Provides endpoint access ports and the tagged uplink to the core.',
      position: 'U36', power: 'Feed A', ports: '8 active / 24', topology: 'access'
    },
    web: {
      type: '1U Linux server', name: 'APP-SRV-01', role: 'Hosts the simulated app.lab service for validation and incident drills.',
      position: 'U28', power: 'A+B feeds', ports: '2 active / 4', topology: 'web'
    },
    dns: {
      type: '1U Linux server', name: 'DNS-SRV-01', role: 'Provides the simulated authoritative DNS zone for app.lab.',
      position: 'U24', power: 'A+B feeds', ports: '2 active / 4', topology: 'dns'
    },
    monitor: {
      type: '1U monitoring server', name: 'MON-SRV-01', role: 'Collects health checks and timestamps controlled alerts.',
      position: 'U20', power: 'Feed B', ports: '2 active / 4', topology: 'monitor'
    },
    pdu: {
      type: 'Vertical power', name: 'PDU-A / PDU-B', role: 'Represents redundant rack power feeds and labeled outlets.',
      position: 'Rear rails', power: '208 V simulated', ports: '10 outlets mapped', topology: null
    }
  };

  const incidents = {
    baseline: {
      id: 'BASELINE', severity: 'NOMINAL', title: 'All simulated systems operational',
      summary: 'Traffic is flowing across every training path. Select an incident to begin a controlled troubleshooting exercise.',
      symptoms: ['No active alerts.', 'All eight simulated devices report online.', 'Packet paths are passing telemetry.'],
      objective: 'Inspect the topology or rack, then inject one of the four training incidents.',
      status: 'Baseline telemetry nominal', health: '8 devices online', rackHealth: '7 devices · nominal',
      devices: {}, links: {}, racks: {}, blockedPackets: [],
      terminalIntro: 'Baseline loaded. Type help to list the simulated diagnostic commands.'
    },
    vlan: {
      id: 'INC-2041', severity: 'P2 · NETWORK', title: 'Engineering client placed in the wrong VLAN',
      summary: 'ENG-WS-04 lost access after a desk move. Link lights are green, but the endpoint cannot reach its expected gateway.',
      symptoms: ['ENG-WS-04 receives an address from the Operations scope.', 'The access port is physically connected.', 'Other Engineering clients remain healthy.'],
      objective: 'Use endpoint addressing and switch-port evidence to identify the logical access-layer mismatch.',
      status: 'INC-2041 active · client isolated', health: '6 online · 2 degraded', rackHealth: 'ACCESS-SW-01 degraded',
      devices: { access: 'warning', client: 'fault' }, links: { 'access-client': 'warning' }, racks: { access: 'warning' }, blockedPackets: ['access-client'],
      resolution: 'Moved Gi1/0/6 from VLAN 10 to VLAN 20, renewed the client lease, and verified gateway, DNS, and application reachability.',
      terminalIntro: 'ALERT INC-2041: ENG-WS-04 cannot reach 10.20.0.1 after a desk-port change.'
    },
    dns: {
      id: 'INC-3118', severity: 'P2 · SERVICE', title: 'Internal DNS service unavailable',
      summary: 'Users can reach the application by IP address, but app.lab no longer resolves.',
      symptoms: ['Ping to 10.30.0.20 succeeds.', 'nslookup app.lab returns a timeout.', 'The DNS service health check is critical.'],
      objective: 'Separate basic IP connectivity from name-resolution failure, then recover the DNS service.',
      status: 'INC-3118 active · DNS critical', health: '7 online · 1 service fault', rackHealth: 'DNS-SRV-01 critical',
      devices: { dns: 'fault', web: 'warning' }, links: { 'core-dns': 'warning' }, racks: { dns: 'fault' }, blockedPackets: ['core-dns'],
      resolution: 'Corrected the training zone-file error, restarted the DNS service, and validated forward lookup plus application access by name.',
      terminalIntro: 'ALERT INC-3118: app.lab lookups are failing while 10.30.0.20 remains reachable.'
    },
    uplink: {
      id: 'INC-4276', severity: 'P1 · NETWORK', title: 'Access-switch uplink administratively down',
      summary: 'The Engineering access segment disappeared after a controlled maintenance change.',
      symptoms: ['ACCESS-SW-01 is unreachable from the core.', 'All clients behind the access switch are offline.', 'Core and server VLANs remain healthy.'],
      objective: 'Follow the path from endpoint toward the core and identify the failed uplink state.',
      status: 'INC-4276 active · access segment down', health: '6 online · 2 offline', rackHealth: 'ACCESS-SW-01 offline',
      devices: { access: 'offline', client: 'offline', core: 'warning' }, links: { 'core-access': 'down', 'access-client': 'down' }, racks: { access: 'offline' }, blockedPackets: ['core-access', 'access-client'],
      resolution: 'Restored the Gi1/0/24 uplink with an approved no-shutdown change, confirmed trunk state, and reran endpoint connectivity tests.',
      terminalIntro: 'CRITICAL INC-4276: Engineering access segment stopped reporting after maintenance.'
    },
    disk: {
      id: 'INC-5384', severity: 'P2 · LINUX', title: 'Application server disk pressure stopped Nginx',
      summary: 'APP-SRV-01 responds to ICMP, but the application service is unavailable.',
      symptoms: ['Ping to APP-SRV-01 succeeds.', 'HTTPS connection is refused.', 'Root filesystem utilization is critical.'],
      objective: 'Use host and service evidence to distinguish server reachability from application availability.',
      status: 'INC-5384 active · app service failed', health: '7 online · 1 service fault', rackHealth: 'APP-SRV-01 critical',
      devices: { web: 'fault' }, links: { 'dns-web': 'warning' }, racks: { web: 'fault' }, blockedPackets: [],
      resolution: 'Removed generated lab logs, restored safe free space, restarted Nginx, and validated HTTP plus monitoring checks.',
      terminalIntro: 'ALERT INC-5384: APP-SRV-01 answers ping, but the app.lab health check is failing.'
    }
  };

  const tourSteps = [
    {
      selector: '#top', kicker: 'Career direction', title: 'Built for infrastructure work',
      description: 'The opening establishes the target role, current degree path, and proof-first approach without exaggerating experience.'
    },
    {
      selector: '#command-center .command-center-shell', kicker: 'Interactive proof', title: 'A working command-center simulation',
      description: 'Recruiters can inject four controlled incidents, inspect packet flow and rack states, and use the terminal to follow a troubleshooting path.'
    },
    {
      selector: '#projects', kicker: 'Hands-on roadmap', title: 'Four labs create one career story',
      description: 'Networking, Linux operations, incident response, and rack documentation are arranged as a practical progression instead of disconnected buzzwords.'
    },
    {
      selector: '#skills', kicker: 'Trust signal', title: 'Skill levels stay honest',
      description: 'Every capability is labeled as practicing, planned, or template-ready so the portfolio remains credible during technical interviews.'
    },
    {
      selector: '#roadmap', kicker: 'Execution plan', title: 'A 90-day build sequence',
      description: 'The roadmap turns the career goal into weekly deliverables, troubleshooting exercises, documentation, interview practice, and applications.'
    },
    {
      selector: '#contact', kicker: 'Call to action', title: 'The evidence leads to the next conversation',
      description: 'The final section routes visitors to GitHub, the resume, and future professional contact details once they are ready to be public.'
    }
  ];

  const state = {
    activeIncident: 'baseline', resolved: false, incidentStartedAt: 0, resolvedElapsed: 0,
    selectedDevice: 'core', selectedRack: 'core', operationsOpen: false, previousFocus: null,
    history: [], historyIndex: 0, tourOpen: false, tourIndex: 0, tourPreviousFocus: null,
    effectsPaused: motionQuery.matches
  };

  const elements = {};
  let clockTimer = 0;
  let tourPositionFrame = 0;

  function closeSiteMenu() {
    const menu = document.querySelector('[data-menu]');
    const button = document.querySelector('[data-menu-button]');
    menu?.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
  }

  function queryElements() {
    elements.shell = document.querySelector('[data-command-center]');
    elements.topology = document.querySelector('[data-topology]');
    elements.nodes = Array.from(document.querySelectorAll('[data-device]'));
    elements.links = Array.from(document.querySelectorAll('[data-link]'));
    elements.packets = Array.from(document.querySelectorAll('[data-packet-route]'));
    elements.rackUnits = Array.from(document.querySelectorAll('[data-rack-device]'));
    elements.incidentTabs = Array.from(document.querySelectorAll('[data-incident]'));
    elements.status = document.querySelector('[data-incident-status]');
    elements.health = document.querySelector('[data-topology-health]');
    elements.rackLoad = document.querySelector('[data-rack-load]');
    elements.clock = document.querySelector('[data-simulation-clock]');
    elements.terminalOutput = document.querySelector('[data-sim-terminal-output]');
    elements.terminalForm = document.querySelector('[data-sim-terminal-form]');
    elements.terminalInput = document.querySelector('[data-sim-terminal-input]');
    elements.applyFix = document.querySelector('[data-apply-fix]');
    elements.resolutionPanel = document.querySelector('[data-resolution-panel]');
    elements.resolutionText = document.querySelector('[data-resolution-text]');
    elements.tourLayer = document.querySelector('[data-tour-layer]');
    elements.tourSpotlight = document.querySelector('[data-tour-spotlight]');
    elements.tourCard = document.querySelector('[data-tour-card]');
  }

  function statusLabel(status) {
    return ({ warning: 'Degraded', fault: 'Fault', offline: 'Offline' })[status] || 'Online';
  }

  function currentEntityStatus(id, group = 'devices') {
    if (state.activeIncident === 'baseline' || state.resolved) return 'online';
    return incidents[state.activeIncident][group]?.[id] || 'online';
  }

  function clearVisualStates() {
    elements.nodes.forEach((node) => node.classList.remove('is-warning', 'is-fault', 'is-offline'));
    elements.links.forEach((link) => link.classList.remove('is-warning', 'is-down'));
    elements.packets.forEach((packet) => packet.classList.remove('is-blocked'));
    elements.rackUnits.forEach((unit) => unit.classList.remove('is-warning', 'is-fault', 'is-offline'));
  }

  function applyIncidentVisuals() {
    const incident = incidents[state.activeIncident];
    clearVisualStates();
    elements.shell.classList.toggle('is-resolved', state.resolved && state.activeIncident !== 'baseline');

    if (!state.resolved && state.activeIncident !== 'baseline') {
      Object.entries(incident.devices).forEach(([id, condition]) => {
        document.querySelector(`[data-device="${id}"]`)?.classList.add(`is-${condition}`);
      });
      Object.entries(incident.links).forEach(([id, condition]) => {
        document.querySelector(`[data-link="${id}"]`)?.classList.add(condition === 'down' ? 'is-down' : 'is-warning');
      });
      Object.entries(incident.racks).forEach(([id, condition]) => {
        document.querySelector(`[data-rack-device="${id}"]`)?.classList.add(`is-${condition}`);
      });
      incident.blockedPackets.forEach((id) => {
        document.querySelector(`[data-packet-route="${id}"]`)?.classList.add('is-blocked');
      });
    }

    elements.nodes.forEach((node) => {
      const id = node.dataset.device;
      const condition = currentEntityStatus(id);
      const device = deviceCatalog[id];
      node.setAttribute('aria-label', `${device?.name || id}, ${statusLabel(condition)}`);
    });

    const active = state.activeIncident !== 'baseline';
    const prefix = state.resolved && active ? `${incident.id} resolved` : incident.status;
    if (elements.status) elements.status.textContent = prefix;
    if (elements.health) elements.health.textContent = state.resolved && active ? '8 devices online · recovery verified' : incident.health;
    if (elements.rackLoad) elements.rackLoad.textContent = state.resolved && active ? '7 devices · nominal' : incident.rackHealth;

    updateDeviceInspector(state.selectedDevice);
    updateRackInspector(state.selectedRack);
  }

  function updateIncidentBrief() {
    const incident = incidents[state.activeIncident];
    const setText = (selector, value) => {
      const target = document.querySelector(selector);
      if (target) target.textContent = value;
    };

    setText('[data-incident-id]', incident.id);
    setText('[data-incident-severity]', state.resolved && state.activeIncident !== 'baseline' ? 'RESOLVED' : incident.severity);
    setText('[data-incident-title]', state.resolved && state.activeIncident !== 'baseline' ? `${incident.title} — recovered` : incident.title);
    setText('[data-incident-summary]', state.resolved && state.activeIncident !== 'baseline' ? 'The simulated fault has been corrected and all validation checks are passing.' : incident.summary);
    setText('[data-incident-objective]', state.resolved && state.activeIncident !== 'baseline' ? 'Review the recovery evidence, reset to baseline, or inject another training incident.' : incident.objective);

    const symptoms = document.querySelector('[data-incident-symptoms]');
    if (symptoms) {
      symptoms.replaceChildren();
      const items = state.resolved && state.activeIncident !== 'baseline'
        ? ['Affected path restored.', 'Service validation passed.', 'Simulated incident ready for reset.']
        : incident.symptoms;
      items.forEach((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        symptoms.append(item);
      });
    }

    const canFix = state.activeIncident !== 'baseline' && !state.resolved;
    if (elements.applyFix) elements.applyFix.disabled = !canFix;
    if (elements.resolutionPanel) elements.resolutionPanel.hidden = !(state.resolved && state.activeIncident !== 'baseline');
    if (elements.resolutionText) elements.resolutionText.textContent = incident.resolution || '';
  }

  function updateIncidentTabs() {
    elements.incidentTabs.forEach((tab) => {
      const selected = tab.dataset.incident === state.activeIncident;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected || state.activeIncident === 'baseline' && tab === elements.incidentTabs[0] ? 0 : -1;
    });
  }

  function selectIncident(id, options = {}) {
    if (!incidents[id] || id === 'baseline') return resetBaseline(options);
    closeSiteMenu();
    state.activeIncident = id;
    state.resolved = false;
    state.incidentStartedAt = Date.now();
    state.resolvedElapsed = 0;
    elements.shell.dataset.incidentState = id;
    updateIncidentTabs();
    applyIncidentVisuals();
    updateIncidentBrief();
    clearTerminal();
    appendLine('DC//NET TRAINING SIMULATOR — outputs are generated for this portfolio demo.', 'system');
    appendLine(incidents[id].terminalIntro, id === 'uplink' ? 'error' : 'warning');
    appendLine('Start with status, then gather one piece of evidence at a time. Type help for commands.', 'system');

    const primaryDevice = Object.keys(incidents[id].devices)[0] || 'core';
    selectDevice(primaryDevice, { syncRack: true });
    updateClock();
    if (options.focusTerminal) focusTerminal();
  }

  function resetBaseline(options = {}) {
    state.activeIncident = 'baseline';
    state.resolved = false;
    state.incidentStartedAt = 0;
    state.resolvedElapsed = 0;
    if (elements.shell) elements.shell.dataset.incidentState = 'baseline';
    updateIncidentTabs();
    applyIncidentVisuals();
    updateIncidentBrief();
    clearTerminal();
    appendLine('DC//NET TRAINING SIMULATOR — no production systems are connected.', 'system');
    appendLine(incidents.baseline.terminalIntro, 'success');
    appendLine('Shortcuts: 1–4 inject incidents, Ctrl+K focuses this terminal, O toggles operations mode.', 'system');
    updateClock();
    if (options.focusTerminal) focusTerminal();
  }

  function selectDevice(id, options = {}) {
    if (!deviceCatalog[id]) return;
    state.selectedDevice = id;
    elements.nodes.forEach((node) => {
      const selected = node.dataset.device === id;
      node.classList.toggle('is-selected', selected);
      node.setAttribute('aria-pressed', String(selected));
    });
    updateDeviceInspector(id);

    if (options.syncRack !== false && rackCatalog[id]) selectRack(id, { syncTopology: false });
  }

  function updateDeviceInspector(id) {
    const device = deviceCatalog[id];
    if (!device) return;
    const condition = currentEntityStatus(id);
    const type = document.querySelector('[data-device-type]');
    const name = document.querySelector('[data-device-name]');
    const role = document.querySelector('[data-device-role]');
    const address = document.querySelector('[data-device-address]');
    const rack = document.querySelector('[data-device-rack]');
    const status = document.querySelector('[data-device-status]');
    if (type) type.textContent = device.type;
    if (name) name.textContent = device.name;
    if (role) role.textContent = device.role;
    if (address) address.textContent = device.address;
    if (rack) rack.textContent = device.rack;
    if (status) {
      status.textContent = statusLabel(condition);
      status.classList.remove('device-status-good', 'device-status-warning', 'device-status-fault');
      status.classList.add(condition === 'online' ? 'device-status-good' : condition === 'warning' ? 'device-status-warning' : 'device-status-fault');
    }
  }

  function selectRack(id, options = {}) {
    if (!rackCatalog[id]) return;
    state.selectedRack = id;
    elements.rackUnits.forEach((unit) => {
      const selected = unit.dataset.rackDevice === id;
      unit.classList.toggle('is-selected', selected);
      unit.setAttribute('aria-pressed', String(selected));
    });
    updateRackInspector(id);
    if (options.syncTopology !== false && rackCatalog[id].topology) selectDevice(rackCatalog[id].topology, { syncRack: false });
  }

  function updateRackInspector(id) {
    const item = rackCatalog[id];
    if (!item) return;
    const setText = (selector, value) => {
      const target = document.querySelector(selector);
      if (target) target.textContent = value;
    };
    setText('[data-rack-type]', item.type);
    setText('[data-rack-name]', item.name);
    setText('[data-rack-role]', item.role);
    setText('[data-rack-position]', item.position);
    setText('[data-rack-power]', item.power);
    setText('[data-rack-ports]', item.ports);
    const locate = document.querySelector('[data-rack-locate]');
    if (locate) locate.disabled = !item.topology;
  }

  function clearTerminal() {
    if (elements.terminalOutput) elements.terminalOutput.replaceChildren();
  }

  function appendLine(text, type = 'output') {
    if (!elements.terminalOutput) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    elements.terminalOutput.append(line);
    while (elements.terminalOutput.children.length > 90) elements.terminalOutput.firstElementChild?.remove();
    elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight;
  }

  function includesAny(command, values) {
    return values.some((value) => command.includes(value));
  }

  function healthyResponse(command) {
    if (command === 'status' || command === 'health') return ['All simulated paths nominal.', '8/8 devices online · 7/7 rack assets nominal · 0 active incidents'];
    if (command.startsWith('ping')) return ['PING target (10.20.0.1): 56 data bytes', '64 bytes from 10.20.0.1: icmp_seq=1 ttl=64 time=0.7 ms', '64 bytes from 10.20.0.1: icmp_seq=2 ttl=64 time=0.6 ms', '2 packets transmitted, 2 received, 0% packet loss'];
    if (command.startsWith('nslookup') || command.startsWith('dig')) return ['Server: 10.30.0.10', 'Name: app.lab', 'Address: 10.30.0.20'];
    if (includesAny(command, ['show interfaces status', 'show interface status'])) return ['Port       Name          Status       Vlan       Duplex  Speed', 'Gi1/0/6    ENG-WS-04     connected    20         a-full  a-1000', 'Gi1/0/24   CORE-UPLINK   connected    trunk      a-full  a-1000'];
    if (includesAny(command, ['show vlan brief', 'show vlan'])) return ['VLAN Name          Status    Ports', '10   OPERATIONS    active    Gi1/0/1-4', '20   ENGINEERING   active    Gi1/0/5-12', '30   SERVERS       active    trunk uplinks', '40   MONITORING    active    trunk uplinks'];
    if (includesAny(command, ['ipconfig', 'ip addr', 'ip a'])) return ['ENG-WS-04', '  IPv4 Address : 10.20.0.54/24', '  Default GW   : 10.20.0.1', '  DNS Server   : 10.30.0.10'];
    if (command.startsWith('systemctl')) return ['bind9.service  active (running)', 'nginx.service  active (running)', 'No failed units in the simulated service set.'];
    if (command.startsWith('df')) return ['Filesystem      Size  Used Avail Use% Mounted on', '/dev/vda1        40G   15G   23G  39% /'];
    if (command.startsWith('curl')) return ['HTTP/1.1 200 OK', 'server: nginx', 'x-lab-status: healthy'];
    if (command.startsWith('journalctl')) return ['-- No priority errors in the current simulated boot --'];
    if (includesAny(command, ['show ip route', 'route'])) return ['C 10.10.0.0/24 is directly connected, Vlan10', 'C 10.20.0.0/24 is directly connected, Vlan20', 'C 10.30.0.0/24 is directly connected, Vlan30', 'S* 0.0.0.0/0 via 10.99.0.1'];
    if (command === 'topology') return topologyStatusLines();
    if (command === 'rack') return rackStatusLines();
    return null;
  }

  function incidentResponse(command) {
    const incident = state.activeIncident;
    if (state.resolved || incident === 'baseline') return healthyResponse(command);

    if (incident === 'vlan') {
      if (command === 'status' || command === 'health') return ['INC-2041 P2: ENG-WS-04 cannot reach its expected gateway.', 'Physical link: up · DHCP lease: present · Other Engineering clients: healthy'];
      if (command.startsWith('ping')) return ['PING 10.20.0.1 (10.20.0.1): 56 data bytes', 'From 10.10.0.54: Destination Host Unreachable', '2 packets transmitted, 0 received, 100% packet loss'];
      if (includesAny(command, ['ipconfig', 'ip addr', 'ip a'])) return ['ENG-WS-04', '  IPv4 Address : 10.10.0.54/24', '  Default GW   : 10.10.0.1', '  Expected zone: ENGINEERING / 10.20.0.0/24'];
      if (includesAny(command, ['show vlan brief', 'show vlan'])) return ['VLAN Name          Status    Ports', '10   OPERATIONS    active    Gi1/0/1-4, Gi1/0/6  <-- unexpected', '20   ENGINEERING   active    Gi1/0/5, Gi1/0/7-12', 'Evidence: ENG-WS-04 is cabled to Gi1/0/6.'];
      if (includesAny(command, ['show interfaces status', 'show interface status'])) return ['Port       Name          Status       Vlan       Duplex  Speed', 'Gi1/0/6    ENG-WS-04     connected    10         a-full  a-1000', 'Gi1/0/24   CORE-UPLINK   connected    trunk      a-full  a-1000'];
      if (command.startsWith('nslookup')) return [';; connection timed out; no servers could be reached', 'Note: verify client addressing before blaming DNS.'];
      if (command.startsWith('systemctl') || command.startsWith('df')) return ['Server-side checks are nominal. The evidence points toward the client access path.'];
    }

    if (incident === 'dns') {
      if (command === 'status' || command === 'health') return ['INC-3118 P2: name-based application access is failing.', 'IP reachability to 10.30.0.20: PASS · DNS health check: CRITICAL'];
      if (command.startsWith('ping')) return ['PING 10.30.0.20 (10.30.0.20): 56 data bytes', '64 bytes from 10.30.0.20: icmp_seq=1 ttl=63 time=0.8 ms', '2 packets transmitted, 2 received, 0% packet loss'];
      if (command.startsWith('nslookup') || command.startsWith('dig')) return [';; communications error to 10.30.0.10#53: timed out', ';; no servers could be reached'];
      if (command.startsWith('systemctl')) return ['● bind9.service - BIND Domain Name Server', '   Loaded: loaded', '   Active: failed (Result: exit-code)', '   Process: zone validation failed for app.lab'];
      if (command.startsWith('journalctl')) return ['named[814]: zone app.lab/IN: loading from master file failed: unexpected end of input', 'systemd[1]: bind9.service: Failed with result exit-code.'];
      if (command.startsWith('curl')) return ['curl: (6) Could not resolve host: app.lab', 'Direct test: curl http://10.30.0.20 -> HTTP/1.1 200 OK'];
      if (includesAny(command, ['show vlan', 'show interfaces', 'ipconfig', 'df'])) return healthyResponse(command);
    }

    if (incident === 'uplink') {
      if (command === 'status' || command === 'health') return ['INC-4276 P1: ACCESS-SW-01 and ENG-WS-04 are unreachable.', 'Last change: controlled maintenance on the core-to-access uplink.'];
      if (command.startsWith('ping')) return ['PING 10.20.0.1 (10.20.0.1): 56 data bytes', 'Request timeout for icmp_seq 1', '2 packets transmitted, 0 received, 100% packet loss'];
      if (includesAny(command, ['show interfaces status', 'show interface status'])) return ['Port       Name          Status          Vlan       Duplex  Speed', 'Gi1/0/24   ACCESS-UPLINK disabled        trunk      auto    auto', 'Gi1/0/2    DNS-SRV-01    connected       30         a-full  a-1000'];
      if (includesAny(command, ['show interface gi1/0/24', 'show interfaces gi1/0/24', 'show run interface'])) return ['GigabitEthernet1/0/24 is administratively down, line protocol is down', '  Description: ACCESS-SW-01 UPLINK', '  switchport mode trunk', '  shutdown'];
      if (includesAny(command, ['show vlan brief', 'show vlan'])) return ['VLAN database is present and unchanged.', 'The access uplink state prevents VLAN traffic from reaching the core.'];
      if (includesAny(command, ['ipconfig', 'ip addr', 'ip a'])) return ['ENG-WS-04 retains 10.20.0.54/24, but the gateway is unreachable.'];
      if (command.startsWith('systemctl') || command.startsWith('df') || command.startsWith('nslookup')) return ['Server VLAN checks remain healthy. Continue tracing the access path.'];
    }

    if (incident === 'disk') {
      if (command === 'status' || command === 'health') return ['INC-5384 P2: APP-SRV-01 is reachable, but Nginx health check is critical.', 'Host ping: PASS · TCP/443: FAIL · Disk alert: CRITICAL'];
      if (command.startsWith('ping')) return ['PING 10.30.0.20 (10.30.0.20): 56 data bytes', '64 bytes from 10.30.0.20: icmp_seq=1 ttl=63 time=0.7 ms', '2 packets transmitted, 2 received, 0% packet loss'];
      if (command.startsWith('nslookup') || command.startsWith('dig')) return ['Server: 10.30.0.10', 'Name: app.lab', 'Address: 10.30.0.20'];
      if (command.startsWith('curl')) return ['curl: (7) Failed to connect to app.lab port 443: Connection refused'];
      if (command.startsWith('df')) return ['Filesystem      Size  Used Avail Use% Mounted on', '/dev/vda1        40G   40G     0 100% /', '/var/log/lab     18G   18G     0 100% /var/log/lab'];
      if (command.startsWith('systemctl')) return ['● nginx.service - A high performance web server', '   Active: failed (Result: exit-code)', '   Error: unable to write runtime state: No space left on device'];
      if (command.startsWith('journalctl')) return ['nginx[1442]: open() "/var/log/nginx/error.log" failed (28: No space left on device)', 'systemd[1]: nginx.service: Failed with result exit-code.'];
      if (includesAny(command, ['show vlan', 'show interfaces', 'ipconfig'])) return healthyResponse(command);
    }

    return healthyResponse(command);
  }

  function topologyStatusLines() {
    return Object.keys(deviceCatalog).map((id) => `${deviceCatalog[id].name.padEnd(14)} ${statusLabel(currentEntityStatus(id)).toUpperCase()}`);
  }

  function rackStatusLines() {
    return Object.keys(rackCatalog).map((id) => {
      const condition = currentEntityStatus(id, 'racks');
      return `${rackCatalog[id].position.padEnd(9)} ${rackCatalog[id].name.padEnd(14)} ${statusLabel(condition).toUpperCase()}`;
    });
  }

  function applyFix() {
    if (state.activeIncident === 'baseline') {
      appendLine('No active incident. Select scenario 1–4 first.', 'warning');
      return;
    }
    if (state.resolved) {
      appendLine(`${incidents[state.activeIncident].id} is already resolved.`, 'system');
      return;
    }

    state.resolved = true;
    state.resolvedElapsed = Math.max(1, Date.now() - state.incidentStartedAt);
    applyIncidentVisuals();
    updateIncidentBrief();
    appendLine('Applying approved simulated recovery change...', 'system');
    appendLine(incidents[state.activeIncident].resolution, 'success');
    appendLine('VALIDATION PASS: gateway, DNS, application, and monitoring checks are green.', 'success');
    updateClock();
  }

  function runCommand(rawCommand) {
    const command = rawCommand.trim();
    if (!command) return;
    const normalized = command.toLowerCase().replace(/\s+/g, ' ');
    state.history.push(command);
    state.history = state.history.slice(-40);
    state.historyIndex = state.history.length;
    appendLine(command, 'command');

    if (normalized === 'clear' || normalized === 'cls') {
      clearTerminal();
      return;
    }
    if (normalized === 'help' || normalized === '?') {
      appendLine('COMMANDS\n  status | topology | rack | ping gateway | ipconfig\n  show interfaces status | show vlan brief | nslookup app.lab\n  systemctl status | journalctl | df -h | curl app.lab\n  incident 1..4 | fix | reset | clear | history', 'system');
      return;
    }
    if (normalized === 'history') {
      appendLine(state.history.map((item, index) => `${String(index + 1).padStart(2, '0')}  ${item}`).join('\n'), 'system');
      return;
    }
    if (normalized === 'reset' || normalized === 'baseline') {
      resetBaseline();
      appendLine('Baseline restored.', 'success');
      return;
    }
    const incidentMatch = normalized.match(/^incident\s+([1-4])$/);
    if (incidentMatch) {
      selectIncident(['vlan', 'dns', 'uplink', 'disk'][Number(incidentMatch[1]) - 1], { focusTerminal: true });
      return;
    }
    if (['fix', 'resolve', 'apply fix', 'repair'].includes(normalized) ||
        includesAny(normalized, ['switchport access vlan 20', 'systemctl restart bind9', 'no shutdown', 'journalctl --vacuum', 'clear logs'])) {
      applyFix();
      return;
    }

    const response = incidentResponse(normalized);
    if (response?.length) {
      response.forEach((line) => appendLine(line, /fail|critical|unreachable|timeout|100%|down|error|disabled|unexpected|no space/i.test(line) ? 'warning' : 'output'));
    } else {
      appendLine(`Command not recognized in this training simulator: ${command}`, 'error');
      appendLine('Type help for the supported evidence commands.', 'system');
    }
  }

  function focusTerminal() {
    closeSiteMenu();
    elements.terminalInput?.focus({ preventScroll: true });
    elements.terminalInput?.scrollIntoView({ behavior: state.effectsPaused ? 'auto' : 'smooth', block: 'center' });
  }

  function setupTerminal() {
    elements.terminalForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const command = elements.terminalInput.value;
      elements.terminalInput.value = '';
      runCommand(command);
    });

    elements.terminalInput?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!state.history.length) return;
        state.historyIndex = Math.max(0, state.historyIndex - 1);
        elements.terminalInput.value = state.history[state.historyIndex] || '';
        elements.terminalInput.setSelectionRange(elements.terminalInput.value.length, elements.terminalInput.value.length);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!state.history.length) return;
        state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
        elements.terminalInput.value = state.history[state.historyIndex] || '';
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        clearTerminal();
      }
    });

    document.querySelectorAll('[data-terminal-command]').forEach((button) => {
      button.addEventListener('click', () => {
        runCommand(button.dataset.terminalCommand || '');
        elements.terminalInput?.focus();
      });
    });
  }

  function formatElapsed(milliseconds) {
    const total = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(total / 60).toString().padStart(2, '0');
    const seconds = (total % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function updateClock() {
    if (!elements.clock) return;
    if (state.activeIncident === 'baseline') {
      elements.clock.textContent = 'STANDBY';
    } else if (state.resolved) {
      elements.clock.textContent = `RECOVERED · ${formatElapsed(state.resolvedElapsed)}`;
    } else {
      elements.clock.textContent = `T+${formatElapsed(Date.now() - state.incidentStartedAt)}`;
    }
  }

  function setOperationsState(open) {
    state.operationsOpen = open;
    elements.shell.classList.toggle('is-operations-mode', open);
    document.body.classList.toggle('operations-open', open);
    document.querySelectorAll('[data-ops-open]').forEach((button) => button.setAttribute('aria-expanded', String(open)));
    document.querySelectorAll('[data-ops-close]').forEach((button) => { button.hidden = !open; });
    elements.shell.setAttribute('aria-label', open ? 'Full-screen data center operations simulator' : 'Data center operations simulator');

    if (open) {
      state.previousFocus = document.activeElement;
      window.setTimeout(() => elements.terminalInput?.focus({ preventScroll: true }), 120);
    } else if (state.previousFocus instanceof HTMLElement) {
      state.previousFocus.focus({ preventScroll: true });
      state.previousFocus = null;
    }
  }

  async function openOperationsMode() {
    closeSiteMenu();
    if (state.tourOpen) closeTour();
    setOperationsState(true);
    if (!document.fullscreenElement && elements.shell.requestFullscreen) {
      try { await elements.shell.requestFullscreen(); } catch { /* CSS full-screen fallback remains active. */ }
    }
  }

  async function closeOperationsMode() {
    if (document.fullscreenElement === elements.shell && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch { setOperationsState(false); }
    } else {
      setOperationsState(false);
    }
  }

  function setupOperationsMode() {
    document.querySelectorAll('[data-ops-open]').forEach((button) => button.addEventListener('click', openOperationsMode));
    document.querySelectorAll('[data-ops-close]').forEach((button) => button.addEventListener('click', closeOperationsMode));
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement === elements.shell) setOperationsState(true);
      else if (state.operationsOpen) setOperationsState(false);
    });
  }

  function setupTopologyAndRack() {
    elements.nodes.forEach((node) => {
      const activate = () => selectDevice(node.dataset.device, { syncRack: true });
      node.addEventListener('click', activate);
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });

    elements.rackUnits.forEach((unit) => unit.addEventListener('click', () => selectRack(unit.dataset.rackDevice)));
    document.querySelector('[data-rack-locate]')?.addEventListener('click', () => {
      const topologyId = rackCatalog[state.selectedRack]?.topology;
      if (!topologyId) return;
      selectDevice(topologyId, { syncRack: false });
      document.querySelector(`[data-device="${topologyId}"]`)?.focus();
    });
  }

  function setupIncidentControls() {
    elements.incidentTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectIncident(tab.dataset.incident));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowLeft') next = (index - 1 + elements.incidentTabs.length) % elements.incidentTabs.length;
        if (event.key === 'ArrowRight') next = (index + 1) % elements.incidentTabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = elements.incidentTabs.length - 1;
        elements.incidentTabs[next].focus();
        selectIncident(elements.incidentTabs[next].dataset.incident);
      });
    });
    document.querySelector('[data-incident-reset]')?.addEventListener('click', () => resetBaseline({ focusTerminal: false }));
    elements.applyFix?.addEventListener('click', applyFix);
    document.querySelector('[data-ops-help]')?.addEventListener('click', () => {
      appendLine('KEYBOARD\n  1–4 select incidents · O operations mode · T recruiter tour\n  P pause/resume motion · Ctrl+K focus terminal · Esc exit overlays\nTERMINAL\n  Type help for all supported diagnostic commands.', 'system');
      focusTerminal();
    });
  }

  function syncTopologyAnimation(paused) {
    state.effectsPaused = paused || motionQuery.matches;
    if (!elements.topology) return;
    try {
      if (state.effectsPaused) elements.topology.pauseAnimations?.();
      else elements.topology.unpauseAnimations?.();
    } catch { /* SVG animation controls are optional. */ }
  }

  function positionTour() {
    if (!state.tourOpen || !elements.tourLayer || !elements.tourSpotlight || !elements.tourCard) return;
    const target = document.querySelector(tourSteps[state.tourIndex].selector);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const padding = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const left = Math.max(8, rect.left - padding);
    const top = Math.max(8, rect.top - padding);
    const width = Math.min(viewportWidth - left - 8, Math.max(80, rect.width + padding * 2));
    const height = Math.min(viewportHeight - top - 8, Math.max(64, rect.height + padding * 2));

    Object.assign(elements.tourSpotlight.style, {
      left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`
    });

    if (viewportWidth <= 620) return;
    const cardWidth = Math.min(370, viewportWidth - 32);
    const cardHeight = elements.tourCard.offsetHeight || 320;
    const gap = 18;
    let cardLeft;
    let cardTop;

    if (rect.right + gap + cardWidth < viewportWidth) {
      cardLeft = rect.right + gap;
      cardTop = Math.min(Math.max(16, rect.top), viewportHeight - cardHeight - 16);
    } else if (rect.left - gap - cardWidth > 0) {
      cardLeft = rect.left - gap - cardWidth;
      cardTop = Math.min(Math.max(16, rect.top), viewportHeight - cardHeight - 16);
    } else {
      cardLeft = Math.min(Math.max(16, rect.left), viewportWidth - cardWidth - 16);
      cardTop = rect.bottom + gap + cardHeight < viewportHeight
        ? rect.bottom + gap
        : Math.max(16, rect.top - cardHeight - gap);
    }
    elements.tourCard.style.left = `${cardLeft}px`;
    elements.tourCard.style.top = `${cardTop}px`;
  }

  function scheduleTourPosition(delay = 0) {
    window.clearTimeout(scheduleTourPosition.timer);
    scheduleTourPosition.timer = window.setTimeout(() => {
      window.cancelAnimationFrame(tourPositionFrame);
      tourPositionFrame = window.requestAnimationFrame(positionTour);
    }, delay);
  }

  function showTourStep(index) {
    if (!state.tourOpen) return;
    const nextIndex = Math.min(Math.max(index, 0), tourSteps.length - 1);
    document.querySelector('.tour-target-active')?.classList.remove('tour-target-active');
    state.tourIndex = nextIndex;
    const step = tourSteps[nextIndex];
    const target = document.querySelector(step.selector);
    target?.classList.add('tour-target-active');

    const setText = (selector, value) => {
      const item = document.querySelector(selector);
      if (item) item.textContent = value;
    };
    setText('[data-tour-counter]', `Step ${nextIndex + 1} of ${tourSteps.length}`);
    setText('[data-tour-kicker]', step.kicker);
    setText('[data-tour-title]', step.title);
    setText('[data-tour-description]', step.description);
    const progress = document.querySelector('[data-tour-progress]');
    if (progress) progress.style.width = `${((nextIndex + 1) / tourSteps.length) * 100}%`;
    const back = document.querySelector('[data-tour-back]');
    const next = document.querySelector('[data-tour-next]');
    if (back) back.disabled = nextIndex === 0;
    if (next) next.textContent = nextIndex === tourSteps.length - 1 ? 'Finish tour' : 'Next';

    target?.scrollIntoView({ behavior: state.effectsPaused ? 'auto' : 'smooth', block: 'center' });
    scheduleTourPosition(state.effectsPaused ? 30 : 520);
  }

  function startTour() {
    closeSiteMenu();
    if (state.operationsOpen) {
      closeOperationsMode();
      window.setTimeout(startTour, 420);
      return;
    }
    if (!elements.tourLayer || !elements.tourCard) return;
    state.tourOpen = true;
    state.tourPreviousFocus = document.activeElement;
    elements.tourLayer.hidden = false;
    elements.tourLayer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tour-open');
    showTourStep(0);
    window.setTimeout(() => elements.tourCard.focus({ preventScroll: true }), 560);
  }

  function closeTour() {
    if (!state.tourOpen) return;
    state.tourOpen = false;
    document.querySelector('.tour-target-active')?.classList.remove('tour-target-active');
    if (elements.tourLayer) {
      elements.tourLayer.hidden = true;
      elements.tourLayer.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('tour-open');
    if (state.tourPreviousFocus instanceof HTMLElement) state.tourPreviousFocus.focus({ preventScroll: true });
    state.tourPreviousFocus = null;
  }

  function nextTourStep() {
    if (state.tourIndex >= tourSteps.length - 1) closeTour();
    else showTourStep(state.tourIndex + 1);
  }

  function setupTour() {
    document.querySelectorAll('[data-tour-start]').forEach((button) => button.addEventListener('click', startTour));
    document.querySelector('[data-tour-close]')?.addEventListener('click', closeTour);
    document.querySelector('[data-tour-back]')?.addEventListener('click', () => showTourStep(state.tourIndex - 1));
    document.querySelector('[data-tour-next]')?.addEventListener('click', nextTourStep);
    window.addEventListener('resize', () => scheduleTourPosition(), { passive: true });
    window.addEventListener('scroll', () => scheduleTourPosition(), { passive: true });
  }

  function isTypingTarget(target) {
    return target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable);
  }

  function trapFocus(container, event) {
    const focusable = Array.from(container.querySelectorAll('a[href], button:not([disabled]):not([hidden]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter((item) => item instanceof HTMLElement && item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function setupKeyboard() {
    document.addEventListener('keydown', (event) => {
      if (state.tourOpen) {
        if (event.key === 'Escape') { event.preventDefault(); closeTour(); return; }
        if (event.key === 'ArrowRight') { event.preventDefault(); nextTourStep(); return; }
        if (event.key === 'ArrowLeft') { event.preventDefault(); showTourStep(state.tourIndex - 1); return; }
        if (event.key === 'Tab' && elements.tourCard) trapFocus(elements.tourCard, event);
        return;
      }

      if (event.key === 'Escape' && state.operationsOpen) {
        event.preventDefault();
        closeOperationsMode();
        return;
      }
      if (event.key === 'Tab' && state.operationsOpen) trapFocus(elements.shell, event);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        focusTerminal();
        return;
      }
      if (isTypingTarget(event.target)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const key = event.key.toLowerCase();
      if (['1', '2', '3', '4'].includes(key)) {
        event.preventDefault();
        selectIncident(['vlan', 'dns', 'uplink', 'disk'][Number(key) - 1]);
        elements.shell.scrollIntoView({ behavior: state.effectsPaused ? 'auto' : 'smooth', block: 'center' });
      } else if (key === 'o') {
        event.preventDefault();
        state.operationsOpen ? closeOperationsMode() : openOperationsMode();
      } else if (key === 't') {
        event.preventDefault();
        startTour();
      } else if (key === 'p') {
        event.preventDefault();
        document.querySelector('[data-fx-toggle]')?.click();
      } else if (event.key === '?') {
        event.preventDefault();
        appendLine('Keyboard: 1–4 incidents · O operations · T tour · P pause · Ctrl+K terminal · Esc exit.', 'system');
        focusTerminal();
      }
    });
  }

  function initialize() {
    queryElements();
    if (!elements.shell) return;
    setupTopologyAndRack();
    setupIncidentControls();
    setupTerminal();
    setupOperationsMode();
    setupTour();
    setupKeyboard();
    selectDevice('core', { syncRack: true });
    resetBaseline();
    syncTopologyAnimation(document.body.classList.contains('fx-paused'));
    window.addEventListener('portfolio:fxchange', (event) => syncTopologyAnimation(Boolean(event.detail?.paused)));
    motionQuery.addEventListener?.('change', (event) => { if (event.matches) syncTopologyAnimation(true); });
    clockTimer = window.setInterval(updateClock, 1000);
  }

  document.addEventListener('DOMContentLoaded', initialize);
  window.addEventListener('pagehide', () => window.clearInterval(clockTimer));
})();
