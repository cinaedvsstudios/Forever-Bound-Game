(() => {
  'use strict';

  // The core editor now renders the file/status pill directly.
  // This old helper must not rewrite the whole pill anymore.
  // It only removes legacy HDD nodes left in the core markup until the next full core-file rewrite.
  window.ArtifexSceneEditorPatchStatus = window.ArtifexSceneEditorPatchStatus || [];
  window.ArtifexSceneEditorPatchStatus.push('v12j file pill rewrite paused; legacy HDD nodes removed after render');

  function removeHddFromPill() {
    document.querySelectorAll('.file-pill-save').forEach((row) => {
      const children = Array.from(row.children);
      const icon = children.find((node) => node.classList.contains('file-pill-icon'));
      const localLabel = children.find((node) => node.classList.contains('file-pill-label') && node.textContent.trim().toLowerCase().startsWith('local'));
      const localValue = children.find((node) => node.classList.contains('file-pill-value'));

      children.forEach((node) => {
        if (node !== icon && node !== localLabel && node !== localValue) node.remove();
      });
    });
  }

  window.addEventListener('load', removeHddFromPill);
  document.addEventListener('click', () => requestAnimationFrame(removeHddFromPill), true);
  document.addEventListener('input', () => requestAnimationFrame(removeHddFromPill), true);
  document.addEventListener('change', () => requestAnimationFrame(removeHddFromPill), true);
  setInterval(removeHddFromPill, 1200);
  removeHddFromPill();
})();
