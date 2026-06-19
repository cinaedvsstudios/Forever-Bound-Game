import { saveBlobWithPicker } from './file-picker.js';

export async function saveProjectFile(project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  return saveBlobWithPicker(blob, {
    suggestedName: `${safeName(project.title)}.scene-mockup.json`,
    description: 'Scene Mockup project',
    mimeType: 'application/json',
    extensions: ['.scene-mockup.json', '.json']
  });
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
