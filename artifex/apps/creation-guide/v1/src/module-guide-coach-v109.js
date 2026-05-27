const COACH_VERSION = 'V1.0.9';
let coachStep = 0;
let coachQueued = false;
let coachEventsReady = false;
let coachObserverReady = false;
let lastCoachHtml = '';

const coachSteps = [
  {
    title: 'Welcome — set up the project first',
    ids: ['side-panel-toggle-button'],
    text: () => 'This screen creates the project shell that every Artifex app will use. Start by opening the setup panel on the left, then fill the fields from top to bottom.',
    done: () => !document.getElementById('left-panel')?.classList.contains('collapsed')
  },
  {
    title: '1. Enter the project name',
    ids: ['game-title-input'],
    text: () => isNamedProject() ? `Project name is set to “${valueOf('game-title-input')}”. Press Next or click the Project ID field below.` : 'Type the human-readable project name, for example “Forever Bound”. This is the name that will display in the Hub and Project Library.',
    done: () => isNamedProject()
  },
  {
    title: '2. Confirm the project ID / slug',
    ids: ['project-id-input', 'use-suggested-slug-button'],
    text: () => validSlug(valueOf('project-id-input')) ? `The project ID is “${valueOf('project-id-input')}”. This becomes the safe folder/file identifier used by exported JSON.` : 'Use the suggested slug, or type a simple lowercase ID with hyphens, like “forever-bound”. No spaces here.',
    done: () => validSlug(valueOf('project-id-input'))
  },
  {
    title: '3. Add the creator or studio',
    ids: ['creator-input'],
    text: () => valueOf('creator-input') ? `Creator/studio is set to “${valueOf('creator-input')}”.` : 'Enter the creator or studio name. This goes into the project metadata and starter README.',
    done: () => Boolean(valueOf('creator-input'))
  },
  {
    title: '4. Choose where the project lives locally',
    ids: ['project-folder-input', 'choose-local-folder-button'],
    text: () => valueOf('project-folder-input') ? `Local project location is set to “${valueOf('project-folder-input')}”. Browser security may only show the folder name, which is fine for now.` : 'Choose a folder or type the planned local project path. This is where you will unzip the exported project folder.',
    done: () => Boolean(valueOf('project-folder-input'))
  },
  {
    title: '5. Optional: connect a GitHub repo path',
    ids: ['use-github-input', 'github-username-input', 'online-path-input', 'open-online-path-button'],
    text: () => validUrl(valueOf('online-path-input')) ? `Online path is set to ${valueOf('online-path-input')}. You can open it to check the repo path, or skip if this project is local-only.` : 'Optional. Tick Use GitHub repo path, enter your GitHub username, and the online path will auto-fill. You can skip this if the project is only local for now.',
    done: () => true,
    optional: true
  },
  {
    title: '6. Optional: add a deployed URL',
    ids: ['deployed-url-input', 'check-deployed-url-button'],
    text: () => validUrl(valueOf('deployed-url-input')) ? 'Deployed URL looks valid. Use Check Deployed URL to open it in a new tab and confirm it loads.' : 'Optional. Add the live GitHub Pages/site URL when you have one. Leave it empty if the project is not deployed yet.',
    done: () => true,
    optional: true
  },
  {
    title: '7. Export the starter project folder',
    ids: ['export-project-files-button', 'export-json-button'],
    text: () => 'Click Export Project Folder ZIP. It creates the starter folder structure, artifex-project.json, manifest.json, flatplan.json, index files, and placeholder Chronicle/Quest/Scene files. Unzip that into your chosen project folder.',
    done: () => ['project-index', 'folders', 'manifest', 'flatplan', 'indexes'].every(id => document.querySelector(`[data-gate="${id}"]`)?.classList.contains('complete'))
  },
  {
    title: '8. Set this as the active Artifex project',
    ids: ['set-active-project-button', 'save-local-button'],
    text: () => 'Click Set Active Project. This saves the project into the browser Project Library and sets artifex.activeProjectId so the Hub and other Artifex apps know which project to open.',
    done: () => savedAsActiveProject()
  },
  {
    title: 'Setup guide complete',
    ids: ['open-assignments-toolbar-button', 'open-assignments-button'],
    text: () => 'Project setup is ready enough to continue. Next, open Assignments to track what still needs to be built, or go back to the Hub once the Hub can read the active project.',
    done: () => true
  }
];

function queueCoach() {
  if (coachQueued) return;
  coachQueued = true;
  setTimeout(() => {
    coachQueued = false;
    patchCoach();
  }, 0);
}

function patchCoach() {
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = COACH_VERSION;
  if (document.title) document.title = `Artifex Creation Guide ${COACH_VERSION}`;

  const hero = document.querySelector('.project-hero');
  const box = document.querySelector('.overview-instructions');
  const ring = document.querySelector('.setup-ring');
  if (hero && box && ring && box.parentElement !== hero) {
    box.classList.add('in-hero', 'guided-coach');
    hero.insertBefore(box, ring);
  }

  injectCoachStyles();
  renderCoachBox();
  highlightCurrentTarget();
  installCoachEvents();
}

function renderCoachBox() {
  const box = document.querySelector('.overview-instructions');
  if (!box) return;
  const step = coachSteps[coachStep] || coachSteps[0];
  const done = Boolean(step.done());
  const html = `
    <div class="guide-card-topline">
      <span class="guide-step-pill">Step ${coachStep + 1}/${coachSteps.length}</span>
      <span class="guide-state ${done ? 'complete' : 'waiting'}">${done ? 'Ready' : 'Needs input'}</span>
    </div>
    <h3>${safe(step.title)}</h3>
    <p>${safe(step.text())}</p>
    <div class="guide-actions">
      <button type="button" id="guide-back-button" ${coachStep === 0 ? 'disabled' : ''}>Back</button>
      <button type="button" id="guide-focus-button">${coachStep === 0 ? 'Open setup panel' : 'Show me where'}</button>
      <button type="button" id="guide-next-button">${coachStep >= coachSteps.length - 1 ? 'Done' : (step.optional ? 'Skip / Next' : 'Next')}</button>
    </div>`;
  if (html !== lastCoachHtml) {
    lastCoachHtml = html;
    box.innerHTML = html;
  }
  document.getElementById('guide-back-button')?.addEventListener('click', () => moveCoach(-1));
  document.getElementById('guide-next-button')?.addEventListener('click', () => moveCoach(1));
  document.getElementById('guide-focus-button')?.addEventListener('click', () => focusCurrentTarget(true));
}

function moveCoach(amount) {
  if (coachStep === 0 && amount > 0) openSidePanel();
  coachStep = Math.max(0, Math.min(coachSteps.length - 1, coachStep + amount));
  queueCoach();
  setTimeout(() => focusCurrentTarget(amount > 0), 30);
}

function focusCurrentTarget(shouldFocus) {
  if (coachStep > 0) openSidePanel();
  const target = firstTarget(coachSteps[coachStep]?.ids || []);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (shouldFocus && typeof target.focus === 'function' && !target.disabled) target.focus({ preventScroll: true });
}

function highlightCurrentTarget() {
  document.querySelectorAll('.guide-highlight').forEach(el => el.classList.remove('guide-highlight'));
  const ids = coachSteps[coachStep]?.ids || [];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('guide-highlight');
    el.closest('label')?.classList.add('guide-highlight');
    el.closest('.validated-field')?.classList.add('guide-highlight');
  });
}

function installCoachEvents() {
  if (coachEventsReady) return;
  coachEventsReady = true;
  const indexById = new Map();
  coachSteps.forEach((step, index) => step.ids.forEach(id => indexById.set(id, index)));

  ['focusin', 'click', 'input', 'change'].forEach(type => {
    document.addEventListener(type, event => {
      const id = event.target?.id;
      if (indexById.has(id)) coachStep = indexById.get(id);
      queueCoach();
    });
  });
}

function installCoachObserver() {
  if (coachObserverReady) return;
  coachObserverReady = true;
  const panel = document.getElementById('project-overview-panel');
  if (!panel) return;
  const observer = new MutationObserver(() => queueCoach());
  observer.observe(panel, { childList: true, subtree: true });
}

function openSidePanel() {
  document.getElementById('left-panel')?.classList.remove('collapsed');
}

function firstTarget(ids) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

function valueOf(id) {
  return String(document.getElementById(id)?.value || '').trim();
}

function isNamedProject() {
  const value = valueOf('game-title-input');
  return Boolean(value && value !== 'Untitled Artifex Adventure');
}

function validSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''));
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function savedAsActiveProject() {
  const projectId = valueOf('project-id-input');
  try {
    const activeId = localStorage.getItem('artifex.activeProjectId');
    const library = JSON.parse(localStorage.getItem('artifex.projectLibrary') || '{}');
    return Boolean(projectId && activeId === projectId && library[projectId]);
  } catch {
    return false;
  }
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function injectCoachStyles() {
  if (document.getElementById('creation-guide-coach-style')) return;
  const style = document.createElement('style');
  style.id = 'creation-guide-coach-style';
  style.textContent = `
    .project-hero .overview-instructions.in-hero { margin-top: 0; flex: 1 1 360px; max-width: 540px; min-width: 280px; align-self: stretch; display: flex; flex-direction: column; justify-content: center; }
    .guided-coach .guide-card-topline { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
    .guided-coach .guide-step-pill, .guided-coach .guide-state { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 9px; border: 1px solid rgba(226,204,167,.24); border-radius: 999px; color: #c7b8ff; background: rgba(15,12,11,.55); font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    .guided-coach .guide-state.complete { color: #9af0ff; border-color: rgba(62,180,137,.65); }
    .guided-coach .guide-state.waiting { color: #d9a441; border-color: rgba(217,164,65,.55); }
    .guided-coach .guide-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .guided-coach .guide-actions button { padding: 7px 11px; font-size: 11px; border-radius: 999px; }
    .guided-coach .guide-actions button:disabled { opacity: .4; cursor: not-allowed; }
    .guide-highlight { outline: 2px solid #c7b8ff !important; outline-offset: 3px !important; box-shadow: 0 0 0 4px rgba(143,109,255,.22), 0 0 22px rgba(143,109,255,.55) !important; border-radius: 14px; animation: guidePulse 1.4s ease-in-out infinite alternate; }
    label.guide-highlight { padding: 7px; margin-left: -7px; margin-right: -7px; background: rgba(143,109,255,.10); border-radius: 15px; }
    @keyframes guidePulse { from { box-shadow: 0 0 0 4px rgba(143,109,255,.18), 0 0 16px rgba(143,109,255,.42); } to { box-shadow: 0 0 0 4px rgba(143,109,255,.30), 0 0 30px rgba(143,109,255,.72); } }
  `;
  document.head.appendChild(style);
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    patchCoach();
    installCoachObserver();
  }, 0);
});
