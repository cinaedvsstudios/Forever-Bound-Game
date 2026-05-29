// Maze / Labyrinth stable module loader
//
// Consolidation phase 10: all active Maze / Labyrinth systems load through permanent named
// modules. Features own the content added to the maze; Completion Rules validate which
// added content is mandatory for completion.

import './maze-labyrinth-runtime-controls.js?v=1.26';
import './maze-difficulty-report.js?v=1.26';
import './maze-preview-default-layout.js?v=1.26';
import './maze-runtime-status.js?v=1.26';
import './maze-features.js?v=1.26';
import './maze-completion-rules.js?v=1.26';
import './maze-ui-polish.js?v=1.26';
import './maze-connections.js?v=1.26';

window.__artifexMazeConsolidation = {
  phase: 'phase_10_features_and_completion_split',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'smoke test Features, Completion Rules, solution toggle and local Door/Portal placement',
    'delete obsolete numbered patch files after live test passes',
    'implement Scatter, Traboule and Tunnel work in stable modules only'
  ]
};
