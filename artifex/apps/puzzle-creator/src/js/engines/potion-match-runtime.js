// Potion Match / Item Order Puzzle V1 prototype
// Integrated runtime for Artifex Puzzle Creator.

const PM_RECIPES = {
  healing: {
    title: "Healing Tisane",
    objective: "Add the ingredients in the shown order to complete the brew.",
    hint: "Root before bloom, bloom before milk, milk before star.",
    result: "Healing Tisane Complete",
    sequence: [["yarrow","Yarrow","🌿"],["lavender","Lavender","💜"],["milk","Capra Milk","🥛"],["dust","Star Dust","✨"]],
    decoys: [["salt","Salt","🧂"],["mushroom","Mushroom","🍄"],["moon","Moonflower","🌙"]]
  },
  moonmilk: {
    title: "Moonmilk Charm",
    objective: "Build the lunar mixture in the correct order.",
    hint: "Moon, milk, flower, dust; fire is not part of this charm.",
    result: "Moonmilk Charm Complete",
    sequence: [["moon","Moonflower","🌙"],["milk","Capra Milk","🥛"],["lavender","Lavender","💜"],["dust","Star Dust","✨"]],
    decoys: [["ember","Ember","🔥"],["salt","Salt","🧂"],["water","Aetheris Water","💧"]]
  },
  ward: {
    title: "Salt Ward",
    objective: "Create a protective mixture from cleansing and binding signs.",
    hint: "First cleanse, then bind, then seal.",
    result: "Salt Ward Complete",
    sequence: [["salt","Salt","🧂"],["sage","Sage","🍃"],["silver","Silver Thread","🪙"],["wax","Sealing Wax","🕯️"]],
    decoys: [["berry","Bitter Berry","🫐"],["mushroom","Mushroom","🍄"],["moon","Moonflower","🌙"]]
  },
  star: {
    title: "Star Draught",
    objective: "Complete a longer recipe while ignoring the decoys.",
    hint: "Water wakes the root; root carries flower; flower accepts milk; dust closes the draught.",
    result: "Star Draught Complete",
    sequence: [["water","Aetheris Water","💧"],["yarrow","Yarrow","🌿"],["moon","Moonflower","🌙"],["milk","Capra Milk","🥛"],["dust","Star Dust","✨"]],
    decoys: [["ember","Ember","🔥"],["salt","Salt","🧂"],["mushroom","Mushroom","🍄"]]
  }
};

const PM = {
  mounted:false, active:false, recipeId:"healing", index:0, picked:[], mistakes:0, quality:100,
  maxMistakes:3, strict:false, trayMode:"fixed", shuffled:[], stage:null, panels:null
};

const pm$ = (id) => document.getElementById(id);
const esc = (v) => String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const item = (row) => ({ id: row[0], label: row[1], emoji: row[2] });
const recipe = () => PM_RECIPES[PM.recipeId] || PM_RECIPES.healing;

function injectPotionStyles(){
  if(pm$("potion-match-styles")) return;
  const style=document.createElement("style");
  style.id="potion-match-styles";
  style.textContent=`
    .is-potion-match .right-preview-layout,.is-potion-match .overview-window{display:none!important}
    .is-potion-match .left-panel-body>[data-panel-content],.is-potion-match #puzzle-launcher-panel{display:none!important}
    .is-potion-match [data-workflow-menu],.is-potion-match [data-workflow-only]{display:none!important}
    .potion-match-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:radial-gradient(circle at 40% 0%,rgba(108,55,132,.25),transparent 36%),#08050b;color:var(--cream)}
    .potion-workspace{display:grid;grid-template-columns:minmax(420px,1fr) 270px;gap:14px;align-items:start}
    .potion-view,.potion-side{border:1px solid rgba(190,139,222,.24);border-radius:16px;background:rgba(14,10,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.24)}
    .potion-view{min-height:min(670px,calc(100vh - 150px));padding:16px;display:flex;flex-direction:column;gap:14px}
    .potion-head{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(190,139,222,.18);padding-bottom:13px}.potion-head h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.potion-head p{margin:8px 0 0;color:var(--muted);font-size:.78rem;line-height:1.42}.potion-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .potion-recipe{display:grid;grid-template-columns:repeat(auto-fit,minmax(82px,1fr));gap:9px}.potion-slot{min-height:84px;border:1px dashed rgba(238,196,90,.35);border-radius:14px;background:rgba(38,25,45,.6);display:grid;place-items:center;text-align:center;position:relative;overflow:hidden}.potion-slot.is-filled{border-style:solid;border-color:rgba(158,230,164,.55);background:rgba(38,75,44,.44)}.potion-slot.is-current{box-shadow:0 0 0 2px rgba(238,196,90,.28),0 0 22px rgba(238,196,90,.12)}.potion-slot .idx{position:absolute;top:6px;left:8px;color:rgba(244,234,212,.5);font-size:.62rem;font-weight:800}.potion-slot .emoji{font-size:1.9rem;display:block}.potion-slot small{display:block;color:var(--muted);font-size:.65rem}
    .potion-cauldron{min-height:210px;border:1px solid rgba(124,202,125,.16);border-radius:18px;background:radial-gradient(circle at 50% 32%,rgba(129,224,154,.19),transparent 30%),linear-gradient(180deg,rgba(7,26,16,.82),rgba(4,13,10,.92));display:grid;place-items:center;position:relative;overflow:hidden}.potion-cauldron:before{content:'';position:absolute;width:260px;height:115px;bottom:28px;border-radius:50%;background:radial-gradient(circle at 50% 38%,rgba(129,224,154,.68),rgba(73,136,85,.6) 44%,rgba(14,29,20,.92) 68%)}.potion-cauldron:after{content:'';position:absolute;width:300px;height:86px;bottom:6px;border-radius:50% 50% 38% 38%;background:linear-gradient(180deg,#111,#050606);border:1px solid rgba(244,234,212,.18)}.potion-cauldron-text{position:relative;z-index:2;text-align:center;margin-top:54px}.potion-cauldron-text strong{font-family:'Cinzel',serif}.potion-cauldron-text span{display:block;margin-top:6px;color:var(--muted);font-size:.72rem}
    .potion-tray{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:9px}.potion-item{min-height:76px;border:1px solid rgba(190,139,222,.28);border-radius:13px;background:rgba(48,28,62,.58);color:var(--cream);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-weight:800;cursor:pointer}.potion-item:hover{border-color:rgba(238,196,90,.55);background:rgba(83,55,86,.68)}.potion-item[disabled]{opacity:.38;cursor:not-allowed}.potion-item .emoji{font-size:1.55rem}.potion-item small{font-size:.62rem;color:var(--muted)}
    .potion-side{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.potion-side h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}.potion-metric{display:flex;justify-content:space-between;border:1px solid rgba(190,139,222,.18);border-radius:11px;padding:10px 11px;color:var(--muted);font-size:.73rem}.potion-metric strong{color:var(--cream)}.potion-bar{height:10px;border-radius:999px;background:rgba(244,234,212,.12);overflow:hidden}.potion-fill{height:100%;width:100%;background:linear-gradient(90deg,#db7053,#eec45a,#9ee6a4);transition:width .25s ease}.potion-result{min-height:48px;border:1px solid rgba(190,139,222,.2);border-radius:11px;padding:11px;font-size:.74rem;line-height:1.38;color:var(--muted)}.potion-result[data-state='success']{border-color:rgba(158,230,164,.55);color:#9ee6a4;background:rgba(35,83,49,.25)}.potion-result[data-state='error']{border-color:rgba(219,112,83,.55);color:#f0a088;background:rgba(88,31,26,.25)}.potion-result[data-state='warn']{border-color:rgba(238,196,90,.5);color:#eec45a;background:rgba(89,65,21,.18)}
    .potion-stack{display:grid;gap:8px}.potion-button{min-height:40px;border:1px solid rgba(124,202,125,.28);border-radius:10px;background:rgba(20,72,37,.58);color:var(--cream);font-weight:900;cursor:pointer}.potion-button:hover{border-color:rgba(158,230,164,.58);background:rgba(28,93,50,.72)}
    .potion-copy{font-size:.73rem;line-height:1.46;color:var(--muted);margin:0 0 14px}.potion-block{padding:12px;margin:0 0 10px;border-radius:11px;background:rgba(48,28,62,.34);border:1px solid rgba(190,139,222,.17)}.potion-block small{display:block;color:#eec45a;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;font-weight:800;margin-bottom:7px}.potion-block p{margin:0;font-size:.77rem;line-height:1.5;color:var(--cream)}
    @media(max-width:1080px){.potion-workspace{grid-template-columns:1fr}.potion-view{min-height:560px}.potion-side{min-height:220px}}
  `;
  document.head.appendChild(style);
}

export function openPotionMatchWorkflow(){
  ensurePotionMounted();
  PM.active=true;
  document.body.classList.add("is-potion-match");
  document.body.classList.remove("is-puzzle-brief","is-puzzle-chooser");
  PM.stage.hidden=false;
  PM.panels.hidden=false;
  showPotionPanel("build");
  resetBrew(false);
}

export function closePotionMatchWorkflow(){
  if(!PM.mounted) return;
  PM.active=false;
  document.body.classList.remove("is-potion-match");
  PM.stage.hidden=true;
  PM.panels.hidden=true;
}

function ensurePotionMounted(){
  if(PM.mounted) return;
  injectPotionStyles();
  const right=document.querySelector(".right-panel");
  const left=document.querySelector(".left-panel-body");
  if(!right||!left) return;

  PM.stage=document.createElement("section");
  PM.stage.id="potion-match-stage";
  PM.stage.className="potion-match-stage";
  PM.stage.hidden=true;
  PM.stage.innerHTML=`
    <div class="potion-workspace">
      <section class="potion-view">
        <div class="potion-head"><div><p class="eyebrow">Item Order Puzzle · Playable Prototype</p><h2 id="potion-title">Potion Match</h2><p id="potion-objective-line"></p></div><span id="potion-status" class="potion-pill">Ready</span></div>
        <div id="potion-recipe" class="potion-recipe"></div>
        <div class="potion-cauldron"><div class="potion-cauldron-text"><strong id="potion-cauldron-state">Cauldron waiting</strong><span id="potion-cauldron-sub">Add the first ingredient.</span></div></div>
        <div id="potion-tray" class="potion-tray"></div>
      </section>
      <aside class="potion-side">
        <p class="eyebrow">Brew State</p><h3>Result</h3>
        <div class="potion-metric"><span>Progress</span><strong id="potion-progress">0 / 0</strong></div>
        <div class="potion-metric"><span>Mistakes</span><strong id="potion-mistakes">0 / 3</strong></div>
        <div class="potion-bar"><div id="potion-quality-fill" class="potion-fill"></div></div>
        <div class="potion-metric"><span>Quality</span><strong id="potion-quality">100%</strong></div>
        <div id="potion-result" class="potion-result" aria-live="polite">The brew is waiting.</div>
        <div class="potion-stack"><button id="potion-reset" class="potion-button" type="button">Reset Brew</button><button id="potion-answer" class="potion-button" type="button">Show Correct Order</button><button id="potion-shuffle" class="potion-button" type="button">Shuffle Tray</button></div>
      </aside>
    </div>`;
  right.prepend(PM.stage);

  PM.panels=document.createElement("div");
  PM.panels.id="potion-match-panels";
  PM.panels.hidden=true;
  PM.panels.innerHTML=`
    <section class="panel tool-panel potion-panel" data-potion-panel="build">
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Potion Match</h2></div><span class="status-pill is-waiting">Prototype</span></div>
      <p class="potion-copy">First playable Item Order Puzzle. Demo recipes use emoji ingredients and click-to-add ordering.</p>
      <label class="field-block"><span>Recipe Template</span><select id="potion-recipe-select">${Object.entries(PM_RECIPES).map(([id,r])=>`<option value="${id}">${esc(r.title)}</option>`).join("")}</select></label>
      <label class="field-block"><span>Tray Mode</span><select id="potion-tray-mode"><option value="fixed">Fixed tray</option><option value="shuffle-on-pick">Shuffle after each pick</option></select></label>
      <button id="potion-reset-panel" class="wide-button" type="button">Reset Brew</button>
    </section>
    <section class="panel tool-panel potion-panel" data-potion-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Display</h2></div></div>
      <label class="toggle-row"><span><strong>Show Recipe Names</strong><small>Show ingredient names under filled recipe slots.</small></span><input id="potion-show-names" type="checkbox" checked /></label>
      <label class="toggle-row"><span><strong>Disable Used Items</strong><small>Grey out ingredients already added.</small></span><input id="potion-disable-used" type="checkbox" checked /></label>
    </section>
    <section class="panel tool-panel potion-panel" data-potion-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Rules</h2></div></div>
      <div class="potion-block"><small>Objective</small><p id="potion-objective-text"></p></div>
      <div class="potion-block"><small>Hint</small><p id="potion-hint-text"></p></div>
      <label class="toggle-row"><span><strong>Strict Mode</strong><small>One wrong ingredient ruins the brew.</small></span><input id="potion-strict" type="checkbox" /></label>
      <label class="range-row"><span>Allowed Mistakes <output id="potion-max-mistakes-out">3</output></span><input id="potion-max-mistakes" type="range" min="1" max="5" step="1" value="3" /></label>
    </section>
    <section class="panel tool-panel potion-panel" data-potion-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>Visuals</h2></div></div>
      <p class="potion-copy">Custom ingredient images and Asset Library linking are intentionally not included in this first prototype.</p>
      <button id="potion-shuffle-panel" class="wide-button" type="button">Shuffle Tray</button>
    </section>`;
  left.appendChild(PM.panels);
  bindPotionControls();
  PM.mounted=true;
}

function bindPotionControls(){
  pm$("potion-recipe-select").addEventListener("change",e=>{PM.recipeId=e.target.value;resetBrew(false);});
  pm$("potion-tray-mode").addEventListener("change",e=>{PM.trayMode=e.target.value;renderTray();});
  pm$("potion-reset").addEventListener("click",()=>resetBrew(false));
  pm$("potion-reset-panel").addEventListener("click",()=>resetBrew(false));
  pm$("potion-answer").addEventListener("click",showAnswer);
  pm$("potion-shuffle").addEventListener("click",()=>shuffleTray(true));
  pm$("potion-shuffle-panel").addEventListener("click",()=>shuffleTray(true));
  pm$("potion-show-names").addEventListener("change",renderSlots);
  pm$("potion-disable-used").addEventListener("change",renderTray);
  pm$("potion-strict").addEventListener("change",e=>{PM.strict=e.target.checked;resetBrew(true);});
  pm$("potion-max-mistakes").addEventListener("input",e=>{PM.maxMistakes=Number(e.target.value);pm$("potion-max-mistakes-out").textContent=String(PM.maxMistakes);updateStatus(pm$("potion-result").textContent,pm$("potion-result").dataset.state||"waiting");});
  document.querySelector(".left-icon-bar")?.addEventListener("click",(event)=>{
    if(!PM.active) return;
    const button=event.target.closest(".panel-nav-button");
    if(!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showPotionPanel(button.dataset.panel);
  },true);
}

function resetBrew(keepTray=false){
  const r=recipe();
  PM.index=0; PM.picked=[]; PM.mistakes=0; PM.quality=100;
  if(!keepTray) PM.shuffled=[];
  pm$("potion-title").textContent=r.title;
  pm$("potion-objective-line").textContent=r.objective;
  pm$("potion-objective-text").textContent=r.objective;
  pm$("potion-hint-text").textContent=r.hint;
  pm$("potion-recipe-select").value=PM.recipeId;
  pm$("potion-cauldron-state").textContent="Cauldron waiting";
  pm$("potion-cauldron-sub").textContent="Add the first ingredient.";
  renderSlots(); renderTray(); updateStatus("The brew is waiting for its first ingredient.","waiting");
}

function trayItems(){
  const r=recipe();
  const entries=[...r.sequence,...r.decoys].map(item);
  if(!PM.shuffled.length) return entries;
  const map=new Map(entries.map(i=>[i.id,i]));
  return PM.shuffled.map(id=>map.get(id)).filter(Boolean);
}

function renderSlots(){
  const showNames=pm$("potion-show-names")?.checked!==false;
  const row=pm$("potion-recipe");
  row.innerHTML="";
  recipe().sequence.map(item).forEach((it,i)=>{
    const picked=PM.picked[i];
    const slot=document.createElement("div");
    slot.className=`potion-slot ${picked?"is-filled":""} ${i===PM.index?"is-current":""}`;
    slot.innerHTML=`<span class="idx">${i+1}</span><span><span class="emoji">${picked?esc(picked.emoji):"?"}</span><small>${showNames?esc(picked?picked.label:"Waiting"):""}</small></span>`;
    row.appendChild(slot);
  });
}

function renderTray(){
  const used=new Set(PM.picked.map(i=>i.id));
  const disableUsed=pm$("potion-disable-used")?.checked!==false;
  const tray=pm$("potion-tray");
  tray.innerHTML="";
  trayItems().forEach(it=>{
    const button=document.createElement("button");
    button.type="button"; button.className="potion-item"; button.disabled=disableUsed&&used.has(it.id);
    button.innerHTML=`<span class="emoji">${esc(it.emoji)}</span><small>${esc(it.label)}</small>`;
    button.addEventListener("click",()=>chooseIngredient(it));
    tray.appendChild(button);
  });
}

function chooseIngredient(it){
  const r=recipe();
  const expected=item(r.sequence[PM.index]);
  if(!expected) return;
  if(it.id===expected.id){
    PM.picked.push(it); PM.index++;
    renderSlots(); renderTray();
    if(PM.trayMode==="shuffle-on-pick") shuffleTray(false);
    if(PM.index>=r.sequence.length){
      updateStatus(`${r.result} · Quality ${PM.quality}%`,"success");
      pm$("potion-status").textContent="Complete";
      pm$("potion-cauldron-state").textContent=r.result;
      pm$("potion-cauldron-sub").textContent=`Final quality: ${PM.quality}%`;
      return;
    }
    updateStatus(`${it.label} added. Next ingredient required.`,"waiting");
    pm$("potion-cauldron-state").textContent=`${it.label} added`;
    pm$("potion-cauldron-sub").textContent=`Next: ${item(r.sequence[PM.index]).label}`;
    return;
  }
  PM.mistakes++; PM.quality=Math.max(0,PM.quality-(PM.strict?100:25));
  if(PM.strict||PM.mistakes>=PM.maxMistakes||PM.quality<=0){
    updateStatus(`The brew curdled. ${it.label} was not the next ingredient.`,"error");
    pm$("potion-status").textContent="Ruined";
    pm$("potion-cauldron-state").textContent="Brew ruined";
    pm$("potion-cauldron-sub").textContent="Reset and try the order again.";
  } else {
    updateStatus(`${it.label} does not answer the recipe yet. Quality reduced.`,"warn");
    pm$("potion-cauldron-state").textContent="Brew unstable";
    pm$("potion-cauldron-sub").textContent=`${PM.maxMistakes-PM.mistakes} mistake(s) remaining.`;
  }
  renderTray();
}

function updateStatus(message,state="waiting"){
  const r=recipe();
  pm$("potion-progress").textContent=`${PM.index} / ${r.sequence.length}`;
  pm$("potion-mistakes").textContent=`${PM.mistakes} / ${PM.maxMistakes}`;
  pm$("potion-quality").textContent=`${PM.quality}%`;
  pm$("potion-quality-fill").style.width=`${PM.quality}%`;
  pm$("potion-result").textContent=message;
  pm$("potion-result").dataset.state=state;
  if(state!=="success"&&state!=="error") pm$("potion-status").textContent=(PM.index||PM.mistakes)?"Brewing":"Ready";
}

function showAnswer(){
  const r=recipe();
  PM.picked=r.sequence.map(item); PM.index=PM.picked.length; PM.quality=100;
  renderSlots(); renderTray();
  updateStatus(`${r.result} · Correct order loaded.`,"success");
  pm$("potion-status").textContent="Complete";
  pm$("potion-cauldron-state").textContent=r.result;
  pm$("potion-cauldron-sub").textContent="Correct order shown for testing.";
}

function shuffleTray(render=true){
  const ids=[...recipe().sequence,...recipe().decoys].map(row=>row[0]);
  for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
  PM.shuffled=ids;
  if(render) renderTray();
}

function showPotionPanel(panelId){
  PM.panels.querySelectorAll("[data-potion-panel]").forEach(panel=>{
    panel.hidden=panel.dataset.potionPanel!==panelId;
    panel.classList.toggle("is-active",panel.dataset.potionPanel===panelId);
  });
  document.querySelectorAll(".panel-nav-button").forEach(button=>button.classList.toggle("is-active",button.dataset.panel===panelId));
}

function closeOtherWorkflows(){
  window.__artifexPatternLock?.close?.();
  document.body.classList.remove("is-pattern-lock");
}

function interceptItemOrderClicks(event){
  const button=event.target.closest("[data-engine='item-order-puzzle']");
  if(!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  closeOtherWorkflows();
  document.querySelectorAll(".puzzle-type-option, .engine-button[data-engine]").forEach(candidate=>{
    candidate.classList.toggle("is-active",candidate.dataset.engine==="item-order-puzzle");
    candidate.classList.toggle("is-selected",candidate.dataset.engine==="item-order-puzzle");
  });
  document.getElementById("puzzle-launcher-panel")?.setAttribute("hidden","");
  document.getElementById("puzzle-module-brief-page")?.setAttribute("hidden","");
  openPotionMatchWorkflow();
}

function bootPotionMatch(){ document.addEventListener("click",interceptItemOrderClicks,true); }

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bootPotionMatch,{once:true});
else bootPotionMatch();

window.__artifexPotionMatch={open:openPotionMatchWorkflow,close:closePotionMatchWorkflow,recipes:PM_RECIPES};
