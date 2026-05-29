import { UI_STORAGE_KEYS, escapeHtml, getById, readJSONPreference, writeJSONPreference } from './project-ui-helpers.js?v=0.1.31-tasks';

// Artifex Project Manager inspector UI
// Owns the selected node/route inspector, draggable inspector behaviour, and position persistence.

export function createProjectInspectorUI({
  canvasElement,
  stateManager,
  renderer,
  renderJsonPreview,
  onRefresh
}) {
  let inspectorPosition = readJSONPreference(UI_STORAGE_KEYS.inspectorPosition, { top: 16, right: 16 });

  function getCanvas() {
    return canvasElement || getById('flatplanCanvas');
  }

  function getInspectorStatusFooter() {
    return `
      <div class="border-t border-[#2d2d42] px-3 py-2 bg-black/25 text-[10px] text-zinc-500 leading-relaxed rounded-b-lg">
        <div class="flex items-center gap-1.5 text-projectGoldGlow font-bold mb-1">
          <i data-lucide="info" class="w-3 h-3"></i>
          <span>Canvas controls</span>
        </div>
        <div>Drag nodes with left mouse. Scrollwheel-click / middle-button drag pans. Mousewheel zooms.</div>
      </div>
    `;
  }

  function applyInspectorPosition(panel) {
    const top = Number(inspectorPosition?.top);
    const right = Number(inspectorPosition?.right);
    panel.style.top = `${Number.isFinite(top) ? Math.max(8, top) : 16}px`;
    panel.style.right = `${Number.isFinite(right) ? Math.max(8, right) : 16}px`;
    panel.style.left = 'auto';
  }

  function makeInspectorDraggable(panel) {
    const canvas = getCanvas();
    const handle = panel.querySelector('[data-inspector-drag-handle]');
    const resetButton = panel.querySelector('[data-inspector-reset-position]');
    if (!canvas || !handle) return;

    resetButton?.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });

    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target?.closest?.('[data-inspector-reset-position]')) return;
      event.preventDefault();
      event.stopPropagation();
      const canvasRect = canvas.getBoundingClientRect();
      const startRect = panel.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = startRect.left - canvasRect.left;
      const startTop = startRect.top - canvasRect.top;
      const panelWidth = startRect.width;
      const panelHeight = startRect.height;

      handle.setPointerCapture?.(event.pointerId);
      panel.classList.add('ring-1', 'ring-projectGold/50');

      const onMove = (moveEvent) => {
        const nextLeft = Math.max(8, Math.min(canvasRect.width - panelWidth - 8, startLeft + moveEvent.clientX - startX));
        const nextTop = Math.max(8, Math.min(canvasRect.height - panelHeight - 8, startTop + moveEvent.clientY - startY));
        const nextRight = Math.max(8, canvasRect.width - nextLeft - panelWidth);
        panel.style.left = 'auto';
        panel.style.right = `${nextRight}px`;
        panel.style.top = `${nextTop}px`;
        inspectorPosition = { top: Math.round(nextTop), right: Math.round(nextRight) };
      };

      const onUp = () => {
        panel.classList.remove('ring-1', 'ring-projectGold/50');
        writeJSONPreference(UI_STORAGE_KEYS.inspectorPosition, inspectorPosition);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    });

    resetButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      inspectorPosition = { top: 16, right: 16 };
      writeJSONPreference(UI_STORAGE_KEYS.inspectorPosition, inspectorPosition);
      applyInspectorPosition(panel);
    });
  }

  function finishInspectorPanel(panel) {
    const canvas = getCanvas();
    if (!canvas) return;
    canvas.appendChild(panel);
    applyInspectorPosition(panel);
    makeInspectorDraggable(panel);
    if (window.lucide) window.lucide.createIcons();
  }

  function renderInspectorPreview() {
    const existing = getById('splitInspectorPreview');
    if (existing) existing.remove();
    const canvas = getCanvas();
    if (!canvas) return;

    const selectedNode = stateManager.selectedNodeId ? stateManager.getNode(stateManager.selectedNodeId) : null;
    const selectedRoute = stateManager.selectedEdgeId ? stateManager.getRoute(stateManager.selectedEdgeId) : null;

    const panel = document.createElement('div');
    panel.id = 'splitInspectorPreview';
    panel.className = 'absolute z-30 w-[300px] bg-cardDark/85 backdrop-blur-md border border-projectGold/30 rounded-lg shadow-card-glow';

    if (selectedNode) {
      panel.innerHTML = `
        <div data-inspector-drag-handle class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow flex items-center justify-between cursor-move select-none">
          <span>Selected Node</span>
          <button data-inspector-reset-position class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow cursor-pointer">reset pos</button>
        </div>
        <div class="p-3 space-y-2">
          <div class="text-[10px] font-mono text-zinc-500">${escapeHtml(selectedNode.id)} · ${escapeHtml(selectedNode.type)}</div>
          <label class="block text-[10px] font-mono text-zinc-500">NAME</label>
          <input id="splitNodeNameInput" value="${escapeHtml(selectedNode.properties.name)}" class="w-full bg-black/40 border border-[#2d2d42] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">
          <label class="block text-[10px] font-mono text-zinc-500">DESCRIPTION</label>
          <textarea id="splitNodeDescInput" rows="3" class="w-full bg-black/40 border border-[#2d2d42] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">${escapeHtml(selectedNode.properties.description)}</textarea>
          <button id="deleteSplitNodeBtn" class="w-full bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 text-red-200 px-3 py-1.5 rounded text-xs transition">Delete Node</button>
        </div>
        ${getInspectorStatusFooter()}
      `;
      finishInspectorPanel(panel);
      panel.querySelector('#splitNodeNameInput')?.addEventListener('input', (event) => {
        stateManager.updateNode(selectedNode.id, { properties: { name: event.target.value } });
        renderer?.renderGraph();
        renderJsonPreview?.();
        if (window.lucide) window.lucide.createIcons();
      });
      panel.querySelector('#splitNodeDescInput')?.addEventListener('input', (event) => {
        stateManager.updateNode(selectedNode.id, { properties: { description: event.target.value } });
        renderer?.renderGraph();
        renderJsonPreview?.();
        if (window.lucide) window.lucide.createIcons();
      });
      panel.querySelector('#deleteSplitNodeBtn')?.addEventListener('click', () => {
        stateManager.deleteNode(selectedNode.id);
        onRefresh?.();
      });
      return;
    }

    if (selectedRoute) {
      panel.innerHTML = `
        <div data-inspector-drag-handle class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow flex items-center justify-between cursor-move select-none">
          <span>Selected Route</span>
          <button data-inspector-reset-position class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow cursor-pointer">reset pos</button>
        </div>
        <div class="p-3 space-y-2 text-xs text-zinc-400">
          <div class="text-[10px] font-mono text-zinc-500">${escapeHtml(selectedRoute.id)}</div>
          <div>${escapeHtml(selectedRoute.source)} → ${escapeHtml(selectedRoute.target)}</div>
          <div>Type: ${escapeHtml(selectedRoute.type)}</div>
        </div>
        ${getInspectorStatusFooter()}
      `;
      finishInspectorPanel(panel);
      return;
    }

    panel.innerHTML = `
      <div data-inspector-drag-handle class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow flex items-center justify-between cursor-move select-none">
        <span>Inspector</span>
        <button data-inspector-reset-position class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow cursor-pointer">reset pos</button>
      </div>
      <div class="p-3 text-xs text-zinc-500 leading-relaxed">Click a node or route to edit it here. Drag this inspector from its header.</div>
      ${getInspectorStatusFooter()}
    `;
    finishInspectorPanel(panel);
  }

  return {
    renderInspectorPreview
  };
}
