import { OC, SECTION_WORLD_LENGTH, SECTION_WORLD_STEP, COURSE_WORLD_WIDTH, PATH_POSITIONS, GROUND_Y } from './obstacle-course-state.js';
import { ASSETS, TEMPLATES } from './obstacle-course-assets.js';
import { clamp, lerp, pick, rand } from './obstacle-course-utils.js';
import { THREE, loadTexture } from './obstacle-course-scene.js';
import { pathAlphaAtSegment } from './obstacle-course-loader.js';
import { registerEntity, makeLayer } from './obstacle-course-layers.js';

export function generatePathSequence() {
  OC.pathSequence = [];
  const count = Math.ceil(OC.courseLength / SECTION_WORLD_STEP) + 4;
  let lane = 'centre';
  for (let i = 0; i < count; i += 1) {
    const choices = lane === 'centre' ? [ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.left, ASSETS.pathSegments.right] : lane === 'left' ? [ASSETS.pathSegments.straight, ASSETS.pathSegments.leftToStraight] : [ASSETS.pathSegments.straight, ASSETS.pathSegments.rightToStraight];
    let def = pick(choices);
    if (lane !== 'centre' && def.start === 'centre') def = lane === 'left' ? ASSETS.pathSegments.leftToStraight : ASSETS.pathSegments.rightToStraight;
    const startX = PATH_POSITIONS[def.start] ?? PATH_POSITIONS[lane] ?? 0;
    const endX = PATH_POSITIONS[def.end] ?? startX;
    OC.pathSequence.push({ ...def, distance: i * SECTION_WORLD_STEP, startX, endX });
    lane = def.end;
  }
}
export function pathSegmentAt(distance) { return OC.pathSequence[clamp(Math.floor(distance / SECTION_WORLD_STEP), 0, OC.pathSequence.length - 1)] || null; }
export function pathCenterAt(distance) { const seg = pathSegmentAt(distance); if (!seg) return 0; return lerp(seg.startX, seg.endX, clamp((distance - seg.distance) / SECTION_WORLD_STEP, 0, 1)); }
export function playerWorldX() { return pathCenterAt(OC.distance) + OC.player.x; }
export function pathAlphaAtWorld(worldX, distance) { const seg = pathSegmentAt(distance); if (!seg) return null; const u = 0.5 + (worldX - pathCenterAt(distance)) / OC.pathVisualWidth; const v = clamp((distance - seg.distance) / SECTION_WORLD_STEP, 0, 1); if (u < 0 || u > 1) return 0; return pathAlphaAtSegment(seg.key, u, v); }
export function nearestVisiblePathX(distance, worldX) { const center = pathCenterAt(distance); let bestX = center; let best = Infinity; for (let x = center - OC.pathVisualWidth * .7; x <= center + OC.pathVisualWidth * .7; x += .4) { const a = pathAlphaAtWorld(x, distance); if (a !== null && a >= OC.pathAlphaThreshold) { const d = Math.abs(x - worldX); if (d < best) { best = d; bestX = x; } } } return bestX; }
export function pathStatus() { const worldX = playerWorldX(); const alpha = pathAlphaAtWorld(worldX, OC.distance); if (alpha === null) return Math.abs(OC.player.x) > OC.pathVisualWidth * .5 ? 'off' : 'on'; if (alpha >= OC.pathAlphaThreshold) return 'on'; OC.pathHintDirection = nearestVisiblePathX(OC.distance, worldX) < worldX ? 'left' : 'right'; return 'off'; }
export function clearWorld() { if (!OC.world) return; while (OC.world.children.length) OC.world.remove(OC.world.children[0]); OC.layers.clear(); OC.entities = []; OC.objects = []; OC.glbInstances = []; }

export function buildGroundAndPath() {
  generatePathSequence();
  const groundLayer = new THREE.Group(); const pathLayer = new THREE.Group();
  makeLayer('ground', 'Ground', groundLayer, { order: 1 }); makeLayer('path', 'Path', pathLayer, { order: 2 }); OC.world.add(groundLayer, pathLayer);
  const groundMat = new THREE.MeshStandardMaterial({ map: loadTexture(ASSETS.ground, { repeat: [1,1], repeatX:false }), transparent:true, alphaTest:.02, roughness:1, side:THREE.DoubleSide });
  const groundGeo = new THREE.PlaneGeometry(COURSE_WORLD_WIDTH, SECTION_WORLD_LENGTH, 1, 1);
  OC.pathSequence.forEach((seg) => { const z = -seg.distance - SECTION_WORLD_LENGTH / 2; const ground = new THREE.Mesh(groundGeo.clone(), groundMat.clone()); ground.rotation.x = -Math.PI/2; ground.position.set(0, GROUND_Y, z); groundLayer.add(ground); registerEntity('ground', ground, { x:0, z, visibleOnOverview:false }); const path = new THREE.Mesh(new THREE.PlaneGeometry(OC.pathVisualWidth, SECTION_WORLD_LENGTH, 1, 1), new THREE.MeshStandardMaterial({ map: loadTexture(seg.file), transparent:true, alphaTest:.05, roughness:.95, side:THREE.DoubleSide, depthWrite:false })); path.rotation.x = -Math.PI/2; path.position.set((seg.startX + seg.endX)/2, GROUND_Y+.045, z); pathLayer.add(path); registerEntity('path', path, { x:path.position.x, z, segmentKey:seg.key }); });
}
export function scatterScenery() { const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy; const treeLayer = new THREE.Group(); const rockLayer = new THREE.Group(); const detailLayer = new THREE.Group(); makeLayer('trees','Trees',treeLayer,{order:10}); makeLayer('rocks','Rocks',rockLayer,{order:11}); makeLayer('details','Ferns / Bushes / Details',detailLayer,{order:12}); OC.world.add(treeLayer,rockLayer,detailLayer); const treeMat = new THREE.MeshStandardMaterial({color:0x1d5a34}); const trunkMat = new THREE.MeshStandardMaterial({color:0x5a321e}); const rockMat = new THREE.MeshStandardMaterial({color:0x7d776b}); const detailMat = new THREE.MeshStandardMaterial({color:0x2e8b45}); for (let d=24; d<OC.courseLength+260; d+=Math.max(11,22/template.treeRate)) { const center=pathCenterAt(d); [-1,1].forEach(side=>{ const x=center+side*(OC.pathVisualWidth*.5+OC.sceneryDistance*.25+rand(1,4)); const z=-d+rand(-5,5); const tree=new THREE.Group(); const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,2.5,6),trunkMat.clone()); const crown=new THREE.Mesh(new THREE.ConeGeometry(rand(1.1,1.9),rand(3.2,5.5),7),treeMat.clone()); trunk.position.y=GROUND_Y+1.25; crown.position.y=GROUND_Y+4; tree.add(trunk,crown); tree.position.set(x,0,z); treeLayer.add(tree); registerEntity('tree',tree,{x,z}); }); } for (let d=34; d<OC.courseLength+120; d+=27/template.rockRate) { const side=Math.random()>.5?1:-1; const x=pathCenterAt(d)+side*(OC.pathVisualWidth*.5+OC.sceneryDistance*.18+rand(.4,4)); const z=-d+rand(-3,3); const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(rand(.45,1.2),0),rockMat.clone()); rock.position.set(x,GROUND_Y+.35,z); rockLayer.add(rock); registerEntity('rock',rock,{x,z}); } for (let d=20; d<OC.courseLength+100; d+=14/template.detailRate) { const side=Math.random()>.5?1:-1; const x=pathCenterAt(d)+side*(OC.pathVisualWidth*.5+rand(.3,Math.max(1.5,OC.sceneryDistance*.2))); const z=-d+rand(-2,2); const fern=new THREE.Mesh(new THREE.ConeGeometry(rand(.25,.5),rand(.6,1.1),5),detailMat.clone()); fern.position.set(x,GROUND_Y+.35,z); detailLayer.add(fern); registerEntity('detail',fern,{x,z}); } }
export function rebuildGroundPathAndScenery() { clearWorld(); buildGroundAndPath(); scatterScenery(); }
