(() => {
  const DEFAULT_SCENE = {
    id: "ch00_q00_forest_route",
    name: "Forest Route",
    mode: "travel",
    background: "assets/scenes/ch00/ch00_q00_forest_route_bg1.png",
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
        visible: true,
        shadow: { enabled: true, opacity: 0.42, blur: 12, offsetX: 0, offsetY: 2, scaleX: 1.15, scaleY: 0.18 }
      }
    ],
    ui: []
  };

  const HELP_SECTIONS = {
    intro: {
      title: "Editor overview",
      body: "This editor lets you load a scene JSON, move scene elements visually, add overlay PNG layers, adjust Mel, edit UI marker positions, preview JSON, and download a replacement JSON file for GitHub. It does not write directly to GitHub. You download the edited JSON and upload it yourself."
    },
    file: {
      title: "File controls",
      body: "Choose JSON imports an existing scene file. Download JSON saves the edited version to your computer. Reset Demo restores the sample forest scene. Upload the downloaded JSON back into the same folder in GitHub to replace the old scene data."
    },
    view: {
      title: "View controls",
      body: "Grid shows or hides the guide grid. Snap makes moved objects jump to grid points. JSON Preview opens a live read-only view of the scene data. Wide BG preview repeats and scrolls the background so very wide route art can be tested."
    },
    scene: {
      title: "Scene controls",
      body: "Scene ID, name, mode, background path, grid size, and scrolling background belong to the whole scene. Increase grid columns and rows for smaller grid cells. A 32 x 18 grid is a good practical setting."
    },
    elements: {
      title: "Scene elements and layers",
      body: "Layers and elements are drawn by layer number. Background is layer 0. Higher numbers appear further forward. Use PNG overlay layers for background/midground/foreground images. Use elements for Mel, props, enemies, Stone Markers, pickups, and other movable things."
    },
    selected: {
      title: "Selected item controls",
      body: "The selected item section changes the object you clicked. X/Y use percentages of the scene. The grid coordinate box accepts values like A3. Width and height are also percentages. Layer controls move the item backward or forward."
    },
    shadow: {
      title: "Mel shadow controls",
      body: "The shadow settings add a soft oval shadow underneath the selected item. Opacity controls strength. Blur softens the shadow. Offset moves it. Scale X makes it wider or narrower. Scale Y makes it taller or flatter. This is mainly useful for Mel and characters."
    },
    ui: {
      title: "UI editor",
      body: "The UI editor is an early layout tool for buttons, panels, labels, HUD pieces, and controller positions. It exports positions into ui[] inside the JSON. The live game will only use these positions after main.js is updated to read them."
    },
    github: {
      title: "GitHub workflow",
      body: "Download the edited JSON, go to the matching file in GitHub, replace it, and commit. Hard refresh the browser with Ctrl+F5 after uploading so GitHub Pages does not show the old cached version."
    }
  };

  const app = document.getElementById("editor-app");
  let scene = structuredClone(DEFAULT_SCENE);
  let selectedId = "mel_start";
  let selectedKind = "element";
  let mode = "scene";
  let drag = null;
  let panelScrollTop = 0;
  let showJsonPreview = false;
  let helpOpen = false;
  let helpSection = "intro";

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function uid(prefix) { return `${prefix}_${Math.random().toString(36).slice(2, 8)}`; }
  function getGrid() { return scene.grid || (scene.grid = { columns: 16, rows: 9, snap: false, show: true }); }
  function getElements() { return mode === "ui" ? (scene.ui || (scene.ui = [])) : (scene.elements || (scene.elements = [])); }
  function allSceneItems() { return [ ...(scene.layers || []).map(x => ({...x, kind:"layer"})), ...(scene.elements || []).map(x => ({...x, kind:"element"})) ]; }
  function selectedItem() {
    if (selectedKind === "layer") return (scene.layers || []).find(x => x.id === selectedId);
    if (selectedKind === "ui") return (scene.ui || []).find(x => x.id === selectedId);
    return (scene.elements || []).find(x => x.id === selectedId);
  }
  function getRealItem(item) {
    if (item.kind === "layer") return (scene.layers || []).find(x => x.id === item.id);
    if (item.kind === "ui" || selectedKind === "ui") return (scene.ui || []).find(x => x.id === item.id);
    return (scene.elements || []).find(x => x.id === item.id);
  }
  function alphaLabel(index) {
    let s = ""; let n = index;
    do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; } while (n >= 0);
    return s;
  }
  function savePanelScroll() { const panel = document.querySelector(".side-panel"); if (panel) panelScrollTop = panel.scrollTop; }
  function restorePanelScroll() { const panel = document.querySelector(".side-panel"); if (panel) panel.scrollTop = panelScrollTop; }
  function openHelp(section = "intro") { helpOpen = true; helpSection = section; render(); setTimeout(() => document.getElementById(`help-${section}`)?.scrollIntoView({ block: "start" }), 0); }
  function setHelpSection(section) { helpSection = section; if (helpOpen) setTimeout(() => document.getElementById(`help-${section}`)?.scrollIntoView({ block: "start", behavior: "smooth" }), 0); }

  function percentFromEvent(e) {
    const stage = document.querySelector(".stage");
    const rect = stage.getBoundingClientRect();
    return { x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100), y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100) };
  }
  function snapPoint(p) {
    const grid = getGrid();
    if (!grid.snap) return p;
    const cellW = 100 / grid.columns;
    const cellH = 100 / grid.rows;
    return { x: Math.round(p.x / cellW) * cellW, y: Math.round(p.y / cellH) * cellH };
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

  function makeButton(text, onClick, cls = "", title = "") {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    if (cls) b.className = cls;
    if (title) b.title = title;
    b.addEventListener("click", (e) => { e.preventDefault(); savePanelScroll(); onClick(); render(); restorePanelScroll(); });
    return b;
  }
  function makeInput(value, onChange, type = "text", title = "") {
    const input = document.createElement("input");
    input.type = type;
    if (title) input.title = title;
    if (type === "checkbox") input.checked = Boolean(value); else input.value = value ?? "";
    input.addEventListener("change", () => { savePanelScroll(); onChange(type === "checkbox" ? input.checked : input.value); render(); restorePanelScroll(); });
    input.addEventListener("input", () => { if (type !== "checkbox") onChange(input.value); });
    return input;
  }
  function labelled(label, child, title = "") {
    const wrap = document.createElement("div");
    if (title) wrap.title = title;
    const l = document.createElement("label");
    l.textContent = label;
    wrap.append(l, child);
    return wrap;
  }
  function card(title, helpKey = "") {
    const c = document.createElement("section"); c.className = "panel-card";
    if (title) {
      const row = document.createElement("div"); row.className = "card-title-row";
      const h = document.createElement("h2"); h.textContent = title;
      row.append(h);
      if (helpKey) row.append(makeButton("?", () => openHelp(helpKey), "help-dot", `Open help for ${title}`));
      c.append(row);
    }
    return c;
  }

  function render() {
    app.innerHTML = "";
    const shell = document.createElement("div"); shell.className = "editor-shell";
    shell.append(renderTopBar(), renderSidePanel(), renderStageWrap());
    app.append(shell);
    if (helpOpen) app.append(renderHelpModal());
  }

  function renderTopBar() {
    const bar = document.createElement("header"); bar.className = "top-bar";
    const title = document.createElement("div"); title.className = "top-title"; title.textContent = "Forever Bound Editor";

    const fileGroup = document.createElement("div"); fileGroup.className = "top-group";
    const fileLabel = document.createElement("label"); fileLabel.className = "top-file"; fileLabel.title = "Import a scene JSON file from your computer.";
    fileLabel.textContent = "Choose JSON";
    const file = document.createElement("input"); file.type = "file"; file.accept = ".json,application/json";
    file.addEventListener("change", async () => {
      const f = file.files?.[0]; if (!f) return;
      try { scene = JSON.parse(await f.text()); normalizeScene(); selectedKind = "element"; selectedId = scene.elements?.[0]?.id || "mel_start"; render(); }
      catch (err) { alert("Could not read JSON: " + err.message); }
    });
    fileLabel.append(file);
    fileGroup.append(fileLabel, makeButton("Download JSON", downloadJson, "primary", "Download the edited scene JSON."), makeButton("Reset Demo", () => { scene = structuredClone(DEFAULT_SCENE); selectedKind = "element"; selectedId = "mel_start"; }, "", "Restore the sample forest scene."));

    const viewGroup = document.createElement("div"); viewGroup.className = "top-group";
    viewGroup.append(
      toggleButton("Grid", getGrid().show, () => getGrid().show = !getGrid().show, "Show or hide the grid overlay."),
      toggleButton("Snap", getGrid().snap, () => getGrid().snap = !getGrid().snap, "Snap movement to the grid."),
      toggleButton("JSON Preview", showJsonPreview, () => showJsonPreview = !showJsonPreview, "Show or hide the JSON preview panel."),
      toggleButton("Wide BG", scene.backgroundScroll, () => scene.backgroundScroll = !scene.backgroundScroll, "Preview wide scrolling background repetition.")
    );

    const links = document.createElement("div"); links.className = "top-group";
    const github = document.createElement("a"); github.className = "top-link"; github.textContent = "GitHub"; github.href = "https://github.com/cinaedvsstudios/Forever-Bound-Game"; github.target = "_blank"; github.rel = "noopener noreferrer"; github.title = "Open the GitHub repository.";
    links.append(makeButton("?", () => openHelp("intro"), "help-main", "Open editor help."), github);

    bar.append(title, fileGroup, viewGroup, links);
    return bar;
  }

  function toggleButton(text, active, onClick, title) {
    return makeButton(text, onClick, active ? "toggle active" : "toggle", title);
  }

  function renderSidePanel() {
    const panel = document.createElement("aside"); panel.className = "side-panel";
    const tabs = document.createElement("div"); tabs.className = "mode-tabs";
    const sceneTab = makeButton("Scene Editor", () => { mode = "scene"; selectedKind = "element"; selectedId = (scene.elements?.[0]?.id || "mel_start"); setHelpSection("scene"); }, mode === "scene" ? "active" : "", "Edit backgrounds, layers, Mel, props, enemies, and scene objects.");
    const uiTab = makeButton("UI Editor", () => { mode = "ui"; selectedKind = "ui"; if (!scene.ui) scene.ui = []; if (!scene.ui.length) scene.ui.push({ id:"ui_button_a", type:"button", name:"A Button", x:82, y:84, width:8, height:8, layer:100, visible:true }); selectedId = scene.ui[0].id; setHelpSection("ui"); }, mode === "ui" ? "active" : "", "Edit exported UI layout markers.");
    tabs.append(sceneTab, uiTab); panel.append(tabs);

    if (mode === "scene") {
      panel.append(renderSceneBasics());
      panel.append(renderSceneElements());
    } else {
      panel.append(renderUiEditor());
    }
    panel.append(renderSelectedEditor());
    if (showJsonPreview) panel.append(renderJsonCard());
    return panel;
  }

  function renderSceneBasics() {
    const c = card("Scene Controls", "scene");
    const r1 = document.createElement("div"); r1.className = "row";
    r1.append(labelled("Scene ID", makeInput(scene.id, v => scene.id = v), "Unique technical scene name."), labelled("Scene name", makeInput(scene.name, v => scene.name = v), "Readable display name."));
    const r2 = document.createElement("div"); r2.className = "row";
    r2.append(labelled("Mode", makeInput(scene.mode || "scene", v => scene.mode = v), "travel, scene, battle, map, etc."), labelled("Background PNG path", makeInput(scene.background || "", v => scene.background = v), "Path to the background image used by this scene."));
    const grid = getGrid();
    const r3 = document.createElement("div"); r3.className = "row three";
    r3.append(labelled("Grid columns", makeInput(grid.columns, v => grid.columns = Math.max(1, Number(v) || 16), "number")), labelled("Grid rows", makeInput(grid.rows, v => grid.rows = Math.max(1, Number(v) || 9), "number")), labelled("Show grid", makeInput(grid.show, v => grid.show = v, "checkbox")));
    const r4 = document.createElement("div"); r4.className = "row";
    r4.append(labelled("Snap to grid", makeInput(grid.snap, v => grid.snap = v, "checkbox")), labelled("Wide scrolling background", makeInput(scene.backgroundScroll, v => scene.backgroundScroll = v, "checkbox")));
    const help = document.createElement("p"); help.className = "help"; help.textContent = "Use smaller grid cells by increasing columns/rows. Try 32 x 18 or 48 x 27 if 16 x 9 feels too chunky.";
    c.append(r1, r2, r3, r4, help); return c;
  }

  function renderSceneElements() {
    const c = card("Scene Elements", "elements");
    const help = document.createElement("p"); help.className = "help"; help.textContent = "Layer 0 is the background. Higher layer numbers appear further forward.";
    const row = document.createElement("div"); row.className = "button-row";
    row.append(makeButton("Add PNG overlay layer", () => addLayer(), "", "Add a transparent PNG layer for midground/foreground art."), makeButton("Add element", () => addElement(), "", "Add a prop/enemy/pickup placeholder."), makeButton("Add Mel marker", () => addMel(), "", "Add another Mel/player start marker."));
    const list = document.createElement("div"); list.className = "scene-list";
    allSceneItems().sort((a,b) => (a.layer||0)-(b.layer||0)).forEach(item => list.append(renderListItem(item)));
    c.append(help, row, list); return c;
  }

  function renderUiEditor() {
    const c = card("UI Editor", "ui");
    const p = document.createElement("p"); p.textContent = "This exports UI positions into ui[] in the scene JSON. The live game will use them after main.js is updated to read those values.";
    const row = document.createElement("div"); row.className = "button-row";
    row.append(makeButton("Add UI button", () => addUi("button")), makeButton("Add UI panel", () => addUi("panel")), makeButton("Add UI label", () => addUi("label")));
    const list = document.createElement("div"); list.className = "scene-list";
    (scene.ui || []).sort((a,b) => (a.layer||0)-(b.layer||0)).forEach(item => list.append(renderListItem({...item, kind:"ui"})));
    c.append(p, row, list); return c;
  }

  function renderListItem(item) {
    const row = document.createElement("div"); row.className = "scene-list-item" + (selectedId === item.id ? " selected" : "");
    const vis = makeInput(item.visible !== false, v => { const real = getRealItem(item); if (real) real.visible = v; }, "checkbox", "Show or hide this item.");
    const name = document.createElement("div"); name.innerHTML = `<strong>${item.name || item.id}</strong><div class="mini">${item.kind || item.type} · layer ${item.layer ?? 1} · ${pointToGridCode(item)}</div>`;
    const select = makeButton("Select", () => { selectedId = item.id; selectedKind = item.kind || (mode === "ui" ? "ui" : "element"); setHelpSection(item.kind === "ui" ? "ui" : "selected"); }, "", "Select this item for editing.");
    const back = makeButton("−", () => { const real = getRealItem(item); if (real) real.layer = Number(real.layer || 0) - 1; }, "", "Move backward one layer.");
    const fwd = makeButton("+", () => { const real = getRealItem(item); if (real) real.layer = Number(real.layer || 0) + 1; }, "", "Move forward one layer.");
    row.append(vis, name, back, fwd, select); return row;
  }

  function renderSelectedEditor() {
    const item = selectedItem();
    const c = card("Selected Item", "selected");
    if (!item) { c.append(Object.assign(document.createElement("p"), {textContent:"Nothing selected."})); return c; }
    const r1 = document.createElement("div"); r1.className = "row";
    r1.append(labelled("ID", makeInput(item.id, v => item.id = v)), labelled("Name", makeInput(item.name || "", v => item.name = v)));
    const r2 = document.createElement("div"); r2.className = "row";
    r2.append(labelled("Type", makeInput(item.type || "", v => item.type = v)), labelled("Image / PNG path", makeInput(item.image || "", v => item.image = v)));
    const r3 = document.createElement("div"); r3.className = "row three";
    r3.append(labelled("X %", makeInput(item.x ?? 50, v => item.x = Number(v) || 0, "number")), labelled("Y % bottom", makeInput(item.y ?? 80, v => item.y = Number(v) || 0, "number")), labelled("Layer", makeInput(item.layer ?? 1, v => item.layer = Number(v) || 0, "number")));
    const r4 = document.createElement("div"); r4.className = "row three";
    r4.append(labelled("Width %", makeInput(item.width ?? 8, v => item.width = Number(v) || 1, "number")), labelled("Height %", makeInput(item.height ?? 8, v => item.height = Number(v) || 1, "number")), labelled("Visible", makeInput(item.visible !== false, v => item.visible = v, "checkbox")));
    const coord = makeInput(pointToGridCode(item), v => { const p = gridCodeToPoint(v); if (p) { item.x = Number(p.x.toFixed(2)); item.y = Number(p.y.toFixed(2)); } });
    const r5 = document.createElement("div"); r5.className = "row";
    r5.append(labelled("Grid coordinate", coord, "Example: A3 places the bottom-left corner in that grid cell."), labelled("Notes", makeInput(item.notes || "", v => item.notes = v)));
    const row = document.createElement("div"); row.className = "button-row";
    row.append(makeButton("Move backward", () => item.layer = Number(item.layer || 0) - 1), makeButton("Move forward", () => item.layer = Number(item.layer || 0) + 1), makeButton("Delete", () => deleteSelected(), "danger"));
    c.append(r1, r2, r3, r4, r5, renderShadowControls(item), row); return c;
  }

  function renderShadowControls(item) {
    item.shadow ||= { enabled: false, opacity: 0.35, blur: 10, offsetX: 0, offsetY: 2, scaleX: 1, scaleY: 0.18 };
    const wrap = document.createElement("section"); wrap.className = "sub-card";
    const top = document.createElement("div"); top.className = "card-title-row compact";
    const h = document.createElement("h3"); h.textContent = "Shadow";
    top.append(h, makeButton("?", () => openHelp("shadow"), "help-dot"));
    const r1 = document.createElement("div"); r1.className = "row three";
    r1.append(labelled("Enabled", makeInput(item.shadow.enabled, v => item.shadow.enabled = v, "checkbox")), labelled("Opacity", makeInput(item.shadow.opacity, v => item.shadow.opacity = Number(v) || 0, "number")), labelled("Blur px", makeInput(item.shadow.blur, v => item.shadow.blur = Number(v) || 0, "number")));
    const r2 = document.createElement("div"); r2.className = "row";
    r2.append(labelled("Offset X %", makeInput(item.shadow.offsetX, v => item.shadow.offsetX = Number(v) || 0, "number")), labelled("Offset Y %", makeInput(item.shadow.offsetY, v => item.shadow.offsetY = Number(v) || 0, "number")));
    const r3 = document.createElement("div"); r3.className = "row";
    r3.append(labelled("Scale X", makeInput(item.shadow.scaleX, v => item.shadow.scaleX = Number(v) || 1, "number")), labelled("Scale Y", makeInput(item.shadow.scaleY, v => item.shadow.scaleY = Number(v) || 0.18, "number")));
    wrap.append(top, r1, r2, r3);
    return wrap;
  }

  function renderJsonCard() {
    const c = card("JSON Preview", "view");
    const ta = document.createElement("textarea"); ta.value = JSON.stringify(scene, null, 2); ta.readOnly = true;
    c.append(ta); return c;
  }

  function renderStageWrap() {
    const wrap = document.createElement("main"); wrap.className = "stage-wrap";
    const stage = document.createElement("div"); stage.className = "stage";
    const bg = document.createElement("div"); bg.className = "stage-bg" + (scene.backgroundScroll ? " scroll-preview" : ""); bg.style.backgroundImage = scene.background ? `url('${scene.background}')` : "none";
    stage.append(bg);
    if (getGrid().show) renderGrid(stage);
    if (mode === "ui") renderSceneGhost(stage); else renderSceneVisuals(stage);
    wrap.append(stage); return wrap;
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
  function renderSceneVisuals(stage) { allSceneItems().filter(x => x.visible !== false).sort((a,b) => (a.layer||0)-(b.layer||0)).forEach(item => stage.append(renderStageItem(item))); }
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
    if (item.shadow?.enabled) {
      const sh = document.createElement("div"); sh.className = "element-shadow";
      sh.style.opacity = String(item.shadow.opacity ?? 0.35);
      sh.style.filter = `blur(${item.shadow.blur ?? 10}px)`;
      sh.style.left = `${50 + Number(item.shadow.offsetX || 0)}%`;
      sh.style.bottom = `${Number(item.shadow.offsetY || 0)}%`;
      sh.style.transform = `translateX(-50%) scale(${item.shadow.scaleX ?? 1}, ${item.shadow.scaleY ?? 0.18})`;
      el.append(sh);
    }
    if (item.image) { const img = document.createElement("img"); img.src = item.image; img.alt = item.name || item.id; el.append(img); }
    else { el.style.background = item.kind === "ui" ? "rgba(143,66,255,.28)" : "rgba(224,141,90,.28)"; }
    el.addEventListener("pointerdown", startDrag);
    return el;
  }
  function startDrag(e) {
    e.preventDefault();
    selectedId = e.currentTarget.dataset.id;
    selectedKind = e.currentTarget.dataset.kind;
    setHelpSection(selectedKind === "ui" ? "ui" : "selected");
    const item = selectedItem(); if (!item) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = percentFromEvent(e);
    drag = { id: selectedId, kind: selectedKind, offsetX: p.x - (item.x || 0), offsetY: p.y - (item.y || 0) };
    e.currentTarget.classList.add("dragging");
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", stopDrag, { once: true });
    render();
  }
  function onDrag(e) {
    if (!drag) return;
    selectedKind = drag.kind; selectedId = drag.id;
    const item = selectedItem(); if (!item) return;
    let p = percentFromEvent(e);
    p = { x: p.x - drag.offsetX, y: p.y - drag.offsetY };
    p = snapPoint(p);
    item.x = Number(clamp(p.x, 0, 100).toFixed(2));
    item.y = Number(clamp(p.y, 0, 100).toFixed(2));
    updateStageItemOnly(item);
  }
  function stopDrag() { window.removeEventListener("pointermove", onDrag); drag = null; render(); }
  function updateStageItemOnly(item) {
    const el = document.querySelector(`.stage-element[data-id="${CSS.escape(item.id)}"]`); if (!el) return;
    el.style.left = `${item.x || 0}%`; el.style.bottom = `${100 - (item.y || 0)}%`;
  }

  function addLayer() { scene.layers ||= []; const item = { id: uid("layer"), type:"overlay", name:"PNG Overlay", image:"assets/scenes/ch00/example_overlay.png", x:0, y:100, width:100, height:100, layer:5, visible:true }; scene.layers.push(item); selectedKind = "layer"; selectedId = item.id; setHelpSection("elements"); }
  function addElement() { scene.elements ||= []; const item = { id: uid("element"), type:"prop", name:"New Element", image:"", x:50, y:80, width:8, height:8, layer:10, visible:true }; scene.elements.push(item); selectedKind = "element"; selectedId = item.id; setHelpSection("selected"); }
  function addMel() { scene.elements ||= []; const item = { id: uid("mel_marker"), type:"player_start", name:"Mel Start", image:"assets/characters/mel/mel_idle_right.png", x:50, y:82, width:12, height:42, layer:10, visible:true, shadow:{ enabled:true, opacity:0.42, blur:12, offsetX:0, offsetY:2, scaleX:1.15, scaleY:0.18 } }; scene.elements.push(item); selectedKind = "element"; selectedId = item.id; setHelpSection("selected"); }
  function addUi(type) { scene.ui ||= []; const item = { id: uid(`ui_${type}`), type, name:`UI ${type}`, x:50, y:85, width:type === "label" ? 18 : 10, height:type === "label" ? 5 : 8, layer:100, visible:true }; scene.ui.push(item); selectedKind = "ui"; selectedId = item.id; setHelpSection("ui"); }
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
      scene.elements.unshift({ id:"mel_start", type:"player_start", name:"Mel Start", image:"assets/characters/mel/mel_idle_right.png", x:scene.playerStart.x ?? 50, y:scene.playerStart.y ?? 82, width:12, height:42, layer:10, visible:true, shadow:{ enabled:true, opacity:0.42, blur:12, offsetX:0, offsetY:2, scaleX:1.15, scaleY:0.18 } });
    }
  }
  function downloadJson() {
    const mel = (scene.elements || []).find(x => x.type === "player_start" || x.id === "mel_start");
    if (mel) scene.playerStart = { x: mel.x, y: mel.y };
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${scene.id || "scene"}_scene.json`; document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }

  function renderHelpModal() {
    const overlay = document.createElement("div"); overlay.className = "help-overlay";
    const modal = document.createElement("section"); modal.className = "help-modal";
    const header = document.createElement("div"); header.className = "help-header";
    const h = document.createElement("h2"); h.textContent = "Forever Bound Editor Guide";
    const close = makeButton("×", () => { helpOpen = false; }, "help-close", "Close help.");
    header.append(h, close);
    const nav = document.createElement("div"); nav.className = "help-nav";
    for (const [key, sec] of Object.entries(HELP_SECTIONS)) nav.append(makeButton(sec.title, () => { helpSection = key; }, key === helpSection ? "active" : ""));
    const body = document.createElement("div"); body.className = "help-body";
    for (const [key, sec] of Object.entries(HELP_SECTIONS)) {
      const block = document.createElement("section"); block.id = `help-${key}`; block.className = "help-block" + (key === helpSection ? " current" : "");
      const title = document.createElement("h3"); title.textContent = sec.title;
      const text = document.createElement("p"); text.textContent = sec.body;
      block.append(title, text); body.append(block);
    }
    modal.append(header, nav, body); overlay.append(modal); return overlay;
  }

  render();
})();
