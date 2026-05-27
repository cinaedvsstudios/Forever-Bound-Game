// Artifex shared project health checks
// Shared by Project Manager, Creation Guide, and later Build Game.

const VALID_ROUTE_TYPES = Object.freeze([
  'simple',
  'branch',
  'quest-gated',
  'puzzle-gated',
  'item-gated',
  'flag-condition',
  'completed-state',
  'Route',
  'Quest',
  'Branch'
]);

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getProjectField(project, ...keys) {
  for (const key of keys) {
    if (project && project[key]) return project[key];
  }
  return '';
}

function makeCheck({
  checkId,
  label,
  detail,
  pass,
  severity,
  owner,
  fixOwner,
  creationGuideAction = false,
  tags = []
}) {
  return {
    checkId,
    label,
    detail,
    pass: Boolean(pass),
    severity: severity || (pass ? 'pass' : 'missing'),
    owner,
    fixOwner,
    creationGuideAction: Boolean(creationGuideAction),
    tags
  };
}

function getRouteType(route = {}) {
  return route.routeMeta?.routeTypeId || route.type || 'simple';
}

export function buildProjectSetupChecks(stateManagerOrState = {}) {
  const state = stateManagerOrState.state || stateManagerOrState;
  const project = stateManagerOrState.project || state.project || {};
  const logic = stateManagerOrState.logic || state.logic || {};
  const layout = stateManagerOrState.layout || state.layout || {};

  const nodes = safeArray(logic.nodes);
  const routes = safeArray(logic.routes);
  const layoutNodes = safeArray(layout.nodes);
  const layoutRoutes = safeArray(layout.routes);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const layoutNodeIds = new Set(layoutNodes.map((node) => node.id));
  const layoutRouteIds = new Set(layoutRoutes.map((route) => route.id));
  const connectedIds = new Set();
  const invalidRoutes = [];

  routes.forEach((route) => {
    if (!nodeIds.has(route.source) || !nodeIds.has(route.target)) invalidRoutes.push(route.id || 'unnamed-route');
    if (route.source) connectedIds.add(route.source);
    if (route.target) connectedIds.add(route.target);
  });

  const startTarget = getProjectField(project, 'startScreenId', 'startScreen', 'startNodeId');
  const hasStartScreen = Boolean(startTarget);
  const startScreenExists = hasStartScreen && nodeIds.has(startTarget);
  const orphanedNodes = nodes.filter((node) => !connectedIds.has(node.id));
  const linkedScenes = nodes.filter((node) => node.properties?.linkedSceneId || node.properties?.linkedScreenId || node.nodeLinks?.sceneId || node.linkedSceneId || node.linkedScreenId);
  const missingLayoutNodes = nodes.filter((node) => !layoutNodeIds.has(node.id));
  const missingLayoutRoutes = routes.filter((route) => !layoutRouteIds.has(route.id));
  const unknownRouteTypes = routes.filter((route) => !VALID_ROUTE_TYPES.includes(getRouteType(route)));
  const gatedRoutesMissingConditions = routes.filter((route) => {
    const type = getRouteType(route);
    const isGated = ['quest-gated', 'puzzle-gated', 'item-gated', 'flag-condition', 'completed-state'].includes(type);
    return isGated && safeArray(route.conditions).length === 0 && !route.routeMeta?.gateId && !route.routeMeta?.flagKey;
  });
  const nodesWithLibraryLinks = nodes.filter((node) => safeArray(node.properties?.libraryLinks).length > 0);
  const hasLibraryLinks = Boolean(state.libraryLinks || stateManagerOrState.libraryLinks || project.fileRefs?.libraryLinks || nodesWithLibraryLinks.length);
  const hasInputMap = Boolean(state.inputMap || stateManagerOrState.inputMap || project.fileRefs?.inputMap);

  return [
    makeCheck({
      checkId: 'health_project_manifest_exists',
      label: 'Project manifest exists',
      detail: project.projectId ? `Project ID: ${project.projectId}` : 'project.json / Project Manifest is missing or not loaded.',
      pass: Boolean(project.projectId),
      owner: 'Creation Guide',
      fixOwner: 'creation-guide',
      creationGuideAction: true,
      tags: ['setup', 'project-json']
    }),
    makeCheck({
      checkId: 'health_start_screen_assigned',
      label: 'Start screen assigned',
      detail: hasStartScreen ? `Current target: ${startTarget}` : 'Missing start screen reference.',
      pass: hasStartScreen,
      owner: 'Project Manager',
      fixOwner: 'project-manager',
      tags: ['setup', 'start-screen']
    }),
    makeCheck({
      checkId: 'health_start_screen_resolves',
      label: 'Start screen resolves',
      detail: startScreenExists ? `Start node exists: ${startTarget}` : hasStartScreen ? `Start node does not exist: ${startTarget}` : 'No start target to resolve.',
      pass: startScreenExists,
      owner: 'Project Manager',
      fixOwner: 'project-manager',
      severity: startScreenExists ? 'pass' : 'failed',
      tags: ['setup', 'start-screen', 'flatplan']
    }),
    makeCheck({
      checkId: 'health_input_map_expected',
      label: 'Input map expected',
      detail: hasInputMap ? 'input-map.json is referenced or loaded.' : 'Creation Guide should create input-map.json; Project Manager validates action mappings.',
      pass: hasInputMap,
      owner: 'Creation Guide / Project Settings',
      fixOwner: 'creation-guide',
      creationGuideAction: true,
      tags: ['setup', 'input-map', 'controls']
    }),
    makeCheck({
      checkId: 'health_library_links_expected',
      label: 'Library links expected',
      detail: hasLibraryLinks ? `${nodesWithLibraryLinks.length} node(s) have node-level library links or library-links.json is loaded.` : 'library-links.json should normalize links to scenes, quests, puzzles, archetypes, FX, and assets.',
      pass: hasLibraryLinks,
      owner: 'Project Manager',
      fixOwner: 'project-manager',
      tags: ['setup', 'library-links']
    }),
    makeCheck({
      checkId: 'health_flatplan_has_nodes',
      label: 'Flatplan has nodes',
      detail: `${nodes.length} node(s) in current graph.`,
      pass: nodes.length > 0,
      owner: 'Project Manager',
      fixOwner: 'project-manager',
      tags: ['flatplan', 'nodes']
    }),
    makeCheck({
      checkId: 'health_routes_resolve',
      label: 'Routes resolve',
      detail: invalidRoutes.length ? `Invalid routes: ${invalidRoutes.join(', ')}` : `${routes.length} route(s) resolve.`,
      pass: invalidRoutes.length === 0,
      owner: 'Project Manager / Stitcher',
      fixOwner: 'project-manager',
      severity: invalidRoutes.length ? 'failed' : 'pass',
      tags: ['flatplan', 'routes', 'stitcher']
    }),
    makeCheck({
      checkId: 'health_layout_nodes_resolve',
      label: 'Layout nodes resolve',
      detail: missingLayoutNodes.length ? `Missing layout records: ${missingLayoutNodes.map((node) => node.id).join(', ')}` : 'Every logic node has a layout record.',
      pass: missingLayoutNodes.length === 0,
      owner: 'Project Manager',
      fixOwner: 'project-manager',
      severity: missingLayoutNodes.length ? 'failed' : 'pass',
      tags: ['flatplan', 'layout', 'nodes']
    }),
    makeCheck({
      checkId: 'health_layout_routes_resolve',
      label: 'Layout routes resolve',
      detail: missingLayoutRoutes.length ? `Missing visual route records: ${missingLayoutRoutes.map((route) => route.id).join(', ')}` : 'Every logic route has a visual route record.',
      pass: missingLayoutRoutes.length === 0,
      owner: 'Project Manager / Stitcher',
      fixOwner: 'project-manager',
      severity: missingLayoutRoutes.length ? 'warning' : 'pass',
      tags: ['flatplan', 'layout', 'routes']
    }),
    makeCheck({
      checkId: 'health_route_types_known',
      label: 'Route types are known',
      detail: unknownRouteTypes.length ? `Unknown route type(s): ${unknownRouteTypes.map((route) => `${route.id}:${getRouteType(route)}`).join(', ')}` : 'All routes use known route types.',
      pass: unknownRouteTypes.length === 0,
      owner: 'Project Manager / Stitcher',
      fixOwner: 'project-manager',
      severity: unknownRouteTypes.length ? 'warning' : 'pass',
      tags: ['routes', 'stitcher', 'route-types']
    }),
    makeCheck({
      checkId: 'health_gated_routes_have_conditions',
      label: 'Gated routes have conditions',
      detail: gatedRoutesMissingConditions.length ? `Missing gates: ${gatedRoutesMissingConditions.map((route) => route.id).join(', ')}` : 'All gated routes have a condition, gate ID, or flag key.',
      pass: gatedRoutesMissingConditions.length === 0,
      owner: 'Project Manager / Stitcher',
      fixOwner: 'project-manager',
      severity: gatedRoutesMissingConditions.length ? 'warning' : 'pass',
      tags: ['routes', 'stitcher', 'conditions']
    }),
    makeCheck({
      checkId: 'health_nodes_link_to_scenes_screens',
      label: 'Nodes link to scenes/screens',
      detail: linkedScenes.length ? `${linkedScenes.length} node(s) have linked scene/screen IDs.` : 'No linked scene/screen IDs detected yet.',
      pass: linkedScenes.length > 0,
      owner: 'Scene Editor + Project Manager',
      fixOwner: 'project-manager',
      tags: ['library-links', 'scene-editor']
    }),
    makeCheck({
      checkId: 'health_orphaned_nodes_reviewed',
      label: 'Orphaned nodes reviewed',
      detail: orphanedNodes.length ? `${orphanedNodes.length} orphaned node(s) should be checked.` : 'No orphaned nodes detected.',
      pass: orphanedNodes.length === 0,
      owner: 'Project Manager',
      fixOwner: 'project-manager',
      severity: orphanedNodes.length ? 'warning' : 'pass',
      tags: ['flatplan', 'nodes']
    })
  ];
}

export function buildHealthSummary(checks = []) {
  const total = checks.length;
  const passed = checks.filter((check) => check.pass).length;
  const failed = checks.filter((check) => !check.pass).length;
  const needsCreationGuide = checks.some((check) => !check.pass && check.creationGuideAction);
  const hardFailures = checks.filter((check) => !check.pass && check.severity === 'failed').length;
  const warnings = checks.filter((check) => !check.pass && check.severity !== 'failed').length;

  return {
    total,
    passed,
    failed,
    hardFailures,
    warnings,
    needsCreationGuide,
    status: hardFailures ? 'failed' : failed === 0 ? 'passed' : 'warning'
  };
}

export function createHealthReport({ stateManager, scope = 'project-manager' } = {}) {
  const checks = buildProjectSetupChecks(stateManager || {});
  return {
    schemaVersion: 'artifex.healthReport.v1',
    scope,
    generatedAt: new Date().toISOString(),
    summary: buildHealthSummary(checks),
    checks
  };
}
