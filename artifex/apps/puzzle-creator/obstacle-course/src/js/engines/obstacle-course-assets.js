import { ASSET_BASE, SHARED_UI_BASE } from './obstacle-course-state.js';

export const ASSETS = {
  background: `${ASSET_BASE}backgrounds/horseridebg.jpg`,
  horse: `${ASSET_BASE}foreground/horse.png`,
  ground: `${ASSET_BASE}ground/forest_ground.webp`,
  powerbars: `${ASSET_BASE}ui/powerbars.png`,
  arrows: `${SHARED_UI_BASE}defaultarrows.webp`,
  pathSegments: {
    straight: { key: 'straight', id: 'pathstraight', label: 'Straight', file: `${ASSET_BASE}path-segments/pathstraight.webp`, start: 'centre', end: 'centre' },
    kink: { key: 'kink', id: 'pathkink', label: 'Kink', file: `${ASSET_BASE}path-segments/pathkink.webp`, start: 'centre', end: 'centre' },
    left: { key: 'left', id: 'pathleft', label: 'Move left', file: `${ASSET_BASE}path-segments/pathleft.webp`, start: 'centre', end: 'left' },
    right: { key: 'right', id: 'pathright', label: 'Move right', file: `${ASSET_BASE}path-segments/pathright.webp`, start: 'centre', end: 'right' },
    leftToStraight: { key: 'leftToStraight', id: 'pathlefttostraight', label: 'Left to centre', file: `${ASSET_BASE}path-segments/pathlefttostraight.webp`, start: 'left', end: 'centre' },
    rightToStraight: { key: 'rightToStraight', id: 'righttostraight', label: 'Right to centre', file: `${ASSET_BASE}path-segments/righttostraight.webp`, start: 'right', end: 'centre' },
  },
  audio: {
    snort: `${ASSET_BASE}audio/horse_snort.wav`,
    neigh: `${ASSET_BASE}audio/horse_neigh.mp3`,
    gallopSlow: `${ASSET_BASE}audio/horse_gallop_slow.mp3`,
    gallopFull: `${ASSET_BASE}audio/horse_gallop_full.mp3`,
    collect: `${ASSET_BASE}audio/horse_collect.mp3`,
    land: `${ASSET_BASE}audio/horse_land.mp3`,
  },
};

export const GLB_ASSETS = [
  { url: `${ASSET_BASE}3d/hill_top_tree.glb`, label: 'Hill Top Tree', type: 'nearTree', scale: 1, targetHeight: 5.8, optional: true },
  { url: `${ASSET_BASE}3d/pine_tree.glb`, label: 'Pine Tree', type: 'nearTree', scale: 1, targetHeight: 6.5, optional: true },
  { url: `${ASSET_BASE}3d/oak_trees.glb`, label: 'Oak Trees', type: 'nearTree', scale: 1, targetHeight: 6.2, optional: true },
  { url: `${ASSET_BASE}3d/tree.glb`, label: 'Tree', type: 'farTree', scale: 1, targetHeight: 7.5, optional: true },
  { url: `${ASSET_BASE}3d/low_poly_fern.glb`, label: 'Low Poly Fern', type: 'edgeDetail', scale: 1, targetHeight: 0.85, optional: true },
  { url: `${ASSET_BASE}3d/fern2.glb`, label: 'Fern 2', type: 'edgeDetail', scale: 1, targetHeight: 0.85, optional: true },
  { url: `${ASSET_BASE}3d/bush.glb`, label: 'Bush', type: 'edgeDetail', scale: 1, targetHeight: 1.1, optional: true },
  { url: `${ASSET_BASE}3d/geranium.glb`, label: 'Geranium', type: 'edgeDetail', scale: 1, targetHeight: 0.65, optional: true },
  { url: `${ASSET_BASE}3d/fern.glb`, label: 'Fern', type: 'farDetail', scale: 1, targetHeight: 0.95, optional: true },
  { url: `${ASSET_BASE}3d/tall_bush.glb`, label: 'Tall Bush', type: 'farDetail', scale: 1, targetHeight: 1.55, optional: true },
  { url: `${ASSET_BASE}3d/rock_low-poly.glb`, label: 'Rock', type: 'rock', scale: 1, targetHeight: 0.95, optional: true },
  { url: `${ASSET_BASE}3d/stylized_glowing_mushrooms.glb`, label: 'Glowing Mushrooms', type: 'collectible', scale: 1, targetHeight: 0.75, value: 10, optional: true },
  { url: `${ASSET_BASE}3d/moneysack.glb`, label: 'Money Sack', type: 'collectible', scale: 1, targetHeight: 0.75, value: 25, optional: true },
];

export const TEMPLATES = {
  horse_forest_easy: { label: 'Obstacle Course', treeRate: 1, rockRate: 1, detailRate: 1, collectibleRate: 1, obstacleRate: 1, night: false },
  dense_forest: { label: 'Dense Forest Course', treeRate: 1.7, rockRate: 1.25, detailRate: 1.65, collectibleRate: 1, obstacleRate: 1.1, night: false },
  moonlit_forest: { label: 'Moonlit Forest Course', treeRate: 1.25, rockRate: 1.05, detailRate: 1.25, collectibleRate: 1.2, obstacleRate: 1.15, night: true },
};

export function requiredAssetList() {
  return [
    { url: ASSETS.background, type: 'image', required: true, label: 'Background' },
    { url: ASSETS.horse, type: 'image', required: true, label: 'Horse foreground' },
    { url: ASSETS.ground, type: 'image', required: true, label: 'Forest ground' },
    { url: ASSETS.powerbars, type: 'image', required: true, label: 'Power bars' },
    { url: ASSETS.arrows, type: 'image', required: true, label: 'Off-path arrows' },
    ...Object.values(ASSETS.pathSegments).map((seg) => ({ url: seg.file, type: 'image', required: true, label: seg.label })),
  ];
}
export function optionalAssetList() {
  return [
    ...Object.entries(ASSETS.audio).map(([key, url]) => ({ url, type: 'audio', required: false, label: key })),
    ...GLB_ASSETS.map((asset) => ({ url: asset.url, type: 'glb', required: false, label: asset.label })),
  ];
}
