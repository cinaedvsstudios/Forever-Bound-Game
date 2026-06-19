import { downloadBlob } from '../core/utils.js';

export async function saveBlobWithPicker(blob, {
  suggestedName,
  description = 'Scene Mockup file',
  mimeType = blob.type || 'application/octet-stream',
  extensions = []
} = {}) {
  if (typeof window.showSaveFilePicker !== 'function') {
    downloadBlob(blob, suggestedName);
    return { saved: true, usedPicker: false };
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{
        description,
        accept: { [mimeType]: extensions.length ? extensions : ['.bin'] }
      }]
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return { saved: true, usedPicker: true };
  } catch (error) {
    if (error?.name === 'AbortError') return { saved: false, cancelled: true, usedPicker: true };
    throw error;
  }
}
