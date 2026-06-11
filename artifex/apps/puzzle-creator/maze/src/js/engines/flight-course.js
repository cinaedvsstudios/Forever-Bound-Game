export default {
  id: 'obstacle-course',
  label: 'Obstacle Course',
  icon: '✦',
  moduleType: 'route_obstacle_course',
  mode: 'travel_mode',
  defaultModuleId: 'ch00_optional_obstacle_course',
  callingText: 'Follow the route, avoid obstacles, collect markers, and reach the end.',
  purpose: 'Creates a movement course with route markers, obstacle lanes, collectibles, scoring, and result tiers.',
  fields: [
    { key: 'courseTheme', label: 'Course Theme', type: 'select', value: 'forest_route', options: [['forest_route', 'Forest Route'], ['mountain_pass', 'Mountain Pass'], ['ruin_arches', 'Ruins and Arches'], ['night_sky', 'Night Sky']] },
    { key: 'routeMarkers', label: 'Route Markers', type: 'range', value: 18, min: 5, max: 40, step: 1 },
    { key: 'obstacleDensity', label: 'Obstacle Density', type: 'range', value: 35, min: 0, max: 100, step: 5 },
    { key: 'collectibleCount', label: 'Collectibles', type: 'range', value: 24, min: 0, max: 60, step: 1 },
    { key: 'scoreTierReward', label: 'Score Reward', type: 'select', value: 'tiered_supplies', options: [['none', 'No reward'], ['tiered_supplies', 'Tiered Supplies'], ['silver', 'Silver'], ['ingredient_bundle', 'Ingredient Bundle']] }
  ],
  preview: { kind: 'obstacle', accent: '#8ee6dc' }
};
