/* Export action helpers for Artifex Effect Editor. */

import { toArtifexFxAsset, toEditorProject, stripRuntimeParticles } from './artifex-fx-schema.js';

export function buildExportPayload(composition, exportMode, options) {
    options = options || {};

    if (exportMode === 'editorProject') {
        return toEditorProject(composition);
    }

    if (exportMode === 'artifexFxAsset') {
        return toArtifexFxAsset(composition, options);
    }

    return stripRuntimeParticles(composition);
}

export function createExportFileName(composition, exportMode) {
    const rawName = (composition && composition.name) || (composition && composition.id) || 'custom-fx';
    const safeName = String(rawName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'custom-fx';

    if (exportMode === 'editorProject') return safeName + '.fxproject.json';
    if (exportMode === 'artifexFxAsset') return safeName + '.fx.json';
    return safeName + '-config.json';
}

export function downloadJson(payload, fileName) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', fileName);
    anchor.click();
}

export const EXPORT_MODES = [
    {
        id: 'rawComposition',
        label: 'Export Raw Composition',
        description: 'Current legacy editor JSON format.'
    },
    {
        id: 'editorProject',
        label: 'Export Editor Project',
        description: 'Editable FX Editor project wrapper.'
    },
    {
        id: 'artifexFxAsset',
        label: 'Export Artifex FX Asset',
        description: 'Runtime-facing FX asset for Scene Editor placement.'
    }
];
