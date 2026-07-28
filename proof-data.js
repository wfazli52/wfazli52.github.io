(() => {
  'use strict';

  window.PORTFOLIO_PROOF = {
    schemaVersion: 1,
    updated: '2026-07-28',
    owner: 'wfazli52',
    policy: {
      title: 'Proof-first verification policy',
      summary: 'A claim becomes verified only when a public artifact shows what was built, how it was tested, and what the result was. Simulations, plans, templates, and AI-generated examples remain clearly labeled.',
      levels: [
        { id: 'verified', label: 'Verified', description: 'Public evidence is linked and can be inspected.' },
        { id: 'in-progress', label: 'In progress', description: 'Work has started, but the evidence package is not complete.' },
        { id: 'planned', label: 'Planned', description: 'The project is designed but has no published completion evidence.' },
        { id: 'simulation', label: 'Simulation', description: 'Interactive training content, not production experience.' }
      ]
    },
    milestones: [
      {
        id: 'deployment',
        kind: 'platform',
        status: 'verified',
        title: 'Public portfolio deployment',
        shortTitle: 'Portfolio deployment',
        description: 'The portfolio is publicly deployed from the connected GitHub repository and can be inspected by a recruiter.',
        verifiedAt: '2026-07-28',
        route: '',
        evidence: [
          { label: 'Open the live portfolio', type: 'Live site', href: 'https://wfazli52.github.io/' },
          { label: 'Inspect the public source repository', type: 'Repository', href: 'https://github.com/wfazli52/wfazli52.github.io' }
        ],
        requirements: [
          'Public site is reachable over HTTPS',
          'Source repository is public',
          'Projects are labeled honestly',
          'No private credentials or fabricated evidence are published'
        ]
      },
      {
        id: 'enterprise-network',
        kind: 'lab',
        status: 'planned',
        title: 'Enterprise VLAN & Routing Lab',
        shortTitle: 'Enterprise network',
        description: 'A segmented Cisco lab with VLANs, routing, DHCP, DNS, ACLs, and evidence-based fault isolation.',
        verifiedAt: '',
        route: 'projects/enterprise-network.html',
        evidence: [],
        requirements: [
          'Final labeled topology diagram',
          'IP address and VLAN plan',
          'Packet Tracer project file',
          'Sanitized device configurations',
          'Completed acceptance-test matrix',
          'Three troubleshooting records',
          'Short walkthrough or annotated screenshots'
        ]
      },
      {
        id: 'linux-monitoring',
        kind: 'lab',
        status: 'planned',
        title: 'Linux Server Operations Lab',
        shortTitle: 'Linux operations',
        description: 'Two Linux servers with secure access, services, monitoring, backup, logging, and recovery evidence.',
        verifiedAt: '',
        route: 'projects/linux-monitoring.html',
        evidence: [],
        requirements: [
          'VM and network architecture diagram',
          'Secure-build checklist',
          'Sanitized command output',
          'Service and monitoring runbook',
          'Backup-and-restore validation',
          'Controlled-failure recovery evidence',
          'Lessons-learned reflection'
        ]
      },
      {
        id: 'incident-response',
        kind: 'lab',
        status: 'planned',
        title: 'Break/Fix Incident Simulation',
        shortTitle: 'Incident response',
        description: 'A controlled troubleshooting lab with repeatable faults, ticket notes, root-cause analysis, and recovery validation.',
        verifiedAt: '',
        route: 'projects/incident-response.html',
        evidence: [],
        requirements: [
          'Fault catalog with expected symptoms',
          'At least three completed incident tickets',
          'Command history or diagnostic timeline',
          'One complete root-cause analysis',
          'Before-and-after validation evidence',
          'Escalation or shift-handoff summary',
          'Clear simulation labeling'
        ]
      },
      {
        id: 'rack-inventory',
        kind: 'lab',
        status: 'planned',
        title: 'Rack, Cabling & Asset Plan',
        shortTitle: 'Rack operations',
        description: 'A documented rack design with port mapping, asset records, cabling, power assumptions, replacement, and decommission procedures.',
        verifiedAt: '',
        route: 'projects/rack-inventory.html',
        evidence: [],
        requirements: [
          'Front and rear rack elevation',
          'Cable and port map',
          'Sanitized asset inventory',
          'Device naming and labeling standard',
          'Power-feed assumptions',
          'Replacement and rollback procedure',
          'Secure decommission checklist'
        ]
      }
    ],
    skillEvidence: {
      'IPv4 subnetting': { status: 'planned', milestone: 'enterprise-network' },
      'VLANs & trunks': { status: 'planned', milestone: 'enterprise-network' },
      'Routing & ACLs': { status: 'planned', milestone: 'enterprise-network' },
      'DNS & DHCP': { status: 'planned', milestone: 'enterprise-network' },
      'PC/server components': { status: 'planned', milestone: 'rack-inventory' },
      'Linux administration': { status: 'planned', milestone: 'linux-monitoring' },
      'Logs & monitoring': { status: 'planned', milestone: 'linux-monitoring' },
      'Virtualization': { status: 'planned', milestone: 'linux-monitoring' },
      'Incident notes': { status: 'planned', milestone: 'incident-response' },
      'Runbooks & SOPs': { status: 'planned', milestone: 'incident-response' },
      'Asset inventory': { status: 'planned', milestone: 'rack-inventory' },
      'Change validation': { status: 'planned', milestone: 'incident-response' }
    }
  };
})();
