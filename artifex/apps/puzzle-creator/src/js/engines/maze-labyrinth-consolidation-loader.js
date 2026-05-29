// Maze / Labyrinth stable module loader
//
// Consolidation phase 9: all active Maze / Labyrinth systems now load through
// permanent named modules. No live maze-v### patch module remains in this import chain.
// Completion Rules are stable and the old Portals UI has been replaced by Connections.

import './maze-labyrinth-runtime-controls.js?v=1.25';
import './maze-difficulty-report.js?v=1.25';
import './maze-preview-default-layout.js?v=1.25';
import './maze-runtime-status.js?v=1.25';
import './maze-completion-rules.js?v=1.25';
import './maze-ui-polish.js?v=1.25';
import './maze-connections.js?v=1.25';

window.__artifexMazeConsolidation = {
  phase: 'phase_9_stable_game_logic_connections',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'smoke test corrected Game Logic, required item placement, solution toggle and Connections',
    'delete obsolete numbered patch files after live test passes',
    'implement Scatter and Tunnel decisions in stable modules only'
  ]
};
