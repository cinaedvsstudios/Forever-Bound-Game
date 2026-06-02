(() => {
  'use strict';

  const config = window.ArtifexSceneEditorConfig || {};
  const storage = window.ArtifexSceneEditorStorage;
  const model = window.ArtifexSceneEditorSceneModel;
  const io = window.ArtifexSceneEditorIO;
  const rendererModule = window.ArtifexSceneEditorRenderer;
  const bindings = window.ArtifexSceneEditorBindings;
  const stageDragModule = window.ArtifexSceneEditorStageDrag;
  const coreApi = window.ArtifexSceneEditorCoreApi;

  function createSceneEditorApp() {
    const VERSION = config.VERSION || 'v0.33-inspector-controls-repair';
    const SETTINGS_KEY = config.SETTINGS_KEY || 'artifex.sceneEditor.settings.v1';
    const WORKING_COPY_KEY = config.WORKING_COPY_KEY || 'artifex.sceneEditor.workingCopy.v1';
    const DOWNLOAD_KEY = config.DOWNLOAD_KEY || 'artifex.sceneEditor.lastDownload.v1';
    const appNode = document.getElementById('editor-app');
    const repoPrefix = config.repoPrefix || (location.pathname.includes('/Forever-Bound-Game/') ? '/Forever-Bound-Game/' : '/');
    const brandLogo = config.brandLogo || '../../artifexlogo.png';
    const brandTitle = config.brandTitle || '../../artifextitle.png';
    const templateManifest = config.templateManifest || '../../templates/templates.json';
    const typeOptions = Array.isArray(config.typeOptions) ? config.typeOptions : ['prop', 'pickup', 'player_start', 'npc', 'foe', 'door', 'exit', 'overlay', 'background_layer', 'foreground_layer', 'hazard', 'searchable', 'marker', 'effect', 'ui'];
    const settings = storage.loadSettings(SETTINGS_KEY);
    const INSPECTOR_LAYOUT_KEY = 'artifex.sceneEditor.objectInspector.layout.v1';

    document.title = `Artifex Scene Editor · ${VERSION}`;
    document.body.dataset.artifexCoreMoveDrag = 'true';

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
    let inspectorScroll = 0;
    let saveTimer = null;
    let lastWorkingCopySnapshot = '';
    let activeProject = window.ArtifexActiveProject?.project || null;
    let inspectorLayout = loadInspectorLayout();
    const collapsed = { json: true, ...(settings.collapsedCards || {}) };

    function getState() {
      return { scene, fileName, templates, selectedId, selectedKind, importOpen, templateOpen, context, status, tip, defaultZoom, zoom, showHighlight, collapsed };
    }

    function loadInspectorLayout() {
      try { return { left: 360, top: 92, closed: false, ...(JSON.parse(localStorage.getItem(INSPECTOR_LAYOUT_KEY) || '{}') || {}) }; }
      catch { return { left: 360, top: 92, closed: false }; }
    }

    function saveInspectorLayout() {
      try { localStorage.setItem(INSPECTOR_LAYOUT_KEY, JSON.stringify(inspectorLayout)); } catch {}
    }

    function getInspectorLayout() { return inspectorLayout; }
    function setInspectorLayout(next) { inspectorLayout = { ...inspectorLayout, ...(next || {}) }; saveInspectorLayout(); }
    function getActiveProject() { return activeProject; }

    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
    function getScene() { return scene; }
    function getSelectedId() { return selectedId; }
    function getSelectedKind() { return selectedKind; }
    function getAllItems() { return model.allItems(scene); }
    function findItem(kind = selectedKind, id = selectedId) { return model.findItem(scene, kind, id); }
    function getSelectedItem() { return findItem(); }
    function backgroundPath() { return model.backgroundPath(scene); }
    function setSelectedId(id) { selectedId = id || ''; }
    function setStatus(nextStatus) { status = nextStatus; }
    function getStatus() { return status; }
    function setTemplates(nextTemplates) { templates = nextTemplates; }
    function setTemplateOpen(open) { templateOpen = open; }
    function setImportOpen(open) { importOpen = open; }
    function toggleImportOpen() { importOpen = !importOpen; }
    function setTip(nextTip) { tip = nextTip; const hover = document.getElementById('hoverStatus'); if (hover) hover.textContent = tip; }
    function getZoom() { return zoom; }
    function getDefaultZoom() { return defaultZoom; }
    function clearContext() { context = null; }
    function selectSilently(kind, id) { selectedKind = kind || 'element'; selectedId = id || ''; }

    function saveSettings() {
      storage.saveSettings(SETTINGS_KEY, { defaultZoom, zoom, showHighlight, collapsedCards: collapsed });
    }

    function toast(msg) {
      document.querySelector('.artifex-toast')?.remove();
      const node = document.createElement('div');
      node.className = 'artifex-toast';
      node.textContent = `${VERSION}: ${msg}`;
      document.body.appendChild(node);
      setTimeout(() => node.remove(), 2600);
    }

    function readWorkingCopy() { return storage.readWorkingCopy(WORKING_COPY_KEY); }
    function readDownloadStamp() { return storage.readDownloadStamp(DOWNLOAD_KEY); }

    function saveWorkingCopy(reason = 'autosave') {
      if (!scene) return;
      const payload = { fileName: fileName || scene.id || scene.name || 'Untitled JSON', scene: structuredClone(scene), selectedKind, selectedId, savedAt: new Date().toISOString(), reason };
      const snapshot = JSON.stringify({ ...payload, savedAt: '' });
      if (snapshot === lastWorkingCopySnapshot && reason !== 'download' && reason !== 'manual save') return;
      lastWorkingCopySnapshot = snapshot;
      storage.writeWorkingCopy(WORKING_COPY_KEY, payload);
    }

    function saveWorkingCopySoon(reason = 'edit') {
      if (!scene) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => saveWorkingCopy(reason), 80);
    }

    function manualSaveLocal() {
      if (!scene) { toast('Nothing to save locally'); return; }
      clearTimeout(saveTimer);
      saveWorkingCopy('manual save');
      status = 'Saved to local backup.';
      toast(status);
      render(false);
    }

    function markDownloaded() {
      if (!scene) return;
      const payload = { fileName: fileName || scene.id || scene.name || 'Untitled JSON', downloadedAt: new Date().toISOString() };
      storage.writeDownloadStamp(DOWNLOAD_KEY, payload);
      saveWorkingCopy('download');
    }

    function normalize(raw, label) {
      const normalized = model.normalizeScene(raw, label);
      scene = normalized.scene;
      fileName = normalized.fileName;
      selectedKind = normalized.selectedKind;
      selectedId = normalized.selectedId;
      status = `${fileName} loaded.`;
      toast(status);
      saveWorkingCopy('loaded');
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

    function saveScroll() {
      const panel = document.querySelector('.side-panel');
      const inspector = document.querySelector('.object-inspector-body');
      if (panel) panelScroll = panel.scrollTop;
      if (inspector) inspectorScroll = inspector.scrollTop;
    }
    function restoreScroll() {
      requestAnimationFrame(() => {
        const panel = document.querySelector('.side-panel');
        const inspector = document.querySelector('.object-inspector-body');
        if (panel) panel.scrollTop = panelScroll;
        if (inspector) inspector.scrollTop = inspectorScroll;
      });
    }

    const renderer = rendererModule.createRenderer({
      version: VERSION,
      repoPrefix,
      brandLogo,
      brandTitle,
      typeOptions,
      getState,
      getSelectedItem,
      getAllItems,
      findItem,
      backgroundPath,
      readWorkingCopy,
      readDownloadStamp,
      dateText: io.dateText,
      clamp,
      getActiveProject,
      getInspectorLayout
    });

    function render(keepScroll = true) {
      if (keepScroll) saveScroll();
      appNode.innerHTML = renderer.shell();
      bind();
      if (keepScroll) restoreScroll();
      saveWorkingCopySoon('render');
    }

    function renderWorkAreaOnly() {
      const wrap = document.querySelector('.stage-wrap');
      if (!wrap) return;
      wrap.outerHTML = renderer.workArea();
      bindings.bindStage(bindingDeps);
      bindings.bindZoomControls(bindingDeps);
      saveWorkingCopySoon('work-area');
    }

    function select(kind, id) { selectedKind = kind || 'element'; selectedId = id || ''; render(); }
    function applyPath(target, value) { model.applyPath(scene, selectedKind, selectedId, target, value); saveWorkingCopySoon('path'); render(); }
    function setZoom(value) { zoom = clamp(Number(value) || 1, .4, 2.2); tip = `Zoom ${Math.round(zoom * 100)}%`; saveSettings(); render(); }

    function importFile(event) { return io.importFile(event, ioDeps); }
    function importUrl() { return io.importUrl(ioDeps); }
    function openTemplates() { return io.openTemplates(templateManifest, ioDeps); }
    function loadTemplate(file) { return io.loadTemplate(file, ioDeps); }
    function download() { return io.download(scene, ioDeps); }

    function addElement() {
      if (!scene) normalize(model.blankScene(), 'New blank scene');
      const item = model.defaultElement();
      scene.elements.push(item);
      selectedKind = 'element';
      selectedId = item.id;
      toast('Element added');
      saveWorkingCopySoon('add element');
      render();
    }

    function addLayer() {
      if (!scene) normalize(model.blankScene(), 'New blank scene');
      const item = model.defaultLayer();
      scene.layers.push(item);
      selectedKind = 'layer';
      selectedId = item.id;
      toast('Layer added');
      saveWorkingCopySoon('add layer');
      render();
    }

    function duplicateSelected() {
      const copy = model.duplicateItem(scene, selectedKind, getSelectedItem());
      if (!copy) return;
      selectedId = copy.id;
      context = null;
      toast('Object duplicated');
      saveWorkingCopySoon('duplicate');
      render();
    }

    function removeSelected() {
      if (!selectedId) return;
      const next = model.removeItem(scene, selectedKind, selectedId);
      selectedKind = next.selectedKind;
      selectedId = next.selectedId;
      context = null;
      toast('Object deleted');
      saveWorkingCopySoon('delete');
      render();
    }

    function zoomSelectedObject() {
      const id = selectedId;
      const nextZoom = clamp(zoom * 2, .4, 2.2);
      context = null;
      setZoom(nextZoom);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const node = Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find(candidate => candidate.dataset.stageId === id);
        node?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
        toast(`Zoomed to object: ${Math.round(nextZoom * 100)}%`);
      }));
    }

    function action(name) {
      if (name === 'setZoomDefault') { defaultZoom = zoom; context = null; saveSettings(); toast(`Default zoom saved: ${Math.round(defaultZoom * 100)}%`); render(); return; }
      if (name === 'zoomObject') { zoomSelectedObject(); return; }
      if (name === 'props') { collapsed.selected = false; context = null; saveSettings(); render(); requestAnimationFrame(() => document.querySelector('[data-card-id="selected"]')?.scrollIntoView({ block: 'start' })); return; }
      if (name === 'duplicate') duplicateSelected();
      if (name === 'remove') removeSelected();
    }

    function blankScreen() { scene = null; fileName = ''; selectedId = ''; status = 'Blank editor ready.'; toast(status); render(false); }
    function toggleCard(cardId) { collapsed[cardId] = !collapsed[cardId]; saveSettings(); render(); }
    function toggleHighlight() { showHighlight = !showHighlight; saveSettings(); render(); }
    function updateSelectedLayer(value, shouldRender) { const item = getSelectedItem(); if (item) { item.layer = Number(value) || 0; if (shouldRender) render(); } }
    function openObjectContext(kind, id, x, y) { selectedKind = kind; selectedId = id; context = { type: 'object', kind: selectedKind, id: selectedId, x, y }; render(); }
    function openZoomContext(x, y) { context = { type: 'zoom', x, y }; render(); }

    const ioDeps = { normalize, render, toast, setStatus, getStatus, setTemplates, setTemplateOpen, setImportOpen, markDownloaded };

    const bindingDeps = {
      getScene,
      getSelectedItem,
      getZoom,
      getDefaultZoom,
      setTip,
      openLocalBackup,
      manualSaveLocal,
      toggleImportOpen,
      setTemplateOpen,
      importFile,
      importUrl,
      openTemplates,
      loadTemplate,
      download,
      blankScreen,
      toggleCard,
      select,
      addElement,
      addLayer,
      toggleHighlight,
      removeSelected,
      updateSelectedLayer,
      saveWorkingCopySoon,
      applyPath,
      render,
      renderWorkAreaOnly,
      setZoom,
      setSelectedId,
      toast,
      setInspectorLayout,
      action,
      endMoveDrag: (...args) => moveDrag.end(...args),
      openObjectContext,
      openZoomContext
    };

    const moveDrag = stageDragModule.createCoreMoveDragController({
      selectSilently,
      getSelectedItem,
      getSelectedId,
      getSelectedKind,
      clearContext,
      clamp,
      saveWorkingCopySoon,
      render
    });

    function bind() { bindings.bindEditor(bindingDeps); }

    function start() {
      window.ArtifexSceneEditorCore = coreApi.createCoreApi(publicApi);
      moveDrag.wire();
      document.addEventListener('pointerup', event => moveDrag.end(event));
      document.addEventListener('input', () => saveWorkingCopySoon('input'), true);
      document.addEventListener('change', () => saveWorkingCopySoon('change'), true);
      document.addEventListener('click', event => {
        if (importOpen && !event.target.closest('#importMenu')) { importOpen = false; render(); }
        if (context && !event.target.closest('.context-menu') && !event.target.closest('.scene-item') && !event.target.closest('#zoomReset')) { context = null; render(); }
        saveWorkingCopySoon('click');
      });
      window.addEventListener('artifex:active-project-ready', (event) => {
        activeProject = event.detail?.project || window.ArtifexActiveProject?.project || null;
        render();
      });
      window.addEventListener('load', () => {
        activeProject = window.ArtifexActiveProject?.project || activeProject;
        toast('Scene Editor loaded');
        render();
      });
      render(false);
    }

    const publicApi = {
      version: VERSION,
      getScene,
      getSelectedId,
      getSelectedKind,
      getSelectedItem,
      getAllItems,
      select,
      render,
      renderWorkAreaOnly,
      saveWorkingCopy,
      saveWorkingCopySoon,
      clamp,
      toast,
      start
    };

    return publicApi;
  }

  window.ArtifexSceneEditorApp = Object.freeze({ createSceneEditorApp });
})();