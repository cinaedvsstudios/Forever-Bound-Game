import { initRenderer } from './renderer.js';
import { loadReferenceMaze } from './maze-generator.js';
import { redrawAnalysisCanvas } from './maze-parser.js';
import { buildSwatches } from './textures.js';
import { bindUiEvents, syncControlsFromState } from './ui.js';
import { state, runtime } from './state.js';

function bootstrap() {
  const referenceCanvas = loadReferenceMaze();
  const image = new Image();
  image.onload = () => {
    runtime.sourceImage = image;
    redrawAnalysisCanvas();
    initRenderer();
    runtime.rendererApi?.rebuild();
  };
  image.src = referenceCanvas.toDataURL('image/png');
  state.sourceImageDataUrl = image.src;

  buildSwatches((color) => {
    state.brushColor = color;
  });
  syncControlsFromState();
  bindUiEvents();
}

window.addEventListener('DOMContentLoaded', bootstrap);
