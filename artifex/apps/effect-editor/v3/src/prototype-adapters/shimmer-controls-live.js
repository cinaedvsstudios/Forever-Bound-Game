import { SHIMMER_PRESET_DEFAULTS, cloneShimmerDefaults, getShimmerControlGroups as baseGroups } from './shimmer-controls.js';

const MAX_200 = ['orbitCloudAmount', 'orbitCloudOpacity', 'orbitCloudSize', 'particleOpacity', 'emissionOpacity', 'emissionTrailOpacity'];

export { SHIMMER_PRESET_DEFAULTS, cloneShimmerDefaults };

export function getShimmerControlGroups(mode = 'portal-ring') {
  return baseGroups(mode).map((group) => ({
    ...group,
    controls: (group.controls || []).map((control) => MAX_200.includes(control.field) ? { ...control, max: 200 } : control)
  }));
}
