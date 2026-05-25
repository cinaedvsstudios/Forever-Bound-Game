/* User-facing label cleanup map for the Artifex Effect Editor UI pass. */

export const UI_LABEL_REPLACEMENTS = {
    'Tactical HUD': 'Preview Guides',
    'Active Grid': 'Preview Grid',
    'Layer Diagnostics': 'Active Layer Summary',
    'HUD Reticle': 'Emitter Guide',
    'Projection Angle': 'Direction',
    'Target Schema': 'JSON Output',
    'Interactive Coordinate Grid': 'Preview Grid',
    'Engine Architecture': 'Effect Engine',
    'Layer Identifier Name': 'Layer Name',
    'Transform Dynamics': 'Motion / Dynamics',
    'Visual Configuration': 'Visuals',
    'Temporal Duration': 'Timing',
    'Mouse Lock': 'Emitter Follows Mouse',
    'Floor Bounce': 'Preview Floor Collision'
};

export function cleanUiLabel(label) {
    return UI_LABEL_REPLACEMENTS[label] || label;
}

export function getUiLabelReplacementEntries() {
    return Object.keys(UI_LABEL_REPLACEMENTS).map(function(from) {
        return { from: from, to: UI_LABEL_REPLACEMENTS[from] };
    });
}
