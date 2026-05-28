import { getBlockType } from './block-types.js';

export function exportQuestFile(doc) {
  return JSON.stringify(buildQuestExportBundle(doc), null, 2);
}

export function buildQuestExportBundle(doc) {
  const quests = doc.quests || [];
  const mainQuests = quests.filter((quest) => !isSideQuest(quest));
  const sideQuests = quests.filter(isSideQuest);
  const validationWarnings = validateQuestFile(doc);
  const questFiles = quests.map((quest) => buildRuntimeQuestFile(quest, doc, validationWarnings));
  const files = [
    {
      path: 'quests/quest-index.json',
      role: 'quest-index',
      content: buildIndexFile(mainQuests, 'quest')
    },
    {
      path: 'sidequests/sidequest-index.json',
      role: 'sidequest-index',
      content: buildIndexFile(sideQuests, 'sidequest')
    },
    ...questFiles.map((file) => ({
      path: runtimeQuestPath(file),
      role: file.type === 'side' || file.type === 'errand' ? 'sidequest-runtime' : 'quest-runtime',
      content: file
    }))
  ];
  const bundle = {
    schemaVersion: 'artifex.questExportBundle.v1',
    generatedBy: 'quest-builder',
    sourceFileId: doc.id || 'quest_file',
    sourceFileName: doc.name || 'Untitled Quest File',
    defaultChronicleId: doc.defaultChronicleId || 'chronicle_01',
    projectTarget: 'projects/<project-id>/',
    exportTargets: [
      'projects/<project-id>/quests/quest-index.json',
      'projects/<project-id>/quests/quest_<slug>.json',
      'projects/<project-id>/sidequests/sidequest-index.json',
      'projects/<project-id>/sidequests/sidequest_<slug>.json'
    ],
    files,
    validationSummary: summariseWarnings(validationWarnings),
    validationWarnings
  };
  return {
    ...bundle,
    exportSelfCheck: verifyExportBundleShape(bundle),
    splitExportPlan: buildSplitExportPlan(files)
  };
}

export function buildSplitExportPlan(files = []) {
  return {
    mode: 'browser-multi-download',
    packageFormat: 'loose-json-files',
    zipSupported: false,
    reason: 'Quest Builder can download individual JSON files without adding a ZIP dependency. A future shared exporter can add ZIP packaging across all Artifex apps.',
    instructions: [
      'Export JSON downloads one single bundle for review or transfer.',
      'Export Project Files downloads each virtual project-package file separately.',
      'Place downloaded files into the matching project package folders shown in each filename/path.'
    ],
    files: files.map((file) => ({
      path: file.path,
      role: file.role,
      filename: pathToDownloadName(file.path)
    }))
  };
}

export function buildIndexFile(quests, kind = 'quest') {
  return {
    schemaVersion: kind === 'sidequest' ? 'artifex.sidequestIndex.v1' : 'artifex.questIndex.v1',
    generatedBy: 'quest-builder',
    count: quests.length,
    items: quests.map((quest) => {
      const slug = slugify(quest.id || quest.name || 'quest');
      return {
        id: quest.id || `${kind}_${slug}`,
        slug,
        name: quest.name || 'Untitled Quest',
        type: quest.type || 'main',
        file: `${kind === 'sidequest' ? 'sidequests' : 'quests'}/${kind}_${slug}.json`,
        thumbnail: quest.thumbnail || '📜',
        chronicleId: quest.chronicleId || 'chronicle_01',
        callingText: quest.callingText || '',
        completionFlag: quest.completionFlag || '',
        sceneIds: quest.sceneIds || [],
        objectIds: quest.objectIds || [],
        blockCount: (quest.blocks || []).length,
        status: validationStatusForQuest(quest)
      };
    })
  };
}

export function buildRuntimeQuestFile(quest, doc, allWarnings = []) {
  const side = isSideQuest(quest);
  const slug = slugify(quest.id || quest.name || 'quest');
  const blocks = (quest.blocks || []).map((block, index) => buildRuntimeBlock(block, index));
  const questWarnings = allWarnings.filter((warning) => warning.questId === (quest.id || quest.name));

  return {
    schemaVersion: side ? 'artifex.sidequest.v1' : 'artifex.quest.v1',
    generatedBy: 'quest-builder',
    sourceFileId: doc.id || 'quest_file',
    id: quest.id || `${side ? 'sidequest' : 'quest'}_${slug}`,
    slug,
    name: quest.name || 'Untitled Quest',
    type: quest.type || 'main',
    thumbnail: quest.thumbnail || '📜',
    chronicleId: quest.chronicleId || doc.defaultChronicleId || 'chronicle_01',
    callingText: quest.callingText || '',
    completionFlag: quest.completionFlag || '',
    metadata: {
      notes: quest.notes || '',
      rewards: quest.rewards || [],
      codiceUpdates: quest.codiceUpdates || []
    },
    links: collectQuestLinks(quest),
    flow: {
      start: { type: 'start', label: 'START' },
      blocks,
      end: { type: 'end', label: 'END', completionFlag: quest.completionFlag || '' }
    },
    validationWarnings: questWarnings
  };
}

export function buildRuntimeBlock(block, index) {
  const type = block.type || 'custom';
  const meta = getBlockType(type);
  return {
    id: block.id || `block_${String(index + 1).padStart(2, '0')}_${slugify(block.name || meta.name)}`,
    order: index + 1,
    name: block.name || meta.name,
    type,
    category: meta.category || 'custom',
    sourceModule: meta.sourceModule || 'quest-builder',
    thumbnail: block.thumbnail || meta.emoji,
    primaryField: meta.primaryField || 'action',
    requiredFields: meta.requiredFields || [],
    linkedFields: meta.linkedFields || [],
    refs: compactObject({
      sceneId: block.sceneId,
      objectId: block.objectId,
      dialogueId: block.dialogueId,
      audioId: block.audioId
    }),
    gameplay: compactObject({
      action: block.action,
      condition: block.condition
    }),
    feedback: compactObject({
      uiOverlay: block.uiOverlay,
      capraFeedback: block.capraFeedback
    }),
    notes: block.notes || ''
  };
}

export function validateQuestFile(doc) {
  const warnings = [];
  const questIds = new Set();
  (doc.quests || []).forEach((quest, questIndex) => {
    const questTarget = quest.id || quest.name || `quest_${questIndex + 1}`;
    if (!quest.id) addWarning(warnings, 'error', questTarget, 'Quest is missing id.', questTarget);
    if (quest.id && questIds.has(quest.id)) addWarning(warnings, 'error', questTarget, `Duplicate quest id: ${quest.id}`, questTarget);
    if (quest.id) questIds.add(quest.id);
    if (!quest.name) addWarning(warnings, 'warning', questTarget, 'Quest is missing name.', questTarget);
    if (!quest.callingText) addWarning(warnings, 'warning', questTarget, 'Quest is missing Calling text.', questTarget);
    if (!(quest.blocks || []).length) addWarning(warnings, 'warning', questTarget, 'Quest has no flow blocks.', questTarget);

    const blockIds = new Set();
    (quest.blocks || []).forEach((block, blockIndex) => {
      const blockType = getBlockType(block.type);
      const blockTarget = block.id || block.name || `${questTarget}:block_${blockIndex + 1}`;
      if (!block.id) addWarning(warnings, 'info', blockTarget, 'Block has no stable id; export will generate one.', questTarget);
      if (block.id && blockIds.has(block.id)) addWarning(warnings, 'error', blockTarget, `Duplicate block id in quest: ${block.id}`, questTarget);
      if (block.id) blockIds.add(block.id);
      if (!block.type) addWarning(warnings, 'warning', blockTarget, 'Block is missing type.', questTarget);
      if (block.type && blockType.category === 'custom') addWarning(warnings, 'info', blockTarget, `Block uses custom/unknown type: ${block.type}`, questTarget);
      (blockType.requiredFields || []).forEach((field) => {
        if (!String(block[field] || '').trim()) {
          addWarning(warnings, 'warning', blockTarget, `${blockType.name} is missing required field: ${field}`, questTarget);
        }
      });
      if (block.type === 'action' && block.dialogueId && !block.objectId) {
        addWarning(warnings, 'info', blockTarget, 'Player Action links dialogue but has no object/NPC ID.', questTarget);
      }
      if (block.type === 'action' && /^(speak|talk|give|use|inspect|collect|interact):/.test(block.action || '') && !block.objectId) {
        addWarning(warnings, 'warning', blockTarget, 'Player Action appears to target an object/NPC but objectId is empty.', questTarget);
      }
      if (block.type === 'dialogue' && (block.action || block.condition)) {
        addWarning(warnings, 'info', blockTarget, 'Dialogue block should usually be a linked content asset; use Player Action for the player task.', questTarget);
      }
      if (block.type === 'completion' && !block.condition && !quest.completionFlag) {
        addWarning(warnings, 'warning', blockTarget, 'Completion block needs a condition or quest completion flag.', questTarget);
      }
      if (needsProjectResolution(block) && !hasProjectResolvableReference(block)) {
        addWarning(warnings, 'warning', blockTarget, 'Block has no Project Manager-resolvable scene/object/dialogue/audio ID.', questTarget);
      }
    });
  });
  return warnings;
}

export function collectQuestLinks(quest) {
  const blocks = quest.blocks || [];
  return {
    sceneIds: unique([...(quest.sceneIds || []), ...blocks.map((block) => block.sceneId)]),
    objectIds: unique([...(quest.objectIds || []), ...blocks.map((block) => block.objectId)]),
    dialogueIds: unique(blocks.map((block) => block.dialogueId)),
    audioIds: unique(blocks.map((block) => block.audioId)),
    conditions: unique(blocks.map((block) => block.condition)),
    actions: unique(blocks.map((block) => block.action)),
    uiOverlays: unique(blocks.map((block) => block.uiOverlay)),
    capraFeedback: unique(blocks.map((block) => block.capraFeedback)),
    codiceUpdates: quest.codiceUpdates || [],
    rewards: quest.rewards || []
  };
}

export function verifyExportBundleShape(bundle) {
  const checks = [];
  const pass = (id, ok, message) => checks.push({ id, ok, message });
  pass('bundle-schema', bundle.schemaVersion === 'artifex.questExportBundle.v1', 'Bundle schema is artifex.questExportBundle.v1.');
  pass('files-array', Array.isArray(bundle.files), 'Bundle includes files array.');
  pass('quest-index', hasFile(bundle, 'quests/quest-index.json'), 'Bundle includes quest index file.');
  pass('sidequest-index', hasFile(bundle, 'sidequests/sidequest-index.json'), 'Bundle includes sidequest index file.');
  pass('warnings-array', Array.isArray(bundle.validationWarnings), 'Bundle includes validationWarnings array.');
  pass('summary-counts', ['error', 'warning', 'info'].every((key) => Number.isInteger(bundle.validationSummary?.[key])), 'Bundle includes validation summary counts.');
  (bundle.files || []).filter((file) => file.role === 'quest-runtime' || file.role === 'sidequest-runtime').forEach((file) => {
    pass(`runtime-${file.content?.id || file.path}`, Boolean(file.content?.flow && Array.isArray(file.content.flow.blocks)), `${file.path} includes runtime flow blocks.`);
    pass(`links-${file.content?.id || file.path}`, Boolean(file.content?.links), `${file.path} includes resolved links bucket.`);
  });
  return {
    status: checks.every((check) => check.ok) ? 'pass' : 'fail',
    checkedAt: new Date().toISOString(),
    checks
  };
}

export function downloadProjectPackageFiles(bundle) {
  const files = bundle.files || [];
  files.forEach((file, index) => {
    setTimeout(() => {
      downloadJson(pathToDownloadName(file.path), JSON.stringify(file.content, null, 2));
    }, index * 180);
  });
  return files.length;
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

function pathToDownloadName(path) {
  return String(path || 'quest-file.json').replace(/\//g, '__');
}

function runtimeQuestPath(file) {
  const side = file.type === 'side' || file.type === 'errand';
  return `${side ? 'sidequests/sidequest' : 'quests/quest'}_${file.slug}.json`;
}

function isSideQuest(quest) {
  return quest.type === 'side' || quest.type === 'errand';
}

function unique(values) {
  return [...new Set((values || []).filter((value) => String(value || '').trim()))];
}

function compactObject(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => String(value || '').trim()));
}

function addWarning(warnings, level, target, message, questId) {
  warnings.push({ level, target, questId, message });
}

function validationStatusForQuest(quest) {
  const warnings = validateQuestFile({ quests: [quest] });
  if (warnings.some((warning) => warning.level === 'error')) return 'error';
  if (warnings.some((warning) => warning.level === 'warning')) return 'warning';
  return 'ready';
}

function summariseWarnings(warnings) {
  return warnings.reduce((summary, warning) => {
    summary[warning.level] = (summary[warning.level] || 0) + 1;
    return summary;
  }, { error: 0, warning: 0, info: 0 });
}

function needsProjectResolution(block) {
  return ['scene', 'action', 'object', 'dialogue', 'travel', 'route', 'combat', 'companion'].includes(block.type);
}

function hasProjectResolvableReference(block) {
  return Boolean(block.sceneId || block.objectId || block.dialogueId || block.audioId);
}

function hasFile(bundle, path) {
  return (bundle.files || []).some((file) => file.path === path);
}
