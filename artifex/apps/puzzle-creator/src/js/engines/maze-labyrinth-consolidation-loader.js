// Maze / Labyrinth stable module loader
//
// V1.31 Scatter decorations and lights stage: all active Maze / Labyrinth systems load through
// permanent named modules. Scatter stores collision-free registered asset references and
// authored Overview positions only; gameplay routes and collisions remain unchanged.

import './maze-labyrinth-runtime-controls.js?v=1.28';
import './maze-difficulty-report.js?v=1.28';
import './maze-preview-default-layout.js?v=1.28';
import './maze-runtime-status.js?v=1.28';
import './maze-features.js?v=1.29.2';
import './maze-completion-rules.js?v=1.28';
import './maze-ui-polish.js?v=1.31';
import './maze-connections.js?v=1.30.1';
import './maze-door-visual-linking.js?v=1.30.2';
import './maze-organic-wall-renderer.js?v=1.28';
import './maze-scatter-decorations.js?v=1.31.1';

window.__artifexMazeConsolidation = {
  phase: 'v1_31_scatter_decorations_and_lights',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'live test Scatter card, asset picker, non-collision Overview markers and JSON export',
    'retain Door and local Portal transfer in Walk Test',
    'implement Traboule as a hidden pass-through wall feature'
  ]
};
