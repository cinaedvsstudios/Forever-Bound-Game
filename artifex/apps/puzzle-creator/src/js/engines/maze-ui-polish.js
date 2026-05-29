// Maze / Labyrinth UI polish
// Owns compact presentation adjustments that apply across the Maze editor panels.

const $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
  injectUiPolishStyles();
  markVisibleBuildVersion();
  removeVerboseHelperText();
  emojiButtonLabelsAndTooltips();
  reorganiseDisplayCard();
  moveLogicButtonsUnderSolutionBox();
  installWarpEdgeCleanupControl();
});

function markVisibleBuildVersion() {
  const pill = document.querySelector('.version-pill');
  if (pill) pill.textContent = 'V1.26';
  document.title = 'Artifex Puzzle Creator V1.26 · Forever Bound';
}

function removeVerboseHelperText() {
  const purpose = $('active-engine-purpose');
  if (purpose) purpose.hidden = true;
  document.querySelectorAll('.triangle-disabled-note').forEach((node) => node.remove());
  const gridRow = $('grid-slider')?.closest('.range-row');
  gridRow?.querySelectorAll('small').forEach((small) => small.remove());
  const shapeRow = $('layout-style-slider')?.closest('.range-row');
  shapeRow?.querySelectorAll('small').forEach((small) => {
    small.textContent = 'Square → Pentagon → Hexagon → Circle.';
  });
}

function emojiButtonLabelsAndTooltips() {
  setButton('btn-random', '🎲 Random', 'Generate a fresh random maze using the current size, shape, stretch and difficulty.');
  setButton('btn-start-blank', '⬜ Blank', 'Create a blank editable maze shape with entrance, exit and border walls.');
  setButton('btn-clear-all', '🧹 Clear', 'Clear the current layout and return to a blank editable shape.');
  setButton('btn-load-reference', '🖼️ Reference', 'Load the default reference maze layout.');
  document.querySelectorAll('button').forEach((button) => {
    if (!button.title) button.title = button.textContent.trim() || button.getAttribute('aria-label') || 'Button';
  });
}

function setButton(id, label, title) {
  const button = $(id);
  if (!button) return;
  button.textContent = label;
  button.title = title;
}

function reorganiseDisplayCard() {
  const displayPanel = document.querySelector('[data-panel-content="display"]');
  if (!displayPanel) return;
  const shapeRow = $('layout-style-slider')?.closest('.range-row');
  const gridRow = $('grid-slider')?.closest('.range-row');
  const stretchXRow = $('stretch-x-slider')?.closest('.range-row');
  const stretchYRow = $('stretch-y-slider')?.closest('.range-row');
  const wallHeightRow = $('wall-height-slider')?.closest('.range-row');
  const gapRow = $('gap-slider')?.closest('.range-row');
  const edgeRow = $('edge-style-slider')?.closest('.range-row');
  if (gridRow && shapeRow && gridRow.parentElement !== displayPanel) displayPanel.insertBefore(gridRow, shapeRow);
  gridRow?.classList.add('display-size-row');
  if (stretchXRow && stretchYRow && !displayPanel.querySelector('.stretch-inline-row')) {
    const stretchWrap = document.createElement('div');
    stretchWrap.className = 'stretch-inline-row';
    stretchXRow.parentNode.insertBefore(stretchWrap, stretchXRow);
    stretchWrap.appendChild(stretchXRow);
    stretchWrap.appendChild(stretchYRow);
  }
  if (edgeRow) {
    if (wallHeightRow) edgeRow.insertAdjacentElement('afterend', wallHeightRow);
    if (gapRow) wallHeightRow ? wallHeightRow.insertAdjacentElement('afterend', gapRow) : edgeRow.insertAdjacentElement('afterend', gapRow);
  }
}

function moveLogicButtonsUnderSolutionBox() {
  const statusBox = $('difficulty-status-box');
  const solve = $('btn-solve');
  const buttonGrid = solve?.closest('.button-grid');
  if (statusBox && solve && buttonGrid) statusBox.insertAdjacentElement('afterend', buttonGrid);
}

function installWarpEdgeCleanupControl() {
  const visualPanel = document.querySelector('[data-panel-content="visuals"]');
  const hint = visualPanel?.querySelector('.hint-text');
  const gapSlider = $('gap-slider');
  if (!visualPanel || !hint || !gapSlider || $('btn-smooth-warp-edges')) return;
  gapSlider.max = '1.46';
  const box = document.createElement('div');
  box.className = 'warp-edge-cleanup';
  box.innerHTML = `
    <div class="warp-edge-copy">
      <strong>Close Warped Gaps</strong>
      <small>Expands the preview tiles according to Warp so displaced blocks overlap and no dark seams remain.</small>
    </div>
    <button id="btn-smooth-warp-edges" class="wide-button" type="button" aria-pressed="false" title="Overlap warped visual tiles to cover gaps between displaced blocks">Close Gaps: Off</button>
  `;
  hint.insertAdjacentElement('afterend', box);
  const button = $('btn-smooth-warp-edges');
  const applyCoverage = () => {
    const mazeState = window.__artifexMazeRuntime?.state;
    if (!mazeState?.closeTileGaps) return;
    const warp = Number($('warp-slider')?.value || mazeState.warp || 0);
    const coverage = Math.min(1.46, 1.04 + warp * 0.0042);
    gapSlider.value = coverage.toFixed(2);
    gapSlider.dispatchEvent(new Event('input', { bubbles: true }));
    if ($('gap-val')) $('gap-val').textContent = `${coverage.toFixed(2)} auto`;
  };
  button.addEventListener('click', () => {
    const mazeState = window.__artifexMazeRuntime?.state;
    if (!mazeState) return;
    const active = !mazeState.closeTileGaps;
    mazeState.closeTileGaps = active;
    if (active) {
      mazeState.previousTileGap = Number(gapSlider.value || mazeState.gap || 0.98);
      gapSlider.disabled = true;
      applyCoverage();
    } else {
      gapSlider.disabled = false;
      gapSlider.value = String(mazeState.previousTileGap || 0.98);
      gapSlider.dispatchEvent(new Event('input', { bubbles: true }));
      if ($('gap-val')) $('gap-val').textContent = Number(gapSlider.value).toFixed(2);
    }
    button.textContent = `Close Gaps: ${active ? 'On' : 'Off'}`;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
    window.__artifexMazeRuntimeControls?.repaintAll?.();
  });
  $('warp-slider')?.addEventListener('input', () => {
    applyCoverage();
    window.__artifexMazeRuntimeControls?.repaintAll?.();
  }, true);
}

function injectUiPolishStyles() {
  if ($('maze-ui-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-ui-polish-style';
  style.textContent = `
    @media(min-width:1241px){.app-header{position:relative!important;}.app-menu{position:absolute!important;left:50%!important;transform:translateX(-50%)!important;justify-self:auto!important;}}
    .engine-purpose[hidden]{display:none!important;}
    .left-icon-bar{position:sticky!important;top:0!important;z-index:30!important;background:linear-gradient(180deg,rgba(3,18,10,.99),rgba(4,26,14,.97))!important;box-shadow:0 12px 20px rgba(0,0,0,.3)!important;border-color:rgba(158,230,164,.16)!important;backdrop-filter:blur(8px);}
    .panel-nav-button{position:relative;background:transparent!important;background-image:none!important;border-color:transparent!important;box-shadow:none!important;overflow:visible!important;font-size:1.75rem!important;}
    .panel-nav-button::before{content:'';position:absolute;left:50%;top:54%;width:62px;height:38px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(158,230,164,.36),rgba(158,230,164,.12) 42%,transparent 72%);filter:blur(4px);opacity:.9;z-index:-1;}
    .panel-nav-button.is-active::before{background:radial-gradient(circle,rgba(158,230,164,.62),rgba(158,230,164,.2) 45%,transparent 76%);filter:blur(5px);}
    .panel-nav-button.status-yellow::before{background:radial-gradient(circle,rgba(238,196,89,.56),rgba(238,196,89,.18) 45%,transparent 76%);}
    .panel-nav-button.status-red::before{background:radial-gradient(circle,rgba(226,88,88,.58),rgba(226,88,88,.18) 45%,transparent 76%);}
    .left-panel-body,.tool-panel{font-size:.86rem;}.tool-panel h2{font-size:1.1rem!important;}.tool-panel .eyebrow{font-size:.64rem!important;}.tool-panel .field-block>span,.tool-panel .range-row>span,.tool-panel .toggle-row strong{font-size:.8rem!important;}.tool-panel small,.tool-panel .hint-text{font-size:.66rem!important;}
    .build-quick-actions{gap:13px!important;margin-top:12px!important;margin-bottom:2px!important;}.build-quick-actions + #btn-clear-all{margin-top:13px!important;margin-right:8px!important;}#btn-load-reference{margin-top:13px!important;}
    #btn-random,#btn-start-blank,#btn-clear-all,#btn-load-reference,#dropzone{font-size:.7rem!important;line-height:1.15!important;padding-left:6px!important;padding-right:6px!important;min-height:42px!important;}#btn-clear-all,#btn-load-reference{white-space:nowrap;}
    .stretch-inline-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;}.stretch-inline-row .range-row{min-width:0;padding:10px 10px;}.stretch-inline-row .range-row span{font-size:.75rem;}.stretch-inline-row input[type='range']{width:100%;}.display-size-row{border-color:rgba(158,230,164,.28)!important;background:rgba(7,31,16,.48)!important;}[data-panel-content='logic'] #difficulty-status-box + .button-grid{margin:8px 0 12px;}
    .warp-edge-cleanup{display:grid;gap:9px;margin:11px 0 15px;padding:11px;border:1px solid rgba(158,230,164,.18);border-radius:14px;background:rgba(0,0,0,.16);}.warp-edge-copy strong{display:block;color:#eadfc6;font-size:.78rem;}.warp-edge-copy small{display:block;color:#a9b59e;margin-top:3px;line-height:1.35;}#btn-smooth-warp-edges{min-height:34px!important;font-size:.68rem!important;}#btn-smooth-warp-edges.is-active{border-color:rgba(158,230,164,.52);background:rgba(50,113,64,.68);color:#dff8d8;box-shadow:0 0 15px rgba(158,230,164,.11);}#gap-slider:disabled{opacity:.58;}
    @media(max-width:520px){.stretch-inline-row{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(style);
}
