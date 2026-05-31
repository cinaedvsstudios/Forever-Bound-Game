import { PROJECT_THEME, applyProjectTheme, getProjectThemeTailwindConfig } from './project-theme.js';
import { createProjectEditorStateManager } from './project-state.js';
import { createProjectCanvasController } from './project-canvas.js';
import { createProjectRenderer } from './project-renderer.js';
import { getTypeStyle } from './data/type-styles.js';

// Project Editor app bootstrap.
//
// Step 6 split note:
// The Flatplan renderer has been extracted to project-renderer.js. This app
// file still owns temporary catalog, inspector, and JSON preview orchestration.

applyProjectTheme();

const appState = createProjectEditorStateManager();
let canvasController = null;
let projectRenderer = null;

window.ArtifexProjectTheme = PROJECT_THEME;
window.applyProjectTheme = applyProjectTheme;
window.getProjectThemeTailwindConfig = getProjectThemeTailwindConfig;
window.ArtifexProjectEditorState = appState.state;
window.ProjectEditorStateManager = appState;

const versionTargets = [
  '#projectEditorVersionBadge',
  '[data-project-version-badge]'
];

for (const selector of versionTargets) {
  const el = document.querySelector(selector);
  if (el) el.textContent = 'v0.1.6 SPLIT-RENDERER';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function refreshSplitShell() {
  renderCatalog();
  renderGraphPreview();
  renderJsonPreview();
  renderInspectorPreview();
  wireTopCanvasControls();
  if (window.lucide) window.lucide.createIcons();
}

function redrawGraphOnly() {
  if (projectRenderer) {
    projectRenderer.drawRoutes();
  } else {
    drawRoutes();
  }
  renderJsonPreview();
  renderInspectorPreview();
  if (window.lucide) window.lucide.createIcons();
}

function renderCatalog() {
  const sidebar = document.getElementById('sidebarAccordion');
  if (!sidebar) return;

  const placeholders = appState.catalog.placeholders;
  const realAssets = appState.catalog.realAssets;

  const placeholderCards = placeholders.map((item) => {
    const style = getTypeStyle(item.type);
    return `
      <button class="bg-black/25 hover:bg-accentDark/40 border border-projectGold/20 hover:border-projectGold/60 p-2 rounded text-left transition" data-catalog-type="${escapeHtml(item.type)}">
        <i data-lucide="${escapeHtml(style.icon || item.icon || 'box')}" class="w-4 h-4 mb-1 ${escapeHtml(style.color)}"></i>
        <span class="text-[11px] font-semibold text-zinc-200 block truncate">${escapeHtml(item.label)}</span>
      </button>
    `;
  }).join('');

  const realAssetCards = realAssets.map((item) => `
    <div class="flex items-center space-x-3 bg-black/25 hover:bg-black/50 border border-zinc-800 hover:border-projectGold/50 p-2 rounded transition">
      <div class="w-10 h-10 bg-accentDark/40 rounded flex items-center justify-center border border-projectGold/20">
        <i data-lucide="${escapeHtml(item.icon || 'image')}" class="w-5 h-5 text-projectGoldGlow"></i>
      </div>
      <div class="flex-1 min-w-0">
        <span class="text-xs font-semibold text-zinc-200 block truncate">${escapeHtml(item.name)}</span>
        <span class="text-[9px] text-zinc-500 block truncate">${escapeHtml(item.file)}</span>
      </div>
    </div>
  `).join('');

  sidebar.innerHTML = `
    <div class="border border-[#2d2d42] rounded-lg overflow-hidden bg-cardDark">
      <button class="w-full flex items-center justify-between p-3 bg-black/25 font-semibold text-sm hover:bg-black/40 transition text-zinc-200">
        <div class="flex items-center space-x-2">
          <i data-lucide="library" class="w-4 h-4 text-projectGoldGlow"></i>
          <span>Flatplan Catalog</span>
        </div>
      </button>
      <div class="p-3 border-t border-[#1d1d2b] space-y-3">
        <div>
          <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Placeholders</div>
          <div class="grid grid-cols-2 gap-2">${placeholderCards}</div>
        </div>
        <div>
          <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Real Assets</div>
          <div class="space-y-2">${realAssetCards}</div>
        </div>
      </div>
    </div>
  `;

  sidebar.querySelectorAll('[data-catalog-type]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.catalogType || 'Station';
      const camera = appState.camera;
      appState.addNode({
        type,
        position: {
          x: Math.round((180 - camera.panX) / camera.zoom + appState.logic.nodes.length * 24),
          y: Math.round((160 - camera.panY) / camera.zoom + appState.logic.nodes.length * 18)
        }
      });
      refreshSplitShell();
    });
  });
}

function drawRoutes() {
  const svgLayer = document.getElementById('svgEdgeLayer');
  if (!svgLayer) return;

  svgLayer.innerHTML = '';
  const nodeSize = { width: 200, height: 80 };
  const layoutNodes = appState.layout.nodes;

  for (const route of appState.logic.routes) {
    const sourceLayout = layoutNodes.find((node) => node.id === route.source);
    const targetLayout = layoutNodes.find((node) => node.id === route.target);
    const routeLayout = appState.layout.routes.find((item) => item.id === route.id);
    if (!sourceLayout || !targetLayout) continue;

    const sx = sourceLayout.position.x + nodeSize.width / 2;
    const sy = sourceLayout.position.y + nodeSize.height / 2;
    const tx = targetLayout.position.x + nodeSize.width / 2;
    const ty = targetLayout.position.y + nodeSize.height / 2;
    const controlOffset = Math.abs(tx - sx) * 0.5;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${sx} ${sy} C ${sx + controlOffset} ${sy}, ${tx - controlOffset} ${ty}, ${tx} ${ty}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', routeLayout?.visual?.lineColor || PROJECT_THEME.accent.primary);
    path.setAttribute('stroke-width', route.type === 'Quest' ? '5' : '3');
    path.setAttribute('opacity', '0.9');
    path.style.pointerEvents = 'auto';
    path.style.cursor = 'pointer';
    if (routeLayout?.visual?.animated) path.setAttribute('class', 'edge-path');
    path.addEventListener('click', () => {
      appState.selectRoute(route.id);
      refreshSplitShell();
    });
    svgLayer.appendChild(path);
  }
}

function renderGraphPreview() {
  if (projectRenderer) {
    projectRenderer.renderGraph();
    return;
  }
}

function wireTopCanvasControls() {
  document.getElementById('zoomInBtn')?.addEventListener('click', () => {
    canvasController?.zoomByFactor(1.12);
    renderJsonPreview();
  });
  document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
    canvasController?.zoomByFactor(0.88);
    renderJsonPreview();
  });
  document.getElementById('resetViewportBtn')?.addEventListener('click', () => {
    canvasController?.resetViewport();
    renderJsonPreview();
  });
}

function renderJsonPreview() {
  const existing = document.getElementById('splitDataPreview');
  if (existing) existing.remove();

  const canvas = document.getElementById('flatplanCanvas');
  if (!canvas) return;

  const panel = document.createElement('div');
  panel.id = 'splitDataPreview';
  panel.className = 'absolute bottom-4 right-4 z-30 w-[360px] max-h-[280px] overflow-hidden bg-cardDark/85 backdrop-blur-md border border-projectGold/30 rounded-lg shadow-card-glow';
  panel.innerHTML = `
    <div class="flex items-center justify-between px-3 py-2 border-b border-[#2d2d42]">
      <span class="text-xs font-bold text-projectGoldGlow">Split State Preview</span>
      <button id="resetSplitStateBtn" class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow transition">reset</button>
    </div>
    <pre class="p-3 text-[9px] leading-relaxed text-emerald-300 overflow-auto max-h-[220px]">${escapeHtml(JSON.stringify(appState.exportSnapshot(), null, 2))}</pre>
  `;
  canvas.appendChild(panel);

  panel.querySelector('#resetSplitStateBtn')?.addEventListener('click', () => {
    appState.resetToDefaults();
    refreshSplitShell();
  });
}

function renderInspectorPreview() {
  const existing = document.getElementById('splitInspectorPreview');
  if (existing) existing.remove();

  const canvas = document.getElementById('flatplanCanvas');
  if (!canvas) return;

  const selectedNode = appState.selectedNodeId ? appState.getNode(appState.selectedNodeId) : null;
  const selectedRoute = appState.selectedEdgeId ? appState.getRoute(appState.selectedEdgeId) : null;

  const panel = document.createElement('div');
  panel.id = 'splitInspectorPreview';
  panel.className = 'absolute top-4 right-4 z-30 w-[300px] bg-cardDark/85 backdrop-blur-md border border-projectGold/30 rounded-lg shadow-card-glow';

  if (selectedNode) {
    panel.innerHTML = `
      <div class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow">Selected Node</div>
      <div class="p-3 space-y-2">
        <div class="text-[10px] font-mono text-zinc-500">${escapeHtml(selectedNode.id)} · ${escapeHtml(selectedNode.type)}</div>
        <label class="block text-[10px] font-mono text-zinc-500">NAME</label>
        <input id="splitNodeNameInput" value="${escapeHtml(selectedNode.properties.name)}" class="w-full bg-black/40 border border-[#2d2d42] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">
        <label class="block text-[10px] font-mono text-zinc-500">DESCRIPTION</label>
        <textarea id="splitNodeDescInput" rows="3" class="w-full bg-black/40 border border-[#2d2d42] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">${escapeHtml(selectedNode.properties.description)}</textarea>
        <button id="deleteSplitNodeBtn" class="w-full bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 text-red-200 px-3 py-1.5 rounded text-xs transition">Delete Node</button>
      </div>
    `;
    canvas.appendChild(panel);
    panel.querySelector('#splitNodeNameInput')?.addEventListener('input', (event) => {
      appState.updateNode(selectedNode.id, { properties: { name: event.target.value } });
      projectRenderer?.renderGraph();
      renderJsonPreview();
      if (window.lucide) window.lucide.createIcons();
    });
    panel.querySelector('#splitNodeDescInput')?.addEventListener('input', (event) => {
      appState.updateNode(selectedNode.id, { properties: { description: event.target.value } });
      projectRenderer?.renderGraph();
      renderJsonPreview();
      if (window.lucide) window.lucide.createIcons();
    });
    panel.querySelector('#deleteSplitNodeBtn')?.addEventListener('click', () => {
      appState.deleteNode(selectedNode.id);
      refreshSplitShell();
    });
    return;
  }

  if (selectedRoute) {
    panel.innerHTML = `
      <div class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow">Selected Route</div>
      <div class="p-3 space-y-2 text-xs text-zinc-400">
        <div class="text-[10px] font-mono text-zinc-500">${escapeHtml(selectedRoute.id)}</div>
        <div>${escapeHtml(selectedRoute.source)} → ${escapeHtml(selectedRoute.target)}</div>
        <div>Type: ${escapeHtml(selectedRoute.type)}</div>
      </div>
    `;
    canvas.appendChild(panel);
    return;
  }

  panel.innerHTML = `
    <div class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow">Inspector</div>
    <div class="p-3 text-xs text-zinc-500 leading-relaxed">Click or drag a node. Scrollwheel-click / third mouse button drag pans the canvas. Mousewheel zooms. Click a catalog placeholder to create a new node.</div>
  `;
  canvas.appendChild(panel);
}

function initProjectEditorSplitShell() {
  const canvas = document.getElementById('flatplanCanvas');
  const viewport = document.getElementById('canvasViewport');
  const nodesContainer = document.getElementById('nodesContainer');
  const svgLayer = document.getElementById('svgEdgeLayer');

  canvasController = createProjectCanvasController({
    stateManager: appState,
    canvasElement: canvas,
    viewportElement: viewport,
    onNodeMoved: () => redrawGraphOnly(),
    onNodeSelected: () => renderInspectorPreview(),
    onInteractionEnd: () => redrawGraphOnly(),
    onCameraChanged: () => renderJsonPreview()
  });

  projectRenderer = createProjectRenderer({
    stateManager: appState,
    theme: PROJECT_THEME,
    getTypeStyle,
    canvasController,
    nodesContainer,
    svgLayer,
    onSelectionChanged: () => refreshSplitShell(),
    onNodeMoved: () => redrawGraphOnly(),
    onInteractionEnd: () => redrawGraphOnly()
  });

  refreshSplitShell();
  console.info('[Artifex Project Editor] Split renderer loaded:', {
    nodes: appState.logic.nodes.length,
    routes: appState.logic.routes.length,
    catalog: appState.catalog.placeholders.length + appState.catalog.realAssets.length
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectEditorSplitShell, { once: true });
} else {
  initProjectEditorSplitShell();
}
