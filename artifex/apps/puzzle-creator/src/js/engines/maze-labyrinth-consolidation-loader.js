// Maze / Labyrinth stable module loader
//
// V1.30 Door visual asset linking stage: all active Maze / Labyrinth systems load through
// permanent named modules. Features own content added to the maze; Completion Rules validate
// mandatory content; Door visual selection stores registered final asset references only.

import './maze-labyrinth-runtime-controls.js?v=1.28';
import './maze-difficulty-report.js?v=1.28';
import './maze-preview-default-layout.js?v=1.28';
import './maze-runtime-status.js?v=1.28';
import './maze-features.js?v=1.29.2';
import './maze-completion-rules.js?v=1.28';
import './maze-ui-polish.js?v=1.28';
import './maze-connections.js?v=1.28';
import './maze-door-visual-linking.js?v=1.30';
import './maze-organic-wall-renderer.js?v=1.28';

window.__artifexMazeConsolidation = {
  phase: 'v1_30_door_visual_asset_linking',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'live test Door Link Visual picker, selection, unlink and JSON export',
    'retain Door and local Portal transfer in Walk Test',
    'implement Scatter, Traboule and Tunnel work in stable modules only'
  ]
};
