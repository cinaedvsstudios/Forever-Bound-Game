import { DESIGN_WIDTH, DESIGN_HEIGHT, MODULE_KIND, MODULE_VERSION, MODULE_ACCENTS, WORKFLOW_STATES } from './module-config.js';

export const moduleState = {
  document: createEmptyDocument(),
  activeAssignmentIndex: -1,
  activeWorkflowFilter: 'undone',
  todoSort: 'easy-wins',
  showGrid: true,
  showHelpers: true,
  workspaceMode: 'dark',
  zoom: 1
};

export function createEmptyDocument() {
  const now = new Date().toISOString();

  return {
    id: `creation_${cryptoRandom()}`,
    name: 'Artifex Adventure Creation Guide',
    moduleKind: MODULE_KIND,
    version: MODULE_VERSION,
    designWidth: DESIGN_WIDTH,
    designHeight: DESIGN_HEIGHT,
    createdAt: now,
    updatedAt: now,
    setup: {
      gameTitle: 'Untitled Artifex Adventure',
      creatorName: '',
      projectFolder: '',
      startingCharacter: 'Mel',
      buildTarget: 'Chronicle 0'
    },
    assignments: [],
    milestones: [],
    notes: '',
    projectTree: []
  };
}

export function createAssignment(patch = {}) {
  const moduleKey = patch.primaryModule || 'unassigned';
  const accent = MODULE_ACCENTS[moduleKey] || MODULE_ACCENTS.unassigned;
  const now = new Date().toISOString();

  return normalizeAssignment({
    id: `assignment_${cryptoRandom()}`,
    title: 'New Assignment',
    icon: accent.icon,
    description: '',
    state: 'unassigned',
    owner: '',
    primaryModule: moduleKey,
    relatedModules: [],
    priorityDefault: 3,
    priorityOverride: null,
    effortDefault: 3,
    effortOverride: null,
    milestoneId: '',
    chronicleId: '',
    questId: '',
    callingId: '',
    zoneId: '',
    sceneId: '',
    screenId: '',
    linkedFile: '',
    linkedAssets: [],
    tags: [],
    subtasks: [],
    blockers: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
    lastTouchedAt: now,
    archived: false,
    ...patch
  });
}

export function createSubtask(text = 'New subtask', patch = {}) {
  return {
    id: `subtask_${cryptoRandom()}`,
    text: stringOr(text, 'New subtask'),
    status: patch.status || 'open',
    required: patch.required !== false,
    notes: patch.notes || ''
  };
}

export function normalizeDocument(input = {}) {
  const base = createEmptyDocument();
  const assignments = Array.isArray(input.assignments) ? input.assignments : input.records || [];

  return {
    ...base,
    ...input,
    setup: {
      ...base.setup,
      ...(isPlainObject(input.setup) ? input.setup : {})
    },
    designWidth: finiteNumber(input.designWidth, DESIGN_WIDTH),
    designHeight: finiteNumber(input.designHeight, DESIGN_HEIGHT),
    assignments: assignments.map(normalizeAssignment),
    milestones: Array.isArray(input.milestones) ? input.milestones : [],
    projectTree: Array.isArray(input.projectTree) ? input.projectTree : []
  };
}

export function normalizeAssignment(input = {}) {
  const moduleKey = MODULE_ACCENTS[input.primaryModule] ? input.primaryModule : 'unassigned';
  const accent = MODULE_ACCENTS[moduleKey] || MODULE_ACCENTS.unassigned;

  return {
    id: input.id || `assignment_${cryptoRandom()}`,
    title: stringOr(input.title || input.name, 'New Assignment'),
    icon: stringOr(input.icon, accent.icon),
    description: stringOr(input.description, ''),
    state: WORKFLOW_STATES.includes(input.state) ? input.state : 'unassigned',
    owner: stringOr(input.owner, ''),
    primaryModule: moduleKey,
    relatedModules: Array.isArray(input.relatedModules) ? input.relatedModules.filter((item) => MODULE_ACCENTS[item]) : [],
    priorityDefault: clampInt(input.priorityDefault, 1, 5, 3),
    priorityOverride: nullableRating(input.priorityOverride),
    effortDefault: clampInt(input.effortDefault, 1, 5, 3),
    effortOverride: nullableRating(input.effortOverride),
    milestoneId: stringOr(input.milestoneId, ''),
    chronicleId: stringOr(input.chronicleId, ''),
    questId: stringOr(input.questId, ''),
    callingId: stringOr(input.callingId, ''),
    zoneId: stringOr(input.zoneId, ''),
    sceneId: stringOr(input.sceneId, ''),
    screenId: stringOr(input.screenId, ''),
    linkedFile: stringOr(input.linkedFile, ''),
    linkedAssets: Array.isArray(input.linkedAssets) ? input.linkedAssets : [],
    tags: normalizeTags(input.tags),
    subtasks: Array.isArray(input.subtasks) ? input.subtasks.map(normalizeSubtask) : [],
    blockers: Array.isArray(input.blockers) ? input.blockers : [],
    notes: stringOr(input.notes, ''),
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
    lastTouchedAt: input.lastTouchedAt || input.updatedAt || new Date().toISOString(),
    archived: Boolean(input.archived) || input.state === 'archived'
  };
}

function normalizeSubtask(input = {}) {
  if (typeof input === 'string') return createSubtask(input);
  return {
    id: input.id || `subtask_${cryptoRandom()}`,
    text: stringOr(input.text, 'New subtask'),
    status: ['open', 'complete', 'confirmed', 'blocked', 'not-needed'].includes(input.status) ? input.status : 'open',
    required: input.required !== false,
    notes: stringOr(input.notes, '')
  };
}

export function loadDocument(document) {
  moduleState.document = normalizeDocument(document);
  moduleState.activeAssignmentIndex = moduleState.document.assignments.length ? 0 : -1;
  notifyChange();
}

export function resetDocument() {
  moduleState.document = createEmptyDocument();
  moduleState.activeAssignmentIndex = -1;
  notifyChange();
}

export function updateSetup(patch) {
  moduleState.document.setup = {
    ...moduleState.document.setup,
    ...patch
  };
  touchDocument();
}

export function addAssignment(patch = {}) {
  const assignment = createAssignment(patch);
  moduleState.document.assignments.push(assignment);
  moduleState.activeAssignmentIndex = moduleState.document.assignments.length - 1;
  touchDocument();
  return assignment;
}

export function getActiveAssignment() {
  return moduleState.document.assignments[moduleState.activeAssignmentIndex] || null;
}

export function selectAssignment(index) {
  if (index < 0 || index >= moduleState.document.assignments.length) return;
  moduleState.activeAssignmentIndex = index;
  notifyChange();
}

export function updateActiveAssignment(patch) {
  const assignment = getActiveAssignment();
  if (!assignment) return;
  Object.assign(assignment, patch);
  if ('primaryModule' in patch && !MODULE_ACCENTS[assignment.primaryModule]) assignment.primaryModule = 'unassigned';
  if ('state' in patch && !WORKFLOW_STATES.includes(assignment.state)) assignment.state = 'unassigned';
  if ('priorityOverride' in patch) assignment.priorityOverride = nullableRating(assignment.priorityOverride);
  if ('effortOverride' in patch) assignment.effortOverride = nullableRating(assignment.effortOverride);
  assignment.updatedAt = new Date().toISOString();
  assignment.lastTouchedAt = assignment.updatedAt;
  assignment.archived = assignment.state === 'archived' || Boolean(assignment.archived && patch.state !== 'done');
  touchDocument(false);
}

export function duplicateActiveAssignment() {
  const assignment = getActiveAssignment();
  if (!assignment) return;
  const clone = normalizeAssignment(JSON.parse(JSON.stringify(assignment)));
  clone.id = `assignment_${cryptoRandom()}`;
  clone.title = `${assignment.title} Copy`;
  clone.state = 'assigned';
  clone.archived = false;
  clone.createdAt = new Date().toISOString();
  clone.updatedAt = clone.createdAt;
  clone.lastTouchedAt = clone.createdAt;
  moduleState.document.assignments.splice(moduleState.activeAssignmentIndex + 1, 0, clone);
  moduleState.activeAssignmentIndex += 1;
  touchDocument();
}

export function deleteActiveAssignment() {
  if (moduleState.activeAssignmentIndex < 0) return;
  moduleState.document.assignments.splice(moduleState.activeAssignmentIndex, 1);
  moduleState.activeAssignmentIndex = Math.min(moduleState.activeAssignmentIndex, moduleState.document.assignments.length - 1);
  touchDocument();
}

export function addSubtaskToActive(text) {
  const assignment = getActiveAssignment();
  if (!assignment || !String(text || '').trim()) return false;
  assignment.subtasks.push(createSubtask(text));
  assignment.updatedAt = new Date().toISOString();
  assignment.lastTouchedAt = assignment.updatedAt;
  touchDocument(false);
  return true;
}

export function setSubtaskStatus(subtaskId, status) {
  const assignment = getActiveAssignment();
  const subtask = assignment?.subtasks.find((item) => item.id === subtaskId);
  if (!subtask) return;
  subtask.status = status;
  assignment.updatedAt = new Date().toISOString();
  assignment.lastTouchedAt = assignment.updatedAt;
  touchDocument(false);
}

export function deleteSubtask(subtaskId) {
  const assignment = getActiveAssignment();
  if (!assignment) return;
  assignment.subtasks = assignment.subtasks.filter((item) => item.id !== subtaskId);
  assignment.updatedAt = new Date().toISOString();
  assignment.lastTouchedAt = assignment.updatedAt;
  touchDocument(false);
}

export function setWorkflowFilter(filter) {
  moduleState.activeWorkflowFilter = filter;
  notifyChange();
}

export function setTodoSort(value) {
  moduleState.todoSort = value;
  notifyChange();
}

export function setWorkspaceMode(mode) {
  moduleState.workspaceMode = ['dark', 'white'].includes(mode) ? mode : 'dark';
  notifyChange();
}

export function toggleGrid() {
  moduleState.showGrid = !moduleState.showGrid;
  notifyChange();
}

export function toggleHelpers() {
  moduleState.showHelpers = !moduleState.showHelpers;
  notifyChange();
}

export function setZoom(value) {
  moduleState.zoom = Math.min(3, Math.max(0.4, Number(value) || 1));
  notifyChange();
}

export function serializeDocument() {
  return JSON.stringify(moduleState.document, null, 2);
}

export function getCompletion(assignment) {
  if (!assignment) return 0;
  if (assignment.state === 'done') return 100;
  const required = (assignment.subtasks || []).filter((item) => item.required !== false);
  const basis = required.length ? required : (assignment.subtasks || []);
  if (!basis.length) return assignment.state === 'started' ? 25 : assignment.state === 'review' ? 85 : 0;
  const complete = basis.filter((item) => ['complete', 'confirmed', 'not-needed'].includes(item.status));
  return Math.round((complete.length / basis.length) * 100);
}

export function getEffectivePriority(assignment) {
  return nullableRating(assignment?.priorityOverride) || clampInt(assignment?.priorityDefault, 1, 5, 3);
}

export function getEffectiveEffort(assignment) {
  return nullableRating(assignment?.effortOverride) || clampInt(assignment?.effortDefault, 1, 5, 3);
}

export function getVisibleAssignments() {
  let list = [...moduleState.document.assignments];
  const filter = moduleState.activeWorkflowFilter;
  if (filter === 'undone') list = list.filter((item) => item.state !== 'done' && item.state !== 'archived' && !item.archived);
  else if (filter !== 'all') list = list.filter((item) => item.state === filter);
  if (filter !== 'archived') list = list.filter((item) => !item.archived || item.state === 'archived');
  return sortAssignments(list, moduleState.todoSort);
}

function sortAssignments(list, sort) {
  const copy = [...list];
  if (sort === 'easy-wins') {
    copy.sort((a, b) => (getEffectiveEffort(a) - getEffectiveEffort(b)) || (getEffectivePriority(b) - getEffectivePriority(a)));
  } else if (sort === 'most-important') {
    copy.sort((a, b) => getEffectivePriority(b) - getEffectivePriority(a));
  } else if (sort === 'not-touched') {
    copy.sort((a, b) => new Date(a.lastTouchedAt || 0) - new Date(b.lastTouchedAt || 0));
  } else if (sort === 'almost-complete') {
    copy.sort((a, b) => getCompletion(b) - getCompletion(a));
  } else if (sort === 'by-module') {
    copy.sort((a, b) => String(a.primaryModule).localeCompare(String(b.primaryModule)));
  }
  return copy;
}

let changeListeners = [];

export function onStateChange(listener) {
  changeListeners.push(listener);
  return () => {
    changeListeners = changeListeners.filter((item) => item !== listener);
  };
}

export function notifyChange() {
  for (const listener of changeListeners) listener(moduleState);
}

function touchDocument(alsoNotify = true) {
  moduleState.document.updatedAt = new Date().toISOString();
  if (alsoNotify) notifyChange();
  else notifyChange();
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

function nullableRating(value) {
  if (value === null || value === undefined || value === '') return null;
  return clampInt(value, 1, 5, 3);
}

function clampInt(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringOr(value, fallback) {
  const string = String(value ?? '').trim();
  return string || fallback;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cryptoRandom() {
  if (globalThis.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0].toString(36);
  }
  return Math.random().toString(36).slice(2);
}
