(() => {
  const VERSION = 'v0.07';
  let panning = null;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2400);
  }

  function setTip(message) {
    const status = document.getElementById('hoverStatus');
    if (status) status.textContent = `${VERSION}: ${message}`;
  }

  function enhanceElementsHeader() {
    const elementsCard = document.querySelector('[data-card-id="elements"]');
    if (!elementsCard || elementsCard.dataset.v07Enhanced === 'true') return;
    const heading = elementsCard.querySelector('h2');
    if (!heading) return;

    const title = heading.querySelector('span');
    if (title && !title.classList.contains('card-title-main')) title.classList.add('card-title-main');

    const actions = document.createElement('span');
    actions.className = 'card-header-actions';
    actions.innerHTML = `
      <button class="header-icon-btn" type="button" data-proxy="addElement" title="Add Element">➕</button>
      <button class="header-icon-btn" type="button" data-proxy="addLayer" title="Add Layer">🧱</button>
      <button class="header-icon-btn" type="button" data-proxy="highlightBtn" title="Toggle Highlight">🖍️</button>
    `;

    const toggle = heading.querySelector('.card-toggle');
    heading.insertBefore(actions, toggle || null);

    actions.querySelectorAll('[data-proxy]').forEach((button) => {
      button.addEventListener('mouseenter', () => setTip(button.title));
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById(button.dataset.proxy)?.click();
      });
    });

    elementsCard.dataset.v07Enhanced = 'true';
  }

  function revealLayerRowAndHideOldActionButtons() {
    const elementsCard = document.querySelector('[data-card-id="elements"]');
    if (!elementsCard) return;
    const bodyActions = elementsCard.querySelector('.card-body .compact-actions');
    if (!bodyActions) return;
    bodyActions.style.display = 'flex';
    bodyActions.querySelectorAll('.icon-btn').forEach((button) => button.style.display = 'none');
    bodyActions.classList.add('layer-only-row');
  }

  function enhanceBlankVersion() {
    const blank = document.querySelector('.blank-message');
    if (!blank || blank.querySelector('.artifex-version-marker-v07')) return;
    const marker = document.createElement('div');
    marker.className = 'artifex-version-marker-v07';
    marker.textContent = `${VERSION} input-stability build`;
    marker.style.cssText = 'margin-top:12px;color:#bfa990;font-size:12px;letter-spacing:.04em;';
    blank.appendChild(marker);
  }

  function wireMiddleMousePanning() {
    const wrap = document.querySelector('.stage-wrap');
    if (!wrap || wrap.dataset.v07Panning === 'true') return;
    wrap.dataset.v07Panning = 'true';

    wrap.addEventListener('pointerdown', (event) => {
      if (event.button !== 1) return;
      event.preventDefault();
      panning = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: wrap.scrollLeft,
        top: wrap.scrollTop,
        wrap
      };
      wrap.classList.add('is-panning');
      wrap.setPointerCapture?.(event.pointerId);
      setTip('Middle mouse drag: panning Work Area view.');
    });

    wrap.addEventListener('pointermove', (event) => {
      if (!panning || panning.wrap !== wrap) return;
      event.preventDefault();
      wrap.scrollLeft = panning.left - (event.clientX - panning.startX);
      wrap.scrollTop = panning.top - (event.clientY - panning.startY);
    });

    wrap.addEventListener('auxclick', (event) => {
      if (event.button === 1) event.preventDefault();
    });
  }

  function stopPanning() {
    if (!panning) return;
    panning.wrap?.classList.remove('is-panning');
    panning = null;
  }

  function patch() {
    enhanceElementsHeader();
    revealLayerRowAndHideOldActionButtons();
    enhanceBlankVersion();
    wireMiddleMousePanning();
  }

  document.addEventListener('pointerup', stopPanning);
  document.addEventListener('pointercancel', stopPanning);
  document.addEventListener('mouseenter', (event) => {
    const tipNode = event.target.closest?.('[data-tip], [title]');
    if (!tipNode) return;
    setTip(tipNode.dataset.tip || tipNode.title || 'Ready.');
  }, true);

  const observer = new MutationObserver(patch);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', () => {
    patch();
    toast('Scene Editor input-stability loaded');
  });
  patch();
})();
