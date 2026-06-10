const templates = {
  cube: {
    label: 'Cube',
    objective: 'Place the four signs on the visible ritual cube so the clue reads correctly.',
    hint: 'Moon above milk, fire beside silver.',
    emojis: ['🌙','🥛','🔥','🪙','🌿'],
    points: [
      [-1,-1,1,'🌙'], [1,-1,1,'🥛'], [-1,1,1,'🔥'], [1,1,1,'🪙'],
      [-1,-1,-1,'🌿'], [1,-1,-1,'🌙'], [-1,1,-1,'🥛'], [1,1,-1,'🔥']
    ]
  },
  pyramid: {
    label: 'Pyramid',
    objective: 'Set the apex and base signs in the correct order.',
    hint: 'Star crowns the form; salt guards the lower left.',
    emojis: ['✨','🧂','🌿','💧','🔥'],
    points: [[0,-1.35,0,'✨'],[-1,1,1,'🧂'],[1,1,1,'🌿'],[1,1,-1,'💧'],[-1,1,-1,'🔥']]
  },
  diamond: {
    label: 'Diamond',
    objective: 'Balance the upper and lower signs across the diamond.',
    hint: 'Water below, ember above, moon and herb across the middle.',
    emojis: ['💧','🔥','🌙','🌿','🪙'],
    points: [[0,-1.45,0,'🔥'],[0,1.45,0,'💧'],[-1,0,0,'🌙'],[1,0,0,'🌿'],[0,0,1,'🪙'],[0,0,-1,'🔥']]
  },
  sphere: {
    label: 'Sphere',
    objective: 'Place signs on the ritual sphere without revealing which point is wrong.',
    hint: 'The first ring follows moon, herb, water, fire.',
    emojis: ['🌙','🌿','💧','🔥','✨','🧂'],
    points: [
      [0,-1.25,0,'✨'],[-.95,-.45,.55,'🌙'],[0,-.45,1,'🌿'],[.95,-.45,.55,'💧'],
      [.95,-.45,-.55,'🔥'],[0,-.45,-1,'🧂'],[-.95,-.45,-.55,'🌙'],
      [-.75,.55,.45,'🌿'],[.75,.55,.45,'💧'],[.75,.55,-.45,'🔥'],[-.75,.55,-.45,'✨'],[0,1.2,0,'🧂']
    ]
  }
};

const state = {
  templateId:'cube',
  yaw:-0.55,
  pitch:0.28,
  drag:false,
  lastX:0,
  lastY:0,
  selected:null,
  erasing:false,
  placements:new Map(),
  projected:[],
  complete:false
};

const $ = id => document.getElementById(id);
const canvas = $('patternCanvas');
const ctx = canvas.getContext('2d');

function resize(){
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  draw();
}

function rotatePoint([x,y,z,expected]){
  const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw);
  const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const y1 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  return {x:x1,y:y1,z:z2,expected};
}

function template(){ return templates[state.templateId] || templates.cube; }

function draw(){
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.fillStyle = '#050307';
  ctx.fillRect(0,0,w,h);
  drawGrid(w,h);
  const t = template();
  const scale = Math.min(w,h) * 0.22;
  const cx = w * 0.5;
  const cy = h * 0.49;
  const projected = t.points.map((point,index) => {
    const p = rotatePoint(point);
    return {...p,index, sx: cx + p.x * scale, sy: cy + p.y * scale, r: 24 + p.z * 3};
  }).sort((a,b)=>a.z-b.z);
  state.projected = projected;
  drawShape(projected, w, h);
  projected.forEach(drawPoint);
  ctx.restore();
}

function drawGrid(w,h){
  ctx.strokeStyle = 'rgba(190,139,222,.07)';
  ctx.lineWidth = 1;
  for(let x=0;x<w;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
}

function drawShape(points){
  ctx.save();
  ctx.lineWidth = 2;
  for (let i=0;i<points.length;i++){
    for (let j=i+1;j<points.length;j++){
      const a=points[i], b=points[j];
      const dx=a.x-b.x, dy=a.y-b.y, dz=a.z-b.z;
      const dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
      if (dist < 2.05) {
        ctx.strokeStyle = `rgba(158,230,164,${0.10 + Math.max(a.z,b.z)*0.05})`;
        ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawPoint(p){
  const value = state.placements.get(p.index);
  const isCorrect = state.complete && value === p.expected;
  ctx.save();
  ctx.globalAlpha = p.z < -0.9 ? .42 : 1;
  const grd = ctx.createRadialGradient(p.sx-8,p.sy-8,4,p.sx,p.sy,p.r+10);
  grd.addColorStop(0, isCorrect ? '#d7ffd9' : '#f4ead4');
  grd.addColorStop(1, isCorrect ? '#2f7b3a' : '#6d4a7a');
  ctx.fillStyle = grd;
  ctx.strokeStyle = isCorrect ? '#9ee6a4' : '#eec45a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(p.sx,p.sy,p.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#07050b';
  ctx.font = `${Math.max(18,p.r*1.05)}px "Segoe UI Emoji","Apple Color Emoji",sans-serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(value || '?', p.sx, p.sy+1);
  ctx.restore();
}

function nearestPoint(clientX, clientY){
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left, y = clientY - rect.top;
  let best = null, bestD = Infinity;
  [...state.projected].reverse().forEach(p => {
    const d = Math.hypot(p.sx-x,p.sy-y);
    if (d < p.r + 10 && d < bestD) {best=p; bestD=d;}
  });
  return best;
}

function selectEmoji(emoji){
  state.selected = emoji;
  state.erasing = emoji === null;
  document.querySelectorAll('[data-emoji]').forEach(btn => btn.classList.toggle('active', btn.dataset.emoji === emoji));
  $('eraseBtn').classList.toggle('active', state.erasing);
  $('viewStatus').textContent = state.erasing ? 'Erase mode. Click a point to clear it.' : `${emoji} selected. Click a point to place it.`;
}

function loadTemplate(id){
  state.templateId = id;
  state.placements.clear();
  state.complete = false;
  const t = template();
  $('templateName').textContent = t.label;
  $('objective').textContent = t.objective;
  $('hint').textContent = t.hint;
  $('templateSelect').value = state.templateId;
  renderTray();
  selectEmoji(t.emojis[0]);
  setStatus('The form awaits its signs.', '');
  updateProgress();
  draw();
}

function renderTray(){
  const tray = $('emojiTray');
  tray.innerHTML = '';
  template().emojis.forEach(emoji => {
    const b = document.createElement('button');
    b.type='button';
    b.dataset.emoji=emoji;
    b.textContent=emoji;
    b.addEventListener('click',()=>selectEmoji(emoji));
    tray.appendChild(b);
  });
}

function setStatus(text, type){
  const status = $('result');
  status.textContent = text;
  status.className = `status ${type || ''}`;
}

function updateProgress(){
  $('progress').textContent = `${state.placements.size} / ${template().points.length}`;
}

function fillExample(){
  state.placements.clear();
  template().points.forEach((p,i)=>state.placements.set(i,p[3]));
  state.complete = false;
  setStatus('Correct example loaded. Press Check Pattern to validate it.', '');
  updateProgress();
  draw();
}

function clearAll(){
  state.placements.clear();
  state.complete = false;
  setStatus('Placements cleared. The form awaits its signs.', '');
  updateProgress();
  draw();
}

function check(){
  const ok = template().points.every((p,i)=>state.placements.get(i) === p[3]);
  state.complete = ok;
  setStatus(ok ? 'Pattern Complete · the form answers the hint.' : 'The pattern does not yet answer the hint.', ok ? 'success' : 'error');
  draw();
}

canvas.addEventListener('pointerdown', e => {
  state.drag = true; state.lastX=e.clientX; state.lastY=e.clientY; canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if(!state.drag) return;
  const dx=e.clientX-state.lastX, dy=e.clientY-state.lastY;
  state.lastX=e.clientX; state.lastY=e.clientY;
  if (Math.abs(dx)+Math.abs(dy) > 1) {
    state.yaw += dx * 0.008;
    state.pitch = Math.max(-1.15, Math.min(1.15, state.pitch + dy * 0.008));
    draw();
  }
});
canvas.addEventListener('pointerup', e => {
  canvas.releasePointerCapture(e.pointerId);
  state.drag = false;
});
canvas.addEventListener('click', e => {
  const p = nearestPoint(e.clientX,e.clientY);
  if(!p) return;
  if(state.erasing) state.placements.delete(p.index);
  else if(state.selected) state.placements.set(p.index,state.selected);
  state.complete=false;
  setStatus('Pattern changed. Press Check Pattern when ready.', '');
  updateProgress();
  draw();
});

$('templateSelect').addEventListener('change', e=>loadTemplate(e.target.value));
$('resetBtn').addEventListener('click', ()=>loadTemplate(state.templateId));
$('exampleBtn').addEventListener('click', fillExample);
$('clearBtn').addEventListener('click', clearAll);
$('checkBtn').addEventListener('click', check);
$('eraseBtn').addEventListener('click', ()=>selectEmoji(null));
$('resetViewBtn').addEventListener('click', ()=>{state.yaw=-0.55; state.pitch=0.28; draw();});
window.addEventListener('resize', resize);
loadTemplate('cube');
resize();
