const ONBOARDING_VERSION = 'V1.1.0';
let tourMode = 'modules';
let moduleStep = 0;
let setupStep = 0;
let expandedDetails = false;
let onboardingQueued = false;
let onboardingReady = false;
let lastOnboardingHtml = '';

const artifexModules = [
  { key: 'hub', icon: '⌂', title: 'Artifex Hub', accent: '#e2cca7', short: 'The launch screen for choosing the active project and opening tools.', detail: 'The Hub is where the creator changes the active project, sees the project name, and opens the Artifex tools. Later, every app should read the active project chosen here.' },
  { key: 'creation-guide', icon: '📋', title: 'Creation Guide', accent: '#8a7465', short: 'The project setup guide, assignment board, milestone tracker, and health check.', detail: 'Creation Guide creates or selects a project, writes the starter project files, tracks setup gates, and keeps production work organised as Assignments, milestones, and readiness checks.' },
  { key: 'project-editor', icon: '⌘', title: 'Project Editor', accent: '#e5c84a', short: 'Owns manifest, flatplan, routes, map projection, and structural game files.', detail: 'Project Editor is the structural editor. It handles the Manifest, Flatplan, Flatplan Catalog, Stitcher, Routes, and Map Projection. It decides how the project hangs together.' },
  { key: 'scene-editor', icon: '▣', title: 'Scene Editor', accent: '#8f6dff', short: 'Builds the actual scenes, screens, backgrounds, placements, and scene layout.', detail: 'Scene Editor is where the visual playable screens are assembled. It places backgrounds, archetype objects, exits, caches, markers, characters, and interaction zones.' },
  { key: 'quest-builder', icon: '✦', title: 'Quest Builder', accent: '#43d36f', short: 'Links quests, callings, objectives, conditions, dialogue, and scene overlays.', detail: 'Quest Builder assembles quests from existing scenes and objects. It links dialogue, conditions, Codice updates, Capra popups, Calling states, and completion logic.' },
  { key: 'object-creator', icon: '◆', title: 'Object Creator', accent: '#d94a4a', short: 'Creates reusable archetype objects, NPCs, props, pickups, doors, foes, and interactables.', detail: 'Object Creator makes the reusable object archetypes that Scene Editor can place. It handles non-effect objects, NPC definitions, interactables, vendors, caches, pickups, and doors.' },
  { key: 'effect-editor', icon: '✹', title: 'Effect Editor', accent: '#31d7ff', short: 'Creates visual effects, overlays, particles, weather, magic, and screen feedback.', detail: 'Effect Editor builds reusable effect presets and instances, such as fog, glow, weather, damage flashes, spell visuals, transitions, overlays, and object effects.' },
  { key: 'libraries', icon: '▤', title: 'Asset + Object Libraries', accent: '#a98f72', short: 'Stores reusable files, sprites, icons, assets, archetypes, and intake records.', detail: 'The libraries are the shared shelves. They hold reusable assets, object archetypes, sprite records, FX records, icons, and everything the editors need to pick from.' },
  { key: 'build-game', icon: '▶', title: 'Build Game', accent: '#ff9d4d', short: 'Exports, validates, packages, and prepares playable builds.', detail: 'Build Game is the publishing and test-build surface. It should gather the active project files, validate references, package the build, and prepare browser or Android outputs.' }
];

const setupSteps = [
  { title: 'Project setup starts here', ids: ['side-panel-toggle-button'], text: () => 'Now we create a project. Open the setup panel on the left and fill the fields from top to bottom. The setup gates below will update as you go.', done: () => !document.getElementById('left-panel')?.classList.contains('collapsed') },
  { title: '1. Enter the project name', ids: ['game-title-input'], text: () => isNamedProject() ? `Project name is set to “${valueOf('game-title-input')}”.` : 'Type the human-readable project name, for example “Forever Bound”.', done: () => isNamedProject() },
  { title: '2. Confirm the project ID / slug', ids: ['project-id-input', 'use-suggested-slug-button'], text: () => validSlug(valueOf('project-id-input')) ? `The safe project ID is “${valueOf('project-id-input')}”.` : 'Use the suggested slug or type a lowercase ID with hyphens, like “forever-bound”.', done: () => validSlug(valueOf('project-id-input')) },
  { title: '3. Add the creator or studio', ids: ['creator-input'], text: () => valueOf('creator-input') ? `Creator/studio is set to “${valueOf('creator-input')}”.` : 'Enter the creator or studio name for project metadata.', done: () => Boolean(valueOf('creator-input')) },
  { title: '4. Choose the local project folder', ids: ['project-folder-input', 'choose-local-folder-button'], text: () => valueOf('project-folder-input') ? `Local project location is set to “${valueOf('project-folder-input')}”.` : 'Choose or type the folder where the exported project files will live.', done: () => Boolean(valueOf('project-folder-input')) },
  { title: '5. Optional GitHub repo path', ids: ['use-github-input', 'github-username-input', 'online-path-input'], text: () => validUrl(valueOf('online-path-input')) ? `Online path is set to ${valueOf('online-path-input')}.` : 'Optional. Tick Use GitHub, enter your username, and the repo URL will auto-fill.', done: () => true, optional: true },
  { title: '6. Optional deployed URL', ids: ['deployed-url-input', 'check-deployed-url-button'], text: () => validUrl(valueOf('deployed-url-input')) ? 'Deployed URL looks valid. Use Check Deployed URL to test it.' : 'Optional. Add the live site URL later if the project is not deployed yet.', done: () => true, optional: true },
  { title: '7. Export the starter project folder', ids: ['export-project-files-button', 'export-json-button'], text: () => 'Click Export Project Folder ZIP. Unzip it into the project folder. It contains the folder structure, artifex-project.json, manifest.json, flatplan.json, indexes, and starter placeholder files.', done: () => structuralGatesComplete() },
  { title: '8. Set the active project', ids: ['set-active-project-button', 'save-local-button'], text: () => 'Click Set Active Project. This saves the project into the browser Project Library and lets the Hub and tools know what project to open.', done: () => savedAsActiveProject() },
  { title: 'Project setup ready', ids: ['open-assignments-toolbar-button'], text: () => 'Next, open Assignments to track production work. Assignments can be sorted by priority, effort, module, milestone, and status.', done: () => true }
];

function queueOnboarding() {
  if (onboardingQueued) return;
  onboardingQueued = true;
  setTimeout(() => { onboardingQueued = false; patchOnboarding(); }, 0);
}

function patchOnboarding() {
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = ONBOARDING_VERSION;
  if (document.title) document.title = `Artifex Creation Guide ${ONBOARDING_VERSION}`;
  moveInstructionBoxIntoHero();
  injectOnboardingStyles();
  renderOnboardingBox();
  applyOnboardingHighlights();
  installOnboardingEvents();
}

function moveInstructionBoxIntoHero() {
  const hero = document.querySelector('.project-hero');
  const box = document.querySelector('.overview-instructions');
  const ring = document.querySelector('.setup-ring');
  if (hero && box && ring && box.parentElement !== hero) {
    box.classList.add('in-hero', 'guided-onboarding');
    hero.insertBefore(box, ring);
  }
}

function renderOnboardingBox() {
  const box = document.querySelector('.overview-instructions');
  if (!box) return;
  const html = tourMode === 'modules' ? moduleTourHtml() : setupGuideHtml();
  if (html === lastOnboardingHtml) return;
  lastOnboardingHtml = html;
  box.innerHTML = html;
  wireOnboardingButtons();
}

function moduleTourHtml() {
  const module = artifexModules[moduleStep];
  const isLastModule = moduleStep >= artifexModules.length - 1;
  const circles = artifexModules.map((item, index) => `<button type="button" class="module-dot ${index === moduleStep ? 'active' : ''}" data-module-step="${index}" style="--dot:${item.accent}" title="${safe(item.title)}"><span>${item.icon}</span></button>`).join('');
  return `
    <div class="module-tour-dots">${circles}</div>
    <div class="guide-card-topline"><span class="guide-step-pill">Module ${moduleStep + 1}/${artifexModules.length}</span><span class="guide-state complete">Intro</span></div>
    <h3><span class="module-title-icon" style="--dot:${module.accent}">${module.icon}</span>${safe(module.title)}</h3>
    <p>${safe(module.short)} You can always access Artifex modules through the Hub or from the File/Open menu.</p>
    ${expandedDetails ? `<div class="module-more"><strong>More detail</strong><p>${safe(module.detail)}</p></div>` : ''}
    <div class="guide-actions">
      <button type="button" id="module-back-button" ${moduleStep === 0 ? 'disabled' : ''}>Back</button>
      <button type="button" id="module-expand-button">${expandedDetails ? 'Less detail' : 'More detail'}</button>
      <button type="button" id="module-skip-button">Skip intro</button>
      <button type="button" id="module-next-button">${isLastModule ? 'Set up project' : 'Next module'}</button>
    </div>`;
}

function setupGuideHtml() {
  const step = setupSteps[setupStep];
  const done = Boolean(step.done());
  return `
    <div class="guide-card-topline"><span class="guide-step-pill">Setup ${setupStep + 1}/${setupSteps.length}</span><span class="guide-state ${done ? 'complete' : 'waiting'}">${done ? 'Ready' : 'Needs input'}</span></div>
    <h3>${safe(step.title)}</h3>
    <p>${safe(step.text())}</p>
    ${setupStep === 0 ? '<div class="module-more"><strong>What we need</strong><p>Project name, project ID/slug, creator/studio, local folder, optional GitHub repo, optional deployed URL, exported starter folder, and active-project save. After that, work is tracked as Assignments grouped by milestones and module ownership.</p></div>' : ''}
    <div class="guide-actions">
      <button type="button" id="setup-back-button" ${setupStep === 0 ? 'disabled' : ''}>Back</button>
      <button type="button" id="setup-show-button">${setupStep === 0 ? 'Open setup panel' : 'Show me where'}</button>
      <button type="button" id="setup-intro-button">Module intro</button>
      <button type="button" id="setup-next-button">${setupStep >= setupSteps.length - 1 ? 'Done' : (step.optional ? 'Skip / Next' : 'Next')}</button>
    </div>`;
}

function wireOnboardingButtons() {
  document.querySelectorAll('[data-module-step]').forEach(button => button.addEventListener('click', () => { moduleStep = Number(button.dataset.moduleStep); expandedDetails = false; queueOnboarding(); }));
  document.getElementById('module-back-button')?.addEventListener('click', () => { moduleStep = Math.max(0, moduleStep - 1); expandedDetails = false; queueOnboarding(); });
  document.getElementById('module-next-button')?.addEventListener('click', () => { if (moduleStep >= artifexModules.length - 1) startSetupGuide(); else { moduleStep += 1; expandedDetails = false; queueOnboarding(); } });
  document.getElementById('module-skip-button')?.addEventListener('click', startSetupGuide);
  document.getElementById('module-expand-button')?.addEventListener('click', () => { expandedDetails = !expandedDetails; queueOnboarding(); });
  document.getElementById('setup-back-button')?.addEventListener('click', () => moveSetup(-1));
  document.getElementById('setup-next-button')?.addEventListener('click', () => moveSetup(1));
  document.getElementById('setup-show-button')?.addEventListener('click', () => focusSetupTarget(true));
  document.getElementById('setup-intro-button')?.addEventListener('click', () => { tourMode = 'modules'; expandedDetails = false; queueOnboarding(); });
}

function startSetupGuide() {
  tourMode = 'setup';
  expandedDetails = false;
  openSidePanel();
  queueOnboarding();
  setTimeout(() => focusSetupTarget(false), 40);
}

function moveSetup(amount) {
  if (setupStep === 0 && amount > 0) openSidePanel();
  setupStep = Math.max(0, Math.min(setupSteps.length - 1, setupStep + amount));
  queueOnboarding();
  setTimeout(() => focusSetupTarget(amount > 0), 40);
}

function focusSetupTarget(shouldFocus) {
  openSidePanel();
  const target = firstTarget(setupSteps[setupStep]?.ids || []);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (shouldFocus && typeof target.focus === 'function' && !target.disabled) target.focus({ preventScroll: true });
}

function applyOnboardingHighlights() {
  document.querySelectorAll('.guide-highlight').forEach(el => el.classList.remove('guide-highlight'));
  if (tourMode !== 'setup') return;
  (setupSteps[setupStep]?.ids || []).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('guide-highlight');
    el.closest('label')?.classList.add('guide-highlight');
    el.closest('.validated-field')?.classList.add('guide-highlight');
  });
}

function installOnboardingEvents() {
  if (onboardingReady) return;
  onboardingReady = true;
  const stepById = new Map();
  setupSteps.forEach((step, index) => step.ids.forEach(id => stepById.set(id, index)));
  ['focusin', 'click', 'input', 'change'].forEach(type => document.addEventListener(type, event => {
    const id = event.target?.id;
    if (stepById.has(id)) { tourMode = 'setup'; setupStep = stepById.get(id); }
    queueOnboarding();
  }));
  const panel = document.getElementById('project-overview-panel');
  if (panel) new MutationObserver(() => queueOnboarding()).observe(panel, { childList: true, subtree: true });
}

function openSidePanel() { document.getElementById('left-panel')?.classList.remove('collapsed'); }
function firstTarget(ids) { for (const id of ids) { const el = document.getElementById(id); if (el) return el; } return null; }
function valueOf(id) { return String(document.getElementById(id)?.value || '').trim(); }
function isNamedProject() { const value = valueOf('game-title-input'); return Boolean(value && value !== 'Untitled Artifex Adventure'); }
function validSlug(value) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || '')); }
function validUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } }
function structuralGatesComplete() { return ['project-index', 'folders', 'manifest', 'flatplan', 'indexes'].every(id => document.querySelector(`[data-gate="${id}"]`)?.classList.contains('complete')); }
function savedAsActiveProject() { const projectId = valueOf('project-id-input'); try { const activeId = localStorage.getItem('artifex.activeProjectId'); const library = JSON.parse(localStorage.getItem('artifex.projectLibrary') || '{}'); return Boolean(projectId && activeId === projectId && library[projectId]); } catch { return false; } }
function safe(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }

function injectOnboardingStyles() {
  if (document.getElementById('creation-guide-onboarding-style')) return;
  const style = document.createElement('style');
  style.id = 'creation-guide-onboarding-style';
  style.textContent = `
    .project-hero .overview-instructions.in-hero { margin-top: 0; flex: 1 1 390px; max-width: 590px; min-width: 300px; align-self: stretch; display: flex; flex-direction: column; justify-content: center; }
    .module-tour-dots { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 10px; }
    .module-dot { width: 34px; height: 34px; padding: 0; border-radius: 999px; display: grid; place-items: center; border-color: color-mix(in srgb, var(--dot) 45%, #382a21); color: var(--dot); background: rgba(15,12,11,.62); }
    .module-dot.active { color: #fff; background: color-mix(in srgb, var(--dot) 38%, #171210); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dot) 75%, transparent), 0 0 24px color-mix(in srgb, var(--dot) 62%, transparent); }
    .module-title-icon { display: inline-grid; place-items: center; width: 30px; height: 30px; margin-right: 9px; border-radius: 999px; color: var(--dot); border: 1px solid currentColor; background: rgba(15,12,11,.65); }
    .guide-card-topline { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
    .guide-step-pill, .guide-state { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 9px; border: 1px solid rgba(226,204,167,.24); border-radius: 999px; color: #c7b8ff; background: rgba(15,12,11,.55); font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    .guide-state.complete { color: #9af0ff; border-color: rgba(62,180,137,.65); }
    .guide-state.waiting { color: #d9a441; border-color: rgba(217,164,65,.55); }
    .guide-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .guide-actions button { padding: 7px 11px; font-size: 11px; border-radius: 999px; }
    .guide-actions button:disabled { opacity: .4; cursor: not-allowed; }
    .module-more { margin-top: 10px; padding: 10px; border: 1px solid rgba(226,204,167,.18); border-radius: 14px; background: rgba(15,12,11,.46); }
    .module-more strong { color: #fff0ce; font-size: 11px; text-transform: uppercase; letter-spacing: .1em; }
    .module-more p { margin: 5px 0 0; }
    .guide-highlight { outline: 2px solid #c7b8ff !important; outline-offset: 3px !important; box-shadow: 0 0 0 4px rgba(143,109,255,.22), 0 0 22px rgba(143,109,255,.55) !important; border-radius: 14px; animation: guidePulse 1.4s ease-in-out infinite alternate; }
    label.guide-highlight { padding: 7px; margin-left: -7px; margin-right: -7px; background: rgba(143,109,255,.10); border-radius: 15px; }
    @keyframes guidePulse { from { box-shadow: 0 0 0 4px rgba(143,109,255,.18), 0 0 16px rgba(143,109,255,.42); } to { box-shadow: 0 0 0 4px rgba(143,109,255,.30), 0 0 30px rgba(143,109,255,.72); } }
  `;
  document.head.appendChild(style);
}

window.addEventListener('DOMContentLoaded', () => setTimeout(() => patchOnboarding(), 0));
