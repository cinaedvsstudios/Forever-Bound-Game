(() => {
  const DEFAULT_SCENE = {
    id: "ch00_q00_forest_route",
    name: "Forest Route",
    mode: "travel",
    background: "assets/scenes/ch00/ch00_q00_forest_route_bg.png",
    backgroundScroll: false,
    playerStart: { x: 50, y: 82 },
    grid: { columns: 16, rows: 9, snap: false, show: true },
    layers: [],
    elements: [
      {
        id: "mel_start",
        type: "player_start",
        name: "Mel Start",
        image: "assets/characters/mel/mel_idle_right.png",
        x: 50,
        y: 82,
        width: 12,
        height: 42,
        layer: 10,
        visible: true
      }
    ],
    ui: []
  };

  const app = document.getElementById("editor-app");
  let scene = structuredClone(DEFAULT_SCENE);
  let selectedId = "mel_start";
  let selectedKind = "element";
  let mode = "scene";
  let drag = null;
  let panelScrollTop = 0;

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function uid(prefix) { return `${prefix}_${Math.random().toString(36).slice(2, 8)}`; }
  function getGrid() { return scene.grid || (scene.grid = { columns: 16, rows: 9, snap: false, show: true }); }
  function getElements() { return mode === "ui" ? (scene.ui || (scene.ui = [])) : (scene.elements || (scene.elements = [])); }
  function allSceneItems() { return [ ...(scene.layers || []).map(x => ({...x, kind:"layer"})), ...(scene.elements || []).map(x => ({...x, kind:"element"})) ]; }
  function selectedItem() {
    if (selectedKind === "layer") return (scene.layers || []).find(x => x.id === selectedId);
    if (mode === "ui") return (scene.ui || []).find(x => x.id === selectedId);
    return (scene.elements || []).find(x => x.id === selectedId);
  }
  function alphaLabel(index) {
    let s = ""; let n = index;
    do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; } while (n >= 0);
    return s;
  }
  function savePanelScroll() {
    const panel = document.querySelector(".side-panel");
    if (panel) panelScrollTop = panel.scrollTop;
  }
  function restorePanelScroll() {
    const panel = document.querySelector(".side-panel");
    if (panel) panel.scrollTop = panelScrollTop;
  }
  function percentFromEvent(e) {
    const stage = document.querySelector(".stage");
    const rect = stage.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100)
    };
  }
  function snapPoint(p) {
    const grid = getGrid();
    if (!grid.snap) return p;
    const cellW = 100 / grid.columns;
    const cellH = 100 / grid.rows;
    return {
      x: Math.round(p.x / cellW) * cellW,
      y: Math.round(p.y / cellH) * cellH
    };
  }
  function gridCodeToPoint(code) {
    const match = String(code || "").trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    const letters = match[1];
    const number = Number(match[2]);
    let row = 0;
    for (const ch of letters) row = row * 26 + (ch.charCodeAt(0) - 64);
    row -= 1;
    const col = number - 1;
    const grid = getGrid();
    if (row < 0 || col < 0 || row >= grid.rows || col >= grid.columns) return null;
    return { x: (col / grid.columns) * 100, y: ((row + 1) / grid.rows) * 100 };
  }
  function pointToGridCode(item) {
    const grid = getGrid();
    const col = clamp(Math.floor((item.x || 0) / (100 / grid.columns)), 0, grid.columns - 1);
    const row = clamp(Math.floor(((item.y || 0) - 0.0001) / (100 / grid.rows)), 0, grid.rows - 1);
    return `${alphaLabel(row)}${col + 1}`;
  }
  function makeButton(text, onClick, cls = "") {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    if (cls) b.className = cls;
    b.addEventListener("click", (e) => { e.preventDefault(); savePanelScroll(); onClick(); render(); restorePanelScroll(); });
    return b;
  }
  function makeInput(value, onChange, type = "text") {
    const input = document.createElement("input");
    input.type = type;
    if (type === "checkbox") input.checked = Boolean(value); else input.value = value ?? "";
    input.addEventListener("change", () => { savePanelScroll(); onChange(type === "checkbox" ? input.checked : input.value); render(); restorePanelScroll(); });
    input.addEventListener("input", () => { if (type !== "checkbox") onChange(input.value); });
    return input;
  }
  function labelled(label, child) {
    const wrap = document.createElement("div");
    const l = document.createElement("label");
    l.textContent = label;
    wrap.append(l, child);
    return wrap;
  }
  function card(title) {
    const c = document.createElement("section"); c.className = "panel-card";
    if (title) { const h = document.createElement("h2"); h.textContent = title; c.append(h); }
    return c;
  }
  function render() {
    app.innerHTML = "";
    const shell = document.createElement("div"); shell.className = "editor-shell";
    shell.append(renderSidePanel(), renderStageWrap());
    app.append(shell);
  }
  function renderSidePanel() {
    const panel = document.createElement("aside"); panel.className = "side-panel";
    const h1 = document.createElement("h1"); h1.textContent = "Forever Bound Editor";
    panel.append(h1);

    const tabs = document.createElement("div"); tabs.className = "mode-tabs";
    const sceneTab = makeButton("Scene Editor", () => { mode = "scene"; selectedKind = "element"; selectedId = (scene.elements?.[0]?.id || "mel_start"); });
    const uiTab = makeButton("UI Editor", () => { mode = "ui"; selectedKind = "ui"; if (!scene.ui) scene.ui = []; if (!scene.ui.length) scene.ui.push({ id:"ui_button_a", type:"button", name:"A Button", x:82, y:84, width:8, height:8, layer:100, visible:true }); selectedId = scene.ui[0].id; });
    if (mode === "scene") sceneTab.classList.add("active"); else uiTab.classList.add("active");
    tabs.append(sceneTab, uiTab); panel.append(tabs);

    panel.append(renderFileCard());
    if (mode === "scene") {
      panel.append(renderSceneBasics());
      panel.append(renderSceneElements());
    } else {
      panel.append(renderUiEditor());
    }
    panel.append(renderSelectedEditor());
    panel.append(renderJsonCard());
    return panel;
  }
  function renderFileCard() {
    const c = card("File / Save");
    const p = document.createElement("p");
    p.textContent = "Import a scene JSON, edit it visually, then download the edited JSON and replace the old file in GitHub.";
    const file = document.createElement("input"); file.className = "file-input"; file.type = "file"; file.accept = ".json,application/json";
    file.addEventListener("change", async () => {
      const f = file.files?.[0]; if (!f) return;
      try { scene = JSON.parse(await f.text()); normalizeScene(); selectedKind = "element"; selectedId = scene.elements?.[0]?.id || "mel_start"; render(); }
      catch (err) { alert("Could not read JSON: " + err.message); }
    });
    const row = document.createElement("div"); row.className = "button-row";
    row.append(
      makeButton("Download edited JSON", downloadJson, "primary"),
      makeButton("Reset demo", () => { scene = structuredClone(DEFAULT_SCENE); selectedId = "mel_start"; selectedKind = "element"; })
    );
    c.append(p, file, row); return c;
  }
  function renderSceneBasics() {
    const c = card("Scene Basics");
    const r1 = document.createElement("div"); r1.className = "row";
    r1.append(labelled("Scene ID", makeInput(scene.id, v => scene.id = v)), labelled("Scene name", makeInput(scene.name, v => scene.name = v)));
    const r2 = document.createElement("div"); r2.className = "row";
    r2.append(labelled("Mode", makeInput(scene.mode || "scene", v => scene.mode = v)), labelled("Background PNG path", makeInput(scene.background || "", v => scene.background = v)));
    const grid = getGrid();
    const r3 = document.createElement("div"); r3.className = "row three";
    r3.append(labelled("Grid columns", makeInput(grid.columns, v => grid.columns = Math.max(1, Number(v) || 16), "number")), labelled("Grid rows", makeInput(grid.rows, v => grid.rows = Math.max(1, Number(v) || 9), "number")), labelled("Show grid", makeInput(grid.show, v => grid.show = v, "checkbox")));
    const r4 = document.createElement("div"); r4.className = "row";
    r4.append(labelled("Snap to grid", makeInput(grid.snap, v => grid.snap = v, "checkbox")), labelled("Wide scrolling background", makeInput(scene.backgroundScroll, v => scene.backgroundScroll = v, "checkbox")));
    const help = document.createElement("p"); help.className = "help"; help.textContent = "Use smaller grid cells by increasing columns/rows, for example 32 x 18. Dragging is free unless Snap to grid is checked.";
    c.append(r1, r2, r3, r4, help); return c;
  }
  function renderSceneElements() {
    const c = card("Scene Elements / Layers");
    const help = document.createElement("p"); help.className = "help"; help.textContent = "Layer 0 is the background. Higher layer numbers appear further forward. The biggest number is foreground.";
    const row = document.createElement("div"); row.className = "button-row";
    row.append(
      makeButton("Add PNG overlay layer", () => addLayer()),
      makeButton("Add element", () => addElement()),
      makeButton("Add Mel marker", () => addMel())
    );
    const list = document.createElement("div"); list.className = "scene-list";
    allSceneItems().sort((a,b) => (a.layer||0)-(b.layer||0)).forEach(item => list.append(renderListItem(item)));
    c.append(help, row, list); return c;
  }
  function renderUiEditor() {
    const c = card("UI Editor");
    const p = document.createElement("p"); p.textContent = "This is a first layout editor for HUD/buttons. It exports UI positions into the same JSON under ui[]. It does not yet change the live game UI automatically until main.js is taught to read it.";
    const row = document.createElement("div"); row.className = "button-row";
    row.append(makeButton("Add UI button", () => addUi("button")), makeButton("Add UI panel", () => addUi("panel")), makeButton("Add UI label", () => addUi("label")));
    const list = document.createElement("div"); list.className = "scene-list";
    (scene.ui || []).sort((a,b) => (a.layer||0)-(b.layer||0)).forEach(item => list.append(renderListItem({...item, kind:"ui"})));
    c.append(p, row, list); return c;
  }
  function renderListItem(item) {
    const row = document.createElement("div"); row.className = "scene-list-item" + (selectedId === item.id ? " selected" : "");
    const vis = makeInput(item.visible !== false, v => { const real = getRealItem(item); if (real) real.visible = v; }, "checkbox");
    const name = document.createElement("div"); name.innerHTML = `<strong>${item.name || item.id}</strong><div class="mini">${item.kind || item.type} · layer ${item.layer ?? 1} · ${pointToGridCode(item)}</div>`;
    const select = makeButton("Select", () => { selectedId = item.id; selectedKind = item.kind || (mode === "ui" ? "ui" : "element"); });
    const back = makeButton("−", () => { const real = getRealItem(item); if (real) real.layer = Number(real.layer || 0) - 1; });
    const fwd = makeButton("+", () => { const real = getRealItem(item); if (real) real.layer = Number(real.layer || 0) + 1; });
    row.append(vis, name, back, fwd, select); return row;
  }
  function getRealItem(item) {
    if (item.kind === "layer") return (scene.layers || []).find(x => x.id === item.id);
    if (item.kind === "ui" || mode === "ui") return (scene.ui || []).find(x => x.id === item.id);
    return (scene.elements || []).find(x => x.id === item.id);
  }
  function renderSelectedEditor() {
    const item = selectedItem();
    const c = card("Selected Item");
    if (!item) { c.append(Object.assign(document.createElement("p"), {textContent:"Nothing selected."})); return c; }
    const r1 = document.createElement("div"); r1.className = "row";
    r1.append(labelled("ID", makeInput(item.id, v => item.id = v)), labelled("Name", makeInput(item.name || "", v => item.name = v)));
    const r2 = document.createElement("div"); r2.className = "row";
    r2.append(labelled("Type", makeInput(item.type || "", v => item.type = v)), labelled("Image / PNG path", makeInput(item.image || "", v => item.image = v)));
    const r3 = document.createElement("div"); r3.className = "row three";
    r3.append(labelled("X %", makeInput(item.x ?? 50, v => item.x = Number(v) || 0, "number")), labelled("Y % bottom", makeInput(item.y ?? 80, v => item.y = Number(v) || 0, "number")), labelled("Layer", makeInput(item.layer ?? 1, v => item.layer = Number(v) || 0, "number")));
    const r4 = document.createElement("div"); r4.className = "row three";
    r4.append(labelled("Width %", makeInput(item.width ?? 8, v => item.width = Number(v) || 1, "number")), labelled("Height %", makeInput(item.height ?? 8, v => item.height = Number(v) || 1, "number")), labelled("Visible", makeInput(item.visible !== false, v => item.visible = v, "checkbox")));
    const coord = makeInput(pointToGridCode(item), v => { const p = gridCodeToPoint(v); if (p) { item.x = p.x; item.y = p.y; } });
    const r5 = document.createElement("div"); r5.className = "row";
    r5.append(labelled("Grid coordinate", coord), labelled("Notes", makeInput(item.notes || "", v => item.notes = v)));
    const row = document.createElement("div"); row.className = "button-row";
    row.append(makeButton("Move backward", () => item.layer = Number(item.layer || 0) - 1), makeButton("Move forward", () => item.layer = Number(item.layer || 0) + 1), makeButton("Delete", () => deleteSelected(), "danger"));
    c.append(r1, r2, r3, r4, r5, row); return c;
  }
  function renderJsonCard() {
    const c = card("JSON Preview");
    const ta = document.createElement("textarea"); ta.value = JSON.stringify(scene, null, 2); ta.readOnly = true;
    c.append(ta); return c;
  }
  function renderStageWrap() {
    const wrap = document.createElement("main"); wrap.className = "stage-wrap";
    const toolbar = document.createElement("div"); toolbar.className = "stage-toolbar";
    toolbar.append(makeButton("Grid on/off", () => getGrid().show = !getGrid().show), makeButton("Snap on/off", () => getGrid().snap = !getGrid().snap), makeButton("Download JSON", downloadJson, "primary"));
    const stage = document.createElement("div"); stage.className = "stage";
    const bg = document.createElement("div"); bg.className = "stage-bg" + (scene.backgroundScroll ? " scroll-preview" : ""); bg.style.backgroundImage = scene.background ? `url('${scene.background}')` : "none";
    stage.append(bg);
    if (getGrid().show) renderGrid(stage);
    if (mode === "ui") renderSceneGhost(stage);
    else renderSceneVisuals(stage);
    wrap.append(toolbar, stage); return wrap;
  }
  function renderGrid(stage) {
    const grid = getGrid();
    for (let c = 0; c <= grid.columns; c++) {
      const line = document.createElement("div"); line.className = "grid-line" + (c % 4 === 0 ? " major" : "");
      line.style.left = `${(c / grid.columns) * 100}%`; line.style.top = "0"; line.style.width = "1px"; line.style.height = "100%"; stage.append(line);
      if (c < grid.columns) { const label = document.createElement("div"); label.className = "grid-label"; label.textContent = String(c + 1); label.style.left = `${((c + .5) / grid.columns) * 100}%`; label.style.top = "2px"; stage.append(label); }
    }
    for (let r = 0; r <= grid.rows; r++) {
      const line = document.createElement("div"); line.className = "grid-line" + (r % 3 === 0 ? " major" : "");
      line.style.left = "0"; line.style.top = `${(r / grid.rows) * 100}%`; line.style.width = "100%"; line.style.height = "1px"; stage.append(line);
      if (r < grid.rows) { const label = document.createElement("div"); label.className = "grid-label"; label.textContent = alphaLabel(r); label.style.left = "2px"; label.style.top = `${((r + .5) / grid.rows) * 100}%`; stage.append(label); }
    }
  }
  function renderSceneVisuals(stage) {
    const items = allSceneItems().filter(x => x.visible !== false).sort((a,b) => (a.layer||0)-(b.layer||0));
    for (const item of items) stage.append(renderStageItem(item));
  }
  function renderSceneGhost(stage) {
    allSceneItems().filter(x => x.visible !== false).sort((a,b) => (a.layer||0)-(b.layer||0)).forEach(x => { const el = renderStageItem(x); el.style.opacity = ".35"; stage.append(el); });
    (scene.ui || []).filter(x => x.visible !== false).sort((a,b) => (a.layer||0)-(b.layer||0)).forEach(x => stage.append(renderStageItem({...x, kind:"ui"})));
  }
  function renderStageItem(item) {
    const el = document.createElement("div");
    el.className = "stage-element" + (selectedId === item.id ? " selected" : "");
    if (item.kind === "layer") el.classList.add("stage-layer");
    el.style.left = `${item.x || 0}%`;
    el.style.bottom = `${100 - (item.y || 0)}%`;
    el.style.width = `${item.width || (item.kind === "layer" ? 100 : 8)}%`;
    el.style.height = `${item.height || (item.kind === "layer" ? 100 : 8)}%`;
    el.style.zIndex = String(10 + Number(item.layer || 0));
    el.dataset.id = item.id; el.dataset.kind = item.kind || (mode === "ui" ? "ui" : "element");
    const label = document.createElement("div"); label.className = "element-label"; label.textContent = `${item.name || item.id} · ${item.layer ?? 1}`;
    el.append(label);
    if (item.image) { const img = document.createElement("img"); img.src = item.image; img.alt = item.name || item.id; el.append(img); }
    else { el.style.background = item.kind === "ui" ? "rgba(143,66,255,.28)" : "rgba(224,141,90,.28)"; }
    el.addEventListener("pointerdown", startDrag);
    return el;
  }
  function startDrag(e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const kind = e.currentTarget.dataset.kind;
    selectedId = id; selectedKind = kind;
    const item = selectedItem(); if (!item) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = percentFromEvent(e);
    drag = { id, kind, offsetX: p.x - (item.x || 0), offsetY: p.y - (item.y || 0) };
    e.currentTarget.classList.add("dragging");
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", stopDrag, { once: true });
    render();
  }
  function onDrag(e) {
    if (!drag) return;
    const oldKind = selectedKind; const oldId = selectedId;
    selectedKind = drag.kind; selectedId = drag.id;
    const item = selectedItem();
    if (!item) { selectedKind = oldKind; selectedId = oldId; return; }
    let p = percentFromEvent(e);
    p = { x: p.x - drag.offsetX, y: p.y - drag.offsetY };
    p = snapPoint(p);
    item.x = Number(clamp(p.x, 0, 100).toFixed(2));
    item.y = Number(clamp(p.y, 0, 100).toFixed(2));
    updateStageItemOnly(item);
  }
  function stopDrag() {
    window.removeEventListener("pointermove", onDrag);
    drag = null;
    render();
  }
  function updateStageItemOnly(item) {
    const el = document.querySelector(`.stage-element[data-id="${CSS.escape(item.id)}"]`);
    if (!el) return;
    el.style.left = `${item.x || 0}%`;
    el.style.bottom = `${100 - (item.y || 0)}%`;
  }
  function addLayer() {
    scene.layers ||= [];
    const item = { id: uid("layer"), type:"overlay", name:"PNG Overlay", image:"assets/scenes/ch00/example_overlay.png", x:0, y:100, width:100, height:100, layer:5, visible:true };
    scene.layers.push(item); selectedKind = "layer"; selectedId = item.id;
  }
  function addElement() {
    scene.elements ||= [];
    const item = { id: uid("element"), type:"prop", name:"New Element", image:"", x:50, y:80, width:8, height:8, layer:10, visible:true };
    scene.elements.push(item); selectedKind = "element"; selectedId = item.id;
  }
  function addMel() {
    scene.elements ||= [];
    const item = { id: uid("mel_marker"), type:"player_start", name:"Mel Start", image:"assets/characters/mel/mel_idle_right.png", x:50, y:82, width:12, height:42, layer:10, visible:true };
    scene.elements.push(item); selectedKind = "element"; selectedId = item.id;
  }
  function addUi(type) {
    scene.ui ||= [];
    const item = { id: uid(`ui_${type}`), type, name:`UI ${type}`, x:50, y:85, width:type === "label" ? 18 : 10, height:type === "label" ? 5 : 8, layer:100, visible:true };
    scene.ui.push(item); selectedKind = "ui"; selectedId = item.id;
  }
  function deleteSelected() {
    if (!selectedId) return;
    if (!confirm("Delete selected item?")) return;
    if (selectedKind === "layer") scene.layers = (scene.layers || []).filter(x => x.id !== selectedId);
    else if (selectedKind === "ui") scene.ui = (scene.ui || []).filter(x => x.id !== selectedId);
    else scene.elements = (scene.elements || []).filter(x => x.id !== selectedId);
    selectedId = scene.elements?.[0]?.id || scene.layers?.[0]?.id || "";
    selectedKind = scene.elements?.[0] ? "element" : "layer";
  }
  function normalizeScene() {
    scene.layers ||= [];
    scene.elements ||= [];
    scene.ui ||= [];
    scene.grid ||= { columns: 16, rows: 9, snap: false, show: true };
    if (!scene.elements.find(x => x.id === "mel_start") && scene.playerStart) {
      scene.elements.unshift({ id:"mel_start", type:"player_start", name:"Mel Start", image:"assets/characters/mel/mel_idle_right.png", x:scene.playerStart.x ?? 50, y:scene.playerStart.y ?? 82, width:12, height:42, layer:10, visible:true });
    }
  }
  function downloadJson() {
    const mel = (scene.elements || []).find(x => x.type === "player_start" || x.id === "mel_start");
    if (mel) scene.playerStart = { x: mel.x, y: mel.y };
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${scene.id || "scene"}_scene.json`;
    document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }
  render();
})();
