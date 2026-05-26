import { applyRoleTemplate } from './editor-state.js';
import { OBJECT_TEMPLATE_IDS, PEOPLE_TEMPLATE_IDS, ROLE_TEMPLATES } from './templates.js';

export function getTemplateGroups() {
  return {
    people: PEOPLE_TEMPLATE_IDS.map(toTemplateSummary),
    objects: OBJECT_TEMPLATE_IDS.map(toTemplateSummary)
  };
}

export function applyTemplate(templateId) {
  applyRoleTemplate(templateId);
}

function toTemplateSummary(id) {
  const template = ROLE_TEMPLATES[id];
  return {
    id,
    label: template.label,
    category: template.category,
    subtype: template.subtype,
    gameplayActions: [...template.gameplayActions],
    portraitActions: [...template.portraitActions]
  };
}
