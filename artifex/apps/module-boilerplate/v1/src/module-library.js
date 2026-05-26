export const STARTER_TEMPLATES = [
  {
    id: 'template_generic',
    name: 'Generic Record',
    description: 'A neutral blank record with no module-specific meaning.',
    record: {
      name: 'Generic Record',
      type: 'generic',
      category: 'uncategorised',
      tags: ['template'],
      notes: 'Replace this with a module-specific record.',
      properties: {}
    }
  },
  {
    id: 'template_asset_link',
    name: 'Asset-Linked Record',
    description: 'A starter record with a placeholder asset path property.',
    record: {
      name: 'Asset-Linked Record',
      type: 'asset-linked',
      category: 'assets',
      tags: ['asset', 'placeholder'],
      notes: 'Use this when the module needs to point to an asset library file.',
      properties: {
        assetPath: '',
        assetId: '',
        previewMode: 'fit'
      }
    }
  },
  {
    id: 'template_runtime_definition',
    name: 'Runtime Definition',
    description: 'A starter record intended to become game-readable JSON.',
    record: {
      name: 'Runtime Definition',
      type: 'runtime-definition',
      category: 'runtime',
      tags: ['runtime', 'json'],
      notes: 'Use this when the module exports data consumed by the game engine.',
      properties: {
        enabled: true,
        runtimeKey: '',
        priority: 0
      }
    }
  }
];

export function getTemplate(templateId) {
  return STARTER_TEMPLATES.find((template) => template.id === templateId) || null;
}

export function cloneTemplateRecord(templateId) {
  const template = getTemplate(templateId);
  if (!template) return null;
  return JSON.parse(JSON.stringify(template.record));
}
