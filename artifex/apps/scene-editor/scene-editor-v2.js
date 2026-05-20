(() => {
  const VERSION = 'v0.05';
  const app = document.getElementById('editor-app');
  const repoPrefix = location.pathname.includes('/Forever-Bound-Game/') ? '/Forever-Bound-Game/' : '/';
  const brandLogo = '../../artifexlogo.png';
  const brandTitle = '../../artifextitle.png';
  const templateManifest = '../../templates/templates.json';

  let scene = null;
  let fileName = '';
  let templates = [];
  let selectedId = '';
  let selectedKind = 'element';
  let importOpen = false;
  let templateOpen = false;
  let context = null;
  let status = 'No JSON loaded yet.';
  let tip = `${VERSION}: ready.`;
  let zoom = 1;
  let defaultZoom = 1;
  let showHighlight = true;
  let panelScroll = 0;
  let drag = null;
  const collapsed = { json: true };

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function uid(p) { return `${p}_${Math.random().toString(36).slice(2, 8)}`; }
  function toast(msg) {
    document.querySelector('.artifex-toast')?.remove();
    const n = document.createElement('div');
    n.className = 'artifex-toast';
    n.textContent = `${VERSION}: ${msg}`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2600);
  }
  function assetPath(path) {
    if (!path) return '';
    if (/^(https?:|data:|blob:|\/|\.\.\/)/i.test(path)) return path;
    return repoPrefix + path.replace(/^\.\//, '');
  }
  function blankScene() {
    return { id: '', name: 'Untitled Scene', mode: 'blank', screenType: 'blank', background: '', backgroundScroll: false, grid: { columns: 16, rows: 9, show: true }, layers: [], elements: [], ui: [], audio: {} };
  }
  function key(kind) { return kind === 'layer' ? 'layers' : kind === 'ui' ? 'ui' : 'elements'; }
  function allItems() {
    if (!scene) return [];
    return [
      ...(scene.layers || []).map(i => ({ ...i, kind: 'layer' })),
      ...(scene.elements || []).map(i => ({ ...i, kind: 'element' })),
      ...(scene.ui || []).map(i => ({ ...i, kind: 'ui' }))
    ];
  }
  function real(kind = selectedKind, id = selectedId) {
    if (!scene) return null;
    return (scene[key(kind)] || []).find(i => i.id === id) || null;
  }
  function bgPath() {
    if (!scene) return '';
    if (typeof scene.background === 'string') return scene.background;
    if (scene.background && typeof scene.background === 'object') return scene.background.image || scene.background.backgroundImage || '';
    return scene.theme?.backgroundImage || '';
  }
  function setBgPath(v) {
    if (!scene) return;
    if (scene.theme && scene.screenType === 'static') scene.theme.backgroundImage = v;
    else scene.background = v;
  }
  function normalize(raw, label) {
    scene = structuredClone(raw || blankScene());
    scene.id ||= uid('scene');
    scene.name ||= scene.title || label || 'Untitled Scene';
    scene.screenType ||= scene.mode || 'scene';
    scene.mode ||= scene.screenType;
    scene.grid ||= { columns: 16, rows: 9, show: true };
    scene.grid.columns = Number(scene.grid.columns || 16);
    scene.grid.rows = Number(scene.grid.rows || 9);
    scene.grid.show = scene.grid.show !== false;
    scene.layers = Array.isArray(scene.layers) ? scene.layers : [];
    scene.elements = Array.isArray(scene.elements) ? scene.elements : [];
    scene.ui = Array.isArray(scene.ui) ? scene.ui : [];
    fileName = label || scene.id || 'Untitled JSON';
    const first = allItems().sort((a,b) => Number(b.layer || 0) - Number(a.layer || 0))[0];
    selectedKind = first?.kind || 'element';
    selectedId = first?.id || '';
    status = `${fileName} loaded.`;
    toast(status);
  }
  function saveScroll() { const p = document.querySelector('.side-panel'); if (p) panelScroll = p.scrollTop; }
  function restoreScroll() { requestAnimationFrame(() => { const p = document.querySelector('.side-panel'); if (p) p.scrollTop = panelScroll; }); }
  function render(keepScroll = true) {
    if (keepScroll) saveScroll();
    app.innerHTML = `<div class="editor-shell">${titleBar()}<main class="main-layout">${controlPanel()}${workArea()}</main></div>${templateModal()}${contextMenu()}<input class="hidden-file" id="imageFile" type="file" accept="image/*,.svg,.webp,.gif,.png,.jpg,.jpeg">`;
    bind();
    if (keepScroll) restoreScroll();
  }
  function titleBar() {
    return `<header class="top-bar"><div class="brand" data-tip="Artifex Scene Editor"><img class="brand-logo" src="${brandLogo}" alt="Artifex logo"><img class="brand-title" src="${brandTitle}" alt="Artifex"></div><span class="title-divider"></span><div class="import-menu ${importOpen ? 'is-open' : ''}" id="importMenu"><button class="import-button" id="importBtn" type="button" data-tip="Import JSON from hard drive, URL, or template.">Import ▾</button><div class="import-dropdown"><label class="file-button">From hard drive<input class="hidden-file" id="jsonFile" type="file" accept=".json,application/json"></label><button class="btn" id="importUrl" type="button">From URL</button><button class="btn" id="importTemplate" type="button">From templates</button></div></div><button class="btn" id="downloadJson" type="button" data-tip="Download the current JSON.">Download JSON</button><button class="btn" id="blankBtn" type="button" data-tip="Clear to blank editor.">Blank Screen</button><span class="tooltip-status" id="hoverStatus">${esc(tip)}</span><span class="status ok">${esc(status)}</span><span class="top-spacer"></span><a class="btn" href="../../">Portal</a></header>`;
  }
  function card(id, title, body, tone = '') {
    const isCollapsed = collapsed[id];
    return `<section class="panel-card ${tone ? `card-${tone}` : ''} ${isCollapsed ? 'is-collapsed' : ''}" data-card-id="${id}"><h2><span>${esc(title)}</span><button class="card-toggle" type="button" data-card-toggle="${id}">↕</button></h2><div class="card-body">${isCollapsed ? '' : body}</div></section>`;
  }
  function controlPanel() {
    if (!scene) return `<aside class="side-panel"><div class="file-pill">No file loaded</div>${card('blank','No Scene Loaded',`<p class="small">Use Import to load a JSON from hard drive, URL, or templates.</p>`, 'basics')}</aside>`;
    const item = real();
    return `<aside class="side-panel"><div class="file-pill">${esc(fileName || 'Untitled JSON')}</div>${card('basics','Scene Basics', basics(), 'basics')}${card('elements','Elements', elements(), 'elements')}${card('selected', item ? (item.name || item.id || 'Selected Item') : 'Selected Item', item ? selectedForm(item) : '<p class="small">Select an object.</p>', 'selected')}${card('json','JSON Preview',`<pre class="json-preview">${esc(JSON.stringify(scene,null,2))}</pre>`, 'json')}</aside>`;
  }
  function input(label, id, value, type = 'text') { return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}"></div>`; }
  function pathInput(label, id, value, target) { return `<div class="field path-field"><label for="${id}">${label}</label><div class="path-row"><input id="${id}" type="text" value="${esc(value)}"><div class="path-menu"><button class="path-menu-toggle" data-path-menu="${target}" type="button">📁</button><div class="path-dropdown"><button type="button" data-online="${target}">Online</button><button type="button" data-hdd="${target}">HDD</button></div></div></div></div>`; }
  function basics() { return `${input('Scene ID','sceneId',scene.id)}${input('Scene Name','sceneName',scene.name)}${input('Screen Type','sceneType',scene.screenType || scene.mode)}${pathInput('Background Image Path','sceneBg',bgPath(),'background')}<div class="field-row">${input('Grid Columns','gridCols',scene.grid.columns,'number')}${input('Grid Rows','gridRows',scene.grid.rows,'number')}</div><label class="check-row"><input id="gridShow" type="checkbox" ${scene.grid.show !== false ? 'checked' : ''}> Show grid</label>`; }
  function elements() {
    const item = real();
    return `<div class="button-row compact-actions"><button class="btn icon-btn" id="addElement" type="button">＋</button><button class="btn icon-btn" id="addLayer" type="button">▣</button><button class="btn icon-btn ${showHighlight ? 'active-soft' : ''}" id="highlightBtn" type="button">🖍</button><label class="layer-pill">Layer <input id="layerPill" type="number" value="${esc(item?.layer ?? item?.z ?? 0)}"></label></div><div class="item-list">${allItems().sort((a,b)=>Number(b.layer||0)-Number(a.layer||0)).map((it,idx)=>`<button class="btn item-row ${it.id===selectedId?'is-selected':''}" data-select-kind="${it.kind}" data-select-id="${esc(it.id)}" type="button">${idx+1}. z${it.layer ?? it.z ?? 0} · ${esc(it.name || it.id)} · ${esc(it.type || it.kind)}</button>`).join('') || '<p class="small">No elements.</p>'}</div>`;
  }
  function selectedForm(item) {
    item.tags = Array.isArray(item.tags) ? item.tags : [];
    return `${input('ID','itemId',item.id)}${input('Name','itemName',item.name || item.label || '')}${input('Type','itemType',item.type || '')}${pathInput('Image Path','itemImage',item.image || '','item')}${input('Text','itemText',item.text || '')}<div class="field-row">${input('X Axis','itemX',item.x ?? 10,'number')}${input('Y Axis','itemY',item.y ?? 10,'number')}</div><div class="field-row">${input('Width','itemW',item.width ?? 10,'number')}${input('Height','itemH',item.height ?? 10,'number')}</div><div class="field-row">${input('Layer','itemLayer',item.layer ?? item.z ?? 10,'number')}<div class="field"><label>Z / Depth <span class="range-value" id="zVal">${esc(item.zDepth ?? 0)}</span></label><input id="itemZ" type="range" min="-20" max="20" step="1" value="${esc(item.zDepth ?? 0)}"></div></div><label class="check-row"><input id="itemVisible" type="checkbox" ${item.visible !== false ? 'checked' : ''}> Visible</label>${input('Tags','itemTags',item.tags.join(', '))}<div class="button-row"><button class="btn" id="deleteItem" type="button">Delete Selected</button></div>`;
  }
  function workArea() {
    const bg = bgPath();
    const cols = Number(scene?.grid?.columns || 16);
    const rows = Number(scene?.grid?.rows || 9);
    const gridStyle = `--fine-x:${100/(cols*2)}%;--fine-y:${100/(rows*2)}%;--major-x:${500/cols}%;--major-y:${500/rows}%;`;
    return `<section class="stage-wrap"><div class="work-zoom-controls"><button class="zoom-control" id="zoomIn" type="button">+</button><button class="zoom-control" id="zoomReset" type="button">o</button><button class="zoom-control" id="zoomOut" type="button">-</button></div><div class="stage-scale" style="transform:scale(${zoom})"><div class="stage ${showHighlight ? 'highlight-on' : 'highlight-off'}" id="stage">${bg ? `<div class="stage-bg" style="background-image:url('${esc(assetPath(bg))}')"></div>` : ''}${scene?.grid?.show !== false ? `<div class="stage-grid" style="${gridStyle}"></div>${gridLabels(cols, rows)}` : ''}${scene ? allItems().sort((a,b)=>Number(a.layer||0)-Number(b.layer||0)).map(stageItem).join('') : blankMessage()}</div></div></section>`;
  }
  function blankMessage() { return `<div class="blank-message"><div><strong>Blank Scene Editor</strong><span>Import a JSON from hard drive, URL, or templates to begin.</span><div class="artifex-version-marker">${VERSION} real-action build</div></div></div>`; }
  function letters(i) { let n=i+1, s=''; while(n>0){ const r=(n-1)%26; s=String.fromCharCode(65+r)+s; n=Math.floor((n-1)/26);} return s; }
  function gridLabels(cols, rows) { return `<div class="grid-labels">${Array.from({length:cols},(_,i)=>`<span class="grid-col-label" style="left:${((i+.5)/cols)*100}%">${i+1}</span>`).join('')}${Array.from({length:rows},(_,i)=>`<span class="grid-row-label" style="top:${((i+.5)/rows)*100}%">${letters(i)}</span>`).join('')}<span class="axis-label axis-x">X</span><span class="axis-label axis-z">Z</span></div>`; }
  function stageItem(item) {
    if (item.visible === false) return '';
    const zd = Number(item.zDepth || 0), scale = clamp(1 + zd * .035, .45, 2.15);
    const img = item.image ? `<img src="${esc(assetPath(item.image))}" alt="${esc(item.name || item.id)}">` : `<span class="small">${esc(item.text || item.type || item.id)}</span>`;
    return `<div class="scene-item ${item.id===selectedId?'is-selected':''}" data-stage-id="${esc(item.id)}" data-stage-kind="${item.kind}" style="left:${item.x ?? 10}%;top:${item.y ?? 10}%;width:${item.width ?? 10}%;height:${item.height ?? 10}%;z-index:${item.layer ?? item.z ?? 1};transform:scale(${scale});">${img}<span class="item-label">${esc(item.name || item.id)}</span></div>`;
  }
  function templateModal() { return `<div class="modal-backdrop ${templateOpen ? 'is-open' : ''}" id="templateModal"><div class="modal"><div class="modal-head"><h2>Import From Templates</h2><button class="btn" id="closeTemplates" type="button">Close</button></div><div class="template-list">${templates.map(t=>`<button class="template-card" data-template-file="${esc(t.file)}" type="button"><strong>${esc(t.label || t.id)}</strong><span>${esc(t.type || '')} · ${esc(t.file || '')}</span><span>${esc(t.defaultSaveFolder || '')}</span></button>`).join('') || '<p class="small">Template manifest has not loaded.</p>'}</div></div></div>`; }
  function contextMenu() {
    if (!context) return '';
    if (context.type === 'zoom') return `<div class="context-menu" style="left:${context.x}px;top:${context.y}px"><button data-action="setZoomDefault">Set default zoom</button></div>`;
    const item = real(context.kind, context.id);
    if (!item) return '';
    return `<div class="context-menu" style="left:${context.x}px;top:${context.y}px"><div class="context-menu-head"><strong>${esc(item.name || item.id)}</strong><span>${esc(item.type || context.kind)}</span></div><button data-action="zoomObject">Zoom to object</button><button data-action="props">Properties</button><button data-action="duplicate">Duplicate</button><button data-action="remove">Delete</button></div>`;
  }
  function bind() {
    document.querySelectorAll('[data-tip]').forEach(n=>n.addEventListener('mouseenter',()=>{tip=n.dataset.tip; document.getElementById('hoverStatus').textContent=tip;}));
    document.getElementById('importBtn')?.addEventListener('click', e=>{ e.stopPropagation(); importOpen=!importOpen; render(); });
    document.getElementById('jsonFile')?.addEventListener('change', importFile);
    document.getElementById('importUrl')?.addEventListener('click', importUrl);
    document.getElementById('importTemplate')?.addEventListener('click', openTemplates);
    document.getElementById('closeTemplates')?.addEventListener('click', ()=>{templateOpen=false; render();});
    document.querySelectorAll('[data-template-file]').forEach(b=>b.addEventListener('click',()=>loadTemplate(b.dataset.templateFile)));
    document.getElementById('downloadJson')?.addEventListener('click', download);
    document.getElementById('blankBtn')?.addEventListener('click', ()=>{scene=null; fileName=''; selectedId=''; status='Blank editor ready.'; toast(status); render(false);});
    document.querySelectorAll('[data-card-toggle]').forEach(b=>b.addEventListener('click',()=>{collapsed[b.dataset.cardToggle]=!collapsed[b.dataset.cardToggle]; render();}));
    document.querySelectorAll('[data-select-id]').forEach(b=>b.addEventListener('click',()=>{selectedKind=b.dataset.selectKind; selectedId=b.dataset.selectId; render();}));
    document.getElementById('zoomIn')?.addEventListener('click',()=>setZoom(zoom+.1));
    document.getElementById('zoomOut')?.addEventListener('click',()=>setZoom(zoom-.1));
    document.getElementById('zoomReset')?.addEventListener('click',()=>setZoom(defaultZoom));
    document.getElementById('addElement')?.addEventListener('click', addElement);
    document.getElementById('addLayer')?.addEventListener('click', addLayer);
    document.getElementById('highlightBtn')?.addEventListener('click',()=>{showHighlight=!showHighlight; render();});
    document.getElementById('deleteItem')?.addEventListener('click', removeSelected);
    document.getElementById('layerPill')?.addEventListener('change', e=>{const i=real(); if(i){i.layer=Number(e.target.value)||0; render();}});
    bindSceneFields(); bindPathButtons(); bindContextActions(); bindStage();
  }
  function bindSceneFields() {
    if (!scene) return;
    const map = [['sceneId','id'],['sceneName','name'],['sceneType','screenType']];
    map.forEach(([id,k])=>document.getElementById(id)?.addEventListener('input',e=>{scene[k]=e.target.value; if(k==='screenType') scene.mode=e.target.value;}));
    document.getElementById('sceneBg')?.addEventListener('input', e=>{setBgPath(e.target.value); render();});
    document.getElementById('gridCols')?.addEventListener('change', e=>{scene.grid.columns=Number(e.target.value)||16; render();});
    document.getElementById('gridRows')?.addEventListener('change', e=>{scene.grid.rows=Number(e.target.value)||9; render();});
    document.getElementById('gridShow')?.addEventListener('change', e=>{scene.grid.show=e.target.checked; render();});
    const it = real(); if (!it) return;
    [['itemId','id','s'],['itemName','name','s'],['itemType','type','s'],['itemImage','image','s'],['itemText','text','s'],['itemX','x','n'],['itemY','y','n'],['itemW','width','n'],['itemH','height','n'],['itemLayer','layer','n'],['itemZ','zDepth','n']].forEach(([id,k,t])=>document.getElementById(id)?.addEventListener('input',e=>{it[k]=t==='n'?Number(e.target.value):e.target.value; if(k==='id') selectedId=it.id; if(k==='zDepth') document.getElementById('zVal').textContent=e.target.value; render();}));
    document.getElementById('itemVisible')?.addEventListener('change', e=>{it.visible=e.target.checked; render();});
    document.getElementById('itemTags')?.addEventListener('input', e=>{it.tags=e.target.value.split(',').map(t=>t.trim()).filter(Boolean);});
  }
  function bindPathButtons() {
    document.querySelectorAll('[data-path-menu]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation(); b.closest('.path-menu').classList.toggle('is-open');}));
    document.querySelectorAll('[data-online]').forEach(b=>b.addEventListener('click',()=>{const v=prompt('Paste image URL or project path:'); if(!v)return; applyPath(b.dataset.online,v);}));
    document.querySelectorAll('[data-hdd]').forEach(b=>b.addEventListener('click',()=>{const input=document.getElementById('imageFile'); input.dataset.target=b.dataset.hdd; input.value=''; input.click();}));
    document.getElementById('imageFile')?.addEventListener('change',e=>{const f=e.target.files?.[0]; if(!f)return; applyPath(e.target.dataset.target, URL.createObjectURL(f)); toast(`Preview image loaded: ${f.name}`);});
  }
  function bindContextActions() { document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action))); }
  function bindStage() {
    document.querySelectorAll('[data-stage-id]').forEach(n=>{
      n.addEventListener('pointerdown', e=>{ if(e.button===2)return; selectedKind=n.dataset.stageKind; selectedId=n.dataset.stageId; drag=real(); render(); });
      n.addEventListener('contextmenu', e=>{ e.preventDefault(); e.stopPropagation(); selectedKind=n.dataset.stageKind; selectedId=n.dataset.stageId; context={type:'object', kind:selectedKind, id:selectedId, x:e.clientX, y:e.clientY}; render(); });
    });
    document.getElementById('zoomReset')?.addEventListener('contextmenu', e=>{ e.preventDefault(); e.stopPropagation(); context={type:'zoom', x:e.clientX, y:e.clientY}; render(); });
    document.getElementById('stage')?.addEventListener('pointermove', e=>{ if(!drag)return; const r=e.currentTarget.getBoundingClientRect(); drag.x=clamp(((e.clientX-r.left)/r.width)*100,0,100); drag.y=clamp(((e.clientY-r.top)/r.height)*100,0,100); render(); });
  }
  function action(a) {
    if (a === 'setZoomDefault') { defaultZoom = zoom; context=null; toast(`Default zoom saved: ${Math.round(defaultZoom*100)}%`); render(); return; }
    if (a === 'zoomObject') { context=null; setZoom(Math.max(zoom, 1.35)); toast('Zoomed to object'); return; }
    if (a === 'props') { collapsed.selected=false; context=null; render(); requestAnimationFrame(()=>document.querySelector('[data-card-id="selected"]')?.scrollIntoView({block:'start'})); return; }
    if (a === 'duplicate') duplicateSelected();
    if (a === 'remove') removeSelected();
  }
  function applyPath(target, value) { if(target==='background'){setBgPath(value);} else {const i=real(); if(i)i.image=value;} render(); }
  function setZoom(v) { zoom=clamp(Number(v)||1,.4,2.2); tip=`Zoom ${Math.round(zoom*100)}%`; render(); }
  async function importFile(e) { const f=e.target.files?.[0]; if(!f)return; try{normalize(JSON.parse(await f.text()), f.name); render(false);}catch(err){status=`Import failed: ${err.message}`; toast(status); render();} }
  async function importUrl() { const url=prompt('Paste JSON URL:'); if(!url)return; try{const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error(r.status); normalize(await r.json(), url.split('/').pop()||'URL JSON'); render(false);}catch(err){status=`URL import failed: ${err.message}`; toast(status); render();} }
  async function openTemplates() { try{const r=await fetch(templateManifest,{cache:'no-store'}); if(!r.ok)throw new Error(r.status); templates=(await r.json()).templates||[]; templateOpen=true; importOpen=false; render();}catch(err){status=`Template list failed: ${err.message}`; toast(status); render();} }
  async function loadTemplate(file) { try{const r=await fetch(`../../templates/${file}`,{cache:'no-store'}); if(!r.ok)throw new Error(r.status); normalize(await r.json(), file); templateOpen=false; render(false);}catch(err){status=`Template import failed: ${err.message}`; toast(status); render();} }
  function download() { if(!scene){toast('Nothing to download'); return;} const blob=new Blob([JSON.stringify(scene,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${scene.id||'artifex_scene'}.json`; a.click(); URL.revokeObjectURL(url); toast('JSON downloaded'); }
  function addElement() { if(!scene) normalize(blankScene(),'New blank scene'); const i={id:uid('element'),type:'prop',name:'New Element',image:'../../templates/assets/template_red_ball.svg',x:40,y:55,width:10,height:14,layer:10,zDepth:0,visible:true,tags:[]}; scene.elements.push(i); selectedKind='element'; selectedId=i.id; toast('Element added'); render(); }
  function addLayer() { if(!scene) normalize(blankScene(),'New blank scene'); const i={id:uid('layer'),type:'overlay',name:'New Layer',image:'../../templates/assets/template_water_strip.svg',x:20,y:70,width:40,height:14,layer:5,zDepth:0,visible:true,tags:[]}; scene.layers.push(i); selectedKind='layer'; selectedId=i.id; toast('Layer added'); render(); }
  function duplicateSelected() { const i=real(); if(!i)return; const c=structuredClone(i); c.id=`${i.id||'item'}_copy_${Math.random().toString(36).slice(2,5)}`; c.name=`${i.name||i.id||'Item'} Copy`; c.x=clamp(Number(i.x||0)+3,0,100); c.y=clamp(Number(i.y||0)+3,0,100); c.layer=Number(i.layer||0)+1; scene[key(selectedKind)].push(c); selectedId=c.id; context=null; toast('Object duplicated'); render(); }
  function removeSelected() { if(!selectedId)return; scene[key(selectedKind)]=(scene[key(selectedKind)]||[]).filter(i=>i.id!==selectedId); const first=allItems()[0]; selectedKind=first?.kind||'element'; selectedId=first?.id||''; context=null; toast('Object deleted'); render(); }
  document.addEventListener('pointerup',()=>{ if(drag){drag=null; render();} });
  document.addEventListener('click',e=>{ if(importOpen && !e.target.closest('#importMenu')){importOpen=false; render();} if(context && !e.target.closest('.context-menu') && !e.target.closest('.scene-item') && !e.target.closest('#zoomReset')){context=null; render();} });
  window.addEventListener('load',()=>toast('Scene Editor loaded'));
  render(false);
})();
