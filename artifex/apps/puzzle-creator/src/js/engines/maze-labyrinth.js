export default {
  id: 'maze-labyrinth',
  label: 'Maze / Labyrinth',
  icon: '◇',
  moduleType: 'grid_route_labyrinth',
  mode: 'scene_mode',
  defaultModuleId: 'ch00_optional_maze_labyrinth',
  callingText: 'Find the correct passage through the labyrinth and reach the exit.',
  purpose: 'Creates a grid-based maze or labyrinth puzzle with one entrance, one exit, shape-aware layout, solution plotting, visual targets, and game-readable JSON export.',
  fields: [
    { key: 'showSolution', label: 'Show Solution Path', type: 'select', value: 'editor_only', options: [['editor_only', 'Editor Only'], ['export_visible', 'Export Visible'], ['hidden', 'Hidden']] },
    { key: 'completionRule', label: 'Completion Rule', type: 'select', value: 'reach_exit', options: [['reach_exit', 'Reach Exit'], ['collect_then_exit', 'Collect Item Then Exit'], ['unlock_then_exit', 'Unlock Then Exit'], ['collect_unlock_exit', 'Collect + Unlock Then Exit']] }
  ],
  preview: { kind: 'maze', accent: '#9ee6a4' }
};
