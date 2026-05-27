import { getBlockType } from './block-types.js';

export function exportQuestFile(doc) {
  return JSON.stringify({
    schemaVersion: 'artifex.questFile.v1',
    generatedBy: 'quest-builder',
    questFile: doc,
    validationWarnings: validateQuestFile(doc)
  }, null, 2);
}

export function validateQuestFile(doc) {
  const warnings = [];
  (doc.quests || []).forEach((quest) => {
    if (!quest.id) warnings.push({ level: 'error', target: quest.name || 'quest', message: 'Quest is missing id.' });
    if (!quest.name) warnings.push({ level: 'warning', target: quest.id || 'quest', message: 'Quest is missing name.' });
    (quest.blocks || []).forEach((block) => {
      const blockType = getBlockType(block.type);
      (blockType.requiredFields || []).forEach((field) => {
        if (!block[field]) {
          warnings.push({
            level: 'warning',
            target: block.id || block.name || 'block',
            message: `${blockType.name} is missing required field: ${field}`
          });
        }
      });
      if (block.type === 'completion' && !block.condition && !quest.completionFlag) {
        warnings.push({
          level: 'warning',
          target: block.id || block.name || 'completion',
          message: 'Completion block needs a condition or quest completion flag.'
        });
      }
    });
  });
  return warnings;
}

export function downloadJson(filename, contents) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function slugify(value) {
  return String(value || 'quest-file').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
