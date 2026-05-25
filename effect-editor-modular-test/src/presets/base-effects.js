export const PRESETS_REGISTRY = {
  base: [
    {
      id: 'standard-particle',
      label: 'Standard Particle',
      engine: 'particles',
      description: 'A neutral particle emitter used as the basic render smoke test.',
      config: {
        name: 'Standard Particle',
        engine: 'particles',
        colorA: '#ffcc66',
        colorB: '#ff6600',
        alphaStart: 1,
        alphaEnd: 0,
        sizeStart: 20,
        sizeEnd: 3,
        glow: 14,
        spawnRate: 18,
        speedMin: 1.5,
        speedMax: 6,
        angle: -90,
        spread: 70,
        gravity: 0.035,
        lifetime: 82,
        emitterX: 640,
        emitterY: 460
      }
    },
    {
      id: 'electric-discharge',
      label: 'Electric Discharge',
      engine: 'lightning',
      description: 'Fast blue-white sparks for electricity or magic cracks.',
      config: {
        name: 'Electric Discharge',
        engine: 'lightning',
        colorA: '#b9f7ff',
        colorB: '#4f8dff',
        alphaStart: 1,
        alphaEnd: 0,
        sizeStart: 8,
        sizeEnd: 1,
        glow: 24,
        spawnRate: 30,
        speedMin: 5,
        speedMax: 14,
        angle: -90,
        spread: 180,
        gravity: -0.01,
        lifetime: 28,
        emitterX: 640,
        emitterY: 360
      }
    },
    {
      id: 'projectile-core',
      label: 'Projectile Core',
      engine: 'projectile',
      description: 'Dense forward burst for fireballs or thrown magic.',
      config: {
        name: 'Projectile Core',
        engine: 'projectile',
        colorA: '#fff1a8',
        colorB: '#ff2d00',
        alphaStart: 1,
        alphaEnd: 0,
        sizeStart: 26,
        sizeEnd: 2,
        glow: 28,
        spawnRate: 26,
        speedMin: 4,
        speedMax: 10,
        angle: 0,
        spread: 30,
        gravity: 0.01,
        lifetime: 65,
        emitterX: 420,
        emitterY: 370
      }
    },
    {
      id: 'magic-trail',
      label: 'Magic Trail / Ribbon',
      engine: 'ribbon',
      description: 'Purple trail particles for good magic or Songspell residue.',
      config: {
        name: 'Magic Trail / Ribbon',
        engine: 'ribbon',
        colorA: '#d65cff',
        colorB: '#5830ff',
        alphaStart: 0.85,
        alphaEnd: 0,
        sizeStart: 28,
        sizeEnd: 7,
        glow: 32,
        spawnRate: 22,
        speedMin: 0.5,
        speedMax: 3.8,
        angle: 0,
        spread: 120,
        gravity: 0,
        lifetime: 110,
        emitterX: 460,
        emitterY: 430
      }
    },
    {
      id: 'shockwave-ring',
      label: 'Shockwave Ring',
      engine: 'ring',
      description: 'Radial burst particles that simulate a circular shockwave.',
      config: {
        name: 'Shockwave Ring',
        engine: 'ring',
        colorA: '#ffffff',
        colorB: '#8eeaff',
        alphaStart: 0.9,
        alphaEnd: 0,
        sizeStart: 10,
        sizeEnd: 26,
        glow: 18,
        spawnRate: 64,
        speedMin: 5,
        speedMax: 8,
        angle: 0,
        spread: 360,
        gravity: 0,
        lifetime: 45,
        emitterX: 640,
        emitterY: 360
      }
    },
    {
      id: 'soft-smoke',
      label: 'Soft Smoke / Gas Base',
      engine: 'gas',
      description: 'Low contrast smoke grains with slow upward drift.',
      config: {
        name: 'Soft Smoke / Gas Base',
        engine: 'gas',
        colorA: '#d4d0c8',
        colorB: '#5d5854',
        alphaStart: 0.34,
        alphaEnd: 0,
        sizeStart: 42,
        sizeEnd: 78,
        glow: 0,
        spawnRate: 12,
        speedMin: 0.2,
        speedMax: 1.6,
        angle: -90,
        spread: 120,
        gravity: -0.016,
        lifetime: 160,
        emitterX: 640,
        emitterY: 520
      }
    },
    {
      id: 'heat-shimmer-refraction',
      label: 'Heat Shimmer / Refraction',
      engine: 'refraction',
      description: 'Soft amber distortion draft for heat haze, shimmer, and refraction concepts.',
      config: {
        name: 'Heat Shimmer / Refraction',
        engine: 'refraction',
        colorA: '#ffe0a0',
        colorB: '#6dd6ff',
        alphaStart: 0.22,
        alphaEnd: 0,
        sizeStart: 34,
        sizeEnd: 92,
        glow: 10,
        spawnRate: 10,
        speedMin: 0.15,
        speedMax: 1.1,
        angle: -90,
        spread: 70,
        gravity: -0.008,
        lifetime: 140,
        emitterX: 640,
        emitterY: 500
      }
    },
    {
      id: 'lens-flare-optic',
      label: 'Lens Flare / Optic',
      engine: 'lensflare',
      description: 'Bright optical glint base for lens flares, magical glows, and sparkle pickups.',
      config: {
        name: 'Lens Flare / Optic',
        engine: 'lensflare',
        colorA: '#fff6c8',
        colorB: '#6de5ff',
        alphaStart: 0.92,
        alphaEnd: 0,
        sizeStart: 12,
        sizeEnd: 44,
        glow: 38,
        spawnRate: 8,
        speedMin: 0.05,
        speedMax: 0.8,
        angle: 0,
        spread: 360,
        gravity: 0,
        lifetime: 72,
        emitterX: 640,
        emitterY: 360
      }
    }
  ]
};

export const BASE_EFFECT_PRESETS = PRESETS_REGISTRY;

export function cloneBasePreset(category, id) {
  const group = PRESETS_REGISTRY[category] || [];
  const preset = group.find((item) => item.id === id);
  return preset ? JSON.parse(JSON.stringify(preset)) : null;
}

export function listBaseCategories() {
  return Object.keys(PRESETS_REGISTRY);
}

export function listBasePresets() {
  return Object.values(PRESETS_REGISTRY).flat();
}
