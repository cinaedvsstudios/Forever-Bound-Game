(() => {
  'use strict';

  let settingsSearchValue = '';

  function normalizeSearchText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function rowLabelText(row) {
    return Array.from(row.querySelectorAll('label, .metric-label-cell, .card-layout-note, button, select option:checked'))
      .map((node) => node.textContent || node.getAttribute?.('aria-label') || node.getAttribute?.('title') || '')
      .join(' ');
  }

  function applySettingsSearch() {
    const panel = document.querySelector('.side-panel');
    const inspector = document.getElementById('objectInspector');
    const input = document.getElementById('settingsSearch');
    const empty = document.getElementById('settingsSearchEmpty');
    if (!panel || !input) return;
    if (input.value !== settingsSearchValue && document.activeElement !== input) input.value = settingsSearchValue;
    const query = normalizeSearchText(input.value);
    let visibleCards = 0;

    [panel, inspector].filter(Boolean).forEach((scope) => scope.querySelectorAll('.panel-card').forEach((card) => {
      const titleText = normalizeSearchText(card.querySelector('h2 span')?.textContent);
      const rows = Array.from(card.querySelectorAll('.field, .check-row, .button-row, .layer-control-row, .item-list, .json-preview, .card-layout-note, .metric-label-cell, .metric-value-cell'));
      const cardMatches = !query || titleText.includes(query);
      let rowMatches = 0;

      rows.forEach((row) => {
        const match = cardMatches || normalizeSearchText(rowLabelText(row)).includes(query);
        row.classList.toggle('settings-search-hidden', !match);
        if (match) rowMatches += 1;
      });

      const hasVisible = cardMatches || rowMatches > 0 || normalizeSearchText(card.textContent).includes(query);
      card.classList.toggle('settings-search-hidden', !hasVisible);
      if (hasVisible) visibleCards += 1;
    }));

    if (inspector) inspector.classList.toggle('settings-search-hidden', !!query && !inspector.querySelector('.panel-card:not(.settings-search-hidden)'));
    if (empty) empty.hidden = !query || visibleCards > 0;
    panel.classList.toggle('is-settings-searching', !!query);
    inspector?.classList.toggle('is-settings-searching', !!query);
  }

  function bindSettingsSearch() {
    const input = document.getElementById('settingsSearch');
    if (!input || input.dataset.settingsSearchBound === 'true') return;
    input.dataset.settingsSearchBound = 'true';
    input.value = settingsSearchValue;
    input.addEventListener('input', () => {
      settingsSearchValue = input.value;
      applySettingsSearch();
    });
    input.addEventListener('search', () => {
      settingsSearchValue = input.value;
      applySettingsSearch();
    });
    applySettingsSearch();
    window.requestAnimationFrame(applySettingsSearch);
  }

  function bindEditor(deps) {
    document.querySelectorAll('[data-tip]').forEach(node => node.addEventListener('mouseenter', () => deps.setTip(node.dataset.tip)));
    document.getElementById('openLocalBackup')?.addEventListener('click', deps.openLocalBackup);
    document.getElementById('ignoreLocalBackup')?.addEventListener('click', event => { event.currentTarget.closest('.resume-card-inline')?.remove(); deps.toast('Local backup ignored'); });
    document.getElementById('manualLocalSave')?.addEventListener('click', deps.manualSaveLocal);
    document.getElementById('importBtn')?.addEventListener('click', event => { event.stopPropagation(); deps.toggleImportOpen(); deps.render(); });
    document.getElementById('jsonFile')?.addEventListener('change', deps.importFile);
    document.getElementById('importUrl')?.addEventListener('click', deps.importUrl);
    document.getElementById('importTemplate')?.addEventListener('click', deps.openTemplates);
    document.getElementById('closeTemplates')?.addEventListener('click', () => { deps.setTemplateOpen(false); deps.render(); });
    document.querySelectorAll('[data-template-file]').forEach(button => button.addEventListener('click', () => deps.loadTemplate(button.dataset.templateFile)));
    document.getElementById('downloadJson')?.addEventListener('click', deps.download);
    document.getElementById('blankBtn')?.addEventListener('click', deps.blankScreen);
    document.querySelectorAll('[data-card-toggle]').forEach(button => button.addEventListener('click', () => deps.toggleCard(button.dataset.cardToggle)));
    document.querySelectorAll('[data-select-id]').forEach(button => button.addEventListener('click', () => deps.select(button.dataset.selectKind, button.dataset.selectId)));
    bindZoomControls(deps);
    document.getElementById('addElement')?.addEventListener('click', deps.addElement);
    document.getElementById('addLayer')?.addEventListener('click', deps.addLayer);
    document.getElementById('highlightBtn')?.addEventListener('click', deps.toggleHighlight);
    document.getElementById('deleteItem')?.addEventListener('click', deps.removeSelected);
    document.getElementById('layerPill')?.addEventListener('change', event => deps.updateSelectedLayer(event.target.value, true));
    bindSceneFields(deps);
    bindSettingsSearch();
    bindPathButtons(deps);
    bindContextActions(deps);
    bindObjectInspector(deps);
    bindStage(deps);
    window.requestAnimationFrame(applySettingsSearch);
  }

  function bindZoomControls(deps) {
    document.getElementById('zoomIn')?.addEventListener('click', () => deps.setZoom(deps.getZoom() + .1));
    document.getElementById('zoomOut')?.addEventListener('click', () => deps.setZoom(deps.getZoom() - .1));
    document.getElementById('zoomReset')?.addEventListener('click', () => deps.setZoom(deps.getDefaultZoom()));
  }

  function bindSceneFields(deps) {
    const scene = deps.getScene();
    if (!scene) return;
    const map = [['sceneId', 'id'], ['sceneName', 'name'], ['sceneType', 'screenType']];
    map.forEach(([id, key]) => document.getElementById(id)?.addEventListener('input', event => {
      scene[key] = event.target.value;
      if (key === 'screenType') scene.mode = event.target.value;
      deps.saveWorkingCopySoon('scene field');
    }));
    document.getElementById('sceneTags')?.addEventListener('input', event => {
      scene.tags = event.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
      deps.saveWorkingCopySoon('scene tags');
    });
    document.getElementById('sceneBg')?.addEventListener('change', event => { deps.applyPath('background', event.target.value); });
    document.getElementById('sceneAudioAmbience')?.addEventListener('input', event => { scene.audio = scene.audio || {}; scene.audio.ambience = event.target.value; deps.saveWorkingCopySoon('scene audio'); });
    document.getElementById('sceneAudioMusic')?.addEventListener('input', event => { scene.audio = scene.audio || {}; scene.audio.music = event.target.value; deps.saveWorkingCopySoon('scene audio'); });
    document.getElementById('sceneAudioVolume')?.addEventListener('input', event => { scene.audio = scene.audio || {}; scene.audio.volume = Number(event.target.value || 0); deps.saveWorkingCopySoon('scene audio'); });
    document.getElementById('sceneAudioFadeIn')?.addEventListener('input', event => { scene.audio = scene.audio || {}; scene.audio.fadeIn = Number(event.target.value || 0); deps.saveWorkingCopySoon('scene audio'); });
    document.getElementById('sceneAudioFadeOut')?.addEventListener('input', event => { scene.audio = scene.audio || {}; scene.audio.fadeOut = Number(event.target.value || 0); deps.saveWorkingCopySoon('scene audio'); });
    document.getElementById('sceneAudioLoop')?.addEventListener('change', event => { scene.audio = scene.audio || {}; scene.audio.loop = event.target.checked; deps.saveWorkingCopySoon('scene audio'); });
    document.getElementById('gridCols')?.addEventListener('change', event => { scene.grid.columns = Number(event.target.value) || 16; deps.saveWorkingCopySoon('grid'); deps.render(); });
    document.getElementById('gridRows')?.addEventListener('change', event => { scene.grid.rows = Number(event.target.value) || 9; deps.saveWorkingCopySoon('grid'); deps.render(); });
    document.getElementById('gridShow')?.addEventListener('change', event => { scene.grid.show = event.target.checked; deps.saveWorkingCopySoon('grid'); deps.render(); });

    function displayedItem() {
      const current = deps.getSelectedItem();
      const shownId = document.getElementById('itemId')?.value || '';
      if (!shownId || current?.id === shownId) return current;
      return [...(scene.layers || []), ...(scene.elements || []), ...(scene.ui || [])].find((entry) => entry.id === shownId) || current;
    }

    if (!displayedItem()) return;

    [['itemId', 'id'], ['itemName', 'name'], ['itemImage', 'image'], ['itemText', 'text']].forEach(([id, key]) => {
      const inputNode = document.getElementById(id);
      inputNode?.addEventListener('input', event => {
        const item = displayedItem();
        if (!item) return;
        const oldId = item.id;
        item[key] = event.target.value;
        if (key === 'id') deps.setSelectedId(item.id);
        if (key === 'name') {
          const label = Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((node) => node.dataset.stageId === oldId)?.querySelector('.item-label');
          if (label) label.textContent = event.target.value || item.id;
        }
        deps.saveWorkingCopySoon('item field');
      });
      inputNode?.addEventListener('blur', () => deps.render());
    });

    document.getElementById('itemType')?.addEventListener('change', event => {
      const item = displayedItem();
      if (!item) return;
      item.type = event.target.value;
      deps.saveWorkingCopySoon('type');
      deps.render();
    });

    [['itemX', 'x'], ['itemY', 'y'], ['itemW', 'width'], ['itemH', 'height'], ['itemZ', 'zDepth']].forEach(([id, key]) => {
      document.getElementById(id)?.addEventListener('input', event => {
        const item = displayedItem();
        if (!item) return;
        item[key] = Number(event.target.value);
        if (key === 'zDepth') {
          const zVal = document.getElementById('zVal');
          if (zVal) zVal.textContent = event.target.value;
        }
        deps.renderWorkAreaOnly();
      });
    });

    document.getElementById('itemLayer')?.addEventListener('change', event => {
      const item = displayedItem();
      if (!item) return;
      item.layer = Number(event.target.value) || 0;
      deps.saveWorkingCopySoon('layer');
      deps.render();
    });
    document.getElementById('itemVisible')?.addEventListener('change', event => {
      const item = displayedItem();
      if (!item) return;
      item.visible = event.target.checked;
      deps.saveWorkingCopySoon('visibility');
      deps.render();
    });
  }

  function bindObjectInspector(deps) {
    const inspector = document.getElementById('objectInspector');
    const handle = document.getElementById('objectInspectorHandle');
    if (!inspector || !handle || inspector.dataset.inspectorBound === 'true') return;
    inspector.dataset.inspectorBound = 'true';
    document.getElementById('objectInspectorMinimize')?.addEventListener('click', (event) => {
      event.preventDefault();
      deps.setInspectorLayout?.({ closed: !inspector.classList.contains('is-minimized') });
      deps.render();
    });

    let drag = null;
    handle.addEventListener('pointerdown', (event) => {
      if (event.button === 2 || event.target.closest('button')) return;
      const rect = inspector.getBoundingClientRect();
      drag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      inspector.classList.add('is-dragging');
      handle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener('pointermove', (event) => {
      if (!drag) return;
      const maxLeft = Math.max(12, window.innerWidth - inspector.offsetWidth - 12);
      const maxTop = Math.max(80, window.innerHeight - 80);
      const left = Math.max(12, Math.min(maxLeft, event.clientX - drag.offsetX));
      const top = Math.max(80, Math.min(maxTop, event.clientY - drag.offsetY));
      inspector.style.left = `${left}px`;
      inspector.style.top = `${top}px`;
      event.preventDefault();
    });
    const end = (event) => {
      if (!drag) return;
      drag = null;
      inspector.classList.remove('is-dragging');
      deps.setInspectorLayout?.({ left: parseFloat(inspector.style.left) || 360, top: parseFloat(inspector.style.top) || 92 });
      handle.releasePointerCapture?.(event.pointerId);
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  function bindPathButtons(deps) {
    document.querySelectorAll('[data-path-menu]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); button.closest('.path-menu').classList.toggle('is-open'); }));
    document.querySelectorAll('[data-online]').forEach(button => button.addEventListener('click', () => { const value = prompt('Paste image URL or project path:'); if (!value) return; deps.applyPath(button.dataset.online, value); }));
    document.querySelectorAll('[data-hdd]').forEach(button => button.addEventListener('click', () => { const input = document.getElementById('imageFile'); input.dataset.target = button.dataset.hdd; input.value = ''; input.click(); }));
    document.getElementById('imageFile')?.addEventListener('change', event => { const file = event.target.files?.[0]; if (!file) return; deps.applyPath(event.target.dataset.target, URL.createObjectURL(file)); deps.toast(`Preview image loaded: ${file.name}`); });
  }

  function bindContextActions(deps) {
    document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => deps.action(button.dataset.action)));
  }

  function bindStage(deps) {
    document.querySelectorAll('[data-stage-id]').forEach(node => {
      node.addEventListener('pointerdown', event => {
        if (event.button === 2) return;
        if (event.target.closest?.('.move-handle')) return;
        deps.endMoveDrag(event, false);
        deps.select(node.dataset.stageKind, node.dataset.stageId);
      });
      node.addEventListener('contextmenu', event => {
        event.preventDefault();
        event.stopPropagation();
        deps.openObjectContext(node.dataset.stageKind, node.dataset.stageId, event.clientX, event.clientY);
      });
    });
    document.getElementById('zoomReset')?.addEventListener('contextmenu', event => { event.preventDefault(); event.stopPropagation(); deps.openZoomContext(event.clientX, event.clientY); });
  }

  document.addEventListener('input', (event) => { if (!event.target.closest?.('#settingsSearch')) window.requestAnimationFrame(applySettingsSearch); }, true);
  document.addEventListener('click', () => window.requestAnimationFrame(applySettingsSearch), true);

  window.ArtifexSceneEditorBindings = Object.freeze({ bindEditor, bindZoomControls, bindStage });
})();