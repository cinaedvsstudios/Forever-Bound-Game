import { getRouteTypeDefinition, getRouteTypeOptions, buildRouteConditionPatch } from './project-route-types.js?v=0.1.23-routes';

// Artifex Project Editor Stitcher workspace
// Owns route/connection editing UI for the split Project Editor shell.

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getRouteMeta(route) {
  return route?.routeMeta || {};
}

function renderRouteTypeOptions(selectedRoute) {
  return getRouteTypeOptions(selectedRoute?.type).map((type) => `
    <option value="${escapeHtml(type.id)}" ${type.selected ? 'selected' : ''}>${escapeHtml(type.label)}</option>
  `).join('');
}

export function renderStitcherWorkspace({ stateManager, container, onChange }) {
  if (!container || !stateManager) return;

  const routes = stateManager.logic.routes;
  const selectedRoute = stateManager.selectedEdgeId
    ? stateManager.getRoute(stateManager.selectedEdgeId)
    : routes[0] ?? null;

  if (selectedRoute && stateManager.selectedEdgeId !== selectedRoute.id) {
    stateManager.selectRoute(selectedRoute.id);
  }

  const routeButtons = routes.map((route) => {
    const source = stateManager.getNode(route.source);
    const target = stateManager.getNode(route.target);
    const active = route.id === selectedRoute?.id;
    const definition = getRouteTypeDefinition(route.type);
    return `
      <button data-stitch-route-id="${escapeHtml(route.id)}" class="w-full text-left px-3 py-2.5 rounded border ${active ? 'border-projectGold/70 bg-accentDark/50' : 'border-zinc-800/70 bg-black/25 hover:border-projectGold/40 hover:bg-accentDark/30'} transition">
        <span class="text-xs font-bold text-zinc-100 block truncate">${escapeHtml(source?.properties?.name || route.source)}</span>
        <span class="text-[9px] text-zinc-500 block font-mono truncate">→ ${escapeHtml(target?.properties?.name || route.target)}</span>
        <span class="text-[9px] font-mono" style="color:${escapeHtml(definition.color)}">${escapeHtml(definition.label)}</span>
      </button>
    `;
  }).join('');

  const selectedLayout = selectedRoute ? stateManager.getRouteLayout(selectedRoute.id) : null;
  const selectedSource = selectedRoute ? stateManager.getNode(selectedRoute.source) : null;
  const selectedTarget = selectedRoute ? stateManager.getNode(selectedRoute.target) : null;
  const selectedType = selectedRoute ? getRouteTypeDefinition(selectedRoute.type) : null;
  const routeMeta = getRouteMeta(selectedRoute);
  const conditionValue = selectedRoute?.conditions?.[0] || '';
  const lineColor = selectedLayout?.visual?.lineColor || selectedType?.color || '#d6a24c';
  const animated = Boolean(selectedLayout?.visual?.animated);

  container.innerHTML = `
    <div class="h-full overflow-y-auto p-6 space-y-6">
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="border-b border-[#2d2d42] pb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold tracking-wide text-zinc-100">Stitcher & Route Logic</h2>
            <p class="text-xs text-zinc-500">Configure route types, visual traces, gates, conditions, and unlock logic between Flatplan nodes.</p>
          </div>
          <i data-lucide="git-commit" class="w-6 h-6 text-projectGoldGlow"></i>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 bg-cardDark border border-[#2d2d42] rounded-lg p-4 h-[560px] flex flex-col">
            <span class="text-[10px] text-zinc-500 block font-mono mb-2">PROJECT CONNECTIONS</span>
            <div id="stitcherRouteList" class="flex-1 overflow-y-auto space-y-2 pr-1">
              ${routeButtons || '<span class="text-xs text-zinc-500 italic p-2 block">No active routes yet.</span>'}
            </div>
          </div>

          <div class="lg:col-span-2 bg-cardDark border border-[#2d2d42] rounded-lg p-5 min-h-[560px]">
            ${selectedRoute ? `
              <div class="h-full flex flex-col justify-between gap-5">
                <div class="space-y-5">
                  <div class="flex justify-between items-start border-b border-[#2d2d42] pb-3 gap-3">
                    <div>
                      <span class="text-xs font-bold text-projectGoldGlow block truncate">${escapeHtml(selectedSource?.properties?.name || selectedRoute.source)} → ${escapeHtml(selectedTarget?.properties?.name || selectedRoute.target)}</span>
                      <p class="text-[10px] text-zinc-500 mt-1 leading-relaxed">${escapeHtml(selectedType.description)}</p>
                    </div>
                    <span class="text-[9px] font-mono px-2 py-0.5 rounded border bg-accentDark/40 text-projectGoldGlow border-projectGold/20">${escapeHtml(selectedRoute.id)}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-[10px] text-zinc-500 block font-mono mb-1">ROUTE TYPE</label>
                      <select id="stitchRouteType" class="w-full bg-[#1c1c2b] border border-[#2d2d42] rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none">
                        ${renderRouteTypeOptions(selectedRoute)}
                      </select>
                    </div>
                    <div>
                      <label class="text-[10px] text-zinc-500 block font-mono mb-1">PRIMARY CONDITION</label>
                      <input id="stitchCondition" value="${escapeHtml(conditionValue)}" placeholder="${escapeHtml(selectedType.conditionPlaceholder)}" class="w-full bg-black/40 border border-[#2d2d42] rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none font-mono">
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="text-[10px] text-zinc-500 block font-mono mb-1">GATE / LINK ID</label>
                      <input id="stitchGateId" value="${escapeHtml(routeMeta.gateId || '')}" placeholder="q01 / p01 / brass_key" class="w-full bg-black/40 border border-[#2d2d42] rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none font-mono">
                    </div>
                    <div>
                      <label class="text-[10px] text-zinc-500 block font-mono mb-1">FLAG KEY</label>
                      <input id="stitchFlagKey" value="${escapeHtml(routeMeta.flagKey || '')}" placeholder="flag:met_capra" class="w-full bg-black/40 border border-[#2d2d42] rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none font-mono">
                    </div>
                    <div>
                      <label class="text-[10px] text-zinc-500 block font-mono mb-1">REQUIRED STATE</label>
                      <input id="stitchRequiredState" value="${escapeHtml(routeMeta.requiredState || '')}" placeholder="true / complete / solved" class="w-full bg-black/40 border border-[#2d2d42] rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none font-mono">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label class="text-[10px] text-zinc-500 block font-mono mb-1">LINE COLOR</label>
                      <div class="flex items-center space-x-2 bg-black/30 p-1.5 rounded border border-[#2d2d42]">
                        <input type="color" id="stitchLineColor" value="${escapeHtml(lineColor)}" class="w-8 h-8 rounded bg-transparent cursor-pointer border border-zinc-800">
                        <span class="text-xs text-zinc-400">Trace Theme</span>
                      </div>
                    </div>
                    <div class="flex flex-col justify-end">
                      <label class="flex items-center justify-between bg-black/30 p-3 rounded border border-[#2d2d42] text-xs h-[42px]">
                        <span class="text-zinc-300">Animate Flow</span>
                        <input type="checkbox" id="stitchAnimated" ${animated ? 'checked' : ''} class="w-4 h-4 accent-yellow-500">
                      </label>
                    </div>
                  </div>

                  <div class="rounded-lg border border-projectGold/20 bg-accentDark/10 p-3">
                    <div class="text-[10px] font-mono text-projectGoldGlow mb-1">ROUTE SUMMARY</div>
                    <div class="text-xs text-zinc-500 leading-relaxed">${escapeHtml(selectedType.label)} · ${escapeHtml(selectedRoute.conditions?.join(' + ') || 'no condition set')}</div>
                  </div>
                </div>

                <div class="pt-4 border-t border-[#2d2d42] flex justify-between items-center">
                  <span class="text-[10px] text-zinc-500 font-mono">STITCHER READY</span>
                  <button id="stitchPlaytestBtn" class="bg-gradient-to-r from-accentDark to-projectGold hover:brightness-110 border border-projectGold/40 text-white font-bold px-4 py-2 rounded text-xs flex items-center space-x-2 transition">
                    <i data-lucide="play" class="w-4 h-4 text-projectParchment"></i>
                    <span>Playtest Route Transition</span>
                  </button>
                </div>
              </div>
            ` : `
              <div class="h-full flex flex-col items-center justify-center text-center">
                <i data-lucide="git-branch" class="w-12 h-12 text-zinc-600 mb-3"></i>
                <span class="text-sm text-zinc-400 font-semibold block">No Connection Selected</span>
                <span class="text-xs text-zinc-600">Create or select a route in Flatplan first.</span>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-stitch-route-id]').forEach((button) => {
    button.addEventListener('click', () => {
      stateManager.selectRoute(button.dataset.stitchRouteId);
      onChange?.();
    });
  });

  if (!selectedRoute) return;

  function updateRouteFromFields({ soft = false } = {}) {
    const type = container.querySelector('#stitchRouteType')?.value || selectedRoute.type;
    const conditionText = container.querySelector('#stitchCondition')?.value || '';
    const gateId = container.querySelector('#stitchGateId')?.value || '';
    const flagKey = container.querySelector('#stitchFlagKey')?.value || '';
    const requiredState = container.querySelector('#stitchRequiredState')?.value || '';
    stateManager.updateRoute(selectedRoute.id, buildRouteConditionPatch({ type, conditionText, gateId, flagKey, requiredState }));
    onChange?.({ soft });
  }

  container.querySelector('#stitchRouteType')?.addEventListener('change', (event) => {
    const definition = getRouteTypeDefinition(event.target.value);
    const colorInput = container.querySelector('#stitchLineColor');
    if (colorInput) colorInput.value = definition.color;
    stateManager.updateRouteVisual(selectedRoute.id, { lineColor: definition.color });
    updateRouteFromFields();
  });

  ['#stitchCondition', '#stitchGateId', '#stitchFlagKey', '#stitchRequiredState'].forEach((selector) => {
    container.querySelector(selector)?.addEventListener('input', () => updateRouteFromFields({ soft: true }));
  });

  container.querySelector('#stitchLineColor')?.addEventListener('input', (event) => {
    stateManager.updateRouteVisual(selectedRoute.id, { lineColor: event.target.value });
    onChange?.({ soft: true });
  });

  container.querySelector('#stitchAnimated')?.addEventListener('change', (event) => {
    stateManager.updateRouteVisual(selectedRoute.id, { animated: event.target.checked });
    onChange?.();
  });

  container.querySelector('#stitchPlaytestBtn')?.addEventListener('click', () => {
    alert(`Route playtest queued: ${selectedRoute.source} → ${selectedRoute.target}`);
  });
}
