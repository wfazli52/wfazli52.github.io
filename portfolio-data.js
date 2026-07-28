window.PORTFOLIO_PLATFORM = {
  "version": "4.0.0",
  "updated": "2026-07-28",
  "siteUrl": "https://wfazli52.github.io/",
  "repository": "https://github.com/wfazli52/wfazli52.github.io",
  "brand": {
    "product": "DC//NET Portfolio",
    "mark": "WF",
    "tagline": "Proof-first infrastructure portfolio",
    "themeColor": "#07111f",
    "accentColor": "#63d3ff"
  },
  "projects": {
    "enterprise-network": {
      "number": "01",
      "route": "projects/enterprise-network.html",
      "title": "Enterprise VLAN & Routing Lab",
      "shortTitle": "Enterprise Network",
      "eyebrow": "Cisco infrastructure case study",
      "status": "planned",
      "summary": "Design a segmented four-department network, configure core services and access policy, then prove every requirement with repeatable tests and fault-isolation records.",
      "careerValue": "Shows that you can translate requirements into addressing, switching, routing, access control, validation, and clear operational documentation.",
      "metrics": [
        {
          "value": "4",
          "label": "VLANs"
        },
        {
          "value": "10",
          "label": "Acceptance tests"
        },
        {
          "value": "3",
          "label": "Fault scenarios"
        },
        {
          "value": "L1–L3",
          "label": "Troubleshooting scope"
        }
      ],
      "tools": [
        "Cisco Packet Tracer",
        "Cisco IOS",
        "IPv4 subnetting",
        "VLANs",
        "802.1Q trunks",
        "DHCP",
        "DNS",
        "ACLs"
      ],
      "deliverables": [
        "Logical and physical topology",
        "IP and VLAN plan",
        "Sanitized device configurations",
        "Connectivity and policy test matrix",
        "Three troubleshooting records",
        "Short walkthrough and reflection"
      ],
      "architecture": {
        "type": "network",
        "caption": "Planned logical topology. Device states and packet animation are illustrative until the Packet Tracer build is published.",
        "nodes": [
          {
            "id": "edge",
            "label": "EDGE-RTR-01",
            "type": "router",
            "x": 50,
            "y": 10,
            "detail": "Inter-VLAN gateway and external edge. Planned management address: 10.99.0.1."
          },
          {
            "id": "core",
            "label": "CORE-SW-01",
            "type": "core",
            "x": 50,
            "y": 30,
            "detail": "Core switching and trunk aggregation. Planned management address: 10.99.0.2."
          },
          {
            "id": "access-a",
            "label": "ACCESS-SW-01",
            "type": "switch",
            "x": 27,
            "y": 52,
            "detail": "Access switch for Operations and Engineering endpoints."
          },
          {
            "id": "access-b",
            "label": "ACCESS-SW-02",
            "type": "switch",
            "x": 73,
            "y": 52,
            "detail": "Access switch for Guest, Management, and lab services."
          },
          {
            "id": "ops",
            "label": "VLAN 10 · OPS",
            "type": "client",
            "x": 12,
            "y": 78,
            "detail": "Operations subnet target: 10.10.0.0/24."
          },
          {
            "id": "eng",
            "label": "VLAN 20 · ENG",
            "type": "client",
            "x": 36,
            "y": 78,
            "detail": "Engineering subnet target: 10.20.0.0/24."
          },
          {
            "id": "guest",
            "label": "VLAN 30 · GUEST",
            "type": "client",
            "x": 64,
            "y": 78,
            "detail": "Guest subnet target: 10.30.0.0/24 with restricted access."
          },
          {
            "id": "services",
            "label": "VLAN 40 · SERVICES",
            "type": "server",
            "x": 86,
            "y": 78,
            "detail": "DNS and test web service target subnet: 10.40.0.0/24."
          },
          {
            "id": "mgmt",
            "label": "VLAN 99 · MGMT",
            "type": "management",
            "x": 88,
            "y": 30,
            "detail": "Restricted management plane for switches and routing device."
          }
        ],
        "links": [
          {
            "from": "edge",
            "to": "core",
            "label": "routed uplink",
            "kind": "core"
          },
          {
            "from": "core",
            "to": "access-a",
            "label": "802.1Q trunk",
            "kind": "trunk"
          },
          {
            "from": "core",
            "to": "access-b",
            "label": "802.1Q trunk",
            "kind": "trunk"
          },
          {
            "from": "access-a",
            "to": "ops",
            "label": "access",
            "kind": "access"
          },
          {
            "from": "access-a",
            "to": "eng",
            "label": "access",
            "kind": "access"
          },
          {
            "from": "access-b",
            "to": "guest",
            "label": "access",
            "kind": "access"
          },
          {
            "from": "access-b",
            "to": "services",
            "label": "access",
            "kind": "service"
          },
          {
            "from": "core",
            "to": "mgmt",
            "label": "management",
            "kind": "management"
          }
        ]
      },
      "phases": [
        {
          "id": "requirements",
          "title": "Requirements and success criteria",
          "status": "planned",
          "detail": "Define departments, services, allowed traffic, naming, constraints, rollback, and measurable acceptance criteria."
        },
        {
          "id": "addressing",
          "title": "Addressing and VLAN design",
          "status": "planned",
          "detail": "Create four user/service VLANs plus management, calculate subnets, reserve infrastructure addresses, and document DHCP scopes."
        },
        {
          "id": "switching",
          "title": "Layer 2 configuration",
          "status": "planned",
          "detail": "Create VLANs, assign access ports, configure trunks, set native VLAN policy, and verify allowed VLANs."
        },
        {
          "id": "routing",
          "title": "Routing and core services",
          "status": "planned",
          "detail": "Configure gateways, routing, DHCP, DNS, and management reachability before introducing access policy."
        },
        {
          "id": "policy",
          "title": "Access control",
          "status": "planned",
          "detail": "Apply a documented ACL that permits the approved service while denying Guest access to Management."
        },
        {
          "id": "validation",
          "title": "Testing, faults, and evidence",
          "status": "planned",
          "detail": "Run the full matrix, inject three controlled faults, capture command output, verify recovery, and publish sanitized evidence."
        }
      ],
      "tests": [
        {
          "id": "NET-01",
          "category": "Addressing",
          "requirement": "Operations client receives the correct DHCP lease",
          "expected": "10.10.0.0/24 address, gateway 10.10.0.1, approved DNS",
          "status": "pending"
        },
        {
          "id": "NET-02",
          "category": "Addressing",
          "requirement": "Engineering client receives the correct DHCP lease",
          "expected": "10.20.0.0/24 address and correct options",
          "status": "pending"
        },
        {
          "id": "NET-03",
          "category": "Switching",
          "requirement": "Trunks carry only the documented VLANs",
          "expected": "VLANs 10, 20, 30, 40, and 99 active; no unexpected native-VLAN mismatch",
          "status": "pending"
        },
        {
          "id": "NET-04",
          "category": "Routing",
          "requirement": "Permitted inter-VLAN traffic succeeds",
          "expected": "Operations and Engineering reach the approved service",
          "status": "pending"
        },
        {
          "id": "NET-05",
          "category": "Security",
          "requirement": "Guest access to Management is denied",
          "expected": "Policy denial is observed and documented",
          "status": "pending"
        },
        {
          "id": "NET-06",
          "category": "Security",
          "requirement": "Guest can reach the approved web service",
          "expected": "TCP/HTTP test succeeds without broader Management access",
          "status": "pending"
        },
        {
          "id": "NET-07",
          "category": "Services",
          "requirement": "DNS resolves the lab hostname",
          "expected": "intranet.lab returns the documented service address",
          "status": "pending"
        },
        {
          "id": "NET-08",
          "category": "Management",
          "requirement": "Infrastructure is reachable only from the approved admin path",
          "expected": "Management succeeds from VLAN 99 and is denied from Guest",
          "status": "pending"
        },
        {
          "id": "NET-09",
          "category": "Recovery",
          "requirement": "Wrong-VLAN fault is isolated and corrected",
          "expected": "Port assignment is identified, changed, lease renewed, and gateway retested",
          "status": "pending"
        },
        {
          "id": "NET-10",
          "category": "Recovery",
          "requirement": "Disabled-uplink fault is isolated and corrected",
          "expected": "Common failure domain is identified and routed connectivity restored",
          "status": "pending"
        }
      ],
      "configs": [
        {
          "id": "vlans",
          "label": "VLAN and access-port template",
          "kind": "template",
          "language": "Cisco IOS",
          "code": "vlan 10\n name OPERATIONS\nvlan 20\n name ENGINEERING\nvlan 30\n name GUEST\nvlan 40\n name SERVICES\nvlan 99\n name MANAGEMENT\n!\ninterface GigabitEthernet1/0/8\n description ENG-PC-01\n switchport mode access\n switchport access vlan 20\n spanning-tree portfast"
        },
        {
          "id": "trunk",
          "label": "Trunk validation template",
          "kind": "template",
          "language": "Cisco IOS",
          "code": "interface GigabitEthernet1/0/24\n description TRUNK-TO-CORE\n switchport trunk encapsulation dot1q\n switchport mode trunk\n switchport trunk allowed vlan 10,20,30,40,99\n!\nshow interfaces trunk\nshow vlan brief"
        },
        {
          "id": "acl",
          "label": "Guest policy template",
          "kind": "template",
          "language": "Cisco IOS",
          "code": "ip access-list extended GUEST-IN\n remark Permit DNS to approved resolver\n permit udp 10.30.0.0 0.0.0.255 host 10.40.0.53 eq domain\n remark Permit HTTP to approved test service\n permit tcp 10.30.0.0 0.0.0.255 host 10.40.0.20 eq 80\n remark Deny management network\n deny ip 10.30.0.0 0.0.0.255 10.99.0.0 0.0.0.255 log\n deny ip 10.30.0.0 0.0.0.255 any log"
        },
        {
          "id": "fault-diff",
          "label": "Training diff: wrong access VLAN",
          "kind": "simulation",
          "language": "Diff",
          "before": "interface Gi1/0/8\n switchport access vlan 30",
          "after": "interface Gi1/0/8\n switchport access vlan 20",
          "note": "Simulated example only. Replace with your real configuration diff after completing the lab."
        }
      ],
      "incidents": [
        {
          "code": "SIM-NET-01",
          "title": "Wrong access VLAN",
          "severity": "Training P2",
          "symptom": "Engineering client receives a Guest address and cannot reach its expected gateway.",
          "diagnosis": "Compare the client lease, switch port status, and VLAN membership.",
          "recovery": "Move the port to VLAN 20, renew DHCP, and repeat gateway and service tests."
        },
        {
          "code": "SIM-NET-02",
          "title": "Incorrect default gateway",
          "severity": "Training P3",
          "symptom": "Local same-subnet traffic works; routed destinations fail.",
          "diagnosis": "Inspect client addressing and compare the configured gateway with the subnet plan.",
          "recovery": "Correct the DHCP option or static value, renew, and validate route progression."
        },
        {
          "code": "SIM-NET-03",
          "title": "Core trunk disabled",
          "severity": "Training P1",
          "symptom": "Multiple VLANs lose routed access while local switch communication remains available.",
          "diagnosis": "Identify the shared failure domain and inspect uplink state before changing endpoint configuration.",
          "recovery": "Restore the trunk, verify allowed VLANs, and rerun cross-VLAN and policy tests."
        }
      ],
      "evidence": [
        {
          "type": "Diagram",
          "label": "Final labeled topology",
          "status": "missing",
          "path": "diagrams/final-topology.png"
        },
        {
          "type": "Plan",
          "label": "IP and VLAN plan",
          "status": "missing",
          "path": "docs/ip-address-plan.csv"
        },
        {
          "type": "Lab file",
          "label": "Packet Tracer project",
          "status": "missing",
          "path": "lab/enterprise-network.pkt"
        },
        {
          "type": "Configuration",
          "label": "Sanitized device configs",
          "status": "missing",
          "path": "configs/"
        },
        {
          "type": "Testing",
          "label": "Completed acceptance matrix",
          "status": "missing",
          "path": "tests/test-matrix.md"
        },
        {
          "type": "Incidents",
          "label": "Three fault-isolation records",
          "status": "missing",
          "path": "incidents/"
        },
        {
          "type": "Walkthrough",
          "label": "Short video or annotated sequence",
          "status": "missing",
          "path": "evidence/walkthrough.md"
        }
      ],
      "recruiter": {
        "headline": "A proof-first Cisco networking case study",
        "summary": "This planned lab is designed to show how I turn business requirements into a segmented network, validate policy, and troubleshoot faults with evidence rather than guesswork. It will remain labeled planned until the topology, configurations, test matrix, and recovery records are public.",
        "talkingPoints": [
          "Explain the addressing and VLAN decisions before discussing commands.",
          "Show one permitted path and one intentionally denied path.",
          "Walk through the common-failure-domain reasoning used during an uplink fault.",
          "End with the exact acceptance tests used to prove recovery."
        ],
        "resumeBullet": "Designed and validated a segmented Cisco lab network with four VLANs, inter-VLAN routing, DHCP, DNS, and access-control policy; documented topology, addressing, configurations, and fault-isolation tests.",
        "locked": true
      }
    },
    "linux-monitoring": {
      "number": "02",
      "route": "projects/linux-monitoring.html",
      "title": "Linux Server Operations Lab",
      "shortTitle": "Linux Operations",
      "eyebrow": "Systems operations case study",
      "status": "planned",
      "summary": "Build and operate two Linux servers with secure administration, service management, resource monitoring, centralized evidence, backup, and controlled recovery.",
      "careerValue": "Demonstrates a structured approach to server build, normal-state documentation, service health, logs, storage, security, and recovery validation.",
      "metrics": [
        {
          "value": "2",
          "label": "Linux nodes"
        },
        {
          "value": "9",
          "label": "Acceptance tests"
        },
        {
          "value": "4",
          "label": "Controlled failures"
        },
        {
          "value": "1",
          "label": "Recovery runbook"
        }
      ],
      "tools": [
        "Ubuntu Server",
        "SSH",
        "systemd",
        "journalctl",
        "UFW",
        "Nginx",
        "Bash",
        "VirtualBox or VMware"
      ],
      "deliverables": [
        "VM and network architecture",
        "Secure-build checklist",
        "Service and firewall configuration",
        "Health-check output",
        "Backup and restore validation",
        "Incident records and recovery runbook"
      ],
      "architecture": {
        "type": "network",
        "caption": "Planned isolated lab. Addresses and service roles are design targets until real build evidence is attached.",
        "nodes": [
          {
            "id": "admin",
            "label": "ADMIN-WS-01",
            "type": "client",
            "x": 12,
            "y": 52,
            "detail": "Administration workstation using SSH keys and a restricted management path."
          },
          {
            "id": "vswitch",
            "label": "LAB-VSWITCH",
            "type": "switch",
            "x": 36,
            "y": 52,
            "detail": "Host-only or isolated virtual network for repeatable testing."
          },
          {
            "id": "app",
            "label": "APP-SRV-01",
            "type": "server",
            "x": 66,
            "y": 28,
            "detail": "Application server target: Nginx, systemd service checks, host firewall, and backup validation."
          },
          {
            "id": "mon",
            "label": "MON-SRV-01",
            "type": "server",
            "x": 66,
            "y": 72,
            "detail": "Monitoring and centralized-log target with health collection and alert simulation."
          },
          {
            "id": "backup",
            "label": "BACKUP TARGET",
            "type": "storage",
            "x": 90,
            "y": 52,
            "detail": "Versioned configuration backup and documented restore path."
          }
        ],
        "links": [
          {
            "from": "admin",
            "to": "vswitch",
            "label": "SSH / admin",
            "kind": "management"
          },
          {
            "from": "vswitch",
            "to": "app",
            "label": "service network",
            "kind": "service"
          },
          {
            "from": "vswitch",
            "to": "mon",
            "label": "logs / health",
            "kind": "trunk"
          },
          {
            "from": "app",
            "to": "backup",
            "label": "config backup",
            "kind": "storage"
          },
          {
            "from": "mon",
            "to": "backup",
            "label": "monitoring backup",
            "kind": "storage"
          }
        ]
      },
      "phases": [
        {
          "id": "plan",
          "title": "Resource and network plan",
          "status": "planned",
          "detail": "Document VM names, CPU, memory, storage, network mode, addresses, service roles, and rollback points."
        },
        {
          "id": "build",
          "title": "Secure operating-system build",
          "status": "planned",
          "detail": "Install, patch, create a non-root admin, configure SSH keys, time sync, host firewall, and baseline inventory."
        },
        {
          "id": "service",
          "title": "Application service",
          "status": "planned",
          "detail": "Install a simple service, define expected ports and process state, and verify persistence after reboot."
        },
        {
          "id": "observe",
          "title": "Logs and health monitoring",
          "status": "planned",
          "detail": "Capture CPU, memory, disk, network, service, and error-state checks; centralize or summarize logs."
        },
        {
          "id": "protect",
          "title": "Backup and restore",
          "status": "planned",
          "detail": "Back up at least one service configuration, restore it to a known state, and validate application behavior."
        },
        {
          "id": "recover",
          "title": "Controlled failures",
          "status": "planned",
          "detail": "Create service, storage, firewall, and DNS faults; diagnose from evidence; recover; and record the timeline."
        }
      ],
      "tests": [
        {
          "id": "LIN-01",
          "category": "Access",
          "requirement": "SSH key login succeeds for the admin user",
          "expected": "Key authentication works; no direct root workflow is required",
          "status": "pending"
        },
        {
          "id": "LIN-02",
          "category": "Security",
          "requirement": "Host firewall permits only documented services",
          "expected": "SSH and approved application ports succeed; unapproved test port is denied",
          "status": "pending"
        },
        {
          "id": "LIN-03",
          "category": "Service",
          "requirement": "Application service is healthy",
          "expected": "systemd reports active and the health endpoint responds",
          "status": "pending"
        },
        {
          "id": "LIN-04",
          "category": "Persistence",
          "requirement": "Service survives a planned reboot",
          "expected": "Service starts automatically and the endpoint returns after boot",
          "status": "pending"
        },
        {
          "id": "LIN-05",
          "category": "Monitoring",
          "requirement": "CPU, memory, disk, network, and service state are captured",
          "expected": "Health output includes timestamp and thresholds",
          "status": "pending"
        },
        {
          "id": "LIN-06",
          "category": "Logging",
          "requirement": "Service failure is visible in logs",
          "expected": "journal or centralized log identifies the failed unit and reason",
          "status": "pending"
        },
        {
          "id": "LIN-07",
          "category": "Storage",
          "requirement": "Low-disk condition is detected",
          "expected": "Threshold warning appears before application write failure",
          "status": "pending"
        },
        {
          "id": "LIN-08",
          "category": "Recovery",
          "requirement": "Backed-up configuration restores correctly",
          "expected": "Checksum or diff matches expected configuration and service validation passes",
          "status": "pending"
        },
        {
          "id": "LIN-09",
          "category": "Recovery",
          "requirement": "Firewall or DNS fault is isolated without unrelated changes",
          "expected": "Evidence points to the fault, one corrective change is made, and service is retested",
          "status": "pending"
        }
      ],
      "configs": [
        {
          "id": "ssh",
          "label": "SSH hardening template",
          "kind": "template",
          "language": "sshd_config",
          "code": "PermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nAllowUsers labadmin\nMaxAuthTries 3\nClientAliveInterval 300\nClientAliveCountMax 2"
        },
        {
          "id": "firewall",
          "label": "Host firewall template",
          "kind": "template",
          "language": "Shell",
          "code": "sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow from 10.50.0.10 to any port 22 proto tcp\nsudo ufw allow 80/tcp\nsudo ufw enable\nsudo ufw status verbose"
        },
        {
          "id": "health",
          "label": "Evidence-first health check",
          "kind": "template",
          "language": "Bash",
          "code": "#!/usr/bin/env bash\nset -euo pipefail\nprintf 'timestamp=%s\\n' \"$(date --iso-8601=seconds)\"\nsystemctl is-active nginx\ndf -h / /var\nfree -h\nip -brief address\nss -lntp\njournalctl -u nginx --since '-10 minutes' --no-pager | tail -40"
        },
        {
          "id": "disk-diff",
          "label": "Training diff: log rotation recovery",
          "kind": "simulation",
          "language": "Diff",
          "before": "/var/log/portfolio/*.log {\n  rotate 0\n  size 10G\n}",
          "after": "/var/log/portfolio/*.log {\n  daily\n  rotate 7\n  compress\n  missingok\n  notifempty\n}",
          "note": "Simulated example. Use your own log path, retention requirements, and measured validation."
        }
      ],
      "incidents": [
        {
          "code": "SIM-LIN-01",
          "title": "Service stopped",
          "severity": "Training P2",
          "symptom": "Host responds to ping and SSH, but the application endpoint is unavailable.",
          "diagnosis": "Check listening sockets, unit state, recent logs, and configuration validation before restarting.",
          "recovery": "Correct the unit or configuration, start it, verify persistence, and retest the endpoint."
        },
        {
          "code": "SIM-LIN-02",
          "title": "Disk pressure",
          "severity": "Training P2",
          "symptom": "Application is intermittent and cannot append logs.",
          "diagnosis": "Confirm reachability, inspect mounts and largest paths, then review rotation behavior.",
          "recovery": "Free space safely, repair retention, validate free capacity, and confirm normal writes."
        },
        {
          "code": "SIM-LIN-03",
          "title": "Firewall regression",
          "severity": "Training P3",
          "symptom": "Service is active locally but remote clients cannot connect.",
          "diagnosis": "Separate local process health from network reachability and compare active rules with the change record.",
          "recovery": "Restore the approved rule, test from the client path, and document rollback."
        },
        {
          "code": "SIM-LIN-04",
          "title": "DNS misconfiguration",
          "severity": "Training P3",
          "symptom": "IP access works while package and hostname operations fail.",
          "diagnosis": "Inspect resolver configuration, query the approved server directly, and compare search domains.",
          "recovery": "Restore resolver settings, flush or renew as appropriate, and validate fresh queries."
        }
      ],
      "evidence": [
        {
          "type": "Diagram",
          "label": "VM and network architecture",
          "status": "missing",
          "path": "diagrams/linux-architecture.png"
        },
        {
          "type": "Checklist",
          "label": "Secure-build checklist",
          "status": "missing",
          "path": "docs/secure-build.md"
        },
        {
          "type": "Configuration",
          "label": "Sanitized SSH, firewall, and service configs",
          "status": "missing",
          "path": "configs/"
        },
        {
          "type": "Testing",
          "label": "Completed service and recovery matrix",
          "status": "missing",
          "path": "tests/test-matrix.md"
        },
        {
          "type": "Monitoring",
          "label": "Health-check output and thresholds",
          "status": "missing",
          "path": "evidence/health-checks/"
        },
        {
          "type": "Recovery",
          "label": "Backup and restore validation",
          "status": "missing",
          "path": "evidence/restore-validation.md"
        },
        {
          "type": "Runbook",
          "label": "Service recovery runbook",
          "status": "missing",
          "path": "runbooks/service-recovery.md"
        }
      ],
      "recruiter": {
        "headline": "A Linux operations lab built around observable recovery",
        "summary": "This planned case study focuses on secure administration, service health, logs, storage, monitoring, and validated recovery. It will not be described as completed until the build checklist, command output, test matrix, and restore evidence are public.",
        "talkingPoints": [
          "Separate host reachability, process state, socket state, and application behavior.",
          "Show the documented normal state before presenting a fault.",
          "Use logs and resource evidence to justify the corrective action.",
          "Validate both immediate recovery and reboot persistence."
        ],
        "resumeBullet": "Built and operated a two-node Linux lab with secure SSH administration, service management, host firewall controls, health monitoring, log-based troubleshooting, and tested configuration recovery.",
        "locked": true
      }
    },
    "incident-response": {
      "number": "03",
      "route": "projects/incident-response.html",
      "title": "Break/Fix Incident Simulation",
      "shortTitle": "Incident Response",
      "eyebrow": "Troubleshooting discipline case study",
      "status": "planned",
      "summary": "Run controlled infrastructure incidents using an evidence-first workflow, document the timeline, isolate root cause, restore service, and produce a clean handoff.",
      "careerValue": "Highlights prioritization, troubleshooting structure, communication, escalation judgment, recovery validation, and operational documentation.",
      "metrics": [
        {
          "value": "10",
          "label": "Fault catalog target"
        },
        {
          "value": "5",
          "label": "Timed incidents"
        },
        {
          "value": "1",
          "label": "Full RCA"
        },
        {
          "value": "100%",
          "label": "Simulation-labeled"
        }
      ],
      "tools": [
        "Ticket notes",
        "OSI/TCP-IP model",
        "Linux logs",
        "Cisco show commands",
        "Root-cause analysis",
        "Change validation",
        "Shift handoff"
      ],
      "deliverables": [
        "Approved fault catalog",
        "Incident priority and symptom cards",
        "Timed troubleshooting records",
        "Recovery validation matrix",
        "One full root-cause analysis",
        "One prevention or recovery runbook"
      ],
      "architecture": {
        "type": "workflow",
        "caption": "Evidence-first incident workflow. The scenarios are controlled simulations and remain explicitly separated from production experience.",
        "nodes": [
          {
            "id": "detect",
            "label": "1 · Detect",
            "type": "alert",
            "x": 10,
            "y": 50,
            "detail": "Record the user-visible symptom, source, time, and affected service before changing anything."
          },
          {
            "id": "scope",
            "label": "2 · Scope",
            "type": "analysis",
            "x": 25,
            "y": 50,
            "detail": "Identify who and what is affected, severity, common failure domain, and recent change."
          },
          {
            "id": "evidence",
            "label": "3 · Gather",
            "type": "evidence",
            "x": 41,
            "y": 50,
            "detail": "Collect one discriminating observation at a time and preserve command output."
          },
          {
            "id": "isolate",
            "label": "4 · Isolate",
            "type": "analysis",
            "x": 57,
            "y": 50,
            "detail": "Narrow the fault boundary without making unrelated changes."
          },
          {
            "id": "recover",
            "label": "5 · Recover",
            "type": "repair",
            "x": 73,
            "y": 50,
            "detail": "Apply the smallest approved corrective action with a rollback path."
          },
          {
            "id": "validate",
            "label": "6 · Validate",
            "type": "test",
            "x": 88,
            "y": 50,
            "detail": "Repeat the original failing test, check dependencies, monitor stability, and document handoff."
          }
        ],
        "links": [
          {
            "from": "detect",
            "to": "scope",
            "label": "impact",
            "kind": "workflow"
          },
          {
            "from": "scope",
            "to": "evidence",
            "label": "hypothesis",
            "kind": "workflow"
          },
          {
            "from": "evidence",
            "to": "isolate",
            "label": "boundary",
            "kind": "workflow"
          },
          {
            "from": "isolate",
            "to": "recover",
            "label": "change",
            "kind": "workflow"
          },
          {
            "from": "recover",
            "to": "validate",
            "label": "proof",
            "kind": "workflow"
          }
        ]
      },
      "phases": [
        {
          "id": "catalog",
          "title": "Fault catalog and guardrails",
          "status": "planned",
          "detail": "Define each fault, expected symptoms, safe injection, rollback, hidden answer, and validation criteria."
        },
        {
          "id": "ticket",
          "title": "Ticket and severity model",
          "status": "planned",
          "detail": "Create concise fields for impact, urgency, timeline, observations, actions, status, and handoff."
        },
        {
          "id": "baseline",
          "title": "Normal-state evidence",
          "status": "planned",
          "detail": "Capture healthy addressing, interfaces, services, logs, storage, and endpoint checks before incidents."
        },
        {
          "id": "timed",
          "title": "Timed incident runs",
          "status": "planned",
          "detail": "Run at least five hidden-fault simulations without reading the answer and record each decision."
        },
        {
          "id": "review",
          "title": "After-action review",
          "status": "planned",
          "detail": "Grade diagnostic efficiency, unnecessary changes, communication, rollback readiness, and validation quality."
        },
        {
          "id": "rca",
          "title": "RCA and prevention",
          "status": "planned",
          "detail": "Produce one full root-cause analysis and one runbook or control that reduces recurrence or recovery time."
        }
      ],
      "tests": [
        {
          "id": "INC-01",
          "category": "Intake",
          "requirement": "Initial ticket captures impact and a reproducible symptom",
          "expected": "Affected users/service, start time, severity, and one failing test are documented",
          "status": "pending"
        },
        {
          "id": "INC-02",
          "category": "Scope",
          "requirement": "Common failure domain is considered before endpoint changes",
          "expected": "Scope notes distinguish one host, one VLAN, one service, or shared infrastructure",
          "status": "pending"
        },
        {
          "id": "INC-03",
          "category": "Evidence",
          "requirement": "Every action is tied to an observation or hypothesis",
          "expected": "Command history and notes show why each test was selected",
          "status": "pending"
        },
        {
          "id": "INC-04",
          "category": "Change",
          "requirement": "Corrective action is minimal and reversible",
          "expected": "One targeted change with rollback is recorded",
          "status": "pending"
        },
        {
          "id": "INC-05",
          "category": "Validation",
          "requirement": "Original symptom is retested after recovery",
          "expected": "Expected and actual results match, dependencies are checked, and monitoring is stable",
          "status": "pending"
        },
        {
          "id": "INC-06",
          "category": "Communication",
          "requirement": "Handoff is concise and actionable",
          "expected": "Current state, root cause, change, evidence, risk, and next action are included",
          "status": "pending"
        },
        {
          "id": "INC-07",
          "category": "Analysis",
          "requirement": "RCA distinguishes trigger, root cause, and contributing factors",
          "expected": "Timeline and prevention action are supported by evidence",
          "status": "pending"
        },
        {
          "id": "INC-08",
          "category": "Integrity",
          "requirement": "Simulation is clearly labeled",
          "expected": "No simulated output is presented as employer or production experience",
          "status": "pending"
        }
      ],
      "configs": [
        {
          "id": "ticket",
          "label": "Incident handoff template",
          "kind": "template",
          "language": "Markdown",
          "code": "# Incident handoff\n- ID / severity:\n- Started / detected:\n- User-visible impact:\n- Scope:\n- Last known good:\n- Recent change:\n- Evidence gathered:\n- Root cause:\n- Corrective action:\n- Validation:\n- Current risk / monitoring:\n- Next owner and action:"
        },
        {
          "id": "triage",
          "label": "Cross-domain triage checklist",
          "kind": "template",
          "language": "Shell / IOS",
          "code": "# Client / network\nipconfig /all | ip addr\nping <gateway>\ntraceroute <service>\nnslookup <name>\nshow interfaces status\nshow vlan brief\n\n# Linux service\nsystemctl status <unit>\nss -lntp\ndf -h\njournalctl -u <unit> --since '-15 minutes'"
        },
        {
          "id": "timeline",
          "label": "RCA timeline example structure",
          "kind": "template",
          "language": "Markdown",
          "code": "| Time | Observation / action | Evidence | Decision |\n|---|---|---|---|\n| 09:04 | Alert received | Monitoring event | Begin scope |\n| 09:07 | Gateway reachable | Ping output | Move above L3 client path |\n| 09:12 | Service unit failed | systemctl output | Validate config before restart |"
        }
      ],
      "incidents": [
        {
          "code": "SIM-IR-01",
          "title": "DNS outage",
          "severity": "Training P2",
          "symptom": "IP connectivity succeeds, but service names fail across multiple clients.",
          "diagnosis": "Separate reachability from resolution, query the resolver directly, and inspect service/config state.",
          "recovery": "Restore the known-good DNS configuration, restart safely, and validate fresh queries from a client."
        },
        {
          "code": "SIM-IR-02",
          "title": "Wrong VLAN",
          "severity": "Training P2",
          "symptom": "One endpoint receives addressing from an unexpected subnet while peers are healthy.",
          "diagnosis": "Compare lease, port identity, port mode, and VLAN membership.",
          "recovery": "Correct the access assignment, renew addressing, and repeat gateway and service tests."
        },
        {
          "code": "SIM-IR-03",
          "title": "Disk full",
          "severity": "Training P2",
          "symptom": "Application is reachable but cannot write logs or temporary data.",
          "diagnosis": "Inspect filesystems and largest paths, then check rotation and retention.",
          "recovery": "Free space safely, restore retention policy, and validate writes plus service health."
        },
        {
          "code": "SIM-IR-04",
          "title": "Uplink disabled",
          "severity": "Training P1",
          "symptom": "Several VLANs lose routed access at the same time.",
          "diagnosis": "Find the shared path, inspect interface state, and avoid endpoint-by-endpoint changes.",
          "recovery": "Restore the uplink, verify trunk state, and retest representative paths."
        },
        {
          "code": "SIM-IR-05",
          "title": "Firewall regression",
          "severity": "Training P3",
          "symptom": "Service is healthy locally but unreachable from the approved client path.",
          "diagnosis": "Compare socket, local request, remote request, and active policy with the change record.",
          "recovery": "Restore the approved rule and validate from the original client."
        },
        {
          "code": "SIM-IR-06",
          "title": "Service configuration error",
          "severity": "Training P2",
          "symptom": "Unit fails immediately after a configuration reload.",
          "diagnosis": "Inspect unit status and config validation output before repeated restarts.",
          "recovery": "Restore or correct the configuration, validate syntax, start once, and monitor."
        }
      ],
      "evidence": [
        {
          "type": "Catalog",
          "label": "Approved fault catalog",
          "status": "missing",
          "path": "incidents/fault-catalog.md"
        },
        {
          "type": "Tickets",
          "label": "Five completed incident records",
          "status": "missing",
          "path": "incidents/completed/"
        },
        {
          "type": "Timeline",
          "label": "Command and decision history",
          "status": "missing",
          "path": "evidence/timelines/"
        },
        {
          "type": "Testing",
          "label": "Recovery validation results",
          "status": "missing",
          "path": "tests/recovery-matrix.md"
        },
        {
          "type": "RCA",
          "label": "Full root-cause analysis",
          "status": "missing",
          "path": "docs/root-cause-analysis.md"
        },
        {
          "type": "Runbook",
          "label": "Prevention or recovery runbook",
          "status": "missing",
          "path": "runbooks/"
        }
      ],
      "recruiter": {
        "headline": "A transparent troubleshooting process—not a collection of guessed fixes",
        "summary": "This planned simulation package is meant to demonstrate how I scope incidents, gather discriminating evidence, make minimal reversible changes, validate recovery, and hand off clearly. Every scenario remains labeled simulation and will be backed by timed records before it is treated as completed portfolio work.",
        "talkingPoints": [
          "Start with impact, scope, and last known good state.",
          "Explain why each command changes the probability of a hypothesis.",
          "Show the smallest corrective action and rollback path.",
          "Close with original-symptom retest and dependency validation."
        ],
        "resumeBullet": "Diagnosed and resolved controlled networking and Linux incidents using an evidence-first workflow; documented timelines, root cause, corrective actions, validation, and operational handoffs.",
        "locked": true
      }
    },
    "rack-inventory": {
      "number": "04",
      "route": "projects/rack-inventory.html",
      "title": "Rack, Cabling & Asset Plan",
      "shortTitle": "Rack Operations",
      "eyebrow": "Physical infrastructure case study",
      "status": "planned",
      "summary": "Produce a rack elevation, redundant power plan, cable and port map, asset inventory, installation procedure, replacement scenario, and secure decommission checklist.",
      "careerValue": "Demonstrates attention to physical layout, labeling, power paths, change control, inventory accuracy, safe replacement, and clean handoff documentation.",
      "metrics": [
        {
          "value": "18U",
          "label": "Planned rack slice"
        },
        {
          "value": "A/B",
          "label": "Power paths"
        },
        {
          "value": "100%",
          "label": "Cable labels"
        },
        {
          "value": "1",
          "label": "Replacement drill"
        }
      ],
      "tools": [
        "Rack elevation",
        "Port map",
        "Cable labeling",
        "Asset inventory",
        "PDU planning",
        "Change procedure",
        "Decommission checklist"
      ],
      "deliverables": [
        "Front and rear rack elevation",
        "A/B power assumptions",
        "Cable and port map",
        "Asset inventory",
        "Install and rollback procedure",
        "Replacement and decommission records"
      ],
      "architecture": {
        "type": "rack",
        "caption": "Planned rack slice. Click a device to inspect its role, rack unit, network path, and power assumption.",
        "rackUnits": 18,
        "nodes": [
          {
            "id": "patch-a",
            "label": "PATCH-PNL-A",
            "type": "patch",
            "u": 18,
            "height": 1,
            "power": "Passive",
            "detail": "24-port copper patch panel. Every patch lead receives a unique cable ID."
          },
          {
            "id": "patch-b",
            "label": "PATCH-PNL-B",
            "type": "patch",
            "u": 17,
            "height": 1,
            "power": "Passive",
            "detail": "Service and management patching with source/destination recorded in the port map."
          },
          {
            "id": "core",
            "label": "CORE-SW-01",
            "type": "core",
            "u": 15,
            "height": 1,
            "power": "A/B",
            "detail": "Core switch with redundant power feeds and documented uplinks."
          },
          {
            "id": "access",
            "label": "ACCESS-SW-01",
            "type": "switch",
            "u": 13,
            "height": 1,
            "power": "A",
            "detail": "Access switching and endpoint patching. Planned spare ports are documented."
          },
          {
            "id": "app",
            "label": "APP-SRV-01",
            "type": "server",
            "u": 9,
            "height": 2,
            "power": "A/B",
            "detail": "Application server with dual network and power connections."
          },
          {
            "id": "mon",
            "label": "MON-SRV-01",
            "type": "server",
            "u": 6,
            "height": 2,
            "power": "A/B",
            "detail": "Monitoring and logging server with management and service interfaces."
          },
          {
            "id": "storage",
            "label": "LAB-STOR-01",
            "type": "storage",
            "u": 2,
            "height": 3,
            "power": "A/B",
            "detail": "Lab storage target. Capacity and replacement assumptions are documented rather than presented as production design."
          },
          {
            "id": "pdu",
            "label": "PDU-A / PDU-B",
            "type": "power",
            "u": 0,
            "height": 0,
            "power": "Facility A/B",
            "detail": "Rear 0U redundant power distribution with per-device feed mapping."
          }
        ],
        "links": [
          {
            "from": "patch-a",
            "to": "core",
            "label": "uplinks",
            "kind": "trunk"
          },
          {
            "from": "patch-b",
            "to": "access",
            "label": "patching",
            "kind": "access"
          },
          {
            "from": "core",
            "to": "app",
            "label": "service A/B",
            "kind": "service"
          },
          {
            "from": "core",
            "to": "mon",
            "label": "monitoring A/B",
            "kind": "management"
          },
          {
            "from": "app",
            "to": "storage",
            "label": "storage path",
            "kind": "storage"
          }
        ]
      },
      "phases": [
        {
          "id": "requirements",
          "title": "Physical requirements",
          "status": "planned",
          "detail": "Document device dimensions, weight assumptions, airflow direction, port counts, power feeds, maintenance clearance, and constraints."
        },
        {
          "id": "elevation",
          "title": "Rack elevation",
          "status": "planned",
          "detail": "Place equipment by weight, airflow, serviceability, patching, and growth; reserve and label unused rack units."
        },
        {
          "id": "power",
          "title": "Power-path plan",
          "status": "planned",
          "detail": "Map each power supply to PDU A or B and record single-feed exceptions without inventing measured facility capacity."
        },
        {
          "id": "cabling",
          "title": "Cable and port mapping",
          "status": "planned",
          "detail": "Assign cable IDs, source/destination ports, media type, path, purpose, and validation status."
        },
        {
          "id": "change",
          "title": "Install and rollback procedure",
          "status": "planned",
          "detail": "Write prechecks, safety controls, installation sequence, validation, rollback, and handoff steps."
        },
        {
          "id": "lifecycle",
          "title": "Replacement and decommission",
          "status": "planned",
          "detail": "Simulate a failed-device replacement, update records, and document secure data handling and asset disposition."
        }
      ],
      "tests": [
        {
          "id": "RACK-01",
          "category": "Layout",
          "requirement": "Every device has an assigned rack position and height",
          "expected": "No overlap; heavy equipment is low; service clearance is documented",
          "status": "pending"
        },
        {
          "id": "RACK-02",
          "category": "Power",
          "requirement": "Dual-supply devices map to separate A/B feeds",
          "expected": "Every power supply has a PDU and outlet assumption",
          "status": "pending"
        },
        {
          "id": "RACK-03",
          "category": "Cabling",
          "requirement": "Every network cable has a unique ID",
          "expected": "Source, destination, ports, media, purpose, and status are recorded",
          "status": "pending"
        },
        {
          "id": "RACK-04",
          "category": "Inventory",
          "requirement": "Asset records match the elevation and port map",
          "expected": "Hostname, device type, rack unit, power, management address, owner, and state agree",
          "status": "pending"
        },
        {
          "id": "RACK-05",
          "category": "Change",
          "requirement": "Install procedure includes precheck and rollback",
          "expected": "Risk, maintenance window, tools, safety, validation, and rollback are explicit",
          "status": "pending"
        },
        {
          "id": "RACK-06",
          "category": "Replacement",
          "requirement": "Failed-device scenario preserves labels and records",
          "expected": "Replacement is validated and inventory, cable map, and handoff are updated",
          "status": "pending"
        },
        {
          "id": "RACK-07",
          "category": "Lifecycle",
          "requirement": "Decommission checklist protects data and inventory integrity",
          "expected": "Access, data handling, asset state, cable removal, and disposition are documented",
          "status": "pending"
        },
        {
          "id": "RACK-08",
          "category": "Safety",
          "requirement": "Procedure identifies handling and ESD controls",
          "expected": "Lift, power, ESD, airflow, and tool risks are acknowledged",
          "status": "pending"
        }
      ],
      "configs": [
        {
          "id": "asset",
          "label": "Asset record template",
          "kind": "template",
          "language": "CSV",
          "code": "Asset_ID,Hostname,Device_Type,Model,Serial_Sanitized,Rack,RU_Position,Power_A,Power_B,Management_IP,Owner,Status,Notes\nLAB-001,CORE-SW-01,Switch,TBD,REDACTED,RACK-A,U15,PDU-A-08,PDU-B-08,10.99.0.2,Lab,Planned,Replace with verified inventory"
        },
        {
          "id": "cable",
          "label": "Cable and port map template",
          "kind": "template",
          "language": "CSV",
          "code": "Cable_ID,Source_Device,Source_Port,Destination_Device,Destination_Port,Media,Path,Purpose,Status\nC-A-001,CORE-SW-01,Gi1/0/24,EDGE-RTR-01,Gi0/0,Cat6A,Front-A,Core uplink,Planned"
        },
        {
          "id": "change",
          "label": "Replacement procedure skeleton",
          "kind": "template",
          "language": "Markdown",
          "code": "1. Confirm incident, scope, approval, replacement identity, and rollback.\n2. Photograph and verify labels before disconnecting.\n3. Record power feeds, ports, optics, and cable IDs.\n4. Remove power and network in the approved sequence.\n5. Install replacement; reconnect by record, not memory.\n6. Validate power, management, links, service, alarms, and redundancy.\n7. Update inventory, port map, incident, and handoff."
        },
        {
          "id": "cable-diff",
          "label": "Training diff: corrected port map",
          "kind": "simulation",
          "language": "Diff",
          "before": "C-A-014,ACCESS-SW-01,Gi1/0/14,APP-SRV-01,eno1,Cat6A,Front-B,service,active",
          "after": "C-A-014,CORE-SW-01,Gi1/0/14,APP-SRV-01,eno1,Cat6A,Front-B,service,verified",
          "note": "Simulated record correction. Replace with a real discrepancy and verification trail after the lab."
        }
      ],
      "incidents": [
        {
          "code": "SIM-RACK-01",
          "title": "Mislabeled patch lead",
          "severity": "Training P3",
          "symptom": "Port map points to a different switch port than the physical label.",
          "diagnosis": "Trace both ends, compare link state and MAC learning, and preserve the original record.",
          "recovery": "Correct the label and source-of-truth record, then validate the service path."
        },
        {
          "code": "SIM-RACK-02",
          "title": "Single power feed",
          "severity": "Training P2",
          "symptom": "A dual-supply server has both cords connected to the same PDU.",
          "diagnosis": "Compare rear inspection, PDU outlet map, and asset power assumptions.",
          "recovery": "Move one supply during an approved window, validate redundancy, and update the map."
        },
        {
          "code": "SIM-RACK-03",
          "title": "Replacement port mismatch",
          "severity": "Training P2",
          "symptom": "New device powers on, but one service link remains down.",
          "diagnosis": "Compare old/new port identities, optics/media, cable ID, and switch-side interface state.",
          "recovery": "Reconnect to the documented port or update configuration through change control, then validate."
        }
      ],
      "evidence": [
        {
          "type": "Diagram",
          "label": "Front and rear rack elevation",
          "status": "missing",
          "path": "diagrams/rack-elevation.pdf"
        },
        {
          "type": "Power",
          "label": "A/B feed map and assumptions",
          "status": "missing",
          "path": "docs/power-map.md"
        },
        {
          "type": "Cabling",
          "label": "Completed cable and port map",
          "status": "missing",
          "path": "docs/cable-port-map.csv"
        },
        {
          "type": "Inventory",
          "label": "Completed sanitized asset inventory",
          "status": "missing",
          "path": "docs/asset-inventory.csv"
        },
        {
          "type": "Procedure",
          "label": "Install, validation, and rollback procedure",
          "status": "missing",
          "path": "runbooks/install-change.md"
        },
        {
          "type": "Replacement",
          "label": "Replacement scenario record",
          "status": "missing",
          "path": "incidents/replacement-drill.md"
        },
        {
          "type": "Lifecycle",
          "label": "Secure decommission checklist",
          "status": "missing",
          "path": "runbooks/decommission.md"
        }
      ],
      "recruiter": {
        "headline": "A physical-operations package built around traceability",
        "summary": "This planned case study is designed to show disciplined rack layout, cable and asset traceability, redundant power assumptions, safe change procedure, replacement validation, and lifecycle documentation. It remains planned until the maps, records, and drill evidence are public.",
        "talkingPoints": [
          "Explain layout decisions in terms of weight, airflow, serviceability, and growth.",
          "Trace one server from rack unit to switch port, cable ID, power feeds, and asset record.",
          "Walk through a replacement using records rather than memory.",
          "Show how every map and inventory record is updated after the change."
        ],
        "resumeBullet": "Created and validated a rack, cabling, power, and asset-management package with labeled port maps, installation and rollback procedures, replacement testing, and secure decommission controls.",
        "locked": true
      }
    }
  },
  "commands": [
    {
      "id": "home",
      "label": "Go to portfolio home",
      "keywords": "home top overview",
      "action": "navigate",
      "target": "index.html"
    },
    {
      "id": "proof",
      "label": "View verified proof ledger",
      "keywords": "verified evidence recruiter proof",
      "action": "section",
      "target": "#verified-proof"
    },
    {
      "id": "simulation",
      "label": "Switch to Simulation Mode",
      "keywords": "incident simulator training lab",
      "action": "proof-mode",
      "target": "simulation"
    },
    {
      "id": "verified",
      "label": "Switch to Verified Evidence Mode",
      "keywords": "proof recruiter evidence",
      "action": "proof-mode",
      "target": "verified"
    },
    {
      "id": "tour",
      "label": "Start the 60-second recruiter tour",
      "keywords": "tour presentation recruiter",
      "action": "tour"
    },
    {
      "id": "resume",
      "label": "Open resume",
      "keywords": "cv resume print",
      "action": "navigate",
      "target": "resume.html"
    },
    {
      "id": "github",
      "label": "Open GitHub source repository",
      "keywords": "source code repository",
      "action": "external",
      "target": "https://github.com/wfazli52/wfazli52.github.io"
    },
    {
      "id": "operations",
      "label": "Enter full-screen operations mode",
      "keywords": "operations fullscreen simulator",
      "action": "operations"
    },
    {
      "id": "terminal",
      "label": "Focus the troubleshooting terminal",
      "keywords": "terminal command ping nslookup",
      "action": "terminal"
    },
    {
      "id": "effects",
      "label": "Pause or resume visual effects",
      "keywords": "motion animation accessibility",
      "action": "effects"
    },
    {
      "id": "install",
      "label": "Install portfolio app",
      "keywords": "pwa app offline install",
      "action": "install"
    },
    {
      "id": "share",
      "label": "Copy portfolio link",
      "keywords": "share copy url",
      "action": "copy-link"
    },
    {
      "id": "brief",
      "label": "Download recruiter brief",
      "keywords": "download summary markdown evidence",
      "action": "download-brief"
    },
    {
      "id": "shortcuts",
      "label": "Show keyboard shortcuts",
      "keywords": "help keys accessibility",
      "action": "shortcuts"
    }
  ],
  "shortcuts": [
    {
      "keys": "Ctrl/⌘ + K",
      "label": "Open command palette"
    },
    {
      "keys": "Alt + P",
      "label": "Toggle Proof / Simulation mode"
    },
    {
      "keys": "Alt + R",
      "label": "Start recruiter tour"
    },
    {
      "keys": "Alt + T",
      "label": "Focus troubleshooting terminal"
    },
    {
      "keys": "O",
      "label": "Toggle operations mode while not typing"
    },
    {
      "keys": "Esc",
      "label": "Close the active overlay"
    }
  ]
};
