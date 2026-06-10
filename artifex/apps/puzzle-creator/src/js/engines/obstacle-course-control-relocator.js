// Horse Forest Ride Control Relocator V1
// Moves Start Test / Pause / Reset Run buttons from the middle viewer to the left construction panel.

const STYLE_ID = 'horse-control-relocator-v1-style';
const TARGET_ID = 'horse-run-controls-left-slot';

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    body.is-horse-forest .horse-v17-view-card .horse-v17-controls{display:none!important}
    body.is-horse-forest #${TARGET_ID}{display:grid;grid-template-columns:1fr;gap:8px;margin:10px 0 12px;padding:10px;border:1px solid rgba(238,196,90,.28);border-radius:12px;background:rgba(82,55,10,.18)}
    body.is-horse-forest #${TARGET_ID} button{min-height:38px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}
    body.is-horse-forest #${TARGET_ID} button:hover{border-color:rgba(158,230,164,.65);background:rgba(20,72,37,.82)}
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
  if (!document.body.classList.contains('is-horse-forest')) return false;
  const panel = document.querySelector('[data-horse-v17-panel="build"]');
  const regenerate = document.getElementById('horse-v17-regenerate');
  if (!panel || !regenerate) return false;

  let slot = document.getElementById(TARGET_ID);
  if (!slot) {
    slot = document.createElement('div');
    slot.id = TARGET_ID;
    regenerate.insertAdjacentElement('afterend', slot);
  }

  if (!slot.children.length) {
    const start = cloneButton('horse-v17-start', 'Start Test');
    const pause = cloneButton('horse-v17-pause', 'Pause');
    const reset = cloneButton('horse-v17-reset', 'Reset Run');
    [start, pause, reset].forEach((button) => { if (button) slot.appendChild(button); });
  }
  return true;
}

function boot() {
  injectStyle();
  const observer = new MutationObserver(moveRunControlsLeft);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  document.addEventListener('click', () => requestAnimationFrame(moveRunControlsLeft), true);
  setInterval(moveRunControlsLeft, 700);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
