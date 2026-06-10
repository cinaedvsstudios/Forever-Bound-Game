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
  configureScatterPlacementUi();
  window.setTimeout(reorganiseSurfaceEditPanel, 0);
});

function markVisibleBuildVersion() {
  const eyebrow = document.querySelector('.brand-title-block .eyebrow');
  if (eyebrow) eyebrow.textContent = 'Artifex Puzzle Creator Module';
  const pill = document.querySelector('.version-pill');
  if (pill) pill.textContent = 'V1.35';
  document.title = 'Artifex Puzzle Creator V1.35 · Forever Bound';
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

function reorganiseSurfaceEditPanel() {
  const panel = document.querySelector('[data-panel-content="visuals"]');
  const titleRow = panel?.querySelector('.panel-title-row');
  const targetGrid = panel?.querySelector('.target-grid');
  const wallCard = $('maze-wall-form-card');
  if (!panel || !titleRow || !targetGrid || !wallCard) return;

  const panelTitle = titleRow.querySelector('h2');
  if (panelTitle) panelTitle.textContent = 'Walls';

  titleRow.insertAdjacentElement('afterend', wallCard);
  const scatterCard = $('maze-scatter-card');
  if (scatterCard) wallCard.insertAdjacentElement('afterend', scatterCard);

  let coloursHeading = panel.querySelector('.surface-colours-heading');
  if (!coloursHeading) {
    coloursHeading = document.createElement('h3');
    coloursHeading.className = 'surface-section-heading surface-colours-heading';
    coloursHeading.textContent = 'Colours';
  }
  targetGrid.insertAdjacentElement('beforebegin', coloursHeading);

  const existingColoursHeading = [...panel.querySelectorAll('h3')]
    .find((heading) => heading !== coloursHeading && heading.textContent.trim() === 'Colours');
  if (existingColoursHeading) existingColoursHeading.textContent = 'Palette';
}

function configureScatterPlacementUi() {
  const visualsPanel = document.querySelector('[data-panel-content="visuals"]');
  if (!visualsPanel) return;

  const syncVisibleCopy = () => {
    const action = visualsPanel.querySelector('[data-scatter-regenerate]');
    const actionTitle = 'Place placeholder markers using each slot’s selected amount, seed and placement mode.';
    if (action) {
      if (action.textContent !== 'Place Markers') action.textContent = 'Place Markers';
      if (action.title !== actionTitle) action.title = actionTitle;
    }
    const status = visualsPanel.querySelector('.scatter-status');
    if (status) {
      const nextText = status.textContent
        .replace('then regenerate markers', 'then choose Place Markers')
        .replace('regenerate now', 'choose Place Markers now')
        .replace('Regenerate to update marker positions.', 'Choose Place Markers to update marker positions.')
        .replace('Regenerate to apply it.', 'Choose Place Markers to apply it.');
      if (status.textContent !== nextText) status.textContent = nextText;
    }
  };

  const syncTypedValue = (target) => {
    const scatter = window.__artifexMazeScatter?.state;
    if (!scatter) return;
    if (target.matches('[data-scatter-amount]')) {
      const slotId = target.dataset.scatterAmount;
      const slot = scatter.light.id === slotId ? scatter.light : scatter.decorations.find((item) => item.id === slotId);
      if (!slot) return;
      const maximum = slot.type === 'light' ? 30 : 20;
      slot.amount = clampScatterNumber(target.value, 0, maximum);
    }
    if (target.matches('[data-scatter-seed]')) {
      scatter.seed = clampScatterNumber(target.value, 1, 999999);
    }
  };

  visualsPanel.addEventListener('input', (event) => syncTypedValue(event.target), true);
  visualsPanel.addEventListener('change', (event) => syncTypedValue(event.target), true);
  visualsPanel.addEventListener('click', (event) => {
    if (!event.target.closest('[data-scatter-regenerate]')) return;
    visualsPanel.querySelectorAll('[data-scatter-amount], [data-scatter-seed]').forEach(syncTypedValue);
  }, true);

  new MutationObserver(syncVisibleCopy).observe(visualsPanel, { childList: true, subtree: true });
  syncVisibleCopy();
}

function clampScatterNumber(value, minimum, maximum) {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed)) return minimum;
  return Math.max(minimum, Math.min(maximum, parsed));
}

function injectUiPolishStyles() {
  if ($('maze-ui-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-ui-polish-style';
  style.textContent = `
    @media(min-width:1241px){.app-header{position:relative!important;}.app-menu{position:absolute!important;left:50%!important;transform:translateX(-50%)!important;justify-self:auto!important;}}
    .engine-purpose[hidden]{display:none!important;}
    .is-puzzle-chooser .overview-window{display:none!important;}
    .left-icon-bar{position:sticky!important;top:0!important;z-index:30!important;background:linear-gradient(180deg,rgba(3,18,10,.99),rgba(4,26,14,.97))!important;box-shadow:0 12px 20px rgba(0,0,0,.3)!important;border-color:rgba(158,230,164,.16)!important;backdrop-filter:blur(8px);}
    .panel-nav-button{position:relative;background:transparent!important;background-image:none!important;border-color:transparent!important;box-shadow:none!important;overflow:visible!important;font-size:1.75rem!important;}
    .panel-nav-button::before{content:'';position:absolute;left:50%;top:42%;width:62px;height:38px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(158,230,164,.36),rgba(158,230,164,.12) 42%,transparent 72%);filter:blur(4px);opacity:.9;z-index:-1;}
    .panel-nav-button.is-active::before{background:radial-gradient(circle,rgba(158,230,164,.62),rgba(158,230,164,.2) 45%,transparent 76%);filter:blur(5px);}
    .panel-nav-button.status-yellow::before{background:radial-gradient(circle,rgba(238,196,89,.56),rgba(238,196,89,.18) 45%,transparent 76%);}
    .panel-nav-button.status-red::before{background:radial-gradient(circle,rgba(226,88,88,.58),rgba(226,88,88,.18) 45%,transparent 76%);}
    .panel-nav-icon{font-size:1.6rem!important;}.panel-nav-label{font-size:.57rem!important;color:var(--muted);}.panel-nav-button.is-active .panel-nav-label{color:var(--green2);}
    .left-panel-body,.tool-panel{font-size:.86rem;}.tool-panel h2{font-size:1.1rem!important;}.tool-panel .eyebrow{font-size:.64rem!important;}.tool-panel .field-block>span,.tool-panel .range-row>span,.tool-panel .toggle-row strong{font-size:.8rem!important;}.tool-panel small,.tool-panel .hint-text{font-size:.66rem!important;}
    .build-quick-actions{gap:13px!important;margin-top:12px!important;margin-bottom:2px!important;}.build-quick-actions + #btn-clear-all{margin-top:13px!important;margin-right:8px!important;}#btn-load-reference{margin-top:13px!important;}
    #btn-random,#btn-start-blank,#btn-clear-all,#btn-load-reference,#dropzone{font-size:.7rem!important;line-height:1.15!important;padding-left:6px!important;padding-right:6px!important;min-height:42px!important;}#btn-clear-all,#btn-load-reference{white-space:nowrap;}
    .stretch-inline-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;}.stretch-inline-row .range-row{min-width:0;padding:10px 10px;}.stretch-inline-row .range-row span{font-size:.75rem;}.stretch-inline-row input[type='range']{width:100%;}.display-size-row{border-color:rgba(158,230,164,.28)!important;background:rgba(7,31,16,.48)!important;}[data-panel-content='logic'] #difficulty-status-box + .button-grid{margin:8px 0 12px;}
    [data-panel-content='visuals'] .surface-section-heading{margin:10px 0 9px!important;color:var(--green2);font-size:.78rem!important;letter-spacing:.15em;text-transform:uppercase;}
    [data-panel-content='visuals'] .maze-wall-form-card{margin:6px 0 15px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;}
    [data-panel-content='visuals'] .maze-wall-form-card .wall-form-copy strong{display:none!important;}
    [data-panel-content='visuals'] .maze-scatter-card{margin:0 0 15px!important;padding:15px 0 0!important;border:0!important;border-top:1px solid rgba(158,230,164,.23)!important;border-radius:0!important;background:transparent!important;}
    [data-panel-content='visuals'] .maze-scatter-card .scatter-head strong{font-size:.8rem!important;line-height:1.25;}
    [data-panel-content='visuals'] .surface-colours-heading{margin-top:0!important;padding-top:15px;border-top:1px solid rgba(158,230,164,.23);}
    @media(max-width:520px){.stretch-inline-row{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(style);
}
