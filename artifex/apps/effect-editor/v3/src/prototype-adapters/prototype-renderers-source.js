import {
  drawPrototypeLayer as drawAnchoredPrototypeLayer,
  isPrototypeRenderableLayer
} from './prototype-renderers-anchored.js';
import { drawSourceShimmerLayer, isSourceShimmerLayer } from './shimmer-source-renderer.js?v=052-wormhole-visible-range';

export { isPrototypeRenderableLayer };

export function drawPrototypeLayer(ctx, layer, scaleValue = 1, timeMs = 0, stage = {}) {
  if (layer?.visible === false) return;
  if (isSourceShimmerLayer(layer)) {
    if (drawSourceShimmerLayer(ctx, layer, scaleValue, timeMs, stage)) return;
  }
  drawAnchoredPrototypeLayer(ctx, layer, scaleValue, timeMs, stage);
}
