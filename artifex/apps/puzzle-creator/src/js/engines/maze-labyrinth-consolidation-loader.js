// Maze / Labyrinth stable module loader
//
// Consolidation phase 8: all active Maze / Labyrinth systems now load through
// permanent named modules. No live maze-v### patch module remains in this import chain.

import './maze-labyrinth-runtime-controls.js?v=1.25';
import './maze-difficulty-report.js?v=1.25';
import './maze-preview-default-layout.js?v=1.25';
import './maze-runtime-status.js?v=1.25';
import './maze-completion-rules.js?v=1.25';
import './maze-ui-polish.js?v=1.25';
import './maze-portals-system.js?v=1.25';

window.__artifexMazeConsolidation = {
  phase: 'phase_8_stable_modules_only',
  status: 'no_active_versioned_patch_imports',
  next: [
    'smoke test stable completion rules and item placement',
    'remove obsolete completion and portal patch files after test passes',
    'continue Connections, Scatter and Tunnel design implementation in stable modules only'
  ]
};
