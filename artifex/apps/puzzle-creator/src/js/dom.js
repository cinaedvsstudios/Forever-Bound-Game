export const dom = {
  dropzone: document.getElementById('dropzone'),
  imageUpload: document.getElementById('image-upload'),
  jsonImport: document.getElementById('json-import'),
  sourceImageLoader: document.getElementById('source-image-loader'),
  analysisCanvas: document.getElementById('analysis-canvas'),
  threeContainer: document.getElementById('threejs-container'),
  analysisState: document.getElementById('analysis-state'),
  matrixSummary: document.getElementById('matrix-summary'),
  moduleId: document.getElementById('module-id'),
  puzzleType: document.getElementById('puzzle-type'),
  gameplayMode: document.getElementById('gameplay-mode'),
  completionFlag: document.getElementById('completion-flag'),
  callingText: document.getElementById('calling-text'),
  gridSlider: document.getElementById('grid-slider'),
  gridVal: document.getElementById('grid-val'),
  thresholdSlider: document.getElementById('threshold-slider'),
  thresholdVal: document.getElementById('threshold-val'),
  invertCheckbox: document.getElementById('invert-checkbox'),
  wallHeightSlider: document.getElementById('wall-height-slider'),
  wallHeightVal: document.getElementById('wall-height-val'),
  gapSlider: document.getElementById('gap-slider'),
  gapVal: document.getElementById('gap-val'),
  layoutStyleSlider: document.getElementById('layout-style-slider'),
  layoutStyleVal: document.getElementById('layout-style-val'),
  edgeStyleSlider: document.getElementById('edge-style-slider'),
  edgeStyleVal: document.getElementById('edge-style-val'),
  wallColorPicker: document.getElementById('wall-color-picker'),
  brushColorPicker: document.getElementById('brush-color-picker'),
  floorStyle: document.getElementById('floor-style'),
  playerStatusIndicator: document.getElementById('player-status-indicator'),
  virtualDpad: document.getElementById('virtual-dpad'),
  btnLoadReference: document.getElementById('btn-load-reference'),
  btnRandom: document.getElementById('btn-random'),
  btnReparse: document.getElementById('btn-reparse'),
  btnSolve: document.getElementById('btn-solve'),
  btnExportJson: document.getElementById('btn-export-json'),
  btnCopyJson: document.getElementById('btn-copy-json'),
  btnClearPaint: document.getElementById('btn-clear-paint'),
  btnZoomIn: document.getElementById('btn-zoom-in'),
  btnZoomOut: document.getElementById('btn-zoom-out'),
  btnZoomReset: document.getElementById('btn-zoom-reset'),
  viewModeDiorama: document.getElementById('view-mode-diorama'),
  viewModeFps: document.getElementById('view-mode-fps'),
  materialButtons: document.querySelectorAll('.material-preset'),
  toolButtons: document.querySelectorAll('.tool-button'),
  swatchRow: document.getElementById('swatch-row'),
  panelNavButtons: document.querySelectorAll('.panel-nav-button'),
  toolPanels: document.querySelectorAll('.tool-panel')
};

export function setStatus(text, type = 'waiting') {
  dom.analysisState.textContent = text;
  dom.analysisState.classList.remove('is-waiting', 'is-good', 'is-warn');
  dom.analysisState.classList.add(type === 'good' ? 'is-good' : type === 'warn' ? 'is-warn' : 'is-waiting');
}

export function showToast(message, type = 'good') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'danger' ? 'is-danger' : 'is-good'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(8px)';
    window.setTimeout(() => toast.remove(), 220);
  }, 2800);
}
