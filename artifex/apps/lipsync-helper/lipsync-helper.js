(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const video = $('video');
  const viewer = $('videoCanvas');
  const vctx = viewer.getContext('2d');
  const timeline = $('timeline');
  const tctx = timeline.getContext('2d');
  const dropZone = $('dropZone');
  const sourceCanvas = document.createElement('canvas');
  const sctx = sourceCanvas.getContext('2d');
  const thumbCanvas = document.createElement('canvas');
  const thumbCtx = thumbCanvas.getContext('2d');
  thumbCanvas.width = 240;
  thumbCanvas.height = 135;

  const STORAGE_KEY = 'artifex.lipsync.visemeModels.v1';
  const VISEMES = [
    { key: 'aei', label: 'a e i' },
    { key: 'o', label: 'o' },
    { key: 'bmp', label: 'b m p' },
    { key: 'soft', label: 'c d g k n s t x y z' },
    { key: 'u', label: 'u' },
    { key: 'fv', label: 'f v' },
    { key: 'th', label: 'th' },
    { key: 'ee', label: 'ee' },
    { key: 'qw', label: 'q w' },
    { key: 'r', label: 'r' },
    { key: 'l', label: 'l' },
    { key: 'ch', label: 'ch j sh' }
  ];
  const COMMON_PHRASES = {
    oh: ['o', 'o'], ohh: ['o', 'o', 'o'], ohhh: ['o', 'o', 'o'],
    end: ['aei', 'soft'], laughter: ['l', 'aei', 'fv', 'th', 'r'],
    'it be': ['aei', 'soft', 'bmp', 'ee']
  };
  const state = {
    url: '', duration: 0, fps: 30, pendingStart: null,
    regions: [], selectedRegionId: '', selectedSegmentId: '',
    mode: 'repair', loop: false, modelMode: false, modelViseme: 'o',
    thumbView: 'video', thumbs: [], selectedThumb: -1, buildingThumbs: false,
    libraries: loadLibraries(), pointer: null, captureBox: null, raf: 0,
    videoRect: { x: 0, y: 0, w: 1, h: 1 }
  };
  let toastTimer = 0;

  function loadLibraries() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function saveLibraries() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.libraries)); }
    catch (_) { toast('Browser storage is full; this viseme sample was not saved.'); }
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function fmt(seconds) {
    if (!Number.isFinite(seconds)) return '--:--.---';
    const value = Math.max(0, seconds);
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${(value % 60).toFixed(3).padStart(6, '0')}`;
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function aspectLabel(width, height) {
    if (!width || !height) return '--';
    const divider = gcd(width, height);
    const w = width / divider, h = height / divider;
    return w <= 40 && h <= 40 ? `${w}:${h}` : `${(width / height).toFixed(3)}:1`;
  }
  function toast(text) {
    const node = $('toast');
    node.textContent = text;
    node.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('visible'), 2400);
  }
  function status(text) { $('statusText').textContent = text; }
  function characterName() { return $('characterName').value.trim() || 'Unnamed Character'; }
  function selectedRegion() { return state.regions.find(region => region.id === state.selectedRegionId) || null; }
  function selectedSegment() {
    const region = selectedRegion();
    return region ? region.segments.find(segment => segment.id === state.selectedSegmentId) || null : null;
  }
  function totalFrames(region) { return Math.max(1, Math.round((region.end - region.start) * state.fps)); }
  function visemeLabel(key) { return VISEMES.find(viseme => viseme.key === key)?.label || key; }
  function newId(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

  function deriveVisemes(input) {
    const phrase = input.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, ' ');
    if (!phrase) return [];
    if (COMMON_PHRASES[phrase]) return [...COMMON_PHRASES[phrase]];
    const result = [];
    for (let i = 0; i < phrase.length; i += 1) {
      const char = phrase[i];
      const pair = phrase.slice(i, i + 2);
      let key = '';
      if (pair === 'th') { key = 'th'; i += 1; }
      else if (pair === 'ch' || pair === 'sh') { key = 'ch'; i += 1; }
      else if (pair === 'ee') { key = 'ee'; i += 1; }
      else if (char === ' ') continue;
      else if ('bmp'.includes(char)) key = 'bmp';
      else if ('fv'.includes(char)) key = 'fv';
      else if (char === 'o') key = 'o';
      else if (char === 'u') key = 'u';
      else if ('qw'.includes(char)) key = 'qw';
      else if (char === 'r') key = 'r';
      else if (char === 'l') key = 'l';
      else if ('aei'.includes(char)) key = 'aei';
      else key = 'soft';
      if (!result.length || result[result.length - 1] !== key || key === 'o' || key === 'ee') result.push(key);
    }
    return result;
  }
  function refreshSegmentBounds(region) {
    let cursor = 0;
    region.segments.forEach(segment => {
      segment.startFrame = cursor;
      segment.endFrame = cursor + segment.frames - 1;
      cursor += segment.frames;
    });
  }
  function rebuildSegments(region) {
    const frameCount = totalFrames(region);
    let keys = deriveVisemes(region.phrase);
    if (keys.length > frameCount) keys = keys.slice(0, frameCount);
    if (!keys.length) { region.segments = []; state.selectedSegmentId = ''; return; }
    const existing = region.segments || [];
    const old = new Map(existing.map(segment => [`${segment.viseme}:${segment.index}`, segment]));
    const weights = keys.map(key => ['o', 'ee', 'aei', 'u', 'qw'].includes(key) ? 2 : 1);
    const weightTotal = weights.reduce((sum, value) => sum + value, 0);
    let assigned = 0;
    region.segments = keys.map((key, index) => {
      const remainingSlots = keys.length - index;
      const remainingFrames = frameCount - assigned;
      const preferred = index === keys.length - 1 ? remainingFrames : Math.round(frameCount * weights[index] / weightTotal);
      const frames = Math.max(1, Math.min(preferred, remainingFrames - remainingSlots + 1));
      const previous = old.get(`${key}:${index}`);
      assigned += frames;
      return { id: previous?.id || newId('segment'), index, viseme: key, frames, startFrame: 0, endFrame: 0, patch: previous?.patch || null };
    });
    refreshSegmentBounds(region);
    if (!region.segments.some(segment => segment.id === state.selectedSegmentId)) state.selectedSegmentId = region.segments[0].id;
  }
  function adjustSegmentFrames(index, delta) {
    const region = selectedRegion();
    if (!region || region.segments.length < 2) return;
    const current = region.segments[index];
    const neighbour = region.segments[index < region.segments.length - 1 ? index + 1 : index - 1];
    if (delta > 0 && neighbour.frames > 1) { current.frames += 1; neighbour.frames -= 1; }
    if (delta < 0 && current.frames > 1) { current.frames -= 1; neighbour.frames += 1; }
    refreshSegmentBounds(region);
    renderSegments();
    drawTimeline();
  }
  function segmentAtTime(region, time) {
    if (!region || time < region.start || time > region.end || !region.segments.length) return null;
    const frame = clamp(Math.floor((time - region.start) * state.fps), 0, totalFrames(region) - 1);
    return region.segments.find(segment => frame >= segment.startFrame && frame <= segment.endFrame) || region.segments[region.segments.length - 1];
  }

  function resizeCanvases() {
    const viewerRect = viewer.getBoundingClientRect();
    viewer.width = Math.max(1, Math.round(viewerRect.width));
    viewer.height = Math.max(1, Math.round(viewerRect.height));
    sourceCanvas.width = viewer.width;
    sourceCanvas.height = viewer.height;
    const timelineRect = timeline.getBoundingClientRect();
    timeline.width = Math.max(520, Math.round(timelineRect.width));
    timeline.height = Math.max(90, Math.round(timelineRect.height));
    drawViewer();
    drawTimeline();
  }
  function drawRawFrame(context, width, height, updateVideoRect = false) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    if (!video.videoWidth) return;
    const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
    const drawWidth = video.videoWidth * scale;
    const drawHeight = video.videoHeight * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    context.drawImage(video, x, y, drawWidth, drawHeight);
    if (updateVideoRect) state.videoRect = { x, y, w: drawWidth, h: drawHeight };
  }
  function patchPixels(patch) {
    const rect = state.videoRect;
    return { x: rect.x + patch.nx * rect.w, y: rect.y + patch.ny * rect.h, w: patch.nw * rect.w, h: patch.nh * rect.h };
  }
  function buildPatchImage(patch) {
    const output = document.createElement('canvas');
    const mask = document.createElement('canvas');
    output.width = mask.width = patch.sourceW;
    output.height = mask.height = patch.sourceH;
    const out = output.getContext('2d');
    const maskCtx = mask.getContext('2d');
    out.filter = `brightness(${patch.brightness}%) contrast(${patch.contrast}%) saturate(${patch.saturation}%)`;
    out.drawImage(patch.image, 0, 0, output.width, output.height);
    out.filter = 'none';
    if (patch.warmth !== 0) {
      out.globalCompositeOperation = 'soft-light';
      out.globalAlpha = Math.abs(patch.warmth) / 170;
      out.fillStyle = patch.warmth > 0 ? '#ff9348' : '#498fff';
      out.fillRect(0, 0, output.width, output.height);
      out.globalAlpha = 1;
      out.globalCompositeOperation = 'source-over';
    }
    const feather = clamp(patch.feather, 0, Math.min(output.width, output.height) / 2);
    const inset = Math.max(1, feather + 1);
    maskCtx.filter = feather ? `blur(${feather}px)` : 'none';
    maskCtx.fillStyle = '#fff';
    maskCtx.beginPath();
    maskCtx.ellipse(output.width / 2, output.height / 2, Math.max(1, output.width / 2 - inset), Math.max(1, output.height / 2 - inset), 0, 0, Math.PI * 2);
    maskCtx.fill();
    out.globalCompositeOperation = 'destination-in';
    out.drawImage(mask, 0, 0);
    return output;
  }
  function drawPatch(segment, selected) {
    const patch = segment?.patch;
    if (!patch?.image || !patch.visible) return;
    const pixels = patchPixels(patch);
    const filtered = buildPatchImage(patch);
    const scale = patch.scale / 100;
    vctx.save();
    vctx.translate(pixels.x, pixels.y);
    vctx.rotate(patch.rotation * Math.PI / 180);
    vctx.transform(1, Math.tan(patch.skewY * Math.PI / 180), Math.tan(patch.skewX * Math.PI / 180), 1, 0, 0);
    vctx.scale(scale * patch.widthScale / 100, scale * patch.heightScale / 100);
    vctx.globalAlpha = patch.opacity / 100;
    vctx.drawImage(filtered, -pixels.w / 2, -pixels.h / 2, pixels.w, pixels.h);
    if (selected && state.mode === 'position') {
      vctx.globalAlpha = 1;
      vctx.strokeStyle = '#ff9c19';
      vctx.lineWidth = 2 / Math.max(scale, 0.1);
      vctx.setLineDash([8 / Math.max(scale, 0.1), 5 / Math.max(scale, 0.1)]);
      vctx.strokeRect(-pixels.w / 2, -pixels.h / 2, pixels.w, pixels.h);
    }
    vctx.restore();
  }
  function drawViewer() {
    drawRawFrame(sctx, sourceCanvas.width, sourceCanvas.height, true);
    vctx.clearRect(0, 0, viewer.width, viewer.height);
    vctx.drawImage(sourceCanvas, 0, 0);
    if (!state.modelMode) {
      const region = selectedRegion();
      const active = segmentAtTime(region, video.currentTime);
      if (active) drawPatch(active, active.id === state.selectedSegmentId);
    }
    if (state.mode === 'capture' && state.captureBox) {
      const box = normalBox(state.captureBox.a, state.captureBox.b);
      vctx.save();
      vctx.fillStyle = 'rgba(255,156,25,.13)';
      vctx.strokeStyle = '#ff9c19';
      vctx.lineWidth = 3;
      vctx.setLineDash([10, 6]);
      vctx.fillRect(box.x, box.y, box.w, box.h);
      vctx.strokeRect(box.x, box.y, box.w, box.h);
      vctx.restore();
    }
  }
  function xFor(time) { return 32 + (timeline.width - 64) * (time / state.duration); }
  function drawTimeline() {
    const width = timeline.width, height = timeline.height;
    tctx.clearRect(0, 0, width, height);
    tctx.fillStyle = '#0c0e13';
    tctx.fillRect(0, 0, width, height);
    if (!state.duration) {
      tctx.fillStyle = '#777482';
      tctx.font = `${Math.max(11, height * .12)}px sans-serif`;
      tctx.fillText('Load a video to place repair regions.', 18, height / 2);
      return;
    }
    const baseline = height * .59;
    tctx.strokeStyle = 'rgba(158,115,243,.42)';
    tctx.lineWidth = Math.max(5, height * .06);
    tctx.lineCap = 'round';
    tctx.beginPath(); tctx.moveTo(32, baseline); tctx.lineTo(width - 32, baseline); tctx.stroke();
    tctx.lineCap = 'butt';
    for (let i = 0; i <= 8; i += 1) {
      const time = i / 8 * state.duration, x = xFor(time);
      tctx.strokeStyle = 'rgba(255,255,255,.14)'; tctx.lineWidth = 1;
      tctx.beginPath(); tctx.moveTo(x, baseline - height * .10); tctx.lineTo(x, baseline + height * .11); tctx.stroke();
      tctx.fillStyle = '#918c9b'; tctx.font = `${Math.max(9, height * .085)}px sans-serif`; tctx.textAlign = 'center';
      tctx.fillText(fmt(time), x, baseline + height * .29);
    }
    state.regions.forEach((region, index) => {
      const selected = region.id === state.selectedRegionId;
      const startX = xFor(region.start), endX = xFor(region.end), y = baseline - height * .14, barHeight = height * .22;
      tctx.fillStyle = selected ? 'rgba(255,156,25,.34)' : 'rgba(158,115,243,.24)';
      tctx.strokeStyle = selected ? '#ff9c19' : '#9e73f3'; tctx.lineWidth = 2;
      tctx.beginPath(); tctx.roundRect(startX, y, Math.max(5, endX - startX), barHeight, 6); tctx.fill(); tctx.stroke();
      if (selected && region.segments.length) {
        region.segments.forEach(segment => {
          const sx = startX + (endX - startX) * segment.startFrame / totalFrames(region);
          const ex = startX + (endX - startX) * (segment.endFrame + 1) / totalFrames(region);
          tctx.fillStyle = segment.id === state.selectedSegmentId ? 'rgba(255,208,115,.43)' : 'rgba(255,255,255,.07)';
          tctx.fillRect(sx + 1, y + 1, Math.max(1, ex - sx - 2), barHeight - 2);
        });
      }
      [region.start, region.end].forEach((time, markerIndex) => {
        const px = xFor(time), py = y - 14;
        tctx.strokeStyle = selected ? '#ffe0a5' : '#dfd0ff'; tctx.fillStyle = selected ? '#ff9c19' : '#9e73f3';
        tctx.beginPath(); tctx.moveTo(px, py + 8); tctx.lineTo(px, y); tctx.stroke();
        tctx.beginPath(); tctx.arc(px, py, 8, 0, Math.PI * 2); tctx.fill(); tctx.stroke();
        tctx.fillStyle = '#fff'; tctx.font = `bold ${Math.max(9, height * .072)}px sans-serif`; tctx.textBaseline = 'middle';
        tctx.fillText(markerIndex === 0 ? 'S' : 'E', px, py);
      });
      tctx.fillStyle = selected ? '#ffc267' : '#aba9b6'; tctx.font = `${Math.max(9, height * .072)}px sans-serif`;
      tctx.fillText(String(index + 1), startX + 8, y + barHeight * .7);
    });
    if (state.pendingStart !== null) {
      const pendingX = xFor(state.pendingStart);
      tctx.strokeStyle = '#66c7ff'; tctx.lineWidth = 2;
      tctx.beginPath(); tctx.moveTo(pendingX, height * .10); tctx.lineTo(pendingX, baseline + height * .16); tctx.stroke();
    }
    const cursorX = xFor(video.currentTime || 0);
    tctx.strokeStyle = '#fff'; tctx.lineWidth = 2;
    tctx.beginPath(); tctx.moveTo(cursorX, height * .07); tctx.lineTo(cursorX, height * .88); tctx.stroke();
    tctx.textAlign = 'left'; tctx.textBaseline = 'alphabetic';
  }

  function renderGuideChoices() {
    const container = $('guideChoices');
    container.innerHTML = '';
    const mapped = new Set(selectedRegion()?.segments.map(segment => segment.viseme) || []);
    VISEMES.forEach(viseme => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `viseme-choice ${(state.modelMode ? state.modelViseme === viseme.key : mapped.has(viseme.key)) ? 'active' : ''}`;
      button.textContent = viseme.label;
      button.onclick = () => { state.modelViseme = viseme.key; renderGuideChoices(); if (state.modelMode || state.thumbView === 'library') renderDonors(); renderPatchControls(); };
      container.appendChild(button);
    });
  }
  function renderRegions() {
    const list = $('regionList');
    list.innerHTML = '';
    if (!state.regions.length) { list.innerHTML = '<p class="empty">No repair regions.</p>'; return; }
    state.regions.forEach((region, index) => {
      const complete = region.segments.length && region.segments.every(segment => segment.patch?.image);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `region-card ${region.id === state.selectedRegionId ? 'selected' : ''}`;
      button.innerHTML = `<span class="region-card-top"><span>REPAIR ${String(index + 1).padStart(2, '0')}</span><span>${fmt(region.start)}–${fmt(region.end)}</span></span><strong></strong><small>${totalFrames(region)} frames · ${complete ? 'Patches placed' : region.segments.length ? 'Assign mouth patches' : 'Type correct phrase'}</small>`;
      button.querySelector('strong').textContent = region.phrase || 'Enter words…';
      button.onclick = () => selectRegion(region.id, true);
      list.appendChild(button);
    });
  }
  function renderSegments() {
    const strip = $('segmentStrip');
    const region = selectedRegion();
    strip.innerHTML = '';
    if (!region?.segments.length) { strip.innerHTML = '<p class="empty">No viseme segments yet.</p>'; return; }
    region.segments.forEach((segment, index) => {
      const card = document.createElement('div');
      card.className = `segment-chip ${segment.id === state.selectedSegmentId ? 'selected' : ''} ${segment.patch?.image ? 'ready' : ''}`;
      const choose = document.createElement('button');
      choose.type = 'button'; choose.className = 'segment-select';
      choose.innerHTML = `<strong>${visemeLabel(segment.viseme)}</strong><small>${segment.frames} fr</small>`;
      choose.onclick = () => { state.selectedSegmentId = segment.id; renderSegments(); renderPatchControls(); renderDonors(); drawTimeline(); drawViewer(); };
      const adjust = document.createElement('span'); adjust.className = 'segment-adjust';
      const minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '−'; minus.title = 'Reduce frames'; minus.onclick = () => adjustSegmentFrames(index, -1);
      const plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+'; plus.title = 'Add frames'; plus.onclick = () => adjustSegmentFrames(index, 1);
      adjust.append(minus, plus); card.append(choose, adjust); strip.appendChild(card);
    });
  }
  function renderSelectedRegion() {
    const region = selectedRegion(), hasRegion = !!region;
    $('selectedRegionPanel').classList.toggle('disabled', !hasRegion);
    $('noRegionMessage').hidden = hasRegion; $('regionFields').hidden = !hasRegion;
    $('deleteRegionBtn').disabled = !hasRegion; $('loopBtn').disabled = !hasRegion;
    if (!hasRegion) {
      $('phraseSummary').textContent = 'Type a phrase in a selected repair region.';
      renderSegments(); renderPatchControls(); renderGuideChoices(); return;
    }
    $('regionStart').textContent = fmt(region.start); $('regionEnd').textContent = fmt(region.end); $('regionFrames').textContent = totalFrames(region);
    $('phraseInput').value = region.phrase; $('loopBtn').textContent = `Loop: ${state.loop ? 'On' : 'Off'}`;
    $('phraseSummary').textContent = region.phrase ? `${region.phrase} · ${totalFrames(region)} frames to replace` : 'Type the correct word or short phrase.';
    renderSegments(); renderPatchControls(); renderGuideChoices();
  }
  function renderPatchControls() {
    const segment = selectedSegment(), patch = segment?.patch, hasPatch = !!patch?.image;
    $('captureBtn').disabled = state.modelMode ? !state.duration : !segment;
    $('positionBtn').disabled = !hasPatch || state.modelMode;
    $('removePatchBtn').disabled = !hasPatch || state.modelMode;
    $('patchControls').hidden = !hasPatch || state.modelMode;
    $('modelInstruction').hidden = !state.modelMode;
    $('patchPanelTitle').textContent = state.modelMode ? 'Viseme Model Builder' : 'Donor / Patch Editor';
    $('patchPanelHelp').textContent = state.modelMode ? `${characterName()} / ${visemeLabel(state.modelViseme)} samples` : segment ? `Selected shape: ${visemeLabel(segment.viseme)}` : 'Choose a segment, then capture or apply a mouth.';
    if (!hasPatch || state.modelMode) return;
    const pixels = patchPixels(patch);
    $('patchX').value = Math.round(pixels.x); $('patchY').value = Math.round(pixels.y); $('patchScale').value = patch.scale;
    $('patchRotate').value = patch.rotation; $('patchSkewX').value = patch.skewX; $('patchSkewY').value = patch.skewY;
    $('patchWidth').value = patch.widthScale; $('patchHeight').value = patch.heightScale; $('patchFeather').value = patch.feather;
    $('patchOpacity').value = patch.opacity; $('patchBrightness').value = patch.brightness; $('patchContrast').value = patch.contrast;
    $('patchSaturation').value = patch.saturation; $('patchWarmth').value = patch.warmth; $('showPatch').checked = patch.visible;
    $('featherOutput').textContent = `${patch.feather} px`; $('opacityOutput').textContent = `${patch.opacity}%`; $('warmthOutput').textContent = patch.warmth;
    $('donorTime').textContent = patch.sourceLabel;
  }

  function selectRegion(id, seekToStart) {
    state.selectedRegionId = id; state.loop = false; state.modelMode = false;
    $('modelModeBtn').textContent = 'Build Model'; $('modelModeBtn').classList.remove('primary');
    const region = selectedRegion();
    if (region?.segments.length && !region.segments.some(segment => segment.id === state.selectedSegmentId)) state.selectedSegmentId = region.segments[0].id;
    if (region && seekToStart) seek(region.start);
    setMode('repair'); renderRegions(); renderSelectedRegion(); renderDonors(); drawTimeline(); drawViewer();
  }
  function markStart() {
    if (!state.duration) return;
    video.pause(); state.pendingStart = Number(video.currentTime.toFixed(4)); $('pendingStartText').textContent = fmt(state.pendingStart); drawTimeline();
    toast('Start marked. Move to the end and press End Mark.');
  }
  function markEnd() {
    if (!state.duration) return;
    if (state.pendingStart === null) { toast('Set a Start Mark first.'); return; }
    video.pause();
    const end = Number(video.currentTime.toFixed(4));
    if (Math.abs(end - state.pendingStart) < 1 / state.fps) { toast('The repair range needs to cover at least one frame.'); return; }
    const region = { id: newId('region'), start: Math.min(state.pendingStart, end), end: Math.max(state.pendingStart, end), phrase: '', segments: [] };
    state.regions.push(region); state.regions.sort((a, b) => a.start - b.start); state.pendingStart = null; $('pendingStartText').textContent = 'None'; state.selectedSegmentId = '';
    selectRegion(region.id, false); $('phraseInput').focus(); toast('Repair region created. Type the correct phrase.');
  }
  function deleteRegion() {
    if (!state.selectedRegionId) return;
    state.regions = state.regions.filter(region => region.id !== state.selectedRegionId);
    state.selectedRegionId = state.regions[0]?.id || ''; state.selectedSegmentId = state.regions[0]?.segments[0]?.id || ''; state.loop = false;
    setMode('repair'); renderRegions(); renderSelectedRegion(); drawTimeline(); drawViewer(); toast('Repair region deleted.');
  }
  function updatePhrase(value) {
    const region = selectedRegion(); if (!region) return;
    region.phrase = value; rebuildSegments(region); renderRegions(); renderSelectedRegion(); renderDonors(); drawTimeline(); drawViewer();
  }
  function updateFps(value) {
    state.fps = Number(value) || 30; state.regions.forEach(rebuildSegments);
    $('frameText').textContent = Math.round((video.currentTime || 0) * state.fps); renderRegions(); renderSelectedRegion(); drawTimeline();
  }

  function normalBox(a, b) { return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }; }
  function point(event) {
    const rect = viewer.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width * viewer.width, y: (event.clientY - rect.top) / rect.height * viewer.height };
  }
  function pointInsideVideo(pointValue) {
    const rect = state.videoRect;
    return { x: clamp(pointValue.x, rect.x, rect.x + rect.w), y: clamp(pointValue.y, rect.y, rect.y + rect.h) };
  }
  function setMode(mode) {
    state.mode = mode; state.captureBox = null;
    $('modeText').textContent = state.modelMode ? 'Build Model' : mode === 'capture' ? 'Capture' : mode === 'position' ? 'Position' : 'Repair';
    if (mode === 'capture') status(state.modelMode ? 'Drag around a mouth sample to add it to this character model.' : 'Drag around a donor mouth for the selected viseme segment.');
    if (mode === 'position') status('Drag the mouth patch into place, then adjust its transform and lighting.');
    drawViewer();
  }
  function createPatch(image, dataUrl, sourceWidth, sourceHeight, normalWidth, normalHeight, sourceLabel) {
    return { image, dataUrl, sourceW: sourceWidth, sourceH: sourceHeight, nx: .5, ny: .52, nw: normalWidth, nh: normalHeight, scale: 100, rotation: 0, skewX: 0, skewY: 0, widthScale: 100, heightScale: 100, feather: 5, opacity: 100, brightness: 100, contrast: 100, saturation: 100, warmth: 0, visible: true, sourceLabel };
  }
  function captureSelection(bounds) {
    const rect = state.videoRect;
    if (bounds.w < 8 || bounds.h < 8) { toast('Drag a larger mouth selection.'); return; }
    const crop = document.createElement('canvas'); crop.width = Math.round(bounds.w); crop.height = Math.round(bounds.h);
    crop.getContext('2d').drawImage(sourceCanvas, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, crop.width, crop.height);
    const dataUrl = crop.toDataURL('image/png');
    const normalWidth = bounds.w / rect.w, normalHeight = bounds.h / rect.h;
    if (state.modelMode) {
      const name = characterName(); state.libraries[name] ||= {}; state.libraries[name][state.modelViseme] ||= [];
      state.libraries[name][state.modelViseme].push({ dataUrl, sourceW: crop.width, sourceH: crop.height, normalWidth, normalHeight, label: `${name} / ${visemeLabel(state.modelViseme)} / ${fmt(video.currentTime)}` });
      saveLibraries(); renderDonors(); setMode('repair'); toast(`Saved ${visemeLabel(state.modelViseme)} sample for ${name}.`); return;
    }
    const segment = selectedSegment();
    if (!segment) { toast('Select a viseme segment first.'); return; }
    const image = new Image(); image.onload = drawViewer; image.src = dataUrl;
    segment.patch = createPatch(image, dataUrl, crop.width, crop.height, normalWidth, normalHeight, `Video ${fmt(video.currentTime)}`);
    segment.patch.nx = (bounds.x + bounds.w / 2 - rect.x) / rect.w; segment.patch.ny = (bounds.y + bounds.h / 2 - rect.y) / rect.h;
    setMode('position'); renderSegments(); renderRegions(); renderPatchControls(); drawViewer(); toast('Mouth captured for selected viseme segment.');
  }
  function applyLibrarySample(sample) {
    const segment = selectedSegment(); if (!segment || state.modelMode) return;
    const image = new Image(); image.onload = drawViewer; image.src = sample.dataUrl;
    segment.patch = createPatch(image, sample.dataUrl, sample.sourceW, sample.sourceH, sample.normalWidth, sample.normalHeight, sample.label);
    setMode('position'); renderSegments(); renderRegions(); renderPatchControls(); drawViewer(); toast('Character-library mouth applied to this segment.');
  }
  function updatePatch() {
    const patch = selectedSegment()?.patch; if (!patch?.image) return;
    const rect = state.videoRect;
    patch.nx = ((Number($('patchX').value) || 0) - rect.x) / rect.w; patch.ny = ((Number($('patchY').value) || 0) - rect.y) / rect.h;
    patch.scale = Number($('patchScale').value) || 100; patch.rotation = Number($('patchRotate').value) || 0;
    patch.skewX = Number($('patchSkewX').value) || 0; patch.skewY = Number($('patchSkewY').value) || 0;
    patch.widthScale = Number($('patchWidth').value) || 100; patch.heightScale = Number($('patchHeight').value) || 100;
    patch.feather = Number($('patchFeather').value) || 0; patch.opacity = Number($('patchOpacity').value) || 0;
    patch.brightness = Number($('patchBrightness').value) || 100; patch.contrast = Number($('patchContrast').value) || 100;
    patch.saturation = Number($('patchSaturation').value) || 100; patch.warmth = Number($('patchWarmth').value) || 0; patch.visible = $('showPatch').checked;
    renderPatchControls(); drawViewer();
  }
  function removePatch() {
    const segment = selectedSegment(); if (!segment) return;
    segment.patch = null; setMode('repair'); renderSegments(); renderRegions(); renderPatchControls(); drawViewer(); toast('Patch removed from selected segment.');
  }

  function loadVideo(file) {
    if (!file || !file.type.startsWith('video/')) { if (file) toast('Drop a video file here.'); return; }
    if (state.url) URL.revokeObjectURL(state.url);
    video.pause(); state.url = URL.createObjectURL(file); state.duration = 0; state.pendingStart = null; state.regions = []; state.selectedRegionId = ''; state.selectedSegmentId = ''; state.loop = false; state.modelMode = false; state.thumbView = 'video'; state.thumbs = []; state.selectedThumb = -1;
    $('videoName').textContent = file.name; $('pendingStartText').textContent = 'None'; $('dropOverlay').classList.add('hidden'); $('modelModeBtn').textContent = 'Build Model'; $('modelModeBtn').classList.remove('primary');
    video.src = state.url; video.load(); renderRegions(); renderSelectedRegion(); status('Loading video…');
  }
  function clearVideo() {
    video.pause(); if (state.url) URL.revokeObjectURL(state.url);
    Object.assign(state, { url: '', duration: 0, pendingStart: null, regions: [], selectedRegionId: '', selectedSegmentId: '', mode: 'repair', loop: false, modelMode: false, thumbView: 'video', thumbs: [], selectedThumb: -1, buildingThumbs: false, pointer: null, captureBox: null });
    video.removeAttribute('src'); video.load(); $('videoName').textContent = 'No video loaded'; $('resolutionText').textContent = '-- × --'; $('aspectText').textContent = '--'; $('durationText').textContent = '--:--.---'; $('currentTime').textContent = '00:00.000'; $('totalTime').textContent = '00:00.000'; $('frameText').textContent = '0'; $('pendingStartText').textContent = 'None'; $('dropOverlay').classList.remove('hidden'); $('modelModeBtn').textContent = 'Build Model'; $('modelModeBtn').classList.remove('primary');
    ['removeVideoBtn','prevFrameBtn','playBtn','nextFrameBtn','startMarkBtn','endMarkBtn','startMarkMainBtn','endMarkMainBtn','refreshDonorsBtn','modelModeBtn'].forEach(id => { $(id).disabled = true; });
    switchThumbView('video'); renderRegions(); renderSelectedRegion(); drawViewer(); drawTimeline(); status('Drop a video into the player to begin.');
  }
  function seek(time) { if (state.duration) video.currentTime = clamp(time, 0, Math.max(0, state.duration - .001)); }
  function seekAsync(time) {
    return new Promise(resolve => { const target = clamp(time, 0, Math.max(0, state.duration - .001)); if (Math.abs(video.currentTime - target) < .001) { resolve(); return; } video.addEventListener('seeked', resolve, { once: true }); video.currentTime = target; });
  }
  async function buildDonors() {
    if (!state.duration || state.buildingThumbs) return;
    state.buildingThumbs = true; video.pause(); const savedTime = video.currentTime; const count = clamp(Math.ceil(state.duration / 1.25), 10, 20);
    $('donorStrip').innerHTML = '<p class="empty">Finding donor frames…</p>'; state.thumbs = [];
    for (let index = 0; index < count; index += 1) {
      const time = index / (count - 1) * Math.max(0, state.duration - .01);
      await seekAsync(time); drawRawFrame(thumbCtx, thumbCanvas.width, thumbCanvas.height, false);
      state.thumbs.push({ time, dataUrl: thumbCanvas.toDataURL('image/jpeg', .82) });
    }
    await seekAsync(savedTime); state.buildingThumbs = false; renderDonors(); drawViewer(); status('Create a repair region with Start Mark and End Mark.');
  }
  function renderDonors() {
    const strip = $('donorStrip'); strip.innerHTML = '';
    if (state.thumbView === 'library') {
      const key = state.modelMode ? state.modelViseme : selectedSegment()?.viseme || state.modelViseme;
      const samples = state.libraries[characterName()]?.[key] || [];
      if (!samples.length) { strip.innerHTML = `<p class="empty">No saved ${characterName()} / ${visemeLabel(key)} samples yet.</p>`; return; }
      samples.forEach(sample => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'library-thumb';
        button.innerHTML = `<img src="${sample.dataUrl}" alt=""><span>${visemeLabel(key)}</span>`;
        if (!state.modelMode) button.onclick = () => applyLibrarySample(sample);
        strip.appendChild(button);
      });
      return;
    }
    if (!state.thumbs.length) { strip.innerHTML = '<p class="empty">Donor frames appear after a video is loaded.</p>'; return; }
    state.thumbs.forEach((thumb, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `donor-thumb ${index === state.selectedThumb ? 'selected' : ''}`;
      button.innerHTML = `<img src="${thumb.dataUrl}" alt=""><span>${fmt(thumb.time)}</span>`;
      button.onclick = () => { state.selectedThumb = index; video.pause(); seek(thumb.time); renderDonors(); status(state.modelMode ? 'Choose a viseme slot, then capture this mouth sample.' : 'Donor frame selected. Click Capture Mouth.'); };
      strip.appendChild(button);
    });
  }
  function switchThumbView(view) {
    state.thumbView = view; $('thisVideoTab').classList.toggle('active', view === 'video'); $('libraryTab').classList.toggle('active', view === 'library'); renderDonors();
  }
  function toggleModelMode() {
    if (!state.duration) return;
    state.modelMode = !state.modelMode; state.loop = false; setMode('repair');
    $('modelModeBtn').textContent = state.modelMode ? 'Back to Repair' : 'Build Model'; $('modelModeBtn').classList.toggle('primary', state.modelMode);
    $('modelStatus').textContent = state.modelMode ? `Building samples for ${characterName()}. Choose a mouth shape on the right.` : 'Capture reusable mouth samples by character and viseme as you work.';
    switchThumbView(state.modelMode ? 'video' : state.thumbView); renderSelectedRegion(); renderGuideChoices(); renderPatchControls();
  }
  function updatePlayback() {
    $('currentTime').textContent = fmt(video.currentTime); $('frameText').textContent = String(Math.round(video.currentTime * state.fps));
    const region = selectedRegion(); if (state.loop && region && video.currentTime >= region.end) seek(region.start);
    drawViewer(); drawTimeline();
  }
  function animate() { if (video.paused || video.ended) { state.raf = 0; return; } updatePlayback(); state.raf = requestAnimationFrame(animate); }

  $('fileInput').onchange = event => { loadVideo(event.target.files?.[0]); event.target.value = ''; };
  $('dropOverlay').onclick = () => $('fileInput').click(); $('removeVideoBtn').onclick = clearVideo; $('workingFps').onchange = event => updateFps(event.target.value); $('modelModeBtn').onclick = toggleModelMode;
  $('characterName').oninput = () => { renderDonors(); renderPatchControls(); };
  dropZone.ondragover = event => { event.preventDefault(); dropZone.classList.add('drag-over'); };
  dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
  dropZone.ondrop = event => { event.preventDefault(); dropZone.classList.remove('drag-over'); loadVideo(event.dataTransfer.files?.[0]); };
  video.onloadedmetadata = () => {
    state.duration = video.duration || 0; $('resolutionText').textContent = `${video.videoWidth} × ${video.videoHeight}`; $('aspectText').textContent = aspectLabel(video.videoWidth, video.videoHeight); $('durationText').textContent = fmt(state.duration); $('totalTime').textContent = fmt(state.duration);
    ['removeVideoBtn','prevFrameBtn','playBtn','nextFrameBtn','startMarkBtn','endMarkBtn','startMarkMainBtn','endMarkMainBtn','refreshDonorsBtn','modelModeBtn'].forEach(id => { $(id).disabled = false; });
    resizeCanvases(); status('Create a repair region with Start Mark and End Mark.'); buildDonors();
  };
  video.onseeked = updatePlayback;
  video.onplay = () => { $('playBtn').textContent = '❚❚'; if (!state.raf) state.raf = requestAnimationFrame(animate); };
  video.onpause = () => { $('playBtn').textContent = '▶'; updatePlayback(); };
  $('playBtn').onclick = () => video.paused ? video.play() : video.pause();
  $('prevFrameBtn').onclick = () => { video.pause(); seek(video.currentTime - 1 / state.fps); };
  $('nextFrameBtn').onclick = () => { video.pause(); seek(video.currentTime + 1 / state.fps); };
  $('startMarkBtn').onclick = markStart; $('startMarkMainBtn').onclick = markStart; $('endMarkBtn').onclick = markEnd; $('endMarkMainBtn').onclick = markEnd; $('deleteRegionBtn').onclick = deleteRegion;
  $('phraseInput').oninput = event => updatePhrase(event.target.value);
  $('loopBtn').onclick = () => { const region = selectedRegion(); if (!region) return; state.loop = !state.loop; $('loopBtn').textContent = `Loop: ${state.loop ? 'On' : 'Off'}`; if (state.loop) { seek(region.start); video.play(); } };
  $('refreshDonorsBtn').onclick = buildDonors; $('thisVideoTab').onclick = () => switchThumbView('video'); $('libraryTab').onclick = () => switchThumbView('library');
  $('captureBtn').onclick = () => { video.pause(); setMode('capture'); }; $('positionBtn').onclick = () => { video.pause(); setMode('position'); }; $('removePatchBtn').onclick = removePatch;
  ['patchX','patchY','patchScale','patchRotate','patchSkewX','patchSkewY','patchWidth','patchHeight','patchFeather','patchOpacity','patchBrightness','patchContrast','patchSaturation','patchWarmth','showPatch'].forEach(id => { $(id).oninput = updatePatch; });
  viewer.onpointerdown = event => {
    const p = pointInsideVideo(point(event)); const segment = selectedSegment();
    if (state.mode === 'capture') { state.pointer = { type: 'capture' }; state.captureBox = { a: p, b: p }; viewer.setPointerCapture(event.pointerId); }
    if (state.mode === 'position' && segment?.patch?.image) { const pixels = patchPixels(segment.patch); state.pointer = { type: 'position', dx: p.x - pixels.x, dy: p.y - pixels.y }; viewer.setPointerCapture(event.pointerId); }
  };
  viewer.onpointermove = event => {
    if (!state.pointer) return;
    const p = pointInsideVideo(point(event)); const patch = selectedSegment()?.patch;
    if (state.pointer.type === 'capture') state.captureBox.b = p;
    if (state.pointer.type === 'position' && patch?.image) { const rect = state.videoRect; patch.nx = (p.x - state.pointer.dx - rect.x) / rect.w; patch.ny = (p.y - state.pointer.dy - rect.y) / rect.h; renderPatchControls(); }
    drawViewer();
  };
  viewer.onpointerup = event => {
    if (!state.pointer) return;
    if (state.pointer.type === 'capture' && state.captureBox) captureSelection(normalBox(state.captureBox.a, state.captureBox.b));
    state.pointer = null; state.captureBox = null; try { viewer.releasePointerCapture(event.pointerId); } catch (_) { /* none */ } drawViewer();
  };
  timeline.onclick = event => {
    if (!state.duration) return;
    const rect = timeline.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width * timeline.width;
    const hit = state.regions.find(region => x >= xFor(region.start) - 10 && x <= xFor(region.end) + 10);
    if (hit) { selectRegion(hit.id, false); return; }
    video.pause(); seek(clamp((x - 32) / (timeline.width - 64), 0, 1) * state.duration);
  };
  window.onresize = () => { resizeCanvases(); renderPatchControls(); };

  renderGuideChoices(); clearVideo(); resizeCanvases();
})();
