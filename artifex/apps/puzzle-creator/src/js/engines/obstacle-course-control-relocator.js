// Horse Forest Ride Control Relocator V2
// Moves Start Test / Pause / Reset Run from the live Obstacle Course viewer into the left construction panel.

const STYLE_ID = 'horse-control-relocator-v2-style';
const TARGET_ID = 'horse-run-controls-left-slot';

function injectStyle() {
  document.getElementById('horse-control-relocator-v1-style')?.remove();
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    body.is-obstacle-course .obstacle-view-card .obstacle-control-row{display:none!important}
    body.is-obstacle-course #${TARGET_ID}{display:grid;grid-template-columns:1fr;gap:8px;margin:10px 0 12px;padding:10px;border:1px solid rgba(238,196,90,.28);border-radius:12px;background:rgba(82,55,10,.18)}
    body.is-obstacle-course #${TARGET_ID} button{min-height:38px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}
    body.is-obstacle-course #${TARGET_ID} button:hover{border-color:rgba(158,230,164,.65);background:rgba(20,72,37,.82)}
  `;
  document.head.appendChild(style);
}

function cloneButton(sourceId, label) {
  const source = document.getElementById(sourceId);
  if (!source) return null;
  const clone = document.createElement('button');
  clone.type = 'button';
  clone.textContent = label || source.textContent || sourceId;
  clone.addEventListener('click', () => source.click());
  return clone;
}

function moveRunControlsLeft() {
  if (!document.body.classList.contains('is-obstacle-course')) return false;
  const panel = document.querySelector('[data-obstacle-panel="build"]');
  const regenerate = document.getElementById('obstacle-regenerate');
  if (!panel || !regenerate) return false;

  let slot = document.getElementById(TARGET_ID);
  if (!slot) {
    slot = document.createElement('div');
    slot.id = TARGET_ID;
    regenerate.insertAdjacentElement('afterend', slot);
  }

  if (!slot.children.length) {
    const start = cloneButton('obstacle-start', 'Start Test');
    const pause = cloneButton('obstacle-pause', 'Pause');
    const reset = cloneButton('obstacle-reset-run', 'Reset Run');
    [start, pause, reset].forEach((button) => { if (button) slot.appendChild(button); });
  }
  return true;
}

function boot() {
  injectStyle();
  const observer = new MutationObserver(moveRunControlsLeft);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  document.addEventListener('click', () => requestAnimationFrame(moveRunControlsLeft), true);
  setInterval(moveRunControlsLeft, 500);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
