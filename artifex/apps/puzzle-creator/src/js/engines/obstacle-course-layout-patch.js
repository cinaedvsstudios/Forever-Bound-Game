// Horse Forest Ride layout patch V4
// Adds editor JSON export plus hold-to-move horse controls with soft acceleration/deceleration.

const PATCH_ID = 'horse-forest-layout-patch-v4';
let layoutObserver = null;
let forwardHeld = false;
let stoppingTimer = null;
let speedRampTimer = null;
let baseSpeed = null;
let exportedOnce = false;

function injectLayoutPatchStyles() {
  document.getElementById('horse-forest-layout-patch-v1')?.remove();
  document.getElementById('horse-forest-layout-patch-v2')?.remove();
  document.getElementById('horse-forest-layout-patch-v3')?.remove();
  if (document.getElementById(PATCH_ID)) return;
  const style = document.createElement('style');
  style.id = PATCH_ID;
  style.textContent = `
    body.is-obstacle-course .left-panel{flex:0 0 250px!important;width:250px!important;min-width:240px!important;max-width:260px!important}
    body.is-obstacle-course #obstacle-course-stage{height:calc(100vh - 92px)!important;overflow:hidden!important;padding:12px 14px 14px!important;box-sizing:border-box!important}
    body.is-obstacle-course .obstacle-workspace{grid-template-columns:minmax(560px,1fr) 320px!important;height:100%!important;min-height:0!important;align-items:stretch!important}
    body.is-obstacle-course .obstacle-view-card{min-height:0!important;height:100%!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;scrollbar-gutter:stable!important;position:sticky!important;top:0!important;display:flex!important;flex-direction:column!important}
    body.is-obstacle-course .obstacle-three-wrap{flex:0 0 auto!important;min-height:0!important}
    body.is-obstacle-course .obstacle-side-card{min-height:0!important;height:100%!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;scrollbar-gutter:stable!important;position:sticky!important;top:0!important}
    body.is-obstacle-course .hf-overview-middle{flex:0 0 auto!important;min-height:300px!important;display:block!important;margin-top:10px!important;padding:10px!important;border:1px solid rgba(238,196,90,.42)!important;border-radius:14px!important;background:rgba(0,0,0,.18)!important;box-sizing:border-box!important;overflow:hidden!important}
    body.is-obstacle-course .hf-overview-middle>.hf-overview-row{display:grid!important;grid-template-columns:86px minmax(0,1fr)!important;gap:10px!important;align-items:stretch!important;width:100%!important;height:100%!important;min-height:280px!important}
    body.is-obstacle-course .hf-overview-middle .hf-key{height:auto!important;align-self:stretch!important}
    body.is-obstacle-course .hf-overview-middle .hf-overview-scroll{height:280px!important;min-height:280px!important;max-height:280px!important;overflow-y:auto!important;overflow-x:hidden!important}
    body.is-obstacle-course .hf-overview-middle .hf-overview{width:100%!important}
    body.is-obstacle-course .obstacle-side-card>.hf-overview-row{display:none!important}
    body.is-obstacle-course .obstacle-side-card .hf-button-row:first-child{position:sticky!important;top:0!important;z-index:5!important;padding-bottom:8px!important;background:rgba(7,14,22,.96)!important}
    .hf-export-json-button{min-height:34px;border:1px solid rgba(238,196,90,.45);border-radius:9px;background:rgba(82,55,10,.72);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}
    .hf-movement-note{font-size:.64rem;line-height:1.25;color:var(--muted,#c9bfae);margin:0 0 4px}
    @media(max-width:1120px){body.is-obstacle-course .left-panel{flex-basis:230px!important;width:230px!important;min-width:220px!important}body.is-obstacle-course .obstacle-workspace{grid-template-columns:1fr!important}body.is-obstacle-course .obstacle-side-card{height:360px!important;max-height:360px!important}}
  `;
  document.head.appendChild(style);
}

function moveOverviewToMiddle() {
  const stage = document.getElementById('obstacle-course-stage');
  if (!stage || stage.hidden) return false;
  const viewCard = stage.querySelector('.obstacle-view-card');
  const viewer = stage.querySelector('#obstacle-three-host');
  const sourceOverview = stage.querySelector('.hf-overview-row');
  if (!viewCard || !viewer || !sourceOverview) return false;
  let overviewShell = stage.querySelector('#hf-overview-middle-shell');
  if (!overviewShell) {
    overviewShell = document.createElement('div');
    overviewShell.id = 'hf-overview-middle-shell';
    overviewShell.className = 'hf-overview-middle';
  }
  if (overviewShell.parentElement !== viewCard) viewer.insertAdjacentElement('afterend', overviewShell);
  if (sourceOverview.parentElement !== overviewShell) overviewShell.appendChild(sourceOverview);
  const canvas = overviewShell.querySelector('#hf-overview');
  if (canvas) canvas.style.width = '100%';
  return true;
}

function valueOf(id) {
  const node = document.getElementById(id);
  if (!node) return null;
  if (node.type === 'checkbox') return Boolean(node.checked);
  const numberValue = Number(node.value);
  return Number.isFinite(numberValue) && node.value !== '' ? numberValue : node.value;
}

function selectedText(id) {
  const node = document.getElementById(id);
  if (!node || !node.selectedOptions?.length) return null;
  return node.selectedOptions[0].textContent;
}

function collectHorseEditorState() {
  const layerSelect = document.getElementById('hf-layer-select');
  const layerOptions = layerSelect ? Array.from(layerSelect.options).map((option) => ({ id: option.value, label: option.textContent })) : [];
  const runtimeState = window.__artifexObstacleCourse?.getState?.() || {};
  return {
    exportType: 'forever-bound-artifex-horse-forest-course-settings',
    exportedAt: new Date().toISOString(),
    app: 'Puzzle Creator / Obstacle Course / Horse Forest Runner',
    runtimeVersion: 'Horse Forest Runner V27',
    layoutPatchVersion: 'Horse Forest Ride layout patch V4',
    notes: 'This JSON records the current editable horse-ride settings, layer controls, brush controls, and runtime defaults available through the editor UI.',
    runtimeState,
    template: { id: valueOf('obstacle-template'), label: selectedText('obstacle-template') },
    construction: { difficulty: valueOf('obstacle-difficulty'), durationSeconds: valueOf('obstacle-duration'), maxDurationSeconds: 300 },
    display: { speed: valueOf('obstacle-speed'), laneWidth: valueOf('obstacle-lane-width'), bumpStrength: valueOf('obstacle-bump'), displacementStrength: valueOf('obstacle-displacement') },
    scoring: { successScore: valueOf('obstacle-success-score') },
    layerEditor: { selectedLayer: valueOf('hf-layer-select'), visibleLayerLabels: layerOptions, soloButtonAvailable: true, backgroundWhiteButtonAvailable: true },
    paint: { mode: valueOf('hf-paint-mode'), brushSize: valueOf('hf-brush-size'), brushStrength: valueOf('hf-brush-strength') },
    controls: { forward: 'Hold ArrowUp or W to move. Release to decelerate over about 2 seconds. Tap ArrowUp/W for a small step. Space remains jump. A/D or arrow left/right steer.' }
  };
}

function downloadHorseEditorJson() {
  const data = collectHorseEditorState();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  a.href = URL.createObjectURL(blob);
  a.download = `horse-forest-course-settings-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function ensureJsonExportButton() {
  const stage = document.getElementById('obstacle-course-stage');
  if (!stage || stage.hidden || exportedOnce) return;
  const firstControls = stage.querySelector('.obstacle-side-card .hf-button-row:first-child');
  if (!firstControls) return;
  const button = document.createElement('button');
  button.id = 'hf-export-json';
  button.className = 'hf-export-json-button';
  button.type = 'button';
  button.textContent = 'Download JSON';
  button.addEventListener('click', downloadHorseEditorJson);
  firstControls.insertAdjacentElement('afterend', button);
  const note = document.createElement('p');
  note.className = 'hf-movement-note';
  note.textContent = 'Hold ↑/W to move. Release to slow down and stop. Tap for a small step. Space jumps.';
  button.insertAdjacentElement('afterend', note);
  exportedOnce = true;
}

function speedInput() {
  return document.getElementById('obstacle-speed');
}

function dispatchInput(node) {
  node.dispatchEvent(new Event('input', { bubbles: true }));
}

function setHorseSpeed(value) {
  const input = speedInput();
  if (!input) return;
  input.value = String(Math.max(Number(input.min || 0), Math.min(Number(input.max || 64), value)));
  dispatchInput(input);
}

function rampSpeed(from, to, durationMs, done) {
  const input = speedInput();
  if (!input) return;
  clearInterval(speedRampTimer);
  const started = performance.now();
  speedRampTimer = setInterval(() => {
    const t = Math.min(1, (performance.now() - started) / durationMs);
    const eased = t * t * (3 - 2 * t);
    setHorseSpeed(from + (to - from) * eased);
    if (t >= 1) {
      clearInterval(speedRampTimer);
      speedRampTimer = null;
      done?.();
    }
  }, 40);
}

function beginForwardMove() {
  if (!document.body.classList.contains('is-obstacle-course')) return;
  const input = speedInput();
  if (!input) return;
  if (baseSpeed === null) baseSpeed = Math.max(18, Number(input.value) || 34);
  forwardHeld = true;
  clearTimeout(stoppingTimer);
  document.getElementById('obstacle-start')?.click();
  rampSpeed(Math.max(6, Number(input.value) || 6), baseSpeed, 600);
}

function endForwardMove() {
  if (!document.body.classList.contains('is-obstacle-course') || !forwardHeld) return;
  forwardHeld = false;
  const input = speedInput();
  const current = Number(input?.value) || baseSpeed || 34;
  rampSpeed(current, 4, 1900, () => {
    document.getElementById('obstacle-pause')?.click();
    if (baseSpeed !== null) setHorseSpeed(baseSpeed);
  });
}

function interceptMovementKeys(event) {
  if (!document.body.classList.contains('is-obstacle-course')) return;
  const key = event.key.toLowerCase();
  if (key !== 'arrowup' && key !== 'w') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.type === 'keydown' && !event.repeat) beginForwardMove();
  if (event.type === 'keyup') endForwardMove();
}

function bootLayoutPatch() {
  injectLayoutPatchStyles();
  if (!layoutObserver) {
    layoutObserver = new MutationObserver(() => {
      if (document.body.classList.contains('is-obstacle-course')) {
        moveOverviewToMiddle();
        ensureJsonExportButton();
      }
    });
    layoutObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  }
  document.addEventListener('click', () => requestAnimationFrame(() => { moveOverviewToMiddle(); ensureJsonExportButton(); }), true);
  document.addEventListener('keydown', interceptMovementKeys, true);
  document.addEventListener('keyup', interceptMovementKeys, true);
  setInterval(() => {
    if (document.body.classList.contains('is-obstacle-course')) {
      moveOverviewToMiddle();
      ensureJsonExportButton();
    }
  }, 500);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootLayoutPatch, { once: true });
else bootLayoutPatch();
