import { canvasToBlob, imageFromSource, makeFilterString } from '../core/utils.js';

const blendMap = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  'soft-light': 'soft-light',
  'hard-light': 'hard-light',
  darken: 'darken',
  lighten: 'lighten',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  difference: 'difference',
  'plus-lighter': 'lighter'
};

export async function renderSceneToCanvas(state, { transparent = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = state.canvas.width;
  canvas.height = state.canvas.height;
  const context = canvas.getContext('2d');
  if (!transparent) {
    context.fillStyle = '#1c2838';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (const layer of state.layers) {
    if (!layer.visible) continue;
    const image = await imageFromSource(layer.dataUrl);
    context.save();
    context.globalAlpha = layer.opacity;
    context.globalCompositeOperation = blendMap[layer.blendMode] ?? 'source-over';
    context.filter = makeFilterString(layer.filters);
    context.drawImage(image, layer.x, layer.y, layer.width, layer.height);
    context.restore();
  }
  return canvas;
}

export async function exportScene(state, type) {
  const transparent = type !== 'image/jpeg';
  const canvas = await renderSceneToCanvas(state, { transparent });
  return canvasToBlob(canvas, type, type === 'image/jpeg' ? .94 : .9);
}
