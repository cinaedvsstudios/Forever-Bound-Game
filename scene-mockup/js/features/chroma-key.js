import { hexToRgb, imageFromSource } from '../core/utils.js';

export async function applyChromaKey(layer, hex, tolerance) {
  const image = await imageFromSource(layer.sourceDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const target = hexToRgb(hex);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const radius = Math.max(0, Number(tolerance));
  const softStart = Math.max(0, radius - 32);

  for (let index = 0; index < pixels.data.length; index += 4) {
    const r = pixels.data[index];
    const g = pixels.data[index + 1];
    const b = pixels.data[index + 2];
    const distance = Math.hypot(r - target.r, g - target.g, b - target.b);
    if (distance <= softStart) pixels.data[index + 3] = 0;
    else if (distance <= radius) pixels.data[index + 3] = Math.round(255 * ((distance - softStart) / Math.max(1, radius - softStart)));
  }

  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL('image/png');
}
