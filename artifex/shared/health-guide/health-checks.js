// Artifex shared project health checks
// Shared by Project Manager, Creation Guide, and later Build Game.

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

export function buildProjectSetupChecks(stateManagerOrState = {}) {
  const state = stateManagerOrState.state || stateManagerOrState;
  const project = stateManagerOrState.project || state.project || {};
  const logic = stateManagerOrState.logic || state.logic || {};
  const layout = stateManagerOrState.layout || state.layout || {};

  const nodes = safeArray(logic.nodes);
  const routes = safeArray(logic.routes);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const connectedIds = new Set();
  const invalidRoutes = [];

  routes.forEach((route) => {
    if (!nodeIds.has(route.source) || !nodeIds.has(route.target)) invalidRoutes.push(route.id || 'unnamed-route');
    if (route.source) connectedIds.add(route.source);
    if (route.target) connectedIds.add(route.target);
  });

  const startTarget = getProjectField(project, 'startScreenId', 'startScreen', 'startNodeId');
  const hasStartScreen = Boolean(startTarget);
  const orphanedNodes = nodes.filter((node) => !connectedIds.has(node.id));
  const linkedScenes = nodes.filter((node) => node.properties?.linkedSceneId || node.properties?.linkedScreenId || node.linkedSceneId || node.linkedScreenId);
  const hasLibraryLinks = Boolean(state.libraryLinks || stateManagerOrState.libraryLinks || project.fileRefs?.libraryLinks);
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
      detail: hasLibraryLinks ? 'library-links.json is referenced or loaded.' : 'library-links.json should normalize links to scenes, quests, puzzles, archetypes, FX, and assets.',
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

  return {
    total,
    passed,
    failed,
    needsCreationGuide,
    status: failed === 0 ? 'passed' : 'warning'
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
