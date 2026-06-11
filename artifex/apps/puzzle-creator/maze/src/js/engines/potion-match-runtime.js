// Potion Match / Item Order Puzzle V3
// Integrated runtime for Artifex Puzzle Creator.
// Adds ingredient authoring: Add Ingredient, remove default examples, recipe sequence builder,
// default example ingredients, Object Library placeholder picker, PNG icons, and dual mode.

const DEFAULT_INGREDIENTS = {
  yarrow: { id: 'yarrow', name: 'Yarrow', emoji: '🌿', source: 'default', libraryId: '', iconUrl: '' },
  lavender: { id: 'lavender', name: 'Lavender', emoji: '💜', source: 'default', libraryId: '', iconUrl: '' },
  milk: { id: 'milk', name: 'Capra Milk', emoji: '🥛', source: 'default', libraryId: '', iconUrl: '' },
  dust: { id: 'dust', name: 'Star Dust', emoji: '✨', source: 'default', libraryId: '', iconUrl: '' },
  salt: { id: 'salt', name: 'Salt', emoji: '🧂', source: 'default', libraryId: '', iconUrl: '' },
  mushroom: { id: 'mushroom', name: 'Mushroom', emoji: '🍄', source: 'default', libraryId: '', iconUrl: '' },
  moon: { id: 'moon', name: 'Moonflower', emoji: '🌙', source: 'default', libraryId: '', iconUrl: '' },
  ember: { id: 'ember', name: 'Ember', emoji: '🔥', source: 'default', libraryId: '', iconUrl: '' },
  water: { id: 'water', name: 'Aetheris Water', emoji: '💧', source: 'default', libraryId: '', iconUrl: '' },
  sage: { id: 'sage', name: 'Sage', emoji: '🍃', source: 'default', libraryId: '', iconUrl: '' },
  silver: { id: 'silver', name: 'Silver Thread', emoji: '🪙', source: 'default', libraryId: '', iconUrl: '' },
  wax: { id: 'wax', name: 'Sealing Wax', emoji: '🕯️', source: 'default', libraryId: '', iconUrl: '' },
  coin: { id: 'coin', name: 'Plain Coin', emoji: '🪙', source: 'default', libraryId: '', iconUrl: '' },
  berry: { id: 'berry', name: 'Bitter Berry', emoji: '🫐', source: 'default', libraryId: '', iconUrl: '' },
};

const LIBRARY_EXAMPLES = [
  { id: 'obj_capra_milk_bottle', name: 'Capra Milk Bottle', emoji: '🥛' },
  { id: 'obj_moonflower', name: 'Moonflower', emoji: '🌙' },
  { id: 'obj_salt_bowl', name: 'Salt Bowl', emoji: '🧂' },
  { id: 'obj_silver_thread', name: 'Silver Thread', emoji: '🪙' },
  { id: 'obj_aetheris_water', name: 'Aetheris Water', emoji: '💧' },
  { id: 'obj_star_dust_vial', name: 'Star Dust Vial', emoji: '✨' },
  { id: 'obj_lantern_ember', name: 'Lantern Ember', emoji: '🔥' },
];

const RECIPE_PRESETS = {
  healing: {
    title: 'Healing Tisane',
    challengeObjective: 'Add the ingredients in the shown order to complete the challenge brew.',
    craftingObjective: 'Craft a restorative potion from Mel’s available inventory ingredients.',
    hint: 'Root before bloom, bloom before milk, milk before star.',
    outputType: 'Consumable',
    outputId: 'healing_tisane',
    outputName: 'Healing Tisane',
    outputDescription: 'Restores health.',
    sequence: ['yarrow', 'lavender', 'milk', 'dust'],
    decoys: ['salt', 'mushroom', 'moon'],
  },
  lantern: {
    title: 'Lantern Potion',
    challengeObjective: 'Follow the recipe order to create a light-bearing potion.',
    craftingObjective: 'Craft a potion that adds a light tool to inventory.',
    hint: 'Water takes fire, fire takes flower, flower takes dust.',
    outputType: 'Ability Tool',
    outputId: 'lantern_potion',
    outputName: 'Lantern Potion',
    outputDescription: 'Adds temporary light in dark areas.',
    sequence: ['water', 'ember', 'lavender', 'dust'],
    decoys: ['salt', 'mushroom', 'moon'],
  },
  tracking: {
    title: 'Tracking Coin',
    challengeObjective: 'Bind the signs in the correct order to create a tracking charm.',
    craftingObjective: 'Craft a magical coin that can mark or locate a target.',
    hint: 'Coin, salt, silver, moon.',
    outputType: 'Magical Tool',
    outputId: 'tracking_coin',
    outputName: 'Tracking Coin',
    outputDescription: 'Marks or tracks a person or object.',
    sequence: ['coin', 'salt', 'silver', 'moon'],
    decoys: ['wax', 'mushroom', 'ember'],
  },
  portal: {
    title: 'Portal Potion',
    challengeObjective: 'Assemble the travel mixture without selecting the decoys.',
    craftingObjective: 'Craft a potion that can open a temporary shortcut.',
    hint: 'Water, moon, dust, wax: fluid path sealed into form.',
    outputType: 'Travel Spell Item',
    outputId: 'portal_potion',
    outputName: 'Portal Potion',
    outputDescription: 'Opens a temporary doorway or shortcut.',
    sequence: ['water', 'moon', 'dust', 'wax'],
    decoys: ['salt', 'yarrow', 'ember'],
  },
  ward: {
    title: 'Salt Ward',
    challengeObjective: 'Create a protective charm from cleansing and binding signs.',
    craftingObjective: 'Craft a warding charm from inventory ingredients.',
    hint: 'First cleanse, then bind, then seal.',
    outputType: 'Defensive Charm',
    outputId: 'salt_ward',
    outputName: 'Salt Ward',
    outputDescription: 'Blocks corruption or spirit attack.',
    sequence: ['salt', 'sage', 'silver', 'wax'],
    decoys: ['berry', 'mushroom', 'moon'],
  },
};

const DEFAULT_INVENTORY = {
  yarrow: 2,
  lavender: 2,
  milk: 1,
  dust: 2,
  salt: 3,
  mushroom: 1,
  moon: 2,
  water: 2,
  ember: 1,
  sage: 1,
  silver: 1,
  wax: 1,
  coin: 1,
  berry: 1,
};

const PM = {
  mounted: false,
  active: false,
  mode: 'challenge',
  recipeId: 'healing',
  ingredients: clone(DEFAULT_INGREDIENTS),
  recipes: clone(RECIPE_PRESETS),
  selectedIngredientId: 'yarrow',
  index: 0,
  picked: [],
  mistakes: 0,
  quality: 100,
  maxMistakes: 3,
  strict: false,
  trayMode: 'fixed',
  shuffled: [],
  inventory: { ...DEFAULT_INVENTORY },
  stage: null,
  panels: null,
};

const $ = (id) => document.getElementById(id);

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function slugify(value) { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `ingredient_${Date.now()}`; }
function esc(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function recipe() { return PM.recipes[PM.recipeId] || Object.values(PM.recipes)[0] || emptyRecipe(); }
function ingredient(id) { return PM.ingredients[id] || { id, name: id, emoji: '?', source: 'missing', libraryId: '', iconUrl: '' }; }
function ingredientName(id) { return ingredient(id).name || id; }
function iconHtml(id) {
  const item = ingredient(id);
  if (item.iconUrl) return `<img class="potion-ingredient-img" src="${item.iconUrl}" alt="${esc(item.name)}" />`;
  if (item.source === 'library') return '<span class="potion-library-chip">OBJ</span>';
  return `<span class="potion-emoji">${esc(item.emoji || '?')}</span>`;
}
function emptyRecipe() {
  return { title: 'Custom Potion', challengeObjective: 'Add selected ingredients in order.', craftingObjective: 'Craft this item from inventory ingredients.', hint: 'Follow the authored order.', outputType: 'Crafted Item', outputId: 'custom_potion', outputName: 'Custom Potion', outputDescription: 'A custom output.', sequence: [], decoys: [] };
}
function libraryItems() {
  const candidates = [window.__artifexArchetypeObjectLibrary, window.__artifexObjectLibrary, window.__artifexRegisteredObjects];
  const live = candidates.find((value) => Array.isArray(value));
  if (!live) return LIBRARY_EXAMPLES;
  return live.map((item) => ({ id: item.id || item.objectId || item.key || item.name, name: item.name || item.title || item.label || item.id || 'Library Object', emoji: item.emoji || item.icon || '◈' }));
}

function injectStyles() {
  if ($('potion-match-v3-styles')) return;
  const style = document.createElement('style');
  style.id = 'potion-match-v3-styles';
  style.textContent = `
    .is-potion-match .right-preview-layout,.is-potion-match .overview-window{display:none!important}
    .is-potion-match .left-panel-body>[data-panel-content],.is-potion-match #puzzle-launcher-panel{display:none!important}
    .is-potion-match [data-workflow-menu],.is-potion-match [data-workflow-only]{display:none!important}
    .potion-match-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:radial-gradient(circle at 40% 0%,rgba(108,55,132,.25),transparent 36%),#08050b;color:var(--cream,#f4ead4)}
    .potion-workspace{display:grid;grid-template-columns:minmax(420px,1fr) 292px;gap:14px;align-items:start}
    .potion-view-card,.potion-side-card{border:1px solid rgba(190,139,222,.24);border-radius:16px;background:rgba(14,10,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.24)}
    .potion-view-card{position:relative;min-height:min(670px,calc(100vh - 150px));padding:16px;display:flex;flex-direction:column;gap:14px;overflow:hidden}
    .potion-view-card::before{content:'';position:absolute;inset:0;background-image:var(--potion-bg-image);background-size:cover;background-position:center;opacity:var(--potion-bg-opacity,.28);filter:blur(var(--potion-bg-blur,0px));transform:scale(1.02)}
    .potion-view-card>*{position:relative;z-index:1}
    .potion-header-line{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(190,139,222,.18);padding-bottom:13px}
    .potion-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.potion-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}
    .potion-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .potion-recipe-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(82px,1fr));gap:9px}.potion-slot{min-height:84px;border:1px dashed rgba(238,196,90,.35);border-radius:14px;background:rgba(38,25,45,.72);display:grid;place-items:center;text-align:center;position:relative;overflow:hidden}
    .potion-slot.is-filled{border-style:solid;border-color:rgba(158,230,164,.55);background:rgba(38,75,44,.55)}.potion-slot.is-current{box-shadow:0 0 0 2px rgba(238,196,90,.28),0 0 22px rgba(238,196,90,.12)}.potion-slot .slot-index{position:absolute;top:6px;left:8px;color:rgba(244,234,212,.5);font-size:.62rem;font-weight:800}
    .potion-emoji{font-size:1.78rem;display:block}.potion-slot small,.potion-item small{display:block;color:var(--muted,#c9bfae);font-size:.65rem}.potion-ingredient-img{width:34px;height:34px;object-fit:contain;display:block;margin:0 auto 3px}.potion-library-chip{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(238,196,90,.42);border-radius:9px;color:#eec45a;font-size:.68rem;font-weight:900;margin:0 auto 3px;background:rgba(70,50,14,.48)}
    .potion-cauldron{min-height:210px;border:1px solid rgba(124,202,125,.16);border-radius:18px;background:radial-gradient(circle at 50% 38%,rgba(129,224,154,.72),rgba(73,136,85,.6) 34%,rgba(4,13,10,.92) 62%);display:grid;place-items:center;text-align:center;box-shadow:inset 0 0 50px #000}.potion-cauldron strong{font-family:'Cinzel',serif}.potion-cauldron span{display:block;color:var(--muted,#c9bfae);font-size:.75rem;margin-top:6px}
    .potion-tray{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:9px}.potion-item{min-height:82px;border:1px solid rgba(190,139,222,.3);border-radius:13px;background:rgba(48,28,62,.67);color:var(--cream,#f4ead4);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;position:relative;font-weight:800;cursor:pointer}.potion-item:hover{border-color:rgba(238,196,90,.55);background:rgba(83,55,86,.68)}.potion-item[disabled]{opacity:.35;cursor:not-allowed}.potion-item .potion-count{position:absolute;right:8px;top:6px;color:#eec45a;font-size:.7rem}
    .potion-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.potion-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}.potion-metric{display:flex;justify-content:space-between;border:1px solid rgba(190,139,222,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.potion-metric strong{color:var(--cream,#f4ead4)}
    .potion-quality-bar{height:10px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}.potion-quality-fill{height:100%;width:100%;background:linear-gradient(90deg,#db7053,#eec45a,#9ee6a4);transition:width .25s ease}.potion-output{border:1px solid rgba(238,196,90,.28);border-radius:12px;padding:11px;background:rgba(78,58,18,.18);font-size:.78rem;color:var(--muted,#c9bfae)}.potion-output strong{color:#eec45a;display:block;margin-bottom:4px}
    .potion-result{min-height:50px;border:1px solid rgba(190,139,222,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.potion-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.potion-result[data-state='error']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.potion-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}
    .potion-stack,.potion-mini-stack{display:grid;gap:8px}.potion-stack button,.potion-mini-stack button{min-height:40px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.potion-inventory{display:grid;grid-template-columns:1fr auto;gap:7px;font-size:.75rem;color:var(--muted,#c9bfae);border-top:1px solid rgba(190,139,222,.2);padding-top:10px}.potion-inventory strong{color:var(--cream,#f4ead4)}
    .potion-panel-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}.potion-logic-block,.potion-author-block{padding:12px;margin:0 0 10px;border-radius:11px;background:rgba(48,28,62,.34);border:1px solid rgba(190,139,222,.17)}.potion-author-block h3{font-size:.84rem;margin:0 0 10px;color:#eec45a}.potion-logic-block small{display:block;color:#eec45a;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;font-weight:800;margin-bottom:7px}.potion-logic-block p{margin:0;font-size:.77rem;line-height:1.5;color:var(--cream,#f4ead4)}
    .potion-row-buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.potion-list{display:grid;gap:6px;max-height:185px;overflow:auto;padding-right:2px}.potion-list-row{display:grid;grid-template-columns:34px 1fr auto;gap:6px;align-items:center;padding:7px;border:1px solid rgba(190,139,222,.18);border-radius:9px;background:rgba(10,6,16,.44);font-size:.72rem}.potion-list-row button{min-height:26px;padding:2px 7px;border-radius:7px;background:rgba(76,29,35,.6);border:1px solid rgba(219,112,83,.45);color:#f0a088;font-size:.68rem}
    @media(max-width:1080px){.potion-workspace{grid-template-columns:1fr}.potion-view-card{min-height:560px}.potion-side-card{min-height:220px}}
  `;
  document.head.appendChild(style);
}

export function openPotionMatchWorkflow() {
  ensureMounted();
  PM.active = true;
  document.body.classList.add('is-potion-match');
  document.body.classList.remove('is-puzzle-brief', 'is-puzzle-chooser');
  PM.stage.hidden = false;
  PM.panels.hidden = false;
  showPanel('build');
  resetPotion(false);
}

export function closePotionMatchWorkflow() {
  if (!PM.mounted) return;
  PM.active = false;
  document.body.classList.remove('is-potion-match');
  PM.stage.hidden = true;
  PM.panels.hidden = true;
}

function ensureMounted() {
  if (PM.mounted) return;
  injectStyles();
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) return;

  PM.stage = document.createElement('section');
  PM.stage.id = 'potion-match-stage';
  PM.stage.className = 'potion-match-stage';
  PM.stage.hidden = true;
  PM.stage.innerHTML = `
    <div class="potion-workspace">
      <section id="potion-view-card" class="potion-view-card">
        <div class="potion-header-line">
          <div><p id="potion-mode-label" class="eyebrow">Challenge Puzzle</p><h2 id="potion-title">Potion Match</h2><p id="potion-objective-line"></p></div>
          <span id="potion-status" class="potion-status-pill">Ready</span>
        </div>
        <div id="potion-recipe-row" class="potion-recipe-row"></div>
        <div class="potion-cauldron"><div><strong id="potion-cauldron-state">Cauldron waiting</strong><span id="potion-cauldron-subtitle">Add the first ingredient.</span></div></div>
        <div id="potion-tray" class="potion-tray"></div>
      </section>
      <aside class="potion-side-card">
        <p class="eyebrow">Brew State</p><h3>Result</h3>
        <div class="potion-metric"><span>Progress</span><strong id="potion-progress">0 / 0</strong></div>
        <div class="potion-metric"><span>Mistakes</span><strong id="potion-mistakes">0 / 3</strong></div>
        <div class="potion-quality-bar"><div id="potion-quality-fill" class="potion-quality-fill"></div></div>
        <div class="potion-metric"><span>Quality</span><strong id="potion-quality">100%</strong></div>
        <div class="potion-output"><strong id="potion-output-name">Output</strong><span id="potion-output-text">Complete a recipe to create an item.</span></div>
        <div id="potion-result" class="potion-result" aria-live="polite">The brew is waiting.</div>
        <div class="potion-stack"><button id="potion-reset" type="button">Reset</button><button id="potion-answer" type="button">Show Correct Order</button><button id="potion-shuffle" type="button">Shuffle Tray</button></div>
        <h3>Demo Inventory</h3><div id="potion-inventory" class="potion-inventory"></div>
      </aside>
    </div>`;
  rightPanel.prepend(PM.stage);

  PM.panels = document.createElement('div');
  PM.panels.id = 'potion-match-panels';
  PM.panels.hidden = true;
  PM.panels.innerHTML = `
    <section class="panel tool-panel potion-panel" data-potion-panel="build">
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Potion Match</h2></div><span class="status-pill is-waiting">V3</span></div>
      <p class="potion-panel-copy">Dual mode prototype with ingredient authoring. Defaults are examples only and can be removed.</p>
      <label class="field-block"><span>Mode</span><select id="potion-mode"><option value="challenge">Challenge Potion Puzzle</option><option value="crafting">Crafting Skill</option></select></label>
      <label class="field-block"><span>Recipe Preset</span><select id="potion-recipe-select"></select></label>
      <label class="field-block"><span>Tray Mode</span><select id="potion-tray-mode"><option value="fixed">Fixed tray</option><option value="shuffle">Shuffle after each pick</option></select></label>
      <div class="potion-row-buttons"><button id="potion-reset-panel" type="button">Reset</button><button id="potion-clear-defaults" type="button">Remove Defaults</button></div>
    </section>
    <section class="panel tool-panel potion-panel" data-potion-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Background</h2></div></div>
      <label class="field-block"><span>Background PNG</span><input id="potion-bg-file" class="file-input-hidden" type="file" accept="image/*" /><button id="potion-bg-proxy" class="wide-button" type="button">Choose Background Image</button></label>
      <label class="range-row"><span>Background Opacity <output id="potion-bg-opacity-out">28%</output></span><input id="potion-bg-opacity" type="range" min="0" max="80" value="28" /></label>
      <label class="range-row"><span>Background Blur <output id="potion-bg-blur-out">0px</output></span><input id="potion-bg-blur" type="range" min="0" max="12" value="0" /></label>
    </section>
    <section class="panel tool-panel potion-panel" data-potion-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Rules + Recipe</h2></div></div>
      <div class="potion-logic-block"><small>Objective</small><p id="potion-objective-text"></p></div>
      <div class="potion-logic-block"><small>Hint</small><p id="potion-hint-text"></p></div>
      <label class="toggle-row"><span><strong>Strict Mode</strong><small>One wrong ingredient ruins the brew.</small></span><input id="potion-strict" type="checkbox" /></label>
      <label class="range-row"><span>Allowed Mistakes <output id="potion-max-mistakes-out">3</output></span><input id="potion-max-mistakes" type="range" min="1" max="5" value="3" /></label>
      <div class="potion-author-block"><h3>Recipe Order</h3><div id="potion-sequence-list" class="potion-list"></div><button id="potion-add-selected-to-sequence" class="wide-button" type="button">Add Selected Ingredient to Recipe</button></div>
      <div class="potion-author-block"><h3>Decoys / Extra Tray Items</h3><div id="potion-decoy-list" class="potion-list"></div><button id="potion-add-selected-to-decoys" class="wide-button" type="button">Add Selected Ingredient as Decoy</button></div>
    </section>
    <section class="panel tool-panel potion-panel" data-potion-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>Ingredients</h2></div></div>
      <div class="potion-author-block">
        <h3>Add / Edit Ingredient</h3>
        <label class="field-block"><span>Ingredient</span><select id="potion-icon-ingredient"></select></label>
        <label class="field-block"><span>Ingredient ID</span><input id="potion-ingredient-id" type="text" placeholder="e.g. moonflower" /></label>
        <label class="field-block"><span>Display Name</span><input id="potion-ingredient-name" type="text" placeholder="Moonflower" /></label>
        <label class="field-block"><span>Emoji Fallback</span><input id="potion-ingredient-emoji" type="text" maxlength="4" placeholder="🌙" /></label>
        <label class="field-block"><span>Source</span><select id="potion-icon-source"><option value="emoji">Emoji fallback</option><option value="png">Upload PNG</option><option value="library">Object Library item</option></select></label>
        <label class="field-block"><span>Icon PNG</span><input id="potion-icon-file" class="file-input-hidden" type="file" accept="image/*" /><button id="potion-icon-proxy" class="wide-button" type="button">Choose Icon PNG</button></label>
        <label class="field-block"><span>Object Library Item</span><select id="potion-object-library-select"></select></label>
        <label class="field-block"><span>Object Library ID</span><input id="potion-object-library-id" type="text" placeholder="e.g. capra_milk_bottle" /></label>
        <div class="potion-row-buttons"><button id="potion-add-ingredient" type="button">Add / Update Ingredient</button><button id="potion-remove-ingredient" type="button">Remove Ingredient</button></div>
      </div>
      <div class="potion-author-block"><h3>Active Ingredients</h3><div id="potion-ingredient-list" class="potion-list"></div></div>
    </section>`;
  leftBody.appendChild(PM.panels);
  bindControls();
  PM.mounted = true;
  refreshAllSelectors();
}

function bindControls() {
  $('potion-mode').addEventListener('change', (event) => { PM.mode = event.target.value; resetPotion(false); });
  $('potion-recipe-select').addEventListener('change', (event) => { PM.recipeId = event.target.value; resetPotion(false); });
  $('potion-tray-mode').addEventListener('change', (event) => { PM.trayMode = event.target.value; renderTray(); });
  $('potion-reset').addEventListener('click', () => resetPotion(false));
  $('potion-reset-panel').addEventListener('click', () => resetPotion(false));
  $('potion-answer').addEventListener('click', showCorrectOrder);
  $('potion-shuffle').addEventListener('click', () => shuffleTray(true));
  $('potion-clear-defaults').addEventListener('click', removeDefaults);
  $('potion-strict').addEventListener('change', (event) => { PM.strict = event.target.checked; resetPotion(true); });
  $('potion-max-mistakes').addEventListener('input', (event) => { PM.maxMistakes = Number(event.target.value); $('potion-max-mistakes-out').textContent = String(PM.maxMistakes); updateStatus($('potion-result').textContent, $('potion-result').dataset.state || 'waiting'); });
  $('potion-bg-proxy').addEventListener('click', () => $('potion-bg-file').click());
  $('potion-bg-file').addEventListener('change', handleBackgroundFile);
  $('potion-bg-opacity').addEventListener('input', (event) => { $('potion-view-card').style.setProperty('--potion-bg-opacity', event.target.value / 100); $('potion-bg-opacity-out').textContent = `${event.target.value}%`; });
  $('potion-bg-blur').addEventListener('input', (event) => { $('potion-view-card').style.setProperty('--potion-bg-blur', `${event.target.value}px`); $('potion-bg-blur-out').textContent = `${event.target.value}px`; });
  $('potion-icon-ingredient').addEventListener('change', loadSelectedIngredientIntoForm);
  $('potion-icon-proxy').addEventListener('click', () => $('potion-icon-file').click());
  $('potion-object-library-select').addEventListener('change', loadLibraryChoiceIntoForm);
  $('potion-add-ingredient').addEventListener('click', addOrUpdateIngredient);
  $('potion-remove-ingredient').addEventListener('click', removeSelectedIngredient);
  $('potion-add-selected-to-sequence').addEventListener('click', () => addSelectedIngredientToRecipe('sequence'));
  $('potion-add-selected-to-decoys').addEventListener('click', () => addSelectedIngredientToRecipe('decoys'));

  document.querySelector('.left-icon-bar')?.addEventListener('click', (event) => {
    if (!PM.active) return;
    const button = event.target.closest('.panel-nav-button');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showPanel(button.dataset.panel);
  }, true);
}

function refreshAllSelectors() {
  const recipeSelect = $('potion-recipe-select');
  if (recipeSelect) {
    recipeSelect.innerHTML = Object.entries(PM.recipes).map(([id, r]) => `<option value="${id}">${esc(r.title)}</option>`).join('');
    recipeSelect.value = PM.recipeId;
  }

  const ingredientOptions = Object.entries(PM.ingredients).map(([id, ing]) => `<option value="${id}">${esc(ing.name)}</option>`).join('');
  const select = $('potion-icon-ingredient');
  if (select) {
    select.innerHTML = ingredientOptions;
    if (PM.ingredients[PM.selectedIngredientId]) select.value = PM.selectedIngredientId;
  }

  const librarySelect = $('potion-object-library-select');
  if (librarySelect) {
    librarySelect.innerHTML = libraryItems().map((item) => `<option value="${esc(item.id)}" data-name="${esc(item.name)}" data-emoji="${esc(item.emoji || '◈')}">${esc(item.name)} · ${esc(item.id)}</option>`).join('');
  }

  loadSelectedIngredientIntoForm();
  renderIngredientList();
  renderRecipeAuthorLists();
}

function loadSelectedIngredientIntoForm() {
  const id = $('potion-icon-ingredient')?.value || PM.selectedIngredientId;
  PM.selectedIngredientId = id;
  const ing = ingredient(id);
  $('potion-ingredient-id').value = ing.id || id || '';
  $('potion-ingredient-name').value = ing.name || '';
  $('potion-ingredient-emoji').value = ing.emoji || '';
  $('potion-icon-source').value = ing.source === 'default' ? 'emoji' : (ing.source || 'emoji');
  $('potion-object-library-id').value = ing.libraryId || '';
}

function loadLibraryChoiceIntoForm() {
  const selected = $('potion-object-library-select')?.selectedOptions?.[0];
  if (!selected) return;
  $('potion-object-library-id').value = selected.value;
  $('potion-ingredient-id').value = slugify(selected.value);
  $('potion-ingredient-name').value = selected.dataset.name || selected.textContent || selected.value;
  $('potion-ingredient-emoji').value = selected.dataset.emoji || '◈';
  $('potion-icon-source').value = 'library';
}

function addOrUpdateIngredient() {
  const rawId = $('potion-ingredient-id').value || $('potion-ingredient-name').value;
  const id = slugify(rawId);
  const source = $('potion-icon-source').value;
  const file = $('potion-icon-file').files?.[0];

  const saveIngredient = (iconUrl = PM.ingredients[id]?.iconUrl || '') => {
    PM.ingredients[id] = { id, name: $('potion-ingredient-name').value || id, emoji: $('potion-ingredient-emoji').value || '◈', source, libraryId: source === 'library' ? ($('potion-object-library-id').value || id) : '', iconUrl: source === 'png' ? iconUrl : '' };
    PM.selectedIngredientId = id;
    if (PM.inventory[id] === undefined) PM.inventory[id] = 1;
    refreshAllSelectors();
    renderSlots();
    renderTray();
    renderInventory();
  };

  if (source === 'png' && file) {
    const reader = new FileReader();
    reader.onload = () => saveIngredient(reader.result);
    reader.readAsDataURL(file);
    return;
  }
  saveIngredient(source === 'png' ? '' : '');
}

function removeSelectedIngredient() {
  const id = $('potion-icon-ingredient').value;
  if (!id) return;
  delete PM.ingredients[id];
  delete PM.inventory[id];
  Object.values(PM.recipes).forEach((r) => { r.sequence = r.sequence.filter((itemId) => itemId !== id); r.decoys = r.decoys.filter((itemId) => itemId !== id); });
  PM.selectedIngredientId = Object.keys(PM.ingredients)[0] || '';
  refreshAllSelectors();
  resetPotion(true);
}

function removeDefaults() {
  PM.ingredients = {};
  PM.inventory = {};
  Object.values(PM.recipes).forEach((r) => { r.sequence = []; r.decoys = []; });
  PM.selectedIngredientId = '';
  refreshAllSelectors();
  resetPotion(false);
}

function addSelectedIngredientToRecipe(target) {
  const id = $('potion-icon-ingredient').value;
  if (!id || !PM.ingredients[id]) return;
  recipe()[target].push(id);
  renderRecipeAuthorLists();
  resetPotion(true);
}

function removeIngredientFromRecipe(target, index) {
  recipe()[target].splice(index, 1);
  renderRecipeAuthorLists();
  resetPotion(true);
}

function renderIngredientList() {
  const list = $('potion-ingredient-list');
  if (!list) return;
  list.innerHTML = Object.entries(PM.ingredients).map(([id, ing]) => `<div class="potion-list-row"><span>${iconHtml(id)}</span><span><strong>${esc(ing.name)}</strong><br><small>${esc(id)}${ing.libraryId ? ` · ${esc(ing.libraryId)}` : ''}</small></span><button type="button" data-select-ingredient="${esc(id)}">Edit</button></div>`).join('');
  list.querySelectorAll('[data-select-ingredient]').forEach((button) => button.addEventListener('click', () => { PM.selectedIngredientId = button.dataset.selectIngredient; $('potion-icon-ingredient').value = PM.selectedIngredientId; loadSelectedIngredientIntoForm(); }));
}

function renderRecipeAuthorLists() {
  const r = recipe();
  renderRecipeList('potion-sequence-list', r.sequence, 'sequence');
  renderRecipeList('potion-decoy-list', r.decoys, 'decoys');
}

function renderRecipeList(hostId, ids, target) {
  const host = $(hostId);
  if (!host) return;
  host.innerHTML = ids.map((id, index) => `<div class="potion-list-row"><span>${iconHtml(id)}</span><span>${esc(ingredientName(id))}</span><button type="button" data-remove-target="${target}" data-remove-index="${index}">Remove</button></div>`).join('');
  host.querySelectorAll('[data-remove-target]').forEach((button) => button.addEventListener('click', () => removeIngredientFromRecipe(button.dataset.removeTarget, Number(button.dataset.removeIndex))));
}

function resetPotion(keepTray = false) {
  const r = recipe();
  PM.index = 0;
  PM.picked = [];
  PM.mistakes = 0;
  PM.quality = 100;
  if (!keepTray) PM.shuffled = [];

  if ($('potion-mode')) $('potion-mode').value = PM.mode;
  if ($('potion-recipe-select')) $('potion-recipe-select').value = PM.recipeId;
  $('potion-mode-label').textContent = PM.mode === 'crafting' ? 'Crafting Skill' : 'Challenge Puzzle';
  $('potion-title').textContent = r.title;
  $('potion-objective-line').textContent = PM.mode === 'crafting' ? r.craftingObjective : r.challengeObjective;
  $('potion-objective-text').textContent = PM.mode === 'crafting' ? r.craftingObjective : r.challengeObjective;
  $('potion-hint-text').textContent = r.hint;
  $('potion-output-name').textContent = r.outputName;
  $('potion-output-text').textContent = `${r.outputType} · ${r.outputDescription}`;
  $('potion-cauldron-state').textContent = 'Cauldron waiting';
  $('potion-cauldron-subtitle').textContent = 'Add the first ingredient.';

  renderSlots();
  renderTray();
  renderInventory();
  renderRecipeAuthorLists();
  updateStatus('The brew is waiting for its first ingredient.', 'waiting');
}

function trayPool() {
  const r = recipe();
  let ids = [...r.sequence, ...r.decoys];
  if (PM.mode === 'crafting') ids = [...new Set([...Object.keys(PM.inventory).filter((id) => PM.inventory[id] > 0), ...r.sequence])];
  ids = ids.filter((id) => PM.ingredients[id]);
  if (PM.shuffled.length) {
    const allowed = new Set(ids);
    return PM.shuffled.filter((id) => allowed.has(id));
  }
  return ids;
}

function renderSlots() {
  const row = $('potion-recipe-row');
  row.innerHTML = '';
  const seq = recipe().sequence;
  seq.forEach((ingredientId, index) => {
    const pickedId = PM.picked[index];
    const slot = document.createElement('div');
    slot.className = `potion-slot ${pickedId ? 'is-filled' : ''} ${index === PM.index ? 'is-current' : ''}`;
    slot.innerHTML = `<span class="slot-index">${index + 1}</span><span>${pickedId ? iconHtml(pickedId) : '<span class="potion-emoji">?</span>'}<small>${pickedId ? esc(ingredientName(pickedId)) : esc(ingredientName(ingredientId))}</small></span>`;
    row.appendChild(slot);
  });
  if (!seq.length) row.innerHTML = '<div class="potion-slot"><span><span class="potion-emoji">＋</span><small>Add ingredients in Logic or Colors.</small></span></div>';
}

function renderTray() {
  const used = PM.picked.reduce((counts, id) => { counts[id] = (counts[id] || 0) + 1; return counts; }, {});
  const tray = $('potion-tray');
  tray.innerHTML = '';
  trayPool().forEach((ingredientId) => {
    const available = PM.mode === 'crafting' ? (PM.inventory[ingredientId] || 0) - (used[ingredientId] || 0) : 99;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'potion-item';
    button.disabled = available <= 0;
    button.innerHTML = `<span class="potion-count">${PM.mode === 'crafting' ? Math.max(0, available) : ''}</span>${iconHtml(ingredientId)}<small>${esc(ingredientName(ingredientId))}</small>`;
    button.addEventListener('click', () => chooseIngredient(ingredientId));
    tray.appendChild(button);
  });
  if (!tray.children.length) tray.innerHTML = '<div class="potion-item" disabled><span class="potion-emoji">＋</span><small>Add ingredients first</small></div>';
}

function chooseIngredient(ingredientId) {
  const r = recipe();
  const expected = r.sequence[PM.index];
  if (!expected) return;
  if (PM.mode === 'crafting') {
    const alreadyPicked = PM.picked.filter((id) => id === ingredientId).length;
    if ((PM.inventory[ingredientId] || 0) - alreadyPicked <= 0) return;
  }

  if (ingredientId === expected) {
    PM.picked.push(ingredientId);
    PM.index += 1;
    renderSlots();
    renderTray();
    if (PM.trayMode === 'shuffle') shuffleTray(false);

    if (PM.index >= r.sequence.length) {
      if (PM.mode === 'crafting') {
        PM.picked.forEach((id) => { PM.inventory[id] = Math.max(0, (PM.inventory[id] || 0) - 1); });
        PM.inventory[r.outputName] = (PM.inventory[r.outputName] || 0) + 1;
      }
      updateStatus(`${r.outputName} complete · Quality ${PM.quality}%`, 'success');
      $('potion-status').textContent = 'Complete';
      $('potion-cauldron-state').textContent = r.outputName;
      $('potion-cauldron-subtitle').textContent = r.outputDescription;
      renderInventory();
      renderTray();
      return;
    }

    updateStatus(`${ingredientName(ingredientId)} added. Next ingredient required.`, 'waiting');
    $('potion-cauldron-state').textContent = `${ingredientName(ingredientId)} added`;
    $('potion-cauldron-subtitle').textContent = `Next: ${ingredientName(r.sequence[PM.index])}`;
    return;
  }

  PM.mistakes += 1;
  PM.quality = Math.max(0, PM.quality - (PM.strict ? 100 : 25));
  if (PM.strict || PM.mistakes >= PM.maxMistakes || PM.quality <= 0) {
    updateStatus(`The brew curdled. ${ingredientName(ingredientId)} was not the next ingredient.`, 'error');
    $('potion-status').textContent = 'Ruined';
    $('potion-cauldron-state').textContent = 'Brew ruined';
    $('potion-cauldron-subtitle').textContent = 'Reset and try the order again.';
  } else {
    updateStatus(`${ingredientName(ingredientId)} does not answer the recipe yet. Quality reduced.`, 'warn');
    $('potion-cauldron-state').textContent = 'Brew unstable';
    $('potion-cauldron-subtitle').textContent = `${PM.maxMistakes - PM.mistakes} mistake(s) remaining.`;
  }
  renderTray();
}

function updateStatus(message, state = 'waiting') {
  const r = recipe();
  $('potion-progress').textContent = `${PM.index} / ${r.sequence.length}`;
  $('potion-mistakes').textContent = `${PM.mistakes} / ${PM.maxMistakes}`;
  $('potion-quality').textContent = `${PM.quality}%`;
  $('potion-quality-fill').style.width = `${PM.quality}%`;
  $('potion-result').textContent = message;
  $('potion-result').dataset.state = state;
  if (state !== 'success' && state !== 'error') $('potion-status').textContent = PM.index || PM.mistakes ? 'Brewing' : 'Ready';
}

function showCorrectOrder() {
  const r = recipe();
  PM.picked = [...r.sequence];
  PM.index = PM.picked.length;
  PM.quality = 100;
  renderSlots();
  renderTray();
  updateStatus(`${r.outputName} · Correct order loaded.`, 'success');
  $('potion-status').textContent = 'Complete';
  $('potion-cauldron-state').textContent = r.outputName;
  $('potion-cauldron-subtitle').textContent = 'Correct order shown for testing.';
}

function shuffleTray(render = true) {
  const ids = trayPool();
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[swap]] = [ids[swap], ids[index]];
  }
  PM.shuffled = ids;
  if (render) renderTray();
}

function renderInventory() {
  $('potion-inventory').innerHTML = Object.entries(PM.inventory)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => `<span>${esc(ingredientName(id))}</span><strong>${count}</strong>`)
    .join('');
}

function handleBackgroundFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => $('potion-view-card').style.setProperty('--potion-bg-image', `url(${reader.result})`);
  reader.readAsDataURL(file);
}

function showPanel(panelId) {
  PM.panels.querySelectorAll('[data-potion-panel]').forEach((panel) => { panel.hidden = panel.dataset.potionPanel !== panelId; panel.classList.toggle('is-active', panel.dataset.potionPanel === panelId); });
  document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId));
}

function closeOtherWorkflows() {
  window.__artifexPatternLock?.close?.();
  document.body.classList.remove('is-pattern-lock');
}

function interceptItemOrderClicks(event) {
  const button = event.target.closest("[data-engine='item-order-puzzle']");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  closeOtherWorkflows();
  document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((candidate) => { candidate.classList.toggle('is-active', candidate.dataset.engine === 'item-order-puzzle'); candidate.classList.toggle('is-selected', candidate.dataset.engine === 'item-order-puzzle'); });
  document.getElementById('puzzle-launcher-panel')?.setAttribute('hidden', '');
  document.getElementById('puzzle-module-brief-page')?.setAttribute('hidden', '');
  openPotionMatchWorkflow();
}

function bootPotionMatch() { document.addEventListener('click', interceptItemOrderClicks, true); }

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootPotionMatch, { once: true });
else bootPotionMatch();

window.__artifexPotionMatch = { open: openPotionMatchWorkflow, close: closePotionMatchWorkflow, recipes: PM.recipes, ingredients: PM.ingredients };
