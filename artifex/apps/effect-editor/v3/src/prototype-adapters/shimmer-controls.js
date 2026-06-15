// Prototype control adapter definitions for the existing standalone Shimmer / Portal Distortion Engine.
// Source of truth checked against:
// - artifex/apps/effect-editor/fx-shimmer/index.html
// - artifex/apps/effect-editor/fx-shimmer/src/main.js
// - artifex/apps/effect-editor/fx-shimmer/src/presets.js
// This file is intentionally not wired into the live editor yet.

export const SHIMMER_CONTROL_ADAPTER_VERSION = 'shimmer-controls-adapter-0.1';

export const SHIMMER_SOURCE = {
  prototypeFolder: 'fx-shimmer',
  prototypeIndex: './fx-shimmer/index.html',
  prototypeMain: './fx-shimmer/src/main.js',
  prototypePresets: './fx-shimmer/src/presets.js',
  prototypeVersion: 'V1.40 Blur Controls'
};

const BLEND_MODES = [
  ['source-over', 'Normal'],
  ['multiply', 'Multiply'],
  ['screen', 'Screen'],
  ['lighter', 'Lighter'],
  ['overlay', 'Overlay'],
  ['darken', 'Darken'],
  ['lighten', 'Lighten'],
  ['color-dodge', 'Color-dodge'],
  ['color-burn', 'Color-burn'],
  ['hard-light', 'Hard-light'],
  ['soft-light', 'Soft-light'],
  ['difference', 'Difference'],
  ['exclusion', 'Exclusion'],
  ['hue', 'Hue'],
  ['saturation', 'Saturation'],
  ['color', 'Color'],
  ['luminosity', 'Luminosity']
];

const OVERLAY_BLEND_MODES = [...BLEND_MODES, ['alpha-erase', 'Alpha / Erase']];

const WISP_LAYER_OPTIONS = [
  ['inside-aperture', 'Inside aperture / under rim'],
  ['behind-rim', 'Behind cloudy rim'],
  ['over-clouds', 'Over clouds / rim'],
  ['over-particles', 'Over particles'],
  ['front', 'Front layer']
];

const OUTLINE_LAYER_OPTIONS = [
  ['behind-rim', 'Behind cloudy rim'],
  ['over-clouds', 'Over clouds / rim'],
  ['over-particles', 'Over particles'],
  ['front', 'Front layer']
];

const APERTURE_LAYER_OPTIONS = [
  ['inside-aperture', 'Below core overlays'],
  ['aperture', 'Above core overlays'],
  ['over-clouds', 'Over clouds / rim'],
  ['front', 'Front']
];

const OVERLAY_LAYER_OPTIONS = [
  ['behind-effect', 'Behind effect'],
  ['inside-aperture', 'Inside aperture / core'],
  ['over-clouds', 'Over clouds / rim'],
  ['front', 'Front overlay']
];

const SOURCE_MODE_OPTIONS = [
  ['color', 'Colour only'],
  ['texture', 'Texture image']
];

const TYPE_OPTIONS = [
  ['ring', 'Portal ring / aperture'],
  ['wormhole', 'Wormhole tunnel'],
  ['heat', 'Heat shimmer'],
  ['transition', 'Transition blur']
];

const OUTLINE_COLOR_MODE_OPTIONS = [
  ['solid', 'Solid colour'],
  ['radial', 'Radial gradient'],
  ['horizontal', 'Horizontal gradient'],
  ['vertical', 'Vertical gradient'],
  ['diagonal', 'Diagonal gradient'],
  ['image', 'Image colour texture']
];

export const DEFAULT_BASE_ASSETS = [
  'default1.jpg', 'default2.jpg', 'default3.jpg', 'default4.jpg', 'default5.jpg', 'default6.jpg',
  'default7.jpg', 'default8.jpg', 'default9.jpg', 'default10.jpg', 'default11.jpg'
];

export const DEFAULT_OVERLAY_ASSETS = [
  'aperture.png', 'ball.png', 'ball1.png', 'ball2.png', 'ball3.png', 'binary.png',
  'blackhole.png', 'blackhole2.png', 'blackhole3.png', 'blackhole4.png', 'electro.png',
  'electro2.png', 'flare.png', 'flare2.png', 'swirl.png', 'swirl2.png', 'vortex1.png',
  'vortex2.png', 'vortex3.png', 'vortex4.png', 'vortex5.png', 'vortex6.png'
];

export const DEFAULT_WORMHOLE_ARM_TEXTURE = 'default1.jpg';

export const SHIMMER_COMMON_DEFAULTS = {
  renderScale: 100,
  cellSize: 1,
  positionX: 50,
  positionY: 50,
  durationSec: 8,
  loopIntensity: 60,
  loop: true,
  showGrid: true,
  showMask: true,
  baseTextureEnabled: false,
  baseTextureBlendMode: 'screen',
  baseTextureOpacity: 76,
  baseTextureScale: 145,
  baseTextureScaleX: 100,
  baseTextureScaleY: 100,
  baseTextureRotationSpeed: 0,
  baseTexturePulseSpeed: 0,
  overlayEnabled: false,
  overlayBlendMode: 'screen',
  overlayOpacity: 62,
  overlayScale: 100,
  overlayRotationSpeed: 12,
  overlayPulseSpeed: 18,
  overlayLayer: 'over-clouds',
  overlayVignetteOpacity: 0,
  overlayVignetteRadius: 72,
  overlayVignetteSoftness: 48,
  overlay2Enabled: false,
  overlay2BlendMode: 'screen',
  overlay2Opacity: 55,
  overlay2Scale: 100,
  overlay2RotationSpeed: 0,
  overlay2PulseSpeed: 12,
  overlay2Layer: 'inside-aperture',
  overlay2VignetteOpacity: 0,
  overlay2VignetteRadius: 62,
  overlay2VignetteSoftness: 50,
  apertureEnabled: true,
  apertureWidth: 24,
  apertureHeight: 18,
  apertureRotation: 0,
  apertureOffsetX: 0,
  apertureOffsetY: 0,
  apertureSoftness: 46,
  apertureOpacity: 96,
  apertureRimGlow: 22,
  apertureRimGlowSize: 44,
  apertureRimGlowOpacity: 28,
  apertureLayer: 'aperture',
  outlineColorMode: 'solid',
  outlineLayer: 'front',
  wispLayer: 'over-clouds',
  armExtraBlur: 0,
  orbitCloudExtraBlur: 0,
  emissionAmount: 0,
  emissionOpacity: 0,
  emissionSpeed: 30,
  emissionDirection: 0,
  emissionVacuum: true,
  emissionTrailLength: 28,
  emissionTrailOpacity: 22
};

export const SHIMMER_PRESET_DEFAULTS = {
  'portal-ring': {
    id: 'portal-ring',
    prototypePresetId: 'portal-threshold',
    label: 'Portal Ring',
    type: 'ring',
    description: 'Portal ring with separate editable aperture, cloudy rim, inner wisps, line outline, orbit clouds and particles.',
    values: {
      ...SHIMMER_COMMON_DEFAULTS,
      type: 'ring', radius: 47, softness: 36, scaleX: 98, scaleY: 104,
      strength: 24, refraction: 22, waveSize: 42, waveSpeed: 42, swirl: 62, noise: 34,
      glow: 54, rimWidth: 68, rimAlpha: 58, middleAlpha: 62, chromatic: 18, blur: 16, pulse: 52,
      coreColor: '#32f1ff', rimColor: '#8e4dff', accentColor: '#ffca66', middleColor: '#0b1731', backdropColor: '#05070f', sourceMode: 'color',
      cloudiness: 70, textureStrength: 68,
      wispAmount: 44, wispOpacity: 42, wispThickness: 42, wispGlow: 38, wispSpeed: 46, wispSize: 48, wispCurl: 62, wispVerticalSpread: 54,
      wispColorA: '#32f1ff', wispColorB: '#ffca66', wispLayer: 'over-clouds',
      outlineThickness: 70, outlineOpacity: 90, outlineGlow: 58, outlineRadius: 100, outlinePulseStrength: 18, outlinePulseSpeed: 48,
      outlineColorA: '#ff2538', outlineColorB: '#e600ff', outlineLayer: 'front',
      apertureWidth: 18, apertureHeight: 16, apertureSoftness: 58, apertureOpacity: 72, apertureRimGlow: 18, apertureRimGlowSize: 40, apertureRimGlowOpacity: 24, apertureLayer: 'aperture',
      orbitCloudAmount: 24, orbitCloudOpacity: 24, orbitCloudSize: 48, orbitCloudSpeed: 35, orbitCloudGamma: 0, orbitCloudRadius: 76, orbitCloudStagger: 38, orbitCloudPulseStrength: 12,
      particleAmount: 36, particleSpeed: 58, particleSpread: 72, particleSize: 22, particleOpacity: 48, particleGlow: 38, particlePulseStrength: 0,
      armAmount: 0, armOpacity: 0, armThickness: 0, armSoftness: 0, armDefinition: 0, armSpeed: 0, armCurl: 0, armRadius: 0, armPulseStrength: 0,
      loopIntensity: 66, durationSec: 8
    }
  },
  'wormhole-tunnel': {
    id: 'wormhole-tunnel',
    prototypePresetId: 'wormhole-tunnel',
    label: 'Wormhole Tunnel',
    type: 'wormhole',
    description: 'Darker wormhole with visible arm controls, emission off by default and capped additive brightness.',
    values: {
      ...SHIMMER_COMMON_DEFAULTS,
      type: 'wormhole', radius: 56, softness: 54, scaleX: 118, scaleY: 90,
      strength: 30, refraction: 24, waveSize: 52, waveSpeed: 28, swirl: 78, noise: 20,
      glow: 12, rimWidth: 52, rimAlpha: 22, middleAlpha: 0, chromatic: 10, blur: 22, pulse: 28,
      coreColor: '#28dfff', rimColor: '#255bff', accentColor: '#9d5cff', middleColor: '#07102b', backdropColor: '#020611', sourceMode: 'color',
      baseTextureEnabled: true, baseTextureBlendMode: 'screen', baseTextureOpacity: 78, baseTextureScale: 150, baseTextureScaleX: 100, baseTextureScaleY: 100, baseTextureRotationSpeed: 0, baseTexturePulseSpeed: 0,
      cloudiness: 46, textureStrength: 55,
      wispAmount: 0, wispOpacity: 0, wispThickness: 0, wispGlow: 0, wispSpeed: 0, wispSize: 0, wispCurl: 0, wispVerticalSpread: 0, wispColorA: '#28dfff', wispColorB: '#9d5cff',
      armAmount: 64, armOpacity: 68, armThickness: 58, armSoftness: 28, armDefinition: 72, armSpeed: 34, armCurl: 72, armRadius: 72, armPulseStrength: 12,
      orbitCloudAmount: 8, orbitCloudOpacity: 8, orbitCloudSize: 32, orbitCloudSpeed: 24, orbitCloudRadius: 60, orbitCloudStagger: 42, orbitCloudPulseStrength: 6,
      particleAmount: 18, particleSpeed: 28, particleSpread: 48, particleSize: 18, particleOpacity: 18, particleGlow: 20, particlePulseStrength: 4,
      emissionAmount: 0, emissionOpacity: 0, emissionSpeed: 34, emissionDirection: 0, emissionVacuum: true, emissionTrailLength: 28, emissionTrailOpacity: 24,
      renderScale: 94, durationSec: 10, loopIntensity: 52, showMask: false,
      apertureWidth: 23, apertureHeight: 17, apertureSoftness: 42, apertureOpacity: 98, apertureRimGlow: 24, apertureRimGlowSize: 42, apertureRimGlowOpacity: 30,
      overlayVignetteOpacity: 0, overlayVignetteRadius: 74, overlayVignetteSoftness: 48,
      overlay2Enabled: false, overlay2BlendMode: 'screen', overlay2Opacity: 54, overlay2Scale: 100, overlay2RotationSpeed: 0, overlay2PulseSpeed: 12, overlay2Layer: 'inside-aperture', overlay2VignetteOpacity: 0, overlay2VignetteRadius: 62, overlay2VignetteSoftness: 50
    }
  },
  'heat-shimmer': {
    id: 'heat-shimmer',
    prototypePresetId: 'heat-shimmer',
    label: 'Heat Shimmer',
    type: 'heat',
    description: 'Horizontal mirage distortion for fire, hot air, desert haze and invisible magical pressure.',
    values: {
      ...SHIMMER_COMMON_DEFAULTS,
      type: 'heat', radius: 86, softness: 70, scaleX: 170, scaleY: 58,
      strength: 36, refraction: 78, waveSize: 24, waveSpeed: 58, swirl: 0, noise: 48,
      glow: 18, rimWidth: 18, rimAlpha: 20, outlineThickness: 0, outlineOpacity: 0, outlineGlow: 0, outlineRadius: 86, outlinePulseStrength: 0, outlinePulseSpeed: 40, outlineColorA: '#32f1ff', outlineColorB: '#8e4dff',
      middleAlpha: 0, chromatic: 12, blur: 42, pulse: 18,
      coreColor: '#ffe0a3', rimColor: '#ff8a3d', accentColor: '#fff1d4', middleColor: '#000000', backdropColor: '#110b06', sourceMode: 'color',
      cloudiness: 0, textureStrength: 68,
      wispAmount: 0, wispOpacity: 0, wispThickness: 0, wispGlow: 0, wispSpeed: 42, wispSize: 0, wispCurl: 44, wispVerticalSpread: 0, wispColorA: '#ffe0a3', wispColorB: '#ff8a3d',
      armAmount: 0, armOpacity: 0, armThickness: 44, armSoftness: 46, armDefinition: 42, armSpeed: 40, armCurl: 44, armRadius: 72, armPulseStrength: 0,
      orbitCloudAmount: 0, orbitCloudOpacity: 0, orbitCloudSize: 60, orbitCloudSpeed: 35, orbitCloudGamma: 0, orbitCloudRadius: 72, orbitCloudStagger: 48, orbitCloudPulseStrength: 0,
      particleAmount: 0, particleSpeed: 46, particleSpread: 64, particleSize: 0, particleOpacity: 62, particleGlow: 45, particlePulseStrength: 0,
      positionY: 48, durationSec: 6, loopIntensity: 72, showMask: false
    }
  },
  'transition-tear': {
    id: 'transition-tear',
    prototypePresetId: 'transition-tear',
    label: 'Transition Tear',
    type: 'transition',
    description: 'Short violent displacement for scene transitions, cursed cuts and magical fractures.',
    values: {
      ...SHIMMER_COMMON_DEFAULTS,
      type: 'transition', radius: 82, softness: 12, scaleX: 10, scaleY: 165,
      strength: 96, refraction: 84, waveSize: 8, waveSpeed: 96, swirl: 0, noise: 94,
      glow: 34, rimWidth: 18, rimAlpha: 46, outlineThickness: 0, outlineOpacity: 0, outlineGlow: 0, outlineRadius: 86, outlinePulseStrength: 0, outlinePulseSpeed: 40, outlineColorA: '#32f1ff', outlineColorB: '#8e4dff',
      middleAlpha: 0, chromatic: 90, blur: 18, pulse: 88,
      coreColor: '#e6f7ff', rimColor: '#ff514c', accentColor: '#33f0d8', middleColor: '#000000', backdropColor: '#080606', sourceMode: 'color',
      cloudiness: 0, textureStrength: 68,
      wispAmount: 0, wispOpacity: 0, wispThickness: 0, wispGlow: 0, wispSpeed: 42, wispSize: 54, wispCurl: 44, wispVerticalSpread: 0, wispColorA: '#e6f7ff', wispColorB: '#ff514c',
      armAmount: 0, armOpacity: 0, armThickness: 44, armSoftness: 46, armDefinition: 42, armSpeed: 40, armCurl: 44, armRadius: 72, armPulseStrength: 0,
      orbitCloudAmount: 0, orbitCloudOpacity: 0, orbitCloudSize: 60, orbitCloudSpeed: 35, orbitCloudGamma: 0, orbitCloudRadius: 72, orbitCloudStagger: 48, orbitCloudPulseStrength: 0,
      particleAmount: 48, particleSpeed: 46, particleSpread: 64, particleSize: 16, particleOpacity: 50, particleGlow: 40, particlePulseStrength: 0,
      durationSec: 3, loopIntensity: 22, loop: false, showMask: false
    }
  }
};

const control = {
  range: (field, label, min, max, step = 1, extra = {}) => ({ type: 'range', field, label, min, max, step, ...extra }),
  select: (field, label, options, extra = {}) => ({ type: 'select', field, label, options, ...extra }),
  checkbox: (field, label, extra = {}) => ({ type: 'checkbox', field, label, ...extra }),
  color: (field, label, extra = {}) => ({ type: 'color', field, label, ...extra }),
  file: (field, label, accept = 'image/png,image/jpeg,image/webp', extra = {}) => ({ type: 'file', field, label, accept, ...extra }),
  action: (action, label, extra = {}) => ({ type: 'action', action, label, ...extra })
};

export const SHIMMER_CONTROL_GROUPS = [
  {
    id: 'shape',
    title: 'Shape',
    controls: [
      control.select('type', 'Distortion type', TYPE_OPTIONS),
      control.range('radius', 'Radius', 10, 100),
      control.range('softness', 'Soft edge', 0, 100),
      control.range('scaleX', 'Horizontal scale', 0, 180),
      control.range('scaleY', 'Vertical scale', 0, 180)
    ]
  },
  {
    id: 'distortion',
    title: 'Distortion',
    controls: [
      control.range('strength', 'Strength', 0, 100),
      control.range('refraction', 'Refraction', 0, 100),
      control.range('waveSize', 'Wave size', 1, 100),
      control.range('waveSpeed', 'Wave speed', 0, 100),
      control.range('swirl', 'Swirl', -100, 100),
      control.range('noise', 'Noise break-up', 0, 100)
    ]
  },
  {
    id: 'visual-layer',
    title: 'Visual layer',
    controls: [
      control.range('glow', 'Glow', 0, 100),
      control.range('rimWidth', 'Cloud thickness', 0, 100),
      control.range('rimAlpha', 'Rim alpha', 0, 100),
      control.range('middleAlpha', 'Middle alpha', 0, 100),
      control.range('chromatic', 'Chromatic split', 0, 100),
      control.range('pulse', 'Pulse', 0, 100),
      control.range('blur', 'Blur pass', 0, 100),
      control.range('cloudiness', 'Cloud roughness', 0, 100),
      control.range('textureStrength', 'Texture strength', 0, 100),
      control.range('loopIntensity', 'Loop intensity', 0, 100)
    ]
  },
  {
    id: 'portal-inner-wisps',
    title: 'Portal inner wisps',
    controls: [
      control.range('wispAmount', 'Amount', 0, 100),
      control.range('wispOpacity', 'Opacity', 0, 100),
      control.range('wispThickness', 'Thickness', 0, 100),
      control.range('wispGlow', 'Glow', 0, 100),
      control.range('wispSpeed', 'Speed', 0, 100),
      control.range('wispCurl', 'Curl / wave amount', 0, 100),
      control.range('wispVerticalSpread', 'Vertical spread', 0, 100),
      control.range('wispSize', 'Legacy size', 0, 100),
      control.color('wispColorA', 'Colour A'),
      control.color('wispColorB', 'Colour B'),
      control.select('wispLayer', 'Layer position', WISP_LAYER_OPTIONS)
    ]
  },
  {
    id: 'portal-line-outline',
    title: 'Portal line outline',
    controls: [
      control.range('outlineThickness', 'Line thickness', 0, 300),
      control.range('outlineOpacity', 'Line opacity', 0, 100),
      control.range('outlineGlow', 'Line glow', 0, 100),
      control.range('outlineRadius', 'Line radius', 55, 135),
      control.range('outlinePulseStrength', 'Line pulse strength', 0, 100),
      control.range('outlinePulseSpeed', 'Line pulse speed', 0, 100),
      control.select('outlineLayer', 'Line layer position', OUTLINE_LAYER_OPTIONS),
      control.select('outlineColorMode', 'Line colour mode', OUTLINE_COLOR_MODE_OPTIONS),
      control.color('outlineColorA', 'Line colour A'),
      control.color('outlineColorB', 'Line colour B'),
      control.file('outlineFile', 'Line colour image', 'image/png,image/jpeg,image/webp', { statusField: 'outlineStatus' })
    ]
  },
  {
    id: 'colour-texture',
    title: 'Colour / texture',
    controls: [
      control.select('sourceMode', 'Source mode', SOURCE_MODE_OPTIONS),
      control.color('coreColor', 'Core'),
      control.color('rimColor', 'Rim'),
      control.color('accentColor', 'Accent'),
      control.color('backdropColor', 'Backdrop'),
      control.color('middleColor', 'Middle / core underlay')
    ]
  },
  {
    id: 'arms-nebula-bands',
    title: 'Arms / nebula bands',
    controls: [
      control.checkbox('baseTextureEnabled', 'Use JPG as wormhole arm texture'),
      control.file('baseTextureFile', 'Arm texture JPG', 'image/png,image/jpeg,image/webp', { assetSlot: 'base', assetOptions: DEFAULT_BASE_ASSETS }),
      control.select('baseTextureBlendMode', 'Arm texture blend mode', BLEND_MODES),
      control.range('baseTextureOpacity', 'Arm texture opacity', 0, 100),
      control.range('baseTextureScale', 'Arm texture overall scale', 10, 240),
      control.range('baseTextureScaleX', 'Texture X scale', 10, 260),
      control.range('baseTextureScaleY', 'Texture Y scale', 10, 260),
      control.range('baseTextureRotationSpeed', 'Arm texture rotation', -100, 100),
      control.range('baseTexturePulseSpeed', 'Arm texture pulse', 0, 100),
      control.range('armAmount', 'Arm amount', 0, 100),
      control.range('armOpacity', 'Arm opacity', 0, 100),
      control.range('armThickness', 'Arm thickness', 0, 100),
      control.range('armRadius', 'Arm radius', 0, 100),
      control.range('armSoftness', 'Arm softness', 0, 100),
      control.range('armDefinition', 'Arm definition', 0, 100),
      control.range('armExtraBlur', 'Extra arm blur', 0, 100),
      control.range('armPulseStrength', 'Arm pulse strength', 0, 100),
      control.range('armSpeed', 'Arm rotation speed', 0, 100),
      control.range('armCurl', 'Arm curl / turns', 0, 100)
    ]
  },
  {
    id: 'orbit-clouds',
    title: 'Orbit clouds',
    controls: [
      control.range('orbitCloudAmount', 'Cloud amount', 0, 100),
      control.range('orbitCloudOpacity', 'Cloud opacity', 0, 100),
      control.range('orbitCloudSize', 'Cloud size', 0, 100),
      control.range('orbitCloudRadius', 'Orbit radius', 0, 100),
      control.range('orbitCloudStagger', 'Cloud stagger', 0, 100),
      control.range('orbitCloudPulseStrength', 'Cloud pulse strength', 0, 100),
      control.range('orbitCloudSpeed', 'Cloud orbit speed', 0, 100),
      control.range('orbitCloudGamma', 'Cloud gamma / brightness', 0, 100),
      control.range('orbitCloudExtraBlur', 'Extra cloud blur', 0, 100)
    ]
  },
  {
    id: 'particles',
    title: 'Particles',
    controls: [
      control.range('particleAmount', 'Particle amount', 0, 100),
      control.range('particleOpacity', 'Particle opacity', 0, 100),
      control.range('particleSpeed', 'Particle speed', 0, 100),
      control.range('particlePulseStrength', 'Particle pulse strength', 0, 100),
      control.range('particleSpread', 'Particle spread', 0, 100),
      control.range('particleSize', 'Particle size', 0, 100),
      control.range('particleGlow', 'Particle glow', 0, 100)
    ]
  },
  {
    id: 'emission',
    title: 'Emission',
    controls: [
      control.range('emissionAmount', 'Emission amount', 0, 100),
      control.range('emissionOpacity', 'Emission opacity', 0, 100),
      control.range('emissionSpeed', 'Emission speed', 0, 100),
      control.range('emissionDirection', 'Emission direction °', 0, 360),
      control.checkbox('emissionVacuum', 'Vacuum / suck particles inward'),
      control.range('emissionTrailLength', 'Trail length', 0, 100),
      control.range('emissionTrailOpacity', 'Trail opacity', 0, 100)
    ]
  },
  {
    id: 'aperture-control',
    title: 'Aperture control',
    controls: [
      control.checkbox('apertureEnabled', 'Enable aperture'),
      control.range('apertureWidth', 'Aperture width', 0, 100),
      control.range('apertureHeight', 'Aperture height', 0, 100),
      control.range('apertureRotation', 'Rotation °', -180, 180),
      control.range('apertureSoftness', 'Edge softness', 0, 100),
      control.range('apertureOffsetX', 'Offset X', -100, 100),
      control.range('apertureOffsetY', 'Offset Y', -100, 100),
      control.range('apertureOpacity', 'Aperture opacity', 0, 100),
      control.range('apertureRimGlow', 'Rim glow', 0, 100),
      control.range('apertureRimGlowSize', 'Rim glow size', 0, 100),
      control.range('apertureRimGlowOpacity', 'Rim glow opacity', 0, 100),
      control.select('apertureLayer', 'Layer position', APERTURE_LAYER_OPTIONS)
    ]
  },
  {
    id: 'png-overlay-1',
    title: 'PNG overlay 1',
    controls: [
      control.checkbox('overlayEnabled', 'Enable overlay 1'),
      control.file('overlayFile', 'PNG overlay 1 image', 'image/png,image/jpeg,image/webp', { assetSlot: 'overlay', assetOptions: DEFAULT_OVERLAY_ASSETS }),
      control.select('overlayBlendMode', 'Blend mode', OVERLAY_BLEND_MODES),
      control.range('overlayOpacity', 'Overlay opacity', 0, 100),
      control.range('overlayScale', 'Overlay scale', 10, 220),
      control.range('overlayRotationSpeed', 'Rotation speed', -100, 100),
      control.range('overlayPulseSpeed', 'Pulse speed', 0, 100),
      control.range('overlayVignetteOpacity', 'Vignette opacity', 0, 100),
      control.range('overlayVignetteRadius', 'Vignette radius', 0, 100),
      control.range('overlayVignetteSoftness', 'Vignette softness', 0, 100),
      control.action('overlay-back', '− Layer'),
      control.action('overlay-forward', 'Layer +'),
      control.select('overlayLayer', 'Layer position', OVERLAY_LAYER_OPTIONS)
    ]
  },
  {
    id: 'png-overlay-2',
    title: 'PNG overlay 2',
    controls: [
      control.checkbox('overlay2Enabled', 'Enable overlay 2'),
      control.file('overlay2File', 'PNG overlay 2 image', 'image/png,image/jpeg,image/webp', { assetSlot: 'overlay2', assetOptions: DEFAULT_OVERLAY_ASSETS }),
      control.select('overlay2BlendMode', 'Blend mode', OVERLAY_BLEND_MODES),
      control.range('overlay2Opacity', 'Overlay opacity', 0, 100),
      control.range('overlay2Scale', 'Overlay scale', 10, 220),
      control.range('overlay2RotationSpeed', 'Rotation speed', -100, 100),
      control.range('overlay2PulseSpeed', 'Pulse speed', 0, 100),
      control.range('overlay2VignetteOpacity', 'Vignette opacity', 0, 100),
      control.range('overlay2VignetteRadius', 'Vignette radius', 0, 100),
      control.range('overlay2VignetteSoftness', 'Vignette softness', 0, 100),
      control.action('overlay2-back', '− Layer'),
      control.action('overlay2-forward', 'Layer +'),
      control.select('overlay2Layer', 'Layer position', OVERLAY_LAYER_OPTIONS)
    ]
  },
  {
    id: 'placement-playback',
    title: 'Placement / playback',
    controls: [
      control.range('positionX', 'Position X', 0, 100),
      control.range('positionY', 'Position Y', 0, 100),
      control.range('durationSec', 'Duration sec', 1, 20),
      control.range('renderScale', 'Render scale', 50, 100),
      control.range('cellSize', 'Cell size', 1, 10),
      control.checkbox('loop', 'Loop until stopped')
    ]
  }
];

export const SHIMMER_VISIBLE_GROUPS_BY_TYPE = {
  ring: ['Shape', 'Distortion', 'Visual layer', 'Portal inner wisps', 'Portal line outline', 'Colour / texture', 'Orbit clouds', 'Particles', 'Aperture control', 'PNG overlay 1', 'PNG overlay 2', 'Placement / playback'],
  wormhole: ['Shape', 'Distortion', 'Visual layer', 'Colour / texture', 'Arms / nebula bands', 'Orbit clouds', 'Particles', 'Emission', 'Aperture control', 'PNG overlay 1', 'PNG overlay 2', 'Placement / playback'],
  heat: ['Shape', 'Distortion', 'Visual layer', 'Colour / texture', 'Placement / playback'],
  transition: ['Shape', 'Distortion', 'Visual layer', 'Colour / texture', 'Particles', 'Placement / playback']
};

export const SHIMMER_CONTROL_AUDIT = {
  presetsChecked: ['Portal Ring', 'Wormhole Tunnel', 'Heat Shimmer', 'Transition Tear'],
  groupsChecked: SHIMMER_CONTROL_GROUPS.map((group) => group.title),
  sourceVisibilityMapChecked: true,
  assetListsChecked: true,
  defaultValuesCheckedFromPresetsJs: true,
  notConnectedYet: true
};

export function cloneShimmerDefaults(presetId = 'portal-ring') {
  const preset = SHIMMER_PRESET_DEFAULTS[presetId] || SHIMMER_PRESET_DEFAULTS['portal-ring'];
  return JSON.parse(JSON.stringify(preset.values));
}

export function getShimmerControlGroups(type = 'ring') {
  const visible = new Set(SHIMMER_VISIBLE_GROUPS_BY_TYPE[type] || SHIMMER_VISIBLE_GROUPS_BY_TYPE.ring);
  return SHIMMER_CONTROL_GROUPS.filter((group) => visible.has(group.title));
}
