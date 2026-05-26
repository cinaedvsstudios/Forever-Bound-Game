// Artifex Project Editor Flatplan Catalog seed data
// Step 2 of the Project Editor real split.

export const FLATPLAN_PLACEHOLDERS = Object.freeze([
  { type: 'Completed Screen', label: 'Completed Screen', icon: 'check-circle', tone: 'indigo' },
  { type: 'Playable Scene', label: 'Playable Scene', icon: 'play-circle', tone: 'orange' },
  { type: 'Title Screen', label: 'Title Screen', icon: 'heading', tone: 'amber' },
  { type: 'Menu Screen', label: 'Menu Screen', icon: 'menu', tone: 'cyan' },
  { type: 'Ending Screen', label: 'Ending Screen', icon: 'flag-triangle-right', tone: 'rose' },
  { type: 'Quest', label: 'Quest', icon: 'award', tone: 'rose' },
  { type: 'Side Quest', label: 'Side Quest', icon: 'sparkles', tone: 'fuchsia' },
  { type: 'Branche', label: 'Branche', icon: 'git-branch', tone: 'sky' },
  { type: 'Route', label: 'Route', icon: 'milestone', tone: 'teal' },
  { type: 'Station', label: 'Station', icon: 'square', tone: 'project' },
  { type: 'Depot', label: 'Depot', icon: 'hexagon', tone: 'pink' },
  { type: 'Junction', label: 'Junction', icon: 'git-fork', tone: 'blue' },
  { type: 'Waypoint', label: 'Waypoint', icon: 'map-pin', tone: 'emerald' },
  { type: 'Placeholder Obj 1', label: 'Placeholder 1', icon: 'box', tone: 'zinc' },
  { type: 'Placeholder Obj 2', label: 'Placeholder 2', icon: 'box', tone: 'zinc' },
  { type: 'Placeholder Obj 3', label: 'Placeholder 3', icon: 'box', tone: 'zinc' },
  { type: 'Placeholder Obj 4', label: 'Placeholder 4', icon: 'box', tone: 'zinc' }
]);

export const FLATPLAN_REAL_ASSETS = Object.freeze([
  {
    assetId: 'scene_level1_intro',
    type: 'Playable Scene',
    name: 'Level 1 Intro',
    file: 'intro_office.scene',
    texture: 'intro',
    icon: 'image'
  },
  {
    assetId: 'scene_forest_maze',
    type: 'Playable Scene',
    name: 'Forest Maze',
    file: 'forest_route.scene',
    texture: 'forest',
    icon: 'trees'
  }
]);

export const FLATPLAN_CATALOG = Object.freeze({
  placeholders: FLATPLAN_PLACEHOLDERS,
  realAssets: FLATPLAN_REAL_ASSETS
});

export function listCatalogItems(tab = 'placeholders') {
  return Array.from(FLATPLAN_CATALOG[tab] || []);
}
