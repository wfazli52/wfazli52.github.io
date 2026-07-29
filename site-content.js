/*
  EDIT THIS FILE FIRST.
  Everything wrapped in [BRACKETS] is a placeholder for your real information.
  The page updates automatically from this object.
*/
window.PORTFOLIO_SPECIMEN = {
  meta: {
    version: "Vol. 01 / Iss. 01",
    edition: "v1.0 · 2026",
    folio: "001 / 008",
    format: "Specimen sheet",
    established: "2026"
  },

  identity: {
    name: "[YOUR NAME]",
    initials: "YN",
    discipline: "Data Center · Networking · Systems",
    location: "[YOUR CITY, STATE]",
    coordinate: "[00.000° N]",
    role: "Aspiring Data Center Technician & Network Engineer",
    heroLineOne: "I build",
    heroLineTwo: "systems.",
    heroSub: "and I learn how to keep them running",
    tagline: "I am building hands-on evidence in networking, Linux, server operations, hardware troubleshooting, and technical documentation while completing my network engineering degree.",
    bio: "[WRITE A 3–5 SENTENCE INTRODUCTION ABOUT YOUR BACKGROUND, THE KIND OF PROBLEMS YOU ENJOY SOLVING, AND THE ROLE YOU ARE TARGETING. KEEP IT PERSONAL AND SPECIFIC.]"
  },

  current: {
    degree: "WGU · B.S. Network Engineering · Cisco track",
    stack: "Cisco IOS · Linux · Git",
    focus: "VLANs · routing · break/fix",
    homelab: "[ADD YOUR HOME LAB HARDWARE OR SOFTWARE]",
    status: "Open to entry-level roles",
    response: "Within 48 hours",
    personalDetail: "[ADD A SMALL PERSONAL DETAIL]"
  },

  links: {
    email: "[YOUR PROFESSIONAL EMAIL]",
    github: "https://github.com/wfazli52",
    linkedin: "[YOUR LINKEDIN URL]",
    resume: "resume.html"
  },

  kpis: [
    { label: "Verified projects", value: "0", unit: "public" },
    { label: "Career roadmap", value: "90", unit: "days" },
    { label: "Lab blueprints", value: "4", unit: "ready" },
    { label: "Current degree", value: "B.S.", unit: "in progress" },
    { label: "Target role", value: "DC", unit: "technician" }
  ],

  ticker: [
    "Now building: Enterprise VLAN lab",
    "Studying: Network engineering",
    "Practicing: Linux operations",
    "Documenting: Break/fix workflows",
    "Open to data center technician roles",
    "[ADD YOUR LOCATION]",
    "[ADD YOUR EMAIL]"
  ],

  aboutStats: [
    { value: "4", label: "planned technical labs" },
    { value: "6", label: "evidence templates" },
    { value: "90", label: "day career sprint" },
    { value: "1", label: "public portfolio" }
  ],

  skills: [
    {
      group: "Operations",
      items: ["Incident notes", "Runbooks & SOPs", "Change validation", "Escalation discipline", "Asset tracking"]
    },
    {
      group: "Systems & Networking",
      items: ["TCP/IP", "IPv4 subnetting", "VLANs & trunks", "DNS & DHCP", "Linux fundamentals"]
    },
    {
      group: "Data Center & Hardware",
      items: ["Component identification", "Rack planning", "Cable labeling", "Break/fix logic", "ESD & handling"]
    },
    {
      group: "Tools & Learning",
      items: ["Cisco Packet Tracer", "Git & GitHub", "Virtual machines", "Command-line troubleshooting", "[ADD YOUR TOOLS]"]
    }
  ],

  projects: [
    {
      number: "01",
      title: "Enterprise VLAN & Routing Lab",
      shortTitle: "Network lab",
      year: "2026",
      type: "Networking",
      status: "Planned",
      description: "Design a segmented multi-department network with VLANs, inter-VLAN routing, DHCP, DNS, ACLs, and a repeatable acceptance-test matrix.",
      tags: ["Packet Tracer", "Cisco IOS", "TCP/IP"],
      link: "projects/enterprise-network.html",
      metrics: { scope: "4 VLANs", evidence: "0 / 7", phase: "Design" },
      phases: [
        { title: "Map the network.", body: "Create the requirements, subnet plan, device names, VLAN boundaries, and physical/logical topology before touching configuration." },
        { title: "Make traffic move.", body: "Configure switching, trunks, gateways, routing, DHCP, DNS, and an access-control policy with clear expected behavior." },
        { title: "Prove the result.", body: "Run acceptance tests, inject controlled faults, record the troubleshooting path, and publish only sanitized evidence." }
      ]
    },
    {
      number: "02",
      title: "Linux Server Operations Lab",
      shortTitle: "Linux operations",
      year: "2026",
      type: "Systems",
      status: "Planned",
      description: "Operate two Linux servers, secure remote access, manage services and storage, inspect logs, monitor health, and recover from controlled failures.",
      tags: ["Linux", "SSH", "Systemd"],
      link: "projects/linux-monitoring.html",
      metrics: { scope: "2 servers", evidence: "0 / 7", phase: "Plan" },
      phases: [
        { title: "Build the hosts.", body: "Define compute, storage, naming, users, SSH access, firewall rules, patching, and the normal operating baseline." },
        { title: "Watch the signals.", body: "Use services, logs, storage checks, process inspection, and lightweight monitoring to understand healthy behavior." },
        { title: "Recover on purpose.", body: "Stop services, fill storage safely, introduce DNS and firewall faults, then document recovery and validation." }
      ]
    },
    {
      number: "03",
      title: "Rack, Cabling & Incident Operations",
      shortTitle: "Operations lab",
      year: "2026",
      type: "Data center",
      status: "Planned",
      description: "Create a rack elevation, port and cable map, asset register, replacement workflow, incident timeline, and decommission checklist.",
      tags: ["Rack & stack", "Cabling", "RCA"],
      link: "projects/rack-inventory.html",
      metrics: { scope: "1 rack", evidence: "0 / 7", phase: "Plan" },
      phases: [
        { title: "Lay out the rack.", body: "Place compute, switching, patching, and power with readable rack units, labels, port assignments, and A/B feed assumptions." },
        { title: "Trace every path.", body: "Make power, copper, fiber, management, and service dependencies understandable to someone taking the next shift." },
        { title: "Operate through failure.", body: "Simulate a component replacement and incident handoff, then update inventory, cabling, validation, and decommission records." }
      ]
    },
    {
      number: "04",
      title: "[YOUR NEXT ORIGINAL PROJECT]",
      shortTitle: "[PROJECT TYPE]",
      year: "[YEAR]",
      type: "[CATEGORY]",
      status: "Placeholder",
      description: "[DESCRIBE A PROJECT THAT SHOWS A DIFFERENT SKILL: AUTOMATION, MONITORING, HARDWARE REPAIR, CLOUD, SECURITY, OR DATA ANALYSIS.]",
      tags: ["[TOOL 1]", "[TOOL 2]", "[SKILL]"],
      link: "projects/incident-response.html",
      metrics: { scope: "[SCOPE]", evidence: "0 / ?", phase: "Idea" },
      phases: [
        { title: "[PHASE ONE]", body: "[WHAT YOU WILL DESIGN OR PREPARE.]" },
        { title: "[PHASE TWO]", body: "[WHAT YOU WILL CONFIGURE OR BUILD.]" },
        { title: "[PHASE THREE]", body: "[HOW YOU WILL TEST AND DOCUMENT IT.]" }
      ]
    }
  ],

  experience: [
    {
      role: "[YOUR CURRENT OR MOST RECENT ROLE]",
      company: "[COMPANY]",
      dates: "[YEAR–YEAR]",
      location: "[CITY, STATE]",
      summary: "[WRITE 2–3 SENTENCES ABOUT YOUR RESPONSIBILITIES, THE SYSTEMS OR CUSTOMERS YOU SUPPORTED, AND ONE VERIFIABLE RESULT. DO NOT INVENT METRICS.]"
    },
    {
      role: "[PREVIOUS ROLE]",
      company: "[COMPANY]",
      dates: "[YEAR–YEAR]",
      location: "[CITY, STATE]",
      summary: "[ADD THE MOST RELEVANT TRANSFERABLE EXPERIENCE: TROUBLESHOOTING, CUSTOMER SERVICE, PHYSICAL OPERATIONS, DOCUMENTATION, SAFETY, OR SHIFT WORK.]"
    },
    {
      role: "[OPTIONAL THIRD ROLE]",
      company: "[COMPANY]",
      dates: "[YEAR–YEAR]",
      location: "[CITY, STATE]",
      summary: "[REMOVE THIS ENTRY IF YOU DO NOT NEED IT.]"
    }
  ],

  education: [
    {
      degree: "B.S. Network Engineering · Cisco track",
      school: "Western Governors University",
      dates: "In progress",
      note: "[ADD EXPECTED GRADUATION DATE, COMPLETED CERTIFICATIONS, OR RELEVANT COURSEWORK WHEN YOU ARE READY.]"
    },
    {
      degree: "[OPTIONAL CERTIFICATION OR EDUCATION]",
      school: "[ISSUER OR SCHOOL]",
      dates: "[DATE / IN PROGRESS]",
      note: "[REMOVE THIS PLACEHOLDER IF UNUSED.]"
    }
  ],

  contact: {
    heading: "Let’s build the next system.",
    body: "[ADD A SHORT, DIRECT CALL TO ACTION FOR RECRUITERS OR HIRING MANAGERS.]",
    availability: "Available for data center technician, deployment technician, NOC, and network-support opportunities."
  }
};
