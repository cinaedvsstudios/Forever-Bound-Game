// Maze / Labyrinth consolidation loader
//
// Consolidation phase 7: index.html loads one Maze entrypoint and the runtime,
// report, status, preview defaults, UI polish, and portals now use stable module files.
//
// Stable UI defaults keep the Overview open on the right and the main preview left-aligned.
//
// Temporary transition still present by design during consolidation:
// - maze-completion-system.js currently wraps the former completion-rules implementation.
//   This is now the only active temporary wrapper and must be inlined next.

import './maze-labyrinth-runtime-controls.js?v=1.24';
import './maze-difficulty-report.js?v=1.24';
import './maze-preview-default-layout.js?v=1.24';
import './maze-runtime-status.js?v=1.24';
import './maze-completion-system.js?v=1.24';
import './maze-ui-polish.js?v=1.24';
import './maze-portals-system.js?v=1.24';

window.__artifexMazeConsolidation = {
  phase: 'phase_7_portals_inlined_ui_refined',
  status: 'one_temporary_wrapper_remaining_completion_rules_only',
  next: [
    'smoke test panel sizing, sticky icons, portal type labels, and tile-gap control',
    'inline completion rules into its stable module',
    'delete old versioned patch files after permanent modules pass live tests'
  ]
};
