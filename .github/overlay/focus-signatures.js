(() => {
  'use strict';
  if (window.__AF_FOCUS_SIGNATURES__) return;
  window.__AF_FOCUS_SIGNATURES__ = true;

  const html = document.documentElement;
  const base = 'https://github.com/wfazli52/wfazli52.github.io/tree/main/.github/signature-projects';

  const projects = {
    google: [
      {
        title: 'GKE SRE Observability Lab',
        description: 'Deploy a GKE workload, validate probes and rollout health, wire a Managed Prometheus-style PodMonitoring resource, then publish real operational evidence.',
        link: `${base}/google/gke-sre-observability`
      },
      {
        title: 'Kubernetes SRE GameDay',
        description: 'Run a controlled availability incident, observe symptoms, recover service, validate it, and write an SRE-style incident review.',
        link: `${base}/google/sre-gameday`
      }
    ],
    amazon: [
      {
        title: 'Private EC2 Ops with Systems Manager',
        description: 'Terraform a private EC2 node with no public IPv4 or inbound SSH, then operate it through SSM and private service endpoints.',
        link: `${base}/amazon/private-ec2-ops`
      },
      {
        title: 'CloudWatch + SSM Operations Runbook',
        description: 'Build status-check monitoring, run repeatable Linux health checks through Systems Manager, and document detection-to-validation workflow.',
        link: `${base}/amazon/cloudwatch-ssm-runbook`
      }
    ],
    microsoft: [
      {
        title: 'Azure Arc Hybrid Server Operations',
        description: 'Connect a disposable server to Azure Arc, verify the connected-machine agent, inspect extensions and publish hybrid-management evidence.',
        link: `${base}/microsoft/azure-arc-hybrid-ops`
      },
      {
        title: 'PowerShell Windows Server Baseline',
        description: 'Generate a reusable Windows Server health/inventory baseline, run a controlled break-fix exercise, and prove before/after recovery.',
        link: `${base}/microsoft/powershell-server-baseline`
      }
    ]
  };

  const status = '<span class="focus-signature-status">Ready to build</span>';

  function googleSection() {
    const cards = projects.google.map((project) => `<a class="google-signature-card" href="${project.link}"><div class="sig-dots"><i></i><i></i><i></i><i></i></div><h3>${project.title}</h3><p>${project.description}</p><footer>${status}<strong>Open project pack ↗</strong></footer></a>`).join('');
    return `<section class="focus-signature-section google-signatures"><div class="google-signatures-head"><span>Signature builds</span><h2>Google-style reliability projects.</h2><p>These packs are designed around Kubernetes, SRE thinking, observability and controlled failure. They are ready to run later and remain unclaimed until real evidence is published.</p></div><div class="google-signature-grid">${cards}</div></section>`;
  }

  function amazonSection() {
    const cards = projects.amazon.map((project, index) => `<a class="amazon-signature-card" href="${project.link}"><span class="amazon-signature-icon">${index ? 'CW' : 'EC2'}</span><div><h3>${project.title}</h3><p>${project.description}</p><footer>${status}</footer></div><strong>Open ›</strong></a>`).join('');
    return `<section class="focus-signature-section amazon-signatures"><div class="amazon-signatures-head"><div><small>SIGNATURE AWS BUILDS</small><h2>Cloud operations project packs</h2></div><p>Private administration, Systems Manager, CloudWatch and evidence-first operations. Ready to build later; not marked complete.</p></div><div class="amazon-signature-grid">${cards}</div></section>`;
  }

  function microsoftSection() {
    const cards = projects.microsoft.map((project) => `<a class="microsoft-signature-card" href="${project.link}"><div class="sig-ms-mark"><i></i><i></i><i></i><i></i></div><h3>${project.title}</h3><p>${project.description}</p><footer>${status}<strong>Open project pack ↗</strong></footer></a>`).join('');
    return `<section class="focus-signature-section microsoft-signatures"><div class="microsoft-signatures-head"><div><small>SIGNATURE BUILDS</small><h2>Hybrid systems workspace</h2></div><p>Azure Arc and PowerShell-focused projects for Windows/hybrid infrastructure operations, with runnable verification and evidence templates.</p></div><div class="microsoft-signature-grid">${cards}</div></section>`;
  }

  function inject(name) {
    const app = document.querySelector(`.focus-v60-app[data-mode="${name}"]`);
    if (!app || app.querySelector('.focus-signature-section')) return;
    if (name === 'google') {
      const anchor = app.querySelector('#v60-g-work');
      anchor?.insertAdjacentHTML('afterend', googleSection());
    } else if (name === 'amazon') {
      const anchor = app.querySelector('#amazon-resources') || app.querySelector('.amazon-focus-resources');
      anchor?.insertAdjacentHTML('afterend', amazonSection());
    } else if (name === 'microsoft') {
      const anchor = app.querySelector('#v60-m-work');
      anchor?.insertAdjacentHTML('afterend', microsoftSection());
    }
  }

  function schedule(name) {
    if (!projects[name]) return;
    setTimeout(() => inject(name), name === 'amazon' ? 120 : 40);
  }

  window.addEventListener('google-focus:start', () => schedule('google'));
  window.addEventListener('amazon-focus:start', () => schedule('amazon'));
  window.addEventListener('microsoft-focus:start', () => schedule('microsoft'));
  window.addEventListener('future:focus-theme', (event) => schedule(event.detail?.name || html.dataset.focus || 'original'));
  schedule(html.dataset.focus || 'original');
})();