export default {
  id: 'corruption-flow',
  label: 'Corruption Flow',
  icon: '●',
  moduleType: 'living_hazard_containment',
  mode: 'scene_mode',
  defaultModuleId: 'ch00_optional_corruption_flow',
  callingText: 'Avoid, cleanse, contain, or escape the spreading black corruption.',
  purpose: 'Creates a living hazard challenge with pulsing blob zones, spread rules, proximity danger, cleansing interaction, survival timer, and win/loss state.',
  fields: [
    { key: 'hazardMode', label: 'Hazard Mode', type: 'select', value: 'avoid_escape', options: [['avoid_escape', 'Avoid and Escape'], ['cleanse_sources', 'Cleanse Sources'], ['containment', 'Containment'], ['survival_timer', 'Survival Timer']] },
    { key: 'blobCount', label: 'Blob Sources', type: 'range', value: 5, min: 1, max: 16, step: 1 },
    { key: 'spreadRate', label: 'Spread Rate', type: 'range', value: 35, min: 0, max: 100, step: 5 },
    { key: 'safePathWidth', label: 'Safe Path Width', type: 'range', value: 45, min: 10, max: 100, step: 5 },
    { key: 'cleansingTool', label: 'Cleansing Tool', type: 'select', value: 'songspell_or_saltseal', options: [['songspell_or_saltseal', 'Songspell or Saltseal'], ['aetheris_relic', 'Aetheris Relic'], ['none', 'No Cleansing']] }
  ],
  preview: { kind: 'corruption', accent: '#0b1110' }
};
