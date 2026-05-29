import { resizeCanvas } from './editor-renderer.js';

const VERSION_LABEL = 'INDEX2-CLEAN-0.1.7-UI';
const LAYOUT_STORAGE_KEY = 'artifex-index2-ui-layout';

window.addEventListener('DOMContentLoaded', initIndex2UIParity);

function initIndex2UIParity() {
  setVersionLabel();
  restoreSavedLayout();
  setupPanelResizers();
  setupCardJumps();
  addControlTooltips();
}

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
  const about = document.getElementById('about-button');
  if (about) about.textContent = `About ${VERSION_LABEL}`;
}

function setupCardJumps() {
  document.querySelectorAll('[data-jump-card]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.jumpCard || '');
      if (!target) return;
      const query = document.getElementById('left-panel-search-input');
      if (target.classList.contains('index2-card-hidden') && query) {
        query.value = '';
        query.dispatchEvent(new Event('input', { bubbles: true }));
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.add('index2-jump-highlight');
      window.setTimeout(() => target.classList.remove('index2-jump-highlight'), 650);
    });
  });
}

function setupPanelResizers() {
  const leftPanel = document.getElementById('left-panel');
  const sideResizer = document.getElementById('side-resizer');
  const bottomPanel = document.getElementById('bottom-panel');
  const bottomResizer = document.getElementById('bottom-resizer');
  if (!leftPanel || !sideResizer || !bottomPanel || !bottomResizer) return;

  setupPointerResize(sideResizer, 'side', (event, start) => {
    const width = clamp(start.size + event.clientX - start.pointer, 245, 560);
    leftPanel.style.width = `${Math.round(width)}px`;
    requestCanvasResize();
  }, () => leftPanel.style.width);

  setupPointerResize(bottomResizer, 'bottom', (event, start) => {
    const height = clamp(start.size - (event.clientY - start.pointer), 105, 420);
    bottomPanel.style.height = `${Math.round(height)}px`;
    requestCanvasResize();
  }, () => bottomPanel.style.height);

  sideResizer.addEventListener('dblclick', () => {
    leftPanel.style.width = '330px';
    persistLayout();
    requestCanvasResize();
  });
  bottomResizer.addEventListener('dblclick', () => {
    bottomPanel.style.height = '170px';
    persistLayout();
    requestCanvasResize();
  });
}

function setupPointerResize(handle, kind, onMove, getSize) {
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const panel = kind === 'side' ? document.getElementById('left-panel') : document.getElementById('bottom-panel');
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const start = {
      pointer: kind === 'side' ? event.clientX : event.clientY,
      size: kind === 'side' ? rect.width : rect.height
    };
    const bodyClass = kind === 'side' ? 'index2-resizing-side' : 'index2-resizing-bottom';
    document.body.classList.add('index2-resizing', bodyClass);
    handle.setPointerCapture(event.pointerId);

    const move = (moveEvent) => onMove(moveEvent, start);
    const finish = () => {
      document.body.classList.remove('index2-resizing', bodyClass);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      persistLayout(kind, getSize());
      requestCanvasResize();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
  });
}

function persistLayout() {
  const leftWidth = document.getElementById('left-panel')?.style.width || '';
  const bottomHeight = document.getElementById('bottom-panel')?.style.height || '';
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ leftWidth, bottomHeight }));
  } catch {
    // Ignore private-browsing storage restrictions.
  }
}

function restoreSavedLayout() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
    const leftPanel = document.getElementById('left-panel');
    const bottomPanel = document.getElementById('bottom-panel');
    if (leftPanel && saved.leftWidth) leftPanel.style.width = saved.leftWidth;
    if (bottomPanel && saved.bottomHeight) bottomPanel.style.height = saved.bottomHeight;
    requestCanvasResize();
  } catch {
    try { window.localStorage.removeItem(LAYOUT_STORAGE_KEY); } catch { /* no-op */ }
  }
}

let resizeFrame = 0;
function requestCanvasResize() {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => resizeCanvas());
}

function addControlTooltips() {
  const tips = {
    'pause-button': 'Pause or resume the preview.',
    'snapshot-button': 'Export a PNG snapshot.',
    'zoom-out-button': 'Zoom out.',
    'zoom-in-button': 'Zoom in.',
    'zoom-reset-button': 'Reset zoom.'
  };
  Object.entries(tips).forEach(([id, title]) => {
    const element = document.getElementById(id);
    if (element) element.title = title;
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
