// Artifex Project Manager route type definitions
// Shared by Stitcher and later route health checks.

export const ROUTE_TYPES = Object.freeze([
  {
    id: 'simple',
    label: 'Simple Route',
    color: '#d6a24c',
    description: 'A direct navigation path between two nodes with no extra gameplay gate.',
    conditionPlaceholder: ''
  },
  {
    id: 'branch',
    label: 'Branch Route',
    color: '#3b82f6',
    description: 'A choice, decision, or alternate path selected by a variable or story flag.',
    conditionPlaceholder: 'branch:alignment_mercy'
  },
  {
    id: 'quest-gated',
    label: 'Quest-Gated Route',
    color: '#9fba5a',
    description: 'A route that opens only when a quest starts, advances, or completes.',
    conditionPlaceholder: 'quest:q01:complete'
  },
  {
    id: 'puzzle-gated',
    label: 'Puzzle-Gated Route',
    color: '#a855f7',
    description: 'A route unlocked by a puzzle state or puzzle completion.',
    conditionPlaceholder: 'puzzle:p01:solved'
  },
  {
    id: 'item-gated',
    label: 'Item-Gated Route',
    color: '#f59e0b',
    description: 'A route requiring an inventory item, key, clue, or collected object.',
    conditionPlaceholder: 'item:brass_key:owned'
  },
  {
    id: 'flag-condition',
    label: 'Flag / Condition Route',
    color: '#14b8a6',
    description: 'A route controlled by a gameplay flag, variable, or custom condition expression.',
    conditionPlaceholder: 'flag:met_capra:true'
  },
  {
    id: 'completed-state',
    label: 'Completed-State Route',
    color: '#ef4444',
    description: 'A route used after a scene, quest, branch, or module has reached a completed state.',
    conditionPlaceholder: 'state:scene_complete'
  }
]);

const LEGACY_TYPE_ALIASES = Object.freeze({
  Route: 'simple',
  Simple: 'simple',
  Quest: 'quest-gated',
  Branch: 'branch',
  Puzzle: 'puzzle-gated',
  Item: 'item-gated',
  Condition: 'flag-condition',
  Complete: 'completed-state'
});

export function normalizeRouteType(type) {
  if (!type) return 'simple';
  if (ROUTE_TYPES.some((routeType) => routeType.id === type)) return type;
  return LEGACY_TYPE_ALIASES[type] || String(type).toLowerCase().replace(/\s+/g, '-') || 'simple';
}

export function getRouteTypeDefinition(type) {
  const normalized = normalizeRouteType(type);
  return ROUTE_TYPES.find((routeType) => routeType.id === normalized) || ROUTE_TYPES[0];
}

export function getRouteTypeOptions(currentType) {
  const normalized = normalizeRouteType(currentType);
  return ROUTE_TYPES.map((routeType) => ({
    ...routeType,
    selected: routeType.id === normalized
  }));
}

export function buildRouteConditionPatch({ type, conditionText, gateId = '', flagKey = '', requiredState = '' }) {
  const normalizedType = normalizeRouteType(type);
  const rawCondition = String(conditionText || '').trim();

  const routeMeta = {
    routeTypeId: normalizedType,
    gateId: String(gateId || '').trim(),
    flagKey: String(flagKey || '').trim(),
    requiredState: String(requiredState || '').trim()
  };

  const conditions = [];
  if (rawCondition) conditions.push(rawCondition);
  if (routeMeta.gateId && !conditions.includes(routeMeta.gateId)) conditions.push(routeMeta.gateId);
  if (routeMeta.flagKey && routeMeta.requiredState) conditions.push(`${routeMeta.flagKey}:${routeMeta.requiredState}`);

  return {
    type: normalizedType,
    conditions,
    routeMeta
  };
}
