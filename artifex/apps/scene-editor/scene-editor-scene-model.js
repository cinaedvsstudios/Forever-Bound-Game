(() => {
  'use strict';

  function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function blankScene() {
    return {
      id: '',
      name: 'Untitled Scene',
      mode: 'blank',
      screenType: 'blank',
      background: '',
      backgroundScroll: false,
      grid: { columns: 16, rows: 9, show: true },
      layers: [],
      elements: [],
      ui: [],
      audio: {}
    };
  }

  function key(kind) {
    return kind === 'layer' ? 'layers' : kind === 'ui' ? 'ui' : 'elements';
  }

  function allItems(scene) {
    if (!scene) return [];
    return [
      ...(scene.layers || []).map((item) => ({ ...item, kind: 'layer' })),
      ...(scene.elements || []).map((item) => ({ ...item, kind: 'element' })),
      ...(scene.ui || []).map((item) => ({ ...item, kind: 'ui' }))
    ];
  }

  function findItem(scene, kind, id) {
    if (!scene) return null;
    return (scene[key(kind)] || []).find((item) => item.id === id) || null;
  }

  function bgPath(scene) {
    if (!scene) return '';
    if (typeof scene.background === 'string') return scene.background;
    if (scene.background && typeof scene.background === 'object') return scene.background.image || scene.background.backgroundImage || '';
    return scene.theme?.backgroundImage || '';
  }

  function setBgPath(scene, value) {
    if (!scene) return scene;
    if (scene.theme && scene.screenType === 'static') scene.theme.backgroundImage = value;
    else scene.background = value;
    return scene;
  }

  function normalizeScene(raw, label = '') {
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
    return scene;
  }

  function firstSelectable(scene) {
    return allItems(scene).sort((a, b) => Number(b.layer || 0) - Number(a.layer || 0))[0] || null;
  }

  function createElement() {
    return {
      id: uid('element'),
      type: 'prop',
      name: 'New Element',
      image: '../../templates/assets/template_red_ball.svg',
      x: 40,
      y: 55,
      width: 10,
      height: 14,
      layer: 10,
      zDepth: 0,
      visible: true,
      tags: [],
      rotation: 0,
      rotationOrigin: 'centre'
    };
  }

  function createLayer() {
    return {
      id: uid('layer'),
      type: 'overlay',
      name: 'New Layer',
      image: '../../templates/assets/template_water_strip.svg',
      x: 20,
      y: 70,
      width: 40,
      height: 14,
      layer: 5,
      zDepth: 0,
      visible: true,
      tags: [],
      rotation: 0,
      rotationOrigin: 'centre'
    };
  }

  window.ArtifexSceneEditorModel = Object.freeze({
    uid,
    blankScene,
    key,
    allItems,
    findItem,
    bgPath,
    setBgPath,
    normalizeScene,
    firstSelectable,
    createElement,
    createLayer
  });
})();
