import { imageFromSource, clamp, round } from '../core/utils.js';

export async function analyseImageColour(source) {
  const image = await imageFromSource(source);
  const canvas = document.createElement('canvas');
  const size = 48;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  let red = 0;
  let green = 0;
  let blue = 0;
  let weight = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;
    if (alpha < .06) continue;
    red += pixels[index] * alpha;
    green += pixels[index + 1] * alpha;
    blue += pixels[index + 2] * alpha;
    weight += alpha;
  }
  if (!weight) return { hue: 215, saturation: 12, lightness: 14 };
  return rgbToHsl(red / weight, green / weight, blue / weight);
}

export function makeAutoMatch(backgroundHsl) {
  const isDark = backgroundHsl.lightness < 43;
  return {
    // A restrained hue shift avoids turning every asset into a flat overlay colour.
    hue: round(clamp((backgroundHsl.hue - 210) * .15, -32, 32)),
    saturation: round(clamp(isDark ? 88 + backgroundHsl.saturation * .12 : 94 + backgroundHsl.saturation * .08, 72, 120)),
    brightness: round(clamp(isDark ? 90 + backgroundHsl.lightness * .16 : 101 + (backgroundHsl.lightness - 50) * .06, 88, 110)),
    contrast: isDark ? 106 : 102
  };
}

function rgbToHsl(red, green, blue) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;
  const delta = max - min;
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  if (hue < 0) hue += 360;
  return { hue, saturation: saturation * 100, lightness: lightness * 100 };
}
