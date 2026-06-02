(() => {
  'use strict';
  const VERSION = 'LIPSYNC-HELPER-0.1';
  const STORAGE_KEY = 'artifex.lipsyncHelper.repairPlan.v1';
  const $ = id => document.getElementById(id);
  const video = $('sourceVideo');
  const stage = $('videoCanvas');
  const ctx = stage.getContext('2d');
  const timeline = $('timelineCanvas');
  const tctx = timeline.getContext('2d');
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = stage.width;
  sourceCanvas.height = stage.height;
  const sourceCtx = sourceCanvas.getContext('2d');
  const state = { fileName:'', url:'', duration:0, fps:30, markIn:null, markOut:null, regions:[], selected:'', mode:'preview', loop:false, thumbs:[], pointer:null, box:null };
  const shapes = {
    REST:['Rest','Neutral transition'], CLOSED:['M / B / P','Closed lips'], AH:['AH / A','Wide open vowel'], EH:['EH / End','Side-open vowel'], EE:['EE / I','Wide smile vowel'], O:['O / Oh','Rounded opening'], OO:['OO / U / W','Pursed rounded lips'], FV:['F / V','Teeth on lower lip'], TONGUE:['L / TH','Tongue / teeth transition'], SOFT:['Soft consonant','Small transition']
  };
  const phraseMap = { end:['EH','SOFT'], laughter:['AH','FV','TONGUE','REST'], oh:['O'], ohh:['O'], ohhh:['O'], 'it be':['EE','SOFT','REST','CLOSED','EE'] };
  let toastTimer = 0;
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const numberOr = (n,fallback) => Number.isFinite(Number(n)) ? Number(n) : fallback;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formatTime = time => !Number.isFinite(time) ? '--:--.---' : `${String(Math.floor(Math.max(0,time)/60)).padStart(2,'0')}:${(Math.max(0,time)%60).toFixed(3).padStart(6,'0')}`;
  const selectedRegion = () => state.regions.find(region => region.id === state.selected) || null;
  const newPatch = () => ({ donorTime:null, crop:null, dataUrl:'', image:null, x:stage.width/2, y:stage.height/2, scale:100, rotation:0, feather:5, opacity:100, visible:true });
  function setStatus(text,error=false){ const node=$('statusText'); node.textContent=text; node.className=`status ${error?'error':'ok'}`; }
  function toast(text){ const node=$('toast'); node.textContent=`${VERSION}: ${text}`; node.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('is-visible'),2600); }
  function changed(){ $('planState').textContent='Unsaved changes'; }
  function sequence(text){
    const cleaned=text.toLowerCase().trim().replace(/[^a-z\s']/g,'');
    if (!cleaned) return [];
    if (phraseMap[cleaned]) return [...phraseMap[cleaned]];
    const output=[];
    for(let i=0;i<cleaned.length;i+=1){
      const pair=cleaned.slice(i,i+2), char=cleaned[i];
      if(pair==='th'){ output.push('TONGUE'); i+=1; continue; }
      if(['oo','ou'].includes(pair)){ output.push('OO'); i+=1; continue; }
      if(['ee','ea'].includes(pair)){ output.push('EE'); i+=1; continue; }
      if(char===' ') output.push('REST');
      else if('mbp'.includes(char)) output.push('CLOSED');
      else if('fv'.includes(char)) output.push('FV');
      else if(char==='o') output.push('O');
      else if('uw'.includes(char)) output.push('OO');
      else if(char==='a') output.push('AH');
      else if(char==='e') output.push('EH');
      else if('iy'.includes(char)) output.push('EE');
      else if(char==='l') output.push('TONGUE');
      else output.push('SOFT');
    }
    return output.filter((part,index)=>part==='REST'||part!==output[index-1]);
  }
  function visemes(parts){
    $('visemeMap').innerHTML=parts.length ? parts.map(part=>`<div class="viseme-chip"><strong>${shapes[part][0]}</strong><span>${shapes[part][1]}</span></div>`).join('') : '<p class="small">Enter a phrase to see its approximate mouth-shape sequence.</p>';
  }
  function drawSource(target,targetCtx,width,height){
    targetCtx.clearRect(0,0,width,height); targetCtx.fillStyle='#030304'; targetCtx.fillRect(0,0,width,height);
    if(!video.videoWidth) return;
    const scale=Math.min(width/video.videoWidth,height/video.videoHeight), w=video.videoWidth*scale, h=video.videoHeight*scale;
    targetCtx.drawImage(video,(width-w)/2,(height-h)/2,w,h);
  }
  function activeOverlay(){ return state.regions.find(region=>video.currentTime>=region.start&&video.currentTime<=region.end&&region.patch.image&&region.patch.visible); }
  function patchCanvas(patch){
    if(!patch.image||!patch.crop) return null;
    const output=document.createElement('canvas'), mask=document.createElement('canvas');
    output.width=mask.width=patch.crop.w; output.height=mask.height=patch.crop.h;
    const out=output.getContext('2d'), m=mask.getContext('2d'), feather=clamp(numberOr(patch.feather,5),0,Math.min(output.width,output.height)/2);
    out.drawImage(patch.image,0,0); m.filter=feather?`blur(${feather}px)`:'none'; m.fillStyle='#fff';
    const inset=Math.max(1,feather+1); m.beginPath(); m.ellipse(output.width/2,output.height/2,Math.max(1,output.width/2-inset),Math.max(1,output.height/2-inset),0,0,Math.PI*2); m.fill();
    out.globalCompositeOperation='destination-in'; out.drawImage(mask,0,0); return output;
  }
  function drawPatch(region){
    const patch=region.patch, image=patchCanvas(patch); if(!image) return;
    const scale=numberOr(patch.scale,100)/100;
    ctx.save(); ctx.translate(numberOr(patch.x,stage.width/2),numberOr(patch.y,stage.height/2)); ctx.rotate(numberOr(patch.rotation,0)*Math.PI/180); ctx.scale(scale,scale); ctx.globalAlpha=clamp(numberOr(patch.opacity,100)/100,0,1); ctx.drawImage(image,-image.width/2,-image.height/2);
    if(region.id===state.selected&&state.mode==='place'){ ctx.globalAlpha=1; ctx.strokeStyle='#c300ff'; ctx.lineWidth=2/scale; ctx.setLineDash([7/scale,5/scale]); ctx.strokeRect(-image.width/2,-image.height/2,image.width,image.height); }
    ctx.restore();
  }
  function normalBox(a,b){ return { x:Math.min(a.x,b.x), y:Math.min(a.y,b.y), w:Math.abs(a.x-b.x), h:Math.abs(a.y-b.y) }; }
  function drawStage(){
    ctx.clearRect(0,0,stage.width,stage.height); sourceCtx.clearRect(0,0,sourceCanvas.width,sourceCanvas.height);
    if(!state.duration){ ctx.fillStyle='#030304'; ctx.fillRect(0,0,stage.width,stage.height); return; }
    drawSource(sourceCanvas,sourceCtx,sourceCanvas.width,sourceCanvas.height); ctx.drawImage(sourceCanvas,0,0);
    const overlay=activeOverlay(); if(overlay&&state.mode!=='capture') drawPatch(overlay);
    if(state.box&&state.mode==='capture'){ const box=normalBox(state.box.a,state.box.b); ctx.save(); ctx.fillStyle='rgba(195,0,255,.12)'; ctx.strokeStyle='#c300ff'; ctx.lineWidth=3; ctx.setLineDash([8,5]); ctx.fillRect(box.x,box.y,box.w,box.h); ctx.strokeRect(box.x,box.y,box.w,box.h); ctx.restore(); }
  }
  function resizeTimeline(){ const rect=timeline.getBoundingClientRect(), dpi=window.devicePixelRatio||1; timeline.width=Math.max(400,Math.floor(rect.width*dpi)); timeline.height=Math.max(80,Math.floor(rect.height*dpi)); drawTimeline(); }
  function drawTimeline(){
    const w=timeline.width,h=timeline.height, film=Math.round(h*.64); tctx.clearRect(0,0,w,h); tctx.fillStyle='#08090b'; tctx.fillRect(0,0,w,h);
    if(!state.duration){ tctx.fillStyle='#8e7c67'; tctx.font='12px sans-serif'; tctx.fillText('Upload a video to begin marking repair regions.',16,h/2); return; }
    if(state.thumbs.length){ const sw=w/state.thumbs.length; state.thumbs.forEach((thumb,index)=>{ if(thumb.image.complete) tctx.drawImage(thumb.image,index*sw,0,sw+1,film); }); }
    tctx.fillStyle='rgba(4,5,7,.34)'; tctx.fillRect(0,0,w,film);
    state.regions.forEach(region=>{ const x=region.start/state.duration*w, width=Math.max(3,(region.end-region.start)/state.duration*w); tctx.fillStyle=region.id===state.selected?'rgba(195,0,255,.72)':'rgba(184,119,63,.76)'; tctx.fillRect(x,film+7,width,h-film-16); tctx.strokeStyle=region.id===state.selected?'#ffd6ff':'#ffd6a0'; tctx.strokeRect(x,film+7,width,h-film-16); });
    [[state.markIn,'#66c7ff'],[state.markOut,'#ffd86b']].forEach(([mark,colour])=>{ if(mark!==null){ const x=mark/state.duration*w; tctx.strokeStyle=colour; tctx.lineWidth=2; tctx.beginPath(); tctx.moveTo(x,0); tctx.lineTo(x,h); tctx.stroke(); }});
    tctx.strokeStyle='#fff'; tctx.lineWidth=2; tctx.beginPath(); tctx.moveTo(video.currentTime/state.duration*w,0); tctx.lineTo(video.currentTime/state.duration*w,h); tctx.stroke();
  }
  function marks(){
    $('markInText').textContent=formatTime(state.markIn); $('markOutText').textContent=formatTime(state.markOut);
    $('addRegionBtn').disabled=!(state.duration&&state.markIn!==null&&state.markOut!==null&&state.markOut>state.markIn&&$('phraseInput').value.trim()); drawTimeline();
  }
  function patchFields(patch){ $('patchX').value=Math.round(patch.x); $('patchY').value=Math.round(patch.y); $('patchScale').value=patch.scale; $('patchRotation').value=patch.rotation; $('patchFeather').value=patch.feather; $('patchOpacity').value=patch.opacity; $('showPatch').checked=patch.visible; $('patchScaleOut').textContent=`${patch.scale}%`; $('patchRotationOut').textContent=`${patch.rotation}°`; $('patchFeatherOut').textContent=`${patch.feather} px`; $('patchOpacityOut').textContent=`${patch.opacity}%`; $('donorTime').textContent=patch.donorTime===null?'None captured':formatTime(patch.donorTime); }
  function renderQueue(){
    $('repairList').innerHTML=state.regions.length ? state.regions.map((region,index)=>`<article class="repair-card ${region.id===state.selected?'is-selected':''}" data-region-id="${region.id}"><div class="repair-card-header"><span class="repair-index">REPAIR ${String(index+1).padStart(2,'0')}</span><strong>${esc(region.phrase)}</strong></div><div class="repair-times">${formatTime(region.start)} — ${formatTime(region.end)}</div><span class="repair-state ${region.patch.image?'ready':''}">${region.patch.image?'Patch captured':'Awaiting donor mouth'}</span><div class="repair-actions"><button class="btn" data-action="edit" data-id="${region.id}" type="button">Edit</button><button class="btn" data-action="loop" data-id="${region.id}" type="button">Loop</button><button class="btn" data-action="delete" data-id="${region.id}" type="button">Delete</button></div></article>`).join('') : '<p class="empty">No repair regions marked yet.</p>';
  }
  function selectRegion(id,seek=false){
    state.selected=id||''; const region=selectedRegion(); $('noRegionMessage').hidden=!!region; $('patchFields').hidden=!region; $('updateRegionBtn').hidden=!region; $('loopBtn').disabled=!region||!state.duration;
    if(region){ $('phraseInput').value=region.phrase; $('selectedRepairLabel').textContent=`${region.phrase} · ${formatTime(region.start)}–${formatTime(region.end)}`; patchFields(region.patch); visemes(region.visemes); if(seek) go(region.start); } else visemes([]);
    renderQueue(); drawStage(); drawTimeline();
  }
  function addRegion(){
    if($('addRegionBtn').disabled) return; const phrase=$('phraseInput').value.trim(); const region={ id:`repair_${Date.now()}`, start:+state.markIn.toFixed(4), end:+state.markOut.toFixed(4), phrase, visemes:sequence(phrase), patch:newPatch() };
    state.regions.push(region); state.regions.sort((a,b)=>a.start-b.start); state.markIn=null; state.markOut=null; marks(); changed(); selectRegion(region.id,true); toast(`Repair region added: ${phrase}`);
  }
  function updateText(){ const region=selectedRegion(), text=$('phraseInput').value.trim(); if(!region||!text) return; region.phrase=text; region.visemes=sequence(text); changed(); selectRegion(region.id); toast('Selected repair text updated'); }
  function removeRegion(id){ const removed=state.regions.find(region=>region.id===id); state.regions=state.regions.filter(region=>region.id!==id); if(state.selected===id) selectRegion(state.regions[0]?.id||''); else renderQueue(); changed(); drawTimeline(); toast(`Removed repair: ${removed?.phrase||'region'}`); }
  function disableLoop(){ state.loop=false; $('loopBtn').classList.remove('active'); $('loopBtn').textContent='Loop Selected: Off'; }
  function setMode(mode){ const region=selectedRegion(); if(mode!=='preview'&&!region){ toast('Select a repair region first'); return; } if(mode==='place'&&!region.patch.image){ toast('Capture a donor mouth first'); return; } state.mode=mode; state.box=null; if(mode==='capture'){ disableLoop(); video.pause(); toast('Drag a box around a usable donor mouth'); } $('captureModeBtn').classList.toggle('active',mode==='capture'); $('placeModeBtn').classList.toggle('active',mode==='place'); stage.classList.toggle('capture-mode',mode==='capture'); stage.classList.toggle('place-mode',mode==='place'); $('canvasModeLabel').textContent=mode==='capture'?'Capture donor mouth':mode==='place'?'Position patch':'Preview mode'; drawStage(); }
  function point(event){ const r=stage.getBoundingClientRect(); return {x:(event.clientX-r.left)/r.width*stage.width,y:(event.clientY-r.top)/r.height*stage.height}; }
  function capture(box){
    const region=selectedRegion(); if(!region||box.w<8||box.h<8) return; const crop={x:Math.round(clamp(box.x,0,stage.width-8)),y:Math.round(clamp(box.y,0,stage.height-8)),w:Math.round(clamp(box.w,8,stage.width-box.x)),h:Math.round(clamp(box.h,8,stage.height-box.y))};
    const clip=document.createElement('canvas'); clip.width=crop.w; clip.height=crop.h; clip.getContext('2d').drawImage(sourceCanvas,crop.x,crop.y,crop.w,crop.h,0,0,crop.w,crop.h);
    region.patch.crop=crop; region.patch.donorTime=+video.currentTime.toFixed(4); region.patch.dataUrl=clip.toDataURL('image/png'); region.patch.image=new Image(); region.patch.image.onload=drawStage; region.patch.image.src=region.patch.dataUrl; region.patch.x=crop.x+crop.w/2; region.patch.y=crop.y+crop.h/2; patchFields(region.patch); changed(); renderQueue(); go(region.start); setMode('place'); toast('Donor mouth captured. Drag it over the faulty mouth.');
  }
  function controlPatch(){ const patch=selectedRegion()?.patch; if(!patch) return; patch.x=numberOr($('patchX').value,patch.x); patch.y=numberOr($('patchY').value,patch.y); patch.scale=numberOr($('patchScale').value,100); patch.rotation=numberOr($('patchRotation').value,0); patch.feather=numberOr($('patchFeather').value,5); patch.opacity=numberOr($('patchOpacity').value,100); patch.visible=$('showPatch').checked; patchFields(patch); changed(); drawStage(); }
  function clearPatch(){ const region=selectedRegion(); if(!region) return; region.patch=newPatch(); patchFields(region.patch); changed(); renderQueue(); setMode('preview'); toast('Patch removed'); }
  function go(time){ if(!state.duration) return; video.currentTime=clamp(time,0,state.duration); $('currentTimeText').textContent=formatTime(video.currentTime); drawStage(); drawTimeline(); }
  function step(direction){ video.pause(); go(video.currentTime+direction/state.fps); }
  function togglePlay(){ if(!state.duration) return; if(video.paused) video.play().catch(()=>toast('Playback was blocked. Click play again.')); else video.pause(); }
  function toggleLoop(id){ if(id) selectRegion(id,true); const region=selectedRegion(); if(!region) return; state.loop=!state.loop; $('loopBtn').classList.toggle('active',state.loop); $('loopBtn').textContent=`Loop Selected: ${state.loop?'On':'Off'}`; if(state.loop){ go(region.start); video.play().catch(()=>{}); } }
  function payload(){ return { schema:'artifex.lipsync-helper.repair-plan.v1', version:VERSION, exportedAt:new Date().toISOString(), sourceVideo:{fileName:state.fileName,durationSeconds:+state.duration.toFixed(4),workingFps:state.fps}, note:'Prototype plan only. Rendered MP4 export is not connected in V0.1.', repairRegions:state.regions.map(region=>({...region,patch:{...region.patch,image:undefined}})) }; }
  function download(){ const link=document.createElement('a'); link.href=URL.createObjectURL(new Blob([JSON.stringify(payload(),null,2)],{type:'application/json'})); link.download=`${(state.fileName||'lipsync_video').replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]+/gi,'_')}_mouth_patch_plan.json`; link.click(); setTimeout(()=>URL.revokeObjectURL(link.href),1000); $('planState').textContent='Downloaded'; toast('Repair plan JSON downloaded'); }
  function hydrate(raw){ const patch={...newPatch(),...(raw||{})}; if(patch.dataUrl){ patch.image=new Image(); patch.image.onload=drawStage; patch.image.src=patch.dataUrl; } return patch; }
  function importPlan(plan){ if(!Array.isArray(plan?.repairRegions)) throw new Error('Invalid repair plan.'); state.fps=numberOr(plan.sourceVideo?.workingFps,state.fps); $('fpsInput').value=String(state.fps); state.regions=plan.repairRegions.map(region=>({ id:region.id||`repair_${Date.now()}`,start:numberOr(region.start,0),end:numberOr(region.end,0),phrase:String(region.phrase||''),visemes:Array.isArray(region.visemes)?region.visemes:sequence(String(region.phrase||'')),patch:hydrate(region.patch) })); selectRegion(state.regions[0]?.id||''); $('planState').textContent='Imported'; toast('Repair plan imported. Upload its source video to preview.'); }
  function saveLocal(){ try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(payload())); $('planState').textContent='Saved locally'; toast('Saved to local browser backup'); }catch(_){ setStatus('Local save failed.',true); } }
  function restoreLocal(){ try{ const plan=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'); if(!plan) return toast('No local repair plan found'); importPlan(plan); $('planState').textContent='Restored locally'; }catch(_){ setStatus('Local restore failed.',true); } }
  function loadVideo(file){ if(!file) return; if(state.url) URL.revokeObjectURL(state.url); state.url=URL.createObjectURL(file); state.fileName=file.name; video.src=state.url; video.load(); $('videoName').textContent=file.name; $('blankMessage').hidden=true; setStatus('Loading video…'); }
  function reset(){ if((state.regions.length||state.fileName)&&!window.confirm('Clear the current Lip-Sync Helper workspace?')) return; video.pause(); video.removeAttribute('src'); video.load(); if(state.url) URL.revokeObjectURL(state.url); Object.assign(state,{fileName:'',url:'',duration:0,markIn:null,markOut:null,regions:[],selected:'',mode:'preview',loop:false,thumbs:[],pointer:null,box:null}); $('videoName').textContent='No video loaded'; $('durationText').textContent='--:--.---'; $('phraseInput').value=''; $('blankMessage').hidden=false; ['playBtn','backFrameBtn','forwardFrameBtn','loopBtn','markInBtn','markOutBtn','buildStripBtn'].forEach(id=>$(id).disabled=true); $('planState').textContent='Unsaved'; disableLoop(); marks(); selectRegion(''); renderStrip(); drawStage(); resizeTimeline(); setStatus('Ready for a video.'); }
  function seek(time){ return new Promise(resolve=>{ const done=()=>resolve(); video.addEventListener('seeked',done,{once:true}); video.currentTime=clamp(time,0,Math.max(0,state.duration-.001)); }); }
  async function buildStrip(){ if(!state.duration) return; const saved=video.currentTime, count=clamp(Math.ceil(state.duration/1.5),8,18), mini=document.createElement('canvas'); mini.width=180; mini.height=102; const miniCtx=mini.getContext('2d'); video.pause(); $('buildStripBtn').disabled=true; setStatus('Sampling donor frames…'); state.thumbs=[]; for(let i=0;i<count;i+=1){ const time=i/(count-1)*Math.max(0,state.duration-.01); await seek(time); drawSource(mini,miniCtx,mini.width,mini.height); const url=mini.toDataURL('image/jpeg',.82), image=new Image(); image.src=url; state.thumbs.push({time,url,image}); } await seek(saved); $('buildStripBtn').disabled=false; renderStrip(); drawStage(); drawTimeline(); setStatus('Donor frame strip ready.'); }
  function renderStrip(){ $('donorStrip').innerHTML=state.thumbs.length ? state.thumbs.map((thumb,index)=>`<button class="donor-frame" data-thumb="${index}" type="button"><img src="${thumb.url}" alt="Frame at ${formatTime(thumb.time)}"><span>${formatTime(thumb.time)}</span></button>`).join('') : '<p class="empty">Build the donor frame strip after loading a video.</p>'; }
  function events(){
    $('videoFile').addEventListener('change',event=>loadVideo(event.target.files?.[0])); $('planFile').addEventListener('change',async event=>{ const file=event.target.files?.[0]; if(!file) return; try{ importPlan(JSON.parse(await file.text())); }catch(error){ toast(error.message); } event.target.value=''; });
    $('saveLocalBtn').onclick=saveLocal; $('restoreLocalBtn').onclick=restoreLocal; $('downloadPlanBtn').onclick=download; $('resetBtn').onclick=reset; $('fpsInput').onchange=()=>{ state.fps=numberOr($('fpsInput').value,30); changed(); };
    $('buildStripBtn').onclick=()=>void buildStrip(); $('playBtn').onclick=togglePlay; $('backFrameBtn').onclick=()=>step(-1); $('forwardFrameBtn').onclick=()=>step(1); $('loopBtn').onclick=()=>toggleLoop();
    $('markInBtn').onclick=()=>{ state.markIn=video.currentTime; marks(); }; $('markOutBtn').onclick=()=>{ state.markOut=video.currentTime; marks(); }; $('clearMarksBtn').onclick=()=>{ state.markIn=null; state.markOut=null; marks(); };
    $('phraseInput').oninput=()=>{ marks(); visemes(sequence($('phraseInput').value)); }; $('addRegionBtn').onclick=addRegion; $('updateRegionBtn').onclick=updateText; $('captureModeBtn').onclick=()=>setMode('capture'); $('placeModeBtn').onclick=()=>setMode('place'); $('clearPatchBtn').onclick=clearPatch;
    ['patchX','patchY','patchScale','patchRotation','patchFeather','patchOpacity','showPatch'].forEach(id=>$(id).addEventListener('input',controlPatch));
    video.addEventListener('loadedmetadata',()=>{ state.duration=numberOr(video.duration,0); $('durationText').textContent=formatTime(state.duration); ['playBtn','backFrameBtn','forwardFrameBtn','markInBtn','markOutBtn','buildStripBtn'].forEach(id=>$(id).disabled=false); $('loopBtn').disabled=!selectedRegion(); setStatus('Video loaded. Mark a faulty word.'); marks(); drawStage(); resizeTimeline(); void buildStrip(); });
    video.addEventListener('seeked',()=>{ $('currentTimeText').textContent=formatTime(video.currentTime); drawStage(); drawTimeline(); }); video.addEventListener('play',()=>{ $('playBtn').textContent='❚❚ Pause'; }); video.addEventListener('pause',()=>{ $('playBtn').textContent='▶ Play'; drawStage(); }); video.addEventListener('timeupdate',()=>{ const region=selectedRegion(); if(state.loop&&region&&video.currentTime>=region.end) video.currentTime=region.start; $('currentTimeText').textContent=formatTime(video.currentTime); drawStage(); drawTimeline(); });
    timeline.onclick=event=>{ if(!state.duration) return; const r=timeline.getBoundingClientRect(); go(clamp((event.clientX-r.left)/r.width,0,1)*state.duration); };
    $('donorStrip').onclick=event=>{ const button=event.target.closest('[data-thumb]'); if(!button) return; disableLoop(); video.pause(); go(state.thumbs[Number(button.dataset.thumb)].time); $('donorStrip').querySelectorAll('.donor-frame').forEach(node=>node.classList.remove('is-active')); button.classList.add('is-active'); if(selectedRegion()) setMode('capture'); };
    $('repairList').onclick=event=>{ const action=event.target.closest('[data-action]'), card=event.target.closest('[data-region-id]'), id=action?.dataset.id||card?.dataset.regionId; if(!id) return; if(!action||action.dataset.action==='edit') selectRegion(id,true); else if(action.dataset.action==='loop') toggleLoop(id); else removeRegion(id); };
    stage.onpointerdown=event=>{ const region=selectedRegion(); if(!region) return; const p=point(event); if(state.mode==='capture'){ state.pointer={type:'capture'}; state.box={a:p,b:p}; stage.setPointerCapture(event.pointerId); } else if(state.mode==='place'&&region.patch.image){ state.pointer={type:'place',dx:p.x-region.patch.x,dy:p.y-region.patch.y}; stage.setPointerCapture(event.pointerId); } };
    stage.onpointermove=event=>{ if(!state.pointer) return; const p=point(event), patch=selectedRegion().patch; if(state.pointer.type==='capture') state.box.b=p; else { patch.x=Math.round(p.x-state.pointer.dx); patch.y=Math.round(p.y-state.pointer.dy); patchFields(patch); } drawStage(); };
    stage.onpointerup=event=>{ if(!state.pointer) return; if(state.pointer.type==='capture') capture(normalBox(state.box.a,state.box.b)); else changed(); state.pointer=null; state.box=null; try{ stage.releasePointerCapture(event.pointerId); }catch(_){} drawStage(); };
    window.onresize=resizeTimeline; window.onkeydown=event=>{ if(event.target.matches('input,select,textarea')) return; if(event.code==='Space'){ event.preventDefault(); togglePlay(); } if(event.key==='ArrowLeft') step(-1); if(event.key==='ArrowRight') step(1); if(event.key.toLowerCase()==='i'){ state.markIn=video.currentTime; marks(); } if(event.key.toLowerCase()==='o'){ state.markOut=video.currentTime; marks(); } };
  }
  events(); renderQueue(); visemes([]); marks(); resizeTimeline(); drawStage();
})();
