import { createDefaultProjectState, cloneDefaultData } from './data/project-defaults.js?v=0.1.23-routes';
import { listCatalogItems } from './data/flatplan-catalog.js?v=0.1.23-routes';

// Artifex Project Editor state manager
// Step 3 of the Project Editor real split.
//
// This module owns the split shell's project state and simple state mutation
// helpers. It deliberately has no DOM dependency. Rendering, canvas controls,
// IO import/export, Stitcher, and Build Prep remain separate steps.

const STORAGE_KEYS = Object.freeze({
  project: 'artifex_project',
  logic: 'artifex_logic',
  layout: 'artifex_layout',
  registry: 'artifex_registry',
  renderRealAssets: 'artifex_real_assets'
});

export class ProjectEditorStateManager {
  constructor(options = {}) {
    this.storage = options.storage ?? globalThis.localStorage ?? null;
    this.state = createDefaultProjectState();
    this.state.catalog = {
      placeholders: listCatalogItems('placeholders'),
      realAssets: listCatalogItems('realAssets')
    };
    this.loadFromStorage();
    this.ensureCameraDefaults();
  }

  get project() {
    return this.state.project;
  }

  get logic() {
    return this.state.logic;
  }

  get layout() {
    return this.state.layout;
  }

  get registry() {
    return this.state.registry;
  }

  get catalog() {
    return this.state.catalog;
  }

  get camera() {
    this.ensureCameraDefaults();
    return this.layout.camera;
  }

  get activeWorkspace() {
    return this.state.activeWorkspace;
  }

  set activeWorkspace(value) {
    this.state.activeWorkspace = value;
    this.saveToStorage();
  }

  get selectedNodeId() {
    return this.state.selectedNodeId;
  }

  set selectedNodeId(value) {
    this.state.selectedNodeId = value;
  }

  get selectedEdgeId() {
    return this.state.selectedEdgeId;
  }

  set selectedEdgeId(value) {
    this.state.selectedEdgeId = value;
  }

  get mapProjectionActive() {
    return this.state.mapProjectionActive;
  }

  set mapProjectionActive(value) {
    this.state.mapProjectionActive = Boolean(value);
    this.saveToStorage();
  }

  loadFromStorage() {
    if (!this.storage) return;

    const storedProject = this.safeReadJSON(STORAGE_KEYS.project);
    const storedLogic = this.safeReadJSON(STORAGE_KEYS.logic);
    const storedLayout = this.safeReadJSON(STORAGE_KEYS.layout);
    const storedRegistry = this.safeReadJSON(STORAGE_KEYS.registry);
    const storedRenderRealAssets = this.safeReadJSON(STORAGE_KEYS.renderRealAssets);

    if (storedProject) this.state.project = storedProject;
    if (storedLogic) this.state.logic = storedLogic;
    if (storedLayout) this.state.layout = storedLayout;
    if (storedRegistry) this.state.registry = storedRegistry;
    if (typeof storedRenderRealAssets === 'boolean') {
      this.state.renderRealAssets = storedRenderRealAssets;
    }
  }

  saveToStorage() {
    if (!this.storage) return;

    this.safeWriteJSON(STORAGE_KEYS.project, this.state.project);
    this.safeWriteJSON(STORAGE_KEYS.logic, this.state.logic);
    this.safeWriteJSON(STORAGE_KEYS.layout, this.state.layout);
    this.safeWriteJSON(STORAGE_KEYS.registry, this.state.registry);
    this.safeWriteJSON(STORAGE_KEYS.renderRealAssets, this.state.renderRealAssets);
  }

  resetToDefaults({ persist = true } = {}) {
    const fresh = createDefaultProjectState();
    fresh.catalog = this.state.catalog;
    this.state = fresh;
    this.ensureCameraDefaults();
    if (persist) this.saveToStorage();
    return this.state;
  }

  ensureCameraDefaults() {
    this.layout.camera = {
      zoom: Number(this.layout.camera?.zoom) || 1,
      panX: Number(this.layout.camera?.panX) || 0,
      panY: Number(this.layout.camera?.panY) || 0
    };
    this.layout.camera.zoom = Math.max(0.3, Math.min(2.5, this.layout.camera.zoom));
  }

  updateCamera(patch = {}, { persist = true } = {}) {
    this.ensureCameraDefaults();
    this.layout.camera = {
      zoom: Number(patch.zoom ?? this.layout.camera.zoom) || 1,
      panX: Number(patch.panX ?? this.layout.camera.panX) || 0,
      panY: Number(patch.panY ?? this.layout.camera.panY) || 0
    };
    this.layout.camera.zoom = Math.max(0.3, Math.min(2.5, this.layout.camera.zoom));
    if (persist) this.saveToStorage();
    return this.layout.camera;
  }

  resetCamera({ persist = true } = {}) {
    this.layout.camera = { zoom: 1, panX: 0, panY: 0 };
    if (persist) this.saveToStorage();
    return this.layout.camera;
  }

  selectNode(nodeId) {
    if (!this.logic.nodes.some((node) => node.id === nodeId)) return null;
    this.state.selectedNodeId = nodeId;
    this.state.selectedEdgeId = null;
    return this.getNode(nodeId);
  }

  selectRoute(routeId) {
    if (!this.logic.routes.some((route) => route.id === routeId)) return null;
    this.state.selectedEdgeId = routeId;
    this.state.selectedNodeId = null;
    return this.getRoute(routeId);
  }

  clearSelection() {
    this.state.selectedNodeId = null;
    this.state.selectedEdgeId = null;
  }

  getNode(nodeId) {
    return this.logic.nodes.find((node) => node.id === nodeId) ?? null;
  }

  getRoute(routeId) {
    return this.logic.routes.find((route) => route.id === routeId) ?? null;
  }

  getNodeLayout(nodeId) {
    return this.layout.nodes.find((node) => node.id === nodeId) ?? null;
  }

  getRouteLayout(routeId) {
    return this.layout.routes.find((route) => route.id === routeId) ?? null;
  }

  updateNode(nodeId, patch = {}) {
    const node = this.getNode(nodeId);
    if (!node) return null;

    if (patch.type) node.type = patch.type;
    if (patch.properties) {
      node.properties = {
        ...(node.properties ?? {}),
        ...patch.properties
      };
    }

    this.saveToStorage();
    return node;
  }

  updateNodePosition(nodeId, position) {
    const layoutNode = this.getNodeLayout(nodeId);
    if (!layoutNode) return null;

    layoutNode.position = {
      x: Math.round(Number(position.x) || 0),
      y: Math.round(Number(position.y) || 0)
    };

    this.saveToStorage();
    return layoutNode;
  }

  updateRoute(routeId, patch = {}) {
    const route = this.getRoute(routeId);
    if (!route) return null;

    if (patch.type) route.type = patch.type;
    if (Array.isArray(patch.conditions)) route.conditions = patch.conditions;
    if (patch.routeMeta) {
      route.routeMeta = {
        ...(route.routeMeta ?? {}),
        ...patch.routeMeta
      };
    }

    this.saveToStorage();
    return route;
  }

  updateRouteVisual(routeId, visualPatch = {}) {
    let routeLayout = this.getRouteLayout(routeId);
    if (!routeLayout) {
      routeLayout = {
        id: routeId,
        visual: { lineColor: '#d6a24c', animated: false }
      };
      this.layout.routes.push(routeLayout);
    }

    routeLayout.visual = {
      ...(routeLayout.visual ?? {}),
      ...visualPatch
    };

    this.saveToStorage();
    return routeLayout;
  }

  addNode({ type = 'Station', position = { x: 100, y: 100 }, properties = {} } = {}) {
    const id = `node_${Date.now()}`;
    const node = {
      id,
      type,
      properties: {
        name: `New ${type}`,
        description: 'Created in Project Editor split shell.',
        linkedSceneId: '',
        ...properties
      }
    };
    const layoutNode = {
      id,
      position: {
        x: Math.round(Number(position.x) || 0),
        y: Math.round(Number(position.y) || 0)
      },
      visual: { color: 'project-gold', isCollapsed: false, usePlaceholder: true }
    };

    this.logic.nodes.push(node);
    this.layout.nodes.push(layoutNode);
    this.selectNode(id);
    this.saveToStorage();

    return node;
  }

  deleteNode(nodeId) {
    const before = this.logic.nodes.length;
    this.logic.nodes = this.logic.nodes.filter((node) => node.id !== nodeId);
    this.layout.nodes = this.layout.nodes.filter((node) => node.id !== nodeId);
    this.logic.routes = this.logic.routes.filter((route) => route.source !== nodeId && route.target !== nodeId);
    this.layout.routes = this.layout.routes.filter((route) => this.logic.routes.some((logicRoute) => logicRoute.id === route.id));

    if (this.selectedNodeId === nodeId) this.state.selectedNodeId = null;
    this.saveToStorage();

    return this.logic.nodes.length < before;
  }

  exportSnapshot() {
    return cloneDefaultData({
      project: this.state.project,
      logic: this.state.logic,
      layout: this.state.layout,
      registry: this.state.registry
    });
  }

  safeReadJSON(key) {
    try {
      const raw = this.storage?.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn(`[ProjectEditorStateManager] Ignoring invalid storage key: ${key}`, error);
      return null;
    }
  }

  safeWriteJSON(key, value) {
    try {
      this.storage?.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[ProjectEditorStateManager] Could not write storage key: ${key}`, error);
    }
  }
}

export function createProjectEditorStateManager(options = {}) {
  return new ProjectEditorStateManager(options);
}
