(() => {
  'use strict';

  // The core editor now renders the file/status pill directly.
  // Legacy HDD visibility is handled by CSS until the next safe core-file rewrite.
  // Keep this helper inert so it does not mutate the file/status DOM after render.
  window.ArtifexSceneEditorPatchStatus = window.ArtifexSceneEditorPatchStatus || [];
  window.ArtifexSceneEditorPatchStatus.push('v12j file pill helper fully paused; file/status pill handled by core/CSS');
})();
