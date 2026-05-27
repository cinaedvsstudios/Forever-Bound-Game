const $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
  injectUiPolishStyles();
  removeVerboseHelperText();
  emojiButtonLabelsAndTooltips();
  reorganiseDisplayCard();
  moveLogicButtonsUnderSolutionBox();
});

function removeVerboseHelperText() {
  const purpose = $('active-engine-purpose');
  if (purpose) purpose.hidden = true;

  document.querySelectorAll('.triangle-disabled-note').forEach((node) => node.remove());

  const gridSlider = $('grid-slider');
  const gridRow = gridSlider?.closest('.range-row');
  gridRow?.querySelectorAll('small').forEach((small) => small.remove());

  const shapeSlider = $('layout-style-slider');
  const shapeRow = shapeSlider?.closest('.range-row');
  shapeRow?.querySelectorAll('small').forEach((small) => {
    small.textContent = 'Square → Pentagon → Hexagon → Circle.';
  });
}

function emojiButtonLabelsAndTooltips() {
  setButton('btn-random', '🎲 Fresh Random', 'Generate a fresh random maze using the current size, shape, stretch, and difficulty.');
  setButton('btn-start-blank', '⬜ Start Blank', 'Create a blank editable maze shape with entrance, exit, and border walls.');
  setButton('btn-clear-all', '🧹 Clear All', 'Clear the current layout and return to a blank editable shape.');
  setButton('btn-load-reference', '🖼️ Load Reference', 'Load the default reference maze layout.');

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
  const warpRow = $('warp-row');

  if (gridRow && shapeRow && gridRow.parentElement !== displayPanel) {
    displayPanel.insertBefore(gridRow, shapeRow);
  }
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

  if (warpRow && edgeRow && warpRow.compareDocumentPosition(edgeRow) & Node.DOCUMENT_POSITION_PRECEDING) {
    // keep Warp above Edge Style, then put physical display sliders under Edge Style
  }
}

function moveLogicButtonsUnderSolutionBox() {
  const statusBox = $('difficulty-status-box');
  const analyse = $('btn-apply-difficulty');
  const solve = $('btn-solve');
  if (!statusBox || !analyse || !solve) return;
  const buttonGrid = analyse.closest('.button-grid');
  if (!buttonGrid) return;
  statusBox.insertAdjacentElement('afterend', buttonGrid);
}

function injectUiPolishStyles() {
  if ($('maze-v115-ui-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-v115-ui-polish-style';
  style.textContent = `
    .engine-purpose[hidden]{display:none!important;}
    .left-icon-bar{background:transparent!important;background-image:none!important;box-shadow:none!important;border-color:rgba(158,230,164,.16)!important;}
    .panel-nav-button{position:relative;background:transparent!important;background-image:none!important;border-color:transparent!important;box-shadow:none!important;overflow:visible!important;font-size:1.75rem!important;}
    .panel-nav-button::before{content:'';position:absolute;left:50%;top:54%;width:62px;height:38px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(158,230,164,.36),rgba(158,230,164,.12) 42%,transparent 72%);filter:blur(4px);opacity:.9;z-index:-1;}
    .panel-nav-button.is-active::before{background:radial-gradient(circle,rgba(158,230,164,.62),rgba(158,230,164,.2) 45%,transparent 76%);filter:blur(5px);}
    .panel-nav-button.status-yellow::before{background:radial-gradient(circle,rgba(238,196,89,.56),rgba(238,196,89,.18) 45%,transparent 76%);}
    .panel-nav-button.status-red::before{background:radial-gradient(circle,rgba(226,88,88,.58),rgba(226,88,88,.18) 45%,transparent 76%);}
    .build-quick-actions + #btn-clear-all{margin-top:10px;}
    #btn-load-reference{margin-top:10px;}
    .stretch-inline-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;}
    .stretch-inline-row .range-row{min-width:0;padding:10px 10px;}
    .stretch-inline-row .range-row span{font-size:.82rem;}
    .stretch-inline-row input[type='range']{width:100%;}
    .display-size-row{border-color:rgba(158,230,164,.28)!important;background:rgba(7,31,16,.48)!important;}
    [data-panel-content='logic'] #difficulty-status-box + .button-grid{margin:8px 0 12px;}
    @media(max-width:520px){.stretch-inline-row{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(style);
}
