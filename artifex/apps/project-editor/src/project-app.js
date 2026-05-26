import { PROJECT_THEME, applyProjectTheme, getProjectThemeTailwindConfig } from './project-theme.js';
import { createDefaultProjectState } from './data/project-defaults.js';
import { listCatalogItems } from './data/flatplan-catalog.js';
import { getTypeStyle } from './data/type-styles.js';

// Project Editor app bootstrap.
//
// Step 2 split note:
// The new split shell now imports default data, Flatplan Catalog seed data,
// and type styles from real modules. This is still intentionally small: state,
// canvas interactions, renderer, Stitcher, Build Prep, and IO will be promoted
// into dedicated modules in later steps.

applyProjectTheme();

const projectEditorState = createDefaultProjectState();
projectEditorState.catalog = {
  placeholders: listCatalogItems('placeholders'),
  realAssets: listCatalogItems('realAssets')
};

window.ArtifexProjectTheme = PROJECT_THEME;
window.applyProjectTheme = applyProjectTheme;
window.getProjectThemeTailwindConfig = getProjectThemeTailwindConfig;
window.ArtifexProjectEditorState = projectEditorState;

const versionTargets = [
  '#projectEditorVersionBadge',
  '[data-project-version-badge]'
];

for (const selector of versionTargets) {
  const el = document.querySelector(selector);
  if (el) el.textContent = 'v0.1.2 SPLIT-DATA';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderCatalog() {
  const sidebar = document.getElementById('sidebarAccordion');
  if (!sidebar) return;

  const placeholders = projectEditorState.catalog.placeholders;
  const realAssets = projectEditorState.catalog.realAssets;

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
}

function renderGraphPreview() {
  const nodesContainer = document.getElementById('nodesContainer');
  const svgLayer = document.getElementById('svgEdgeLayer');
  if (!nodesContainer || !svgLayer) return;

  nodesContainer.innerHTML = '';
  svgLayer.innerHTML = '';

  const nodeSize = { width: 200, height: 80 };
  const layoutNodes = projectEditorState.layout.nodes;
  const logicNodes = projectEditorState.logic.nodes;

  for (const route of projectEditorState.logic.routes) {
    const sourceLayout = layoutNodes.find((node) => node.id === route.source);
    const targetLayout = layoutNodes.find((node) => node.id === route.target);
    const routeLayout = projectEditorState.layout.routes.find((item) => item.id === route.id);
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
    if (routeLayout?.visual?.animated) path.setAttribute('class', 'edge-path');
    svgLayer.appendChild(path);
  }

  for (const layoutNode of layoutNodes) {
    const logicNode = logicNodes.find((node) => node.id === layoutNode.id);
    if (!logicNode) continue;
    const style = getTypeStyle(logicNode.type);
    const nodeEl = document.createElement('div');
    nodeEl.className = 'absolute w-[200px] h-[80px] rounded-lg border-2 border-projectGold/40 bg-cardDark/90 backdrop-blur-sm pointer-events-auto transition-shadow duration-300 flex flex-col p-2 select-none shadow-card-glow';
    nodeEl.style.transform = `translate(${layoutNode.position.x}px, ${layoutNode.position.y}px)`;
    nodeEl.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <span class="text-[9px] px-1.5 py-0.5 rounded border ${style.badge} font-mono tracking-wider truncate max-w-[130px]">${escapeHtml(logicNode.type)}</span>
        <i data-lucide="${escapeHtml(style.icon)}" class="w-3.5 h-3.5 ${escapeHtml(style.color)}"></i>
      </div>
      <div class="flex-1 flex flex-col justify-center">
        <span class="text-xs font-bold tracking-wide text-zinc-200 truncate">${escapeHtml(logicNode.properties.name)}</span>
        <span class="text-[8px] text-zinc-500 truncate block">${escapeHtml(logicNode.properties.description)}</span>
      </div>
    `;
    nodesContainer.appendChild(nodeEl);
  }
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
      <span class="text-xs font-bold text-projectGoldGlow">Split Data Preview</span>
      <span class="text-[9px] font-mono text-zinc-500">logic/layout seed</span>
    </div>
    <pre class="p-3 text-[9px] leading-relaxed text-emerald-300 overflow-auto max-h-[220px]">${escapeHtml(JSON.stringify({ logic: projectEditorState.logic, layout: projectEditorState.layout }, null, 2))}</pre>
  `;
  canvas.appendChild(panel);
}

function initProjectEditorSplitShell() {
  renderCatalog();
  renderGraphPreview();
  renderJsonPreview();
  if (window.lucide) window.lucide.createIcons();
  console.info('[Artifex Project Editor] Split data modules loaded:', {
    nodes: projectEditorState.logic.nodes.length,
    routes: projectEditorState.logic.routes.length,
    catalog: projectEditorState.catalog.placeholders.length + projectEditorState.catalog.realAssets.length
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectEditorSplitShell, { once: true });
} else {
  initProjectEditorSplitShell();
}
