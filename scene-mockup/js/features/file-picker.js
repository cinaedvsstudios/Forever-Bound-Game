import { downloadBlob } from '../core/utils.js';

export async function requestSaveDestination({
  suggestedName,
  description = 'Scene Mockup file',
  mimeType = 'application/octet-stream',
  extensions = []
} = {}) {
  if (typeof window.showSaveFilePicker !== 'function') {
    return { usePicker: false, suggestedName };
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{
        description,
        accept: { [mimeType]: extensions.length ? extensions : ['.bin'] }
      }]
    });
    return { usePicker: true, handle, suggestedName };
  } catch (error) {
    if (error?.name === 'AbortError') return { cancelled: true, usePicker: true, suggestedName };
    throw error;
  }
}

export async function writeBlobToDestination(blob, destination) {
  if (destination.cancelled) return { saved: false, cancelled: true, usedPicker: destination.usePicker };
  if (!destination.usePicker) {
    downloadBlob(blob, destination.suggestedName);
    return { saved: true, usedPicker: false };
  }

  const writable = await destination.handle.createWritable();
  await writable.write(blob);
  await writable.close();
  return { saved: true, usedPicker: true };
}

export async function saveBlobWithPicker(blob, options = {}) {
  const destination = await requestSaveDestination(options);
  return writeBlobToDestination(blob, destination);
}
