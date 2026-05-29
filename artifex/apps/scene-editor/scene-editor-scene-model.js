(() => {
  'use strict';

  function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function blankScene() {
    return { id: '', name: 'Untitled Scene', mode: 'blank', screenType: 'blank', background: '', backgroundScroll: false, grid: { columns: 16, rows: 9, show: true }, layers: [], elements: [], ui: [], audio: {} };
  }

  function collectionKey(kind) {
    return kind === 'layer' ? 'layers' : kind === 'ui' ? 'ui' : 'elements';
  }

  function allItems(scene) {
    if (!scene) return [];
    return [
      ...(scene.layers || []).map(item => ({ ...item, kind: 'layer' })),
      ...(scene.elements || []).map(item => ({ ...item, kind: 'element' })),
      ...(scene.ui || []).map(item => ({ ...item, kind: 'ui' }))
    ];
  }

  function findItem(scene, kind, id) {
    if (!scene) return null;
    return (scene[collectionKey(kind)] || []).find(item => item.id === id) || null;
  }

  function backgroundPath(scene) {
    if (!scene) return '';
    if (typeof scene.background === 'string') return scene.background;
    if (scene.background && typeof scene.background === 'object') return scene.background.image || scene.background.backgroundImage || '';
    return scene.theme?.backgroundImage || '';
  }

  function setBackgroundPath(scene, value) {
    if (!scene) return;
    if (scene.theme && scene.screenType === 'static') scene.theme.backgroundImage = value;
    else scene.background = value;
  }

  function normalizeScene(raw, label) {
    const scene = structuredClone(raw || blankScene());
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
    const first = allItems(scene).sort((a, b) => Number(b.layer || 0) - Number(a.layer || 0))[0];
    return {
      scene,
      fileName: label || scene.id || 'Untitled JSON',
      selectedKind: first?.kind || 'element',
      selectedId: first?.id || ''
    };
  }

  function defaultElement() {
    return { id: uid('element'), type: 'prop', name: 'New Element', image: '../../templates/assets/template_red_ball.svg', x: 40, y: 55, width: 10, height: 14, layer: 10, zDepth: 0, visible: true, tags: [], rotation: 0, rotationOrigin: 'centre' };
  }

  function defaultLayer() {
    return { id: uid('layer'), type: 'overlay', name: 'New Layer', image: '../../templates/assets/template_water_strip.svg', x: 20, y: 70, width: 40, height: 14, layer: 5, zDepth: 0, visible: true, tags: [], rotation: 0, rotationOrigin: 'centre' };
  }

  function duplicateItem(scene, kind, item) {
    if (!scene || !item) return null;
    const copy = structuredClone(item);
    copy.id = `${item.id || 'item'}_copy_${Math.random().toString(36).slice(2, 5)}`;
    copy.name = `${item.name || item.id || 'Item'} Copy`;
    copy.x = clamp(Number(item.x || 0) + 3, 0, 100);
    copy.y = clamp(Number(item.y || 0) + 3, 0, 100);
    copy.layer = Number(item.layer || 0) + 1;
    scene[collectionKey(kind)].push(copy);
    return copy;
  }

  function removeItem(scene, kind, id) {
    if (!scene || !id) return { selectedKind: 'element', selectedId: '' };
    scene[collectionKey(kind)] = (scene[collectionKey(kind)] || []).filter(item => item.id !== id);
    const first = allItems(scene)[0];
    return { selectedKind: first?.kind || 'element', selectedId: first?.id || '' };
  }

  function applyPath(scene, selectedKind, selectedId, target, value) {
    if (target === 'background') {
      setBackgroundPath(scene, value);
      return;
    }
    const item = findItem(scene, selectedKind, selectedId);
    if (item) item.image = value;
  }

  window.ArtifexSceneEditorSceneModel = Object.freeze({
    uid,
    blankScene,
    collectionKey,
    allItems,
    findItem,
    backgroundPath,
    setBackgroundPath,
    normalizeScene,
    defaultElement,
    defaultLayer,
    duplicateItem,
    removeItem,
    applyPath
  });
})();
