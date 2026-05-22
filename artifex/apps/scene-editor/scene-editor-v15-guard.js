(() => {
  const coreFlag = 'artifexCoreMove' + 'Drag';
  const helperFlag = 'v15Centre' + 'Drag';
  if (document.body.dataset[coreFlag] === 'true') {
    document.body.dataset[helperFlag] = 'true';
  }

  function runTransformShell() {
    const api = window.ArtifexSceneEditorCore;
    const item = api?.getSelectedItem?.();
    const body = document.querySelector('[data-card-id="transform-v15"] .card-body');
    if (!api || !item || !body) return;
    let block = body.querySelector('.real-rotation-controls-v16');
    if (!block) {
      block = document.createElement('div');
      block.className = 'card-layout-group card-layout-2 real-rotation-controls-v16';
      block.innerHTML = '<div class="field"><label for="itemRotation">Rotate</label><input id="itemRotation" type="number" step="1"></div><div class="field"><label for="itemRotationOrigin">Rotation Origin</label><select id="itemRotationOrigin"><option value="centre">centre</option><option value="top-left">top left</option><option value="top-right">top right</option><option value="bottom-left">bottom left</option><option value="bottom-right">bottom right</option></select></div>';
      const old = body.querySelector('.rotate-placeholder-v13e');
      if (old) old.replaceWith(block); else body.appendChild(block);
    }
  }

  window.addEventListener('load', runTransformShell);
  document.addEventListener('click', runTransformShell, true);
  setInterval(runTransformShell, 1000);
  runTransformShell();
})();
