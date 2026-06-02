(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const video = $('video');
  const canvas = $('videoCanvas');
  const ctx = canvas.getContext('2d');
  const timeline = $('timeline');
  const tctx = timeline.getContext('2d');
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = canvas.width; sourceCanvas.height = canvas.height;
  const sourceCtx = sourceCanvas.getContext('2d');
  const state = { url:'', duration:0, fps:30, markers:[], selectedId:'', mode:'preview', loop:false, thumbs:[], donorSelected:-1, dragging:null, capture:null, building:false, raf:0 };
  let toastTimer = 0;
  const clamp = (v,min,max) => Math.max(min, Math.min(max,v));
  const marker = () => state.markers.find(m => m.id === state.selectedId) || null;
  const fmt = sec => { if (!Number.isFinite(sec)) return '--:--.---'; const s=Math.max(0,sec); return `${String(Math.floor(s/60)).padStart(2,'0')}:${(s%60).toFixed(3).padStart(6,'0')}`; };
  function toast(text){ $('toast').textContent=text; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=> $('toast').classList.remove('visible'),2200); }
  function status(text){ $('statusText').textContent=text; }
  function range(m){ const half=(m.span || .8)/2; return { start:clamp(m.time-half,0,state.duration), end:clamp(m.time+half,0,state.duration) }; }
  function point(e){ const r=canvas.getBoundingClientRect(); return { x:(e.clientX-r.left)/r.width*canvas.width, y:(e.clientY-r.top)/r.height*canvas.height }; }
  function box(a,b){ return { x:Math.min(a.x,b.x), y:Math.min(a.y,b.y), w:Math.abs(a.x-b.x), h:Math.abs(a.y-b.y) }; }
  function setMode(mode){
    const m=marker(); if(mode==='place' && !(m && m.patch && m.patch.image)) return;
    state.mode=mode; state.capture=null;
    $('modeText').textContent=mode==='capture'?'Capture mouth':mode==='place'?'Position patch':'Preview';
    if(mode==='capture') status('Drag around a useful mouth shape in the video viewer.');
    if(mode==='place') status('Drag the captured mouth over the faulty mouth position.');
    drawViewer();
  }
  function loadFile(file){
    if(!file || !file.type.startsWith('video/')) { if(file) toast('Drop a video file here.'); return; }
    if(state.url) URL.revokeObjectURL(state.url);
    video.pause(); state.url=URL.createObjectURL(file); state.duration=0; state.markers=[]; state.selectedId=''; state.mode='preview'; state.loop=false; state.thumbs=[]; state.donorSelected=-1;
    $('videoName').textContent=file.name; $('dropOverlay').classList.add('hidden');
    video.src=state.url; video.load(); renderMarkers(); renderSelected(); status('Loading video…');
  }
  function clearVideo(){
    video.pause(); if(state.url) URL.revokeObjectURL(state.url); Object.assign(state,{url:'',duration:0,markers:[],selectedId:'',mode:'preview',loop:false,thumbs:[],donorSelected:-1,dragging:null,capture:null});
    video.removeAttribute('src'); video.load(); $('videoName').textContent='No video loaded'; $('durationText').textContent='--:--.---'; $('currentTime').textContent='00:00.000'; $('totalTime').textContent='00:00.000'; $('dropOverlay').classList.remove('hidden'); $('donorStrip').innerHTML='<p class="empty">Donor frames appear after a video is loaded.</p>';
    ['removeVideoBtn','prevFrameBtn','playBtn','nextFrameBtn','markWordBtn','markWordSideBtn','refreshDonorsBtn'].forEach(id => $(id).disabled=true);
    renderMarkers(); renderSelected(); drawViewer(); drawTimeline(); status('Drop a video into the player to begin.');
  }
  function rawFrame(target,width,height){
    target.clearRect(0,0,width,height); target.fillStyle='#030407'; target.fillRect(0,0,width,height); if(!video.videoWidth) return;
    const scale=Math.min(width/video.videoWidth,height/video.videoHeight), w=video.videoWidth*scale, h=video.videoHeight*scale;
    target.drawImage(video,(width-w)/2,(height-h)/2,w,h);
  }
  function feathered(p){
    const out=document.createElement('canvas'), mask=document.createElement('canvas'); out.width=mask.width=p.w; out.height=mask.height=p.h;
    const o=out.getContext('2d'), m=mask.getContext('2d'), f=clamp(p.feather,0,Math.min(p.w,p.h)/2); o.drawImage(p.image,0,0);
    m.filter=f?`blur(${f}px)`:'none'; m.fillStyle='#fff'; const inset=Math.max(1,f+1); m.beginPath(); m.ellipse(p.w/2,p.h/2,Math.max(1,p.w/2-inset),Math.max(1,p.h/2-inset),0,0,Math.PI*2); m.fill(); o.globalCompositeOperation='destination-in'; o.drawImage(mask,0,0); return out;
  }
  function drawViewer(){
    rawFrame(sourceCtx,sourceCanvas.width,sourceCanvas.height); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(sourceCanvas,0,0);
    const m=marker();
    if(m && m.patch && m.patch.image && m.patch.visible){ const r=range(m); if(video.currentTime>=r.start && video.currentTime<=r.end){ const p=m.patch, image=feathered(p), scale=p.scale/100; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation*Math.PI/180); ctx.scale(scale,scale); ctx.globalAlpha=p.opacity/100; ctx.drawImage(image,-p.w/2,-p.h/2); if(state.mode==='place'){ ctx.globalAlpha=1; ctx.strokeStyle='#ff9c19'; ctx.lineWidth=2/scale; ctx.setLineDash([8/scale,5/scale]); ctx.strokeRect(-p.w/2,-p.h/2,p.w,p.h); } ctx.restore(); } }
    if(state.mode==='capture' && state.capture){ const b=box(state.capture.a,state.capture.b); ctx.save(); ctx.fillStyle='rgba(255,156,25,.13)'; ctx.strokeStyle='#ff9c19'; ctx.lineWidth=3; ctx.setLineDash([10,6]); ctx.fillRect(b.x,b.y,b.w,b.h); ctx.strokeRect(b.x,b.y,b.w,b.h); ctx.restore(); }
  }
  function resizeTimeline(){ const r=timeline.getBoundingClientRect(), d=window.devicePixelRatio || 1; timeline.width=Math.max(520,Math.round(r.width*d)); timeline.height=Math.max(90,Math.round(r.height*d)); drawTimeline(); }
  function xFor(t){ return 30 + (timeline.width-60)*(t/state.duration); }
  function drawTimeline(){
    const w=timeline.width,h=timeline.height; tctx.clearRect(0,0,w,h); tctx.fillStyle='#0c0e13'; tctx.fillRect(0,0,w,h);
    if(!state.duration){ tctx.fillStyle='#777482'; tctx.font=`${Math.max(11,h*.12)}px sans-serif`; tctx.fillText('Load a video to place word markers.',18,h/2); return; }
    const base=h*.60; tctx.strokeStyle='rgba(158,115,243,.46)'; tctx.lineWidth=Math.max(5,h*.062); tctx.lineCap='round'; tctx.beginPath(); tctx.moveTo(30,base); tctx.lineTo(w-30,base); tctx.stroke(); tctx.lineCap='butt';
    for(let i=0;i<=8;i++){ const t=i/8*state.duration, x=xFor(t); tctx.strokeStyle='rgba(255,255,255,.15)'; tctx.lineWidth=1; tctx.beginPath(); tctx.moveTo(x,base-h*.1); tctx.lineTo(x,base+h*.11); tctx.stroke(); tctx.fillStyle='#918c9b'; tctx.textAlign='center'; tctx.font=`${Math.max(9,h*.085)}px sans-serif`; tctx.fillText(fmt(t),x,base+h*.28); }
    state.markers.forEach((m,i)=>{ const selected=m.id===state.selectedId, x=xFor(m.time), y=base-h*.25, r=Math.max(8,h*.084); tctx.strokeStyle=selected?'#ffe0a5':'#dfd0ff'; tctx.fillStyle=selected?'#ff9c19':'#9e73f3'; tctx.lineWidth=2; tctx.beginPath(); tctx.moveTo(x,y+r); tctx.lineTo(x,base-2); tctx.stroke(); tctx.beginPath(); tctx.arc(x,y,r,0,Math.PI*2); tctx.fill(); tctx.stroke(); tctx.fillStyle='#fff'; tctx.font=`bold ${Math.max(10,h*.086)}px sans-serif`; tctx.textBaseline='middle'; tctx.fillText(String(i+1),x,y); });
    const cursor=xFor(video.currentTime || 0); tctx.strokeStyle='#fff'; tctx.lineWidth=2; tctx.beginPath(); tctx.moveTo(cursor,h*.08); tctx.lineTo(cursor,h*.87); tctx.stroke(); tctx.textAlign='left'; tctx.textBaseline='alphabetic';
  }
  function renderMarkers(){
    const list=$('markerList'); list.innerHTML=''; if(!state.markers.length){ list.innerHTML='<p class="empty">No marked words.</p>'; return; }
    state.markers.forEach((m,i)=>{ const btn=document.createElement('button'); btn.type='button'; btn.className=`marker-card ${m.id===state.selectedId?'selected':''}`; btn.innerHTML=`<span class="marker-card-top"><span>PIN ${String(i+1).padStart(2,'0')}</span><span>${fmt(m.time)}</span></span><strong></strong><small>${m.patch && m.patch.image?'Mouth patch captured':'Needs donor mouth'}</small>`; btn.querySelector('strong').textContent=m.phrase || 'Enter words…'; btn.onclick=()=>selectMarker(m.id,true); list.appendChild(btn); });
  }
  function renderSelected(){
    const m=marker(), has=!!m; $('selectedPinPanel').classList.toggle('disabled',!has); $('noPinMessage').hidden=has; $('pinFields').hidden=!has; $('deleteMarkerBtn').disabled=!has;
    if(!has){ $('selectedPhrase').textContent='No marker selected'; setMode('preview'); return; }
    $('pinTime').textContent=fmt(m.time); $('phraseInput').value=m.phrase; $('spanInput').value=m.span; $('spanOutput').textContent=`${m.span.toFixed(2)} s`; $('selectedPhrase').textContent=m.phrase || 'Enter words for selected pin'; $('loopBtn').textContent=`Loop This Pin: ${state.loop?'On':'Off'}`;
    const hasPatch=!!(m.patch && m.patch.image); $('positionBtn').disabled=!hasPatch; $('removePatchBtn').disabled=!hasPatch; $('patchControls').hidden=!hasPatch; $('patchMessage').textContent=hasPatch?'Patch is active. Adjust it below or drag it over the mouth.':'Choose a donor frame on the right, then drag a box around its mouth.';
    if(hasPatch){ const p=m.patch; $('patchX').value=Math.round(p.x); $('patchY').value=Math.round(p.y); $('patchScale').value=p.scale; $('patchRotate').value=p.rotation; $('patchFeather').value=p.feather; $('patchOpacity').value=p.opacity; $('showPatch').checked=p.visible; $('scaleOutput').textContent=`${p.scale}%`; $('rotateOutput').textContent=`${p.rotation}°`; $('featherOutput').textContent=`${p.feather} px`; $('opacityOutput').textContent=`${p.opacity}%`; $('donorTime').textContent=fmt(p.donorTime); }
  }
  function selectMarker(id,seek){ state.selectedId=id; state.loop=false; setMode('preview'); const m=marker(); if(m && seek) video.currentTime=m.time; renderMarkers(); renderSelected(); drawTimeline(); drawViewer(); }
  function addMarker(){ if(!state.duration) return; video.pause(); const m={id:`pin_${Date.now()}`,time:Number(video.currentTime.toFixed(4)),phrase:'',span:.8,patch:null}; state.markers.push(m); state.markers.sort((a,b)=>a.time-b.time); selectMarker(m.id,false); $('phraseInput').focus(); toast('Pin added. Type the word or short phrase.'); }
  function deleteMarker(){ if(!state.selectedId) return; state.markers=state.markers.filter(m=>m.id!==state.selectedId); state.selectedId=state.markers[0]?.id || ''; state.loop=false; renderMarkers(); renderSelected(); drawTimeline(); drawViewer(); toast('Pin removed.'); }
  function seek(time){ video.currentTime=clamp(time,0,Math.max(0,state.duration-.001)); }
  function seekAsync(time){ return new Promise(resolve=>{ const t=clamp(time,0,Math.max(0,state.duration-.001)); if(Math.abs(video.currentTime-t)<.001){ resolve(); return; } video.addEventListener('seeked',resolve,{once:true}); video.currentTime=t; }); }
  async function buildDonors(){
    if(!state.duration || state.building) return; state.building=true; video.pause(); const saved=video.currentTime, count=clamp(Math.ceil(state.duration/1.25),9,18), c=document.createElement('canvas'); c.width=260;c.height=146; const cc=c.getContext('2d'); $('donorStrip').innerHTML='<p class="empty">Finding donor frames…</p>'; state.thumbs=[];
    for(let i=0;i<count;i++){ const t=i/(count-1)*Math.max(0,state.duration-.01); await seekAsync(t); rawFrame(cc,c.width,c.height); state.thumbs.push({time:t,url:c.toDataURL('image/jpeg',.82)}); }
    await seekAsync(saved); state.building=false; renderDonors(); drawViewer(); status('Pause on a broken word and add a marker pin.');
  }
  function renderDonors(){ const strip=$('donorStrip'); strip.innerHTML=''; if(!state.thumbs.length){strip.innerHTML='<p class="empty">Donor frames appear after a video is loaded.</p>';return;} state.thumbs.forEach((thumb,i)=>{const b=document.createElement('button'); b.type='button'; b.className=`donor-thumb ${i===state.donorSelected?'selected':''}`; b.innerHTML=`<img src="${thumb.url}" alt=""><span>${fmt(thumb.time)}</span>`; b.onclick=()=>{state.donorSelected=i;video.pause();seek(thumb.time);setMode('preview');renderDonors();status('Donor frame selected. Now click Capture Donor Mouth.');}; strip.appendChild(b);}); }
  function capturePatch(b){ const m=marker(); if(!m || b.w<10 || b.h<10){toast('Drag a larger mouth area.');return;} const c=document.createElement('canvas'); c.width=Math.round(b.w); c.height=Math.round(b.h); c.getContext('2d').drawImage(sourceCanvas,b.x,b.y,b.w,b.h,0,0,c.width,c.height); const img=new Image(); img.onload=drawViewer; img.src=c.toDataURL('image/png'); m.patch={image:img,w:c.width,h:c.height,x:b.x+b.w/2,y:b.y+b.h/2,scale:100,rotation:0,feather:5,opacity:100,visible:true,donorTime:Number(video.currentTime.toFixed(4))}; video.currentTime=m.time; setMode('place'); renderMarkers(); renderSelected(); toast('Mouth captured. Drag it into place.'); }
  function updatePatch(){ const m=marker(); if(!(m && m.patch && m.patch.image))return; const p=m.patch; p.x=Number($('patchX').value)||0;p.y=Number($('patchY').value)||0;p.scale=Number($('patchScale').value);p.rotation=Number($('patchRotate').value);p.feather=Number($('patchFeather').value);p.opacity=Number($('patchOpacity').value);p.visible=$('showPatch').checked; renderSelected(); drawViewer(); }
  function clearPatch(){ const m=marker(); if(!m)return; m.patch=null; setMode('preview'); renderMarkers(); renderSelected(); drawViewer(); toast('Mouth patch removed.'); }
  function updatePlayback(){ $('currentTime').textContent=fmt(video.currentTime); const m=marker(); if(state.loop && m && video.currentTime>=range(m).end) video.currentTime=range(m).start; drawViewer(); drawTimeline(); }
  function animate(){ if(video.paused || video.ended){state.raf=0;return;} updatePlayback(); state.raf=requestAnimationFrame(animate); }
  $('fileInput').onchange=e=>{loadFile(e.target.files?.[0]);e.target.value='';}; $('dropOverlay').onclick=()=>$('fileInput').click(); $('removeVideoBtn').onclick=clearVideo;
  $('dropZone').ondragover=e=>{e.preventDefault();$('dropZone').classList.add('drag-over');}; $('dropZone').ondragleave=()=>$('dropZone').classList.remove('drag-over'); $('dropZone').ondrop=e=>{e.preventDefault();$('dropZone').classList.remove('drag-over');loadFile(e.dataTransfer.files?.[0]);};
  video.onloadedmetadata=()=>{state.duration=video.duration||0;$('durationText').textContent=fmt(state.duration);$('totalTime').textContent=fmt(state.duration);['removeVideoBtn','prevFrameBtn','playBtn','nextFrameBtn','markWordBtn','markWordSideBtn','refreshDonorsBtn'].forEach(id=>$(id).disabled=false);resizeTimeline();drawViewer();status('Pause on a broken word and add a marker pin.');buildDonors();}; video.onseeked=updatePlayback; video.onplay=()=>{$('playBtn').textContent='❚❚';if(!state.raf)state.raf=requestAnimationFrame(animate);}; video.onpause=()=>{$('playBtn').textContent='▶';updatePlayback();};
  $('playBtn').onclick=()=>video.paused?video.play():video.pause(); $('prevFrameBtn').onclick=()=>{video.pause();seek(video.currentTime-1/state.fps);}; $('nextFrameBtn').onclick=()=>{video.pause();seek(video.currentTime+1/state.fps);}; $('markWordBtn').onclick=addMarker; $('markWordSideBtn').onclick=addMarker; $('deleteMarkerBtn').onclick=deleteMarker;
  $('phraseInput').oninput=e=>{const m=marker();if(!m)return;m.phrase=e.target.value;$('selectedPhrase').textContent=m.phrase||'Enter words for selected pin';renderMarkers();}; $('spanInput').oninput=e=>{const m=marker();if(!m)return;m.span=Number(e.target.value);$('spanOutput').textContent=`${m.span.toFixed(2)} s`;drawViewer();};
  $('loopBtn').onclick=()=>{const m=marker();if(!m)return;state.loop=!state.loop;$('loopBtn').textContent=`Loop This Pin: ${state.loop?'On':'Off'}`;if(state.loop){seek(range(m).start);video.play();}}; $('captureBtn').onclick=()=>{if(marker()){video.pause();setMode('capture');}}; $('positionBtn').onclick=()=>{video.pause();setMode('place');}; $('removePatchBtn').onclick=clearPatch; $('refreshDonorsBtn').onclick=buildDonors;
  ['patchX','patchY','patchScale','patchRotate','patchFeather','patchOpacity','showPatch'].forEach(id=>$(id).oninput=updatePatch);
  canvas.onpointerdown=e=>{const m=marker();if(!m)return;const p=point(e);if(state.mode==='capture'){state.dragging='capture';state.capture={a:p,b:p};canvas.setPointerCapture(e.pointerId);}else if(state.mode==='place'&&m.patch&&m.patch.image){state.dragging={type:'place',dx:p.x-m.patch.x,dy:p.y-m.patch.y};canvas.setPointerCapture(e.pointerId);}}; canvas.onpointermove=e=>{if(!state.dragging)return;const p=point(e),m=marker();if(state.dragging==='capture')state.capture.b=p;else if(m&&m.patch){m.patch.x=p.x-state.dragging.dx;m.patch.y=p.y-state.dragging.dy;renderSelected();}drawViewer();}; canvas.onpointerup=e=>{if(!state.dragging)return;if(state.dragging==='capture'&&state.capture)capturePatch(box(state.capture.a,state.capture.b));state.dragging=null;state.capture=null;try{canvas.releasePointerCapture(e.pointerId);}catch(_){}drawViewer();};
  timeline.onclick=e=>{if(!state.duration)return;const r=timeline.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*timeline.width;let hit=null,dist=Infinity;state.markers.forEach(m=>{const d=Math.abs(xFor(m.time)-x);if(d<dist){dist=d;hit=m;}});if(hit&&dist<=18){selectMarker(hit.id,true);return;}video.pause();seek(clamp((x-30)/(timeline.width-60),0,1)*state.duration);}; window.onresize=resizeTimeline;
  clearVideo(); resizeTimeline();
})();
