// Obstacle Course Asset Debug V4.3.0
import { requiredAssetList, optionalAssetList, GLB_ASSETS } from './obstacle-course-assets.js';
import { OC, VERSION } from './obstacle-course-state.js';

const DEBUG_IDS = [
  'obstacle-start',
  'obstacle-pause',
  'obstacle-reset-run',
  'obstacle-speed-badge',
  'obstacle-distance-readout',
  'obstacle-score-readout',
  'oc-offpath-arrow',
  'oc-loading-horse',
  'hf-overview',
  'hf-layer-select',
];

function ensureButton() {
  const slot = document.getElementById('oc-debug-button-slot');
  if (!slot || document.getElementById('horse-asset-debug-button')) return;
  const button = document.createElement('button');
  button.id = 'horse-asset-debug-button';
  button.type = 'button';
  button.textContent = 'Asset Debug';
  button.addEventListener('click', openPanel);
  slot.appendChild(button);
}

function statusFor(asset) {
  const recorded = OC.optionalAssetStatus?.get?.(asset.url);
  if (recorded?.status) return recorded.status;
  if (asset.type === 'json' && OC.groundPathMap) return 'loaded';
  if (asset.type === 'audio' && !OC.optionalFailures?.includes(asset.url)) return OC.loadingDone ? 'available' : 'pending';
  if (OC.images?.has(asset.url) || OC.glbTemplates?.has(asset.url)) return 'loaded';
  if (OC.failures?.includes(asset.url) || OC.optionalFailures?.includes(asset.url)) return 'failed';
  return 'pending';
}

function countEntities(type) {
  return (OC.entities || []).filter((entity) => entity.type === type).length;
}

function countModelUse(url) {
  return (OC.entities || []).filter((entity) => entity.assetUrl === url).length;
}

function makePanel() {
  let panel = document.getElementById('horse-asset-debug-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'horse-asset-debug-panel';
    panel.style.cssText = 'position:fixed;right:18px;top:110px;z-index:9999;width:min(940px,94vw);max-height:76vh;overflow:auto;background:#070b10;color:#f4ead4;border:1px solid #eec45a;border-radius:12px;padding:14px;font:12px/1.35 monospace;box-shadow:0 20px 60px rgba(0,0,0,.5)';
    document.body.appendChild(panel);
  }
  panel.textContent = '';
  return panel;
}

function addTitle(panel, text) {
  const title = document.createElement('h3');
  title.textContent = text;
  title.style.margin = '12px 0 8px';
  panel.appendChild(title);
}

function addGrid(panel, entries) {
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0 14px';
  entries.forEach(([label, value, state = '']) => {
    const item = document.createElement('div');
    item.style.cssText = 'border:1px solid rgba(238,196,90,.3);border-radius:6px;padding:6px';
    const strong = document.createElement('strong');
    strong.textContent = label;
    const line = document.createElement('div');
    line.textContent = String(value);
    if (state === 'good') line.style.color = '#9ee6a4';
    if (state === 'bad') line.style.color = '#ff8f8f';
    item.append(strong, line);
    grid.appendChild(item);
  });
  panel.appendChild(grid);
}

function addTable(panel, columns, rows) {
  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;margin:8px 0 14px';
  const head = document.createElement('tr');
  columns.forEach((column) => {
    const cell = document.createElement('th');
    cell.textContent = column;
    cell.style.cssText = 'text-align:left;border-bottom:1px solid rgba(238,196,90,.35);padding:4px 8px';
    head.appendChild(cell);
  });
  table.appendChild(head);
  rows.forEach((values) => {
    const row = document.createElement('tr');
    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = String(value ?? '');
      cell.style.cssText = 'padding:4px 8px;border-bottom:1px solid rgba(238,196,90,.12)';
      if (value === 'failed' || value === 'missing') cell.style.color = '#ff8f8f';
      if (value === 'loaded' || value === 'available' || value === 'present') cell.style.color = '#9ee6a4';
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  panel.appendChild(table);
}

function addActions(panel) {
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 12px';

  const run = document.createElement('button');
  run.type = 'button';
  run.textContent = 'Run Debug Report';

  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy Report';

  const status = document.createElement('span');
  status.style.color = '#9ee6a4';

  const output = document.createElement('textarea');
  output.id = 'horse-asset-debug-report';
  output.readOnly = true;
  output.style.cssText = 'display:none;width:100%;min-height:220px;margin:8px 0 14px;background:#030609;color:#f4ead4;border:1px solid rgba(238,196,90,.35);border-radius:8px;padding:10px;font:12px/1.35 monospace;white-space:pre;box-sizing:border-box';

  const refresh = () => {
    output.value = buildDebugReport();
    output.style.display = 'block';
    status.textContent = 'Report generated.';
  };

  run.addEventListener('click', refresh);
  copy.addEventListener('click', async () => {
    if (!output.value) refresh();
    const text = output.value;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied to clipboard.';
    } catch (error) {
      output.focus();
      output.select();
      document.execCommand('copy');
      status.textContent = 'Copied using fallback.';
    }
  });

  actions.append(run, copy, status);
  panel.append(actions, output);
}

function summaryRows() {
  return [
    ['version', VERSION, VERSION === 'V3.0.4' ? 'good' : 'bad'],
    ['debug version', 'V4.3.0', 'good'],
    ['cache', OC.cacheVersion || 'missing', OC.cacheVersion ? 'good' : 'bad'],
    ['required ready', OC.requiredReady, OC.requiredReady ? 'good' : 'bad'],
    ['optional done', OC.loadingDone, OC.loadingDone ? 'good' : ''],
    ['load count', `${OC.loadingCount || 0}/${OC.loadingTotal || 0}`],
    ['ground tiles', OC.groundTileAssets?.length || 0],
    ['path sequence', OC.pathSequence?.length || 0],
    ['GLB loaded', OC.glbTemplates?.size || 0],
    ['scene children', OC.world?.children?.length || 0],
    ['trees', countEntities('tree')],
    ['rocks', countEntities('rock')],
    ['details', countEntities('detail')],
    ['obstacles', countEntities('obstacle')],
    ['collectibles', countEntities('collectible')],
  ];
}

function assetRows() {
  const groundTileRows = (OC.groundTileAssets || []).map((asset) => ['required', 'ground-tile', statusFor(asset), asset.url]);
  const rows = [...requiredAssetList(), ...optionalAssetList()].map((asset) => [asset.required ? 'required' : 'optional', asset.type, statusFor(asset), asset.url]);
  return [...rows, ...groundTileRows];
}

function glbRows() {
  return GLB_ASSETS.map((asset) => [
    asset.type,
    OC.glbTemplates?.has(asset.url) ? 'loaded' : statusFor({ ...asset, type: 'glb' }),
    countModelUse(asset.url),
    asset.url,
  ]);
}

function uiRows() {
  return DEBUG_IDS.map((id) => [id, document.getElementById(id) ? 'present' : 'missing']);
}

function buildDebugReport() {
  const lines = [];
  lines.push('FOREVER BOUND OBSTACLE COURSE DEBUG REPORT');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`URL: ${window.location.href}`);
  lines.push(`User agent: ${navigator.userAgent}`);
  lines.push('');
  lines.push('[SUMMARY]');
  summaryRows().forEach(([label, value]) => lines.push(`${label}: ${value}`));
  lines.push('');
  lines.push('[REQUIRED / OPTIONAL ASSETS]');
  assetRows().forEach(([group, type, status, url]) => lines.push(`${status}\t${group}\t${type}\t${url}`));
  lines.push('');
  lines.push('[GLB REGISTRY AND USAGE]');
  glbRows().forEach(([type, loaded, used, url]) => lines.push(`${loaded}\tused=${used}\t${type}\t${url}`));
  lines.push('');
  lines.push('[UI ELEMENTS]');
  uiRows().forEach(([id, status]) => lines.push(`${status}\t${id}`));
  lines.push('');
  lines.push('[FAILURES]');
  lines.push(`required failures: ${(OC.failures || []).join(', ') || 'none'}`);
  lines.push(`optional failures: ${(OC.optionalFailures || []).join(', ') || 'none'}`);
  return lines.join('\n');
}

function openPanel() {
  const panel = makePanel();
  const close = document.createElement('button');
  close.textContent = 'Close';
  close.style.float = 'right';
  close.onclick = () => panel.remove();
  panel.appendChild(close);

  addTitle(panel, `Obstacle Course Asset Debug ${VERSION}`);
  addActions(panel);
  addGrid(panel, summaryRows());

  addTitle(panel, 'Required and optional assets');
  addTable(panel, ['group', 'type', 'status', 'url'], assetRows());

  addTitle(panel, 'GLB registry and scene usage');
  addTable(panel, ['type', 'loaded', 'used', 'url'], glbRows());

  addTitle(panel, 'UI elements');
  addTable(panel, ['element', 'status'], uiRows());
}

new MutationObserver(ensureButton).observe(document.documentElement, { childList: true, subtree: true });
ensureButton();
