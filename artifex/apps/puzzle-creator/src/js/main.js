const SCHEMA = 'cinaedvs.artifex.maze.v1';
const state = {
  gridSize: 31,
  threshold: 50,
  invert: false,
  matrix: [],
  colors: [],
  start: { x: 1, y: 1 },
  exit: { x: 29, y: 29 },
  solution: [],
  sourceImage: null,
  brushColor: '#8b3f2f',
  tool: 'camera',
  view: 'diorama',
  zoom: 1,
  wallHeight: 1.5,
  gap: 0.98,
  material: 'hedge',
  floor: 'soil',
  layout: 0,
  edge: 0,
  player: { x: 1.5, y: 1.5 },
  keys: {}
};
const $ = (id) => document.getElementById(id);
const qs = (s) => [...document.querySelectorAll(s)];
const labels = { layout: ['Straight', 'Natural', 'Curved'], edge: ['Sharp', 'Rough', 'Smooth'] };

window.addEventListener('DOMContentLoaded', boot);

function boot() {
  bind();
  buildSwatches();
  buildReference();
  renderAll('Ready');
}

function bind() {
  qs('.panel-nav-button').forEach((b) => b.addEventListener('click', () => showPanel(b.dataset.panel)));
  $('btn-random')?.addEventListener('click', () => { buildRandom(); renderAll('Random maze built'); });
  $('btn-load-reference')?.addEventListener('click', () => { buildReference(); renderAll('Reference loaded'); });
  $('btn-reparse')?.addEventListener('click', () => { state.sourceImage ? parseImage(state.sourceImage) : buildReference(); renderAll('Re-parsed'); });
  $('btn-solve')?.addEventListener('click', () => { solve(); renderAll(state.solution.length ? 'Solution plotted' : 'No path found'); });
  $('btn-export-json')?.addEventListener('click', downloadJson);
  $('btn-copy-json')?.addEventListener('click', copyJson);
  $('btn-clear-paint')?.addEventListener('click', () => { state.colors = blankColors(); renderAll('Paint cleared'); });
  $('image-upload')?.addEventListener('change', (e) => loadImage(e.target.files?.[0]));
  $('json-import')?.addEventListener('change', (e) => importJson(e.target.files?.[0]));
  $('view-mode-diorama')?.addEventListener('click', () => setView('diorama'));
  $('view-mode-fps')?.addEventListener('click', () => setView('fps'));
  $('btn-zoom-in')?.addEventListener('click', () => { state.zoom = Math.min(2.4, state.zoom + 0.15); drawPreview(); });
  $('btn-zoom-out')?.addEventListener('click', () => { state.zoom = Math.max(0.55, state.zoom - 0.15); drawPreview(); });
  $('btn-zoom-reset')?.addEventListener('click', () => { state.zoom = 1; drawPreview(); });
  qs('.tool-button').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));
  qs('.material-preset').forEach((b) => b.addEventListener('click', () => {
    state.material = b.dataset.style;
    qs('.material-preset').forEach((x) => x.classList.toggle('is-active', x === b));
    drawPreview();
  }));
  $('grid-slider')?.addEventListener('input', (e) => { state.gridSize = parseInt(e.target.value, 10); syncLabels(); });
  $('grid-slider')?.addEventListener('change', () => { buildRandom(); renderAll('Grid rebuilt'); });
  $('threshold-slider')?.addEventListener('input', (e) => { state.threshold = parseInt(e.target.value, 10); syncLabels(); });
  $('threshold-slider')?.addEventListener('change', () => { if (state.sourceImage) { parseImage(state.sourceImage); renderAll('Detection updated'); } });
  $('invert-checkbox')?.addEventListener('change', (e) => { state.invert = e.target.checked; if (state.sourceImage) parseImage(state.sourceImage); else invertMatrix(); renderAll('Inverted'); });
  $('wall-height-slider')?.addEventListener('input', (e) => { state.wallHeight = parseFloat(e.target.value); syncLabels(); drawPreview(); });
  $('gap-slider')?.addEventListener('input', (e) => { state.gap = parseFloat(e.target.value); syncLabels(); drawPreview(); });
  $('layout-style-slider')?.addEventListener('input', (e) => { state.layout = parseInt(e.target.value, 10); syncLabels(); drawPreview(); });
  $('edge-style-slider')?.addEventListener('input', (e) => { state.edge = parseInt(e.target.value, 10); syncLabels(); drawPreview(); });
  $('wall-color-picker')?.addEventListener('input', (e) => { state.wallColor = e.target.value; drawPreview(); });
  $('floor-style')?.addEventListener('change', (e) => { state.floor = e.target.value; drawPreview(); });
  $('brush-color-picker')?.addEventListener('input', (e) => { state.brushColor = e.target.value; setTool('paint'); });
  const m = $('analysis-canvas');
  m?.addEventListener('mousedown', (e) => editFromEvent(e, true));
  m?.addEventListener('mousemove', (e) => { if (e.buttons) editFromEvent(e, false); });
  m?.addEventListener('touchstart', (e) => editFromEvent(e, true), { passive: false });
  m?.addEventListener('touchmove', (e) => editFromEvent(e, false), { passive: false });
  window.addEventListener('keydown', (e) => { state.keys[e.key] = true; });
  window.addEventListener('keyup', (e) => { state.keys[e.key] = false; });
  window.addEventListener('resize', drawPreview);
  setInterval(movePlayer, 33);
}

function showPanel(name) {
  qs('.panel-nav-button').forEach((b) => b.classList.toggle('is-active', b.dataset.panel === name));
  qs('[data-panel-content]').forEach((p) => { const on = p.dataset.panelContent === name; p.hidden = !on; p.classList.toggle('is-active', on); });
}
function setTool(tool) { state.tool = tool; qs('.tool-button').forEach((b) => b.classList.toggle('is-active', b.dataset.tool === tool)); }
function setView(view) { state.view = view; $('view-mode-diorama')?.classList.toggle('is-active', view === 'diorama'); $('view-mode-fps')?.classList.toggle('is-active', view === 'fps'); $('virtual-dpad')?.classList.toggle('is-hidden', view !== 'fps'); status(view === 'fps' ? 'Walk Test · WASD/arrows' : 'Diorama camera'); drawPreview(); }
function status(t) { if ($('player-status-indicator')) $('player-status-indicator').textContent = t; }
function ready(t) { const el = $('analysis-state'); if (el) { el.textContent = t; el.className = 'status-pill is-good'; } }
function syncLabels() { $('grid-val') && ($('grid-val').textContent = `${state.gridSize} × ${state.gridSize}`); $('threshold-val') && ($('threshold-val').textContent = `${state.threshold}%`); $('wall-height-val') && ($('wall-height-val').textContent = state.wallHeight.toFixed(1)); $('gap-val') && ($('gap-val').textContent = state.gap.toFixed(2)); $('layout-style-val') && ($('layout-style-val').textContent = labels.layout[state.layout]); $('edge-style-val') && ($('edge-style-val').textContent = labels.edge[state.edge]); }
function buildSwatches() {
  const row = $('swatch-row'); if (!row) return;
  ['#24513a','#6f4a2d','#8b3f2f','#b37a37','#7fd2cf','#684b8f','#2b3341','#59624c','#bd6651','#e1c073'].forEach((c) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'swatch-button'; b.style.background = c; b.title = c;
    b.onclick = () => { state.brushColor = c; $('brush-color-picker').value = c; setTool('paint'); };
    row.appendChild(b);
  });
}
function buildReference() { state.matrix = makeMaze(state.gridSize, 42); state.colors = blankColors(); state.sourceImage = null; locateEnds(); }
function buildRandom() { state.matrix = makeMaze(state.gridSize, Date.now() % 99999); state.colors = blankColors(); state.sourceImage = null; locateEnds(); }
function blankColors() { return Array.from({ length: state.gridSize }, () => Array(state.gridSize).fill(null)); }
function makeMaze(size, seed) {
  const g = Array.from({ length: size }, () => Array(size).fill(1)); let s = seed;
  const rnd = () => { const x = Math.sin(s++) * 10000; return x - Math.floor(x); };
  function carve(x, y) { g[y][x] = 0; [[0,-2],[2,0],[0,2],[-2,0]].sort(() => rnd() - .5).forEach(([dx,dy]) => { const nx=x+dx, ny=y+dy; if(nx>0&&ny>0&&nx<size-1&&ny<size-1&&g[ny][nx]){ g[y+dy/2][x+dx/2]=0; carve(nx,ny); } }); }
  carve(1, 1); g[0][1] = 0; g[size - 1][size - 2] = 0; return g;
}
function invertMatrix() { state.matrix = state.matrix.map((r) => r.map((v) => v ? 0 : 1)); locateEnds(); }
function locateEnds() { const n = state.matrix.length, o=[]; for(let c=0;c<n;c++){ if(!state.matrix[0][c]) o.push({x:c,y:0}); if(!state.matrix[n-1][c]) o.push({x:c,y:n-1}); } for(let r=1;r<n-1;r++){ if(!state.matrix[r][0]) o.push({x:0,y:r}); if(!state.matrix[r][n-1]) o.push({x:n-1,y:r}); } state.start=o[0]||{x:1,y:1}; state.exit=o[o.length-1]||{x:n-2,y:n-2}; state.player={x:state.start.x+.5,y:state.start.y+.5}; state.solution=[]; }
function loadImage(file) { if(!file) return; const fr = new FileReader(); fr.onload = () => { const img = new Image(); img.onload = () => { state.sourceImage = img; parseImage(img); renderAll('Image parsed'); }; img.src = fr.result; }; fr.readAsDataURL(file); }
function parseImage(img) { const n = state.gridSize, c = document.createElement('canvas'); c.width=n; c.height=n; const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(img,0,0,n,n); const d=x.getImageData(0,0,n,n).data, vals=[]; for(let i=0;i<d.length;i+=4) vals.push((d[i]+d[i+1]+d[i+2])/3); const min=Math.min(...vals), max=Math.max(...vals), cut=min+(max-min)*state.threshold/100; state.matrix=Array.from({length:n},(_,y)=>Array.from({length:n},(_,x)=>{const wall=vals[y*n+x]<cut; return (state.invert?!wall:wall)?1:0;})); state.colors=blankColors(); locateEnds(); }
function renderAll(msg) { syncLabels(); drawMatrix(); drawPreview(); ready(msg); }
function drawMatrix() {
  const c = $('analysis-canvas'); if(!c) return; const x = c.getContext('2d'), n = state.matrix.length; c.width = 420; c.height = 420; const s = c.width / n;
  x.fillStyle = '#130d07'; x.fillRect(0,0,c.width,c.height);
  for(let r=0;r<n;r++) for(let col=0;col<n;col++){ x.fillStyle = state.matrix[r][col] ? (state.colors[r][col] || '#24513a') : '#7b5a32'; x.fillRect(col*s,r*s,Math.ceil(s),Math.ceil(s)); }
  if(state.solution.length){ x.strokeStyle='#7fd2cf'; x.lineWidth=Math.max(2,s*.32); x.lineCap='round'; x.beginPath(); state.solution.forEach((p,i)=>{ const px=p.x*s+s/2, py=p.y*s+s/2; i?x.lineTo(px,py):x.moveTo(px,py); }); x.stroke(); }
  node(x,state.start,s,'#bd6651'); node(x,state.exit,s,'#7fd2cf'); const walls=state.matrix.flat().filter(Boolean).length; $('matrix-summary') && ($('matrix-summary').textContent=`${n} × ${n} · ${walls} walls`);
}
function node(x,p,s,c){ x.fillStyle=c; x.beginPath(); x.arc(p.x*s+s/2,p.y*s+s/2,s*.38,0,Math.PI*2); x.fill(); }
function drawPreview() {
  const wrap = $('threejs-container'); if(!wrap) return; let c = $('maze-preview-canvas'); if(!c){ wrap.innerHTML=''; c=document.createElement('canvas'); c.id='maze-preview-canvas'; wrap.appendChild(c); }
  const r = wrap.getBoundingClientRect(); c.width = Math.max(1, r.width * devicePixelRatio); c.height = Math.max(1, r.height * devicePixelRatio); c.style.width='100%'; c.style.height='100%'; const x = c.getContext('2d'); x.scale(devicePixelRatio, devicePixelRatio);
  const w=r.width, h=r.height, n=state.matrix.length, cell=Math.min(w/(n+10), h/(n+8))*state.zoom, ox=w/2-(n*cell)/2, oy=h/2-(n*cell)/2+20;
  x.fillStyle = state.floor==='underworld'?'#050706':state.floor==='stone'?'#24221f':state.floor==='parchment'?'#6f5936':'#2c1d12'; x.fillRect(0,0,w,h);
  x.save(); x.translate(ox,oy);
  for(let row=0;row<n;row++) for(let col=0;col<n;col++) if(!state.matrix[row][col]){ x.fillStyle='rgba(150,105,58,.75)'; x.fillRect(col*cell,row*cell,cell*.96,cell*.96); }
  for(let row=0;row<n;row++) for(let col=0;col<n;col++) if(state.matrix[row][col]) drawBlock(x,col*cell,row*cell,cell,state.colors[row][col]||wallColor());
  if(state.solution.length){ x.strokeStyle='#7fd2cf'; x.lineWidth=Math.max(2,cell*.25); x.lineCap='round'; x.beginPath(); state.solution.forEach((p,i)=>{ const px=p.x*cell+cell/2, py=p.y*cell+cell/2; i?x.lineTo(px,py):x.moveTo(px,py); }); x.stroke(); }
  drawMarker(x,state.start,cell,'#bd6651'); drawMarker(x,state.exit,cell,'#7fd2cf'); if(state.view==='fps') drawPlayer(x,cell); x.restore();
}
function wallColor(){ return state.material==='stone'?'#6f6960':state.material==='rune'?'#8a5a2a':state.material==='shadow'?'#0b1110':$('wall-color-picker')?.value || '#24513a'; }
function drawBlock(x,px,py,s,color){ const h=s*(.35+state.wallHeight*.08); x.fillStyle=color; x.fillRect(px,py,s*state.gap,s*state.gap); x.fillStyle='rgba(0,0,0,.32)'; x.fillRect(px,py+s*state.gap-h,s*state.gap,h); x.strokeStyle='rgba(234,216,176,.18)'; x.strokeRect(px,py,s*state.gap,s*state.gap); }
function drawMarker(x,p,s,c){ x.fillStyle=c; x.beginPath(); x.arc(p.x*s+s/2,p.y*s+s/2,s*.38,0,Math.PI*2); x.fill(); }
function drawPlayer(x,s){ x.fillStyle='#f3dcaa'; x.beginPath(); x.arc(state.player.x*s,state.player.y*s,Math.max(3,s*.3),0,Math.PI*2); x.fill(); }
function editFromEvent(e, first) { if(state.tool==='camera') return; e.preventDefault(); const t=e.touches?.[0], r=$('analysis-canvas').getBoundingClientRect(), x=(t?t.clientX:e.clientX)-r.left, y=(t?t.clientY:e.clientY)-r.top, col=Math.floor(x/r.width*state.gridSize), row=Math.floor(y/r.height*state.gridSize); if(row<0||col<0||row>=state.gridSize||col>=state.gridSize) return; if(state.tool==='paint'&&state.matrix[row][col]) state.colors[row][col]=state.brushColor; if(state.tool==='paintSection') paintSection(row,col); if(state.tool==='toggle'&&first){ state.matrix[row][col]=state.matrix[row][col]?0:1; locateEnds(); } state.solution=[]; drawMatrix(); drawPreview(); }
function paintSection(row,col){ if(!state.matrix[row][col]) return; [[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{ let x=col+dx,y=row+dy; while(y>=0&&x>=0&&y<state.gridSize&&x<state.gridSize&&state.matrix[y][x]){ state.colors[y][x]=state.brushColor; if(!dx&&!dy) break; x+=dx; y+=dy; }}); }
function movePlayer(){ if(state.view!=='fps') return; let dx=0,dy=0; if(state.keys.w||state.keys.ArrowUp) dy-=.08; if(state.keys.s||state.keys.ArrowDown) dy+=.08; if(state.keys.a||state.keys.ArrowLeft) dx-=.08; if(state.keys.d||state.keys.ArrowRight) dx+=.08; if(!dx&&!dy) return; const nx=state.player.x+dx, ny=state.player.y+dy, c=Math.floor(nx), r=Math.floor(ny); if(r>=0&&c>=0&&r<state.gridSize&&c<state.gridSize&&!state.matrix[r][c]){ state.player.x=nx; state.player.y=ny; drawPreview(); } }
function solve(){ const q=[[state.start]], seen=new Set([`${state.start.x},${state.start.y}`]), n=state.gridSize; while(q.length){ const path=q.shift(), p=path[path.length-1]; if(p.x===state.exit.x&&p.y===state.exit.y){ state.solution=path; return; } [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{ const np={x:p.x+dx,y:p.y+dy}, k=`${np.x},${np.y}`; if(np.x>=0&&np.y>=0&&np.x<n&&np.y<n&&!seen.has(k)&&!state.matrix[np.y][np.x]){ seen.add(k); q.push([...path,np]); }}); } state.solution=[]; }
function exportObj(){ const id=$('module-id')?.value || 'ch00_q00_labyrinth_maze'; return { schema: SCHEMA, kind:'puzzle_module', moduleId:id, displayName:'Labyrinth Maze', gameplayMode:$('gameplay-mode')?.value || 'scene_mode', puzzle:{ type:$('puzzle-type')?.value || 'pass_environmental_obstacle', callingText:$('calling-text')?.value || '', completionCondition:{ flag:$('completion-flag')?.value || 'maze_exit_reached', value:true, trigger:'player_reaches_exit' }, start:{...state.start,grid:'matrix'}, exit:{...state.exit,grid:'matrix'} }, grid:{ cols:state.gridSize, rows:state.gridSize, cellSize:1, origin:'top_left', wallValue:1, pathValue:0, matrix:state.matrix }, collision:{ wallCellsBlockMovement:true, playerRadius:.35 }, renderHints:{ wallHeight:state.wallHeight, gap:state.gap, layoutStyle:labels.layout[state.layout], edgeStyle:labels.edge[state.edge], wallMaterialPreset:state.material, floorStyle:state.floor, colorOverrides:state.colors }, entities:[{id:'maze_start',type:'marker',role:'start',grid:state.start},{id:'maze_exit',type:'trigger_zone',role:'exit',grid:state.exit,setsFlag:$('completion-flag')?.value || 'maze_exit_reached'}], solution:{generated:!!state.solution.length,path:state.solution} }; }
function downloadJson(){ const id=$('module-id')?.value || 'maze-module', blob=new Blob([JSON.stringify(exportObj(),null,2)],{type:'application/json'}), a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${id}.json`; a.click(); URL.revokeObjectURL(a.href); ready('JSON downloaded'); }
async function copyJson(){ try{ await navigator.clipboard.writeText(JSON.stringify(exportObj(),null,2)); ready('JSON copied'); }catch{ ready('Clipboard blocked'); } }
function importJson(file){ if(!file) return; const fr=new FileReader(); fr.onload=()=>{ try{ const d=JSON.parse(fr.result); state.matrix=d.grid.matrix; state.gridSize=d.grid.rows; state.colors=d.renderHints?.colorOverrides || blankColors(); state.start=d.puzzle.start; state.exit=d.puzzle.exit; state.solution=d.solution?.path || []; $('grid-slider').value=state.gridSize; $('module-id').value=d.moduleId || ''; renderAll('JSON imported'); }catch{ ready('Import failed'); } }; fr.readAsText(file); }
