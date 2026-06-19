export const uid = (prefix = 'id') => `${prefix}_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function round(value, decimals = 0) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

export function extensionOf(name = '') {
  return name.split('.').pop().toLowerCase();
}

export function isImageFile(file) {
  return ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || ['png', 'jpg', 'jpeg', 'webp'].includes(extensionOf(file.name));
}

export function isGlbFile(file) {
  return file.type === 'model/gltf-binary' || extensionOf(file.name) === 'glb';
}

export function dataUrlFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export function imageFromSource(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!source.startsWith('data:') && !source.startsWith('blob:')) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image data.'));
    image.src = source;
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function getRelativePointer(event, element) {
  const bounds = element.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top, width: bounds.width, height: bounds.height };
}

export function makeFilterString(filters = {}) {
  return `hue-rotate(${filters.hue ?? 0}deg) saturate(${filters.saturation ?? 100}%) brightness(${filters.brightness ?? 100}%) contrast(${filters.contrast ?? 100}%)`;
}

export function hexToRgb(hex) {
  const safe = hex.replace('#', '');
  const int = Number.parseInt(safe.length === 3 ? safe.split('').map((part) => part + part).join('') : safe, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
