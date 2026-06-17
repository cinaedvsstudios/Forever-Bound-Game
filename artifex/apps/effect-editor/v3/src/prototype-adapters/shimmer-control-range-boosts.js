import { SHIMMER_CONTROL_GROUPS, SHIMMER_PRESET_DEFAULTS } from './shimmer-controls.js';

const EXTENDED_WORMHOLE_CONTROL_MAX = new Map([
  ['orbitCloudAmount', 200],
  ['orbitCloudOpacity', 200],
  ['orbitCloudSize', 200],
  ['particleOpacity', 200],
  ['emissionOpacity', 200],
  ['emissionTrailOpacity', 200]
]);

if (SHIMMER_PRESET_DEFAULTS?.['wormhole-tunnel']?.values) {
  SHIMMER_PRESET_DEFAULTS['wormhole-tunnel'].values.radius = 20;
}

for (const group of SHIMMER_CONTROL_GROUPS) {
  for (const control of group.controls || []) {
    if (EXTENDED_WORMHOLE_CONTROL_MAX.has(control.field)) {
      control.max = EXTENDED_WORMHOLE_CONTROL_MAX.get(control.field);
      control.extendedWormholeRange = true;
    }
  }
}
