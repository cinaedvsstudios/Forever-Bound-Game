// ../../../tmp/main_noimport.ts
var app = document.querySelector("#app");
var DEFAULT_TITLE = { id: "title_screen", screenType: "static", theme: { backgroundMode: "gradient", backgroundImage: "", backgroundGradient: "radial-gradient(circle at center, rgba(92, 32, 140, 0.45), transparent 45%), linear-gradient(135deg, #170818, #030205 65%, #1c0e08)" }, branding: { studioName: "CINAEDVS Studios", studioUrl: "https://sites.google.com/view/cinaedvs/home", studioIcon: "assets/branding/cinaedvs_studios_logo.png", mainLogo: "assets/branding/forever_bound_logo.png", fallbackTitle: "Forever Bound", logoScale: 1.5, tagline: "In a world filled with ancient magic, a love that spans centuries is bound by fate, torn by dark forces, and rekindled across lifetimes." }, buttons: [{ id: "start", label: "Start Game", action: "startGame", sound: "assets/audio/sfx/sfx_start_game_01.mp3" }, { id: "continue", label: "Continue", action: "showNotice", notice: "Continue is not connected yet.", sound: "assets/audio/sfx/sfx_ui_click_01.mp3" }, { id: "options", label: "Options", action: "showNotice", notice: "Options will be added later.", sound: "assets/audio/sfx/sfx_ui_click_01.mp3" }, { id: "credits", label: "Credits", action: "showNotice", notice: "Credits will be added later.", sound: "assets/audio/sfx/sfx_ui_click_01.mp3" }, { id: "editor", label: "Artifex Editor", action: "openEditor", sound: "assets/audio/sfx/sfx_ui_click_01.mp3" }], footer: { text: "\xA9 CINAEDVS Studios 2026", foreverBoundText: "Forever Bound website", foreverBoundUrl: "https://sites.google.com/view/foreverbound" }, audio: { music: "assets/audio/music/mus_title_theme.mp3", ambience: "", buttonPressSound: "assets/audio/sfx/sfx_ui_click_01.mp3", startSound: "assets/audio/sfx/sfx_start_game_01.mp3", musicVolume: 0.55, ambienceVolume: 0.45, sfxVolume: 0.75, loopMusic: true, loopAmbience: true } };
var DEFAULT_SETTINGS = { id: "artifex_editor_settings", version: "0.2.0", defaultScreenType: "static", defaultGridSize: 40, snapToGrid: false, showGuidesByDefault: true, showJsonPreviewByDefault: true, defaultVolumes: { music: 0.55, ambience: 0.45, sfx: 0.75 }, folders: [{ label: "Branding", path: "assets/branding/" }, { label: "Chronicle 0 Scenes", path: "assets/scenes/ch00/" }, { label: "Mel", path: "assets/characters/mel/" }, { label: "UI", path: "assets/ui/" }, { label: "Music", path: "assets/audio/music/" }, { label: "Ambience", path: "assets/audio/ambience/" }, { label: "SFX", path: "assets/audio/sfx/" }, { label: "Scene Data", path: "data/scenes/" }, { label: "Screen Data", path: "data/screens/" }, { label: "Editor Data", path: "data/editor/" }, { label: "Map Data", path: "data/map/" }] };
var titleData = DEFAULT_TITLE;
var settings = DEFAULT_SETTINGS;
var music = null;
var amb = null;
var current = structuredClone(DEFAULT_TITLE);
var mode = "static";
var selected = null;
var guides = true;
var jsonOn = true;
var previewAudio = null;
var tutorial = null;
async function loadJson(path2, fallback) {
  try {
    const r = await fetch(path2, { cache: "no-store" });
    if (!r.ok) throw new Error(r.statusText);
    return await r.json();
  } catch (e) {
    console.warn("fallback", path2, e);
    return fallback;
  }
}
function one(src, vol2 = 0.75) {
  if (!src) return;
  const a = new Audio(src);
  a.volume = vol2;
  void a.play().catch(() => {
  });
}
function loop(src, vol2, kind) {
  const old = kind === "music" ? music : amb;
  if (old) {
    old.pause();
    old.currentTime = 0;
  }
  if (!src) {
    if (kind === "music") music = null;
    else amb = null;
    return;
  }
  const a = new Audio(src);
  a.loop = true;
  a.volume = vol2;
  void a.play().catch(() => {
  });
  if (kind === "music") music = a;
  else amb = a;
}
function stopAudio() {
  [music, amb].forEach((a) => {
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  });
  music = null;
  amb = null;
}
function notice(s) {
  document.querySelector(".notice-toast")?.remove();
  const d = document.createElement("div");
  d.className = "notice-toast";
  d.textContent = s;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}
async function boot() {
  titleData = await loadJson("data/screens/title_screen.json", DEFAULT_TITLE);
  settings = await loadJson("data/editor/editor_settings.json", DEFAULT_SETTINGS);
  new URLSearchParams(location.search).has("editor") ? renderEditor(titleData) : renderTitle();
}
function renderTitle() {
  stopAudio();
  loop(titleData.audio.music, titleData.audio.musicVolume ?? 0.55, "music");
  loop(titleData.audio.ambience, titleData.audio.ambienceVolume ?? 0.45, "amb");
  app.innerHTML = `<div class="game-shell"><main class="game-frame"><section class="title-screen"><div class="title-content"><a class="studio-mark" href="${titleData.branding.studioUrl}" target="_blank"><img src="${titleData.branding.studioIcon}" onerror="this.style.display='none'"><span>${titleData.branding.studioName}</span></a><div class="logo-stack"><img class="main-logo" src="${titleData.branding.mainLogo}" alt="${titleData.branding.fallbackTitle}"><h1 class="fallback-logo">${titleData.branding.fallbackTitle}</h1><p>${titleData.branding.tagline}</p></div><div class="title-buttons"></div><footer class="title-footer"><span>${titleData.footer.text}</span><a href="${titleData.footer.foreverBoundUrl}" target="_blank">${titleData.footer.foreverBoundText}</a></footer></div></section></main></div>`;
  const scr = document.querySelector(".title-screen");
  if (titleData.theme.backgroundImage) {
    scr.classList.add("has-bg");
    scr.style.backgroundImage = `url("${titleData.theme.backgroundImage}")`;
  } else if (titleData.theme.backgroundGradient) scr.style.background = titleData.theme.backgroundGradient;
  const logo = document.querySelector(".main-logo");
  const scale = titleData.branding.logoScale ?? 1;
  logo.style.maxWidth = `min(${Math.round(64 * scale)}%, ${Math.round(820 * scale)}px)`;
  logo.style.maxHeight = `${Math.round(30 * scale)}vh`;
  logo.onerror = () => {
    logo.style.display = "none";
    document.querySelector(".fallback-logo").style.display = "block";
  };
  const btns = document.querySelector(".title-buttons");
  titleData.buttons.forEach((b) => {
    const el = document.createElement("button");
    el.className = "fb-button";
    el.textContent = b.label;
    el.onclick = () => {
      one(b.sound || titleData.audio.buttonPressSound, titleData.audio.sfxVolume ?? 0.75);
      if (b.action === "startGame") {
        one(titleData.audio.startSound, titleData.audio.sfxVolume ?? 0.75);
        renderPlay();
      } else if (b.action === "openEditor") {
        const u = new URL(location.href);
        u.searchParams.set("editor", "1");
        history.pushState({}, "", u);
        renderEditor(titleData);
      } else notice(b.notice || `${b.label} is not connected yet.`);
    };
    btns.appendChild(el);
  });
}
function renderPlay() {
  stopAudio();
  app.innerHTML = `<div class="game-shell"><main class="game-frame"><section class="play-screen"><div class="scene-background" style="background-image:url('assets/scenes/ch00/ch00_q00_forest_route_bg.png')"></div><div class="scene-vignette"></div><div class="hud"><div class="hud-panel hearts">\u2665 \u2665 \u2665 \u2665 \u2665</div><div class="hud-panel"><div class="status-title">Forest Route Test</div><div class="status-line">Calling: Walk through the forest route.</div></div><div class="hud-panel active-item"><div class="active-item-label">Active Item</div><div class="active-item-name">Empty Hands</div></div></div><div class="player" style="left:48%;top:82%;background-image:url('assets/characters/mel/mel_idle.png')"></div>${controls()}</section></main></div>`;
  move();
}
function controls() {
  return `<div class="controls"><div class="dpad"><button class="control-button dpad-up" data-key="ArrowUp">\u25B2</button><button class="control-button dpad-down" data-key="ArrowDown">\u25BC</button><button class="control-button dpad-left" data-key="ArrowLeft">\u25C0</button><button class="control-button dpad-right" data-key="ArrowRight">\u25B6</button><div class="dpad-center"></div></div><div class="center-pad"><button class="control-button">Select</button><button class="control-button">Start</button></div><div class="action-pad"><button class="control-button button-x">X</button><button class="control-button button-y">Y</button><button class="control-button button-b">B</button><button class="control-button button-a">A</button></div></div>`;
}
function move() {
  const p = document.querySelector(".player");
  let x = 48, y = 82;
  const keys = /* @__PURE__ */ new Set();
  window.onkeydown = (e) => keys.add(e.key);
  window.onkeyup = (e) => keys.delete(e.key);
  document.querySelectorAll("[data-key]").forEach((b) => {
    const k = b.dataset.key || "";
    b.onpointerdown = () => {
      keys.add(k);
      b.classList.add("is-pressed");
    };
    b.onpointerup = b.onpointerleave = () => {
      keys.delete(k);
      b.classList.remove("is-pressed");
    };
  });
  function t() {
    if (keys.has("ArrowLeft") || keys.has("a")) x -= 0.35;
    if (keys.has("ArrowRight") || keys.has("d")) x += 0.35;
    if (keys.has("ArrowUp") || keys.has("w")) y -= 0.25;
    if (keys.has("ArrowDown") || keys.has("s")) y += 0.25;
    x = Math.max(8, Math.min(92, x));
    y = Math.max(42, Math.min(92, y));
    p.style.left = x + "%";
    p.style.top = y + "%";
    requestAnimationFrame(t);
  }
  t();
}
function renderEditor(data) {
  stopAudio();
  current = structuredClone(data);
  mode = current.screenType || "static";
  guides = settings.showGuidesByDefault;
  jsonOn = settings.showJsonPreviewByDefault;
  app.innerHTML = `<div class="artifex-shell"><header class="artifex-topbar"><div class="artifex-brand">ARTIFEX</div><button class="editor-pill mode-toggle" data-mode="static">Static Screen</button><button class="editor-pill mode-toggle" data-mode="travel">Travel Mode</button><button class="editor-pill mode-toggle" data-mode="ui">UI Screen</button><button class="editor-pill mode-toggle" data-mode="scene" disabled title="Coming later. Used for towns, interiors, churches, shops, puzzle rooms, NPC spaces, and angled exploration.">Scene Mode</button><button class="editor-pill mode-toggle" data-mode="battle" disabled title="Coming later. Used for locked arenas, Bellators, Foes, combat music, and battle triggers.">Battle Mode</button><button class="editor-icon-button" id="settingsBtn">\u2699 Settings</button><button class="editor-icon-button" id="helpBtn">? Help</button><button class="editor-icon-button" id="eyeBtn">\u{1F441} Guides</button><button class="editor-icon-button" id="jsonToggleBtn">{ } JSON</button><button class="editor-icon-button" id="exportBtn">Download JSON</button><a class="editor-icon-button" href="https://github.com/cinaedvsstudios/Forever-Bound-Game" target="_blank">GitHub</a><button class="editor-icon-button" id="backToGameBtn">Back to Game</button></header><main class="artifex-main"><aside class="editor-panel left" id="leftPanel"></aside><section class="editor-stage-wrap"><div class="editor-stage" id="editorStage"><div class="editor-stage-bg" id="editorStageBg"></div><div class="editor-grid"></div></div></section><aside class="editor-panel right" id="rightPanel"></aside></main></div>`;
  document.querySelectorAll(".mode-toggle").forEach((b) => b.onclick = () => {
    if (b.disabled) return;
    mode = b.dataset.mode;
    current.screenType = mode;
    panels();
    stage();
    toggles();
  });
  document.querySelector("#settingsBtn").addEventListener("click", settingsWin);
  document.querySelector("#helpBtn").addEventListener("click", () => helpWin());
  document.querySelector("#eyeBtn").addEventListener("click", () => {
    guides = !guides;
    stage();
    toggles();
  });
  document.querySelector("#jsonToggleBtn").addEventListener("click", () => {
    jsonOn = !jsonOn;
    panels();
    toggles();
  });
  document.querySelector("#exportBtn").addEventListener("click", () => download(current, current.id === "title_screen" ? "title_screen.json" : `${current.id || "artifex_export"}.json`));
  document.querySelector("#backToGameBtn").addEventListener("click", () => {
    const u = new URL(location.href);
    u.searchParams.delete("editor");
    history.pushState({}, "", u);
    renderTitle();
  });
  panels();
  stage();
  toggles();
}
function toggles() {
  document.querySelectorAll(".mode-toggle").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
  document.querySelector("#eyeBtn")?.classList.toggle("is-active", guides);
  document.querySelector("#jsonToggleBtn")?.classList.toggle("is-active", jsonOn);
}
function panels() {
  const l = document.querySelector("#leftPanel"), r = document.querySelector("#rightPanel");
  l.innerHTML = `<div class="editor-section"><h3>Scene Basics</h3>${field("ID", "id", current.id || "")}<div class="field-group"><label>Screen Type</label><input readonly value="${label(mode)}"></div>${mode === "static" ? staticControls() : ""}${mode === "travel" ? travelControls() : ""}${mode === "ui" ? `<div class="small-text">UI Screen is for HUD, D-pad, buttons, status box, active item box, opacity, scale, mobile layout, and desktop layout. The detailed UI editor is staged for the next pass.</div>` : ""}</div><div class="editor-section"><h3>Audio</h3>${audio("Music", "music")}${audio("Ambience", "ambience")}${audio("Button Press Sound", "buttonPressSound")}${audio("Transition Sound", "transitionSound")}${audio("Start Sound", "startSound")}${audio("End Sound", "endSound")}</div><div class="editor-section"><h3>Scene Elements</h3><div class="editor-actions"><button class="editor-pill" id="addImage">Add Image</button><button class="editor-pill" id="addText">Add Text</button><button class="editor-pill" id="addButton">Add Button</button></div><div id="elementList"></div></div>`;
  r.innerHTML = `<div class="editor-section"><h3>Selected Element</h3><div id="selectedEditor"></div></div><div class="editor-section"><h3>Folder Shortcuts</h3><div class="small-text">Click a shortcut to copy its path. These come from data/editor/editor_settings.json.</div><div class="folder-suggestions">${settings.folders.map((f) => `<button class="folder-chip" data-copy="${f.path}">${f.label}: ${f.path}</button>`).join("")}</div></div><div class="editor-section ${jsonOn ? "" : "hidden"}"><h3>JSON Preview</h3><pre class="json-preview" id="jsonPreview"></pre></div>`;
  bindInputs();
  elist();
  selectedEditor();
  refresh();
}
function label(t) {
  return { static: "Static Screen", travel: "Travel Mode", ui: "UI Screen", scene: "Scene Mode", battle: "Battle Mode" }[t];
}
function field(l, k, v) {
  return `<div class="field-group"><label>${l}</label><input data-field="${k}" value="${esc(v)}"></div>`;
}
function path(l, k, v) {
  return `<div class="field-group"><label>${l}</label><input data-path="${k}" value="${esc(v)}" placeholder="assets/.../file.png"><div class="folder-suggestions">${settings.folders.map((f) => `<button class="folder-chip" data-folder-target="${k}" data-folder="${f.path}">${f.label}</button>`).join("")}</div></div>`;
}
function staticControls() {
  return `${path("Background Image URL", "staticBackground", current.theme?.backgroundImage || current.background?.image || "")}${path("Main Logo URL", "mainLogo", current.branding?.mainLogo || "")}${field("Logo Scale", "logoScale", String(current.branding?.logoScale ?? 1.5))}<div class="field-group"><label>Tagline Text</label><textarea data-field="tagline">${esc(current.branding?.tagline || "")}</textarea></div><div class="small-text">Static Screen is for title screens, map screens, credits, profile select, story cards, menus, and other fixed layouts.</div>`;
}
function travelControls() {
  return `${path("Background Image URL", "travelBackground", current.background?.image || "")}${field("Background Width", "backgroundWidth", String(current.background?.width || 3e3))}<label class="small-text"><input type="checkbox" data-bool="scrollEnabled" ${current.background?.scrollEnabled !== false ? "checked" : ""}> Scroll enabled</label><br><label class="small-text"><input type="checkbox" data-bool="loopBackground" ${current.background?.loopBackground ? "checked" : ""}> Loop background</label>${field("Player Start X", "playerStartX", String(current.player?.startX || 240))}${field("Player Start Y", "playerStartY", String(current.player?.startY || 790))}${field("Ground Line Y", "groundY", String(current.travel?.groundY || 790))}${field("Endpoint X", "endpointX", String(current.travel?.endpointX || 2820))}${field("Destination Scene", "destinationScene", String(current.travel?.destinationScene || ""))}<div class="small-text">Travel Mode is for side-scrolling routes. Use a long background plus optional foreground/parallax layers later.</div>`;
}
function audio(l, k) {
  const a = current.audio || {};
  return `<div class="field-group"><label>${l}</label><input data-audio="${k}" value="${esc(String(a[k] || ""))}" placeholder="assets/audio/.../file.mp3"><div class="audio-preview"><button class="editor-pill" data-play="${k}">Play</button><button class="editor-pill" data-stop>Stop</button><span class="audio-status" id="audio-status-${k}">No preview loaded</span></div><div class="field-group" style="margin-top:6px"><label>Volume</label><input type="range" min="0" max="1" step="0.05" data-vol="${k}" value="${vol(k)}"></div><label class="small-text"><input type="checkbox" data-loop="${k}" ${lp(k) ? "checked" : ""}> Loop preview</label></div>`;
}
function vol(k) {
  const a = current.audio || {};
  return k === "music" ? Number(a.musicVolume ?? settings.defaultVolumes.music) : k === "ambience" ? Number(a.ambienceVolume ?? settings.defaultVolumes.ambience) : Number(a.sfxVolume ?? settings.defaultVolumes.sfx);
}
function lp(k) {
  const a = current.audio || {};
  return k === "music" ? Boolean(a.loopMusic ?? true) : k === "ambience" ? Boolean(a.loopAmbience ?? true) : false;
}
function bindInputs() {
  document.querySelectorAll("[data-field]").forEach((i) => i.oninput = () => {
    const k = i.dataset.field || "";
    if (k === "id") current.id = i.value;
    if (k === "tagline") {
      current.branding = current.branding || structuredClone(DEFAULT_TITLE.branding);
      current.branding.tagline = i.value;
    }
    if (k === "logoScale") {
      current.branding = current.branding || structuredClone(DEFAULT_TITLE.branding);
      current.branding.logoScale = Number(i.value) || 1;
    }
    if (k === "backgroundWidth") {
      current.background = current.background || {};
      current.background.width = Number(i.value) || 3e3;
    }
    if (k === "playerStartX" || k === "playerStartY") {
      current.player = current.player || {};
      current.player[k === "playerStartX" ? "startX" : "startY"] = Number(i.value) || 0;
    }
    if (["groundY", "endpointX", "destinationScene"].includes(k)) {
      current.travel = current.travel || {};
      current.travel[k] = k === "destinationScene" ? i.value : Number(i.value) || 0;
    }
    stage();
    refresh();
  });
  document.querySelectorAll("[data-path]").forEach((i) => i.oninput = () => {
    const k = i.dataset.path || "";
    if (k === "staticBackground") {
      current.theme = current.theme || {};
      current.theme.backgroundImage = i.value;
      current.theme.backgroundMode = i.value ? "image" : "gradient";
    }
    if (k === "mainLogo") {
      current.branding = current.branding || structuredClone(DEFAULT_TITLE.branding);
      current.branding.mainLogo = i.value;
    }
    if (k === "travelBackground") {
      current.background = current.background || {};
      current.background.image = i.value;
    }
    stage();
    refresh();
  });
  document.querySelectorAll("[data-audio]").forEach((i) => i.oninput = () => {
    current.audio = current.audio || {};
    current.audio[i.dataset.audio] = i.value;
    refresh();
  });
  document.querySelectorAll("[data-vol]").forEach((i) => i.oninput = () => {
    current.audio = current.audio || {};
    const k = i.dataset.vol;
    if (k === "music") current.audio.musicVolume = Number(i.value);
    else if (k === "ambience") current.audio.ambienceVolume = Number(i.value);
    else current.audio.sfxVolume = Number(i.value);
    if (previewAudio) previewAudio.volume = Number(i.value);
    refresh();
  });
  document.querySelectorAll("[data-loop]").forEach((i) => i.onchange = () => {
    current.audio = current.audio || {};
    const k = i.dataset.loop;
    if (k === "music") current.audio.loopMusic = i.checked;
    else if (k === "ambience") current.audio.loopAmbience = i.checked;
    if (previewAudio) previewAudio.loop = i.checked;
    refresh();
  });
  document.querySelectorAll("[data-bool]").forEach((i) => i.onchange = () => {
    current.background = current.background || {};
    current.background[i.dataset.bool] = i.checked;
    refresh();
  });
  document.querySelectorAll("[data-play]").forEach((b) => b.onclick = () => playPreview(b.dataset.play));
  document.querySelectorAll("[data-stop]").forEach((b) => b.onclick = stopPreview);
  document.querySelectorAll("[data-folder-target]").forEach((b) => b.onclick = () => {
    const target = b.dataset.folderTarget, input = document.querySelector(`[data-path="${target}"],[data-audio="${target}"]`);
    if (input) {
      input.value = b.dataset.folder || "";
      input.dispatchEvent(new Event("input"));
      input.focus();
    }
  });
  document.querySelectorAll("[data-copy]").forEach((b) => b.onclick = async () => {
    await navigator.clipboard?.writeText(b.dataset.copy || "");
    notice(`Copied ${b.dataset.copy}`);
  });
  document.querySelector("#addImage")?.addEventListener("click", () => addEl("image"));
  document.querySelector("#addText")?.addEventListener("click", () => addEl("text"));
  document.querySelector("#addButton")?.addEventListener("click", () => addEl("button"));
}
function playPreview(k) {
  stopPreview();
  const src = String(current.audio?.[k] || ""), status = document.querySelector(`#audio-status-${k}`);
  if (!src) {
    if (status) status.textContent = "No audio path entered";
    return;
  }
  const a = new Audio(src);
  a.volume = vol(k);
  a.loop = lp(k);
  a.oncanplaythrough = () => {
    if (status) {
      status.textContent = "Audio loaded";
      status.className = "audio-status ok-text";
    }
  };
  a.onerror = () => {
    if (status) {
      status.textContent = "Audio failed";
      status.className = "audio-status error-text";
    }
  };
  previewAudio = a;
  void a.play().catch(() => {
    if (status) {
      status.textContent = "Audio failed or browser blocked playback";
      status.className = "audio-status error-text";
    }
  });
}
function stopPreview() {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio.currentTime = 0;
    previewAudio = null;
  }
}
function elements() {
  current.elements = current.elements || [];
  return current.elements;
}
function addEl(type) {
  const e = { id: `${type}_${Date.now()}`, type, label: `${type} ${elements().length + 1}`, x: 80 + elements().length * 14, y: 80 + elements().length * 14, width: type === "text" ? 260 : 160, height: type === "text" ? 60 : 120, z: elements().length + 1, image: type !== "text" ? "" : void 0, text: type === "text" ? "New text" : type === "button" ? "Button" : void 0, visible: true };
  elements().push(e);
  selected = e.id;
  panels();
  stage();
}
function elist() {
  const list = document.querySelector("#elementList");
  if (!list) return;
  list.innerHTML = elements().sort((a, b) => a.z - b.z).map((e) => `<button class="editor-pill ${selected === e.id ? "is-active" : ""}" data-select="${e.id}" style="margin-top:8px;width:100%;text-align:left">z${e.z} \xB7 ${e.label} \xB7 ${e.type}</button>`).join("");
  list.querySelectorAll("[data-select]").forEach((b) => b.onclick = () => {
    selected = b.dataset.select || null;
    panels();
    stage();
  });
}
function selectedEditor() {
  const c = document.querySelector("#selectedEditor"), e = elements().find((x) => x.id === selected);
  if (!e) {
    c.innerHTML = `<div class="small-text">Select or add an element to edit its position, size, layer, image, text, and sound.</div>`;
    return;
  }
  c.innerHTML = `${ef("Label", "label", e.label)}<div class="editor-row">${ef("X", "x", String(e.x))}${ef("Y", "y", String(e.y))}</div><div class="editor-row">${ef("Width", "width", String(e.width))}${ef("Height", "height", String(e.height))}</div>${ef("Layer / Z", "z", String(e.z))}${e.type !== "text" ? ef("Image URL", "image", e.image || "") : ""}${e.type === "text" || e.type === "button" ? ef("Text", "text", e.text || "") : ""}${ef("Sound URL", "sound", e.sound || "")}<div class="editor-actions"><button class="editor-pill" id="layerBack">Send Back</button><button class="editor-pill" id="layerForward">Bring Forward</button><button class="editor-pill" id="deleteElement">Delete</button></div>`;
  c.querySelectorAll("[data-element]").forEach((i) => i.oninput = () => {
    const k = i.dataset.element, num = ["x", "y", "width", "height", "z"].includes(k);
    e[k] = num ? Number(i.value) || 0 : i.value;
    stage();
    elist();
    refresh();
  });
  c.querySelector("#layerBack").addEventListener("click", () => {
    e.z--;
    panels();
    stage();
    refresh();
  });
  c.querySelector("#layerForward").addEventListener("click", () => {
    e.z++;
    panels();
    stage();
    refresh();
  });
  c.querySelector("#deleteElement").addEventListener("click", () => {
    current.elements = elements().filter((x) => x.id !== e.id);
    selected = null;
    panels();
    stage();
    refresh();
  });
}
function ef(l, k, v) {
  return `<div class="field-group"><label>${l}</label><input data-element="${k}" value="${esc(v)}"></div>`;
}
function stage() {
  const st = document.querySelector("#editorStage"), bg = document.querySelector("#editorStageBg");
  if (!st || !bg) return;
  st.classList.toggle("guides-hidden", !guides);
  bg.style.backgroundImage = "";
  bg.style.background = "#120b0c";
  const img = current.theme?.backgroundImage || current.background?.image || "", grad = current.theme?.backgroundGradient;
  if (img) {
    bg.style.backgroundImage = `url("${img}")`;
    bg.style.backgroundSize = "cover";
    bg.style.backgroundPosition = "center";
  } else if (grad) bg.style.background = grad;
  st.querySelectorAll(".editor-element,.editor-grid-label").forEach((n) => n.remove());
  if (guides) grid(st);
  if (mode === "static" && current.branding) {
    draw(st, { id: "virtual_main_logo", type: "image", label: "Main Logo Preview", x: 280, y: 120, width: 400 * Number(current.branding.logoScale || 1), height: 150 * Number(current.branding.logoScale || 1), z: 2, image: current.branding.mainLogo, visible: true }, true);
    draw(st, { id: "virtual_tagline", type: "text", label: "Tagline Preview", x: 185, y: 315, width: 590, height: 70, z: 3, text: current.branding.tagline, visible: true }, true);
  }
  elements().sort((a, b) => a.z - b.z).forEach((e) => draw(st, e));
}
function draw(st, e, virt = false) {
  if (e.visible === false) return;
  const n = document.createElement("div");
  n.className = `editor-element ${selected === e.id ? "selected" : ""}`;
  Object.assign(n.style, { left: e.x + "px", top: e.y + "px", width: e.width + "px", height: e.height + "px", zIndex: String(20 + e.z) });
  if ((e.type === "image" || e.type === "button" || e.type === "player") && e.image) {
    const im = document.createElement("img");
    im.src = e.image;
    im.onerror = () => {
      n.innerHTML = `<span class="error-text">Image failed<br>${esc(e.image || "")}</span>`;
    };
    n.appendChild(im);
  } else n.textContent = e.text || e.label;
  const lab = document.createElement("div");
  lab.className = "editor-element-label";
  lab.textContent = `${e.label} \xB7 z${e.z}`;
  n.appendChild(lab);
  if (!virt) {
    n.onpointerdown = (ev) => drag(ev, e, n);
    n.onclick = (ev) => {
      ev.stopPropagation();
      selected = e.id;
      panels();
      stage();
    };
  }
  st.appendChild(n);
}
function drag(ev, e, n) {
  n.setPointerCapture(ev.pointerId);
  const sx = ev.clientX, sy = ev.clientY, ox = e.x, oy = e.y;
  function mv(me) {
    const rect = n.parentElement.getBoundingClientRect(), scaleX = 960 / rect.width, scaleY = 540 / rect.height;
    e.x = Math.round(ox + (me.clientX - sx) * scaleX);
    e.y = Math.round(oy + (me.clientY - sy) * scaleY);
    n.style.left = e.x + "px";
    n.style.top = e.y + "px";
    refresh();
  }
  function up() {
    removeEventListener("pointermove", mv);
    removeEventListener("pointerup", up);
    selectedEditor();
  }
  addEventListener("pointermove", mv);
  addEventListener("pointerup", up);
}
function grid(st) {
  const s = settings.defaultGridSize || 40, letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let x = s; x < 960; x += s) {
    const d = document.createElement("div");
    d.className = "editor-grid-label";
    d.style.left = x + 3 + "px";
    d.style.top = "3px";
    d.textContent = String(Math.round(x / s));
    st.appendChild(d);
  }
  for (let y = s; y < 540; y += s) {
    const d = document.createElement("div");
    d.className = "editor-grid-label";
    d.style.left = "3px";
    d.style.top = y + 3 + "px";
    d.textContent = letters[Math.round(y / s) - 1] || "?";
    st.appendChild(d);
  }
}
function refresh() {
  const p = document.querySelector("#jsonPreview");
  if (p) p.textContent = JSON.stringify(current, null, 2);
}
function download(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
function settingsWin() {
  document.querySelector(".settings-window")?.remove();
  const w = shell("settings-window", "Artifex Settings", `<h2>Editor Settings</h2><p>These settings belong to Artifex itself. Download <strong>editor_settings.json</strong> and replace <strong>data/editor/editor_settings.json</strong> in GitHub manually.</p><h3>File Directories</h3><div id="settingsFolders"></div><div class="editor-row"><div class="field-group"><label>Folder Label</label><input id="newFolderLabel"></div><div class="field-group"><label>Folder Path</label><input id="newFolderPath" placeholder="assets/scenes/ch00/"></div></div><button class="editor-pill" id="addFolderBtn">Add Folder</button><h3>Preferences</h3><label class="small-text"><input type="checkbox" id="settingsSnap" ${settings.snapToGrid ? "checked" : ""}> Snap to grid by default</label><br><label class="small-text"><input type="checkbox" id="settingsGuides" ${settings.showGuidesByDefault ? "checked" : ""}> Show guides by default</label><br><label class="small-text"><input type="checkbox" id="settingsJson" ${settings.showJsonPreviewByDefault ? "checked" : ""}> Show JSON preview by default</label><div class="field-group"><label>Default grid size</label><input id="settingsGrid" type="number" value="${settings.defaultGridSize}"></div><button class="editor-pill" id="downloadSettingsBtn">Download editor_settings.json</button>`);
  document.body.appendChild(w);
  dragWin(w);
  folders();
  w.querySelector("#addFolderBtn").addEventListener("click", () => {
    const label2 = (w.querySelector("#newFolderLabel").value || "").trim(), path2 = (w.querySelector("#newFolderPath").value || "").trim();
    if (label2 && path2) {
      settings.folders.push({ label: label2, path: path2 });
      folders();
    }
  });
  w.querySelector("#downloadSettingsBtn").addEventListener("click", () => {
    settings.snapToGrid = w.querySelector("#settingsSnap").checked;
    settings.showGuidesByDefault = w.querySelector("#settingsGuides").checked;
    settings.showJsonPreviewByDefault = w.querySelector("#settingsJson").checked;
    settings.defaultGridSize = Number(w.querySelector("#settingsGrid").value) || 40;
    download(settings, "editor_settings.json");
  });
}
function folders() {
  const list = document.querySelector("#settingsFolders");
  if (!list) return;
  list.innerHTML = settings.folders.map((f, i) => `<div class="folder-chip"><span>${f.label}: ${f.path}</span><button class="editor-icon-button" data-rm="${i}" style="padding:2px 6px">x</button></div>`).join("");
  list.querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => {
    settings.folders.splice(Number(b.dataset.rm), 1);
    folders();
  });
}
function helpWin(section = "quick-start") {
  document.querySelector(".help-window")?.remove();
  const w = shell("help-window", "Artifex Game Editor Guide", help());
  document.body.appendChild(w);
  dragWin(w);
  w.querySelector("#startEditorTutorial")?.addEventListener("click", () => startTut("editor"));
  w.querySelector("#startTravelTutorial")?.addEventListener("click", () => startTut("travel"));
  w.querySelector("#startUiTutorial")?.addEventListener("click", () => startTut("ui"));
  w.querySelector(`#help-${section}`)?.scrollIntoView();
}
function help() {
  return `<section id="help-quick-start"><h2>Quick Start</h2><p>Artifex is the visual editor for Forever Bound. It edits JSON visually so you do not need to hand-type every coordinate. The safe workflow is: edit visually, preview, download JSON, replace the matching JSON file in GitHub, refresh and test.</p><div class="editor-actions"><button class="editor-pill" id="startEditorTutorial">Activate Editor Tutorial</button><button class="editor-pill" id="startTravelTutorial">Activate Travel Mode Tutorial</button><button class="editor-pill" id="startUiTutorial">Activate UI Editor Tutorial</button></div></section><section><h2>Screen Types</h2><p><strong>Static Screen</strong> is for title screens, map screens, credits, profile select, story cards, menus, and fixed layouts. The title screen now uses <strong>data/screens/title_screen.json</strong>.</p><p><strong>Travel Mode</strong> is for side-scrolling routes with wider backgrounds, ground line, endpoint, destination scene, and route audio.</p><p><strong>UI Screen</strong> is for HUD/buttons/controller layout. Scene Mode and Battle Mode are visible but disabled for later.</p></section><section><h2>Layers and Guides</h2><p>Layer order decides what appears in front. The background is layer 0. Higher z values appear closer to the viewer. The eye button shows/hides grid, bounding boxes, labels, interaction zones, walkable areas, camera bounds, and endpoints.</p></section><section><h2>Bounding Boxes, Collision Boxes, Interaction Zones</h2><p>A bounding box is the editor rectangle around an element. A collision box blocks or detects physical contact. An interaction zone is where B / Invoke activates something. A walkable area defines where Mel can move.</p></section><section><h2>Image and Audio Paths</h2><p>Paste image paths and the editor tries to preview them immediately. Audio fields have Play, Stop, Loop, Volume, and status. The editor stores paths only; it does not upload files.</p></section><section><h2>Editor Settings JSON</h2><p><strong>data/editor/editor_settings.json</strong> stores folder shortcuts, grid size, guide visibility, JSON preview defaults, and audio volume defaults. Edit settings, download JSON, then replace it in GitHub.</p></section><section><h2>Tutorial Mode</h2><p>Tutorials highlight one control at a time. Use Back, Next, and Quit Tutorial. This version explains controls but does not verify that every action was performed.</p></section>`;
}
function startTut(kind) {
  const map = { editor: [[".artifex-brand", "Artifex", "This editor lets you change JSON visually."], ["[data-mode='static']", "Static Screen", "Use this for title/map/menu screens."], ["[data-mode='travel']", "Travel Mode", "Use this for side-scrolling routes."], ["[data-mode='ui']", "UI Screen", "Use this for HUD and controller layout."], ["#eyeBtn", "Guides", "Show or hide grid, boxes, labels, and zones."], ["#jsonToggleBtn", "JSON Preview", "Show or hide the raw JSON."], ["#exportBtn", "Download JSON", "Export the edited JSON for manual GitHub upload."], ["#leftPanel", "Scene Controls", "Edit screen settings, audio, and elements here."], ["#editorStage", "Stage", "Drag and position things here."], ["#rightPanel", "Selected Element", "Edit selected objects and check JSON here."]], travel: [["[data-mode='travel']", "Travel Mode", "Travel Mode fields control scrolling route scenes."], ["#leftPanel", "Travel Controls", "Set background width, scroll, loop, start position, ground line, endpoint, and destination."], ["#eyeBtn", "Travel Guides", "Use guides to see route helpers."], ["#exportBtn", "Export", "Download the scene JSON."]], ui: [["[data-mode='ui']", "UI Screen", "UI mode is for buttons, HUD, status box, active item box, scale and opacity."], [".controls", "Controls", "These are the player controls."], [".hud", "HUD", "This is the gameplay HUD."], ["#exportBtn", "Export", "Download UI layout JSON when connected."]] };
  tutorial = { steps: map[kind].map((x) => ({ selector: x[0], title: x[1], text: x[2] })), index: 0 };
  showTut();
}
function showTut() {
  document.querySelectorAll(".tutorial-highlight").forEach((e) => e.classList.remove("tutorial-highlight"));
  document.querySelector(".tutorial-window")?.remove();
  if (!tutorial) return;
  const s = tutorial.steps[tutorial.index], target = document.querySelector(s.selector);
  target?.classList.add("tutorial-highlight");
  target?.scrollIntoView({ block: "center", inline: "center" });
  const w = shell("tutorial-window", `${s.title} (${tutorial.index + 1}/${tutorial.steps.length})`, `<p>${s.text}</p><div class="editor-actions"><button class="editor-pill" id="tutorialBack" ${tutorial.index === 0 ? "disabled" : ""}>Back</button><button class="editor-pill" id="tutorialNext">${tutorial.index === tutorial.steps.length - 1 ? "Finish" : "Next"}</button><button class="editor-pill" id="tutorialQuit">Quit Tutorial</button></div>`);
  document.body.appendChild(w);
  w.querySelector("#tutorialBack").addEventListener("click", () => {
    if (tutorial) {
      tutorial.index = Math.max(0, tutorial.index - 1);
      showTut();
    }
  });
  w.querySelector("#tutorialNext").addEventListener("click", () => {
    if (!tutorial) return;
    if (tutorial.index >= tutorial.steps.length - 1) endTut();
    else {
      tutorial.index++;
      showTut();
    }
  });
  w.querySelector("#tutorialQuit").addEventListener("click", endTut);
}
function endTut() {
  tutorial = null;
  document.querySelectorAll(".tutorial-highlight").forEach((e) => e.classList.remove("tutorial-highlight"));
  document.querySelector(".tutorial-window")?.remove();
}
function shell(cls, title, body) {
  const w = document.createElement("div");
  w.className = cls;
  w.innerHTML = `<div class="window-titlebar"><strong>${title}</strong><button class="editor-icon-button" data-close>x</button></div><div class="window-body">${body}</div>`;
  w.querySelector("[data-close]").addEventListener("click", () => w.remove());
  return w;
}
function dragWin(w) {
  const bar = w.querySelector(".window-titlebar");
  let sx = 0, sy = 0, ol = 0, ot = 0;
  bar.onpointerdown = (e) => {
    if (e.target.tagName === "BUTTON") return;
    sx = e.clientX;
    sy = e.clientY;
    const r = w.getBoundingClientRect();
    ol = r.left;
    ot = r.top;
    bar.setPointerCapture(e.pointerId);
    addEventListener("pointermove", mv);
    addEventListener("pointerup", up);
  };
  function mv(e) {
    w.style.left = ol + e.clientX - sx + "px";
    w.style.top = ot + e.clientY - sy + "px";
    w.style.right = "auto";
  }
  function up() {
    removeEventListener("pointermove", mv);
    removeEventListener("pointerup", up);
  }
}
function esc(v) {
  return v.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
void boot();
