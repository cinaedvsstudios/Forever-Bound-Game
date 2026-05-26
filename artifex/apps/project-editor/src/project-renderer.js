// Artifex Project Editor renderer
// Step 6 of the Project Editor real split.
//
// This module owns Flatplan node DOM rendering and route SVG rendering.
// It does not own state, camera interaction, import/export, Stitcher, or Build Prep.

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function createProjectRenderer({
  stateManager,
  theme,
  getTypeStyle,
  canvasController,
  nodesContainer,
  svgLayer,
  onSelectionChanged,
  onNodeMoved,
  onInteractionEnd
}) {
  if (!stateManager) throw new Error('createProjectRenderer requires a stateManager.');
  if (!nodesContainer) throw new Error('createProjectRenderer requires nodesContainer.');
  if (!svgLayer) throw new Error('createProjectRenderer requires svgLayer.');

  const nodeSize = Object.freeze({ width: 200, height: 80 });

  function drawRoutes() {
    svgLayer.innerHTML = '';
    const layoutNodes = stateManager.layout.nodes;

    for (const route of stateManager.logic.routes) {
      const sourceLayout = layoutNodes.find((node) => node.id === route.source);
      const targetLayout = layoutNodes.find((node) => node.id === route.target);
      const routeLayout = stateManager.layout.routes.find((item) => item.id === route.id);
      if (!sourceLayout || !targetLayout) continue;

      const sx = sourceLayout.position.x + nodeSize.width / 2;
      const sy = sourceLayout.position.y + nodeSize.height / 2;
      const tx = targetLayout.position.x + nodeSize.width / 2;
      const ty = targetLayout.position.y + nodeSize.height / 2;
      const controlOffset = Math.abs(tx - sx) * 0.5;
      const pathValue = `M ${sx} ${sy} C ${sx + controlOffset} ${sy}, ${tx - controlOffset} ${ty}, ${tx} ${ty}`;
      const isSelected = stateManager.selectedEdgeId === route.id;
      const routeColor = routeLayout?.visual?.lineColor || theme.accent.primary;

      if (route.type === 'Quest') {
        const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glow.setAttribute('d', pathValue);
        glow.setAttribute('fill', 'none');
        glow.setAttribute('stroke', routeColor);
        glow.setAttribute('stroke-width', '12');
        glow.setAttribute('opacity', isSelected ? '0.35' : '0.2');
        glow.setAttribute('class', 'blur-md');
        svgLayer.appendChild(glow);
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathValue);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', isSelected ? theme.accent.primarySoft : routeColor);
      path.setAttribute('stroke-width', isSelected ? '6' : (route.type === 'Quest' ? '5' : '3'));
      path.setAttribute('opacity', '0.95');
      path.style.pointerEvents = 'auto';
      path.style.cursor = 'pointer';
      if (routeLayout?.visual?.animated) path.setAttribute('class', 'edge-path');
      path.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        stateManager.selectRoute(route.id);
        onSelectionChanged?.({ type: 'route', id: route.id });
      });
      svgLayer.appendChild(path);
    }
  }

  function renderGraph() {
    nodesContainer.innerHTML = '';
    drawRoutes();

    const layoutNodes = stateManager.layout.nodes;
    const logicNodes = stateManager.logic.nodes;

    for (const layoutNode of layoutNodes) {
      const logicNode = logicNodes.find((node) => node.id === layoutNode.id);
      if (!logicNode) continue;

      const style = getTypeStyle(logicNode.type);
      const selected = stateManager.selectedNodeId === logicNode.id;
      const nodeEl = document.createElement('div');
      nodeEl.dataset.nodeId = logicNode.id;
      nodeEl.className = `absolute w-[200px] h-[80px] rounded-lg border-2 ${selected ? 'neon-card-active' : 'border-projectGold/40'} bg-cardDark/90 backdrop-blur-sm pointer-events-auto transition-shadow duration-300 flex flex-col p-2 select-none shadow-card-glow cursor-grab active:cursor-grabbing touch-none`;
      nodeEl.style.transform = `translate(${layoutNode.position.x}px, ${layoutNode.position.y}px)`;
      nodeEl.innerHTML = `
        <div class="flex items-center justify-between mb-1 pointer-events-none">
          <span class="text-[9px] px-1.5 py-0.5 rounded border ${style.badge} font-mono tracking-wider truncate max-w-[130px]">${escapeHtml(logicNode.type)}</span>
          <i data-lucide="${escapeHtml(style.icon)}" class="w-3.5 h-3.5 ${escapeHtml(style.color)}"></i>
        </div>
        <div class="flex-1 flex flex-col justify-center pointer-events-none">
          <span class="text-xs font-bold tracking-wide text-zinc-200 truncate">${escapeHtml(logicNode.properties.name)}</span>
          <span class="text-[8px] text-zinc-500 truncate block">${escapeHtml(logicNode.properties.description)}</span>
        </div>
      `;

      nodeEl.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (canvasController?.isDragging?.()) return;
        stateManager.selectNode(logicNode.id);
        onSelectionChanged?.({ type: 'node', id: logicNode.id });
      });

      canvasController?.attachNodeDrag?.(nodeEl, logicNode.id, {
        onNodeMoved,
        onInteractionEnd
      });
      nodesContainer.appendChild(nodeEl);
    }
  }

  return {
    drawRoutes,
    renderGraph
  };
}
