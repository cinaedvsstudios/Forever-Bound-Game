const DEFAULT_SCENE = {
  id: "ch00_q00_forest_route",
  mode: "travel",
  locationName: "Silva Tenebrosa",
  questName: "Quest 0.0",
  callingText: "Follow the forest path",
  background: "assets/scenes/ch00/YOUR_FOREST_FILE_NAME.png",
  playerStart: { x: 78, y: 70 },
  walkableArea: { x: 0, y: 58, width: 100, height: 28 },
  objects: []
};

const app = document.querySelector("#editor-app");

if (!app) {
  throw new Error("Editor root not found.");
}

let scene = loadSavedScene() ?? clone(DEFAULT_SCENE);
let selectedId = "playerStart";
let gridVisible = true;
let uploadedBackgroundUrl = "";
let currentJsonFilename = `${scene.id ?? "scene"}.json`;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadSavedScene() {
  const saved = window.localStorage.getItem("forever-bound-scene-editor-draft");
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function saveDraft() {
  window.localStorage.setItem("forever-bound-scene-editor-draft", JSON.stringify(scene, null, 2));
}

function objectList() {
  if (Array.isArray(scene.objects)) return scene.objects;
  if (Array.isArray(scene.entities)) return scene.entities;
  scene.objects = [];
  return scene.objects;
}

function objectStoreKey() {
  return Array.isArray(scene.entities) && !Array.isArray(scene.objects) ? "entities" : "objects";
}

function setObjectList(objects) {
  scene[objectStoreKey()] = objects;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function render() {
  const objects = objectList();
  const playerStart = scene.playerStart ?? { x: 50, y: 70 };
  const walkableArea = scene.walkableArea ?? { x: 0, y: 58, width: 100, height: 28 };
  const background = uploadedBackgroundUrl || scene.background || "";

  app.innerHTML = `
    <main class="editor-shell">
      <aside class="editor-panel">
        <div class="panel-heading">
          <h1>Forever Bound Scene Editor</h1>
          <p>Local JSON editor. No GitHub token. Import JSON, drag things, then download the edited JSON and upload it back to GitHub.</p>
        </div>

        <section class="panel-section">
          <h2>Files</h2>
          <label class="file-button">
            Import scene JSON
            <input id="jsonImport" type="file" accept=".json,application/json" />
          </label>

          <label class="file-button secondary">
            Preview background image
            <input id="bgImport" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>

          <button id="downloadJson" class="editor-button">Download edited JSON</button>
          <button id="copyJson" class="editor-button secondary">Copy JSON</button>
          <button id="resetDraft" class="editor-button danger">Reset local draft</button>
        </section>

        <section class="panel-section">
          <h2>Scene Basics</h2>
          ${textInput("Scene ID", "sceneId", scene.id ?? "")}
          ${textInput("Mode", "sceneMode", scene.mode ?? "")}
          ${textInput("Location", "locationName", scene.locationName ?? "")}
          ${textInput("Quest", "questName", scene.questName ?? "")}
          ${textInput("Calling", "callingText", scene.callingText ?? "")}
          ${textInput("Background path", "backgroundPath", scene.background ?? "")}
        </section>

        <section class="panel-section">
          <h2>Selected</h2>
          <div id="selectedInfo" class="selected-info">${selectedSummary()}</div>
          <button id="selectPlayer" class="editor-button secondary">Select Mel start</button>
          <button id="selectWalkable" class="editor-button secondary">Select walkable area</button>
        </section>

        <section class="panel-section">
          <h2>Objects</h2>
          <button id="addObject" class="editor-button">Add object marker</button>
          <div class="object-list">
            ${objects.map((object) => objectRow(object)).join("") || `<p class="muted">No objects yet.</p>`}
          </div>
        </section>

        <section class="panel-section">
          <h2>View</h2>
          <button id="toggleGrid" class="editor-button secondary">${gridVisible ? "Hide grid" : "Show grid"}</button>
          <p class="muted">Positions are stored as percentages, so they survive different screen sizes.</p>
        </section>
      </aside>

      <section class="stage-wrap">
        <div class="stage-topbar">
          <strong>${scene.locationName ?? "Untitled Scene"}</strong>
          <span>${scene.questName ?? ""} — ${scene.callingText ?? ""}</span>
        </div>

        <div id="stage" class="stage ${gridVisible ? "show-grid" : ""}" style="${background ? `background-image: url('${cssUrl(background)}')` : ""}">
          <div class="walkable ${selectedId === "walkableArea" ? "selected" : ""}"
            data-id="walkableArea"
            style="left:${walkableArea.x}%; top:${walkableArea.y}%; width:${walkableArea.width}%; height:${walkableArea.height}%;"
            title="Walkable area"></div>

          <div class="marker player-marker ${selectedId === "playerStart" ? "selected" : ""}"
            data-id="playerStart"
            style="left:${playerStart.x}%; top:${playerStart.y}%;">
            Mel
          </div>

          ${objects.map((object) => `
            <div class="marker object-marker ${selectedId === object.id ? "selected" : ""}"
              data-id="${escapeHtml(object.id)}"
              style="left:${object.x}%; top:${object.y}%;">
              ${escapeHtml(object.label || object.type || object.id)}
            </div>
          `).join("")}
        </div>

        <div class="json-preview">
          <h2>Current JSON Preview</h2>
          <pre>${escapeHtml(JSON.stringify(scene, null, 2))}</pre>
        </div>
      </section>
    </main>
  `;

  bindEvents();
}

function cssUrl(value) {
  return value.replace(/\\/g, "/").replace(/'/g, "\\'");
}

function textInput(label, id, value) {
  return `
    <label class="text-field">
      <span>${label}</span>
      <input id="${id}" value="${escapeHtml(value)}" />
    </label>
  `;
}

function objectRow(object) {
  return `
    <div class="object-row ${selectedId === object.id ? "active" : ""}">
      <button class="object-select" data-select-object="${escapeHtml(object.id)}">${escapeHtml(object.label || object.id)}</button>
      <input class="object-label" data-object-label="${escapeHtml(object.id)}" value="${escapeHtml(object.label ?? "")}" placeholder="label" />
      <input class="object-type" data-object-type="${escapeHtml(object.id)}" value="${escapeHtml(object.type ?? "prop")}" placeholder="type" />
      <button class="object-delete" data-delete-object="${escapeHtml(object.id)}">×</button>
    </div>
  `;
}

function selectedSummary() {
  if (selectedId === "playerStart") {
    const p = scene.playerStart ?? { x: 50, y: 70 };
    return `Mel start: x ${p.x.toFixed(1)}%, y ${p.y.toFixed(1)}%`;
  }

  if (selectedId === "walkableArea") {
    const area = scene.walkableArea ?? { x: 0, y: 58, width: 100, height: 28 };
    return `Walkable area: x ${area.x.toFixed(1)}%, y ${area.y.toFixed(1)}%, w ${area.width.toFixed(1)}%, h ${area.height.toFixed(1)}%`;
  }

  const object = objectList().find((item) => item.id === selectedId);
  if (!object) return "Nothing selected.";

  return `${object.label || object.id}: x ${object.x.toFixed(1)}%, y ${object.y.toFixed(1)}%`;
}

function bindEvents() {
  document.querySelector("#jsonImport")?.addEventListener("change", importJson);
  document.querySelector("#bgImport")?.addEventListener("change", importBackgroundPreview);
  document.querySelector("#downloadJson")?.addEventListener("click", downloadJson);
  document.querySelector("#copyJson")?.addEventListener("click", copyJson);
  document.querySelector("#resetDraft")?.addEventListener("click", resetDraft);

  bindInput("#sceneId", (value) => {
    scene.id = value;
    currentJsonFilename = `${value || "scene"}.json`;
  });

  bindInput("#sceneMode", (value) => scene.mode = value);
  bindInput("#locationName", (value) => scene.locationName = value);
  bindInput("#questName", (value) => scene.questName = value);
  bindInput("#callingText", (value) => scene.callingText = value);
  bindInput("#backgroundPath", (value) => scene.background = value);

  document.querySelector("#selectPlayer")?.addEventListener("click", () => {
    selectedId = "playerStart";
    render();
  });

  document.querySelector("#selectWalkable")?.addEventListener("click", () => {
    selectedId = "walkableArea";
    render();
  });

  document.querySelector("#toggleGrid")?.addEventListener("click", () => {
    gridVisible = !gridVisible;
    render();
  });

  document.querySelector("#addObject")?.addEventListener("click", addObject);

  document.querySelectorAll("[data-select-object]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.selectObject ?? selectedId;
      render();
    });
  });

  document.querySelectorAll("[data-object-label]").forEach((input) => {
    input.addEventListener("input", () => {
      updateObject(input.dataset.objectLabel, { label: input.value });
    });
  });

  document.querySelectorAll("[data-object-type]").forEach((input) => {
    input.addEventListener("input", () => {
      updateObject(input.dataset.objectType, { type: input.value });
    });
  });

  document.querySelectorAll("[data-delete-object]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteObject;
      if (!id) return;

      setObjectList(objectList().filter((object) => object.id !== id));
      selectedId = "playerStart";
      saveDraft();
      render();
    });
  });

  document.querySelectorAll("[data-id]").forEach((element) => {
    element.addEventListener("pointerdown", startDrag);
  });
}

function bindInput(selector, handler) {
  const input = document.querySelector(selector);
  input?.addEventListener("input", () => {
    handler(input.value);
    saveDraft();
  });
}

function addObject() {
  const objects = objectList();
  const number = objects.length + 1;
  const id = `object_${String(number).padStart(2, "0")}`;

  objects.push({
    id,
    type: "prop",
    label: `Object ${number}`,
    x: 50,
    y: 70,
    layer: "world",
    interactive: true
  });

  setObjectList(objects);
  selectedId = id;
  saveDraft();
  render();
}

function updateObject(id, patch) {
  if (!id) return;

  const objects = objectList().map((object) => {
    if (object.id !== id) return object;
    return { ...object, ...patch };
  });

  setObjectList(objects);
  saveDraft();
}

function startDrag(event) {
  const target = event.currentTarget;
  const id = target.dataset.id;
  const stage = document.querySelector("#stage");

  if (!id || !stage) return;

  selectedId = id;
  target.setPointerCapture(event.pointerId);

  const onMove = (moveEvent) => {
    const rect = stage.getBoundingClientRect();
    const x = clamp(((moveEvent.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((moveEvent.clientY - rect.top) / rect.height) * 100, 0, 100);

    if (id === "playerStart") {
      scene.playerStart = { x: round1(x), y: round1(y) };
    } else if (id === "walkableArea") {
      const area = scene.walkableArea ?? { x: 0, y: 58, width: 100, height: 28 };
      scene.walkableArea = {
        ...area,
        x: round1(clamp(x - area.width / 2, 0, 100 - area.width)),
        y: round1(clamp(y - area.height / 2, 0, 100 - area.height))
      };
    } else {
      const objects = objectList().map((object) => {
        if (object.id !== id) return object;
        return { ...object, x: round1(x), y: round1(y) };
      });

      setObjectList(objects);
    }

    saveDraft();
    render();
  };

  const onUp = () => {
    target.removeEventListener("pointermove", onMove);
    target.removeEventListener("pointerup", onUp);
    target.removeEventListener("pointercancel", onUp);
  };

  target.addEventListener("pointermove", onMove);
  target.addEventListener("pointerup", onUp);
  target.addEventListener("pointercancel", onUp);
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function importJson(event) {
  const input = event.target;
  const file = input.files?.[0];

  if (!file) return;

  currentJsonFilename = file.name;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      scene = JSON.parse(String(reader.result));
      selectedId = "playerStart";
      saveDraft();
      render();
    } catch (error) {
      window.alert("That JSON file could not be read. Check that it is valid JSON.");
      console.error(error);
    }
  };

  reader.readAsText(file);
}

function importBackgroundPreview(event) {
  const input = event.target;
  const file = input.files?.[0];

  if (!file) return;

  uploadedBackgroundUrl = URL.createObjectURL(file);
  render();
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = currentJsonFilename || `${scene.id ?? "scene"}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

async function copyJson() {
  await navigator.clipboard.writeText(JSON.stringify(scene, null, 2));
  window.alert("JSON copied.");
}

function resetDraft() {
  const confirmed = window.confirm("Reset the local editor draft? This does not change GitHub.");
  if (!confirmed) return;

  window.localStorage.removeItem("forever-bound-scene-editor-draft");
  scene = clone(DEFAULT_SCENE);
  selectedId = "playerStart";
  uploadedBackgroundUrl = "";
  render();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
