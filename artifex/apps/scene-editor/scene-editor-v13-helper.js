(() => {
  const VERSION = 'v0.13';
  let queued = false;

  function field(id) {
    return document.getElementById(id)?.closest('.field') || null;
  }

  function moveAll(parent, nodes) {
    nodes.filter(Boolean).forEach((node) => parent.appendChild(node));
  }

  function group(columns, className = '') {
    const node = document.createElement('div');
    node.className = `card-layout-group card-layout-${columns} ${className}`.trim();
    return node;
  }

  function cleanEmptyRows(scope) {
    scope.querySelectorAll('.field-row').forEach((row) => {
      if (!row.querySelector('.field, .wrap-image-btn, .scale-control-stack')) row.remove();
    });
  }

  function convertBasics() {
    const body = document.querySelector('[data-card-id="basics"] .card-body');
    if (!body || body.dataset.v13Layout === 'true') return;
    const sceneId = field('sceneId');
    const sceneName = field('sceneName');
    const sceneType = field('sceneType');
    const bg = field('sceneBg');
    const cols = field('gridCols');
    const rows = field('gridRows');
    const show = document.getElementById('gridShow')?.closest('.check-row') || null;
    if (!sceneId || !sceneName || !sceneType || !bg || !cols || !rows) return;

    const identity = group(1, 'basics-identity-group');
    const grid = group(2, 'basics-grid-group');
    const toggles = group(1, 'basics-toggle-group');

    body.insertBefore(identity, sceneId.closest('.field-row') || sceneId);
    moveAll(identity, [sceneId, sceneName, sceneType, bg]);
    identity.after(grid);
    moveAll(grid, [cols, rows]);
    if (show) {
      grid.after(toggles);
      toggles.appendChild(show);
    }
    cleanEmptyRows(body);
    body.dataset.v13Layout = 'true';
  }

  function convertElements() {
    const body = document.querySelector('[data-card-id="elements"] .card-body');
    if (!body || body.dataset.v13Layout === 'true') return;
    const layerRow = body.querySelector('.layer-control-row');
    const list = body.querySelector('.item-list');
    if (!layerRow || !list) return;

    const controls = group(1, 'elements-controls-group');
    const listGroup = group(1, 'elements-list-group');
    body.prepend(controls);
    controls.appendChild(layerRow);
    controls.after(listGroup);
    listGroup.appendChild(list);
    body.dataset.v13Layout = 'true';
  }

  function convertSelected() {
    const body = document.querySelector('[data-card-id="selected"] .card-body');
    if (!body || body.dataset.v13Layout === 'true') return;
    const id = field('itemId');
    const name = field('itemName');
    const type = field('itemType');
    const image = field('itemImage');
    const text = field('itemText');
    const metrics = body.querySelector('.selected-metrics-grid');
    const metricsDivider = body.querySelector('.selected-metrics-divider');
    const tags = field('itemTags');
    const tools = body.querySelector('.selected-bottom-tools');
    const cardDivider = body.querySelector('.selected-card-divider');
    if (!id || !name || !type || !image || !text) return;

    const identity = group(1, 'selected-identity-group');
    body.insertBefore(identity, id.closest('.field-row') || id);
    moveAll(identity, [id, name, type, image, text]);

    if (metrics && identity.nextElementSibling !== metrics) identity.after(metrics);
    if (metricsDivider && metrics.nextElementSibling !== metricsDivider) metrics.after(metricsDivider);

    if (tags) {
      const tagGroup = group(1, 'selected-tags-group');
      const anchor = metricsDivider || metrics || identity;
      anchor.after(tagGroup);
      tagGroup.appendChild(tags);
    }

    if (tools) {
      const toolsGroup = group(1, 'selected-tools-layout-group');
      const tagGroup = body.querySelector('.selected-tags-group');
      const anchor = tagGroup || metricsDivider || metrics || identity;
      anchor.after(toolsGroup);
      if (cardDivider) toolsGroup.appendChild(cardDivider);
      toolsGroup.appendChild(tools);
    }

    cleanEmptyRows(body);
    body.dataset.v13Layout = 'true';
  }

  function patch() {
    queued = false;
    convertBasics();
    convertElements();
    convertSelected();
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', queue);
  document.addEventListener('click', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 1200);
  queue();
})();
