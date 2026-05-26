export default {
  id: 'flight-course',
  label: 'Flight Course',
  icon: '✈',
  moduleType: 'on_rails_aerial_course',
  mode: 'travel_mode',
  defaultModuleId: 'ch00_optional_flight_course',
  callingText: 'Follow the glowing route, avoid obstacles, collect markers, and reach the end with the highest score.',
  purpose: 'Creates an on-rails pseudo-3D movement course with route markers, obstacle lanes, collectibles, scoring, and result tiers.',
  fields: [
    { key: 'courseTheme', label: 'Course Theme', type: 'select', value: 'sky_forest_lake', options: [['sky_forest_lake', 'Sky / Forest / Lake'], ['mountain_pass', 'Mountain Pass'], ['ruin_arches', 'Ruins and Arches'], ['night_sky', 'Night Sky']] },
    { key: 'routeMarkers', label: 'Route Markers', type: 'range', value: 18, min: 5, max: 40, step: 1 },
    { key: 'obstacleDensity', label: 'Obstacle Density', type: 'range', value: 35, min: 0, max: 100, step: 5 },
    { key: 'collectibleCount', label: 'Collectibles', type: 'range', value: 24, min: 0, max: 60, step: 1 },
    { key: 'scoreTierReward', label: 'Score Reward', type: 'select', value: 'tiered_supplies', options: [['none', 'No reward'], ['tiered_supplies', 'Tiered Supplies'], ['silver', 'Silver'], ['ingredient_bundle', 'Ingredient Bundle']] }
  ],
  preview: { kind: 'flight', accent: '#8ee6dc' }
};
