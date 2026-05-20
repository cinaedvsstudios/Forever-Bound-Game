(() => {
  const VERSION = 'v0.04';
  let lastToast = '';
  let lastToastAt = 0;

  function toast(action) {
    const message = `${VERSION}: ${action}`;
    const now = Date.now();
    if (message === lastToast && now - lastToastAt < 900) return;
    lastToast = message;
    lastToastAt = now;

    const old = document.querySelector('.artifex-toast');
    if (old) old.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = message;
    node.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:999999;max-width:420px;padding:11px 15px;border:1px solid rgba(195,0,255,.8);border-radius:999px;background:rgba(0,0,0,.94);color:#f1dcc2;box-shadow:0 0 24px rgba(195,0,255,.35),0 14px 32px rgba(0,0,0,.5);font-family:Inter,system-ui,sans-serif;font-size:12px;line-height:1.2;';
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  function addBlankVersionMarker() {
    const blank = document.querySelector('.blank-message');
    if (!blank || blank.querySelector('.artifex-version-marker')) return;
    const marker = document.createElement('div');
    marker.className = 'artifex-version-marker';
    marker.textContent = `${VERSION} real context menu build`;
    marker.style.cssText = 'margin-top:12px;color:#bfa990;font-size:12px;letter-spacing:.04em;';
    blank.appendChild(marker);
  }

  function observeStatusToasts() {
    let currentStatus = '';
    const observer = new MutationObserver(() => {
      addBlankVersionMarker();
      const status = document.querySelector('.status');
      if (!status) return;
      const text = status.textContent.trim();
      if (!text || text === currentStatus) return;
      currentStatus = text;
      if (/loaded|downloaded|saved|deleted|duplicated|failed|could not|error/i.test(text)) {
        toast(text);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.addEventListener('load', () => {
    addBlankVersionMarker();
    observeStatusToasts();
    toast('Scene Editor loaded');
  });

  window.ArtifexToast = toast;
  console.info(`${VERSION}: Artifex toast/version helper loaded; diagnostic context menu disabled`);
})();
