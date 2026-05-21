(() => {
  const VERSION = 'v0.11a';

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2400);
  }

  function selectedId() {
    return document.getElementById('itemId')?.value || '';
  }

  function assetPreviewFromEditorPath(path) {
    if (!path) return '';
    if (/^(blob:|data:|https?:|\/)/i.test(path)) return path;
    if (path.startsWith('artifex/assets-library/')) {
      return `../../assets-library/${path.slice('artifex/assets-library/'.length)}`;
    }
    return path;
  }

  function updateSelectedStageImageFromField() {
    const input = document.getElementById('itemImage');
    const id = selectedId();
    if (!input || !id) return;

    const value = input.value || '';
    const previewPath = assetPreviewFromEditorPath(value);
    const item = document.querySelector(`.scene-item[data-stage-id="${CSS.escape(id)}"]`);
    const image = item?.querySelector('img');

    if (image && previewPath) {
      image.src = previewPath;
      image.removeAttribute('srcset');
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur'));
  }

  function closePathMenus(except = null) {
    document.querySelectorAll('.path-menu.is-open').forEach((menu) => {
      if (except && menu === except) return;
      menu.classList.remove('is-open');
    });
  }

  function wireDropdownClose() {
    if (document.body.dataset.v11aDropdownClose === 'true') return;
    document.body.dataset.v11aDropdownClose = 'true';

    document.addEventListener('click', (event) => {
      const pathMenu = event.target.closest?.('.path-menu');
      if (pathMenu) {
        closePathMenus(pathMenu);
        return;
      }
      closePathMenus();
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePathMenus();
    });
  }

  function wireAssetSelectionRefresh() {
    if (document.body.dataset.v11aAssetRefresh === 'true') return;
    document.body.dataset.v11aAssetRefresh = 'true';

    document.addEventListener('click', (event) => {
      const assetButton = event.target.closest?.('.asset-card-btn[data-asset-id]');
      if (!assetButton) return;
      setTimeout(() => {
        updateSelectedStageImageFromField();
        toast(`Asset applied: ${assetButton.dataset.assetId}`);
      }, 90);
    }, false);
  }

  function patch() {
    wireDropdownClose();
    wireAssetSelectionRefresh();
  }

  window.addEventListener('load', patch);
  patch();
})();
