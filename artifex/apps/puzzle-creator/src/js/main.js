import './engines/maze-labyrinth-runtime.js';
import './engines-ui.js?v=1.36';
import './engines/potion-match-runtime.js?v=1.37';
import './engines/obstacle-course-runtime.js?v=1.38';
import './engines/obstacle-course-layout-patch.js?v=1.1';

// Load the experimental horse ride after the core editor UI has initialized.
// This keeps the Puzzles menu usable even if a CDN model loader or GLB import fails.
import('./engines/horse-forest-runtime.js?v=1.58').catch((error) => {
  console.error('[PuzzleCreator] Horse Forest runtime failed to load.', error);
});
