import { SHIMMER_CONTROL_GROUPS, SHIMMER_PRESET_DEFAULTS } from './shimmer-controls.js';

const EXTENDED_WORMHOLE_CONTROL_MAX = new Map([
  ['orbitCloudAmount', 200],
  ['orbitCloudOpacity', 200],
  ['orbitCloudSize', 200],
  ['orbitCloudSpeed', 200],
  ['particleOpacity', 200],
  ['emissionOpacity', 200],
  ['emissionTrailOpacity', 200]
]);

if (SHIMMER_PRESET_DEFAULTS?.['wormhole-tunnel']?.values) {
  Object.assign(SHIMMER_PRESET_DEFAULTS['wormhole-tunnel'].values, {
    radius: 20,
    orbitCloudScaleX: 100,
    orbitCloudScaleY: 100
  });
}

for (const group of SHIMMER_CONTROL_GROUPS) {
  if (group.id === 'orbit-clouds') {
    const controls = group.controls || [];
    if (!controls.some((control) => control.field === 'orbitCloudScaleX')) {
      const radiusIndex = Math.max(0, controls.findIndex((control) => control.field === 'orbitCloudRadius'));
      controls.splice(radiusIndex + 1, 0,
        { type: 'range', field: 'orbitCloudScaleX', label: 'Cloud scale X', min: 20, max: 220, step: 1 },
        { type: 'range', field: 'orbitCloudScaleY', label: 'Cloud scale Y', min: 20, max: 220, step: 1 }
      );
    }
  }

  for (const control of group.controls || []) {
    if (EXTENDED_WORMHOLE_CONTROL_MAX.has(control.field)) {
      control.max = EXTENDED_WORMHOLE_CONTROL_MAX.get(control.field);
      control.extendedWormholeRange = true;
    }
  }
}
