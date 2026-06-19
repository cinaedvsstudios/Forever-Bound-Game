import { getState, mutate, resetProject, undo, redo, serializeProject, replaceProject } from '../core/store.js';
import { downloadProject, readProject } from '../features/project-io.js';
import { exportScene } from '../features/export.js';
import { downloadBlob } from '../core/utils.js';
import { analyseImageColour, makeAutoMatch } from '../features/colour-match.js';
import { dom, toast } from './dom.js';

export function setupToolbar() {
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextTool = button.dataset.tool;
      if (nextTool === 'autoColour') {
        autoColourSelected();
        return;
      }
      mutate('Change tool', (state) => { state.activeTool = nextTool; }, { record: false });
    });
  });

  document.querySelector('#new-scene-button').addEventListener('click', () => {
    if (getState().layers.length && !window.confirm('Start a new scene? The current unsaved scene will be cleared.')) return;
    resetProject();
  });
  document.querySelector('#undo-button').addEventListener('click', () => {
    if (!undo()) toast('Nothing to undo.');
  });
  document.querySelector('#redo-button').addEventListener('click', () => {
    if (!redo()) toast('Nothing to redo.');
  });
  dom.canvasPreset.addEventListener('change', () => resizeCanvas(dom.canvasPreset.value));
  dom.gridToggle.addEventListener('change', () => mutate('Toggle grid', (state) => { state.showGrid = dom.gridToggle.checked; }, { record: false }));
  dom.guidesToggle.addEventListener('change', () => mutate('Toggle guides', (state) => { state.showGuides = dom.guidesToggle.checked; }, { record: false }));

  document.querySelector('#save-project-button').addEventListener('click', () => downloadProject(serializeProject()));
  document.querySelector('#load-project-input').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      const project = await readProject(file);
      validateProject(project);
      replaceProject(project);
      toast('Scene Mockup project opened.');
    } catch (error) {
      toast(error.message ?? 'Could not open that project.', { error: true });
    }
    event.target.value = '';
  });

  document.querySelector('#export-jpeg-button').addEventListener('click', () => runExport('image/jpeg', 'jpg'));
  document.querySelector('#export-png-button').addEventListener('click', () => runExport('image/png', 'png'));
  document.querySelector('#export-webp-button').addEventListener('click', () => runExport('image/webp', 'webp'));
}

function resizeCanvas(value) {
  const [width, height] = value.split('x').map(Number);
  mutate('Resize canvas', (state) => {
    const oldWidth = state.canvas.width;
    const oldHeight = state.canvas.height;
    const scaleX = width / oldWidth;
    const scaleY = height / oldHeight;
    state.layers.forEach((layer) => {
      if (layer.isBackground) {
        layer.x = 0; layer.y = 0; layer.width = width; layer.height = height;
        return;
      }
      layer.x = Math.round(layer.x * scaleX);
      layer.y = Math.round(layer.y * scaleY);
      layer.width = Math.round(layer.width * scaleX);
      layer.height = Math.round(layer.height * scaleY);
    });
    state.canvas = { width, height };
  });
}

async function autoColourSelected() {
  const state = getState();
  const foregroundLayers = state.layers.filter((layer) => !layer.isBackground);
  if (!foregroundLayers.length) {
    toast('Add a foreground asset before running Auto colour.', { error: true });
    return;
  }
  const background = state.layers.find((layer) => layer.isBackground);
  try {
    const backdrop = await analyseImageColour(background?.dataUrl ?? createFallbackBackdrop());
    const match = makeAutoMatch(backdrop);
    mutate('Auto colour match', (nextState) => {
      nextState.layers.filter((layer) => !layer.isBackground).forEach((layer) => {
        layer.filters = { ...match };
      });
    });
    toast('Auto colour matched all foreground layers. Each layer can now be adjusted manually.');
  } catch (error) {
    console.error(error);
    toast('Could not analyse the background for colour matching.', { error: true });
  }
}

function createFallbackBackdrop() {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  const context = canvas.getContext('2d');
  context.fillStyle = '#1c2838';
  context.fillRect(0, 0, 2, 2);
  return canvas.toDataURL('image/png');
}

async function runExport(mime, extension) {
  const state = getState();
  if (!state.layers.length) {
    toast('Add at least one layer before exporting.', { error: true });
    return;
  }
  try {
    const blob = await exportScene(state, mime);
    if (!blob) throw new Error('Your browser did not return an export file.');
    downloadBlob(blob, `${safeName(state.title)}.${extension}`);
    toast(`Exported ${extension.toUpperCase()}.`);
  } catch (error) {
    console.error(error);
    toast('Could not export this scene.', { error: true });
  }
}

function safeName(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'scene-mockup';
}

function validateProject(project) {
  if (!project || project.app !== 'Scene Mockup' || !project.canvas || !Array.isArray(project.layers) || !Array.isArray(project.assets)) {
    throw new Error('This is not a Scene Mockup project file.');
  }
}
