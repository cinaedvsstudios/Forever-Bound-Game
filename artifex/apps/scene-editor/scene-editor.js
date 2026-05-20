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
  let statusKind = '';
  let drag = null;
  let controlPanelScrollTop = 0;
  let highlightEnabled = true;
  let stageZoom = 1;
  const collapsedCards = {
    basics: false,
    elements: false,
    selected: false,
    json: false
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (match) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match]));
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

  function elementCollections() {
    return [
      ...(Array.isArray(scene.layers) ? scene.layers.map((item) => ({ ...item, kind: 'layer' })) : []),
      ...(Array.isArray(scene.elements) ? scene.elements.map((item) => ({ ...item, kind: 'element' })) : []),
      ...(Array.isArray(scene.ui) ? scene.ui.map((item) => ({ ...item, kind: 'ui' })) : [])
    ];
  }

  function getRealItem(kind, id) {
    const key = kind === 'layer' ? 'layers' : kind === 'ui' ? 'ui' : 'elements';
    return (scene[key] || []).find((item) => item.id === id);
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

    if (next.background && typeof next.background === 'object') {
      next.background = next.background.image || next.background.backgroundImage || '';
    }

    if (!next.background && next.theme?.backgroundImage) {
      next.background = next.theme.backgroundImage;
    }

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
        visible: true
      });
    }

    scene = next;
    hasScene = true;
    const first = elementCollections()[0];
    selectedKind = first?.kind || 'element';
    selectedId = first?.id || '';
    statusText = `${sourceLabel} loaded.`;
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

  function downloadJson() {
    if (!hasScene) {
      setStatus('Nothing loaded yet. Import a JSON first.', 'error');
      render();
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
      <input class="hidden-file" id="pathHddInput" type="file" accept="image/*,.svg,.webp,.gif,.png,.jpg,.jpeg">
    `;
    bindEvents();
    if (options.preserveScroll !== false) restoreControlPanelScroll();
  }

  function renderTopBar() {
    return `
      <header class="top-bar" aria-label="Title Bar">
        <div class="brand" title="Artifex Scene Editor">
          <img class="brand-logo" src="${BRAND_LOGO}" alt="Artifex logo">
          <img class="brand-title" src="${BRAND_TITLE}" alt="Artifex">
        </div>
        <div class="import-menu ${importOpen ? 'is-open' : ''}" id="importMenu">
          <button class="import-button" id="importToggle" type="button">Import ▾</button>
          <div class="import-dropdown">
            <label class="file-button">From hard drive<input class="hidden-file" id="hardDriveInput" type="file" accept=".json,application/json"></label>
            <button class="btn" id="fromUrlBtn" type="button">From URL</button>
            <button class="btn" id="fromTemplatesBtn" type="button">From templates</button>
          </div>
        </div>
        <button class="btn" id="downloadBtn" type="button">Download JSON</button>
        <button class="btn" id="clearBtn" type="button">Blank Screen</button>
        <span class="status ${statusKind}">${esc(statusText)}</span>
        <span class="top-spacer"></span>
        <a class="btn" href="../../" title="Back to Artifex portal">Portal</a>
      </header>
    `;
  }

  function card(id, title, body, tone = '') {
    const isCollapsed = Boolean(collapsedCards[id]);
    return `
      <section class="panel-card ${tone ? `card-${tone}` : ''} ${isCollapsed ? 'is-collapsed' : ''}" data-card-id="${id}">
        <h2>
          <span>${title}</span>
          <button class="card-toggle" type="button" data-toggle-card="${id}" title="Collapse or expand ${esc(title)}">↕</button>
        </h2>
        <div class="card-body">${isCollapsed ? '' : body}</div>
      </section>
    `;
  }

  function renderSidePanel() {
    if (!hasScene) {
      return `
        <aside class="side-panel" aria-label="Control Panel">
          ${card('blank', 'No Scene Loaded', `
            <p class="small">Use Import to load a JSON from your hard drive, a URL, or the starter templates.</p>
            <p class="small">The editor now opens blank on purpose so it does not accidentally imply a specific JSON is active.</p>
          `, 'basics')}
        </aside>
      `;
    }

    const item = selectedItem();
    return `
      <aside class="side-panel" aria-label="Control Panel">
        ${card('basics', 'Scene Basics', `
          ${field('Scene ID', 'scene-id', scene.id)}
          ${field('Scene Name', 'scene-name', scene.name)}
          ${field('Screen Type', 'scene-type', scene.screenType || scene.mode || 'scene')}
          ${pathField('Background Image Path', 'scene-bg', backgroundPath(), 'background')}
          <div class="field-row">
            ${field('Grid Columns', 'grid-cols', scene.grid?.columns || 16, 'number')}
            ${field('Grid Rows', 'grid-rows', scene.grid?.rows || 9, 'number')}
          </div>
          <label class="check-row"><input id="gridShow" type="checkbox" ${scene.grid?.show !== false ? 'checked' : ''}> Show grid</label>
          <label class="check-row"><input id="wideBg" type="checkbox" ${scene.backgroundScroll ? 'checked' : ''}> Wide/repeating background preview</label>
        `, 'basics')}

        ${card('elements', 'Elements', `
          <div class="button-row">
            <button class="btn" id="addElementBtn" type="button">Add Element</button>
            <button class="btn" id="addLayerBtn" type="button">Add Layer</button>
            <button class="btn ${highlightEnabled ? 'active-soft' : ''}" id="toggleHighlightBtn" type="button">🖍 Highlight ${highlightEnabled ? 'On' : 'Off'}</button>
          </div>
          <div class="item-list">
            ${elementCollections().map((entry) => `
              <button class="btn item-row ${entry.id === selectedId ? 'is-selected' : ''}" data-select-kind="${entry.kind}" data-select-id="${esc(entry.id)}" type="button">
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

  function field(label, id, value, type = 'text') {
    return `
      <div class="field">
        <label for="${id}">${label}</label>
        <input id="${id}" type="${type}" value="${esc(value)}">
      </div>
    `;
  }

  function pathField(label, id, value, target) {
    return `
      <div class="field path-field" data-path-target="${target}">
        <label for="${id}">${label}</label>
        <div class="path-row">
          <input id="${id}" type="text" value="${esc(value)}">
          <div class="path-menu">
            <button class="path-menu-toggle" type="button" data-path-menu="${target}" title="Choose image source">📁</button>
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
      ${field('ID', 'item-id', item.id)}
      ${field('Name', 'item-name', item.name || item.label || '')}
      ${field('Type', 'item-type', item.type || '')}
      ${pathField('Image Path', 'item-image', item.image || '', 'selected-image')}
      ${field('Text', 'item-text', item.text || '')}
      <div class="field-row">
        ${field('X %', 'item-x', item.x ?? 10, 'number')}
        ${field('Y %', 'item-y', item.y ?? 10, 'number')}
      </div>
      <div class="field-row">
        ${field('Width %', 'item-width', item.width ?? 10, 'number')}
        ${field('Height %', 'item-height', item.height ?? 10, 'number')}
      </div>
      ${field('Layer', 'item-layer', item.layer ?? item.z ?? 10, 'number')}
      <label class="check-row"><input id="item-visible" type="checkbox" ${item.visible !== false ? 'checked' : ''}> Visible</label>
      <div class="button-row"><button class="btn" id="deleteItemBtn" type="button">Delete Selected</button></div>
      <p class="small">Image paths can be SVG, PNG, JPG, GIF, WebP, or any browser-displayable image path.</p>
    `;
  }

  function renderStage() {
    const bg = backgroundPath();
    const grid = scene.grid || { columns: 16, rows: 9, show: true };
    const gridStyle = `background-size:${100 / (grid.columns || 16)}% ${100 / (grid.rows || 9)}%;`;
    return `
      <section class="stage-wrap" aria-label="Work Area">
        <div class="work-zoom-controls" aria-label="Work Area Zoom Controls">
          <button class="zoom-control" id="zoomInBtn" type="button" title="Zoom in">+</button>
          <button class="zoom-control" id="zoomResetBtn" type="button" title="Reset zoom">o</button>
          <button class="zoom-control" id="zoomOutBtn" type="button" title="Zoom out">-</button>
        </div>
        <div class="stage-scale" style="transform:scale(${stageZoom});">
          <div class="stage ${highlightEnabled ? 'highlight-on' : 'highlight-off'}" id="stage">
            ${bg ? `<div class="stage-bg ${scene.backgroundScroll ? 'repeat' : ''}" style="background-image:url('${esc(resolveAsset(bg))}')"></div>` : ''}
            ${hasScene && grid.show !== false ? `<div class="stage-grid" style="${gridStyle}"></div>` : ''}
            ${hasScene ? elementCollections().sort((a, b) => (a.layer ?? a.z ?? 0) - (b.layer ?? b.z ?? 0)).map(renderStageItem).join('') : renderBlankMessage()}
          </div>
        </div>
      </section>
    `;
  }

  function renderBlankMessage() {
    return `
      <div class="blank-message">
        <div><strong>Blank Scene Editor</strong><span>Import a JSON from hard drive, URL, or templates to begin.</span></div>
      </div>
    `;
  }

  function renderStageItem(item) {
    if (item.visible === false) return '';
    const image = item.image ? `<img src="${esc(resolveAsset(item.image))}" alt="${esc(item.name || item.id)}">` : `<span class="small">${esc(item.text || item.type || item.id)}</span>`;
    return `
      <div class="scene-item ${item.id === selectedId ? 'is-selected' : ''}" data-stage-kind="${item.kind}" data-stage-id="${esc(item.id)}" style="left:${item.x ?? 10}%;top:${item.y ?? 10}%;width:${item.width ?? 10}%;height:${item.height ?? 10}%;z-index:${item.layer ?? item.z ?? 1};">
        ${image}
        <span class="item-label">${esc(item.name || item.label || item.id)}</span>
      </div>
    `;
  }

  function renderTemplateModal() {
    return `
      <div class="modal-backdrop ${templateModalOpen ? 'is-open' : ''}" id="templateModal">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="templateTitle">
          <div class="modal-head">
            <h2 id="templateTitle">Import From Templates</h2>
            <button class="btn" id="closeTemplateModal" type="button">Close</button>
          </div>
          <p class="small">These starter templates use SVG placeholder art. Replace the image paths with real project assets later.</p>
          <div class="template-list">
            ${templateItems.length ? templateItems.map((item) => `
              <button class="template-card" data-template-file="${esc(item.file)}" type="button">
                <strong>${esc(item.label || item.id)}</strong>
                <span>${esc(item.type || '')} · ${esc(item.file || '')}</span>
                <span>Default save folder: ${esc(item.defaultSaveFolder || '')}</span>
              </button>
            `).join('') : '<p class="small">Template manifest has not been loaded yet.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    document.getElementById('importToggle')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      importOpen = !importOpen;
      rerender();
    });

    document.getElementById('hardDriveInput')?.addEventListener('change', importFromHardDrive);
    document.getElementById('fromUrlBtn')?.addEventListener('click', importFromUrlPrompt);
    document.getElementById('fromTemplatesBtn')?.addEventListener('click', openTemplates);
    document.getElementById('downloadBtn')?.addEventListener('click', downloadJson);
    document.getElementById('clearBtn')?.addEventListener('click', () => {
      scene = blankScene();
      hasScene = false;
      selectedId = '';
      setStatus('Blank editor ready.', 'ok');
      rerender({ preserveScroll: false });
    });

    document.getElementById('closeTemplateModal')?.addEventListener('click', () => {
      templateModalOpen = false;
      rerender();
    });
    document.getElementById('templateModal')?.addEventListener('click', (event) => {
      if (event.target.id === 'templateModal') {
        templateModalOpen = false;
        rerender();
      }
    });

    document.querySelectorAll('[data-template-file]').forEach((button) => {
      button.addEventListener('click', () => loadTemplate(button.dataset.templateFile));
    });

    document.querySelectorAll('[data-select-id]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedKind = button.dataset.selectKind;
        selectedId = button.dataset.selectId;
        rerender();
      });
    });

    document.querySelectorAll('[data-toggle-card]').forEach((button) => {
      button.addEventListener('click', () => {
        collapsedCards[button.dataset.toggleCard] = !collapsedCards[button.dataset.toggleCard];
        rerender();
      });
    });

    document.getElementById('scene-id')?.addEventListener('input', (e) => { scene.id = e.target.value; });
    document.getElementById('scene-name')?.addEventListener('input', (e) => { scene.name = e.target.value; });
    document.getElementById('scene-type')?.addEventListener('input', (e) => { scene.screenType = e.target.value; scene.mode = e.target.value; });
    document.getElementById('scene-bg')?.addEventListener('input', (e) => { setBackgroundPath(e.target.value); updateStageOnly(); });
    document.getElementById('grid-cols')?.addEventListener('change', (e) => { scene.grid.columns = Number(e.target.value) || 16; rerender(); });
    document.getElementById('grid-rows')?.addEventListener('change', (e) => { scene.grid.rows = Number(e.target.value) || 9; rerender(); });
    document.getElementById('gridShow')?.addEventListener('change', (e) => { scene.grid.show = e.target.checked; rerender(); });
    document.getElementById('wideBg')?.addEventListener('change', (e) => { scene.backgroundScroll = e.target.checked; rerender(); });

    document.getElementById('toggleHighlightBtn')?.addEventListener('click', () => {
      highlightEnabled = !highlightEnabled;
      rerender();
    });

    document.getElementById('zoomInBtn')?.addEventListener('click', () => setZoom(stageZoom + 0.1));
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => setZoom(stageZoom - 0.1));
    document.getElementById('zoomResetBtn')?.addEventListener('click', () => setZoom(1));

    bindPathMenus();
    bindSelectedInputs();
    document.getElementById('addElementBtn')?.addEventListener('click', addElement);
    document.getElementById('addLayerBtn')?.addEventListener('click', addLayer);
    document.getElementById('deleteItemBtn')?.addEventListener('click', deleteSelected);
    bindStageDrag();
  }

  function bindPathMenus() {
    document.querySelectorAll('[data-path-menu]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        document.querySelectorAll('.path-menu').forEach((menu) => {
          if (menu !== button.closest('.path-menu')) menu.classList.remove('is-open');
        });
        button.closest('.path-menu')?.classList.toggle('is-open');
      });
    });

    document.querySelectorAll('[data-path-online]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.dataset.pathOnline;
        const value = prompt('Paste an image URL or project path:');
        if (!value) return;
        applyPathValue(target, value);
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
    updateStageOnly();
  }

  function bindSelectedInputs() {
    const item = selectedItem();
    if (!item) return;
    const bindings = [
      ['item-id', 'id', 'text'],
      ['item-name', 'name', 'text'],
      ['item-type', 'type', 'text'],
      ['item-image', 'image', 'text'],
      ['item-text', 'text', 'text'],
      ['item-x', 'x', 'number'],
      ['item-y', 'y', 'number'],
      ['item-width', 'width', 'number'],
      ['item-height', 'height', 'number'],
      ['item-layer', 'layer', 'number']
    ];

    bindings.forEach(([id, key, type]) => {
      document.getElementById(id)?.addEventListener('input', (event) => {
        const value = type === 'number' ? Number(event.target.value) : event.target.value;
        item[key] = value;
        if (key === 'id') selectedId = value;
        updateStageOnly();
      });
    });

    document.getElementById('item-visible')?.addEventListener('change', (event) => {
      item.visible = event.target.checked;
      rerender();
    });
  }

  function updateStageOnly() {
    const wrap = document.querySelector('.stage-wrap');
    if (wrap) {
      wrap.outerHTML = renderStage();
      bindStageDrag();
      document.getElementById('zoomInBtn')?.addEventListener('click', () => setZoom(stageZoom + 0.1));
      document.getElementById('zoomOutBtn')?.addEventListener('click', () => setZoom(stageZoom - 0.1));
      document.getElementById('zoomResetBtn')?.addEventListener('click', () => setZoom(1));
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

  function addElement() {
    if (!hasScene) normalizeImported(blankScene(), 'New blank scene');
    const item = {
      id: uid('element'),
      type: 'prop',
      name: 'New Element',
      image: '../../templates/assets/template_red_ball.svg',
      x: 40,
      y: 55,
      width: 10,
      height: 14,
      layer: 10,
      visible: true
    };
    scene.elements.push(item);
    selectedKind = 'element';
    selectedId = item.id;
    rerender();
  }

  function addLayer() {
    if (!hasScene) normalizeImported(blankScene(), 'New blank scene');
    const item = {
      id: uid('layer'),
      type: 'overlay',
      name: 'New Layer',
      image: '../../templates/assets/template_water_strip.svg',
      x: 20,
      y: 70,
      width: 40,
      height: 14,
      layer: 5,
      visible: true
    };
    scene.layers.push(item);
    selectedKind = 'layer';
    selectedId = item.id;
    rerender();
  }

  function deleteSelected() {
    if (!selectedId) return;
    const key = selectedKind === 'layer' ? 'layers' : selectedKind === 'ui' ? 'ui' : 'elements';
    scene[key] = (scene[key] || []).filter((item) => item.id !== selectedId);
    const first = elementCollections()[0];
    selectedKind = first?.kind || 'element';
    selectedId = first?.id || '';
    rerender();
  }

  function bindStageDrag() {
    document.querySelectorAll('[data-stage-id]').forEach((node) => {
      node.addEventListener('pointerdown', (event) => {
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

    document.addEventListener('pointerup', () => {
      if (drag) {
        drag = null;
        rerender();
      }
    }, { once: true });
  }

  document.addEventListener('click', (event) => {
    const menu = document.getElementById('importMenu');
    if (menu && importOpen && !menu.contains(event.target)) {
      importOpen = false;
      rerender();
    }

    if (!event.target.closest?.('.path-menu')) {
      document.querySelectorAll('.path-menu.is-open').forEach((pathMenu) => pathMenu.classList.remove('is-open'));
    }
  });

  render({ preserveScroll: false });
})();
