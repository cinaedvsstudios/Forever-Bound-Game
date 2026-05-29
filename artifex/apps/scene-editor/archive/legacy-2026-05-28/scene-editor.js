(() => {
  const app = document.getElementById('editor-app');
  const REPO_PREFIX = location.pathname.includes('/Forever-Bound-Game/') ? '/Forever-Bound-Game/' : '/';
  const TEMPLATE_MANIFEST = '../../templates/templates.json';
  const BRAND_LOGO = '../../artifexlogo.png';
  const BRAND_TITLE = '../../artifextitle.png';

  const blankScene = () => ({
    id: '',
    name: 'Untitled Scene',
    mode: 'blank',
    screenType: 'blank',
    background: '',
    backgroundScroll: false,
    grid: { columns: 16, rows: 9, snap: false, show: true },
    layers: [],
    elements: [],
    ui: [],
    audio: {}
  });

  let scene = blankScene();
  let hasScene = false;
  let selectedId = '';
  let selectedKind = 'element';
  let importOpen = false;
  let templateModalOpen = false;
  let templateItems = [];
  let statusText = 'No JSON loaded yet.';
  let hoverText = 'Ready.';
  let statusKind = '';
  let drag = null;
  let controlPanelScrollTop = 0;
  let highlightEnabled = true;
  let stageZoom = 1;
  let defaultZoom = 1;
  let contextMenu = null;
  const collapsedCards = { basics: false, elements: false, selected: false, json: false };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match]));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function isExternal(path) {
    return /^https?:\/\//i.test(path) || /^data:/i.test(path) || /^blob:/i.test(path);
  }

  function resolveAsset(path) {
    if (!path || isExternal(path)) return path || '';
    if (path.startsWith('/')) return path;
    if (path.startsWith('../../') || path.startsWith('../')) return path;
    return `${REPO_PREFIX}${path.replace(/^\.\//, '')}`;
  }

  function templateUrl(file) {
    return `../../templates/${file}`;
  }

  function backgroundPath() {
    if (typeof scene.background === 'string') return scene.background;
    if (scene.background && typeof scene.background === 'object') return scene.background.image || scene.background.backgroundImage || '';
    if (scene.theme?.backgroundImage) return scene.theme.backgroundImage;
    return '';
  }

  function setBackgroundPath(value) {
    if (scene.theme && scene.screenType === 'static') {
      scene.theme.backgroundImage = value;
      scene.theme.backgroundMode = value ? 'image' : 'gradient';
      return;
    }
    scene.background = value;
  }

  function collectionKey(kind) {
    return kind === 'layer' ? 'layers' : kind === 'ui' ? 'ui' : 'elements';
  }

  function elementCollections() {
    return [
      ...(Array.isArray(scene.layers) ? scene.layers.map((item) => ({ ...item, kind: 'layer' })) : []),
      ...(Array.isArray(scene.elements) ? scene.elements.map((item) => ({ ...item, kind: 'element' })) : []),
      ...(Array.isArray(scene.ui) ? scene.ui.map((item) => ({ ...item, kind: 'ui' })) : [])
    ];
  }

  function getRealItem(kind, id) {
    return (scene[collectionKey(kind)] || []).find((item) => item.id === id);
  }

  function selectedItem() {
    return getRealItem(selectedKind, selectedId);
  }

  function normalizeImported(raw, sourceLabel = 'Imported JSON') {
    const next = raw && typeof raw === 'object' ? structuredClone(raw) : blankScene();
    next.id = next.id || uid('scene');
    next.name = next.name || next.title || sourceLabel;
    next.screenType = next.screenType || next.mode || 'scene';
    next.mode = next.mode || next.screenType || 'scene';
    next.grid = next.grid || next.editor?.grid || { columns: 16, rows: 9, snap: false, show: true };
    next.grid.columns = Number(next.grid.columns || 16);
    next.grid.rows = Number(next.grid.rows || 9);
    next.grid.snap = Boolean(next.grid.snap);
    next.grid.show = next.grid.show !== false;
    next.layers = Array.isArray(next.layers) ? next.layers : [];
    next.elements = Array.isArray(next.elements) ? next.elements : [];
    next.ui = Array.isArray(next.ui) ? next.ui : [];
    next.audio = next.audio || {};

    if (next.background && typeof next.background === 'object') next.background = next.background.image || next.background.backgroundImage || '';
    if (!next.background && next.theme?.backgroundImage) next.background = next.theme.backgroundImage;

    if (next.player && !next.elements.some((item) => item.type === 'player_start')) {
      next.elements.unshift({
        id: 'player_start',
        type: 'player_start',
        name: 'Player Start',
        image: next.player.image || next.player.sprite || '',
        x: Number(next.player.startX || 12),
        y: Number(next.player.startY || 72),
        width: 10,
        height: 34,
        layer: 10,
        zDepth: 0,
        visible: true
      });
    }

    scene = next;
    hasScene = true;
    const first = elementCollections()[0];
    selectedKind = first?.kind || 'element';
    selectedId = first?.id || '';
    statusText = `${sourceLabel} loaded.`;
    hoverText = 'Template or JSON loaded. Select an object to edit it.';
    statusKind = 'ok';
  }

  function setStatus(text, kind = '') {
    statusText = text;
    statusKind = kind;
  }

  function saveControlPanelScroll() {
    const panel = document.querySelector('.side-panel');
    if (panel) controlPanelScrollTop = panel.scrollTop;
  }

  function restoreControlPanelScroll() {
    requestAnimationFrame(() => {
      const panel = document.querySelector('.side-panel');
      if (panel) panel.scrollTop = controlPanelScrollTop;
    });
  }

  function rerender(options = {}) {
    const preserveScroll = options.preserveScroll !== false;
    if (preserveScroll) saveControlPanelScroll();
    render({ preserveScroll });
  }

  function render(options = {}) {
    if (options.preserveScroll !== false) saveControlPanelScroll();
    app.innerHTML = `
      <div class="editor-shell">
        ${renderTopBar()}
        <main class="main-layout">
          ${renderSidePanel()}
          ${renderStage()}
        </main>
      </div>
      ${renderTemplateModal()}
      ${renderContextMenu()}
      <input class="hidden-file" id="pathHddInput" type="file" accept="image/*,.svg,.webp,.gif,.png,.jpg,.jpeg">
    `;
    bindEvents();
    if (options.preserveScroll !== false) restoreControlPanelScroll();
  }

  function renderTopBar() {
    return `
      <header class="top-bar" aria-label="Title Bar">
        <div class="brand" title="Artifex Scene Editor" data-tip="Artifex Scene Editor: the standalone scene-building workspace.">
          <img class="brand-logo" src="${BRAND_LOGO}" alt="Artifex logo">
          <img class="brand-title" src="${BRAND_TITLE}" alt="Artifex">
        </div>
        <span class="title-divider" aria-hidden="true"></span>
        <div class="import-menu ${importOpen ? 'is-open' : ''}" id="importMenu">
          <button class="import-button" id="importToggle" type="button" data-tip="Import a scene JSON from your hard drive, a URL, or the template library.">Import ▾</button>
          <div class="import-dropdown">
            <label class="file-button" data-tip="Import a JSON file stored on this computer.">From hard drive<input class="hidden-file" id="hardDriveInput" type="file" accept=".json,application/json"></label>
            <button class="btn" id="fromUrlBtn" type="button" data-tip="Import a JSON file from a web URL. Same-site URLs work best.">From URL</button>
            <button class="btn" id="fromTemplatesBtn" type="button" data-tip="Choose one of the built-in starter templates.">From templates</button>
          </div>
        </div>
        <button class="btn" id="downloadBtn" type="button" data-tip="Download the current scene as a JSON file.">Download JSON</button>
        <button class="btn" id="clearBtn" type="button" data-tip="Clear the editor and return to a blank screen.">Blank Screen</button>
        <span class="tooltip-status" id="hoverStatus">${esc(hoverText)}</span>
        <span class="status ${statusKind}">${esc(statusText)}</span>
        <span class="top-spacer"></span>
        <a class="btn" href="../../" title="Back to Artifex portal" data-tip="Return to the Artifex portal.">Portal</a>
      </header>
    `;
  }

  function card(id, title, body, tone = '') {
    const isCollapsed = Boolean(collapsedCards[id]);
    return `
      <section class="panel-card ${tone ? `card-${tone}` : ''} ${isCollapsed ? 'is-collapsed' : ''}" data-card-id="${id}">
        <h2>
          <span>${title}</span>
          <button class="card-toggle" type="button" data-toggle-card="${id}" data-tip="Collapse or expand ${esc(title)}." title="Collapse or expand ${esc(title)}">↕</button>
        </h2>
        <div class="card-body">${isCollapsed ? '' : body}</div>
      </section>
    `;
  }

  function renderSidePanel() {
    if (!hasScene) {
      return `<aside class="side-panel" aria-label="Control Panel">${card('blank', 'No Scene Loaded', `<p class="small">Use Import to load a JSON from your hard drive, a URL, or the starter templates.</p><p class="small">The editor opens blank on purpose so it does not accidentally imply a specific JSON is active.</p>`, 'basics')}</aside>`;
    }

    const item = selectedItem();
    return `
      <aside class="side-panel" aria-label="Control Panel">
        ${card('basics', 'Scene Basics', `
          ${field('Scene ID', 'scene-id', scene.id, 'text', 'Internal ID for this scene JSON.')}
          ${field('Scene Name', 'scene-name', scene.name, 'text', 'Human-readable scene name.')}
          ${field('Screen Type', 'scene-type', scene.screenType || scene.mode || 'scene', 'text', 'Scene mode/type, such as travel, scene, map, battle, static, or UI.')}
          ${pathField('Background Image Path', 'scene-bg', backgroundPath(), 'background', 'Background image path or URL for the Work Area.')}
          <div class="field-row">
            ${field('Grid Columns', 'grid-cols', scene.grid?.columns || 16, 'number', 'Number of major grid columns.')}
            ${field('Grid Rows', 'grid-rows', scene.grid?.rows || 9, 'number', 'Number of major grid rows.')}
          </div>
          <label class="check-row" data-tip="Show or hide the Work Area coordinate grid."><input id="gridShow" type="checkbox" ${scene.grid?.show !== false ? 'checked' : ''}> Show grid</label>
          <label class="check-row" data-tip="Preview this background as a wider/repeating travel background."><input id="wideBg" type="checkbox" ${scene.backgroundScroll ? 'checked' : ''}> Wide/repeating background preview</label>
        `, 'basics')}

        ${card('elements', 'Elements', `
          <div class="button-row">
            <button class="btn" id="addElementBtn" type="button" data-tip="Add a new red-ball placeholder element.">Add Element</button>
            <button class="btn" id="addLayerBtn" type="button" data-tip="Add a new layer/overlay placeholder.">Add Layer</button>
            <button class="btn ${highlightEnabled ? 'active-soft' : ''}" id="toggleHighlightBtn" type="button" data-tip="Turn the selected-object highlight glow on or off.">🖍 Highlight ${highlightEnabled ? 'On' : 'Off'}</button>
          </div>
          <div class="item-list">
            ${elementCollections().map((entry) => `
              <button class="btn item-row ${entry.id === selectedId ? 'is-selected' : ''}" data-select-kind="${entry.kind}" data-select-id="${esc(entry.id)}" type="button" data-tip="Select ${esc(entry.name || entry.id)} for editing.">
                z${entry.layer ?? entry.z ?? 0} · ${esc(entry.name || entry.label || entry.id)} · ${esc(entry.type || entry.kind)}
              </button>
            `).join('') || '<p class="small">No elements yet.</p>'}
          </div>
        `, 'elements')}

        ${card('selected', 'Selected Item', item ? renderSelected(item) : '<p class="small">Select an element to edit it.</p>', 'selected')}
        ${card('json', 'JSON Preview', `<pre class="json-preview">${esc(JSON.stringify(scene, null, 2))}</pre>`, 'json')}
      </aside>
    `;
  }

  function field(label, id, value, type = 'text', tip = '') {
    return `<div class="field" data-tip="${esc(tip || label)}"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}"></div>`;
  }

  function pathField(label, id, value, target, tip = '') {
    return `
      <div class="field path-field" data-path-target="${target}" data-tip="${esc(tip || label)}">
        <label for="${id}">${label}</label>
        <div class="path-row">
          <input id="${id}" type="text" value="${esc(value)}">
          <div class="path-menu">
            <button class="path-menu-toggle" type="button" data-path-menu="${target}" title="Choose image source" data-tip="Choose image source: Online or HDD.">📁</button>
            <div class="path-dropdown">
              <button type="button" data-path-online="${target}">Online</button>
              <button type="button" data-path-hdd="${target}">HDD</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSelected(item) {
    return `
      ${field('ID', 'item-id', item.id, 'text', 'Unique ID for this object.')}
      ${field('Name', 'item-name', item.name || item.label || '', 'text', 'Display name for this object.')}
      ${field('Type', 'item-type', item.type || '', 'text', 'Object type, such as prop, pickup, exit, player_start, NPC, or UI panel.')}
      ${pathField('Image Path', 'item-image', item.image || '', 'selected-image', 'Image path for the selected object.')}
      ${field('Text', 'item-text', item.text || '', 'text', 'Optional text attached to this object.')}
      <div class="field-row">
        ${field('X %', 'item-x', item.x ?? 10, 'number', 'Horizontal position in the Work Area.')}
        ${field('Y %', 'item-y', item.y ?? 10, 'number', 'Vertical position in the Work Area.')}
      </div>
      <div class="field-row">
        ${field('Width %', 'item-width', item.width ?? 10, 'number', 'Object width as a percentage of the Work Area.')}
        ${field('Height %', 'item-height', item.height ?? 10, 'number', 'Object height as a percentage of the Work Area.')}
      </div>
      <div class="field-row">
        ${field('Layer', 'item-layer', item.layer ?? item.z ?? 10, 'number', 'Draw order layer. Higher layers appear above lower layers.')}
        ${field('Z / Depth', 'item-zdepth', item.zDepth ?? 0, 'number', 'Fake depth. Positive values scale the object up and shift it slightly; negative values scale it down.')}
      </div>
      <label class="check-row" data-tip="Show or hide this object in the Work Area."><input id="item-visible" type="checkbox" ${item.visible !== false ? 'checked' : ''}> Visible</label>
      <div class="button-row"><button class="btn" id="deleteItemBtn" type="button" data-tip="Delete the selected object.">Delete Selected</button></div>
      <p class="small">Image paths can be SVG, PNG, JPG, GIF, WebP, or any browser-displayable image path.</p>
    `;
  }

  function renderStage() {
    const bg = backgroundPath();
    const grid = scene.grid || { columns: 16, rows: 9, show: true };
    const cols = Number(grid.columns || 16);
    const rows = Number(grid.rows || 9);
    const gridStyle = `--fine-x:${100 / (cols * 2)}%;--fine-y:${100 / (rows * 2)}%;--major-x:${500 / cols}%;--major-y:${500 / rows}%;`;
    return `
      <section class="stage-wrap" aria-label="Work Area">
        <div class="work-zoom-controls" aria-label="Work Area Zoom Controls">
          <button class="zoom-control" id="zoomInBtn" type="button" title="Zoom in" data-tip="Zoom into the Work Area.">+</button>
          <button class="zoom-control" id="zoomResetBtn" type="button" title="Reset zoom" data-tip="Reset to the default zoom. Right-click to set the current zoom as the new default.">o</button>
          <button class="zoom-control" id="zoomOutBtn" type="button" title="Zoom out" data-tip="Zoom out of the Work Area.">-</button>
        </div>
        <div class="stage-scale" style="transform:scale(${stageZoom});">
          <div class="stage ${highlightEnabled ? 'highlight-on' : 'highlight-off'}" id="stage">
            ${bg ? `<div class="stage-bg ${scene.backgroundScroll ? 'repeat' : ''}" style="background-image:url('${esc(resolveAsset(bg))}')"></div>` : ''}
            ${hasScene && grid.show !== false ? `<div class="stage-grid" style="${gridStyle}"></div>${renderGridLabels(cols, rows)}` : ''}
            ${hasScene ? elementCollections().sort((a, b) => (a.layer ?? a.z ?? 0) - (b.layer ?? b.z ?? 0)).map(renderStageItem).join('') : renderBlankMessage()}
          </div>
        </div>
      </section>
    `;
  }

  function letters(index) {
    let n = index + 1;
    let label = '';
    while (n > 0) {
      const rem = (n - 1) % 26;
      label = String.fromCharCode(65 + rem) + label;
      n = Math.floor((n - 1) / 26);
    }
    return label;
  }

  function renderGridLabels(cols, rows) {
    const columns = Array.from({ length: cols }, (_, i) => `<span class="grid-col-label" style="left:${((i + 0.5) / cols) * 100}%">${i + 1}</span>`).join('');
    const rowLabels = Array.from({ length: rows }, (_, i) => `<span class="grid-row-label" style="top:${((i + 0.5) / rows) * 100}%">${letters(i)}</span>`).join('');
    return `<div class="grid-labels">${columns}${rowLabels}<span class="axis-label axis-x">X</span><span class="axis-label axis-y">Y</span></div>`;
  }

  function renderBlankMessage() {
    return `<div class="blank-message"><div><strong>Blank Scene Editor</strong><span>Import a JSON from hard drive, URL, or templates to begin.</span></div></div>`;
  }

  function renderStageItem(item) {
    if (item.visible === false) return '';
    const zDepth = Number(item.zDepth || 0);
    const scale = clamp(1 + zDepth * 0.035, 0.45, 2.15);
    const dx = zDepth * 2;
    const dy = zDepth * -1.25;
    const image = item.image ? `<img src="${esc(resolveAsset(item.image))}" alt="${esc(item.name || item.id)}">` : `<span class="small">${esc(item.text || item.type || item.id)}</span>`;
    return `
      <div class="scene-item ${item.id === selectedId ? 'is-selected' : ''}" data-stage-kind="${item.kind}" data-stage-id="${esc(item.id)}" data-tip="${esc(item.name || item.id)} · ${esc(item.type || item.kind)}" style="left:${item.x ?? 10}%;top:${item.y ?? 10}%;width:${item.width ?? 10}%;height:${item.height ?? 10}%;z-index:${item.layer ?? item.z ?? 1};transform:translate(${dx}px, ${dy}px) scale(${scale});">
        ${image}
        <span class="item-label">${esc(item.name || item.label || item.id)}</span>
      </div>
    `;
  }

  function renderTemplateModal() {
    return `
      <div class="modal-backdrop ${templateModalOpen ? 'is-open' : ''}" id="templateModal">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="templateTitle">
          <div class="modal-head"><h2 id="templateTitle">Import From Templates</h2><button class="btn" id="closeTemplateModal" type="button">Close</button></div>
          <p class="small">These starter templates use SVG placeholder art. Replace the image paths with real project assets later.</p>
          <div class="template-list">
            ${templateItems.length ? templateItems.map((item) => `<button class="template-card" data-template-file="${esc(item.file)}" type="button"><strong>${esc(item.label || item.id)}</strong><span>${esc(item.type || '')} · ${esc(item.file || '')}</span><span>Default save folder: ${esc(item.defaultSaveFolder || '')}</span></button>`).join('') : '<p class="small">Template manifest has not been loaded yet.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  function renderContextMenu() {
    if (!contextMenu) return '';
    if (contextMenu.type === 'zoom') {
      return `<div class="context-menu" style="left:${contextMenu.x}px;top:${contextMenu.y}px"><button data-context-action="set-default-zoom">Set default zoom</button></div>`;
    }

    const item = getRealItem(contextMenu.kind, contextMenu.id);
    if (!item) return '';
    return `
      <div class="context-menu" style="left:${contextMenu.x}px;top:${contextMenu.y}px">
        <div class="context-menu-head"><strong>${esc(item.name || item.id)}</strong><span>${esc(item.type || contextMenu.kind)}</span></div>
        <button data-context-action="zoom-object">Zoom to object</button>
        <button data-context-action="properties">Properties</button>
        <button data-context-action="duplicate">Duplicate</button>
        <button data-context-action="delete">Delete</button>
      </div>
    `;
  }

  function bindEvents() {
    document.getElementById('importToggle')?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); importOpen = !importOpen; rerender(); });
    document.getElementById('hardDriveInput')?.addEventListener('change', importFromHardDrive);
    document.getElementById('fromUrlBtn')?.addEventListener('click', importFromUrlPrompt);
    document.getElementById('fromTemplatesBtn')?.addEventListener('click', openTemplates);
    document.getElementById('downloadBtn')?.addEventListener('click', downloadJson);
    document.getElementById('clearBtn')?.addEventListener('click', () => { scene = blankScene(); hasScene = false; selectedId = ''; setStatus('Blank editor ready.', 'ok'); rerender({ preserveScroll: false }); });
    document.getElementById('closeTemplateModal')?.addEventListener('click', () => { templateModalOpen = false; rerender(); });
    document.getElementById('templateModal')?.addEventListener('click', (event) => { if (event.target.id === 'templateModal') { templateModalOpen = false; rerender(); } });

    document.querySelectorAll('[data-template-file]').forEach((button) => button.addEventListener('click', () => loadTemplate(button.dataset.templateFile)));
    document.querySelectorAll('[data-select-id]').forEach((button) => button.addEventListener('click', () => { selectedKind = button.dataset.selectKind; selectedId = button.dataset.selectId; rerender(); }));
    document.querySelectorAll('[data-toggle-card]').forEach((button) => button.addEventListener('click', () => { collapsedCards[button.dataset.toggleCard] = !collapsedCards[button.dataset.toggleCard]; rerender(); }));

    document.getElementById('scene-id')?.addEventListener('input', (e) => { scene.id = e.target.value; });
    document.getElementById('scene-name')?.addEventListener('input', (e) => { scene.name = e.target.value; });
    document.getElementById('scene-type')?.addEventListener('input', (e) => { scene.screenType = e.target.value; scene.mode = e.target.value; });
    document.getElementById('scene-bg')?.addEventListener('input', (e) => { setBackgroundPath(e.target.value); updateStageOnly(); });
    document.getElementById('grid-cols')?.addEventListener('change', (e) => { scene.grid.columns = Number(e.target.value) || 16; rerender(); });
    document.getElementById('grid-rows')?.addEventListener('change', (e) => { scene.grid.rows = Number(e.target.value) || 9; rerender(); });
    document.getElementById('gridShow')?.addEventListener('change', (e) => { scene.grid.show = e.target.checked; rerender(); });
    document.getElementById('wideBg')?.addEventListener('change', (e) => { scene.backgroundScroll = e.target.checked; rerender(); });
    document.getElementById('toggleHighlightBtn')?.addEventListener('click', () => { highlightEnabled = !highlightEnabled; rerender(); });
    document.getElementById('zoomInBtn')?.addEventListener('click', () => setZoom(stageZoom + 0.1));
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => setZoom(stageZoom - 0.1));
    document.getElementById('zoomResetBtn')?.addEventListener('click', () => setZoom(defaultZoom));
    document.getElementById('zoomResetBtn')?.addEventListener('contextmenu', (event) => { event.preventDefault(); contextMenu = { type: 'zoom', x: event.clientX, y: event.clientY }; rerender(); });

    bindPathMenus();
    bindSelectedInputs();
    bindContextMenuActions();
    bindTooltips();
    document.getElementById('addElementBtn')?.addEventListener('click', addElement);
    document.getElementById('addLayerBtn')?.addEventListener('click', addLayer);
    document.getElementById('deleteItemBtn')?.addEventListener('click', deleteSelected);
    bindStageDrag();
  }

  function bindTooltips() {
    document.querySelectorAll('[data-tip]').forEach((node) => {
      node.addEventListener('mouseenter', () => {
        hoverText = node.dataset.tip || 'Ready.';
        const status = document.getElementById('hoverStatus');
        if (status) status.textContent = hoverText;
      });
    });
  }

  function bindContextMenuActions() {
    document.querySelectorAll('[data-context-action]').forEach((button) => {
      button.addEventListener('click', () => handleContextAction(button.dataset.contextAction));
    });
  }

  function handleContextAction(action) {
    if (action === 'set-default-zoom') {
      defaultZoom = stageZoom;
      contextMenu = null;
      setStatus(`Default zoom set to ${Math.round(defaultZoom * 100)}%.`, 'ok');
      rerender();
      return;
    }

    if (!contextMenu?.id) return;
    selectedKind = contextMenu.kind;
    selectedId = contextMenu.id;

    if (action === 'zoom-object') {
      contextMenu = null;
      setZoom(Math.max(stageZoom, 1.35));
      requestAnimationFrame(() => document.querySelector(`[data-stage-id="${CSS.escape(selectedId)}"]`)?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }));
      return;
    }

    if (action === 'properties') {
      collapsedCards.selected = false;
      contextMenu = null;
      rerender();
      requestAnimationFrame(() => document.querySelector('[data-card-id="selected"]')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
      return;
    }

    if (action === 'duplicate') {
      duplicateSelected();
      return;
    }

    if (action === 'delete') {
      contextMenu = null;
      deleteSelected();
    }
  }

  function bindPathMenus() {
    document.querySelectorAll('[data-path-menu]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        document.querySelectorAll('.path-menu').forEach((menu) => { if (menu !== button.closest('.path-menu')) menu.classList.remove('is-open'); });
        button.closest('.path-menu')?.classList.toggle('is-open');
      });
    });

    document.querySelectorAll('[data-path-online]').forEach((button) => {
      button.addEventListener('click', () => {
        const value = prompt('Paste an image URL or project path:');
        if (!value) return;
        applyPathValue(button.dataset.pathOnline, value);
      });
    });

    document.querySelectorAll('[data-path-hdd]').forEach((button) => {
      button.addEventListener('click', () => {
        const input = document.getElementById('pathHddInput');
        if (!input) return;
        input.dataset.pathTarget = button.dataset.pathHdd;
        input.value = '';
        input.click();
      });
    });

    document.getElementById('pathHddInput')?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      const target = event.target.dataset.pathTarget;
      if (!file || !target) return;
      const url = URL.createObjectURL(file);
      applyPathValue(target, url);
      setStatus(`HDD image loaded for preview only: ${file.name}`, 'ok');
    });
  }

  function applyPathValue(target, value) {
    if (target === 'background') {
      setBackgroundPath(value);
      const input = document.getElementById('scene-bg');
      if (input) input.value = value;
    } else if (target === 'selected-image') {
      const item = selectedItem();
      if (item) item.image = value;
      const input = document.getElementById('item-image');
      if (input) input.value = value;
    }
    updateStageOnly();
  }

  function setZoom(value) {
    stageZoom = clamp(Number(value) || 1, 0.4, 2.2);
    hoverText = `Work Area zoom: ${Math.round(stageZoom * 100)}%.`;
    updateStageOnly();
    const status = document.getElementById('hoverStatus');
    if (status) status.textContent = hoverText;
  }

  function bindSelectedInputs() {
    const item = selectedItem();
    if (!item) return;
    const bindings = [
      ['item-id', 'id', 'text'], ['item-name', 'name', 'text'], ['item-type', 'type', 'text'], ['item-image', 'image', 'text'], ['item-text', 'text', 'text'],
      ['item-x', 'x', 'number'], ['item-y', 'y', 'number'], ['item-width', 'width', 'number'], ['item-height', 'height', 'number'], ['item-layer', 'layer', 'number'], ['item-zdepth', 'zDepth', 'number']
    ];

    bindings.forEach(([id, key, type]) => {
      document.getElementById(id)?.addEventListener('input', (event) => {
        const value = type === 'number' ? Number(event.target.value) : event.target.value;
        item[key] = value;
        if (key === 'id') selectedId = value;
        updateStageOnly();
      });
    });

    document.getElementById('item-visible')?.addEventListener('change', (event) => { item.visible = event.target.checked; rerender(); });
  }

  function updateStageOnly() {
    const wrap = document.querySelector('.stage-wrap');
    if (wrap) {
      wrap.outerHTML = renderStage();
      bindStageDrag();
      document.getElementById('zoomInBtn')?.addEventListener('click', () => setZoom(stageZoom + 0.1));
      document.getElementById('zoomOutBtn')?.addEventListener('click', () => setZoom(stageZoom - 0.1));
      document.getElementById('zoomResetBtn')?.addEventListener('click', () => setZoom(defaultZoom));
      document.getElementById('zoomResetBtn')?.addEventListener('contextmenu', (event) => { event.preventDefault(); contextMenu = { type: 'zoom', x: event.clientX, y: event.clientY }; rerender(); });
      bindTooltips();
    }
  }

  async function importFromHardDrive(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      normalizeImported(raw, file.name);
      importOpen = false;
      render({ preserveScroll: false });
    } catch (error) {
      setStatus(`Could not import JSON: ${error.message}`, 'error');
      rerender();
    }
  }

  async function importFromUrlPrompt() {
    const url = prompt('Paste a JSON URL to import:');
    if (!url) return;
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const raw = await response.json();
      normalizeImported(raw, url.split('/').pop() || 'URL JSON');
      importOpen = false;
      render({ preserveScroll: false });
    } catch (error) {
      setStatus(`URL import failed: ${error.message}`, 'error');
      rerender();
    }
  }

  async function openTemplates() {
    importOpen = false;
    try {
      const response = await fetch(TEMPLATE_MANIFEST, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const manifest = await response.json();
      templateItems = manifest.templates || [];
      templateModalOpen = true;
      setStatus('Template list loaded.', 'ok');
      rerender();
    } catch (error) {
      setStatus(`Template manifest failed: ${error.message}`, 'error');
      rerender();
    }
  }

  async function loadTemplate(file) {
    try {
      const response = await fetch(templateUrl(file), { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const raw = await response.json();
      normalizeImported(raw, file);
      templateModalOpen = false;
      render({ preserveScroll: false });
    } catch (error) {
      setStatus(`Template import failed: ${error.message}`, 'error');
      rerender();
    }
  }

  function downloadJson() {
    if (!hasScene) {
      setStatus('Nothing loaded yet. Import a JSON first.', 'error');
      rerender();
      return;
    }
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scene.id || 'artifex_scene'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON downloaded.', 'ok');
    rerender();
  }

  function addElement() {
    if (!hasScene) normalizeImported(blankScene(), 'New blank scene');
    const item = { id: uid('element'), type: 'prop', name: 'New Element', image: '../../templates/assets/template_red_ball.svg', x: 40, y: 55, width: 10, height: 14, layer: 10, zDepth: 0, visible: true };
    scene.elements.push(item);
    selectedKind = 'element';
    selectedId = item.id;
    rerender();
  }

  function addLayer() {
    if (!hasScene) normalizeImported(blankScene(), 'New blank scene');
    const item = { id: uid('layer'), type: 'overlay', name: 'New Layer', image: '../../templates/assets/template_water_strip.svg', x: 20, y: 70, width: 40, height: 14, layer: 5, zDepth: 0, visible: true };
    scene.layers.push(item);
    selectedKind = 'layer';
    selectedId = item.id;
    rerender();
  }

  function duplicateSelected() {
    const item = selectedItem();
    if (!item) return;
    const copy = structuredClone(item);
    copy.id = `${item.id || 'item'}_copy_${Math.random().toString(36).slice(2, 5)}`;
    copy.name = `${item.name || item.label || item.id || 'Item'} Copy`;
    copy.x = clamp(Number(item.x || 0) + 3, 0, 100);
    copy.y = clamp(Number(item.y || 0) + 3, 0, 100);
    copy.layer = Number(item.layer ?? item.z ?? 0) + 1;
    scene[collectionKey(selectedKind)].push(copy);
    selectedId = copy.id;
    contextMenu = null;
    setStatus('Object duplicated.', 'ok');
    rerender();
  }

  function deleteSelected() {
    if (!selectedId) return;
    const key = collectionKey(selectedKind);
    scene[key] = (scene[key] || []).filter((item) => item.id !== selectedId);
    const first = elementCollections()[0];
    selectedKind = first?.kind || 'element';
    selectedId = first?.id || '';
    setStatus('Object deleted.', 'ok');
    rerender();
  }

  function bindStageDrag() {
    document.querySelectorAll('[data-stage-id]').forEach((node) => {
      node.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        selectedKind = node.dataset.stageKind;
        selectedId = node.dataset.stageId;
        contextMenu = { type: 'object', kind: selectedKind, id: selectedId, x: event.clientX, y: event.clientY };
        rerender();
      });

      node.addEventListener('pointerdown', (event) => {
        if (event.button === 2) return;
        event.preventDefault();
        selectedKind = node.dataset.stageKind;
        selectedId = node.dataset.stageId;
        const item = selectedItem();
        if (!item) return;
        drag = { item, pointerId: event.pointerId };
        node.setPointerCapture(event.pointerId);
        rerender();
      });
    });

    document.getElementById('stage')?.addEventListener('pointermove', (event) => {
      if (!drag?.item) return;
      const rect = event.currentTarget.getBoundingClientRect();
      drag.item.x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      drag.item.y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
      updateStageOnly();
    });

    document.addEventListener('pointerup', () => { if (drag) { drag = null; rerender(); } }, { once: true });
  }

  document.addEventListener('click', (event) => {
    const menu = document.getElementById('importMenu');
    if (menu && importOpen && !menu.contains(event.target)) { importOpen = false; rerender(); }
    if (!event.target.closest?.('.path-menu')) document.querySelectorAll('.path-menu.is-open').forEach((pathMenu) => pathMenu.classList.remove('is-open'));
    if (contextMenu && !event.target.closest?.('.context-menu') && !event.target.closest?.('.scene-item')) { contextMenu = null; rerender(); }
  });

  render({ preserveScroll: false });
})();
