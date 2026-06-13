import { OC, VERSION } from './obstacle-course-state.js';
import { TEMPLATES } from './obstacle-course-assets.js';
import { $, clamp, formatNumber } from './obstacle-course-utils.js';

export function updateDocumentVersion() {
  document.title = `Obstacle Course · Puzzle Creator ${VERSION} · Forever Bound`;
  document.querySelectorAll('.version-pill,.status-pill').forEach((node) => {
    if (/V\d/.test(node.textContent || '')) node.textContent = VERSION;
  });
}

export function ensureHeader() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  updateDocumentVersion();
  if (!$('oc-app-header-controls')) {
    const controls = document.createElement('section');
    controls.id = 'oc-app-header-controls';
    controls.className = 'oc-real-header-actions';
    controls.innerHTML = `<div class="oc-header-run"><button id="obstacle-start" type="button" disabled>Start Test</button><button id="obstacle-pause" type="button">Pause</button><button id="obstacle-reset-run" type="button">Reset Run</button><span id="oc-debug-button-slot" class="oc-header-debug-slot"></span></div><div class="oc-header-status"><strong id="obstacle-status">Loading</strong><span id="oc-top-load">Assets 0 / 0</span><span id="oc-top-info">Distance 0 / 0</span></div>`;
    const back = header.querySelector('.module-back-link');
    header.insertBefore(controls, back || null);
  }
}

export function injectStyles() {
  if ($('oc-modular-styles')) return;
  const style = document.createElement('style');
  style.id = 'oc-modular-styles';
  style.textContent = `
    .app-header{height:92px;display:grid;grid-template-columns:minmax(290px,auto) minmax(0,1fr) auto;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid rgba(190,139,222,.24);background:rgba(8,5,12,.92)}
    .brand-lockup{justify-self:start;min-width:290px}.oc-real-header-actions{justify-self:start;display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden}.oc-header-run{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.oc-header-run button,.oc-header-debug-slot button{min-height:34px;border:1px solid rgba(124,202,125,.42);border-radius:10px;background:rgba(20,72,37,.72);color:#f4ead4;font-weight:900;cursor:pointer;padding:0 10px;font-size:.72rem;white-space:nowrap}.oc-header-run button:disabled{opacity:.45;cursor:not-allowed}.oc-header-status{display:grid;gap:1px;min-width:168px;max-width:230px;border:1px solid rgba(238,196,90,.45);border-radius:11px;background:rgba(5,10,16,.78);padding:6px 8px;color:#eec45a;font-size:.62rem;font-weight:900;line-height:1.2}.oc-header-status span{color:#c9bfae;font-size:.59rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .obstacle-app{height:100%;display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:12px;padding:14px;overflow:hidden}.obstacle-main-card,.obstacle-side-card{min-height:0;border:1px solid rgba(238,196,90,.32);border-radius:16px;background:rgba(5,10,16,.9);box-shadow:0 20px 70px rgba(0,0,0,.34);padding:16px;overflow:auto}.obstacle-three-wrap{position:relative;width:100%;aspect-ratio:16/9;min-height:360px;border:1px solid rgba(124,202,125,.24);border-radius:14px;overflow:hidden;background-color:#05080d;background-image:var(--oc-bg-image,none);background-repeat:no-repeat;background-size:var(--oc-bg-size,110%) auto;background-position:var(--oc-bg-x,50%) var(--oc-bg-y,50%);filter:brightness(var(--oc-screen-brightness,1)) contrast(var(--oc-screen-contrast,1)) saturate(var(--oc-screen-saturation,1))}.obstacle-three-wrap canvas{position:relative;z-index:2;width:100%!important;height:100%!important;display:block}.obstacle-tint-overlay{position:absolute;inset:0;z-index:5;pointer-events:none;background:var(--oc-tint,#000);opacity:var(--oc-tint-opacity,0);mix-blend-mode:color}.obstacle-horse-overlay{position:absolute;left:50%;bottom:-38px;z-index:7;width:430px;height:247px;margin-left:-215px;pointer-events:none;filter:drop-shadow(0 7px 9px rgba(0,0,0,.72));opacity:.98;background-image:url('./assets/foreground/horse.png');background-repeat:no-repeat;background-size:700% 100%;background-position:0 0}.obstacle-hud{position:absolute;left:14px;top:12px;z-index:8;display:flex;gap:8px;flex-wrap:wrap}.obstacle-hud span,.oc-result,.oc-loading{border:1px solid rgba(238,196,90,.35);border-radius:999px;background:rgba(5,10,16,.72);padding:6px 9px;color:#f4ead4;font-size:.72rem;font-weight:900}.oc-result,.oc-loading{margin-top:10px;border-radius:10px}.oc-result.success{border-color:rgba(124,202,125,.65);color:#9ee6a4}.oc-result.failure{border-color:rgba(215,75,75,.65);color:#ff8f8f}
    .obstacle-speed-badge{position:absolute;right:18px;top:12px;z-index:9;width:330px;height:62px;background:transparent;border:0;padding:0;color:#f4ead4;pointer-events:none}.oc-powerbar-wrap{position:relative;width:300px;height:46px;margin:0 auto;overflow:hidden}.oc-powerbar-empty,.oc-powerbar-full,.oc-powerbar-full-clip{position:absolute;left:0;top:0;width:300px;height:46px;background-image:url('./assets/ui/powerbars.png');background-repeat:no-repeat;background-size:312px auto;pointer-events:none}.oc-powerbar-empty{background-position:-11px -168px}.oc-powerbar-full-clip{overflow:hidden;background:none;opacity:0;transition:opacity .08s linear}.oc-powerbar-full{background-position:-11px -117px}.oc-speed-label{position:absolute;left:82px;top:15px;width:184px;z-index:12;display:flex;justify-content:center;align-items:center;color:#f4ead4;text-shadow:0 2px 4px #000;font-size:.78rem;font-weight:900;letter-spacing:.02em}.oc-offpath-label{position:absolute;left:82px;top:34px;width:184px;z-index:12;font-size:.65rem;text-align:center;color:#ff7777;font-weight:900;text-shadow:0 2px 4px #000}.oc-offpath-arrow{position:absolute;top:50%;z-index:10;width:64px;height:64px;background-image:url('../../../shared/ui/defaultarrows.webp');background-size:200% 100%;display:none;filter:drop-shadow(0 3px 5px rgba(0,0,0,.7));animation:ocPulse .7s ease-in-out infinite alternate}.oc-offpath-arrow.dir-left{left:22px;background-position:left center}.oc-offpath-arrow.dir-right{right:22px;background-position:right center}.oc-offpath-arrow.is-visible{display:block}@keyframes ocPulse{from{transform:translateY(-50%) scale(.96)}to{transform:translateY(-50%) scale(1.08)}}
    .oc-loading-horse{position:absolute;left:50%;bottom:185px;z-index:12;display:grid;place-items:center;gap:5px;transform:translateX(-50%);padding:8px 12px;border:1px solid rgba(238,196,90,.38);border-radius:14px;background:rgba(5,10,16,.58);color:#f4ead4;text-align:center;pointer-events:none;box-shadow:0 6px 22px rgba(0,0,0,.35)}.oc-loading-horse[hidden]{display:none!important}.oc-loading-spinner{width:34px;height:34px;border-radius:50%;border:3px solid rgba(238,196,90,.28);border-top-color:#eec45a;animation:ocSpin .85s linear infinite}.oc-loading-horse strong{font-size:.72rem}.oc-loading-horse span{font-size:.66rem;color:#eec45a;font-weight:900}@keyframes ocSpin{to{transform:rotate(360deg)}}
    .field-block,.range-row{display:block;margin:9px 0;color:#c9bfae;font-size:.75rem;font-weight:800}.field-block span,.range-row span{display:block;margin-bottom:4px;color:#f4ead4;font-weight:900}.field-block input,.field-block select,.range-row input[type=range]{width:100%}.hf-layer-panel{border:1px solid rgba(124,202,125,.24);border-radius:12px;padding:10px;margin-bottom:12px;background:rgba(255,255,255,.025)}.hf-layer-panel h3{font-family:Cinzel,Georgia,serif;margin:0 0 8px;color:#eec45a}.hf-button-row{display:flex;gap:6px;flex-wrap:wrap}.hf-button-row button,.control-button,.hf-glb-select-row button{border:1px solid rgba(124,202,125,.34);border-radius:9px;background:rgba(20,72,37,.56);color:#f4ead4;font-weight:900;padding:7px 9px;cursor:pointer}.hint-text{font-size:.7rem;color:#c9bfae;line-height:1.35}.hf-overview{width:100%;height:auto;max-height:360px;border:1px solid rgba(238,196,90,.3);border-radius:10px;background:#101914;margin-top:10px}.oc-enhanced-range{display:grid;grid-template-columns:minmax(82px,1fr) auto;gap:6px;align-items:center;margin:8px 0}.oc-enhanced-range>input[type=range]{grid-column:1 / -1;width:100%}.oc-range-title{font-size:.68rem;color:#f4ead4;font-weight:900}.oc-range-stepper{display:inline-grid;grid-template-columns:24px 54px 24px;gap:4px;align-items:center}.oc-range-step{height:24px;border:1px solid rgba(124,202,125,.36);border-radius:7px;background:rgba(20,72,37,.62);color:#f4ead4;font-weight:900;cursor:pointer}.oc-range-value{height:24px;border:1px solid rgba(238,196,90,.32);border-radius:7px;background:#05080d;color:#eec45a;font-size:.68rem;font-weight:900;text-align:center}.oc-hidden-output{display:none!important}.hf-glb-select-row{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center}
    .hf-glb-picker-modal{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.65);display:grid;place-items:center;padding:24px}.hf-glb-picker-card{width:min(780px,92vw);max-height:78vh;overflow:auto;border:1px solid rgba(238,196,90,.55);border-radius:16px;background:#070b10;color:#f4ead4;padding:16px;box-shadow:0 30px 90px rgba(0,0,0,.55)}.hf-glb-picker-close{float:right}.hf-glb-picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:10px;clear:both}.hf-glb-tile{min-height:126px;border:1px solid rgba(124,202,125,.34);border-radius:12px;background:rgba(20,72,37,.28);color:#f4ead4;display:grid;gap:4px;place-items:center;text-align:center;padding:10px;cursor:pointer}.hf-glb-tile.is-missing{opacity:.45;cursor:not-allowed}.hf-glb-thumb{font-size:2.1rem;color:#eec45a}.hf-glb-tile small{font-size:.62rem;color:#c9bfae;word-break:break-word}
  `;
  document.head.appendChild(style);
}

export function mountLayout() {
  OC.rightPanel.innerHTML = `<div class="obstacle-app"><section class="obstacle-main-card"><div id="obstacle-stage" class="obstacle-three-wrap"><div class="obstacle-tint-overlay"></div><div id="obstacle-speed-badge" class="obstacle-speed-badge"></div><div id="oc-offpath-arrow" class="oc-offpath-arrow dir-right"></div><div id="obstacle-horse" class="obstacle-horse-overlay"></div><div id="oc-loading-horse" class="oc-loading-horse" hidden><div class="oc-loading-spinner"></div><strong id="oc-loading-horse-title">Loading assets</strong><span id="oc-loading-horse-count">Assets 0 / 0</span></div><div class="obstacle-hud"><span id="obstacle-distance-readout">Distance 0 / ${OC.courseLength}</span><span id="obstacle-score-readout">Score 0</span></div></div><div id="obstacle-result" class="oc-result"></div><div id="oc-loading" class="oc-loading">Loading assets 0 / 0</div><section class="hf-overview-wrap"><canvas id="hf-overview" class="hf-overview" width="280" height="500"></canvas></section></section><aside class="obstacle-side-card"><section class="hf-layer-panel"><h3>Layer Controls</h3><label class="field-block"><span>Selected layer</span><select id="hf-layer-select"><option value="path">Path</option></select></label><div class="hf-button-row"><button id="hf-layer-visible" type="button">Hide/Show</button><button id="hf-layer-solo" type="button">Solo</button><button id="hf-layer-all" type="button">All</button></div><div class="hf-button-row" style="margin-top:7px"><button id="hf-layer-above" type="button">Above</button><button id="hf-layer-below" type="button">Below</button><button id="hf-white-bg" type="button">BG White</button></div><div id="hf-layer-selected-label" class="hint-text" style="margin-top:8px">Layer controls appear when required assets finish loading.</div><div id="hf-layer-sliders"><p class="hint-text">Waiting for required assets.</p></div></section><section class="hf-layer-panel"><h3>Global Visual</h3><div id="hf-global-sliders"></div></section></aside></div>`;
  OC.host = OC.rightPanel.querySelector('.obstacle-app');
  OC.stage = $('obstacle-stage');
}

export function mountLeftPanel({ onRegenerate, onExport, onImport }) {
  OC.leftPanel.innerHTML = `<label class="field-block"><span>Course Template</span><select id="obstacle-template">${Object.entries(TEMPLATES).map(([id,t]) => `<option value="${id}">${t.label}</option>`).join('')}</select></label><label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">${OC.difficulty}</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" step="1" value="${OC.difficulty}"></label><label class="range-row"><span>Course Distance <output id="obstacle-distance-out">${OC.courseLength}</output></span><input id="obstacle-distance" type="range" min="600" max="2400" step="100" value="${OC.courseLength}"></label><label class="range-row"><span>Forest Distance From Path Edge <output id="obstacle-scenery-distance-out">${OC.sceneryDistance}</output></span><input id="obstacle-scenery-distance" type="range" min="0" max="100" step="1" value="${OC.sceneryDistance}"></label><button id="obstacle-regenerate" class="control-button" type="button">Regenerate Obstacle Course</button><section class="hf-layer-panel"><h3>View Helpers</h3><label class="field-block"><span><input id="oc-ground-grid-toggle" type="checkbox"> Show ground grid</span></label><label class="field-block"><span><input id="oc-overview-path-overlay" type="checkbox" checked> Show path alpha on overview</span></label><label class="range-row"><span>Vanishing Point X <output id="oc-vp-x-out">${OC.vanishX}</output></span><input id="oc-vp-x" type="range" min="-100" max="100" step="1" value="${OC.vanishX}"></label><label class="range-row"><span>Vanishing Point Y <output id="oc-vp-y-out">${OC.vanishY}</output></span><input id="oc-vp-y" type="range" min="-100" max="100" step="1" value="${OC.vanishY}"></label><label class="range-row"><span>View Angle <output id="oc-vp-angle-out">${OC.cameraAngle}</output></span><input id="oc-vp-angle" type="range" min="-100" max="100" step="1" value="${OC.cameraAngle}"></label></section><section class="hf-layer-panel"><h3>Settings</h3><div class="hf-button-row"><button id="hf-export-json" type="button">Download JSON</button><button id="hf-import-json" type="button">Import JSON Settings</button><input id="hf-import-json-file" type="file" accept="application/json" hidden></div></section>`;
  $('obstacle-regenerate')?.addEventListener('click', onRegenerate);
  $('hf-export-json')?.addEventListener('click', onExport);
  $('hf-import-json')?.addEventListener('click', () => $('hf-import-json-file')?.click());
  $('hf-import-json-file')?.addEventListener('change', onImport);
}

export function buildSliderRow(host, prefix, prop, label, min, max, step, value, handler) {
  const row = document.createElement('div');
  row.className = 'range-row oc-enhanced-range';
  const id = `${prefix}-${prop}`;
  row.innerHTML = `<span class="oc-range-title">${label}</span><span class="oc-range-stepper"><button type="button" class="oc-range-step" data-delta="-1">&lt;</button><input id="${id}-value" class="oc-range-value" type="number" min="${min}" max="${max}" step="${step}" value="${formatNumber(value)}"><button type="button" class="oc-range-step" data-delta="1">&gt;</button></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
  host.appendChild(row);
  const slider = row.querySelector(`#${id}`);
  const number = row.querySelector(`#${id}-value`);
  const commit = (raw) => { const v = clamp(Number(raw || 0), Number(min), Number(max)); slider.value = v; number.value = formatNumber(v); handler(v); };
  slider.addEventListener('input', (e) => commit(e.target.value));
  number.addEventListener('change', (e) => commit(e.target.value));
  row.querySelectorAll('.oc-range-step').forEach((button) => button.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); commit(Number(slider.value || 0) + Number(button.dataset.delta || 0) * Number(step || 1)); }));
}

export function enhanceStaticRangeSteppers(scope = document) {
  scope.querySelectorAll('.range-row').forEach((row) => {
    if (row.classList.contains('oc-enhanced-range') || row.dataset.stepperReady === '1') return;
    const input = row.querySelector('input[type="range"]');
    const output = row.querySelector('output');
    if (!input || !output) return;
    row.dataset.stepperReady = '1';
    const wrap = document.createElement('span');
    wrap.className = 'oc-range-stepper';
    wrap.innerHTML = `<button type="button" class="oc-range-step" data-delta="-1">&lt;</button><input class="oc-range-value" type="number" min="${input.min}" max="${input.max}" step="${input.step || 1}" value="${output.textContent || input.value || 0}"><button type="button" class="oc-range-step" data-delta="1">&gt;</button>`;
    output.classList.add('oc-hidden-output');
    output.insertAdjacentElement('afterend', wrap);
    const number = wrap.querySelector('.oc-range-value');
    const commit = (raw) => { const v = clamp(Number(raw || 0), Number(input.min || -100), Number(input.max || 100)); input.value = v; number.value = formatNumber(v); output.textContent = formatNumber(v); input.dispatchEvent(new Event('input', { bubbles: true })); };
    input.addEventListener('input', () => { number.value = formatNumber(input.value); output.textContent = formatNumber(input.value); });
    number.addEventListener('change', () => commit(number.value));
    wrap.querySelectorAll('.oc-range-step').forEach((button) => button.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); commit(Number(input.value || 0) + Number(button.dataset.delta || 0) * Number(input.step || 1)); }));
  });
}

export function setResult(message, type = '') {
  const node = $('obstacle-result');
  if (!node) return;
  node.textContent = message;
  node.className = `oc-result ${type}`.trim();
}
