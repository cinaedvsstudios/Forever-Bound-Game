(() => {
  'use strict';

  // The core editor now renders the file/status pill directly.
  // This old helper used to rewrite it after render, which grouped the icons onto one row.
  // Keep this helper inert so it does not fight the core layout.
  window.ArtifexSceneEditorPatchStatus = window.ArtifexSceneEditorPatchStatus || [];
  window.ArtifexSceneEditorPatchStatus.push('v12j file pill rewrite paused; file pill handled by core');
})();
