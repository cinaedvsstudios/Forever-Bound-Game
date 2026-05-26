import { editorState, onStateChange } from './editor-state.js';

const CARD_ICON_UPDATES = [
  ['🧩', 'Effect Archetype Assets'],
  ['🎨', 'Quick Edit Helpers'],
  ['💅', 'Effect Layer Appearance'],
  ['🚀', 'Effect Layer Dynamics'],
  ['💥', 'Effect Specific Controls']
];

const INSERT_ICONS = ['⚙️', '⚡', '🔥', '🌀', '💫', '💥', '🌫️', '✨', '♨️', '✴️', '📸', '🔤'];

export function initV315Polish() {
  injectStyles();
  tidyWorkspaceNote();
  applyCardIcons();
  installFloatingWorkspaceControls();
  repairDisplayPanel();
  decorateInsertMenu();
  onStateChange(() => {
    tidyWorkspaceNote();
    applyCardIcons();
    installFloatingWorkspaceControls();
    repairDisplayPanel();
    decorateInsertMenu();
  });
}

function injectStyles() {
  if (document.getElementById('v315-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'v315-polish-style';
  style.textContent = `
    .workspace-toolbar-note { display: none !important; }
    .workspace-toolbar.compact-toolbar { min-height: 0 !important; height: 0 !important; padding: 0 !important; border: 0 !important; overflow: hidden !important; }
    #workspace { position: relative; }
    .workspace-floating-controls {
      position: absolute;
      top: 10px;
      z-index: 12;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px;
      border: 1px solid rgba(226,204,167,.18);
      border-radius: 16px;
      background: rgba(9, 7, 7, .78);
      box-shadow: 0 12px 24px rgba(0,0,0,.56), 0 0 16px rgba(0,174,234,.12);
      backdrop-filter: blur(8px);
      pointer-events: auto;
    }
    .workspace-floating-controls button,
    .workspace-floating-controls span {
      min-width: 42px;
      min-height: 36px;
      display: grid;
      place-items: center;
      padding: 6px 10px;
      border-radius: 13px;
      white-space: nowrap;
    }
    .workspace-floating-left { left: 12px; }
    .workspace-floating-right { right: 12px; }
    .workspace-floating-right #zoom-readout {
      min-width: 70px;
      color: var(--gold-bright);
      font-size: 17px;
      font-weight: 800;
      background: transparent;
      border: 0;
      box-shadow: none;
    }
    #left-card-jumpbar button[data-v315-icon] { font-size: 16px; }
    #left-panel .card h2 .card-heading-emoji { margin-right: 7px; }

    #base-layer-list.insert-card-grid-v315 {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    #base-layer-list.insert-card-grid-v315 button {
      min-height: 82px;
      display: grid;
      grid-template-rows: 34px auto;
      justify-items: center;
      align-items: center;
      text-align: center;
      padding: 8px 6px;
      white-space: normal;
      line-height: 1.15;
      font-size: 10px;
    }
    .insert-icon-box-v315 {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      border: 1px dashed rgba(0, 174, 234, .46);
      background: rgba(0, 174, 234, .08);
      color: var(--module-accent-strong);
      font-size: 17px;
      box-shadow: inset 0 0 10px rgba(0, 174, 234, .08);
    }
    .insert-label-v315 { overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

    .bottom-panel-grid.v315-display-grid {
      grid-template-columns: minmax(250px, 1.25fr) minmax(210px, .72fr) minmax(240px, .9fr) !important;
      gap: 10px !important;
    }
    .v315-display-grid .bottom-tool-card.v314-hidden-card { display: none !important; }
    .v315-display-grid .bottom-tool-card.v314-combined-display { min-width: 0; max-width: 100%; overflow: hidden; }
    .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(40px, 48px));
      grid-auto-rows: 40px;
      gap: 7px;
      align-items: stretch;
      justify-content: start;
      max-width: 100%;
      overflow: hidden;
    }
    .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons > button,
    .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons > .reference-file-label,
    .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons > span {
      min-width: 0 !important;
      width: 48px !important;
      min-height: 40px !important;
      height: 40px !important;
      padding: 5px !important;
      display: grid;
      place-items: center;
      text-align: center;
      overflow: hidden;
    }
    .v315-display-grid .bottom-tool-card.v314-combined-display #zoom-readout,
    .v315-display-grid .bottom-tool-card.v314-combined-display #pause-button,
    .v315-display-grid .bottom-tool-card.v314-combined-display #snapshot-button,
    .v315-display-grid .bottom-tool-card.v314-combined-display #zoom-out-button,
    .v315-display-grid .bottom-tool-card.v314-combined-display #zoom-in-button,
    .v315-display-grid .bottom-tool-card.v314-combined-display #zoom-reset-button { display: none !important; }
    .v315-display-grid .bottom-tool-card.v314-combined-display .v314-row-2 {
      grid-column: 1 / -1;
      display: grid !important;
      grid-template-columns: repeat(4, minmax(40px, 48px));
      grid-auto-rows: 40px;
      gap: 7px;
      align-items: center;
      max-width: 100%;
    }
    .v315-display-grid .v314-underlay-scale {
      grid-column: span 2;
      width: 103px !important;
      min-width: 103px !important;
      height: 40px !important;
      display: grid !important;
      grid-template-columns: auto 1fr;
      gap: 5px;
      padding: 4px 6px !important;
      overflow: hidden;
    }
    .v315-display-grid .v314-underlay-scale span { font-size: 9px; }
    .v315-display-grid .v314-underlay-scale input { width: 56px; }
    .v315-display-grid #save-archetype-bottom-button { grid-column: auto !important; }
    .v315-display-grid #status-text { position: relative; z-index: 1; }
    @media (max-width: 1180px) {
      .bottom-panel-grid.v315-display-grid { grid-template-columns: 1fr 220px 220px !important; }
      .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons,
      .v315-display-grid .bottom-tool-card.v314-combined-display .v314-row-2 { grid-template-columns: repeat(3, minmax(38px, 46px)); }
    }
  `;
  document.head.append(style);
}

function tidyWorkspaceNote() {
  document.querySelectorAll('.workspace-toolbar-note').forEach((note) => note.remove());
}

function applyCardIcons() {
  const jumpButtons = Array.from(document.querySelectorAll('#left-card-jumpbar button'));
  CARD_ICON_UPDATES.forEach(([emoji, title], index) => {
    const button = jumpButtons[index];
    if (button) {
      button.textContent = emoji;
      button.dataset.v315Icon = emoji;
      button.title = `Jump to ${title}.`;
    }
    const card = findCard(title);
    const h2 = card?.querySelector('h2');
    if (h2) {
      const existing = h2.querySelector('.card-heading-emoji');
      if (existing) existing.textContent = emoji;
      else h2.insertAdjacentHTML('afterbegin', `<span class="card-heading-emoji">${emoji}</span>`);
    }
  });
}

function findCard(title) {
  const normalized = title.toLowerCase();
  return Array.from(document.querySelectorAll('#left-panel .card')).find((card) => {
    const text = String(card.querySelector('h2')?.textContent || '').replace(/[🧩🎨✨🎯🔷💅🚀💥]/gu, '').trim().toLowerCase();
    return text.includes(normalized.toLowerCase());
  });
}

function installFloatingWorkspaceControls() {
  const workspace = document.getElementById('workspace');
  if (!workspace) return;
  let left = document.getElementById('workspace-floating-left-v316');
  let right = document.getElementById('workspace-floating-right-v316');
  if (!left) {
    left = document.createElement('div');
    left.id = 'workspace-floating-left-v316';
    left.className = 'workspace-floating-controls workspace-floating-left';
    workspace.append(left);
  }
  if (!right) {
    right = document.createElement('div');
    right.id = 'workspace-floating-right-v316';
    right.className = 'workspace-floating-controls workspace-floating-right';
    workspace.append(right);
  }

  moveInto(left, 'pause-button');
  moveInto(left, 'snapshot-button');
  moveInto(right, 'zoom-out-button');
  moveInto(right, 'zoom-readout');
  moveInto(right, 'zoom-in-button');
  moveInto(right, 'zoom-reset-button');

  const pause = document.getElementById('pause-button');
  if (pause) pause.title = 'Pause or resume the particle preview.';
  const snapshot = document.getElementById('snapshot-button');
  if (snapshot) snapshot.title = 'Export the current canvas preview as a PNG snapshot.';
  const reset = document.getElementById('zoom-reset-button');
  if (reset) reset.textContent = '🎯';
}

function moveInto(host, id) {
  const element = document.getElementById(id);
  if (element && element.parentElement !== host) host.append(element);
}

function repairDisplayPanel() {
  const grid = document.getElementById('bottom-panel-grid');
  if (grid) grid.classList.add('v315-display-grid');
  const displayCard = Array.from(document.querySelectorAll('.bottom-tool-card')).find((card) => /Display|Playback/i.test(card.querySelector('h2')?.textContent || ''));
  const buttons = displayCard?.querySelector('.bottom-control-buttons');
  if (!displayCard || !buttons) return;
  displayCard.querySelector('h2').textContent = 'Display';

  const rowTwo = document.getElementById('v314-display-row-two');
  if (rowTwo && rowTwo.parentElement !== buttons) buttons.append(rowTwo);

  const firstRow = [
    'undo-bottom-button-v312',
    'redo-bottom-button-v312',
    'helper-cycle-button',
    'clear-particles-button-bottom'
  ];
  firstRow.forEach((id) => {
    const element = document.getElementById(id);
    if (element && element.parentElement !== buttons) buttons.append(element);
  });

  const secondRow = [
    'low-performance-button-playback',
    'save-archetype-bottom-button',
    'workspace-mode-cycle-button',
    'toggle-reference-button'
  ];
  if (rowTwo) {
    secondRow.forEach((id) => {
      const element = document.getElementById(id);
      if (element && element.parentElement !== rowTwo) rowTwo.append(element);
    });
    const underlay = document.querySelector('.reference-file-label');
    if (underlay && underlay.parentElement !== rowTwo) rowTwo.append(underlay);
    const size = document.getElementById('underlay-scale-control-v314');
    if (size && size.parentElement !== rowTwo) rowTwo.append(size);
  }

  const save = document.getElementById('save-archetype-bottom-button');
  if (save) save.textContent = '💾';
  const clear = document.getElementById('clear-particles-button-bottom');
  if (clear) clear.textContent = '🧹';
  const bg = document.getElementById('workspace-mode-cycle-button');
  if (bg) bg.textContent = 'BG';
  const guides = document.getElementById('helper-cycle-button');
  if (guides) guides.textContent = 'Guides';
  const underlayToggle = document.getElementById('toggle-reference-button');
  if (underlayToggle) underlayToggle.textContent = '🖼️';
  const underlayLabel = document.querySelector('.reference-file-label');
  if (underlayLabel) {
    underlayLabel.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = '🖼️';
    });
  }
}

function decorateInsertMenu() {
  const list = document.getElementById('base-layer-list');
  if (!list) return;
  list.classList.add('insert-card-grid-v315');
  Array.from(list.querySelectorAll('button')).forEach((button, index) => {
    if (button.dataset.v315InsertCard === 'true') return;
    const label = button.textContent.trim();
    button.dataset.v315InsertCard = 'true';
    button.innerHTML = `<span class="insert-icon-box-v315">${INSERT_ICONS[index % INSERT_ICONS.length]}</span><span class="insert-label-v315">${escapeHtml(label)}</span>`;
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
