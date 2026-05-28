// Maze / Labyrinth preview default layout
//
// Stable UI behaviour module for default workspace positioning:
// - Overview opens on the right side of the screen by default.
// - Maze preview is panned left by default so the Overview does not cover the working map.
// - Browser context menu is suppressed on maze canvases so right/middle drag remains usable.
// User drag/pan still wins after the user manually moves either surface.

const $ = (id) => document.getElementById(id);

const layoutState = {
  syntheticPan: false,
  userPannedPreview: false,
  userMovedOverview: false,
  lastAppliedSignature: ''
};

window.addEventListener('DOMContentLoaded', () => {
  injectDefaultLayoutStyles();
  suppressWorkspaceContextMenu();
  markUserOverrides();
  placeOverviewDefault();
  bindDefaultPreviewTriggers();
  schedulePreviewLeftAlign(360);
  schedulePreviewLeftAlign(800);
});

function injectDefaultLayoutStyles() {
  if ($('maze-preview-default-layout-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-preview-default-layout-style';
  style.textContent = `
    #overview-window:not([data-user-positioned="true"]){
      left:auto!important;
      right:18px!important;
      top:118px!important;
      width:min(360px,calc(100vw - var(--left-w,460px) - 88px));
      min-width:300px;
      max-width:420px;
      max-height:calc(100vh - 140px);
    }
    #threejs-container canvas,
    #analysis-canvas,
    .render-viewport{
      -webkit-user-select:none;
      user-select:none;
      -webkit-touch-callout:none;
    }
    .render-viewport.is-pan-dragging{cursor:grabbing;}
    @media(max-width:980px){
      #overview-window:not([data-user-positioned="true"]){
        right:12px!important;
        top:112px!important;
        width:min(330px,calc(100vw - 24px));
        min-width:260px;
      }
    }
  `;
  document.head.appendChild(style);
}

function suppressWorkspaceContextMenu() {
  const shouldSuppress = (target) => !!target?.closest?.('.render-viewport, #threejs-container, #maze-preview-canvas, #analysis-canvas, #overview-window');

  window.addEventListener('contextmenu', (event) => {
    if (!shouldSuppress(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  window.addEventListener('mousedown', (event) => {
    if (!shouldSuppress(event.target)) return;
    if (event.button === 1 || event.button === 2) {
      event.preventDefault();
      document.querySelector('.render-viewport')?.classList.add('is-pan-dragging');
    }
  }, true);

  window.addEventListener('mouseup', () => {
    document.querySelector('.render-viewport')?.classList.remove('is-pan-dragging');
  }, true);
}

function markUserOverrides() {
  const overviewTitlebar = $('overview-titlebar');
  overviewTitlebar?.addEventListener('mousedown', () => {
    if (!layoutState.userMovedOverview) {
      layoutState.userMovedOverview = true;
      $('overview-window')?.setAttribute('data-user-positioned', 'true');
    }
  }, true);

  const preview = document.querySelector('.render-viewport') || $('threejs-container');
  preview?.addEventListener('mousedown', (event) => {
    if (layoutState.syntheticPan) return;
    if (event.button === 1 || event.button === 2) layoutState.userPannedPreview = true;
  }, true);
}

function placeOverviewDefault() {
  const overview = $('overview-window');
  if (!overview || layoutState.userMovedOverview) return;
  overview.classList.remove('is-hidden');
  overview.removeAttribute('data-user-positioned');
  overview.style.left = 'auto';
  overview.style.right = '18px';
  overview.style.top = '118px';
}

function bindDefaultPreviewTriggers() {
  ['btn-random', 'btn-start-blank', 'btn-clear-all', 'btn-load-reference', 'btn-zoom-reset'].forEach((id) => {
    $(id)?.addEventListener('click', () => schedulePreviewLeftAlign(220), false);
  });

  ['grid-slider', 'layout-style-slider', 'stretch-x-slider', 'stretch-y-slider', 'warp-slider', 'gap-slider'].forEach((id) => {
    $(id)?.addEventListener('change', () => schedulePreviewLeftAlign(280), false);
  });

  window.addEventListener('resize', () => {
    placeOverviewDefault();
    schedulePreviewLeftAlign(180);
  });
}

function schedulePreviewLeftAlign(delay = 120) {
  window.setTimeout(() => applyPreviewLeftAlign(), delay);
}

function applyPreviewLeftAlign() {
  if (layoutState.userPannedPreview) return;
  const runtime = window.__artifexMazeRuntime;
  const state = runtime?.state;
  const viewport = document.querySelector('.render-viewport') || $('threejs-container');
  const fitButton = $('btn-zoom-reset');
  if (!state?.matrix?.length || !viewport || !fitButton) return;

  const rect = viewport.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const shift = calculateLeftAlignShift(state, rect.width, rect.height);
  const signature = `${Math.round(rect.width)}:${Math.round(rect.height)}:${state.gridSize}:${state.layout}:${state.stretchX}:${state.stretchY}:${state.zoom || 1}:${Math.round(shift)}`;
  if (layoutState.lastAppliedSignature === signature) return;
  layoutState.lastAppliedSignature = signature;

  // Reset the internal runtime pan first, then apply the calculated default pan.
  fitButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  window.setTimeout(() => panPreviewBy(shift, 0), 70);
}

function calculateLeftAlignShift(state, width, height) {
  const scaleX = Math.max(0.6, Number(state.stretchX || 100) / 100);
  const scaleY = Math.max(0.6, Number(state.stretchY || 100) / 100);
  const zoom = Number(state.zoom || 1);
  const base = Math.min(width / (state.gridSize * scaleX + 3), height / (state.gridSize * scaleY + 3)) * zoom;
  const cellW = base * scaleX;
  const mazeW = state.gridSize * cellW;
  const centeredOx = width / 2 - mazeW / 2;
  const leftPad = Math.max(26, Math.min(44, width * 0.035));
  return leftPad - centeredOx;
}

function panPreviewBy(dx, dy) {
  const target = document.querySelector('.render-viewport') || $('threejs-container');
  if (!target || !Number.isFinite(dx) || Math.abs(dx) < 1) return;
  const rect = target.getBoundingClientRect();
  const startX = rect.left + Math.min(120, rect.width / 3);
  const startY = rect.top + Math.min(120, rect.height / 3);

  layoutState.syntheticPan = true;
  target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 1, clientX: startX, clientY: startY }));
  window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, button: 1, clientX: startX + dx, clientY: startY + dy }));
  window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 1, clientX: startX + dx, clientY: startY + dy }));
  layoutState.syntheticPan = false;
}
