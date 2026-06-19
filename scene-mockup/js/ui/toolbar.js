import { getState, mutate, resetProject, undo, redo, serializeProject, replaceProject } from '../core/store.js';
import { saveProjectFile, readProject, safeName } from '../features/project-io.js';
import { exportScene } from '../features/export.js';
import { saveBlobWithPicker } from '../features/file-picker.js';
import { analyseImageColour, makeAutoMatch } from '../features/colour-match.js';
import { openAssetImport, addPlaceholderToLibrary, refreshRepositoryAssets, openFloatingAssetBrowser } from './assets.js';
import { closeMenus } from './menubar.js';
import { fitCanvas, resetViewport, zoomBy } from './viewport.js';
import { dom, toast } from './dom.js';

export function setupToolbar() {
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextTool = button.dataset.tool;
      if (nextTool === 'autoColour') {
        autoColourSelected();
      } else {
        mutate('Change tool', (state) => { state.activeTool = nextTool; }, { record: false });
      }
      closeMenus();
    });
  });

  document.querySelectorAll('[data-menu-command]').forEach((button) => {
    button.addEventListener('click', () => {
      runMenuCommand(button.dataset.menuCommand);
      closeMenus();
    });
  });

  document.querySelectorAll('[data-view-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.viewToggle;
      mutate(`Toggle ${key === 'guides' ? 'safe frame' : 'grid'}`, (state) => {
        if (key === 'grid') state.showGrid = !state.showGrid;
        if (key === 'guides') state.showGuides = !state.showGuides;
      }, { record: false });
    });
  });

  document.querySelectorAll('[data-canvas-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      resizeCanvas(button.dataset.canvasPreset);
      closeMenus();
    });
  });

  document.querySelector('#undo-button').addEventListener('click', () => {
    if (!undo()) toast('Nothing to undo.');
  });
  document.querySelector('#redo-button').addEventListener('click', () => {
    if (!redo()) toast('Nothing to redo.');
  });

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

  window.addEventListener('keydown', onKeyboardShortcut);
}

function runMenuCommand(command) {
  const actions = {
    'new-scene': startNewScene,
    'save-project': saveProject,
    'open-project': () => document.querySelector('#load-project-input').click(),
    'export-jpeg': () => runExport('image/jpeg', 'jpg'),
    'export-png': () => runExport('image/png', 'png'),
    'export-webp': () => runExport('image/webp', 'webp'),
    'zoom-in': () => zoomBy(0.1),
    'zoom-out': () => zoomBy(-0.1),
    'zoom-reset': resetViewport,
    'zoom-fit': fitCanvas,
    'import-assets': openAssetImport,
    'add-placeholder': addPlaceholderToLibrary,
    'refresh-assets': refreshRepositoryAssets,
    'open-asset-browser': openFloatingAssetBrowser
  };
  actions[command]?.();
}

function onKeyboardShortcut(event) {
  if (event.target.closest('input, textarea, select')) return;
  const hasCommand = event.ctrlKey || event.metaKey;
  if (hasCommand && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveProject();
    return;
  }
  if (hasCommand && event.key.toLowerCase() === 'o') {
    event.preventDefault();
    document.querySelector('#load-project-input').click();
    return;
  }
  if (hasCommand && event.key.toLowerCase() === 'n') {
    event.preventDefault();
    startNewScene();
    return;
  }
  if (event.key === '+') zoomBy(0.1);
  if (event.key === '-') zoomBy(-0.1);
  if (event.key === '0') resetViewport();
  if (event.key.toLowerCase() === 'f') fitCanvas();
}

function startNewScene() {
  if (getState().layers.length && !window.confirm('Start a new scene? The current unsaved scene will be cleared.')) return;
  resetProject();
}

async function saveProject() {
  try {
    const result = await saveProjectFile(serializeProject());
    if (!result.saved) return;
    toast(result.usedPicker ? 'Project saved to the selected folder.' : 'Project downloaded. Your browser does not support a save picker.');
  } catch (error) {
    console.error(error);
    toast('Could not save this project.', { error: true });
  }
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
        layer.x = 0;
        layer.y = 0;
        layer.width = width;
        layer.height = height;
        return;
      }
      layer.x = Math.round(layer.x * scaleX);
      layer.y = Math.round(layer.y * scaleY);
      layer.width = Math.round(layer.width * scaleX);
      layer.height = Math.round(layer.height * scaleY);
    });
    state.canvas = { width, height };
  });
  fitCanvas();
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
    const result = await saveBlobWithPicker(blob, {
      suggestedName: `${safeName(state.title)}.${extension}`,
      description: `Scene Mockup ${extension.toUpperCase()} image`,
      mimeType: mime,
      extensions: [`.${extension}`]
    });
    if (!result.saved) return;
    toast(result.usedPicker ? `Exported ${extension.toUpperCase()} to the selected folder.` : `Exported ${extension.toUpperCase()}.`);
  } catch (error) {
    console.error(error);
    toast('Could not export this scene.', { error: true });
  }
}

function validateProject(project) {
  if (!project || project.app !== 'Scene Mockup' || !project.canvas || !Array.isArray(project.layers) || !Array.isArray(project.assets)) {
    throw new Error('This is not a Scene Mockup project file.');
  }
}
