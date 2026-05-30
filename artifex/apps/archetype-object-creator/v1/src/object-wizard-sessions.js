import { editorState, loadArchetype } from "./editor-state.js";

const SESSION_PREFIX = "artifex.objectCreatorWizard.";

let wizardState = null;
let renderBuildChecklist = null;

export function initObjectWizardSessions(options = {}) {
  wizardState = options.wizardState || wizardState;
  renderBuildChecklist = options.renderBuildChecklist || renderBuildChecklist;
  installWizardSessionIndicator();
}

export function autoSaveWizardSession() {
  if (wizardState?.sessionId) saveWizardSession(false);
}

export function saveWizardSession(showToast = false) {
  if (!wizardState) return;
  if (!wizardState.sessionId) wizardState.sessionId = `session_${Date.now().toString(36)}`;
  const session = {
    id: wizardState.sessionId,
    title: editorState.archetype.name || editorState.archetype.id,
    updatedAt: new Date().toISOString(),
    selectedRequirementId: wizardState.selectedRequirementId,
    archetype: editorState.archetype,
  };
  try {
    localStorage.setItem(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session));
  } catch {}
  refreshWizardSessionIndicator();
  if (showToast) {
    window.dispatchEvent(new CustomEvent("artifex:toast", { detail: { message: "Wizard saved.", type: "success" } }));
  }
}

export function deleteWizardSession(id) {
  if (id) localStorage.removeItem(`${SESSION_PREFIX}${id}`);
  refreshWizardSessionIndicator();
}

function installWizardSessionIndicator() {
  const menuBar = document.querySelector(".menu-bar");
  if (!menuBar || document.getElementById("wizard-session-wrap")) return;
  const wrap = document.createElement("div");
  wrap.id = "wizard-session-wrap";
  wrap.className = "wizard-session-wrap";
  wrap.innerHTML = `<button type="button" class="wizard-session-button" title="Open saved Quick Start wizards">🔮</button><div class="wizard-session-menu"></div>`;
  menuBar.prepend(wrap);
  wrap.querySelector(".wizard-session-button").addEventListener("click", () => {
    wrap.classList.toggle("is-open");
    renderWizardSessionMenu();
  });
  refreshWizardSessionIndicator();
}

function listWizardSessions() {
  const items = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(SESSION_PREFIX)) continue;
    try {
      items.push(JSON.parse(localStorage.getItem(key)));
    } catch {}
  }
  return items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function refreshWizardSessionIndicator() {
  const wrap = document.getElementById("wizard-session-wrap");
  if (!wrap) return;
  wrap.classList.toggle("has-sessions", listWizardSessions().length > 0);
}

function renderWizardSessionMenu() {
  const menu = document.querySelector("#wizard-session-wrap .wizard-session-menu");
  if (!menu) return;
  const sessions = listWizardSessions();
  if (!sessions.length) {
    menu.innerHTML = '<p class="hint">No saved wizards.</p>';
    return;
  }
  menu.innerHTML = "";
  sessions.forEach((session) => {
    const row = document.createElement("div");
    row.className = "wizard-session-row";
    row.innerHTML = `<button type="button" data-resume>${escapeHtml(session.title || session.id)}<small>${escapeHtml(new Date(session.updatedAt).toLocaleString())}</small></button><button type="button" data-delete>×</button>`;
    row.querySelector("[data-resume]").addEventListener("click", () => resumeWizardSession(session.id));
    row.querySelector("[data-delete]").addEventListener("click", () => {
      deleteWizardSession(session.id);
      renderWizardSessionMenu();
    });
    menu.appendChild(row);
  });
}

function resumeWizardSession(id) {
  const raw = localStorage.getItem(`${SESSION_PREFIX}${id}`);
  if (!raw || !wizardState || !renderBuildChecklist) return;
  const session = JSON.parse(raw);
  loadArchetype(session.archetype);
  wizardState.sessionId = session.id;
  wizardState.selectedRequirementId = session.selectedRequirementId || "";
  document.getElementById("wizard-session-wrap")?.classList.remove("is-open");
  const dialog = document.getElementById("quickstart-dialog");
  if (dialog && !dialog.open) dialog.showModal();
  renderBuildChecklist();
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>'"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char],
  );
}
