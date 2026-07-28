(() => {
  'use strict';

  if (window.__DC_COMMAND_CENTER__) return;
  window.__DC_COMMAND_CENTER__ = true;

  const incidents = [
    {
      id: 'vlan',
      code: 'INC-101',
      title: 'VLAN mismatch',
      short: 'Engineering client isolated',
      severity: 'P2',
      affectedDevice: 'eng-pc',
      affectedLink: 'access-eng',
      symptoms: [
        'ENG-PC-01 cannot reach its default gateway.',
        'The access switch is online and other VLANs are healthy.',
        'The client received an address from the wrong subnet.'
      ],
      objective: 'Verify the access-port VLAN, correct the assignment, renew addressing, and retest the gateway path.',
      relevant: ['show vlan brief', 'show interfaces status', 'ipconfig'],
      rootCause: 'Gi1/0/8 was assigned to VLAN 30 instead of Engineering VLAN 20.',
      fix: 'Moved Gi1/0/8 to VLAN 20 and renewed the client DHCP lease.',
      outputs: {
        'ping': 'PING 10.20.0.1\nRequest timed out.\nRequest timed out.\n0% gateway reachability — Layer 2 path suspect.',
        'show vlan brief': 'VLAN  NAME          PORTS\n10    OPERATIONS    Gi1/0/2-4\n20    ENGINEERING   Gi1/0/5-7\n30    GUEST         Gi1/0/8-12  <-- ENG-PC-01 appears here\n99    MANAGEMENT    Gi1/0/23-24',
        'show interfaces status': 'PORT     NAME        STATUS      VLAN\nGi1/0/8  ENG-PC-01   connected   30\nGi1/0/24 TRUNK-CORE  connected   trunk',
        'ipconfig': 'IPv4 Address . . . : 10.30.0.44\nDefault Gateway . . : 10.30.0.1\nExpected Engineering subnet: 10.20.0.0/24',
        'nslookup': 'Server: 10.40.0.53\nName: intranet.lab\nAddress: 10.40.0.20\nDNS is responding normally.'
      }
    },
    {
      id: 'dns',
      code: 'INC-204',
      title: 'DNS service outage',
      short: 'Names fail; IP traffic works',
      severity: 'P2',
      affectedDevice: 'dns',
      affectedLink: 'server-dns',
      symptoms: [
        'Users can ping the application server by IP address.',
        'intranet.lab no longer resolves.',
        'The DNS host itself remains reachable.'
      ],
      objective: 'Separate reachability from name resolution, inspect the DNS service, restore it, and verify a fresh lookup.',
      relevant: ['ping', 'nslookup', 'systemctl status'],
      rootCause: 'The named service stopped after an invalid configuration reload.',
      fix: 'Restored the last known-good configuration and restarted named.',
      outputs: {
        'ping': 'PING 10.40.0.20\n64 bytes from 10.40.0.20: time=1.2 ms\n64 bytes from 10.40.0.20: time=1.0 ms\nIP reachability is healthy.',
        'nslookup': ';; connection timed out; no servers could be reached\nResolver: 10.40.0.53',
        'systemctl status': '● named.service - Domain Name Server\n   Loaded: loaded\n   Active: failed (Result: exit-code)\n   Error: zone lab.local: syntax error near line 18',
        'show interfaces status': 'All relevant switch interfaces are connected. No physical link fault detected.',
        'df -h': '/dev/vda2   40G   13G   25G  35% /\nStorage capacity is normal.'
      }
    },
    {
      id: 'uplink',
      code: 'INC-307',
      title: 'Core uplink down',
      short: 'Multiple VLANs lose routing',
      severity: 'P1',
      affectedDevice: 'core',
      affectedLink: 'edge-core',
      symptoms: [
        'Clients in several VLANs lose access beyond the access switch.',
        'Local same-VLAN communication still works.',
        'The core uplink reports no carrier.'
      ],
      objective: 'Identify the common failure domain, inspect interface state, restore the uplink, and validate traffic across VLANs.',
      relevant: ['ping', 'show interfaces status', 'show vlan brief'],
      rootCause: 'The CORE-SW-01 uplink Gi1/0/24 was administratively shut down.',
      fix: 'Issued no shutdown on Gi1/0/24 and confirmed trunk negotiation.',
      outputs: {
        'ping': 'PING 10.40.0.20\nDestination host unreachable.\nFailure affects multiple routed networks.',
        'show interfaces status': 'PORT      NAME         STATUS        VLAN\nGi1/0/24  EDGE-UPLINK  disabled      trunk  <-- common path down\nGi1/0/8   ENG-PC-01    connected     20',
        'show vlan brief': 'VLAN database is present and access ports are assigned correctly. Investigate the shared uplink.',
        'traceroute': '1  10.20.0.1  !H\nTrace stops at the local gateway path.',
        'nslookup': ';; no route to host 10.40.0.53'
      }
    },
    {
      id: 'disk',
      code: 'INC-412',
      title: 'Linux disk pressure',
      short: 'Application cannot write logs',
      severity: 'P2',
      affectedDevice: 'app',
      affectedLink: 'server-app',
      symptoms: [
        'The application responds intermittently.',
        'New log entries and temporary files cannot be written.',
        'Network connectivity to the server remains healthy.'
      ],
      objective: 'Confirm system reachability, inspect service and filesystem state, free space safely, and validate the application.',
      relevant: ['ping', 'systemctl status', 'df -h'],
      rootCause: '/var reached 100% because archived logs were not rotating.',
      fix: 'Archived stale logs, restored rotation policy, and confirmed free space and service health.',
      outputs: {
        'ping': 'PING 10.40.0.20\n64 bytes from 10.40.0.20: time=0.9 ms\nNetwork path is healthy.',
        'systemctl status': '● portfolio-app.service\n   Active: active (running)\n   Warning: write failed: No space left on device',
        'df -h': 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda2        20G   20G     0 100% /var  <-- critical\n/dev/vda1        16G  6.2G  8.8G  42% /',
        'journalctl': 'app[1184]: cannot append /var/log/portfolio/app.log\nlogrotate[771]: destination disk full',
        'nslookup': 'Name resolution is healthy. intranet.lab -> 10.40.0.20'
      }
    }
  ];

  const devices = {
    edge: { name: 'EDGE-RTR-01', type: 'Router', address: '10.99.0.1', role: 'Inter-VLAN gateway and WAN edge', rack: 'U38', power: 'A/B' },
    core: { name: 'CORE-SW-01', type: 'Layer 3 switch', address: '10.99.0.2', role: 'Core switching, trunks, and routing', rack: 'U36', power: 'A/B' },
    dns: { name: 'DNS-SRV-01', type: 'Linux server', address: '10.40.0.53', role: 'Authoritative DNS for lab.local', rack: 'U28', power: 'A' },
    app: { name: 'APP-SRV-01', type: 'Linux server', address: '10.40.0.20', role: 'Portfolio application and web service', rack: 'U26', power: 'B' },
    'eng-pc': { name: 'ENG-PC-01', type: 'Client', address: 'DHCP / VLAN 20', role: 'Engineering test workstation', rack: 'Floor', power: 'Local' },
    'ops-pc': { name: 'OPS-PC-01', type: 'Client', address: 'DHCP / VLAN 10', role: 'Operations test workstation', rack: 'Floor', power: 'Local' },
    pdu: { name: 'PDU-A / PDU-B', type: 'Power distribution', address: '10.99.0.10-11', role: 'Redundant rack power feeds', rack: 'Rear 0U', power: 'Facility A/B' }
  };

  const style = document.createElement('style');
  style.id = 'dc-command-center-style';
  style.textContent = String.raw`
    #command-center{position:relative;isolation:isolate;overflow:hidden;background:radial-gradient(circle at 10% 10%,rgba(99,211,255,.08),transparent 30rem),radial-gradient(circle at 90% 90%,rgba(128,240,192,.06),transparent 34rem)}
    #command-center:before{content:"";position:absolute;inset:0;z-index:-1;background-image:linear-gradient(rgba(99,211,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,211,255,.025) 1px,transparent 1px);background-size:32px 32px;mask-image:linear-gradient(to bottom,transparent,#000 12%,#000 88%,transparent)}
    .cc-actions{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin:-.5rem 0 1.25rem}.cc-hint{color:var(--muted);font:700 .78rem ui-monospace,SFMono-Regular,Menlo,monospace}.cc-hint kbd,.cc-tour kbd{padding:.08rem .32rem;border:1px solid var(--line);border-radius:5px;background:#030b14;color:var(--text);font:inherit}
    .cc-shell{--cc-line:rgba(99,211,255,.18);position:relative;overflow:hidden;border:1px solid var(--cc-line);border-radius:28px;background:linear-gradient(145deg,rgba(9,23,39,.98),rgba(3,11,20,.99));box-shadow:0 34px 100px rgba(0,0,0,.38),0 0 70px rgba(99,211,255,.04)}
    .cc-shell:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(99,211,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(99,211,255,.022) 1px,transparent 1px);background-size:26px 26px;mask-image:linear-gradient(to bottom,#000,transparent 84%)}
    .cc-topbar{position:relative;z-index:8;display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:62px;padding:.75rem 1rem;border-bottom:1px solid var(--cc-line);background:rgba(3,11,20,.88);backdrop-filter:blur(18px)}.cc-brand{display:flex;align-items:center;gap:.75rem}.cc-logo{display:grid;grid-template-columns:repeat(3,4px);align-items:end;gap:3px;width:36px;height:36px;padding:8px;border:1px solid rgba(99,211,255,.25);border-radius:11px;background:rgba(99,211,255,.08)}.cc-logo i{display:block;border-radius:4px;background:linear-gradient(to top,var(--accent),var(--accent-2));animation:cc-bars 1.2s ease-in-out infinite alternate}.cc-logo i:nth-child(1){height:55%;animation-delay:-.4s}.cc-logo i:nth-child(2){height:100%;animation-delay:-.8s}.cc-logo i:nth-child(3){height:72%;animation-delay:-.15s}.cc-brand strong{display:block;font:850 .78rem ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}.cc-state{display:flex;align-items:center;gap:.4rem;color:var(--accent-2);font-size:.7rem}.cc-dot{width:7px;height:7px;border-radius:50%;background:var(--accent-2);box-shadow:0 0 12px rgba(128,240,192,.8);animation:cc-pulse 1.8s ease-out infinite}.cc-state.is-alert{color:var(--warning)}.cc-state.is-alert .cc-dot{background:var(--warning);box-shadow:0 0 12px rgba(255,211,122,.8)}.cc-state.is-good{color:var(--accent-2)}
    .cc-toolbar{display:flex;gap:.45rem;flex-wrap:wrap;justify-content:flex-end}.cc-tool,.cc-reset,.cc-run,.cc-fix,.cc-suggest,.cc-incident{border:1px solid var(--line);background:rgba(16,31,51,.75);color:var(--text);font:inherit;cursor:pointer}.cc-tool{min-height:36px;padding:.42rem .65rem;border-radius:10px;color:var(--muted);font-size:.72rem;font-weight:800}.cc-tool:hover,.cc-tool:focus-visible,.cc-reset:hover,.cc-reset:focus-visible{color:var(--text);border-color:rgba(99,211,255,.44)}
    .cc-incidents{position:relative;z-index:3;display:grid;grid-template-columns:minmax(190px,.65fr) minmax(0,1.6fr) auto;gap:1rem;align-items:center;padding:1rem;border-bottom:1px solid var(--cc-line);background:linear-gradient(90deg,rgba(99,211,255,.035),transparent 55%,rgba(128,240,192,.025))}.cc-incidents h3{margin:.25rem 0 .15rem;font-size:1rem}.cc-incidents p{margin:0;color:var(--muted);font-size:.74rem}.cc-label{color:var(--warning);font:850 .64rem ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase}.cc-tabs{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:.5rem}.cc-incident{position:relative;display:grid;min-height:74px;padding:.62rem .65rem .6rem 2.4rem;border-radius:13px;text-align:left}.cc-incident span{position:absolute;left:.68rem;top:.65rem;color:var(--accent);font:900 .62rem ui-monospace,SFMono-Regular,Menlo,monospace}.cc-incident strong{font-size:.78rem;line-height:1.2}.cc-incident small{align-self:end;color:var(--muted);font-size:.64rem}.cc-incident:hover,.cc-incident:focus-visible{transform:translateY(-1px);border-color:rgba(99,211,255,.38)}.cc-incident[aria-selected=true]{border-color:rgba(255,211,122,.52);background:linear-gradient(145deg,rgba(255,211,122,.11),rgba(7,17,31,.9));box-shadow:inset 3px 0 var(--warning)}.cc-incident[aria-selected=true] span{color:var(--warning)}.cc-reset{min-height:40px;padding:.52rem .72rem;border-radius:10px;color:var(--muted);font-size:.7rem;font-weight:800}
    .cc-grid{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.42fr) minmax(300px,.7fr);grid-template-areas:"map rack" "terminal brief";gap:.8rem;padding:.8rem}.cc-panel{position:relative;min-width:0;overflow:hidden;border:1px solid rgba(167,185,205,.14);border-radius:18px;background:linear-gradient(155deg,rgba(11,27,46,.93),rgba(4,14,25,.94));box-shadow:inset 0 1px rgba(255,255,255,.025)}.cc-map-panel{grid-area:map}.cc-rack-panel{grid-area:rack}.cc-terminal-panel{grid-area:terminal}.cc-brief{grid-area:brief}.cc-panel-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:64px;padding:.78rem .92rem;border-bottom:1px solid rgba(167,185,205,.12)}.cc-panel-head h3{margin:.1rem 0 0;font-size:.98rem}.cc-kicker{display:block;color:var(--accent);font:850 .62rem ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase}.cc-pill{display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .52rem;border:1px solid rgba(128,240,192,.18);border-radius:999px;background:rgba(128,240,192,.04);color:var(--accent-2);font:850 .61rem ui-monospace,SFMono-Regular,Menlo,monospace}
    .cc-map-wrap{position:relative;min-height:355px;padding:.5rem;background:radial-gradient(circle at 50% 48%,rgba(99,211,255,.055),transparent 46%)}.cc-map{width:100%;height:auto;min-height:345px}.cc-link{fill:none;stroke:rgba(99,211,255,.34);stroke-width:3;stroke-linecap:round;stroke-dasharray:10 8;animation:cc-dash 2.7s linear infinite}.cc-link.secondary{stroke:rgba(128,240,192,.28)}.cc-link.is-fault{stroke:rgba(255,156,156,.85);stroke-width:4;stroke-dasharray:5 10;animation-duration:.8s}.cc-packet{fill:var(--accent);filter:drop-shadow(0 0 7px rgba(99,211,255,.9))}.cc-node{cursor:pointer;outline:none}.cc-node rect{fill:#0e2135;stroke:rgba(99,211,255,.42);stroke-width:2;transition:transform .18s ease,fill .18s ease,stroke .18s ease}.cc-node text{fill:#dff4ff;font:700 13px ui-monospace,SFMono-Regular,Menlo,monospace;pointer-events:none}.cc-node .cc-sub{fill:#8fa8c0;font-size:10px}.cc-node:hover rect,.cc-node:focus rect,.cc-node.is-selected rect{fill:#163451;stroke:var(--accent);filter:drop-shadow(0 0 9px rgba(99,211,255,.32))}.cc-node.is-fault rect{fill:#3b1d28;stroke:#ff9c9c;animation:cc-alert 1.2s ease-in-out infinite}.cc-node.is-good rect{fill:#11342d;stroke:var(--accent-2)}.cc-map-legend{position:absolute;left:.75rem;bottom:.7rem;display:flex;gap:.75rem;flex-wrap:wrap;padding:.42rem .55rem;border:1px solid var(--line);border-radius:9px;background:rgba(3,11,20,.76);color:var(--muted);font-size:.62rem}.cc-map-legend span{display:flex;align-items:center;gap:.35rem}.cc-map-legend i{width:8px;height:8px;border-radius:50%;background:var(--accent-2)}.cc-map-legend span:nth-child(2) i{background:var(--warning)}.cc-map-legend span:nth-child(3) i{background:#ff9c9c}
    .cc-inspector{display:grid;grid-template-columns:1fr auto;gap:.75rem;padding:.75rem .9rem;border-top:1px solid rgba(167,185,205,.12);background:rgba(3,11,20,.43)}.cc-inspector h4{margin:0 0 .2rem;font-size:.9rem}.cc-inspector p{margin:0;color:var(--muted);font-size:.7rem}.cc-inspector dl{display:grid;grid-template-columns:repeat(3,auto);gap:.75rem;margin:0}.cc-inspector dt{color:#71879c;font-size:.56rem;text-transform:uppercase}.cc-inspector dd{margin:0;color:#dff3ff;font:750 .62rem ui-monospace,SFMono-Regular,Menlo,monospace}
    .cc-rack-body{display:grid;grid-template-columns:minmax(150px,.85fr) minmax(125px,.75fr);gap:.75rem;padding:.75rem}.cc-rack{position:relative;padding:.55rem;border:2px solid rgba(167,185,205,.3);border-radius:13px;background:rgba(2,9,18,.82);box-shadow:inset 0 0 24px rgba(0,0,0,.35)}.cc-rack:before,.cc-rack:after{content:"";position:absolute;top:.45rem;bottom:.45rem;width:4px;border-radius:4px;background:repeating-linear-gradient(to bottom,#526a82 0 2px,transparent 2px 10px);opacity:.48}.cc-rack:before{left:.22rem}.cc-rack:after{right:.22rem}.cc-unit{position:relative;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.42rem;width:100%;min-height:43px;margin:.4rem 0;padding:.45rem .48rem;border:1px solid rgba(167,185,205,.22);border-radius:7px;background:linear-gradient(180deg,#16283d,#0e1d2e);color:var(--text);text-align:left;cursor:pointer}.cc-unit:hover,.cc-unit:focus-visible,.cc-unit.is-selected{border-color:var(--accent);box-shadow:0 0 18px rgba(99,211,255,.1)}.cc-unit.is-fault{border-color:#ff9c9c;background:linear-gradient(180deg,#3d2230,#24131c);animation:cc-rack-alert 1.2s ease-in-out infinite}.cc-u{color:#60778d;font:700 .54rem ui-monospace,SFMono-Regular,Menlo,monospace}.cc-unit strong{font:750 .62rem ui-monospace,SFMono-Regular,Menlo,monospace}.cc-leds{display:flex;gap:3px}.cc-leds i{width:6px;height:6px;border-radius:50%;background:var(--accent-2);box-shadow:0 0 7px rgba(128,240,192,.65)}.cc-leds i:nth-child(2){background:var(--accent);box-shadow:0 0 7px rgba(99,211,255,.65)}.cc-rack-info{align-self:stretch;padding:.7rem;border:1px solid rgba(167,185,205,.14);border-radius:11px;background:rgba(3,11,20,.48)}.cc-rack-info h4{margin:.35rem 0 .55rem;font-size:.88rem}.cc-rack-info dl{display:grid;gap:.45rem;margin:0}.cc-rack-info div{padding-top:.42rem;border-top:1px solid rgba(167,185,205,.1)}.cc-rack-info dt{color:#71879c;font-size:.56rem;text-transform:uppercase}.cc-rack-info dd{margin:.08rem 0 0;color:#dff3ff;font-size:.65rem;line-height:1.35}
    .cc-terminal-output{height:270px;overflow:auto;padding:.82rem .9rem;background:#020911;color:#cfeeff;font:500 .72rem/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;scrollbar-color:#23435e #020911}.cc-line{white-space:pre-wrap}.cc-line+.cc-line{margin-top:.55rem}.cc-line.command{color:var(--accent-2)}.cc-line.command:before{content:"operator@lab:~$ ";color:#65d6ff}.cc-line.warn{color:#ffd37a}.cc-line.good{color:#9ff1c9}.cc-line.error{color:#ffb0b0}.cc-command-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.5rem;padding:.7rem .8rem;border-top:1px solid rgba(167,185,205,.12);background:rgba(3,11,20,.78);font:700 .72rem ui-monospace,SFMono-Regular,Menlo,monospace}.cc-prompt{color:var(--accent-2)}.cc-command-row input{min-width:0;height:39px;padding:0 .7rem;border:1px solid rgba(99,211,255,.22);border-radius:9px;background:#071522;color:#e9f7ff;font:inherit}.cc-command-row input:focus{border-color:var(--accent);outline:2px solid rgba(99,211,255,.18)}.cc-run{height:39px;padding:0 .75rem;border-radius:9px;background:linear-gradient(135deg,var(--accent),#8bb8ff);color:#06111f;font-size:.68rem;font-weight:900}.cc-suggestions{display:flex;gap:.4rem;flex-wrap:wrap;padding:.55rem .8rem .7rem;border-top:1px solid rgba(167,185,205,.08)}.cc-suggest{padding:.34rem .46rem;border-radius:8px;color:var(--muted);font:700 .6rem ui-monospace,SFMono-Regular,Menlo,monospace}.cc-suggest:hover,.cc-suggest:focus-visible{color:var(--text);border-color:rgba(99,211,255,.4)}
    .cc-brief-body{padding:.82rem}.cc-brief-card{padding:.7rem;border:1px solid rgba(167,185,205,.13);border-radius:11px;background:rgba(3,11,20,.46)}.cc-brief-card+.cc-brief-card{margin-top:.62rem}.cc-brief-card strong{font-size:.69rem}.cc-brief-card ul{margin:.45rem 0 0;padding-left:1rem;color:var(--muted);font-size:.66rem}.cc-brief-card li+li{margin-top:.3rem}.cc-brief-card p{margin:.38rem 0 0;color:var(--muted);font-size:.66rem;line-height:1.5}.cc-fix{width:100%;min-height:42px;margin-top:.72rem;border-radius:10px;background:linear-gradient(135deg,var(--accent),#8bb8ff);color:#06111f;font-weight:900}.cc-fix:disabled{opacity:.38;cursor:not-allowed}.cc-resolution{margin-top:.62rem;padding:.65rem;border:1px solid rgba(128,240,192,.25);border-radius:10px;background:rgba(128,240,192,.06);color:#cfeede;font-size:.66rem;line-height:1.5}.cc-resolution strong{display:block;color:var(--accent-2);font:850 .62rem ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
    .cc-statusbar{position:relative;z-index:3;display:flex;justify-content:space-between;gap:1rem;padding:.55rem .85rem;border-top:1px solid var(--cc-line);background:rgba(3,11,20,.88);color:var(--muted);font-size:.61rem}.cc-clock{color:var(--accent-2);font:800 .64rem ui-monospace,SFMono-Regular,Menlo,monospace}
    body.cc-locked{overflow:hidden}.cc-shell.cc-full,.cc-shell:fullscreen{position:fixed;z-index:5000;inset:0;width:100vw;height:100dvh;overflow:auto;border:0;border-radius:0;background:radial-gradient(circle at 14% 0,rgba(99,211,255,.1),transparent 30rem),linear-gradient(145deg,#071522,#020911 72%)}.cc-shell:fullscreen{position:relative;width:100%;height:100%}.cc-shell.cc-full .cc-topbar,.cc-shell:fullscreen .cc-topbar{position:sticky;top:0}.cc-shell.cc-full .cc-map-wrap,.cc-shell:fullscreen .cc-map-wrap{min-height:410px}.cc-shell.cc-full .cc-terminal-output,.cc-shell:fullscreen .cc-terminal-output{height:min(34vh,380px)}
    .cc-tour-layer{position:fixed;z-index:7000;inset:0;pointer-events:none}.cc-tour-spot{position:fixed;border:2px solid var(--accent);border-radius:18px;box-shadow:0 0 0 9999px rgba(1,7,13,.8),0 0 34px rgba(99,211,255,.38);transition:left .32s ease,top .32s ease,width .32s ease,height .32s ease}.cc-tour{position:fixed;z-index:2;width:min(370px,calc(100vw - 2rem));padding:1rem;pointer-events:auto;border:1px solid rgba(99,211,255,.36);border-radius:18px;background:linear-gradient(145deg,rgba(13,31,51,.99),rgba(4,14,25,.99));box-shadow:0 28px 90px rgba(0,0,0,.56);backdrop-filter:blur(18px)}.cc-tour-top{display:flex;justify-content:space-between;align-items:center;color:var(--muted);font:750 .65rem ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase}.cc-tour-close{display:grid;place-items:center;width:31px;height:31px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--text);cursor:pointer}.cc-tour-progress{height:3px;margin:.7rem 0 .9rem;border-radius:99px;background:rgba(167,185,205,.14);overflow:hidden}.cc-tour-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2));transition:width .25s ease}.cc-tour h2{margin:.3rem 0 .55rem;font-size:1.5rem}.cc-tour p{margin:0;color:var(--muted);font-size:.82rem}.cc-tour-nav{display:flex;justify-content:flex-end;gap:.5rem;margin-top:1rem}.cc-tour-nav button{min-height:40px;padding:.55rem .75rem;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text);font:800 .74rem inherit;cursor:pointer}.cc-tour-nav button:last-child{background:linear-gradient(135deg,var(--accent),#8bb8ff);color:#06111f}.cc-tour-nav button:disabled{opacity:.4}.cc-tour-keys{margin-top:.7rem!important;color:#6f879e!important;font-size:.64rem!important;text-align:right}
    .page-transition-wipe{position:fixed;z-index:9999;inset:0;pointer-events:none;background:linear-gradient(135deg,#07111f,#0e2942 55%,#0b2e2b);transform:translateY(102%);transition:transform .46s cubic-bezier(.75,0,.2,1)}.page-transition-wipe:after{content:"LOADING PROJECT //";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:var(--accent);font:900 .8rem ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em}.page-transition-wipe.is-active{transform:translateY(0)}.project-card.is-launching{transform:scale(.985)!important;filter:brightness(1.35)}
    @keyframes cc-bars{to{height:28%;opacity:.58}}@keyframes cc-pulse{70%{box-shadow:0 0 0 8px rgba(128,240,192,0),0 0 12px rgba(128,240,192,.8)}}@keyframes cc-dash{to{stroke-dashoffset:-36}}@keyframes cc-alert{50%{filter:drop-shadow(0 0 13px rgba(255,156,156,.35))}}@keyframes cc-rack-alert{50%{box-shadow:0 0 16px rgba(255,156,156,.14)}}
    .fx-paused .cc-logo i,.fx-paused .cc-dot,.fx-paused .cc-link,.fx-paused .cc-node.is-fault rect,.fx-paused .cc-unit.is-fault{animation-play-state:paused!important}
    @media(max-width:1120px){.cc-incidents{grid-template-columns:1fr}.cc-tabs{grid-template-columns:repeat(4,minmax(0,1fr))}.cc-reset{justify-self:start}.cc-grid{grid-template-columns:minmax(0,1fr) minmax(270px,.62fr);grid-template-areas:"map map" "terminal rack" "terminal brief"}}
    @media(max-width:860px){.cc-grid{grid-template-columns:1fr;grid-template-areas:"map" "brief" "terminal" "rack"}.cc-inspector{grid-template-columns:1fr}.cc-inspector dl{grid-template-columns:repeat(3,minmax(0,1fr))}.cc-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.cc-statusbar{flex-direction:column;gap:.3rem}}
    @media(max-width:620px){.cc-shell{border-radius:20px}.cc-topbar{align-items:flex-start;flex-direction:column}.cc-toolbar{width:100%;justify-content:flex-start}.cc-tool{flex:1 1 auto}.cc-incidents{padding:.75rem}.cc-tabs{grid-template-columns:1fr 1fr}.cc-grid{padding:.55rem;gap:.55rem}.cc-panel{border-radius:14px}.cc-panel-head{align-items:flex-start;flex-direction:column}.cc-map-wrap{overflow-x:auto;min-height:330px}.cc-map{width:700px;max-width:none}.cc-map-legend{position:sticky;left:.3rem;width:max-content}.cc-inspector dl{grid-template-columns:1fr}.cc-rack-body{grid-template-columns:1fr}.cc-terminal-output{height:235px}.cc-command-row{grid-template-columns:auto minmax(0,1fr)}.cc-run{grid-column:1/-1}.cc-tour{left:1rem!important;right:1rem;bottom:1rem;top:auto!important;width:auto}.cc-actions{align-items:flex-start;flex-direction:column}}
    @media(max-width:430px){.cc-tabs{grid-template-columns:1fr}.cc-tool span{display:none}.cc-map{width:650px}.cc-rack-body{padding:.55rem}}
    @media(prefers-reduced-motion:reduce){.cc-logo i,.cc-dot,.cc-link,.cc-node.is-fault rect,.cc-unit.is-fault{animation:none!important}.cc-tour-spot,.cc-tour,.page-transition-wipe{transition:none!important}}
    @view-transition{navigation:auto}::view-transition-old(root){animation:.28s ease both cc-old}::view-transition-new(root){animation:.42s ease both cc-new}@keyframes cc-old{to{opacity:0;transform:scale(.985)}}@keyframes cc-new{from{opacity:0;transform:translateY(14px) scale(1.01)}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'command-center';
  section.setAttribute('aria-labelledby', 'cc-title');
  section.innerHTML = `
    <div class="container">
      <div class="section-heading" data-reveal>
        <div><span class="eyebrow">Interactive operations lab</span><h2 id="cc-title">Diagnose the network. Inspect the rack. Restore service.</h2></div>
        <p>This browser-based command center is a clearly labeled training simulation. Choose an incident, inspect device states, run troubleshooting commands, and validate recovery without pretending the results came from a real production system.</p>
      </div>
      <div class="cc-actions" data-reveal>
        <div class="cc-hint">Keyboard: <kbd>1–4</kbd> incident · <kbd>/</kbd> terminal · <kbd>F</kbd> operations · <kbd>T</kbd> tour · <kbd>P</kbd> pause</div>
        <div class="button-row"><button class="button primary" type="button" data-cc-full>Open operations mode</button><button class="button" type="button" data-cc-tour>60-second recruiter tour</button></div>
      </div>
      <div class="cc-shell" data-cc-shell data-reveal>
        <div class="cc-topbar">
          <div class="cc-brand"><span class="cc-logo" aria-hidden="true"><i></i><i></i><i></i></span><div><strong>DC//NET OPERATIONS CONSOLE</strong><span class="cc-state" data-cc-state><i class="cc-dot" aria-hidden="true"></i><span data-cc-status>Normal operations</span></span></div></div>
          <div class="cc-toolbar"><button class="cc-tool" type="button" data-cc-pause title="Pause or resume visual effects">◉ <span>Pause FX</span></button><button class="cc-tool" type="button" data-cc-tour>◎ <span>Recruiter tour</span></button><button class="cc-tool" type="button" data-cc-full>⛶ <span>Operations mode</span></button></div>
        </div>
        <div class="cc-incidents">
          <div><span class="cc-label">Training simulation</span><h3>Select an incident</h3><p>Each scenario changes topology, device health, terminal output, and the recommended troubleshooting path.</p></div>
          <div class="cc-tabs" role="tablist" aria-label="Incident simulations">
            ${incidents.map((incident, index) => `<button class="cc-incident" type="button" role="tab" aria-selected="false" data-cc-incident="${incident.id}"><span>0${index + 1}</span><strong>${incident.title}</strong><small>${incident.severity} · ${incident.short}</small></button>`).join('')}
          </div>
          <button class="cc-reset" type="button" data-cc-reset>Reset lab</button>
        </div>
        <div class="cc-grid">
          <section class="cc-panel cc-map-panel" aria-labelledby="cc-map-title">
            <div class="cc-panel-head"><div><span class="cc-kicker">Live topology</span><h3 id="cc-map-title">Packet flow & device state</h3></div><span class="cc-pill"><i class="cc-dot" aria-hidden="true"></i><span data-cc-telemetry>6 nodes healthy</span></span></div>
            <div class="cc-map-wrap">
              <svg class="cc-map" data-cc-map viewBox="0 0 920 390" role="img" aria-label="Interactive lab network topology">
                <defs><marker id="cc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="rgba(99,211,255,.55)"/></marker></defs>
                <path class="cc-link" data-cc-link="edge-core" d="M460 70 L460 145" marker-end="url(#cc-arrow)"/>
                <path class="cc-link secondary" data-cc-link="access-ops" d="M460 190 L190 285"/>
                <path class="cc-link" data-cc-link="access-eng" d="M460 190 L350 285"/>
                <path class="cc-link secondary" data-cc-link="server-dns" d="M460 190 L610 285"/>
                <path class="cc-link" data-cc-link="server-app" d="M460 190 L780 285"/>
                <circle class="cc-packet" r="4"><animateMotion dur="2.1s" repeatCount="indefinite" path="M460 70 L460 145"/></circle>
                <circle class="cc-packet" r="4"><animateMotion dur="2.7s" begin="-.8s" repeatCount="indefinite" path="M460 190 L190 285"/></circle>
                <circle class="cc-packet" r="4"><animateMotion dur="2.4s" begin="-1.3s" repeatCount="indefinite" path="M460 190 L350 285"/></circle>
                <circle class="cc-packet" r="4"><animateMotion dur="2.6s" begin="-.4s" repeatCount="indefinite" path="M460 190 L610 285"/></circle>
                <circle class="cc-packet" r="4"><animateMotion dur="2.9s" begin="-1.8s" repeatCount="indefinite" path="M460 190 L780 285"/></circle>
                ${nodeSvg('edge', 390, 20, 140, 52, 'EDGE-RTR-01', '10.99.0.1')}
                ${nodeSvg('core', 390, 142, 140, 58, 'CORE-SW-01', 'VLAN 10/20/30/99')}
                ${nodeSvg('ops-pc', 120, 285, 140, 55, 'OPS-PC-01', 'VLAN 10')}
                ${nodeSvg('eng-pc', 280, 285, 140, 55, 'ENG-PC-01', 'VLAN 20')}
                ${nodeSvg('dns', 540, 285, 140, 55, 'DNS-SRV-01', '10.40.0.53')}
                ${nodeSvg('app', 710, 285, 140, 55, 'APP-SRV-01', '10.40.0.20')}
              </svg>
              <div class="cc-map-legend"><span><i></i> healthy</span><span><i></i> incident active</span><span><i></i> fault isolated</span></div>
            </div>
            <div class="cc-inspector" data-cc-inspector></div>
          </section>
          <section class="cc-panel cc-rack-panel" aria-labelledby="cc-rack-title">
            <div class="cc-panel-head"><div><span class="cc-kicker">Rack explorer</span><h3 id="cc-rack-title">Click any rack unit</h3></div><span class="cc-pill">RACK A01 · 42U</span></div>
            <div class="cc-rack-body"><div class="cc-rack" aria-label="Interactive rack elevation">
              ${rackUnit('edge','U38','EDGE-RTR-01')}${rackUnit('core','U36','CORE-SW-01')}${rackUnit('dns','U28','DNS-SRV-01')}${rackUnit('app','U26','APP-SRV-01')}${rackUnit('pdu','0U','PDU-A / PDU-B')}
            </div><div class="cc-rack-info" data-cc-rack-info></div></div>
          </section>
          <section class="cc-panel cc-terminal-panel" aria-labelledby="cc-terminal-title">
            <div class="cc-panel-head"><div><span class="cc-kicker">Troubleshooting terminal</span><h3 id="cc-terminal-title">Evidence before action</h3></div><span class="cc-pill">SIMULATED CLI</span></div>
            <div class="cc-terminal-output" data-cc-output role="log" aria-live="polite"></div>
            <form class="cc-command-row" data-cc-form><span class="cc-prompt">$</span><label class="visually-hidden" for="cc-command">Troubleshooting command</label><input id="cc-command" data-cc-input autocomplete="off" spellcheck="false" placeholder="Type help, ping, nslookup, show vlan brief…"><button class="cc-run" type="submit">RUN COMMAND</button></form>
            <div class="cc-suggestions">${['help','ping','nslookup','show vlan brief','show interfaces status','systemctl status','df -h','clear'].map(command => `<button class="cc-suggest" type="button" data-cc-command="${command}">${command}</button>`).join('')}</div>
          </section>
          <aside class="cc-panel cc-brief" aria-labelledby="cc-brief-title">
            <div class="cc-panel-head"><div><span class="cc-kicker">Incident brief</span><h3 id="cc-brief-title" data-cc-brief-title>No incident selected</h3></div><span class="cc-pill" data-cc-code>READY</span></div>
            <div class="cc-brief-body"><div class="cc-brief-card"><strong>Observed symptoms</strong><ul data-cc-symptoms><li>Select one of the four incidents to begin.</li></ul></div><div class="cc-brief-card"><strong>Objective</strong><p data-cc-objective>Use evidence-first troubleshooting, then confirm the fix with a validation command.</p></div><button class="cc-fix" type="button" data-cc-fix disabled>Apply confirmed fix</button><div class="cc-resolution" data-cc-resolution hidden></div></div>
          </aside>
        </div>
        <div class="cc-statusbar"><span>This is a training simulation. Outputs are deterministic and clearly labeled—not production evidence.</span><span class="cc-clock" data-cc-clock>SIM 00:00</span></div>
      </div>
    </div>`;

  function nodeSvg(id, x, y, width, height, name, subtitle) {
    return `<g class="cc-node" data-cc-device="${id}" role="button" tabindex="0" aria-label="Inspect ${name}" transform="translate(${x} ${y})"><rect width="${width}" height="${height}" rx="12"/><text x="${width/2}" y="${height/2-3}" text-anchor="middle">${name}</text><text class="cc-sub" x="${width/2}" y="${height/2+15}" text-anchor="middle">${subtitle}</text></g>`;
  }

  function rackUnit(id, unit, name) {
    return `<button class="cc-unit" type="button" data-cc-rack="${id}"><span class="cc-u">${unit}</span><strong>${name}</strong><span class="cc-leds" aria-hidden="true"><i></i><i></i></span></button>`;
  }

  const dashboard = document.querySelector('#dashboard');
  const proof = document.querySelector('#proof');
  if (dashboard) dashboard.insertAdjacentElement('afterend', section);
  else if (proof) proof.insertAdjacentElement('beforebegin', section);
  else document.querySelector('main')?.appendChild(section);

  const nav = document.querySelector('[data-menu]');
  if (nav && !nav.querySelector('a[href="#command-center"]')) {
    const link = document.createElement('a');
    link.href = '#command-center';
    link.textContent = 'Simulator';
    const projectsLink = nav.querySelector('a[href="#projects"]');
    nav.insertBefore(link, projectsLink || nav.firstChild);
  }

  const heroButtons = document.querySelector('.hero .button-row');
  if (heroButtons && !heroButtons.querySelector('[data-cc-hero-full]')) {
    const full = document.createElement('button');
    full.className = 'button';
    full.type = 'button';
    full.dataset.ccHeroFull = '';
    full.textContent = 'Launch operations mode ↗';
    full.addEventListener('click', () => openOperations());
    const tour = document.createElement('button');
    tour.className = 'button';
    tour.type = 'button';
    tour.dataset.ccHeroTour = '';
    tour.textContent = '60-second recruiter tour';
    tour.addEventListener('click', () => startTour());
    heroButtons.append(full, tour);
  }

  const shell = section.querySelector('[data-cc-shell]');
  const map = section.querySelector('[data-cc-map]');
  const state = section.querySelector('[data-cc-state]');
  const statusText = section.querySelector('[data-cc-status]');
  const telemetry = section.querySelector('[data-cc-telemetry]');
  const output = section.querySelector('[data-cc-output]');
  const input = section.querySelector('[data-cc-input]');
  const fixButton = section.querySelector('[data-cc-fix]');
  const resolution = section.querySelector('[data-cc-resolution]');
  const clock = section.querySelector('[data-cc-clock]');
  let active = null;
  let resolved = false;
  let diagnostics = new Set();
  let seconds = 0;
  let selectedDevice = 'core';
  let selectedRack = 'core';

  function appendLine(text, type = '') {
    const line = document.createElement('div');
    line.className = `cc-line ${type}`.trim();
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  appendLine('DC//NET training console initialized.', 'good');
  appendLine('Select an incident or type help. All command output is simulated.', 'warn');

  function clearStates() {
    section.querySelectorAll('.is-fault,.is-good').forEach(element => element.classList.remove('is-fault','is-good'));
  }

  function updateBrief() {
    const title = section.querySelector('[data-cc-brief-title]');
    const code = section.querySelector('[data-cc-code]');
    const symptoms = section.querySelector('[data-cc-symptoms]');
    const objective = section.querySelector('[data-cc-objective]');
    if (!active) {
      title.textContent = 'No incident selected';
      code.textContent = 'READY';
      symptoms.innerHTML = '<li>Select one of the four incidents to begin.</li>';
      objective.textContent = 'Use evidence-first troubleshooting, then confirm the fix with a validation command.';
      return;
    }
    title.textContent = active.title;
    code.textContent = `${active.code} · ${active.severity}`;
    symptoms.innerHTML = active.symptoms.map(item => `<li>${item}</li>`).join('');
    objective.textContent = active.objective;
  }

  function updateState() {
    clearStates();
    if (!active) {
      state.className = 'cc-state is-good';
      statusText.textContent = 'Normal operations';
      telemetry.textContent = '6 nodes healthy';
      fixButton.disabled = true;
      resolution.hidden = true;
      return;
    }
    if (resolved) {
      state.className = 'cc-state is-good';
      statusText.textContent = `${active.code} resolved`; telemetry.textContent = 'Service restored · validation passed';
      section.querySelector(`[data-cc-device="${active.affectedDevice}"]`)?.classList.add('is-good');
      section.querySelector(`[data-cc-rack="${active.affectedDevice}"]`)?.classList.add('is-good');
      fixButton.disabled = true;
      resolution.hidden = false;
      resolution.innerHTML = `<strong>RECOVERY VERIFIED</strong>${active.fix}<br><br>Root cause: ${active.rootCause}`;
    } else {
      state.className = 'cc-state is-alert';
      statusText.textContent = `${active.code} active · ${active.severity}`;
      telemetry.textContent = '1 fault · packet loss detected';
      section.querySelector(`[data-cc-device="${active.affectedDevice}"]`)?.classList.add('is-fault');
      section.querySelector(`[data-cc-link="${active.affectedLink}"]`)?.classList.add('is-fault');
      section.querySelector(`[data-cc-rack="${active.affectedDevice}"]`)?.classList.add('is-fault');
      fixButton.disabled = diagnostics.size < 2;
      resolution.hidden = true;
    }
    updateInspector(selectedDevice);
    updateRack(selectedRack);
  }

  function selectIncident(id, announce = true) {
    active = incidents.find(item => item.id === id) || null;
    resolved = false;
    diagnostics = new Set();
    seconds = 0;
    section.querySelectorAll('[data-cc-incident]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.ccIncident === id)));
    updateBrief(); updateState();
    if (announce && active) {
      appendLine(`activate ${active.code} --scenario=${active.id}`, 'command');
      appendLine(`${active.severity} incident injected: ${active.title}. Begin with observable evidence.`, 'warn');
    }
  }

  function resetLab() {
    active = null; resolved = false; diagnostics = new Set(); seconds = 0;
    section.querySelectorAll('[data-cc-incident]').forEach(button => button.setAttribute('aria-selected','false'));
    updateBrief(); updateState();
    appendLine('reset-lab --baseline', 'command'); appendLine('All simulated devices returned to healthy baseline.', 'good');
  }

  function canonicalCommand(raw) {
    const value = raw.toLowerCase().trim().replace(/\s+/g,' ');
    if (!value) return '';
    if (value.startsWith('ping')) return 'ping';
    if (value.startsWith('nslookup') || value.startsWith('dig')) return 'nslookup';
    if (value.includes('show vlan')) return 'show vlan brief';
    if (value.includes('show interface')) return 'show interfaces status';
    if (value.startsWith('systemctl')) return 'systemctl status';
    if (value.startsWith('df')) return 'df -h';
    if (value.startsWith('journalctl')) return 'journalctl';
    if (value.startsWith('traceroute') || value.startsWith('tracert')) return 'traceroute';
    if (value.startsWith('ipconfig') || value.startsWith('ip addr')) return 'ipconfig';
    if (value === 'help' || value === 'clear' || value === 'status' || value === 'fix') return value;
    return value;
  }

  function healthyOutput(command) {
    const healthy = {
      ping: 'PING 10.40.0.20\n64 bytes from 10.40.0.20: time=0.8 ms\n64 bytes from 10.40.0.20: time=0.9 ms\n0% packet loss.',
      nslookup: 'Server: 10.40.0.53\nName: intranet.lab\nAddress: 10.40.0.20',
      'show vlan brief': 'VLAN 10 OPERATIONS active\nVLAN 20 ENGINEERING active\nVLAN 30 GUEST active\nVLAN 99 MANAGEMENT active',
      'show interfaces status': 'All lab uplinks and access ports are connected. Trunks operational.',
      'systemctl status': '● named.service active (running)\n● portfolio-app.service active (running)',
      'df -h': '/dev/vda2  40G  13G  25G  35% /\nFilesystem capacity healthy.',
      journalctl: 'No critical events in the current simulated window.',
      traceroute: '1 10.20.0.1  0.4 ms\n2 10.40.0.20 0.9 ms',
      ipconfig: 'IPv4 Address: 10.20.0.44\nDefault Gateway: 10.20.0.1\nDNS Server: 10.40.0.53'
    };
    return healthy[command] || 'Command not recognized. Type help for supported commands.';
  }

  function runCommand(raw) {
    const command = canonicalCommand(raw);
    if (!command) return;
    if (command === 'clear') { output.innerHTML = ''; return; }
    appendLine(raw, 'command');
    if (command === 'help') {
      appendLine('Supported: ping, traceroute, nslookup, show vlan brief, show interfaces status, ipconfig, systemctl status, journalctl, df -h, status, fix, clear.\nShortcuts: 1–4 incidents, / terminal, F operations, T tour, P pause.', 'good');
      return;
    }
    if (command === 'status') {
      appendLine(active ? `${active.code}: ${resolved ? 'RESOLVED' : 'ACTIVE'} — ${active.title}\nDiagnostics collected: ${[...diagnostics].join(', ') || 'none'}` : 'No incident active. Baseline healthy.', active && !resolved ? 'warn' : 'good');
      return;
    }
    if (command === 'fix') { fixIncident(); return; }
    if (!active || resolved) { appendLine(healthyOutput(command), 'good'); return; }
    const text = active.outputs[command] || healthyOutput(command);
    const isRelevant = active.relevant.includes(command);
    if (isRelevant) diagnostics.add(command);
    appendLine(text, /failed|timed out|unreachable|100%|disabled|wrong|no route|syntax error/i.test(text) ? 'error' : (isRelevant ? 'warn' : ''));
    fixButton.disabled = diagnostics.size < 2;
    if (diagnostics.size >= 2) appendLine('Evidence threshold reached. The confirmed-fix control is now enabled.', 'good');
  }

  function fixIncident() {
    if (!active) { appendLine('No active incident to fix.', 'warn'); return; }
    if (resolved) { appendLine(`${active.code} is already resolved.`, 'good'); return; }
    if (diagnostics.size < 2) { appendLine('Collect at least two relevant observations before applying a fix.', 'warn'); return; }
    appendLine(`apply-fix --incident=${active.code}`, 'command');
    appendLine(active.fix, 'good');
    appendLine('Validation: gateway reachability, service state, and expected application path all PASS.', 'good');
    resolved = true; updateState();
  }

  function updateInspector(id) {
    selectedDevice = id;
    const device = devices[id] || devices.core;
    section.querySelectorAll('[data-cc-device]').forEach(node => node.classList.toggle('is-selected', node.dataset.ccDevice === id));
    const fault = active && !resolved && active.affectedDevice === id;
    section.querySelector('[data-cc-inspector]').innerHTML = `<div><h4>${device.name}</h4><p>${device.role}${fault ? ' · Active incident target' : ''}</p></div><dl><div><dt>Type</dt><dd>${device.type}</dd></div><div><dt>Address</dt><dd>${device.address}</dd></div><div><dt>State</dt><dd>${fault ? 'FAULT' : 'HEALTHY'}</dd></div></dl>`;
  }

  function updateRack(id) {
    selectedRack = id;
    const device = devices[id] || devices.core;
    section.querySelectorAll('[data-cc-rack]').forEach(unit => unit.classList.toggle('is-selected', unit.dataset.ccRack === id));
    const fault = active && !resolved && active.affectedDevice === id;
    section.querySelector('[data-cc-rack-info]').innerHTML = `<span class="cc-kicker">Selected asset</span><h4>${device.name}</h4><dl><div><dt>Role</dt><dd>${device.role}</dd></div><div><dt>Rack position</dt><dd>${device.rack}</dd></div><div><dt>Management</dt><dd>${device.address}</dd></div><div><dt>Power feed</dt><dd>${device.power}</dd></div><div><dt>Health</dt><dd>${fault ? 'Incident active' : 'Operational'}</dd></div></dl>`;
  }

  function openOperations() {
    if (document.fullscreenElement) return;
    if (shell.requestFullscreen) {
      shell.requestFullscreen().catch(() => { shell.classList.add('cc-full'); document.body.classList.add('cc-locked'); });
    } else { shell.classList.add('cc-full'); document.body.classList.add('cc-locked'); }
    window.setTimeout(() => input.focus(), 250);
  }

  function closeOperations() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    shell.classList.remove('cc-full'); document.body.classList.remove('cc-locked');
  }

  function toggleOperations() {
    if (document.fullscreenElement || shell.classList.contains('cc-full')) closeOperations(); else openOperations();
  }

  document.addEventListener('fullscreenchange', () => {
    document.body.classList.toggle('cc-locked', Boolean(document.fullscreenElement));
  });

  const tourSteps = [
    { selector: '.hero', kicker: 'Career direction', title: 'Built for infrastructure work', text: 'The opening establishes the target role, WGU Cisco-track degree path, and a proof-first approach without exaggerating experience.' },
    { selector: '#dashboard', kicker: 'Execution plan', title: 'A measurable 90-day sprint', text: 'The dashboard turns the career goal into visible deliverables: technical labs, documentation, and a structured application timeline.' },
    { selector: '#command-center', kicker: 'Interactive proof', title: 'Troubleshooting is the centerpiece', text: 'The simulator demonstrates evidence-first thinking through network, DNS, uplink, and Linux incidents. It is explicitly labeled as training.' },
    { selector: '#projects', kicker: 'Portfolio roadmap', title: 'Four projects tell one story', text: 'Networking, Linux operations, incident response, and rack documentation build toward an entry-level data center technician role.' },
    { selector: '#skills', kicker: 'Honest positioning', title: 'Skill levels stay precise', text: 'The portfolio distinguishes learning, planned labs, and completed evidence so interviewers can trust every claim.' },
    { selector: '#contact', kicker: 'Next action', title: 'Resume, GitHub, and contact', text: 'The final section gives a recruiter a direct path to the resume, source code, and future contact details.' }
  ];
  let tourIndex = 0;
  let tourLayer = null;

  function buildTour() {
    tourLayer = document.createElement('div');
    tourLayer.className = 'cc-tour-layer';
    tourLayer.innerHTML = `<div class="cc-tour-spot" data-cc-spot></div><section class="cc-tour" role="dialog" aria-modal="true" aria-labelledby="cc-tour-title" tabindex="-1"><div class="cc-tour-top"><span data-cc-tour-count></span><button class="cc-tour-close" type="button" aria-label="Close tour">×</button></div><div class="cc-tour-progress"><i data-cc-tour-progress></i></div><span class="cc-kicker" data-cc-tour-kicker></span><h2 id="cc-tour-title" data-cc-tour-title></h2><p data-cc-tour-text></p><div class="cc-tour-nav"><button type="button" data-cc-tour-back>Back</button><button type="button" data-cc-tour-next>Next</button></div><p class="cc-tour-keys">Use <kbd>←</kbd> <kbd>→</kbd> and <kbd>Esc</kbd></p></section>`;
    document.body.appendChild(tourLayer);
    tourLayer.querySelector('.cc-tour-close').addEventListener('click', closeTour);
    tourLayer.querySelector('[data-cc-tour-back]').addEventListener('click', () => showTour(tourIndex - 1));
    tourLayer.querySelector('[data-cc-tour-next]').addEventListener('click', () => tourIndex === tourSteps.length - 1 ? closeTour() : showTour(tourIndex + 1));
  }

  function positionTour() {
    if (!tourLayer) return;
    const target = document.querySelector(tourSteps[tourIndex].selector);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const pad = 8;
    const spot = tourLayer.querySelector('[data-cc-spot]');
    spot.style.left = `${Math.max(8, rect.left - pad)}px`; spot.style.top = `${Math.max(8, rect.top - pad)}px`;
    spot.style.width = `${Math.min(window.innerWidth - 16, rect.width + pad * 2)}px`; spot.style.height = `${Math.min(window.innerHeight - 16, rect.height + pad * 2)}px`;
    const card = tourLayer.querySelector('.cc-tour');
    const width = Math.min(370, window.innerWidth - 32);
    let left = rect.right + 18;
    if (left + width > window.innerWidth - 16) left = Math.max(16, rect.left - width - 18);
    let top = Math.max(16, Math.min(window.innerHeight - 310, rect.top));
    card.style.left = `${left}px`; card.style.top = `${top}px`;
  }

  function showTour(index) {
    tourIndex = Math.max(0, Math.min(tourSteps.length - 1, index));
    const step = tourSteps[tourIndex];
    const target = document.querySelector(step.selector);
    target?.scrollIntoView({ behavior: document.body.classList.contains('fx-paused') ? 'auto' : 'smooth', block: 'center' });
    tourLayer.querySelector('[data-cc-tour-count]').textContent = `Step ${tourIndex + 1} of ${tourSteps.length}`;
    tourLayer.querySelector('[data-cc-tour-progress]').style.width = `${((tourIndex + 1) / tourSteps.length) * 100}%`;
    tourLayer.querySelector('[data-cc-tour-kicker]').textContent = step.kicker;
    tourLayer.querySelector('[data-cc-tour-title]').textContent = step.title;
    tourLayer.querySelector('[data-cc-tour-text]').textContent = step.text;
    tourLayer.querySelector('[data-cc-tour-back]').disabled = tourIndex === 0;
    tourLayer.querySelector('[data-cc-tour-next]').textContent = tourIndex === tourSteps.length - 1 ? 'Finish' : 'Next';
    window.setTimeout(positionTour, 360);
  }

  function startTour() {
    closeOperations();
    if (!tourLayer) buildTour();
    tourLayer.hidden = false; tourLayer.querySelector('.cc-tour').focus(); showTour(0);
  }

  function closeTour() { if (tourLayer) { tourLayer.remove(); tourLayer = null; } }

  section.querySelectorAll('[data-cc-incident]').forEach(button => button.addEventListener('click', () => selectIncident(button.dataset.ccIncident)));
  section.querySelector('[data-cc-reset]').addEventListener('click', resetLab);
  section.querySelector('[data-cc-form]').addEventListener('submit', event => { event.preventDefault(); const value = input.value; input.value = ''; runCommand(value); });
  section.querySelectorAll('[data-cc-command]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.ccCommand; runCommand(input.value); input.value = ''; input.focus(); }));
  fixButton.addEventListener('click', fixIncident);
  section.querySelectorAll('[data-cc-device]').forEach(node => {
    node.addEventListener('click', () => updateInspector(node.dataset.ccDevice));
    node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); updateInspector(node.dataset.ccDevice); } });
  });
  section.querySelectorAll('[data-cc-rack]').forEach(unit => unit.addEventListener('click', () => updateRack(unit.dataset.ccRack)));
  section.querySelectorAll('[data-cc-full]').forEach(button => button.addEventListener('click', toggleOperations));
  section.querySelectorAll('[data-cc-tour]').forEach(button => button.addEventListener('click', startTour));
  section.querySelector('[data-cc-pause]').addEventListener('click', () => document.querySelector('[data-fx-toggle]')?.click());

  window.addEventListener('resize', () => { if (tourLayer) positionTour(); }, { passive: true });
  window.addEventListener('scroll', () => { if (tourLayer) positionTour(); }, { passive: true });
  window.addEventListener('portfolio:fxchange', event => {
    const paused = Boolean(event.detail?.paused);
    const svg = section.querySelector('[data-cc-map]');
    if (paused) svg?.pauseAnimations?.(); else svg?.unpauseAnimations?.();
    const label = section.querySelector('[data-cc-pause] span'); if (label) label.textContent = paused ? 'Resume FX' : 'Pause FX';
  });

  document.addEventListener('keydown', event => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
    if (tourLayer) {
      if (event.key === 'Escape') { event.preventDefault(); closeTour(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); tourIndex === tourSteps.length - 1 ? closeTour() : showTour(tourIndex + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); showTour(tourIndex - 1); }
      return;
    }
    if (event.key === 'Escape' && (document.fullscreenElement || shell.classList.contains('cc-full'))) { closeOperations(); return; }
    if (typing && event.key !== 'Escape') return;
    if (/^[1-4]$/.test(event.key)) { event.preventDefault(); selectIncident(incidents[Number(event.key) - 1].id); section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (event.key === '/') { event.preventDefault(); input.focus(); }
    else if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleOperations(); }
    else if (event.key.toLowerCase() === 't') { event.preventDefault(); startTour(); }
    else if (event.key.toLowerCase() === 'p') { event.preventDefault(); document.querySelector('[data-fx-toggle]')?.click(); }
  });

  window.setInterval(() => { seconds += 1; const minutes = String(Math.floor(seconds / 60)).padStart(2,'0'); const secs = String(seconds % 60).padStart(2,'0'); clock.textContent = `SIM ${minutes}:${secs}`; }, 1000);

  updateBrief(); updateState(); updateInspector('core'); updateRack('core');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('fx-paused')) map?.pauseAnimations?.();

  if ('IntersectionObserver' in window) {
    section.querySelectorAll('[data-reveal]').forEach(item => {
      const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.disconnect(); } }); }, { threshold: .08 });
      observer.observe(item);
    });
  } else section.querySelectorAll('[data-reveal]').forEach(item => item.classList.add('is-visible'));
})();
