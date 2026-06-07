// Potion Match / Item Order Puzzle V2
// Integrated runtime for Artifex Puzzle Creator.
// Replace puzzle-creator/src/js/engines/potion-match-runtime.js with this file.

const PM_ING = {
  yarrow:['Yarrow','🌿'], lavender:['Lavender','💜'], milk:['Capra Milk','🥛'], dust:['Star Dust','✨'],
  salt:['Salt','🧂'], mushroom:['Mushroom','🍄'], moon:['Moonflower','🌙'], ember:['Ember','🔥'], water:['Aetheris Water','💧'],
  sage:['Sage','🍃'], silver:['Silver Thread','🪙'], wax:['Sealing Wax','🕯️'], coin:['Plain Coin','🪙'], ash:['Ash','⚫'], berry:['Bitter Berry','🫐']
};

const PM_RECIPES = {
  healing:{ title:'Healing Tisane', challenge:'Add the ingredients in the shown order to complete the challenge brew.', craft:'Craft a restorative potion from Mel’s inventory.', hint:'Root before bloom, bloom before milk, milk before star.', type:'Consumable', output:'Healing Tisane', desc:'Restores health.', seq:['yarrow','lavender','milk','dust'], dec:['salt','mushroom','moon'] },
  lantern:{ title:'Lantern Potion', challenge:'Follow the recipe order to create a light-bearing potion.', craft:'Craft a potion that adds a light tool to inventory.', hint:'Water takes fire, fire takes flower, flower takes dust.', type:'Ability Tool', output:'Lantern Potion', desc:'Adds temporary light in dark areas.', seq:['water','ember','lavender','dust'], dec:['salt','mushroom','moon'] },
  tracking:{ title:'Tracking Coin', challenge:'Bind the signs in the correct order to create a tracking charm.', craft:'Craft a magical coin that can mark or locate a target.', hint:'Coin, salt, silver, moon.', type:'Magical Tool', output:'Tracking Coin', desc:'Marks or tracks a person or object.', seq:['coin','salt','silver','moon'], dec:['wax','mushroom','ember'] },
  portal:{ title:'Portal Potion', challenge:'Assemble the travel mixture without selecting the decoys.', craft:'Craft a potion that can open a temporary shortcut.', hint:'Water, moon, dust, wax: fluid path sealed into form.', type:'Travel Spell Item', output:'Portal Potion', desc:'Opens a temporary doorway or shortcut.', seq:['water','moon','dust','wax'], dec:['salt','yarrow','ember'] },
  ward:{ title:'Salt Ward', challenge:'Create a protective charm from cleansing and binding signs.', craft:'Craft a warding charm from inventory ingredients.', hint:'First cleanse, then bind, then seal.', type:'Defensive Charm', output:'Salt Ward', desc:'Blocks corruption or spirit attack.', seq:['salt','sage','silver','wax'], dec:['berry','mushroom','moon'] }
};

const PM_DEFAULT_INV = { yarrow:2, lavender:2, milk:1, dust:2, salt:3, mushroom:1, moon:2, water:2, ember:1, sage:1, silver:1, wax:1, coin:1, ash:1, berry:1 };

const PM = { mounted:false, active:false, mode:'challenge', recipe:'healing', index:0, picked:[], mistakes:0, quality:100, maxMistakes:3, strict:false, trayMode:'fixed', shuffled:[], inventory:{...PM_DEFAULT_INV}, icons:{}, stage:null, panels:null };

const pm$ = id => document.getElementById(id);
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const rec = () => PM_RECIPES[PM.recipe] || PM_RECIPES.healing;
const ingName = id => PM_ING[id]?.[0] || id;
const ingEmoji = id => PM_ING[id]?.[1] || '?';

function iconHtml(id){
  const icon = PM.icons[id];
  if(icon?.url) return `<img class="pm-img" src="${icon.url}" alt="${esc(ingName(id))}">`;
  if(icon?.libraryId) return `<span class="pm-lib">OBJ</span>`;
  return `<span class="pm-emoji">${esc(ingEmoji(id))}</span>`;
}

function injectPotionMatchStyles(){
  if(pm$('potion-match-v2-styles')) return;
  const style = document.createElement('style');
  style.id = 'potion-match-v2-styles';
  style.textContent = `
    .is-potion-match .right-preview-layout,.is-potion-match .overview-window{display:none!important}
    .is-potion-match .left-panel-body>[data-panel-content],.is-potion-match #puzzle-launcher-panel{display:none!important}
    .is-potion-match [data-workflow-menu],.is-potion-match [data-workflow-only]{display:none!important}
    .potion-match-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:radial-gradient(circle at 40% 0%,rgba(108,55,132,.25),transparent 36%),#08050b;color:var(--cream,#f4ead4)}
    .pm-workspace{display:grid;grid-template-columns:minmax(420px,1fr) 292px;gap:14px;align-items:start}.pm-view,.pm-side{border:1px solid rgba(190,139,222,.24);border-radius:16px;background:rgba(14,10,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.24)}
    .pm-view{position:relative;min-height:min(670px,calc(100vh - 150px));padding:16px;display:flex;flex-direction:column;gap:14px;overflow:hidden}.pm-view:before{content:'';position:absolute;inset:0;background-image:var(--pm-bg-image);background-size:cover;background-position:center;opacity:var(--pm-bg-opacity,.28);filter:blur(var(--pm-bg-blur,0px));transform:scale(1.02)}.pm-view>*{position:relative;z-index:1}
    .pm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(190,139,222,.18);padding-bottom:13px}.pm-head h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.pm-head p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.pm-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .pm-slots{display:grid;grid-template-columns:repeat(auto-fit,minmax(82px,1fr));gap:9px}.pm-slot{min-height:84px;border:1px dashed rgba(238,196,90,.35);border-radius:14px;background:rgba(38,25,45,.72);display:grid;place-items:center;text-align:center;position:relative;overflow:hidden}.pm-slot.filled{border-style:solid;border-color:rgba(158,230,164,.55);background:rgba(38,75,44,.55)}.pm-slot.current{box-shadow:0 0 0 2px rgba(238,196,90,.28),0 0 22px rgba(238,196,90,.12)}.pm-slot .idx{position:absolute;top:6px;left:8px;color:rgba(244,234,212,.5);font-size:.62rem;font-weight:800}.pm-emoji{font-size:1.78rem;display:block}.pm-slot small,.pm-item small{display:block;color:var(--muted,#c9bfae);font-size:.65rem}.pm-img{width:34px;height:34px;object-fit:contain;display:block;margin:0 auto 3px}.pm-lib{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(238,196,90,.42);border-radius:9px;color:#eec45a;font-size:.68rem;font-weight:900;margin:0 auto 3px;background:rgba(70,50,14,.48)}
    .pm-cauldron{min-height:210px;border:1px solid rgba(124,202,125,.16);border-radius:18px;background:radial-gradient(circle at 50% 38%,rgba(129,224,154,.72),rgba(73,136,85,.6) 34%,rgba(4,13,10,.92) 62%);display:grid;place-items:center;text-align:center;box-shadow:inset 0 0 50px #000}.pm-cauldron strong{font-family:'Cinzel',serif}.pm-cauldron span{display:block;color:var(--muted,#c9bfae);font-size:.75rem;margin-top:6px}
    .pm-tray{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:9px}.pm-item{min-height:82px;border:1px solid rgba(190,139,222,.3);border-radius:13px;background:rgba(48,28,62,.67);color:var(--cream,#f4ead4);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;position:relative;font-weight:800;cursor:pointer}.pm-item:hover{border-color:rgba(238,196,90,.55);background:rgba(83,55,86,.68)}.pm-item[disabled]{opacity:.35;cursor:not-allowed}.pm-count{position:absolute;right:8px;top:6px;color:#eec45a;font-size:.7rem}
    .pm-side{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.pm-side h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}.pm-metric{display:flex;justify-content:space-between;border:1px solid rgba(190,139,222,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.pm-metric strong{color:var(--cream,#f4ead4)}.pm-bar{height:10px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}.pm-fill{height:100%;width:100%;background:linear-gradient(90deg,#db7053,#eec45a,#9ee6a4);transition:width .25s ease}.pm-output{border:1px solid rgba(238,196,90,.28);border-radius:12px;padding:11px;background:rgba(78,58,18,.18);font-size:.78rem;color:var(--muted,#c9bfae)}.pm-output strong{color:#eec45a;display:block;margin-bottom:4px}.pm-result{min-height:50px;border:1px solid rgba(190,139,222,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.pm-result[data-state=success]{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.pm-result[data-state=error]{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.pm-result[data-state=warn]{border-color:#c9a64a;color:#eec45a;background:#3c2c12}.pm-stack{display:grid;gap:8px}.pm-stack button{min-height:40px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.pm-inventory{display:grid;grid-template-columns:1fr auto;gap:7px;font-size:.75rem;color:var(--muted,#c9bfae);border-top:1px solid rgba(190,139,222,.2);padding-top:10px}.pm-inventory strong{color:var(--cream,#f4ead4)}.pm-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}.pm-block{padding:12px;margin:0 0 10px;border-radius:11px;background:rgba(48,28,62,.34);border:1px solid rgba(190,139,222,.17)}.pm-block small{display:block;color:#eec45a;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;font-weight:800;margin-bottom:7px}.pm-block p{margin:0;font-size:.77rem;line-height:1.5;color:var(--cream,#f4ead4)}@media(max-width:1080px){.pm-workspace{grid-template-columns:1fr}.pm-view{min-height:560px}.pm-side{min-height:220px}}
  `;
  document.head.appendChild(style);
}

export function openPotionMatchWorkflow(){
  ensurePotionMatchMounted();
  PM.active = true;
  document.body.classList.add('is-potion-match');
  document.body.classList.remove('is-puzzle-brief','is-puzzle-chooser');
  PM.stage.hidden = false;
  PM.panels.hidden = false;
  showPotionPanel('build');
  resetPotion(false);
}

export function closePotionMatchWorkflow(){
  if(!PM.mounted) return;
  PM.active = false;
  document.body.classList.remove('is-potion-match');
  PM.stage.hidden = true;
  PM.panels.hidden = true;
}

function ensurePotionMatchMounted(){
  if(PM.mounted) return;
  injectPotionMatchStyles();
  const right = document.querySelector('.right-panel');
  const left = document.querySelector('.left-panel-body');
  if(!right || !left) return;

  PM.stage = document.createElement('section');
  PM.stage.id = 'potion-match-stage';
  PM.stage.className = 'potion-match-stage';
  PM.stage.hidden = true;
  PM.stage.innerHTML = `
    <div class="pm-workspace">
      <section id="pm-view" class="pm-view">
        <div class="pm-head"><div><p id="pm-mode-label" class="eyebrow">Challenge Puzzle</p><h2 id="pm-title">Potion Match</h2><p id="pm-objective-line"></p></div><span id="pm-status" class="pm-pill">Ready</span></div>
        <div id="pm-slots" class="pm-slots"></div>
        <div class="pm-cauldron"><div><strong id="pm-cauldron-state">Cauldron waiting</strong><span id="pm-cauldron-subtitle">Add the first ingredient.</span></div></div>
        <div id="pm-tray" class="pm-tray"></div>
      </section>
      <aside class="pm-side"><p class="eyebrow">Brew State</p><h3>Result</h3><div class="pm-metric"><span>Progress</span><strong id="pm-progress">0 / 0</strong></div><div class="pm-metric"><span>Mistakes</span><strong id="pm-mistakes">0 / 3</strong></div><div class="pm-bar"><div id="pm-quality-fill" class="pm-fill"></div></div><div class="pm-metric"><span>Quality</span><strong id="pm-quality">100%</strong></div><div class="pm-output"><strong id="pm-output-name">Output</strong><span id="pm-output-text">Complete a recipe to create an item.</span></div><div id="pm-result" class="pm-result" aria-live="polite">The brew is waiting.</div><div class="pm-stack"><button id="pm-reset" type="button">Reset</button><button id="pm-answer" type="button">Show Correct Order</button><button id="pm-shuffle" type="button">Shuffle Tray</button></div><h3>Demo Inventory</h3><div id="pm-inventory" class="pm-inventory"></div></aside>
    </div>`;
  right.prepend(PM.stage);

  PM.panels = document.createElement('div');
  PM.panels.id = 'potion-match-panels';
  PM.panels.hidden = true;
  PM.panels.innerHTML = `
    <section class="panel tool-panel potion-panel" data-potion-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Potion Match</h2></div><span class="status-pill is-waiting">V2</span></div><p class="pm-copy">Dual mode prototype: authored challenge puzzle or inventory-driven crafting skill.</p><label class="field-block"><span>Mode</span><select id="pm-mode"><option value="challenge">Challenge Potion Puzzle</option><option value="crafting">Crafting Skill</option></select></label><label class="field-block"><span>Recipe</span><select id="pm-recipe-select">${Object.entries(PM_RECIPES).map(([id,r])=>`<option value="${id}">${esc(r.title)}</option>`).join('')}</select></label><label class="field-block"><span>Tray Mode</span><select id="pm-tray-mode"><option value="fixed">Fixed tray</option><option value="shuffle">Shuffle after each pick</option></select></label><button id="pm-reset-panel" class="wide-button" type="button">Reset</button></section>
    <section class="panel tool-panel potion-panel" data-potion-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Background</h2></div></div><label class="field-block"><span>Background PNG</span><input id="pm-bg-file" class="file-input-hidden" type="file" accept="image/*"><button id="pm-bg-proxy" class="wide-button" type="button">Choose Background Image</button></label><label class="range-row"><span>Background Opacity <output id="pm-bg-opacity-out">28%</output></span><input id="pm-bg-opacity" type="range" min="0" max="80" value="28"></label><label class="range-row"><span>Background Blur <output id="pm-bg-blur-out">0px</output></span><input id="pm-bg-blur" type="range" min="0" max="12" value="0"></label></section>
    <section class="panel tool-panel potion-panel" data-potion-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Rules</h2></div></div><div class="pm-block"><small>Objective</small><p id="pm-objective-text"></p></div><div class="pm-block"><small>Hint</small><p id="pm-hint-text"></p></div><label class="toggle-row"><span><strong>Strict Mode</strong><small>One wrong ingredient ruins the brew.</small></span><input id="pm-strict" type="checkbox"></label><label class="range-row"><span>Allowed Mistakes <output id="pm-max-mistakes-out">3</output></span><input id="pm-max-mistakes" type="range" min="1" max="5" value="3"></label></section>
    <section class="panel tool-panel potion-panel" data-potion-panel="visuals" hidden><div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>Ingredient Icons</h2></div></div><label class="field-block"><span>Ingredient</span><select id="pm-icon-ingredient">${Object.entries(PM_ING).map(([id,info])=>`<option value="${id}">${esc(info[0])}</option>`).join('')}</select></label><label class="field-block"><span>Icon Source</span><select id="pm-icon-source"><option value="emoji">Emoji fallback</option><option value="png">Upload PNG</option><option value="library">Object Library placeholder</option></select></label><label class="field-block"><span>Icon PNG</span><input id="pm-icon-file" class="file-input-hidden" type="file" accept="image/*"><button id="pm-icon-proxy" class="wide-button" type="button">Choose Icon PNG</button></label><label class="field-block"><span>Object Library ID</span><input id="pm-object-library-id" type="text" placeholder="e.g. capra_milk_bottle"></label><button id="pm-apply-icon" class="wide-button" type="button">Apply Icon Setting</button></section>`;
  left.appendChild(PM.panels);
  bindPotionControls();
  PM.mounted = true;
}

function bindPotionControls(){
  pm$('pm-mode').addEventListener('change', e => { PM.mode = e.target.value; resetPotion(false); });
  pm$('pm-recipe-select').addEventListener('change', e => { PM.recipe = e.target.value; resetPotion(false); });
  pm$('pm-tray-mode').addEventListener('change', e => { PM.trayMode = e.target.value; renderTray(); });
  pm$('pm-reset').addEventListener('click', () => resetPotion(false));
  pm$('pm-reset-panel').addEventListener('click', () => resetPotion(false));
  pm$('pm-answer').addEventListener('click', showCorrectOrder);
  pm$('pm-shuffle').addEventListener('click', () => shuffleTray(true));
  pm$('pm-strict').addEventListener('change', e => { PM.strict = e.target.checked; resetPotion(true); });
  pm$('pm-max-mistakes').addEventListener('input', e => { PM.maxMistakes = Number(e.target.value); pm$('pm-max-mistakes-out').textContent = String(PM.maxMistakes); updateStatus(pm$('pm-result').textContent, pm$('pm-result').dataset.state || 'waiting'); });
  pm$('pm-bg-proxy').addEventListener('click', () => pm$('pm-bg-file').click());
  pm$('pm-bg-file').addEventListener('change', handleBackgroundFile);
  pm$('pm-bg-opacity').addEventListener('input', e => { pm$('pm-view').style.setProperty('--pm-bg-opacity', e.target.value/100); pm$('pm-bg-opacity-out').textContent = `${e.target.value}%`; });
  pm$('pm-bg-blur').addEventListener('input', e => { pm$('pm-view').style.setProperty('--pm-bg-blur', `${e.target.value}px`); pm$('pm-bg-blur-out').textContent = `${e.target.value}px`; });
  pm$('pm-icon-proxy').addEventListener('click', () => pm$('pm-icon-file').click());
  pm$('pm-apply-icon').addEventListener('click', applyIconSetting);
  document.querySelector('.left-icon-bar')?.addEventListener('click', event => { if(!PM.active) return; const button = event.target.closest('.panel-nav-button'); if(!button) return; event.preventDefault(); event.stopImmediatePropagation(); showPotionPanel(button.dataset.panel); }, true);
}

function resetPotion(keepTray=false){
  const r = rec();
  PM.index = 0; PM.picked = []; PM.mistakes = 0; PM.quality = 100; if(!keepTray) PM.shuffled = [];
  pm$('pm-mode').value = PM.mode; pm$('pm-recipe-select').value = PM.recipe;
  pm$('pm-mode-label').textContent = PM.mode === 'crafting' ? 'Crafting Skill' : 'Challenge Puzzle';
  pm$('pm-title').textContent = r.title; pm$('pm-objective-line').textContent = PM.mode === 'crafting' ? r.craft : r.challenge;
  pm$('pm-objective-text').textContent = PM.mode === 'crafting' ? r.craft : r.challenge; pm$('pm-hint-text').textContent = r.hint;
  pm$('pm-output-name').textContent = r.output; pm$('pm-output-text').textContent = `${r.type} · ${r.desc}`;
  pm$('pm-cauldron-state').textContent = 'Cauldron waiting'; pm$('pm-cauldron-subtitle').textContent = 'Add the first ingredient.';
  renderSlots(); renderTray(); renderInventory(); updateStatus('The brew is waiting for its first ingredient.', 'waiting');
}

function getTrayPool(){
  const r = rec(); let ids = [...r.seq, ...r.dec];
  if(PM.mode === 'crafting') ids = [...new Set([...Object.keys(PM.inventory).filter(id => PM.inventory[id] > 0), ...r.seq])];
  if(PM.shuffled.length){ const allowed = new Set(ids); return PM.shuffled.filter(id => allowed.has(id)); }
  return ids;
}

function renderSlots(){
  const row = pm$('pm-slots'); row.innerHTML = '';
  rec().seq.forEach((id, index) => { const picked = PM.picked[index]; const slot = document.createElement('div'); slot.className = `pm-slot ${picked?'filled':''} ${index===PM.index?'current':''}`; slot.innerHTML = `<span class="idx">${index+1}</span><span>${picked ? iconHtml(picked) : '<span class="pm-emoji">?</span>'}<small>${picked ? esc(ingName(picked)) : 'Waiting'}</small></span>`; row.appendChild(slot); });
}

function renderTray(){
  const used = PM.picked.reduce((a,id)=>{a[id]=(a[id]||0)+1; return a;}, {}); const tray = pm$('pm-tray'); tray.innerHTML = '';
  getTrayPool().forEach(id => { const available = PM.mode === 'crafting' ? (PM.inventory[id] || 0) - (used[id] || 0) : 99; const b = document.createElement('button'); b.type='button'; b.className='pm-item'; b.disabled = available <= 0; b.innerHTML = `<span class="pm-count">${PM.mode === 'crafting' ? Math.max(0, available) : ''}</span>${iconHtml(id)}<small>${esc(ingName(id))}</small>`; b.addEventListener('click', () => chooseIngredient(id)); tray.appendChild(b); });
}

function chooseIngredient(id){
  const r = rec(); const expected = r.seq[PM.index]; if(!expected) return;
  if(PM.mode === 'crafting'){ const already = PM.picked.filter(x => x === id).length; if((PM.inventory[id] || 0) - already <= 0) return; }
  if(id === expected){ PM.picked.push(id); PM.index++; renderSlots(); renderTray(); if(PM.trayMode === 'shuffle') shuffleTray(false); if(PM.index >= r.seq.length){ if(PM.mode === 'crafting'){ PM.picked.forEach(x => { PM.inventory[x] = Math.max(0, (PM.inventory[x] || 0)-1); }); PM.inventory[r.output] = (PM.inventory[r.output] || 0)+1; } updateStatus(`${r.output} complete · Quality ${PM.quality}%`, 'success'); pm$('pm-status').textContent='Complete'; pm$('pm-cauldron-state').textContent=r.output; pm$('pm-cauldron-subtitle').textContent=r.desc; renderInventory(); renderTray(); return; } updateStatus(`${ingName(id)} added. Next ingredient required.`, 'waiting'); pm$('pm-cauldron-state').textContent = `${ingName(id)} added`; pm$('pm-cauldron-subtitle').textContent = `Next: ${ingName(r.seq[PM.index])}`; return; }
  PM.mistakes++; PM.quality = Math.max(0, PM.quality - (PM.strict ? 100 : 25));
  if(PM.strict || PM.mistakes >= PM.maxMistakes || PM.quality <= 0){ updateStatus(`The brew curdled. ${ingName(id)} was not the next ingredient.`, 'error'); pm$('pm-status').textContent='Ruined'; pm$('pm-cauldron-state').textContent='Brew ruined'; pm$('pm-cauldron-subtitle').textContent='Reset and try the order again.'; }
  else { updateStatus(`${ingName(id)} does not answer the recipe yet. Quality reduced.`, 'warn'); pm$('pm-cauldron-state').textContent='Brew unstable'; pm$('pm-cauldron-subtitle').textContent=`${PM.maxMistakes-PM.mistakes} mistake(s) remaining.`; }
  renderTray();
}

function updateStatus(message,state='waiting'){
  pm$('pm-progress').textContent = `${PM.index} / ${rec().seq.length}`; pm$('pm-mistakes').textContent = `${PM.mistakes} / ${PM.maxMistakes}`; pm$('pm-quality').textContent = `${PM.quality}%`; pm$('pm-quality-fill').style.width = `${PM.quality}%`; pm$('pm-result').textContent = message; pm$('pm-result').dataset.state = state; if(state !== 'success' && state !== 'error') pm$('pm-status').textContent = PM.index || PM.mistakes ? 'Brewing' : 'Ready';
}

function showCorrectOrder(){ const r=rec(); PM.picked=[...r.seq]; PM.index=PM.picked.length; PM.quality=100; renderSlots(); renderTray(); updateStatus(`${r.output} · Correct order loaded.`, 'success'); pm$('pm-status').textContent='Complete'; pm$('pm-cauldron-state').textContent=r.output; pm$('pm-cauldron-subtitle').textContent='Correct order shown for testing.'; }
function shuffleTray(render=true){ const ids=getTrayPool(); for(let i=ids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; } PM.shuffled=ids; if(render) renderTray(); }
function renderInventory(){ pm$('pm-inventory').innerHTML = Object.entries(PM.inventory).filter(([,c])=>c>0).map(([id,c])=>`<span>${esc(ingName(id))}</span><strong>${c}</strong>`).join(''); }
function handleBackgroundFile(event){ const file=event.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>pm$('pm-view').style.setProperty('--pm-bg-image', `url(${reader.result})`); reader.readAsDataURL(file); }
function applyIconSetting(){ const id=pm$('pm-icon-ingredient').value; const source=pm$('pm-icon-source').value; if(source === 'library'){ PM.icons[id]={libraryId:pm$('pm-object-library-id').value || `${id}_object`, url:null}; renderSlots(); renderTray(); return; } if(source === 'png'){ const file=pm$('pm-icon-file').files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ PM.icons[id]={url:reader.result}; renderSlots(); renderTray(); }; reader.readAsDataURL(file); return; } delete PM.icons[id]; renderSlots(); renderTray(); }
function showPotionPanel(panelId){ PM.panels.querySelectorAll('[data-potion-panel]').forEach(panel=>{ panel.hidden = panel.dataset.potionPanel !== panelId; panel.classList.toggle('is-active', panel.dataset.potionPanel === panelId); }); document.querySelectorAll('.panel-nav-button').forEach(button=>button.classList.toggle('is-active', button.dataset.panel === panelId)); }
function closeOtherWorkflows(){ window.__artifexPatternLock?.close?.(); document.body.classList.remove('is-pattern-lock'); }
function interceptItemOrderClicks(event){ const button = event.target.closest("[data-engine='item-order-puzzle']"); if(!button) return; event.preventDefault(); event.stopImmediatePropagation(); closeOtherWorkflows(); document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach(c=>{ c.classList.toggle('is-active', c.dataset.engine === 'item-order-puzzle'); c.classList.toggle('is-selected', c.dataset.engine === 'item-order-puzzle'); }); document.getElementById('puzzle-launcher-panel')?.setAttribute('hidden',''); document.getElementById('puzzle-module-brief-page')?.setAttribute('hidden',''); openPotionMatchWorkflow(); }
function bootPotionMatch(){ document.addEventListener('click', interceptItemOrderClicks, true); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootPotionMatch, {once:true}); else bootPotionMatch();
window.__artifexPotionMatch = { open:openPotionMatchWorkflow, close:closePotionMatchWorkflow, recipes:PM_RECIPES };
