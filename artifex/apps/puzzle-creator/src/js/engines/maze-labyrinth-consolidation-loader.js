// Maze / Labyrinth stable module loader
//
// Consolidation phase 12: all active Maze / Labyrinth systems load through permanent named
// modules. Features own content added to the maze; Completion Rules validate which added
// content is mandatory; Wall Form owns joined visual wall rendering without Walk Test flicker.

import './maze-labyrinth-runtime-controls.js?v=1.28';
import './maze-difficulty-report.js?v=1.28';
import './maze-preview-default-layout.js?v=1.28';
import './maze-runtime-status.js?v=1.28';
import './maze-features.js?v=1.28';
import './maze-completion-rules.js?v=1.28';
import './maze-ui-polish.js?v=1.28';
import './maze-connections.js?v=1.28';
import './maze-organic-wall-renderer.js?v=1.28';

window.__artifexMazeConsolidation = {
  phase: 'phase_12_wall_form_walk_test_fix',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'smoke test Organic distinction and Walk Test without base-grid flashing',
    'delete obsolete numbered patch files after live test passes',
    'implement Scatter, Traboule and Tunnel work in stable modules only'
  ]
};
