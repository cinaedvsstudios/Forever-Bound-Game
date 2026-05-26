export const COMPOSITES_REGISTRY = [
  {
    id: 'aetheris-bloom',
    label: 'Aetheris Bloom',
    description: 'A small blue-white restoration bloom with purple magical residue.',
    layers: [
      {
        name: 'Aetheris Core',
        engine: 'ring',
        colorA: '#dffcff',
        colorB: '#00a1d7',
        alphaStart: 0.95,
        alphaEnd: 0,
        sizeStart: 14,
        sizeEnd: 30,
        glow: 28,
        spawnRate: 56,
        speedMin: 2.5,
        speedMax: 5,
        angle: 0,
        spread: 360,
        gravity: 0,
        lifetime: 54,
        emitterX: 640,
        emitterY: 380
      },
      {
        name: 'Songspell Dust',
        engine: 'particles',
        colorA: '#d65cff',
        colorB: '#8d4cff',
        alphaStart: 0.7,
        alphaEnd: 0,
        sizeStart: 12,
        sizeEnd: 2,
        glow: 22,
        spawnRate: 22,
        speedMin: 0.8,
        speedMax: 4.2,
        angle: -90,
        spread: 160,
        gravity: -0.005,
        lifetime: 92,
        emitterX: 640,
        emitterY: 420
      }
    ]
  },
  {
    id: 'lethemar-corruption',
    label: 'Lethemar Corruption',
    description: 'Green-black hostile magic pulse for possession or cursed ground.',
    layers: [
      {
        name: 'Corruption Smoke',
        engine: 'gas',
        colorA: '#0aff6a',
        colorB: '#07100a',
        alphaStart: 0.55,
        alphaEnd: 0,
        sizeStart: 35,
        sizeEnd: 82,
        glow: 12,
        spawnRate: 16,
        speedMin: 0.3,
        speedMax: 2.2,
        angle: -90,
        spread: 220,
        gravity: -0.01,
        lifetime: 150,
        emitterX: 640,
        emitterY: 510
      },
      {
        name: 'Corruption Sparks',
        engine: 'particles',
        colorA: '#7cff00',
        colorB: '#003a12',
        alphaStart: 1,
        alphaEnd: 0,
        sizeStart: 9,
        sizeEnd: 1,
        glow: 18,
        spawnRate: 20,
        speedMin: 1.5,
        speedMax: 8,
        angle: -90,
        spread: 150,
        gravity: 0.02,
        lifetime: 60,
        emitterX: 640,
        emitterY: 470
      }
    ]
  }
];

export const COMPOSITE_EFFECT_PRESETS = COMPOSITES_REGISTRY;

export function cloneCompositePreset(id) {
  const preset = COMPOSITES_REGISTRY.find((item) => item.id === id);
  return preset ? JSON.parse(JSON.stringify(preset)) : null;
}
