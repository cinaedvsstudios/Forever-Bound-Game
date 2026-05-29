// Maze / Labyrinth consolidation loader
//
// Consolidation phase 6: index.html loads one Maze entrypoint and all visible
// Maze systems are now routed through stable module names.
//
// Stable UI defaults keep the Overview open on the right and the main preview left-aligned.
//
// Note: completion rules and portals currently use stable wrapper modules first. After live
// testing passes, the former versioned code can be inlined into stable modules and
// the old files can be deleted.

import './maze-labyrinth-runtime-controls.js?v=1.23';
import './maze-difficulty-report.js?v=1.23';
import './maze-preview-default-layout.js?v=1.23';
import './maze-runtime-status.js?v=1.23';
import './maze-completion-system.js?v=1.23';
import './maze-ui-polish.js?v=1.23';
import './maze-portals-system.js?v=1.23';

window.__artifexMazeConsolidation = {
  phase: 'phase_6_stable_entrypoints',
  status: 'visible_maze_systems_routed_through_stable_module_names',
  next: [
    'smoke test stable entrypoints and reduced build button sizing',
    'inline completion rules and portals wrapper modules',
    'delete old versioned patch files once permanent modules pass live tests'
  ]
};
