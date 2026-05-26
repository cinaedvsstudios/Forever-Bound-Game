import { EDGE_STYLE_LABELS, LAYOUT_STYLE_LABELS } from './config.js';
import { state, runtime } from './state.js';
import { dom, showToast } from './dom.js';
import { parseSourceImage, redrawAnalysisCanvas } from './maze-parser.js';
import { loadReferenceMaze, loadRandomMaze } from './maze-generator.js';
import { solveMaze } from './solver.js';
import { setTool, clearPaint, apply2DPointer, apply3DPointer } from './editor-tools.js';
import { downloadGameJson, copyGameJsonToClipboard, importGameJson } from './exporter.js';

export function syncControlsFromState() {
  dom.moduleId.value = state.moduleId;
  dom.puzzleType.value = state.puzzleType;
  dom.gameplayMode.value = state.gameplayMode;
  dom.completionFlag.value = state.completionFlag;
  dom.callingText.value = state.callingText;
  dom.gridSlider.value = state.gridSize;
  dom.gridVal.textContent = `${state.gridSize} × ${state.gridSize}`;
  dom.thresholdSlider.value = state.threshold;
  dom.thresholdVal.textContent = `${state.threshold}%`;
  dom.invertCheckbox.checked = state.invert;
  dom.wallHeightSlider.value = state.wallHeight;
  dom.wallHeightVal.textContent = state.wallHeight;
  dom.gapSlider.value = state.gap;
  dom.gapVal.textContent = state.gap;
  dom.layoutStyleSlider.value = state.layoutStyle;
  dom.layoutStyleVal.textContent = LAYOUT_STYLE_LABELS[state.layoutStyle];
  dom.edgeStyleSlider.value = state.edgeStyle;
  dom.edgeStyleVal.textContent = EDGE_STYLE_LABELS[state.edgeStyle];
  dom.wallColorPicker.value = state.wallColor;
  dom.brushColorPicker.value = state.brushColor;
  dom.floorStyle.value = state.floorStyle;

  dom.materialButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.style === state.wallMaterialPreset));
  dom.toolButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.tool === state.currentTool));
  dom.viewModeDiorama.classList.toggle('is-active', state.currentViewMode === 'diorama');
  dom.viewModeFps.classList.toggle('is-active', state.currentViewMode === 'walk');
}

export function bindUiEvents() {
  dom.moduleId.addEventListener('input', () => { state.moduleId = dom.moduleId.value.trim() || 'artifex_maze'; });
  dom.puzzleType.addEventListener('change', () => { state.puzzleType = dom.puzzleType.value; });
  dom.gameplayMode.addEventListener('change', () => { state.gameplayMode = dom.gameplayMode.value; });
  dom.completionFlag.addEventListener('input', () => { state.completionFlag = dom.completionFlag.value.trim() || 'maze_exit_reached'; });
  dom.callingText.addEventListener('input', () => { state.callingText = dom.callingText.value; });

  dom.gridSlider.addEventListener('input', () => {
    state.gridSize = Number(dom.gridSlider.value);
    dom.gridVal.textContent = `${state.gridSize} × ${state.gridSize}`;
  });
  dom.gridSlider.addEventListener('change', () => {
    if (state.hasCustomSourceImage && runtime.sourceImage) parseSourceImage(runtime.sourceImage);
    else loadGenerated(loadRandomMaze(state.gridSize));
    runtime.rendererApi?.rebuild();
  });

  dom.thresholdSlider.addEventListener('input', () => {
    state.threshold = Number(dom.thresholdSlider.value);
    dom.thresholdVal.textContent = `${state.threshold}%`;
  });
  dom.thresholdSlider.addEventListener('change', () => {
    if (runtime.sourceImage) parseSourceImage(runtime.sourceImage);
    runtime.rendererApi?.rebuild();
  });

  dom.invertCheckbox.addEventListener('change', () => {
    state.invert = dom.invertCheckbox.checked;
    if (runtime.sourceImage) parseSourceImage(runtime.sourceImage);
    runtime.rendererApi?.rebuild();
  });

  dom.wallHeightSlider.addEventListener('input', () => {
    state.wallHeight = Number(dom.wallHeightSlider.value);
    dom.wallHeightVal.textContent = state.wallHeight;
    runtime.rendererApi?.rebuild();
  });
  dom.gapSlider.addEventListener('input', () => {
    state.gap = Number(dom.gapSlider.value);
    dom.gapVal.textContent = state.gap.toFixed(2);
    runtime.rendererApi?.rebuild();
  });
  dom.layoutStyleSlider.addEventListener('input', () => {
    state.layoutStyle = Number(dom.layoutStyleSlider.value);
    dom.layoutStyleVal.textContent = LAYOUT_STYLE_LABELS[state.layoutStyle];
    runtime.rendererApi?.rebuild();
  });
  dom.edgeStyleSlider.addEventListener('input', () => {
    state.edgeStyle = Number(dom.edgeStyleSlider.value);
    dom.edgeStyleVal.textContent = EDGE_STYLE_LABELS[state.edgeStyle];
    runtime.rendererApi?.rebuild();
  });

  dom.wallColorPicker.addEventListener('input', () => {
    state.wallColor = dom.wallColorPicker.value;
    runtime.rendererApi?.rebuild();
  });
  dom.brushColorPicker.addEventListener('input', () => {
    state.brushColor = dom.brushColorPicker.value;
  });
  dom.floorStyle.addEventListener('change', () => {
    state.floorStyle = dom.floorStyle.value;
    runtime.rendererApi?.rebuild();
  });

  dom.materialButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.wallMaterialPreset = button.dataset.style;
      dom.materialButtons.forEach((b) => b.classList.toggle('is-active', b === button));
      runtime.rendererApi?.rebuild();
    });
  });

  dom.toolButtons.forEach((button) => {
    button.addEventListener('click', () => setTool(button.dataset.tool));
  });

  dom.btnClearPaint.addEventListener('click', clearPaint);
  dom.btnLoadReference.addEventListener('click', () => {
    loadGenerated(loadReferenceMaze());
    syncControlsFromState();
    runtime.rendererApi?.rebuild();
    showToast('Reference maze loaded.');
  });
  dom.btnRandom.addEventListener('click', () => {
    loadGenerated(loadRandomMaze(state.gridSize));
    runtime.rendererApi?.rebuild();
    showToast('Fresh random maze generated.');
  });
  dom.btnReparse.addEventListener('click', () => {
    if (!runtime.sourceImage) return;
    parseSourceImage(runtime.sourceImage);
    runtime.rendererApi?.rebuild();
  });
  dom.btnSolve.addEventListener('click', () => {
    const path = solveMaze();
    redrawAnalysisCanvas();
    runtime.rendererApi?.solvePath(path);
    showToast(path.length ? `Solution plotted: ${path.length} cells.` : 'No route found. Try adjusting the parser or drawing a path.', path.length ? 'good' : 'danger');
  });
  dom.btnExportJson.addEventListener('click', () => {
    downloadGameJson();
    showToast('Game JSON downloaded.');
  });
  dom.btnCopyJson.addEventListener('click', async () => {
    try {
      await copyGameJsonToClipboard();
      showToast('Game JSON copied to clipboard.');
    } catch {
      showToast('Clipboard copy failed. Use Download Game JSON instead.', 'danger');
    }
  });

  dom.viewModeDiorama.addEventListener('click', () => switchView('diorama'));
  dom.viewModeFps.addEventListener('click', () => switchView('walk'));
  dom.btnZoomIn.addEventListener('click', () => runtime.rendererApi?.zoom('in'));
  dom.btnZoomOut.addEventListener('click', () => runtime.rendererApi?.zoom('out'));
  dom.btnZoomReset.addEventListener('click', () => runtime.rendererApi?.zoom('fit'));

  bindPanelNavigation();
  bindImageInputs();
  bindJsonImport();
  bindPointerTools();
  bindKeyboard();
  bindDpad();
}


function bindPanelNavigation() {
  dom.panelNavButtons?.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.panel;
      dom.panelNavButtons.forEach((navButton) => navButton.classList.toggle('is-active', navButton === button));
      dom.toolPanels.forEach((panel) => {
        const active = panel.dataset.panelContent === target;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
      window.requestAnimationFrame(() => runtime.rendererApi?.zoom('fit'));
    });
  });
}

function switchView(mode) {
  state.currentViewMode = mode;
  dom.viewModeDiorama.classList.toggle('is-active', mode === 'diorama');
  dom.viewModeFps.classList.toggle('is-active', mode === 'walk');
  runtime.rendererApi?.setViewMode(mode);
}

function bindImageInputs() {
  dom.imageUpload.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) loadImageFile(file);
  });

  dom.dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dom.dropzone.classList.add('is-dragging');
  });
  dom.dropzone.addEventListener('dragleave', () => dom.dropzone.classList.remove('is-dragging'));
  dom.dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dom.dropzone.classList.remove('is-dragging');
    const file = event.dataTransfer?.files?.[0];
    if (file?.type?.startsWith('image/')) loadImageFile(file);
  });
}

function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      runtime.sourceImage = image;
      state.sourceImageDataUrl = reader.result;
      state.hasCustomSourceImage = true;
      parseSourceImage(image);
      runtime.rendererApi?.rebuild();
      showToast('Image reference parsed into maze cells.');
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function loadGenerated(canvas) {
  const image = new Image();
  image.onload = () => {
    runtime.sourceImage = image;
    redrawAnalysisCanvas();
  };
  image.src = canvas.toDataURL('image/png');
  state.sourceImageDataUrl = image.src;
  state.hasCustomSourceImage = false;
  redrawAnalysisCanvas();
}

function bindJsonImport() {
  dom.jsonImport.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      importGameJson(data);
      syncControlsFromState();
      redrawAnalysisCanvas();
      runtime.rendererApi?.rebuild();
      showToast('Artifex maze JSON imported.');
    } catch (error) {
      showToast(error.message || 'JSON import failed.', 'danger');
    }
  });
}

function bindPointerTools() {
  dom.analysisCanvas.addEventListener('mousedown', (event) => {
    runtime.pointer.is2dDrawing = true;
    apply2DPointer(event, false);
  });
  dom.analysisCanvas.addEventListener('mousemove', (event) => {
    if (runtime.pointer.is2dDrawing && ['paint', 'toggle'].includes(state.currentTool)) apply2DPointer(event, true);
  });
  window.addEventListener('mouseup', () => { runtime.pointer.is2dDrawing = false; });

  dom.threeContainer.addEventListener('mousedown', (event) => {
    runtime.pointer.is3dDrawing = true;
    apply3DPointer(event, false);
  });
  dom.threeContainer.addEventListener('mousemove', (event) => {
    if (runtime.pointer.is3dDrawing && ['paint', 'toggle'].includes(state.currentTool)) apply3DPointer(event, true);
  });
  window.addEventListener('mouseup', () => { runtime.pointer.is3dDrawing = false; });

  dom.analysisCanvas.addEventListener('touchstart', (event) => {
    runtime.pointer.is2dDrawing = true;
    apply2DPointer(event, false);
  }, { passive: true });
  dom.analysisCanvas.addEventListener('touchmove', (event) => {
    if (runtime.pointer.is2dDrawing && ['paint', 'toggle'].includes(state.currentTool)) apply2DPointer(event, true);
  }, { passive: true });
  dom.threeContainer.addEventListener('touchstart', (event) => {
    runtime.pointer.is3dDrawing = true;
    apply3DPointer(event, false);
  }, { passive: true });
  dom.threeContainer.addEventListener('touchmove', (event) => {
    if (runtime.pointer.is3dDrawing && ['paint', 'toggle'].includes(state.currentTool)) apply3DPointer(event, true);
  }, { passive: true });
  window.addEventListener('touchend', () => {
    runtime.pointer.is2dDrawing = false;
    runtime.pointer.is3dDrawing = false;
  });
}

function bindKeyboard() {
  window.addEventListener('keydown', (event) => {
    if (event.key in runtime.keys) {
      runtime.keys[event.key] = true;
      if (event.key.startsWith('Arrow')) event.preventDefault();
    }
  });
  window.addEventListener('keyup', (event) => {
    if (event.key in runtime.keys) runtime.keys[event.key] = false;
  });
}

function bindDpad() {
  dom.virtualDpad.querySelectorAll('button[data-dpad]').forEach((button) => {
    const key = button.dataset.dpad;
    const set = (value) => { runtime.keys[key] = value; };
    button.addEventListener('mousedown', () => set(true));
    button.addEventListener('mouseup', () => set(false));
    button.addEventListener('mouseleave', () => set(false));
    button.addEventListener('touchstart', (event) => { event.preventDefault(); set(true); });
    button.addEventListener('touchend', (event) => { event.preventDefault(); set(false); });
  });
}
