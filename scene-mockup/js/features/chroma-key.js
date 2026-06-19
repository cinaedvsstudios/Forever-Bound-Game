import { hexToRgb, imageFromSource } from '../core/utils.js';

export async function applyChromaKey(layer, hex, tolerance, feather = 0) {
  const image = await imageFromSource(layer.sourceDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const target = hexToRgb(hex);
  const radius = Math.max(0, Number(tolerance));
  const featherWidth = Math.min(radius, Math.max(0, Number(feather)));
  const hardCutoff = Math.max(0, radius - featherWidth);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < pixels.data.length; index += 4) {
    const r = pixels.data[index];
    const g = pixels.data[index + 1];
    const b = pixels.data[index + 2];
    const distance = Math.hypot(r - target.r, g - target.g, b - target.b);

    if (distance <= hardCutoff) {
      pixels.data[index + 3] = 0;
    } else if (distance <= radius) {
      const transition = featherWidth || 1;
      pixels.data[index + 3] = Math.round(255 * ((distance - hardCutoff) / transition));
    }
  }

  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL('image/png');
}
