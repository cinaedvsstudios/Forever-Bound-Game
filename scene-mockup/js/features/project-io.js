import { downloadBlob } from '../core/utils.js';

export function downloadProject(project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${safeName(project.title)}.scene-mockup.json`);
}

export function readProject(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try { resolve(JSON.parse(String(reader.result))); }
      catch { reject(new Error('That project file is not valid JSON.')); }
    };
    reader.onerror = () => reject(new Error('Could not read project file.'));
    reader.readAsText(file);
  });
}

export function safeName(name = 'scene-mockup') {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'scene-mockup';
}
