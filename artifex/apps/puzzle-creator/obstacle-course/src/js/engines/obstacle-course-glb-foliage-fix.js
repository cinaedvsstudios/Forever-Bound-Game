import { OC } from './obstacle-course-state.js';
import { THREE } from './obstacle-course-scene.js';

const FOLIAGE_ALPHA_TEST = 0.52;

function isTreeLikeAssetUrl(url = '') {
  const value = String(url).toLowerCase();
  return value.includes('tree') || value.includes('pine') || value.includes('oak') || value.includes('fern') || value.includes('leaf');
}

function materialList(material) {
  if (!material) return [];
  return Array.isArray(material) ? material : [material];
}

function forceFoliageCutoutMaterial(material) {
  material.alphaTest = Math.max(Number(material.alphaTest || 0), FOLIAGE_ALPHA_TEST);
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.depthTest = true;
  material.side = THREE.DoubleSide;
  material.blending = THREE.NormalBlending;
  material.needsUpdate = true;
}

export function fixGlbFoliageTransparency() {
  OC.glbInstances.forEach((object) => {
    const assetUrl = object?.userData?.glbAssetUrl || '';
    if (!isTreeLikeAssetUrl(assetUrl)) return;
    object.traverse?.((node) => {
      materialList(node.material).forEach((material) => {
        if (material?.map || material?.alphaMap || material?.transparent || Number(material?.alphaTest || 0) > 0) {
          forceFoliageCutoutMaterial(material);
        }
      });
    });
  });
}
