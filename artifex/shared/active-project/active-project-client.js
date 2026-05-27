(() => {
  const VERSION = '1.0.0';
  const LIBRARY_KEY = 'artifex.projectLibrary';
  const ACTIVE_KEY = 'artifex.activeProjectId';
  const ROOT_CLASS = 'artifex-active-project-ready';

  function readLibrary() {
    try {
      return JSON.parse(localStorage.getItem(LIBRARY_KEY) || '{}') || {};
    } catch {
      return {};
    }
  }

  function getProjectIdFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('project');
    } catch {
      return null;
    }
  }

  function resolveActiveProject() {
    const library = readLibrary();
    const urlProject = getProjectIdFromUrl();
    if (urlProject && library[urlProject]) {
      localStorage.setItem(ACTIVE_KEY, urlProject);
      return library[urlProject];
    }

    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (activeId && library[activeId]) return library[activeId];

    return null;
  }

  function expose(project) {
    window.ArtifexActiveProject = {
      version: VERSION,
      libraryKey: LIBRARY_KEY,
      activeKey: ACTIVE_KEY,
      project,
      projectId: project?.projectId || null,
      projectName: project?.projectName || null,
      library: readLibrary(),
      refresh() {
        const nextProject = resolveActiveProject();
        this.project = nextProject;
        this.projectId = nextProject?.projectId || null;
        this.projectName = nextProject?.projectName || null;
        this.library = readLibrary();
        renderBanner(nextProject);
        return nextProject;
      }
    };
    window.dispatchEvent(new CustomEvent('artifex:active-project-ready', { detail: window.ArtifexActiveProject }));
  }

  function injectStyles() {
    if (document.getElementById('artifex-active-project-style')) return;
    const style = document.createElement('style');
    style.id = 'artifex-active-project-style';
    style.textContent = `
      .artifex-active-project-pill {
        position: fixed;
        right: 14px;
        bottom: 14px;
        z-index: 9999;
        max-width: min(420px, calc(100vw - 28px));
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 11px;
        border: 1px solid rgba(226, 204, 167, .32);
        border-radius: 999px;
        color: #f4dfc4;
        background: rgba(8, 5, 7, .86);
        box-shadow: 0 10px 30px rgba(0,0,0,.55), 0 0 24px rgba(143,109,255,.24);
        font: 700 11px/1.2 Inter, Arial, sans-serif;
        letter-spacing: .04em;
        backdrop-filter: blur(7px);
        pointer-events: auto;
      }
      .artifex-active-project-pill strong {
        color: #fff2cf;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .artifex-active-project-pill span {
        color: #a98f72;
        text-transform: uppercase;
        font-size: 9px;
        letter-spacing: .12em;
      }
      .artifex-active-project-pill.no-project { border-color: rgba(217, 164, 65, .5); color: #d9a441; }
      .artifex-active-project-pill button {
        margin-left: 4px;
        border: 1px solid rgba(226,204,167,.24);
        border-radius: 999px;
        color: inherit;
        background: rgba(255,255,255,.06);
        font: inherit;
        padding: 3px 7px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function renderBanner(project) {
    injectStyles();
    let pill = document.getElementById('artifex-active-project-pill');
    if (!pill) {
      pill = document.createElement('aside');
      pill.id = 'artifex-active-project-pill';
      pill.className = 'artifex-active-project-pill';
      document.body.appendChild(pill);
    }

    if (project) {
      pill.className = 'artifex-active-project-pill';
      pill.innerHTML = `<span>Active project</span><strong>${escapeHtml(project.projectName || project.projectId)}</strong><button type="button" title="Open Creation Guide">Open</button>`;
    } else {
      pill.className = 'artifex-active-project-pill no-project';
      pill.innerHTML = `<span>No active project</span><strong>Choose in Hub</strong><button type="button" title="Open Creation Guide">Open</button>`;
    }

    pill.querySelector('button')?.addEventListener('click', () => {
      const relative = location.pathname.includes('/artifex/apps/') ? '../creation-guide/' : 'apps/creation-guide/';
      window.location.href = `${relative}?fresh=active-project-client&from=${encodeURIComponent(location.pathname)}`;
    });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));
  }

  function boot() {
    const project = resolveActiveProject();
    document.documentElement.classList.add(ROOT_CLASS);
    expose(project);
    renderBanner(project);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
