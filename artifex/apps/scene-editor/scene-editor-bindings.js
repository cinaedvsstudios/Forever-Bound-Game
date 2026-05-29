(() => {
  'use strict';

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
    bindPathButtons(deps);
    bindContextActions(deps);
    bindStage(deps);
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
    document.getElementById('sceneBg')?.addEventListener('change', event => { deps.applyPath('background', event.target.value); });
    document.getElementById('gridCols')?.addEventListener('change', event => { scene.grid.columns = Number(event.target.value) || 16; deps.saveWorkingCopySoon('grid'); deps.render(); });
    document.getElementById('gridRows')?.addEventListener('change', event => { scene.grid.rows = Number(event.target.value) || 9; deps.saveWorkingCopySoon('grid'); deps.render(); });
    document.getElementById('gridShow')?.addEventListener('change', event => { scene.grid.show = event.target.checked; deps.saveWorkingCopySoon('grid'); deps.render(); });
    const item = deps.getSelectedItem();
    if (!item) return;

    [['itemId', 'id'], ['itemName', 'name'], ['itemImage', 'image'], ['itemText', 'text']].forEach(([id, key]) => {
      const inputNode = document.getElementById(id);
      inputNode?.addEventListener('input', event => {
        item[key] = event.target.value;
        if (key === 'id') deps.setSelectedId(item.id);
        if (key === 'name') {
          const label = document.querySelector('.scene-item.is-selected .item-label');
          if (label) label.textContent = event.target.value || item.id;
        }
        deps.saveWorkingCopySoon('item field');
      });
      inputNode?.addEventListener('blur', () => deps.render());
    });

    document.getElementById('itemType')?.addEventListener('change', event => { item.type = event.target.value; deps.saveWorkingCopySoon('type'); deps.render(); });

    [['itemX', 'x'], ['itemY', 'y'], ['itemW', 'width'], ['itemH', 'height'], ['itemZ', 'zDepth']].forEach(([id, key]) => {
      document.getElementById(id)?.addEventListener('input', event => {
        item[key] = Number(event.target.value);
        if (key === 'zDepth') {
          const zVal = document.getElementById('zVal');
          if (zVal) zVal.textContent = event.target.value;
        }
        deps.renderWorkAreaOnly();
      });
    });

    document.getElementById('itemLayer')?.addEventListener('change', event => deps.updateSelectedLayer(event.target.value, true));
    document.getElementById('itemVisible')?.addEventListener('change', event => { item.visible = event.target.checked; deps.saveWorkingCopySoon('visibility'); deps.render(); });
    document.getElementById('itemTags')?.addEventListener('input', event => { item.tags = event.target.value.split(',').map(tag => tag.trim()).filter(Boolean); deps.saveWorkingCopySoon('tags'); });
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

  window.ArtifexSceneEditorBindings = Object.freeze({
    bindEditor,
    bindZoomControls,
    bindStage
  });
})();
