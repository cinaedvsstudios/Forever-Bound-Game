(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const video = $('sourceVideo');
  const canvas = $('videoCanvas');
  const ctx = canvas.getContext('2d');
  const line = $('timelineCanvas');
  const lineCtx = line.getContext('2d');
  const state = { name: '', duration: 0, fps: 30, in: null, out: null, regions: [], selected: -1, thumbs: [], patch: null, mode: 'preview', drag: null, loop: false };
  const pad = n => String(n).padStart(2, '0');
  const time = seconds => Number.isFinite(seconds) ? `${pad(Math.floor(seconds / 60))}:${(seconds % 60).toFixed(3).padStart(6, '0')}` : '--:--.---';
  const selected = () => state.regions[state.selected];
  function status(text) { $('statusText').textContent = text; }
  function notice(text) { const node = $('toast'); node.textContent = text; node.classList.add('is-visible'); setTimeout(() => node.classList.remove('is-visible'), 2200); }
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#030304'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!video.videoWidth) return;
    const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
    const w = video.videoWidth * scale, h = video.videoHeight * scale;
    ctx.drawImage(video, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    const region = selected();
    if (region && region.patch && video.currentTime >= region.start && video.currentTime <= region.end && $('showPatch').checked) {
      const p = region.patch; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.scale(p.scale / 100, p.scale / 100); ctx.globalAlpha = p.opacity / 100; ctx.filter = p.feather ? `blur(${p.feather / 2}px)` : 'none'; ctx.drawImage(p.image, -p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (state.drag && state.mode === 'capture') { const b = box(state.drag.a, state.drag.b); ctx.strokeStyle = '#c300ff'; ctx.lineWidth = 3; ctx.setLineDash([8, 5]); ctx.strokeRect(b.x, b.y, b.w, b.h); }
  }
  function box(a, b) { return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }; }
  function point(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * canvas.width, y: (e.clientY - r.top) / r.height * canvas.height }; }
  function timeline() {
    const w = line.width, h = line.height; lineCtx.fillStyle = '#08090b'; lineCtx.fillRect(0, 0, w, h);
    if (!state.duration) return;
    state.regions.forEach((r, i) => { lineCtx.fillStyle = i === state.selected ? '#c300ff' : '#b8773f'; lineCtx.fillRect(r.start / state.duration * w, h - 28, Math.max(4, (r.end - r.start) / state.duration * w), 18); });
    if (state.in !== null) { lineCtx.strokeStyle = '#66c7ff'; lineCtx.beginPath(); lineCtx.moveTo(state.in / state.duration * w, 0); lineCtx.lineTo(state.in / state.duration * w, h); lineCtx.stroke(); }
    if (state.out !== null) { lineCtx.strokeStyle = '#ffd86b'; lineCtx.beginPath(); lineCtx.moveTo(state.out / state.duration * w, 0); lineCtx.lineTo(state.out / state.duration * w, h); lineCtx.stroke(); }
    lineCtx.strokeStyle = '#fff'; lineCtx.beginPath(); lineCtx.moveTo(video.currentTime / state.duration * w, 0); lineCtx.lineTo(video.currentTime / state.duration * w, h); lineCtx.stroke();
  }
  function renderRegions() {
    const list = $('repairList'); list.innerHTML = '';
    if (!state.regions.length) { list.textContent = 'No repair regions marked yet.'; return; }
    state.regions.forEach((r, i) => { const card = document.createElement('div'); card.className = `repair-card ${i === state.selected ? 'is-selected' : ''}`; card.innerHTML = `<div class="repair-card-header"><span class="repair-index">REPAIR ${pad(i + 1)}</span><strong></strong></div><div class="repair-times">${time(r.start)} — ${time(r.end)}</div><span class="repair-state ${r.patch ? 'ready' : ''}">${r.patch ? 'Patch captured' : 'Awaiting donor mouth'}</span>`; card.querySelector('strong').textContent = r.phrase; card.onclick = () => choose(i, true); list.appendChild(card); });
  }
  function shapes(text) { const value = text.toLowerCase(); const out = []; if (/[mbp]/.test(value)) out.push('Closed lips'); if (/o|oo|u/.test(value)) out.push('Rounded vowel'); if (/[aei]/.test(value)) out.push('Open vowel'); if (/[fv]/.test(value)) out.push('Teeth on lip'); if (/th|l/.test(value)) out.push('Tongue transition'); return out.length ? out : ['Soft transition']; }
  function mapText(text) { const map = $('visemeMap'); map.innerHTML = ''; shapes(text).forEach(label => { const chip = document.createElement('div'); chip.className = 'viseme-chip'; chip.innerHTML = `<strong>${label}</strong><span>Suggested visible mouth shape</span>`; map.appendChild(chip); }); }
  function choose(index, seek) { state.selected = index; const r = selected(); $('patchFields').hidden = false; $('noRegionMessage').hidden = true; $('selectedRepairLabel').textContent = `${r.phrase} · ${time(r.start)}–${time(r.end)}`; $('phraseInput').value = r.phrase; mapText(r.phrase); if (seek) video.currentTime = r.start; renderRegions(); frame(); timeline(); }
  function updatePatch() { const r = selected(); if (!r || !r.patch) return; r.patch.x = +$('patchX').value; r.patch.y = +$('patchY').value; r.patch.scale = +$('patchScale').value; r.patch.rotation = +$('patchRotation').value; r.patch.feather = +$('patchFeather').value; r.patch.opacity = +$('patchOpacity').value; $('patchScaleOut').textContent = `${r.patch.scale}%`; $('patchRotationOut').textContent = `${r.patch.rotation}°`; $('patchFeatherOut').textContent = `${r.patch.feather} px`; $('patchOpacityOut').textContent = `${r.patch.opacity}%`; frame(); }
  async function thumbnails() { const strip = $('donorStrip'); strip.innerHTML = ''; const current = video.currentTime; const count = Math.min(16, Math.max(8, Math.ceil(state.duration / 1.5))); for (let i = 0; i < count; i++) { await seek(i / (count - 1) * (state.duration - 0.01)); frame(); const button = document.createElement('button'); button.className = 'donor-frame'; const image = new Image(); image.src = canvas.toDataURL('image/jpeg', 0.8); button.appendChild(image); const caption = document.createElement('span'); caption.textContent = time(video.currentTime); button.appendChild(caption); const t = video.currentTime; button.onclick = () => { video.currentTime = t; state.mode = 'capture'; $('canvasModeLabel').textContent = 'Capture donor mouth'; }; strip.appendChild(button); } await seek(current); status('Donor frame strip ready.'); }
  function seek(value) { return new Promise(resolve => { video.addEventListener('seeked', resolve, { once: true }); video.currentTime = Math.max(0, Math.min(state.duration - 0.001, value)); }); }
  $('videoFile').onchange = e => { const file = e.target.files[0]; if (!file) return; state.name = file.name; video.src = URL.createObjectURL(file); $('videoName').textContent = file.name; $('blankMessage').hidden = true; };
  video.onloadedmetadata = () => { state.duration = video.duration; $('durationText').textContent = time(state.duration); ['playBtn','backFrameBtn','forwardFrameBtn','markInBtn','markOutBtn','buildStripBtn'].forEach(id => $(id).disabled = false); status('Video loaded. Mark a faulty word.'); thumbnails(); };
  video.ontimeupdate = () => { $('currentTimeText').textContent = time(video.currentTime); if (state.loop && selected() && video.currentTime >= selected().end) video.currentTime = selected().start; frame(); timeline(); };
  $('playBtn').onclick = () => video.paused ? video.play() : video.pause();
  $('backFrameBtn').onclick = () => { video.pause(); video.currentTime -= 1 / state.fps; };
  $('forwardFrameBtn').onclick = () => { video.pause(); video.currentTime += 1 / state.fps; };
  $('fpsInput').onchange = e => state.fps = +e.target.value;
  $('markInBtn').onclick = () => { state.in = video.currentTime; $('markInText').textContent = time(state.in); timeline(); };
  $('markOutBtn').onclick = () => { state.out = video.currentTime; $('markOutText').textContent = time(state.out); timeline(); };
  $('clearMarksBtn').onclick = () => { state.in = state.out = null; $('markInText').textContent = $('markOutText').textContent = '--:--.---'; timeline(); };
  $('phraseInput').oninput = e => { mapText(e.target.value); $('addRegionBtn').disabled = !(state.in !== null && state.out > state.in && e.target.value.trim()); };
  $('addRegionBtn').onclick = () => { const phrase = $('phraseInput').value.trim(); state.regions.push({ start: state.in, end: state.out, phrase, patch: null }); choose(state.regions.length - 1, true); notice(`Repair region added: ${phrase}`); };
  $('captureModeBtn').onclick = () => { state.mode = 'capture'; $('canvasModeLabel').textContent = 'Capture donor mouth'; };
  $('placeModeBtn').onclick = () => { state.mode = 'place'; $('canvasModeLabel').textContent = 'Position patch'; };
  canvas.onpointerdown = e => { if (!selected()) return; const p = point(e); if (state.mode === 'capture') state.drag = { a: p, b: p }; else if (state.mode === 'place' && selected().patch) state.drag = { move: true, offset: { x: p.x - selected().patch.x, y: p.y - selected().patch.y } }; };
  canvas.onpointermove = e => { if (!state.drag) return; const p = point(e); if (state.drag.move) { selected().patch.x = p.x - state.drag.offset.x; selected().patch.y = p.y - state.drag.offset.y; $('patchX').value = Math.round(selected().patch.x); $('patchY').value = Math.round(selected().patch.y); } else state.drag.b = p; frame(); };
  canvas.onpointerup = () => { if (!state.drag) return; if (!state.drag.move) { const b = box(state.drag.a, state.drag.b); if (b.w > 8 && b.h > 8) { const crop = document.createElement('canvas'); crop.width = b.w; crop.height = b.h; crop.getContext('2d').drawImage(canvas, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h); const image = new Image(); image.onload = frame; image.src = crop.toDataURL(); selected().patch = { image, w:b.w, h:b.h, x:b.x+b.w/2, y:b.y+b.h/2, scale:100, rotation:0, feather:5, opacity:100 }; $('patchX').value = Math.round(selected().patch.x); $('patchY').value = Math.round(selected().patch.y); $('donorTime').textContent = time(video.currentTime); state.mode = 'place'; video.currentTime = selected().start; renderRegions(); } } state.drag = null; frame(); };
  ['patchX','patchY','patchScale','patchRotation','patchFeather','patchOpacity','showPatch'].forEach(id => $(id).oninput = updatePatch);
  $('loopBtn').onclick = () => { state.loop = !state.loop; $('loopBtn').textContent = `Loop Selected: ${state.loop ? 'On' : 'Off'}`; if (selected()) { video.currentTime = selected().start; video.play(); } };
  line.onclick = e => { if (!state.duration) return; const r = line.getBoundingClientRect(); video.currentTime = (e.clientX - r.left) / r.width * state.duration; };
  $('buildStripBtn').onclick = thumbnails;
  $('downloadPlanBtn').onclick = () => { const plan = state.regions.map(r => ({ start:r.start, end:r.end, phrase:r.phrase, patch:r.patch ? { x:r.patch.x, y:r.patch.y, scale:r.patch.scale, rotation:r.patch.rotation, feather:r.patch.feather, opacity:r.patch.opacity } : null })); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(plan, null, 2)], { type:'application/json' })); a.download = 'lipsync-repair-plan.json'; a.click(); };
  line.width = 1200; line.height = 110; frame(); timeline();
})();
