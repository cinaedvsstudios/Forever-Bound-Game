// Artifex Project Editor default data
// Step 2 of the Project Editor real split.
//
// This module owns the default project, logic graph, layout graph, and registry
// seed data used by the split shell. It intentionally contains no DOM code.

export const DEFAULT_PROJECT = Object.freeze({
  projectId: 'forever-bound-game',
  gameTitle: 'Forever Bound',
  creator: 'Cinaedus Studios',
  version: '1.0.0',
  startScreen: 'node_1',
  enabledModules: ['physics', 'quest', 'dialogue']
});

export const DEFAULT_LOGIC = Object.freeze({
  projectId: 'forever-bound-game',
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
    {
      id: 'route_12',
      source: 'node_1',
      target: 'node_2',
      type: 'Quest',
      conditions: ['alignment_setup']
    },
    {
      id: 'route_23',
      source: 'node_2',
      target: 'node_3',
      type: 'Quest',
      conditions: ['alignment_seen']
    },
    {
      id: 'route_24',
      source: 'node_2',
      target: 'node_4',
      type: 'Branch',
      conditions: ['alignment_skipped']
    }
  ]
});

export const DEFAULT_LAYOUT = Object.freeze({
  camera: {
    zoom: 1,
    panX: 100,
    panY: 100
  },
  nodes: [
    {
      id: 'node_1',
      position: { x: 150, y: 150 },
      visual: { color: 'project-gold', isCollapsed: false, usePlaceholder: true }
    },
    {
      id: 'node_2',
      position: { x: 450, y: 150 },
      visual: { color: 'project-green', isCollapsed: false, usePlaceholder: true }
    },
    {
      id: 'node_3',
      position: { x: 750, y: 50 },
      visual: { color: 'project-gold', isCollapsed: false, usePlaceholder: true }
    },
    {
      id: 'node_4',
      position: { x: 750, y: 300 },
      visual: { color: 'project-green', isCollapsed: false, usePlaceholder: true }
    },
    {
      id: 'node_5',
      position: { x: 450, y: 350 },
      visual: { color: 'project-gold', isCollapsed: false, usePlaceholder: true }
    }
  ],
  routes: [
    { id: 'route_12', visual: { lineColor: '#d6a24c', animated: true } },
    { id: 'route_23', visual: { lineColor: '#9fba5a', animated: true } },
    { id: 'route_24', visual: { lineColor: '#3b82f6', animated: false } }
  ]
});

export const DEFAULT_REGISTRY = Object.freeze({
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
