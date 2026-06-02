(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const video = $('sourceVideo');
  const viewer = $('videoCanvas');
  const vctx = viewer.getContext('2d');
  const timeline = $('timelineCanvas');
  const tctx = timeline.getContext('2d');
  const dropZone = $('dropZone');
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = viewer.width;
  sourceCanvas.height = viewer.height;
  const sctx = sourceCanvas.getContext('2d');

  const state = {
    url: '', fileName: '', duration: 0, fps: 30, markers: [], selectedId: '',
    mode: 'preview', loop: false, thumbnails: [], selectedThumb: -1,
    pointer: null, captureBox: null, sampling: false, raf: 0
  };
  let toastTimer = 0;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const currentMarker = () => state.markers.find((m) => m.id === state.selectedId) || null;
  const formatTime = (time) => {
    if (!Number.isFinite(time)) return '--:--.---';
    const value = Math.max(0, time);
    const minutes = Math.floor(value / 60);
    return `${String(minutes).padStart(2, '0')}:${(value % 60).toFixed(3).padStart(6, '0')}`;
  };

  function toast(text) {
    const node = $('toast');
    node.textContent = text;
    node.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('visible'), 2500);
  }

  function setStatus(text) { $('statusText').textContent = text; }

  function newPatch() {
    return { image: null, dataUrl: '', w: 0, h: 0, x: viewer.width / 2, y: viewer.height / 2, scale: 100, rotation: 0, feather: 5, opacity: 100, visible: true, donorTime: null };
  }

  function markerRange(marker) {
    const half = (marker.span || 0.8) / 2;
    return { start: clamp(marker.time - half, 0, state.duration), end: clamp(marker.time + half, 0, state.duration) };
  }

  function setMode(mode) {
    const marker = currentMarker();
    if (mode === 'place' && !(marker && marker.patch && marker.patch.image)) return;
    state.mode = mode;
    state.captureBox = null;
    $('modeText').textContent = mode === 'capture' ? 'Capture mouth' : mode === 'place' ? 'Position patch' : 'Preview';
    if (mode === 'capture') setStatus('Drag around a good mouth shape in the viewer.');
    if (mode === 'place') setStatus('Drag the mouth patch into place over the faulty word.');
    renderViewer();
  }

  function loadVideo(file) {
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast('That file is not a video.'); return; }
    if (state.url) URL.revokeObjectURL(state.url);
    video.pause();
    state.url = URL.createObjectURL(file);
    state.fileName = file.name;
    state.duration = 0;
    state.markers = [];
    state.selectedId = '';
    state.thumbnails = [];
    state.selectedThumb = -1;
    state.loop = false;
    state.mode = 'preview';
    video.src = state.url;
    video.load();
    $('videoName').textContent = file.name;
    $('dropOverlay').classList.add('hidden');
    setStatus('Loading video…');
    renderMarkerList();
    renderSelectedPanel();
  }

  function removeVideo() {
    video.pause();
    if (state.url) URL.revokeObjectURL(state.url);
    state.url = '';
    state.fileName = '';
    state.duration = 0;
    state.markers = [];
    state.selectedId = '';
    state.thumbnails = [];
    state.selectedThumb = -1;
    state.loop = false;
    state.mode = 'preview';
    video.removeAttribute('src');
    video.load();
    $('videoName').textContent = 'No video loaded';
    $('durationText').textContent = '--:--.---';
    $('totalTimeText').textContent = '00:00.000';
    $('currentTimeText').textContent = '00:00.000';
    $('dropOverlay').classList.remove('hidden');
    $('donorStrip').innerHTML = '<p class="empty">Donor frames appear after a video is loaded.</p>';
    ['playBtn', 'backFrameBtn', 'forwardFrameBtn', 'markWordBtn', 'markWordMainBtn', 'refreshDonorsBtn', 'removeVideoBtn'].forEach((id) => { $(id).disabled = true; });
    renderMarkerList();
    renderSelectedPanel();
    renderViewer();
    renderTimeline();
    setStatus('Drop a video into the player to begin.');
  }

  function drawVideoFrame(targetCtx, width, height) {
    targetCtx.clearRect(0, 0, width, height);
    targetCtx.fillStyle = '#030407';
    targetCtx.fillRect(0, 0, width, height);
    if (!video.videoWidth) return;
    const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
    const drawW = video.videoWidth * scale;
    const drawH = video.videoHeight * scale;
    targetCtx.drawImage(video, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
  }

  function createFeatheredPatch(patch) {
    if (!patch.image) return null;
    const canvas = document.createElement('canvas');
    const mask = document.createElement('canvas');
    canvas.width = mask.width = patch.w;
    canvas.height = mask.height = patch.h;
    const context = canvas.getContext('2d');
    const maskCtx = mask.getContext('2d');
    context.drawImage(patch.image, 0, 0, patch.w, patch.h);
    const feather = clamp(patch.feather || 0, 0, Math.min(patch.w, patch.h) / 2);
    const inset = Math.max(1, feather + 1);
    maskCtx.filter = feather > 0 ? `blur(${feather}px)` : 'none';
    maskCtx.fillStyle = '#fff';
    maskCtx.beginPath();
    maskCtx.ellipse(patch.w / 2, patch.h / 2, Math.max(1, patch.w / 2 - inset), Math.max(1, patch.h / 2 - inset), 0, 0, Math.PI * 2);
    maskCtx.fill();
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0);
    return canvas;
  }

  function renderPatch(marker) {
    const patch = marker.patch;
    if (!patch || !patch.image || !patch.visible) return;
    const range = markerRange(marker);
    if (video.currentTime < range.start || video.currentTime > range.end) return;
    const feathered = createFeatheredPatch(patch);
    if (!feathered) return;
    const scale = patch.scale / 100;
    vctx.save();
    vctx.translate(patch.x, patch.y);
    vctx.rotate(patch.rotation * Math.PI / 180);
    vctx.scale(scale, scale);
    vctx.globalAlpha = patch.opacity / 100;
    vctx.drawImage(feathered, -patch.w / 2, -patch.h / 2);
    if (state.mode === 'place') {
      vctx.globalAlpha = 1;
      vctx.strokeStyle = '#ff9d18';
      vctx.lineWidth = 2 / scale;
      vctx.setLineDash([9 / scale, 6 / scale]);
      vctx.strokeRect(-patch.w / 2, -patch.h / 2, patch.w, patch.h);
    }
    vctx.restore();
  }

  function normalizedBox(a, b) {
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
  }

  function renderViewer() {
    drawVideoFrame(sctx, sourceCanvas.width, sourceCanvas.height);
    vctx.clearRect(0, 0, viewer.width, viewer.height);
    vctx.drawImage(sourceCanvas, 0, 0);
    const marker = currentMarker();
    if (marker) renderPatch(marker);
    if (state.mode === 'capture' && state.captureBox) {
      const box = normalizedBox(state.captureBox.a, state.captureBox.b);
      vctx.save();
      vctx.fillStyle = 'rgba(255,157,24,.12)';
      vctx.strokeStyle = '#ff9d18';
      vctx.lineWidth = 3;
      vctx.setLineDash([10, 6]);
      vctx.fillRect(box.x, box.y, box.w, box.h);
      vctx.strokeRect(box.x, box.y, box.w, box.h);
      vctx.restore();
    }
  }

  function resizeTimelineCanvas() {
    const rect = timeline.getBoundingClientRect();
    const dpi = window.devicePixelRatio || 1;
    timeline.width = Math.max(620, Math.round(rect.width * dpi));
    timeline.height = Math.max(80, Math.round(rect.height * dpi));
    renderTimeline();
  }

  function timeToX(time) {
    return 34 + ((timeline.width - 68) * (time / state.duration));
  }

  function renderTimeline() {
    const w = timeline.width;
    const h = timeline.height;
    tctx.clearRect(0, 0, w, h);
    tctx.fillStyle = '#0d0e13';
    tctx.fillRect(0, 0, w, h);
    if (!state.duration) {
      tctx.fillStyle = '#797682';
      tctx.font = `${Math.max(12, h * 0.14)}px sans-serif`;
      tctx.fillText('Load a video to place word markers.', 20, h / 2);
      return;
    }
    const baseline = h * 0.60;
    tctx.lineCap = 'round';
    tctx.strokeStyle = 'rgba(154,112,245,.45)';
    tctx.lineWidth = Math.max(5, h * 0.065);
    tctx.beginPath();
    tctx.moveTo(34, baseline);
    tctx.lineTo(w - 34, baseline);
    tctx.stroke();
    tctx.lineCap = 'butt';
    const ticks = 8;
    for (let i = 0; i <= ticks; i += 1) {
      const value = (i / ticks) * state.duration;
      const x = timeToX(value);
      tctx.strokeStyle = 'rgba(255,255,255,.16)';
      tctx.lineWidth = 1;
      tctx.beginPath();
      tctx.moveTo(x, baseline - h * 0.1);
      tctx.lineTo(x, baseline + h * 0.12);
      tctx.stroke();
      tctx.fillStyle = '#928d9a';
      tctx.font = `${Math.max(10, h * 0.09)}px sans-serif`;
      tctx.textAlign = 'center';
      tctx.fillText(formatTime(value), x, baseline + h * 0.28);
    }
    state.markers.forEach((marker, index) => {
      const selected = marker.id === state.selectedId;
      const x = timeToX(marker.time);
      const radius = Math.max(8, h * 0.086);
      const pinY = baseline - h * 0.25;
      tctx.strokeStyle = selected ? '#ffdc9f' : '#ddcfff';
      tctx.fillStyle = selected ? '#ff9d18' : '#9a70f5';
      tctx.lineWidth = Math.max(1.5, h * 0.015);
      tctx.beginPath();
      tctx.moveTo(x, pinY + radius);
      tctx.lineTo(x, baseline - 3);
      tctx.stroke();
      tctx.beginPath();
      tctx.arc(x, pinY, radius, 0, Math.PI * 2);
      tctx.fill();
      tctx.stroke();
      tctx.fillStyle = '#fff';
      tctx.font = `bold ${Math.max(10, h * 0.092)}px sans-serif`;
      tctx.textAlign = 'center';
      tctx.textBaseline = 'middle';
      tctx.fillText(String(index + 1), x, pinY);
    });
    const cursorX = timeToX(video.currentTime || 0);
    tctx.strokeStyle = '#f9f7ef';
    tctx.lineWidth = Math.max(1.5, h * 0.014);
    tctx.beginPath();
    tctx.moveTo(cursorX, h * 0.09);
    tctx.lineTo(cursorX, h * 0.85);
    tctx.stroke();
    tctx.textAlign = 'left';
    tctx.textBaseline = 'alphabetic';
  }

  function renderMarkerList() {
    const list = $('markerList');
    list.innerHTML = '';
    if (!state.markers.length) {
      list.innerHTML = '<p class="empty">No marked words.</p>';
      return;
    }
    state.markers.forEach((marker, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `marker-card ${marker.id === state.selectedId ? 'selected' : ''}`;
      const top = document.createElement('span');
      top.className = 'marker-card-time';
      top.innerHTML = `<span>PIN ${String(index + 1).padStart(2, '0')}</span><span>${formatTime(marker.time)}</span>`;
      const phrase = document.createElement('strong');
      phrase.textContent = marker.phrase || 'Enter words…';
      const status = document.createElement('small');
      status.textContent = marker.patch && marker.patch.image ? 'Mouth patch captured' : 'Needs donor mouth';
      button.append(top, phrase, status);
      button.addEventListener('click', () => selectMarker(marker.id, true));
      list.appendChild(button);
    });
  }

  function fillPatchControls(patch) {
    $('patchX').value = Math.round(patch.x);
    $('patchY').value = Math.round(patch.y);
    $('patchScale').value = patch.scale;
    $('patchRotation').value = patch.rotation;
    $('patchFeather').value = patch.feather;
    $('patchOpacity').value = patch.opacity;
    $('showPatch').checked = patch.visible;
    $('patchScaleOut').textContent = `${patch.scale}%`;
    $('patchRotationOut').textContent = `${patch.rotation}°`;
    $('patchFeatherOut').textContent = `${patch.feather} px`;
    $('patchOpacityOut').textContent = `${patch.opacity}%`;
    $('donorTime').textContent = formatTime(patch.donorTime);
  }

  function renderSelectedPanel() {
    const marker = currentMarker();
    const hasMarker = !!marker;
    $('selectionPanel').classList.toggle('is-disabled', !hasMarker);
    $('noMarkerText').hidden = hasMarker;
    $('markerFields').hidden = !hasMarker;
    $('deleteMarkerBtn').disabled = !hasMarker;
    if (!hasMarker) {
      $('selectedPhrase').textContent = 'No marker selected';
      setMode('preview');
      return;
    }
    $('markerTime').textContent = formatTime(marker.time);
    $('phraseInput').value = marker.phrase || '';
    $('selectedPhrase').textContent = marker.phrase || 'Enter words for selected pin';
    $('repairSpan').value = marker.span;
    $('repairSpanOut').textContent = `${marker.span.toFixed(2)} s`;
    $('loopBtn').textContent = `Loop This Pin: ${state.loop ? 'On' : 'Off'}`;
    const hasPatch = !!(marker.patch && marker.patch.image);
    $('positionBtn').disabled = !hasPatch;
    $('clearPatchBtn').disabled = !hasPatch;
    $('patchControls').hidden = !hasPatch;
    $('patchPrompt').textContent = hasPatch ? 'Patch is active over this pin range. Move or refine it below.' : 'Choose a donor frame below, then capture the mouth from the viewer.';
    if (hasPatch) fillPatchControls(marker.patch);
  }

  function selectMarker(id, seek) {
    state.selectedId = id;
    state.loop = false;
    const marker = currentMarker();
    setMode('preview');
    if (marker && seek) video.currentTime = marker.time;
    renderMarkerList();
    renderSelectedPanel();
    renderTimeline();
    renderViewer();
  }

  function addMarker() {
    if (!state.duration) return;
    video.pause();
    const marker = { id: `pin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, time: Number(video.currentTime.toFixed(4)), phrase: '', span: 0.8, patch: newPatch() };
    state.markers.push(marker);
    state.markers.sort((a, b) => a.time - b.time);
    selectMarker(marker.id, false);
    $('phraseInput').focus();
    toast('Pin added. Type the word or short phrase.');
  }

  function deleteMarker() {
    if (!state.selectedId) return;
    state.markers = state.markers.filter((m) => m.id !== state.selectedId);
    state.selectedId = state.markers[0]?.id || '';
    state.loop = false;
    setMode('preview');
    renderMarkerList();
    renderSelectedPanel();
    renderTimeline();
    renderViewer();
    toast('Pin removed.');
  }

  function updatePatchFromControls() {
    const marker = currentMarker();
    if (!(marker && marker.patch && marker.patch.image)) return;
    marker.patch.x = Number($('patchX').value) || 0;
    marker.patch.y = Number($('patchY').value) || 0;
    marker.patch.scale = Number($('patchScale').value);
    marker.patch.rotation = Number($('patchRotation').value);
    marker.patch.feather = Number($('patchFeather').value);
    marker.patch.opacity = Number($('patchOpacity').value);
    marker.patch.visible = $('showPatch').checked;
    fillPatchControls(marker.patch);
    renderViewer();
  }

  function clearPatch() {
    const marker = currentMarker();
    if (!marker) return;
    marker.patch = newPatch();
    setMode('preview');
    renderMarkerList();
    renderSelectedPanel();
    renderViewer();
    toast('Mouth patch removed from pin.');
  }

  function pointInViewer(event) {
    const rect = viewer.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * viewer.width, y: ((event.clientY - rect.top) / rect.height) * viewer.height };
  }

  function capturePatch(box) {
    const marker = currentMarker();
    if (!marker || box.w < 10 || box.h < 10) { toast('Drag a larger mouth area.'); return; }
    const crop = document.createElement('canvas');
    crop.width = Math.round(box.w);
    crop.height = Math.round(box.h);
    crop.getContext('2d').drawImage(sourceCanvas, box.x, box.y, box.w, box.h, 0, 0, crop.width, crop.height);
    const image = new Image();
    image.onload = () => renderViewer();
    image.src = crop.toDataURL('image/png');
    marker.patch = {
      image, dataUrl: image.src, w: crop.width, h: crop.height,
      x: box.x + box.w / 2, y: box.y + box.h / 2,
      scale: 100, rotation: 0, feather: 5, opacity: 100, visible: true,
      donorTime: Number(video.currentTime.toFixed(4))
    };
    video.currentTime = marker.time;
    setMode('place');
    renderMarkerList();
    renderSelectedPanel();
    toast('Mouth captured. Drag it into place.');
  }

  function seekTo(time) {
    if (!state.duration) return;
    video.currentTime = clamp(time, 0, Math.max(0, state.duration - 0.001));
  }

  function seekPromise(time) {
    return new Promise((resolve) => {
      const target = clamp(time, 0, Math.max(0, state.duration - 0.001));
      if (Math.abs(video.currentTime - target) < 0.001) { resolve(); return; }
      video.addEventListener('seeked', resolve, { once: true });
      video.currentTime = target;
    });
  }

  async function buildDonors() {
    if (!state.duration || state.sampling) return;
    state.sampling = true;
    video.pause();
    const oldTime = video.currentTime;
    const count = clamp(Math.ceil(state.duration / 1.3), 9, 18);
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 260;
    thumbCanvas.height = 146;
    const thumbCtx = thumbCanvas.getContext('2d');
    $('donorStrip').innerHTML = '<p class="empty">Finding donor frames…</p>';
    state.thumbnails = [];
    for (let i = 0; i < count; i += 1) {
      const time = (i / (count - 1)) * Math.max(0, state.duration - 0.01);
      await seekPromise(time);
      drawVideoFrame(thumbCtx, thumbCanvas.width, thumbCanvas.height);
      state.thumbnails.push({ time, image: thumbCanvas.toDataURL('image/jpeg', 0.82) });
    }
    await seekPromise(oldTime);
    state.sampling = false;
    renderDonors();
    renderViewer();
    setStatus('Pause on a problem word and add a marker pin.');
  }

  function renderDonors() {
    const strip = $('donorStrip');
    strip.innerHTML = '';
    if (!state.thumbnails.length) { strip.innerHTML = '<p class="empty">Donor frames appear after a video is loaded.</p>'; return; }
    state.thumbnails.forEach((thumb, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `donor-thumb ${index === state.selectedThumb ? 'selected' : ''}`;
      const image = document.createElement('img');
      image.src = thumb.image;
      image.alt = '';
      const caption = document.createElement('span');
      caption.textContent = formatTime(thumb.time);
      button.append(image, caption);
      button.addEventListener('click', () => {
        state.selectedThumb = index;
        video.pause();
        seekTo(thumb.time);
        setMode('preview');
        renderDonors();
        setStatus('Donor frame selected. Now choose Capture Donor Mouth.');
      });
      strip.appendChild(button);
    });
  }

  function markerAtTimelineX(x) {
    if (!state.markers.length || !state.duration) return null;
    const tolerance = Math.max(14, timeline.height * 0.12);
    let best = null;
    let distance = Infinity;
    state.markers.forEach((marker) => {
      const delta = Math.abs(timeToX(marker.time) - x);
      if (delta < distance) { distance = delta; best = marker; }
    });
    return distance <= tolerance ? best : null;
  }

  function animate() {
    if (video.paused || video.ended) { state.raf = 0; return; }
    updatePlaybackView();
    state.raf = window.requestAnimationFrame(animate);
  }

  function updatePlaybackView() {
    $('currentTimeText').textContent = formatTime(video.currentTime);
    const marker = currentMarker();
    if (state.loop && marker) {
      const range = markerRange(marker);
      if (video.currentTime >= range.end) video.currentTime = range.start;
    }
    renderViewer();
    renderTimeline();
  }

  $('videoFile').addEventListener('change', (event) => {
    loadVideo(event.target.files?.[0]);
    event.target.value = '';
  });
  $('removeVideoBtn').addEventListener('click', removeVideo);
  $('dropOverlay').addEventListener('click', () => $('videoFile').click());
  dropZone.addEventListener('dragover', (event) => { event.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('drag-over');
    loadVideo(event.dataTransfer.files?.[0]);
  });
  video.addEventListener('loadedmetadata', () => {
    state.duration = video.duration || 0;
    $('durationText').textContent = formatTime(state.duration);
    $('totalTimeText').textContent = formatTime(state.duration);
    ['playBtn', 'backFrameBtn', 'forwardFrameBtn', 'markWordBtn', 'markWordMainBtn', 'refreshDonorsBtn', 'removeVideoBtn'].forEach((id) => { $(id).disabled = false; });
    renderViewer();
    resizeTimelineCanvas();
    setStatus('Pause on a problem word and add a marker pin.');
    buildDonors();
  });
  video.addEventListener('seeked', updatePlaybackView);
  video.addEventListener('play', () => {
    $('playBtn').textContent = '❚❚';
    if (!state.raf) state.raf = window.requestAnimationFrame(animate);
  });
  video.addEventListener('pause', () => {
    $('playBtn').textContent = '▶';
    updatePlaybackView();
  });
  $('playBtn').addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
  $('backFrameBtn').addEventListener('click', () => { video.pause(); seekTo(video.currentTime - (1 / state.fps)); });
  $('forwardFrameBtn').addEventListener('click', () => { video.pause(); seekTo(video.currentTime + (1 / state.fps)); });
  $('markWordBtn').addEventListener('click', addMarker);
  $('markWordMainBtn').addEventListener('click', addMarker);
  $('deleteMarkerBtn').addEventListener('click', deleteMarker);
  $('phraseInput').addEventListener('input', (event) => {
    const marker = currentMarker(); if (!marker) return;
    marker.phrase = event.target.value;
    $('selectedPhrase').textContent = marker.phrase || 'Enter words for selected pin';
    renderMarkerList();
  });
  $('repairSpan').addEventListener('input', (event) => {
    const marker = currentMarker(); if (!marker) return;
    marker.span = Number(event.target.value);
    $('repairSpanOut').textContent = `${marker.span.toFixed(2)} s`;
    renderViewer();
  });
  $('loopBtn').addEventListener('click', () => {
    const marker = currentMarker(); if (!marker) return;
    state.loop = !state.loop;
    $('loopBtn').textContent = `Loop This Pin: ${state.loop ? 'On' : 'Off'}`;
    if (state.loop) { seekTo(markerRange(marker).start); video.play(); }
  });
  $('captureBtn').addEventListener('click', () => { video.pause(); setMode('capture'); });
  $('positionBtn').addEventListener('click', () => { video.pause(); setMode('place'); });
  $('clearPatchBtn').addEventListener('click', clearPatch);
  ['patchX', 'patchY', 'patchScale', 'patchRotation', 'patchFeather', 'patchOpacity', 'showPatch'].forEach((id) => $(id).addEventListener('input', updatePatchFromControls));
  $('refreshDonorsBtn').addEventListener('click', buildDonors);
  viewer.addEventListener('pointerdown', (event) => {
    const marker = currentMarker(); if (!marker) return;
    const point = pointInViewer(event);
    if (state.mode === 'capture') { state.pointer = { type: 'capture' }; state.captureBox = { a: point, b: point }; viewer.setPointerCapture(event.pointerId); }
    if (state.mode === 'place' && marker.patch.image) { state.pointer = { type: 'place', dx: point.x - marker.patch.x, dy: point.y - marker.patch.y }; viewer.setPointerCapture(event.pointerId); }
  });
  viewer.addEventListener('pointermove', (event) => {
    if (!state.pointer) return;
    const point = pointInViewer(event);
    const marker = currentMarker();
    if (state.pointer.type === 'capture') state.captureBox.b = point;
    if (state.pointer.type === 'place' && marker && marker.patch.image) {
      marker.patch.x = point.x - state.pointer.dx;
      marker.patch.y = point.y - state.pointer.dy;
      fillPatchControls(marker.patch);
    }
    renderViewer();
  });
  viewer.addEventListener('pointerup', (event) => {
    if (!state.pointer) return;
    if (state.pointer.type === 'capture' && state.captureBox) capturePatch(normalizedBox(state.captureBox.a, state.captureBox.b));
    state.pointer = null;
    state.captureBox = null;
    try { viewer.releasePointerCapture(event.pointerId); } catch (_) { /* no capture */ }
    renderViewer();
  });
  timeline.addEventListener('click', (event) => {
    if (!state.duration) return;
    const rect = timeline.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * timeline.width;
    const marker = markerAtTimelineX(x);
    if (marker) { selectMarker(marker.id, true); return; }
    const ratio = clamp((x - 34) / (timeline.width - 68), 0, 1);
    video.pause();
    seekTo(ratio * state.duration);
  });
  window.addEventListener('resize', resizeTimelineCanvas);

  removeVideo();
})();
