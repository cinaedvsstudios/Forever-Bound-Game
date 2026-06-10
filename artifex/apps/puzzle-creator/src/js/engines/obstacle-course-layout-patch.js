// Horse Forest Ride layout patch V6
// Phase 2 jump controls: Space jumps immediately; holding Space extends height and carry up to a cap.

const PATCH_ID = 'horse-forest-layout-patch-v6';
let layoutObserver = null;
let forwardHeld = false;
let backwardHeld = false;
let speedRampTimer = null;
let baseSpeed = null;
let exportedOnce = false;
let duckPassthroughUntil = 0;
let jumpPassthroughUntil = 0;
let jumpFrame = null;
const jumpState = {
  active: false,
  held: false,
  start: 0,
  releaseAt: 0,
  power: 0,
  maxHoldMs: 680,
  minFlightMs: 520,
  extraFlightMs: 480,
  minLiftPx: 10,
  extraLiftPx: 48
};

function injectLayoutPatchStyles() {
  document.getElementById('horse-forest-layout-patch-v1')?.remove();
  document.getElementById('horse-forest-layout-patch-v2')?.remove();
  document.getElementById('horse-forest-layout-patch-v3')?.remove();
  document.getElementById('horse-forest-layout-patch-v4')?.remove();
  document.getElementById('horse-forest-layout-patch-v5')?.remove();
  if (document.getElementById(PATCH_ID)) return;
  const style = document.createElement('style');
  style.id = PATCH_ID;
  style.textContent = `
    body.is-obstacle-course .left-panel{flex:0 0 250px!important;width:250px!important;min-width:240px!important;max-width:260px!important}
    body.is-obstacle-course #obstacle-course-stage{height:calc(100vh - 92px)!important;overflow:hidden!important;padding:12px 14px 14px!important;box-sizing:border-box!important;--hf-jump-lift:0px;--hf-jump-scale:1}
    body.is-obstacle-course .obstacle-workspace{grid-template-columns:minmax(560px,1fr) 320px!important;height:100%!important;min-height:0!important;align-items:stretch!important}
    body.is-obstacle-course .obstacle-view-card{min-height:0!important;height:100%!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;scrollbar-gutter:stable!important;position:sticky!important;top:0!important;display:flex!important;flex-direction:column!important}
    body.is-obstacle-course .obstacle-three-wrap{flex:0 0 auto!important;min-height:0!important;transform:translateY(var(--hf-jump-lift,0px)) scale(var(--hf-jump-scale,1))!important;transform-origin:50% 58%!important;will-change:transform!important}
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
    layoutPatchVersion: 'Horse Forest Ride layout patch V6',
    notes: 'This JSON records the current editable horse-ride settings, layer controls, brush controls, and runtime defaults available through the editor UI.',
    runtimeState,
    template: { id: valueOf('obstacle-template'), label: selectedText('obstacle-template') },
    construction: { difficulty: valueOf('obstacle-difficulty'), durationSeconds: valueOf('obstacle-duration'), maxDurationSeconds: 300 },
    display: { speed: valueOf('obstacle-speed'), laneWidth: valueOf('obstacle-lane-width'), bumpStrength: valueOf('obstacle-bump'), displacementStrength: valueOf('obstacle-displacement') },
    scoring: { successScore: valueOf('obstacle-success-score') },
    layerEditor: { selectedLayer: valueOf('hf-layer-select'), visibleLayerLabels: layerOptions, soloButtonAvailable: true, backgroundWhiteButtonAvailable: true },
    paint: { mode: valueOf('hf-paint-mode'), brushSize: valueOf('hf-brush-size'), brushStrength: valueOf('hf-brush-strength') },
    controls: {
      forward: 'Hold ArrowUp or W to move. Release to decelerate over about 2 seconds. Tap ArrowUp/W for a small step.',
      backward: 'Hold ArrowDown or S to walk backwards slowly. Tap for a small backward step.',
      duck: 'Ctrl is the duck/lower-head key. ArrowDown/S no longer duck.',
      jump: 'Space jumps instantly. Holding Space extends the jump height/carry until a cap, then the horse comes down automatically.'
    },
    jumpDefaults: {
      maxHoldMs: jumpState.maxHoldMs,
      minFlightMs: jumpState.minFlightMs,
      extraFlightMs: jumpState.extraFlightMs,
      minLiftPx: jumpState.minLiftPx,
      extraLiftPx: jumpState.extraLiftPx
    }
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
  note.textContent = 'Hold ↑/W to move. Hold ↓/S to back up. Hold Space for a bigger jump. Ctrl ducks.';
  button.insertAdjacentElement('afterend', note);
  exportedOnce = true;
}

function speedInput() {
  return document.getElementById('obstacle-speed');
}

function dispatchInput(node) {
  node.dispatchEvent(new Event('input', { bubbles: true }));
}

function setHorseSpeed(value, clamp = true) {
  const input = speedInput();
  if (!input) return;
  const min = clamp ? Number(input.min || 0) : -64;
  const max = Number(input.max || 64);
  input.value = String(Math.max(min, Math.min(max, value)));
  dispatchInput(input);
}

function rampSpeed(from, to, durationMs, done, clamp = true) {
  const input = speedInput();
  if (!input) return;
  clearInterval(speedRampTimer);
  const started = performance.now();
  speedRampTimer = setInterval(() => {
    const t = Math.min(1, (performance.now() - started) / durationMs);
    const eased = t * t * (3 - 2 * t);
    setHorseSpeed(from + (to - from) * eased, clamp);
    if (t >= 1) {
      clearInterval(speedRampTimer);
      speedRampTimer = null;
      done?.();
    }
  }, 40);
}

function restoreBaseSpeed() {
  if (baseSpeed !== null) setHorseSpeed(baseSpeed, true);
}

function beginForwardMove() {
  if (!document.body.classList.contains('is-obstacle-course')) return;
  const input = speedInput();
  if (!input) return;
  if (baseSpeed === null) baseSpeed = Math.max(18, Number(input.value) || 34);
  forwardHeld = true;
  backwardHeld = false;
  document.getElementById('obstacle-start')?.click();
  rampSpeed(Math.max(4, Math.abs(Number(input.value)) || 4), baseSpeed, 650, null, true);
}

function endForwardMove() {
  if (!document.body.classList.contains('is-obstacle-course') || !forwardHeld) return;
  forwardHeld = false;
  const input = speedInput();
  const current = Math.abs(Number(input?.value) || baseSpeed || 34);
  rampSpeed(current, 4, 1900, () => {
    document.getElementById('obstacle-pause')?.click();
    restoreBaseSpeed();
  }, true);
}

function beginBackwardMove() {
  if (!document.body.classList.contains('is-obstacle-course')) return;
  const input = speedInput();
  if (!input) return;
  if (baseSpeed === null) baseSpeed = Math.max(18, Math.abs(Number(input.value)) || 34);
  backwardHeld = true;
  forwardHeld = false;
  document.getElementById('obstacle-start')?.click();
  rampSpeed(Number(input.value) || 0, -7, 260, null, false);
}

function endBackwardMove() {
  if (!document.body.classList.contains('is-obstacle-course') || !backwardHeld) return;
  backwardHeld = false;
  const input = speedInput();
  const current = Number(input?.value) || -7;
  rampSpeed(current, 0, 420, () => {
    document.getElementById('obstacle-pause')?.click();
    restoreBaseSpeed();
  }, false);
}

function sendDuckKey(type) {
  duckPassthroughUntil = performance.now() + 80;
  document.dispatchEvent(new KeyboardEvent(type, { key: 'ArrowDown', code: 'ArrowDown', bubbles: true, cancelable: true }));
}

function sendRuntimeSpace(type) {
  jumpPassthroughUntil = performance.now() + 80;
  document.dispatchEvent(new KeyboardEvent(type, { key: ' ', code: 'Space', bubbles: true, cancelable: true }));
}

function setJumpVisual(liftPx, scale = 1) {
  const stage = document.getElementById('obstacle-course-stage');
  if (!stage) return;
  stage.style.setProperty('--hf-jump-lift', `${liftPx.toFixed(1)}px`);
  stage.style.setProperty('--hf-jump-scale', scale.toFixed(4));
}

function finishJump() {
  jumpState.active = false;
  jumpState.held = false;
  jumpState.power = 0;
  if (jumpFrame) cancelAnimationFrame(jumpFrame);
  jumpFrame = null;
  setJumpVisual(0, 1);
}

function runJumpFrame(now) {
  if (!jumpState.active) return;
  const heldMs = Math.min(jumpState.maxHoldMs, Math.max(0, now - jumpState.start));
  if (jumpState.held) jumpState.power = Math.max(jumpState.power, heldMs / jumpState.maxHoldMs);
  if (heldMs >= jumpState.maxHoldMs) jumpState.held = false;
  const flightMs = jumpState.minFlightMs + jumpState.extraFlightMs * Math.max(0.08, jumpState.power);
  const progress = Math.min(1, (now - jumpState.start) / flightMs);
  const lift = Math.sin(progress * Math.PI) * (jumpState.minLiftPx + jumpState.extraLiftPx * Math.max(0.08, jumpState.power));
  const scale = 1 + Math.sin(progress * Math.PI) * (0.01 + 0.012 * jumpState.power);
  setJumpVisual(lift, scale);
  if (progress >= 1) {
    finishJump();
    return;
  }
  jumpFrame = requestAnimationFrame(runJumpFrame);
}

function beginJump() {
  if (!document.body.classList.contains('is-obstacle-course') || jumpState.active) return;
  jumpState.active = true;
  jumpState.held = true;
  jumpState.start = performance.now();
  jumpState.releaseAt = 0;
  jumpState.power = 0.08;
  sendRuntimeSpace('keydown');
  if (jumpFrame) cancelAnimationFrame(jumpFrame);
  jumpFrame = requestAnimationFrame(runJumpFrame);
}

function endJump() {
  if (!jumpState.active) return;
  jumpState.held = false;
  jumpState.releaseAt = performance.now();
  jumpState.power = Math.max(jumpState.power, Math.min(1, (jumpState.releaseAt - jumpState.start) / jumpState.maxHoldMs));
  sendRuntimeSpace('keyup');
}

function interceptMovementKeys(event) {
  if (!document.body.classList.contains('is-obstacle-course')) return;
  const key = event.key.toLowerCase();
  const isForward = key === 'arrowup' || key === 'w';
  const isBackward = key === 'arrowdown' || key === 's';
  const isDuck = key === 'control';
  const isJump = key === ' ' || key === 'spacebar' || event.code === 'Space';
  if (isBackward && performance.now() < duckPassthroughUntil) return;
  if (isJump && performance.now() < jumpPassthroughUntil) return;
  if (!isForward && !isBackward && !isDuck && !isJump) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (isForward) {
    if (event.type === 'keydown' && !event.repeat) beginForwardMove();
    if (event.type === 'keyup') endForwardMove();
    return;
  }
  if (isBackward) {
    if (event.type === 'keydown' && !event.repeat) beginBackwardMove();
    if (event.type === 'keyup') endBackwardMove();
    return;
  }
  if (isDuck) {
    if (event.type === 'keydown' && !event.repeat) sendDuckKey('keydown');
    if (event.type === 'keyup') sendDuckKey('keyup');
    return;
  }
  if (isJump) {
    if (event.type === 'keydown' && !event.repeat) beginJump();
    if (event.type === 'keyup') endJump();
  }
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
