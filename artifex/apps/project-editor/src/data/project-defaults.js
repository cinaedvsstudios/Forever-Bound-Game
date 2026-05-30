// Artifex Project Editor default data
// Used only when no real project has been loaded into Project Editor.
// The object shapes match docs/artifex/19a-project-starter-file-schemas.md.

const DEFAULT_INDEX_REFS = Object.freeze({
  sceneIndex: 'scenes/scene-index.json',
  screenIndex: 'screens/screen-index.json',
  questIndex: 'quests/quest-index.json',
  sidequestIndex: 'sidequests/sidequest-index.json',
  puzzleIndex: 'puzzles/puzzle-index.json',
  objectArchetypeIndex: 'archetypes/object-index.json',
  effectArchetypeIndex: 'archetypes/effect-index.json',
  assetIndex: 'assets/asset-index.json'
});

export const DEFAULT_PROJECT = Object.freeze({
  schemaVersion: 'artifex.project.v1',
  projectId: 'project_forever_bound',
  projectSlug: 'forever-bound',
  gameTitle: 'Forever Bound',
  creator: 'Cinaedvs Studios',
  version: '0.1.0',
  createdBy: 'project-editor-demo',
  projectLogo: null,
  startScreenId: 'node_1',
  enabledModules: ['creation-guide', 'project-editor', 'scene-editor', 'quest-builder', 'puzzle-creator', 'archetype-object-creator', 'effect-editor', 'asset-library', 'build-game'],
  roots: {
    intake: 'intake/',
    assets: 'assets/',
    scenes: 'scenes/',
    screens: 'screens/',
    quests: 'quests/',
    sidequests: 'sidequests/',
    puzzles: 'puzzles/',
    archetypes: 'archetypes/',
    health: 'health/',
    build: 'build/',
    backups: 'backups/',
    todos: 'todos/'
  },
  fileRefs: {
    logic: 'logic.json',
    layout: 'layout.json',
    registry: 'registry.json',
    libraryLinks: 'library-links.json',
    inputMap: 'input-map.json',
    ...DEFAULT_INDEX_REFS,
    healthReport: 'health/latest-health-report.json'
  }
});

export const DEFAULT_LOGIC = Object.freeze({
  schemaVersion: 'artifex.logic.v1',
  projectId: 'project_forever_bound',
  startScreenId: 'node_1',
  conditions: [],
  nodes: [
    {
      id: 'node_1',
      type: 'Title Screen',
      properties: {
        name: 'Game Main Title',
        description: 'First screen the player lands on.',
        onEnterTrigger: 'play_music',
        linkedSceneId: ''
      }
    },
    {
      id: 'node_2',
      type: 'Menu Screen',
      properties: {
        name: 'Options Dashboard',
        description: 'Primary choice hub before play begins.',
        decisionVariable: 'alignment'
      }
    },
    {
      id: 'node_3',
      type: 'Playable Scene',
      properties: {
        name: 'Level 1 Office',
        description: 'Primary visual level builder scene.'
      }
    },
    {
      id: 'node_4',
      type: 'Completed Screen',
      properties: {
        name: 'Victory Summary',
        description: 'Presents score and completion stats.'
      }
    },
    {
      id: 'node_5',
      type: 'Waypoint',
      properties: {
        name: 'Debug Helper Waypoint',
        description: 'Developer-only navigation marker.'
      }
    }
  ],
  routes: [
    { id: 'route_12', source: 'node_1', target: 'node_2', type: 'Quest', conditions: ['alignment_setup'] },
    { id: 'route_23', source: 'node_2', target: 'node_3', type: 'Quest', conditions: ['alignment_seen'] },
    { id: 'route_24', source: 'node_2', target: 'node_4', type: 'Branch', conditions: ['alignment_skipped'] }
  ]
});

export const DEFAULT_LAYOUT = Object.freeze({
  schemaVersion: 'artifex.layout.v1',
  projectId: 'project_forever_bound',
  camera: { zoom: 1, panX: 100, panY: 100 },
  annotations: [],
  nodes: [
    { id: 'node_1', position: { x: 150, y: 150 }, visual: { color: 'project-gold', isCollapsed: false, usePlaceholder: true } },
    { id: 'node_2', position: { x: 450, y: 150 }, visual: { color: 'project-green', isCollapsed: false, usePlaceholder: true } },
    { id: 'node_3', position: { x: 750, y: 50 }, visual: { color: 'project-gold', isCollapsed: false, usePlaceholder: true } },
    { id: 'node_4', position: { x: 750, y: 300 }, visual: { color: 'project-green', isCollapsed: false, usePlaceholder: true } },
    { id: 'node_5', position: { x: 450, y: 350 }, visual: { color: 'project-gold', isCollapsed: false, usePlaceholder: true } }
  ],
  routes: [
    { id: 'route_12', visual: { lineColor: '#d6a24c', animated: true } },
    { id: 'route_23', visual: { lineColor: '#9fba5a', animated: true } },
    { id: 'route_24', visual: { lineColor: '#3b82f6', animated: false } }
  ]
});

export const DEFAULT_REGISTRY = Object.freeze({
  schemaVersion: 'artifex.registry.v1',
  projectId: 'project_forever_bound',
  enabledModules: DEFAULT_PROJECT.enabledModules,
  indexes: DEFAULT_INDEX_REFS,
  customMacros: []
});

export function cloneDefaultData(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createDefaultProjectState() {
  return {
    project: cloneDefaultData(DEFAULT_PROJECT),
    logic: cloneDefaultData(DEFAULT_LOGIC),
    layout: cloneDefaultData(DEFAULT_LAYOUT),
    registry: cloneDefaultData(DEFAULT_REGISTRY),
    activeWorkspace: 'flatplan',
    activePreviewTab: 'logic',
    activeAssetTab: 'placeholders',
    renderRealAssets: false,
    selectedNodeId: null,
    selectedEdgeId: null,
    mapProjectionActive: false
  };
}
