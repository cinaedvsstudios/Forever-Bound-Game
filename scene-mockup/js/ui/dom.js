export const dom = Object.freeze({
  stage: document.querySelector('#scene-stage'),
  stageWrap: document.querySelector('#stage-wrap'),
  assetInput: document.querySelector('#asset-input'),
  assetImportButton: document.querySelector('#asset-import-button'),
  importFromZoneButton: document.querySelector('#import-from-zone-button'),
  assetDropZone: document.querySelector('#asset-drop-zone'),
  assetGrid: document.querySelector('#asset-grid'),
  assetCardTemplate: document.querySelector('#asset-card-template'),
  layerList: document.querySelector('#layer-list'),
  layerRowTemplate: document.querySelector('#layer-row-template'),
  sceneTitle: document.querySelector('#scene-title'),
  canvasReadout: document.querySelector('#canvas-readout'),
  canvasPreset: document.querySelector('#canvas-preset'),
  gridToggle: document.querySelector('#grid-toggle'),
  guidesToggle: document.querySelector('#guides-toggle'),
  selectedLayerName: document.querySelector('#selected-layer-name'),
  emptyInspectorMessage: document.querySelector('#empty-inspector-message'),
  layerControls: document.querySelector('#layer-controls'),
  blendMode: document.querySelector('#blend-mode-select'),
  opacity: document.querySelector('#opacity-input'),
  opacityOutput: document.querySelector('#opacity-output'),
  posX: document.querySelector('#position-x-input'),
  posY: document.querySelector('#position-y-input'),
  width: document.querySelector('#width-input'),
  height: document.querySelector('#height-input'),
  hue: document.querySelector('#hue-input'),
  hueOutput: document.querySelector('#hue-output'),
  saturation: document.querySelector('#saturation-input'),
  saturationOutput: document.querySelector('#saturation-output'),
  brightness: document.querySelector('#brightness-input'),
  brightnessOutput: document.querySelector('#brightness-output'),
  contrast: document.querySelector('#contrast-input'),
  contrastOutput: document.querySelector('#contrast-output'),
  chromaColour: document.querySelector('#chroma-colour-input'),
  chromaTolerance: document.querySelector('#chroma-tolerance-input'),
  chromaToleranceOutput: document.querySelector('#chroma-tolerance-output'),
  toastRegion: document.querySelector('#toast-region')
});

export function toast(message, { error = false, timeout = 3200 } = {}) {
  const item = document.createElement('div');
  item.className = `toast${error ? ' is-error' : ''}`;
  item.textContent = message;
  dom.toastRegion.append(item);
  window.setTimeout(() => item.remove(), timeout);
}
