(() => {
  const VERSION = 'v0.16-transform-core';
  const SETTINGS_KEY = 'artifex.sceneEditor.settings.v1';
  const WORKING_COPY_KEY = 'artifex.sceneEditor.workingCopy.v1';
  const DOWNLOAD_KEY = 'artifex.sceneEditor.lastDownload.v1';
  const app = document.getElementById('editor-app');
  const repoPrefix = location.pathname.includes('/Forever-Bound-Game/') ? '/Forever-Bound-Game/' : '/';
  const brandLogo = '../../artifexlogo.png';
  const brandTitle = '../../artifextitle.png';
  const templateManifest = '../../templates/templates.json';
  const typeOptions = ['prop', 'pickup', 'player_start', 'npc', 'foe', 'door', 'exit', 'overlay', 'background_layer', 'foreground_layer', 'hazard', 'searchable', 'marker', 'effect', 'ui'];

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function safeParse(text, fallback = null) {
    try { return JSON.parse(text); }
    catch { return fallback; }
  }

  const settings = loadSettings();
  let scene = null;
  let fileName = '';
  let templates = [];
  let selectedId = '';
  let selectedKind = 'element';
  let importOpen = false;
  let templateOpen = false;
  let context = null;
  let status = 'No JSON loaded yet.';
  let tip = `${VERSION}: ready.`;
  let defaultZoom = Number(settings.defaultZoom || 1);
  let zoom = Number(settings.zoom || defaultZoom || 1);
  let showHighlight = settings.showHighlight !== false;
  let panelScroll = 0;
  let drag = null;
  let saveTimer = null;
  let lastWorkingCopySnapshot = '';
  const collapsed = { json: true, ...(settings.collapsedCards || {}) };
  document.body.dataset.artifexCoreMoveDrag = 'true';

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        defaultZoom,
        zoom,
        showHighlight,
        collapsedCards: collapsed
      }));
    } catch {
      // localStorage can fail in private or blocked contexts. The editor still works without persistence.
    }
  }

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function uid(p) { return `${p}_${Math.random().toString(36).slice(2, 8)}`; }
  function toast(msg) {
    document.querySelector('.artifex-toast')?.remove();
    const n = document.createElement('div');
    n.className = 'artifex-toast';
    n.textContent = `${VERSION}: ${msg}`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2600);
  }
  function assetPath(path) {
    if (!path) return '';
    if (/^(https?:|data:|blob:|\/|\.\.\/)/i.test(path)) return path;
    return repoPrefix + path.replace(/^\.\//, '');
  }
  function blankScene() {
    return { id: '', name: 'Untitled Scene', mode: 'blank', screenType: 'blank', background: '', backgroundScroll: false, grid: { columns: 16, rows: 9, show: true }, layers: [], elements: [], ui: [], audio: {} };
  }
  function key(kind) { return kind === 'layer' ? 'layers' : kind === 'ui' ? 'ui' : 'elements'; }
  function allItems() {
    if (!scene) return [];
    return [
      ...(scene.layers || []).map(i => ({ ...i, kind: 'layer' })),
      ...(scene.elements || []).map(i => ({ ...i, kind: 'element' })),
      ...(scene.ui || []).map(i => ({ ...i, kind: 'ui' }))
    ];
  }
  function real(kind = selectedKind, id = selectedId) {
    if (!scene) return null;
    return (scene[key(kind)] || []).find(i => i.id === id) || null;
  }
  function bgPath() {
    if (!scene) return '';
    if (typeof scene.background === 'string') return scene.background;
    if (scene.background && typeof scene.background === 'object') return scene.background.image || scene.background.backgroundImage || '';
    return scene.theme?.backgroundImage || '';
  }
  function setBgPath(v) {
    if (!scene) return;
    if (scene.theme && scene.screenType === 'static') scene.theme.backgroundImage = v;
    else scene.background = v;
  }
  function dateText(iso) {
    if (!iso) return 'Not recorded';
    try { return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return String(iso); }
  }
  function readWorkingCopy() {
    return safeParse(localStorage.getItem(WORKING_COPY_KEY), null);
  }
  function readDownloadStamp() {
    return safeParse(localStorage.getItem(DOWNLOAD_KEY), null);
  }
  function saveWorkingCopy(reason = 'autosave') {
    if (!scene) return;
    const payload = {
      fileName: fileName || scene.id || scene.name || 'Untitled JSON',
      scene: structuredClone(scene),
      selectedKind,
      selectedId,
      savedAt: new Date().toISOString(),
      reason
    };
    const snapshot = JSON.stringify({ ...payload, savedAt: '' });
    if (snapshot === lastWorkingCopySnapshot && reason !== 'download') return;
    lastWorkingCopySnapshot = snapshot;
    try { localStorage.setItem(WORKING_COPY_KEY, JSON.stringify(payload)); }
    catch { /* localStorage can fail; editor still works without resume. */ }
  }
  function saveWorkingCopySoon(reason = 'edit') {
    if (!scene) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveWorkingCopy(reason), 80);
  }
  function markDownloaded() {
    if (!scene) return;
    const payload = {
      fileName: fileName || scene.id || scene.name || 'Untitled JSON',
      downloadedAt: new Date().toISOString()
    };
    try { localStorage.setItem(DOWNLOAD_KEY, JSON.stringify(payload)); }
    catch { /* ignore */ }
    saveWorkingCopy('download');
  }
  function filePill() {
    const working = readWorkingCopy();
    const downloaded = readDownloadStamp();
    return `<div class="file-pill"><span class="file-pill-name">${esc(fileName || 'Untitled JSON')}</span><span class="file-pill-meta">Local backup: ${esc(dateText(working?.savedAt))}</span><span class="file-pill-meta">Last downloaded: ${esc(dateText(downloaded?.downloadedAt))}</span></div>`;
  }
  function resumeMarkup() {
    const working = readWorkingCopy();
    if (!working?.scene) return `<span>Import a JSON from hard drive, URL, or templates to begin.</span><div class="artifex-version-marker">${VERSION} input-stability build</div>`;
    const downloaded = readDownloadStamp();
    return `<div class="resume-card-inline"><h3>Start where you left off?</h3><p>You were last working on:</p><strong>${esc(working.fileName || working.scene.id || 'Untitled JSON')}</strong><p>Last local backup: ${esc(dateText(working.savedAt))}</p><p>Last downloaded: ${esc(dateText(downloaded?.downloadedAt))}</p><div class="resume-actions"><button class="btn" id="openLocalBackup" type="button">Open local backup</button><button class="btn" id="ignoreLocalBackup" type="button">Ignore</button></div></div>`;
  }
  function openLocalBackup() {
    const working = readWorkingCopy();
    if (!working?.scene) { toast('No local backup found'); return; }
    normalize(working.scene, working.fileName || working.scene.id || 'Local backup');
    selectedKind = working.selectedKind || selectedKind;
    selectedId = working.selectedId || selectedId;
    status = `${fileName} restored from local backup.`;
    toast(status);
    render(false);
  }
  function normalize(raw, label) {
    scene = structuredClone(raw || blankScene());
    scene.id ||= uid('scene');
    scene.name ||= scene.title || label || 'Untitled Scene';
    scene.screenType ||= scene.mode || 'scene';
    scene.mode ||= scene.screenType;
    scene.grid ||= { columns: 16, rows: 9, show: true };
    scene.grid.columns = Number(scene.grid.columns || 16);
    scene.grid.rows = Number(scene.grid.rows || 9);
    scene.grid.show = scene.grid.show !== false;
    scene.layers = Array.isArray(scene.layers) ? scene.layers : [];
    scene.elements = Array.isArray(scene.elements) ? scene.elements : [];
    scene.ui = Array.isArray(scene.ui) ? scene.ui : [];
    fileName = label || scene.id || 'Untitled JSON';
    const first = allItems().sort((a,b) => Number(b.layer || 0) - Number(a.layer || 0))[0];
    selectedKind = first?.kind || 'element';
    selectedId = first?.id || '';
    status = `${fileName} loaded.`;
    toast(status);
    saveWorkingCopy('loaded');
  }
  function saveScroll() { const p = document.querySelector('.side-panel'); if (p) panelScroll = p.scrollTop; }
  function restoreScroll() { requestAnimationFrame(() => { const p = document.querySelector('.side-panel'); if (p) p.scrollTop = panelScroll; }); }
  function stageNodeFor(id) {
    return Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find(node => node.dataset.stageId === id) || null;
  }
  function syncSelectedInputs(item) {
    const x = document.getElementById('itemX');
    const y = document.getElementById('itemY');
    if (x) x.value = item.x ?? 0;
    if (y) y.value = item.y ?? 0;
  }
  function startCoreMoveDrag(event, node) {
    if (event.button === 2) return;
    selectedKind = node.dataset.stageKind || 'element';
    selectedId = node.dataset.stageId || '';
    const item = real();
    if (!item) return;
    context = null;
    drag = { item, id: selectedId, kind: selectedKind, pointerId: event.pointerId };
    document.body.classList.add('is-handle-moving', 'v13e-centre-dragging');
    document.querySelectorAll('.scene-item.is-selected').forEach(selected => selected.classList.remove('is-selected'));
    document.querySelectorAll('.move-handle.is-dragging, .scene-item.is-handle-moving').forEach(active => active.classList.remove('is-dragging', 'is-handle-moving'));
    node.classList.add('is-selected', 'is-handle-moving');
    event.target.closest?.('.move-handle')?.classList.add('is-dragging');
    try { node.setPointerCapture?.(event.pointerId); } catch {}
    updateCoreMoveDrag(event);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
  function updateCoreMoveDrag(event) {
    if (!drag?.item) return;
    const stage = document.getElementById('stage');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const width = Number(drag.item.width || 0);
    const height = Number(drag.item.height || 0);
    const nextX = clamp(((event.clientX - rect.left) / rect.width) * 100 - width / 2, 0, 100);
    const nextY = clamp(((event.clientY - rect.top) / rect.height) * 100 - height / 2, 0, 100);
    drag.item.x = Number(nextX.toFixed(3));
    drag.item.y = Number(nextY.toFixed(3));
    const node = stageNodeFor(drag.id);
    if (node) {
      node.style.left = `${drag.item.x}%`;
      node.style.top = `${drag.item.y}%`;
    }
    syncSelectedInputs(drag.item);
    saveWorkingCopySoon('drag');
  }
  function endCoreMoveDrag(event, shouldRender = true) {
    if (!drag) return;
    const active = drag;
    const node = stageNodeFor(active.id);
    try { node?.releasePointerCapture?.(active.pointerId); } catch {}
    drag = null;
    document.body.classList.remove('is-handle-moving', 'v13e-centre-dragging');
    document.querySelectorAll('.move-handle.is-dragging, .scene-item.is-handle-moving').forEach(activeNode => activeNode.classList.remove('is-dragging', 'is-handle-moving'));
    saveWorkingCopySoon('drag');
    if (shouldRender) render();
  }
  function wireCoreMoveDrag() {
    if (document.body.dataset.artifexCoreMoveEvents === 'true') return;
    document.body.dataset.artifexCoreMoveEvents = 'true';
    document.addEventListener('pointerdown', event => {
      const handle = event.target.closest?.('.move-handle');
      const node = handle?.closest?.('.scene-item[data-stage-id]');
      if (handle && node) startCoreMoveDrag(event, node);
    }, true);
    document.addEventListener('pointermove', event => {
      if (!drag) return;
      updateCoreMoveDrag(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);
    document.addEventListener('pointerup', event => endCoreMoveDrag(event), true);
    document.addEventListener('pointercancel', event => endCoreMoveDrag(event), true);
    document.addEventListener('mouseleave', event => {
      if (event.target === document || event.target === document.documentElement) endCoreMoveDrag(event);
    }, true);
    window.addEventListener('blur', () => endCoreMoveDrag(null));
  }
  function render(keepScroll = true) {
    if (keepScroll) saveScroll();
    app.innerHTML = `<div class="editor-shell">${titleBar()}<main class="main-layout">${controlPanel()}${workArea()}</main></div>${templateModal()}${contextMenu()}<input class="hidden-file" id="imageFile" type="file" accept="image/*,.svg,.webp,.gif,.png,.jpg,.jpeg">`;
    bind();
    if (keepScroll) restoreScroll();
    saveWorkingCopySoon('render');
  }
  function renderWorkAreaOnly() {
    const wrap = document.querySelector('.stage-wrap');
    if (!wrap) return;
    wrap.outerHTML = workArea();
    bindStage();
    bindZoomControls();
    saveWorkingCopySoon('work-area');
  }
  function titleBar() {
    return `<header class="top-bar"><div class="brand" data-tip="Artifex Scene Editor"><img class="brand-logo" src="${brandLogo}" alt="Artifex logo"><img class="brand-title" src="${brandTitle}" alt="Artifex"></div><span class="title-divider"></span><div class="import-menu ${importOpen ? 'is-open' : ''}" id="importMenu"><button class="import-button" id="importBtn" type="button" data-tip="Import JSON from hard drive, URL, or template.">Import ▾</button><div class="import-dropdown"><label class="file-button">From hard drive<input class="hidden-file" id="jsonFile" type="file" accept=".json,application/json"></label><button class="btn" id="importUrl" type="button">From URL</button><button class="btn" id="importTemplate" type="button">From templates</button></div></div><button class="btn" id="downloadJson" type="button" data-tip="Download the current JSON.">Download JSON</button><button class="btn" id="blankBtn" type="button" data-tip="Clear to blank editor.">Blank Screen</button><span class="tooltip-status" id="hoverStatus">${esc(tip)}</span><span class="status ok">${esc(status)}</span><span class="top-spacer"></span><a class="btn" href="../../">Portal</a></header>`;
  }
  function card(id, title, body, tone = '') {
    const isCollapsed = collapsed[id];
    return `<section class="panel-card ${tone ? `card-${tone}` : ''} ${isCollapsed ? 'is-collapsed' : ''}" data-card-id="${id}"><h2><span>${esc(title)}</span><button class="card-toggle" type="button" data-card-toggle="${id}">↕</button></h2><div class="card-body">${isCollapsed ? '' : body}</div></section>`;
  }
  function controlPanel() {
    if (!scene) return `<aside class="side-panel"><div class="file-pill">No file loaded</div>${card('blank','No Scene Loaded',`<p class="small">Use Import to load a JSON from hard drive, URL, or templates.</p>`, 'basics')}</aside>`;
    const item = real();
    return `<aside class="side-panel">${filePill()}${card('basics','Scene Basics', basics(), 'basics')}${card('elements','Elements', elements(), 'elements')}${card('selected', item ? (item.name || item.id || 'Selected Item') : 'Selected Item', item ? selectedForm(item) : '<p class="small">Select an object.</p>', 'selected')}${card('json','JSON Preview',`<pre class="json-preview">${esc(JSON.stringify(scene,null,2))}</pre>`, 'json')}</aside>`;
  }
  function input(label, id, value, type = 'text') { return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}"></div>`; }
  function typeSelect(value) {
    const normalized = String(value || 'prop');
    const options = typeOptions.includes(normalized) ? typeOptions : [normalized, ...typeOptions];
    return `<div class="field"><label for="itemType">Type</label><select id="itemType">${options.map(type => `<option value="${esc(type)}" ${type === normalized ? 'selected' : ''}>${esc(type)}</option>`).join('')}</select></div>`;
  }
  function pathInput(label, id, value, target) { return `<div class="field path-field"><label for="${id}">${label}</label><div class="path-row"><input id="${id}" type="text" value="${esc(value)}"><div class="path-menu"><button class="path-menu-toggle" data-path-menu="${target}" type="button">📁</button><div class="path-dropdown"><button type="button" data-online="${target}">Online</button><button type="button" data-hdd="${target}">HDD</button></div></div></div></div>`; }
  function basics() { return `${input('Scene ID','sceneId',scene.id)}${input('Scene Name','sceneName',scene.name)}${input('Screen Type','sceneType',scene.screenType || scene.mode)}${pathInput('Background Image Path','sceneBg',bgPath(),'background')}<div class="field-row">${input('Grid Columns','gridCols',scene.grid.columns,'number')}${input('Grid Rows','gridRows',scene.grid.rows,'number')}</div><label class="check-row"><input id="gridShow" type="checkbox" ${scene.grid.show !== false ? 'checked' : ''}> Show grid</label>`; }
  function elements() {
    const item = real();
    return `<div class="button-row compact-actions layer-control-row"><label class="layer-pill">Layer <input id="layerPill" type="number" value="${esc(item?.layer ?? item?.z ?? 0)}"></label></div><div class="item-list">${allItems().sort((a,b)=>Number(b.layer||0)-Number(a.layer||0)).map((it,idx)=>`<button class="btn item-row ${it.id===selectedId?'is-selected':''}" data-select-kind="${it.kind}" data-select-id="${esc(it.id)}" type="button">${idx+1}. z${it.layer ?? it.z ?? 0} · ${esc(it.name || it.id)} · ${esc(it.type || it.kind)}</button>`).join('') || '<p class="small">No elements.</p>'}</div>`;
  }
  function selectedForm(item) {
    item.tags = Array.isArray(item.tags) ? item.tags : [];
    return `${input('ID','itemId',item.id)}${input('Name','itemName',item.name || item.label || '')}${typeSelect(item.type || '')}${pathInput('Image Path','itemImage',item.image || '','item')}${input('Text','itemText',item.text || '')}<div class="field-row">${input('X Axis','itemX',item.x ?? 10,'number')}${input('Y Axis','itemY',item.y ?? 10,'number')}</div><div class="field-row">${input('Width','itemW',item.width ?? 10,'number')}${input('Height','itemH',item.height ?? 10,'number')}</div><div class="field-row">${input('Layer','itemLayer',item.layer ?? item.z ?? 10,'number')}<div class="field"><label>Z / Depth <span class="range-value" id="zVal">${esc(item.zDepth ?? 0)}</span></label><input id="itemZ" type="range" min="-20" max="20" step="1" value="${esc(item.zDepth ?? 0)}"></div></div><label class="check-row"><input id="itemVisible" type="checkbox" ${item.visible !== false ? 'checked' : ''}> Visible</label>${input('Tags','itemTags',item.tags.join(', '))}<div class="button-row"><button class="btn" id="deleteItem" type="button">Delete Selected</button></div>`;
  }
  function workArea() {
    const bg = bgPath();
    const cols = Number(scene?.grid?.columns || 16);
    const rows = Number(scene?.grid?.rows || 9);
    const gridStyle = `--fine-x:${100/(cols*2)}%;--fine-y:${100/(rows*2)}%;--major-x:${500/cols}%;--major-y:${500/rows}%;`;
    return `<section class="stage-wrap"><div class="work-zoom-controls"><button class="zoom-control" id="zoomIn" type="button">+</button><button class="zoom-control" id="zoomReset" type="button">o</button><button class="zoom-control" id="zoomOut" type="button">-</button></div><div class="stage-scale" style="transform:scale(${zoom})"><div class="stage ${showHighlight ? 'highlight-on' : 'highlight-off'}" id="stage">${bg ? `<div class="stage-bg" style="background-image:url('${esc(assetPath(bg))}')"></div>` : ''}${scene?.grid?.show !== false ? `<div class="stage-grid" style="${gridStyle}"></div>${gridLabels(cols, rows)}` : ''}${scene ? allItems().sort((a,b)=>Number(a.layer||0)-Number(b.layer||0)).map(stageItem).join('') : blankMessage()}</div></div></section>`;
  }
  function blankMessage() { return `<div class="blank-message"><div><strong>Blank Scene Editor</strong>${resumeMarkup()}</div></div>`; }
  function letters(i) { let n=i+1, s=''; while(n>0){ const r=(n-1)%26; s=String.fromCharCode(65+r)+s; n=Math.floor((n-1)/26);} return s; }
  function gridLabels(cols, rows) { return `<div class="grid-labels">${Array.from({length:cols},(_,i)=>`<span class="grid-col-label" style="left:${((i+.5)/cols)*100}%">${i+1}</span>`).join('')}${Array.from({length:rows},(_,i)=>`<span class="grid-row-label" style="top:${((i+.5)/rows)*100}%">${letters(i)}</span>`).join('')}<span class="axis-label axis-x">X</span><span class="axis-label axis-z">Z</span></div>`; }
  function stageItem(item) {
    if (item.visible === false) return '';
    const zd = Number(item.zDepth || 0), scale = clamp(1 + zd * .035, .45, 2.15);
    const img = item.image ? `<img src="${esc(assetPath(item.image))}" alt="${esc(item.name || item.id)}">` : `<span class="small">${esc(item.text || item.type || item.id)}</span>`;
    return `<div class="scene-item ${item.id===selectedId?'is-selected':''}" data-stage-id="${esc(item.id)}" data-stage-kind="${item.kind}" style="left:${item.x ?? 10}%;top:${item.y ?? 10}%;width:${item.width ?? 10}%;height:${item.height ?? 10}%;z-index:${item.layer ?? item.z ?? 1};transform:scale(${scale});">${img}<button class="move-handle" type="button" title="Drag here to move this object" aria-label="Move object"></button><span class="item-label">${esc(item.name || item.id)}</span></div>`;
  }
  function templateModal() { return `<div class="modal-backdrop ${templateOpen ? 'is-open' : ''}" id="templateModal"><div class="modal"><div class="modal-head"><h2>Import From Templates</h2><button class="btn" id="closeTemplates" type="button">Close</button></div><div class="template-list">${templates.map(t=>`<button class="template-card" data-template-file="${esc(t.file)}" type="button"><strong>${esc(t.label || t.id)}</strong><span>${esc(t.type || '')} · ${esc(t.file || '')}</span><span>${esc(t.defaultSaveFolder || '')}</span></button>`).join('') || '<p class="small">Template manifest has not loaded.</p>'}</div></div></div>`; }
  function contextMenu() {
    if (!context) return '';
    if (context.type === 'zoom') return `<div class="context-menu" style="left:${context.x}px;top:${context.y}px"><button data-action="setZoomDefault">Set default zoom</button></div>`;
    const item = real(context.kind, context.id);
    if (!item) return '';
    return `<div class="context-menu" style="left:${context.x}px;top:${context.y}px"><div class="context-menu-head"><strong>${esc(item.name || item.id)}</strong><span>${esc(item.type || context.kind)}</span></div><button data-action="zoomObject">Zoom to object</button><button data-action="props">Properties</button><button data-action="duplicate">Duplicate</button><button data-action="remove">Delete</button></div>`;
  }
  function bind() {
    document.querySelectorAll('[data-tip]').forEach(n=>n.addEventListener('mouseenter',()=>{tip=n.dataset.tip; document.getElementById('hoverStatus').textContent=tip;}));
    document.getElementById('openLocalBackup')?.addEventListener('click', openLocalBackup);
    document.getElementById('ignoreLocalBackup')?.addEventListener('click', e=>{ e.currentTarget.closest('.resume-card-inline')?.remove(); toast('Local backup ignored'); });
    document.getElementById('importBtn')?.addEventListener('click', e=>{ e.stopPropagation(); importOpen=!importOpen; render(); });
    document.getElementById('jsonFile')?.addEventListener('change', importFile);
    document.getElementById('importUrl')?.addEventListener('click', importUrl);
    document.getElementById('importTemplate')?.addEventListener('click', openTemplates);
    document.getElementById('closeTemplates')?.addEventListener('click', ()=>{templateOpen=false; render();});
    document.querySelectorAll('[data-template-file]').forEach(b=>b.addEventListener('click',()=>loadTemplate(b.dataset.templateFile)));
    document.getElementById('downloadJson')?.addEventListener('click', download);
    document.getElementById('blankBtn')?.addEventListener('click', ()=>{scene=null; fileName=''; selectedId=''; status='Blank editor ready.'; toast(status); render(false);});
    document.querySelectorAll('[data-card-toggle]').forEach(b=>b.addEventListener('click',()=>{collapsed[b.dataset.cardToggle]=!collapsed[b.dataset.cardToggle]; saveSettings(); render();}));
    document.querySelectorAll('[data-select-id]').forEach(b=>b.addEventListener('click',()=>{selectedKind=b.dataset.selectKind; selectedId=b.dataset.selectId; render();}));
    bindZoomControls();
    document.getElementById('addElement')?.addEventListener('click', addElement);
    document.getElementById('addLayer')?.addEventListener('click', addLayer);
    document.getElementById('highlightBtn')?.addEventListener('click',()=>{showHighlight=!showHighlight; saveSettings(); render();});
    document.getElementById('deleteItem')?.addEventListener('click', removeSelected);
    document.getElementById('layerPill')?.addEventListener('change', e=>{const i=real(); if(i){i.layer=Number(e.target.value)||0; render();}});
    bindSceneFields(); bindPathButtons(); bindContextActions(); bindStage();
  }
  function bindZoomControls() {
    document.getElementById('zoomIn')?.addEventListener('click',()=>setZoom(zoom+.1));
    document.getElementById('zoomOut')?.addEventListener('click',()=>setZoom(zoom-.1));
    document.getElementById('zoomReset')?.addEventListener('click',()=>setZoom(defaultZoom));
  }
  function bindSceneFields() {
    if (!scene) return;
    const map = [['sceneId','id'],['sceneName','name'],['sceneType','screenType']];
    map.forEach(([id,k])=>document.getElementById(id)?.addEventListener('input',e=>{scene[k]=e.target.value; if(k==='screenType') scene.mode=e.target.value; saveWorkingCopySoon('scene field');}));
    document.getElementById('sceneBg')?.addEventListener('change', e=>{setBgPath(e.target.value); saveWorkingCopySoon('background'); render();});
    document.getElementById('gridCols')?.addEventListener('change', e=>{scene.grid.columns=Number(e.target.value)||16; saveWorkingCopySoon('grid'); render();});
    document.getElementById('gridRows')?.addEventListener('change', e=>{scene.grid.rows=Number(e.target.value)||9; saveWorkingCopySoon('grid'); render();});
    document.getElementById('gridShow')?.addEventListener('change', e=>{scene.grid.show=e.target.checked; saveWorkingCopySoon('grid'); render();});
    const it = real(); if (!it) return;

    [['itemId','id','s'],['itemName','name','s'],['itemImage','image','s'],['itemText','text','s']].forEach(([id,k])=>{
      const inputNode = document.getElementById(id);
      inputNode?.addEventListener('input',e=>{
        it[k]=e.target.value;
        if(k==='id') selectedId=it.id;
        if(k==='name') {
          const label = document.querySelector(`.scene-item.is-selected .item-label`);
          if (label) label.textContent = e.target.value || it.id;
        }
        saveWorkingCopySoon('item field');
      });
      inputNode?.addEventListener('blur',()=>render());
    });

    document.getElementById('itemType')?.addEventListener('change', e=>{it.type=e.target.value; saveWorkingCopySoon('type'); render();});

    [['itemX','x'],['itemY','y'],['itemW','width'],['itemH','height'],['itemZ','zDepth']].forEach(([id,k])=>{
      document.getElementById(id)?.addEventListener('input',e=>{
        it[k]=Number(e.target.value);
        if(k==='zDepth') {
          const zVal = document.getElementById('zVal');
          if (zVal) zVal.textContent = e.target.value;
        }
        renderWorkAreaOnly();
      });
    });

    document.getElementById('itemLayer')?.addEventListener('change', e=>{it.layer=Number(e.target.value)||0; saveWorkingCopySoon('layer'); render();});
    document.getElementById('itemVisible')?.addEventListener('change', e=>{it.visible=e.target.checked; saveWorkingCopySoon('visibility'); render();});
    document.getElementById('itemTags')?.addEventListener('input', e=>{it.tags=e.target.value.split(',').map(t=>t.trim()).filter(Boolean); saveWorkingCopySoon('tags');});
  }
  function bindPathButtons() {
    document.querySelectorAll('[data-path-menu]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation(); b.closest('.path-menu').classList.toggle('is-open');}));
    document.querySelectorAll('[data-online]').forEach(b=>b.addEventListener('click',()=>{const v=prompt('Paste image URL or project path:'); if(!v)return; applyPath(b.dataset.online,v);}));
    document.querySelectorAll('[data-hdd]').forEach(b=>b.addEventListener('click',()=>{const input=document.getElementById('imageFile'); input.dataset.target=b.dataset.hdd; input.value=''; input.click();}));
    document.getElementById('imageFile')?.addEventListener('change',e=>{const f=e.target.files?.[0]; if(!f)return; applyPath(e.target.dataset.target, URL.createObjectURL(f)); toast(`Preview image loaded: ${f.name}`);});
  }
  function bindContextActions() { document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action))); }
  function bindStage() {
    document.querySelectorAll('[data-stage-id]').forEach(n=>{
      n.addEventListener('pointerdown', e=>{
        if(e.button===2)return;
        if(e.target.closest?.('.move-handle')) return;
        endCoreMoveDrag(e, false);
        selectedKind=n.dataset.stageKind;
        selectedId=n.dataset.stageId;
        render();
      });
      n.addEventListener('contextmenu', e=>{ e.preventDefault(); e.stopPropagation(); selectedKind=n.dataset.stageKind; selectedId=n.dataset.stageId; context={type:'object', kind:selectedKind, id:selectedId, x:e.clientX, y:e.clientY}; render(); });
    });
    document.getElementById('zoomReset')?.addEventListener('contextmenu', e=>{ e.preventDefault(); e.stopPropagation(); context={type:'zoom', x:e.clientX, y:e.clientY}; render(); });
  }
  function zoomSelectedObject() {
    const id = selectedId;
    const nextZoom = clamp(zoom * 2, .4, 2.2);
    context = null;
    setZoom(nextZoom);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const node = Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find(n => n.dataset.stageId === id);
      node?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
      toast(`Zoomed to object: ${Math.round(nextZoom * 100)}%`);
    }));
  }
  function action(a) {
    if (a === 'setZoomDefault') { defaultZoom = zoom; context=null; saveSettings(); toast(`Default zoom saved: ${Math.round(defaultZoom*100)}%`); render(); return; }
    if (a === 'zoomObject') { zoomSelectedObject(); return; }
    if (a === 'props') { collapsed.selected=false; context=null; saveSettings(); render(); requestAnimationFrame(()=>document.querySelector('[data-card-id="selected"]')?.scrollIntoView({block:'start'})); return; }
    if (a === 'duplicate') duplicateSelected();
    if (a === 'remove') removeSelected();
  }
  function applyPath(target, value) { if(target==='background'){setBgPath(value);} else {const i=real(); if(i)i.image=value;} saveWorkingCopySoon('path'); render(); }
  function setZoom(v) { zoom=clamp(Number(v)||1,.4,2.2); tip=`Zoom ${Math.round(zoom*100)}%`; saveSettings(); render(); }
  async function importFile(e) { const f=e.target.files?.[0]; if(!f)return; toast(`Loading local JSON file: ${f.name}...`); try{normalize(JSON.parse(await f.text()), f.name); render(false);}catch(err){status=`Import failed: ${err.message}`; toast(status); render();} }
  async function importUrl() { const url=prompt('Paste JSON URL:'); if(!url)return; toast('Loading URL JSON...'); try{const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error(r.status); normalize(await r.json(), url.split('/').pop()||'URL JSON'); render(false);}catch(err){status=`URL import failed: ${err.message}`; toast(status); render();} }
  async function openTemplates() { try{toast('Loading template list...'); const r=await fetch(templateManifest,{cache:'no-store'}); if(!r.ok)throw new Error(r.status); templates=(await r.json()).templates||[]; templateOpen=true; importOpen=false; render();}catch(err){status=`Template list failed: ${err.message}`; toast(status); render();} }
  async function loadTemplate(file) { try{toast(`Loading template: ${file}...`); const r=await fetch(`../../templates/${file}`,{cache:'no-store'}); if(!r.ok)throw new Error(r.status); normalize(await r.json(), file); templateOpen=false; render(false);}catch(err){status=`Template import failed: ${err.message}`; toast(status); render();} }
  function download() { if(!scene){toast('Nothing to download'); return;} const blob=new Blob([JSON.stringify(scene,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${scene.id||'artifex_scene'}.json`; a.click(); URL.revokeObjectURL(url); markDownloaded(); toast('JSON downloaded'); render(); }
  function addElement() { if(!scene) normalize(blankScene(),'New blank scene'); const i={id:uid('element'),type:'prop',name:'New Element',image:'../../templates/assets/template_red_ball.svg',x:40,y:55,width:10,height:14,layer:10,zDepth:0,visible:true,tags:[],rotation:0,rotationOrigin:'centre'}; scene.elements.push(i); selectedKind='element'; selectedId=i.id; toast('Element added'); saveWorkingCopySoon('add element'); render(); }
  function addLayer() { if(!scene) normalize(blankScene(),'New blank scene'); const i={id:uid('layer'),type:'overlay',name:'New Layer',image:'../../templates/assets/template_water_strip.svg',x:20,y:70,width:40,height:14,layer:5,zDepth:0,visible:true,tags:[],rotation:0,rotationOrigin:'centre'}; scene.layers.push(i); selectedKind='layer'; selectedId=i.id; toast('Layer added'); saveWorkingCopySoon('add layer'); render(); }
  function duplicateSelected() { const i=real(); if(!i)return; const c=structuredClone(i); c.id=`${i.id||'item'}_copy_${Math.random().toString(36).slice(2,5)}`; c.name=`${i.name||i.id||'Item'} Copy`; c.x=clamp(Number(i.x||0)+3,0,100); c.y=clamp(Number(i.y||0)+3,0,100); c.layer=Number(i.layer||0)+1; scene[key(selectedKind)].push(c); selectedId=c.id; context=null; toast('Object duplicated'); saveWorkingCopySoon('duplicate'); render(); }
  function removeSelected() { if(!selectedId)return; scene[key(selectedKind)]=(scene[key(selectedKind)]||[]).filter(i=>i.id!==selectedId); const first=allItems()[0]; selectedKind=first?.kind||'element'; selectedId=first?.id||''; context=null; toast('Object deleted'); saveWorkingCopySoon('delete'); render(); }
  window.ArtifexSceneEditorCore = {
    getScene: () => scene,
    getSelectedId: () => selectedId,
    getSelectedKind: () => selectedKind,
    getSelectedItem: () => real(),
    getAllItems: () => allItems(),
    select: (kind, id) => { selectedKind = kind || 'element'; selectedId = id || ''; render(); },
    render,
    renderWorkAreaOnly,
    saveWorkingCopy,
    saveWorkingCopySoon,
    clamp,
    toast
  };
  wireCoreMoveDrag();
  document.addEventListener('pointerup',e=>endCoreMoveDrag(e));
  document.addEventListener('input', () => saveWorkingCopySoon('input'), true);
  document.addEventListener('change', () => saveWorkingCopySoon('change'), true);
  document.addEventListener('click',e=>{ if(importOpen && !e.target.closest('#importMenu')){importOpen=false; render();} if(context && !e.target.closest('.context-menu') && !e.target.closest('.scene-item') && !e.target.closest('#zoomReset')){context=null; render();} saveWorkingCopySoon('click'); });
  window.addEventListener('load',()=>toast('Scene Editor loaded'));
  render(false);
})();
