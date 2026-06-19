export const DEFAULT_CANVAS = { width: 1920, height: 1080 };
export const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
export const GLB_TYPES = new Set(['model/gltf-binary', 'application/octet-stream']);
export const BLEND_MODES = new Set([
  'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
  'darken', 'lighten', 'color-dodge', 'color-burn', 'difference', 'plus-lighter'
]);
export const MAX_HISTORY = 40;
export const DEFAULT_FILTERS = Object.freeze({ hue: 0, saturation: 100, brightness: 100, contrast: 100 });
export const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'glb'];
