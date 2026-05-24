(() => {
  'use strict';

  // The core editor now renders the file/status pill directly.
  // This old helper must not rewrite the whole pill anymore.
  // It only removes legacy HDD nodes left in the core markup until the next full core-file rewrite.
  window.ArtifexSceneEditorPatchStatus = window.ArtifexSceneEditorPatchStatus || [];
  window.ArtifexSceneEditorPatchStatus.push('v12j file pill rewrite paused; legacy HDD nodes removed after render');

  function removeHddFromPill() {
    document.querySelectorAll('.file-pill-save').forEach((row) => {
      const nodes = Array.from(row.childNodes);
      let remove = false;
      nodes.forEach((node) => {
        const text = node.textContent?.trim().toLowerCase() || '';
        if (node.classList?.contains('file-pill-sep') || text === '|' || text === 'hdd:' || text.startsWith('hdd:')) remove = true;
        if (remove && node.classList?.contains('file-pill-value') && !node.previousElementSibling?.textContent?.trim().toLowerCase().startsWith('local')) {
          node.remove();
          return;
        }
        if (remove) node.remove();
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
