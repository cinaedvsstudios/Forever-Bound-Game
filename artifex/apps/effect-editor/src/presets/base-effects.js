/* Artifex Effect Editor base effect preset registry.
 *
 * Base presets are intentionally small, reliable primitives. Failed visual placeholders
 * (old ribbon, shockwave, fog, toxic gas, heat shimmer) are not exposed here until the
 * runtime supports their final renderer/brush behaviour well enough to use.
 */
(function () {
    'use strict';

    window.ARTIFEX_FX_PRESETS = {
        particles: [
            {
                id: "electric-sparks",
                effectType: "particles",
                subType: "electric-sparks",
                name: "Base · Electric Sparks",
                description: "Fast additive spark particles with downward gravity and warm yellow-to-red glow.",
                tags: "base, particles, sparks, electric, warm, additive",
                emitter: { rate: 6, width: 2, widthUnit: "PX" },
                physics: { speedMin: 4, speedMax: 10, angle: 270, spread: 55, gravityY: 0.28, friction: 0.98, orbitalForce: 0 },
                visual: { sourceType: "shape", shapeMode: "shape", shape: "spark", sizeStart: 6, sizeEnd: 1, colors: ["#ffd23f", "#ee4266"], alphas: [1.0, 1.0], alphaStarts: [1.0, 0.8], alphaEnds: [0.65, 0.0], blur: 0, glow: 20, composite: "lighter" },
                life: { durationMin: 25, durationMax: 50 }
            }
        ],
        lightning: [
            {
                id: "tesla-bolt",
                effectType: "lightning",
                subType: "tesla-bolt",
                name: "Base · Electric Discharge",
                description: "Short-lived blue-white spark particles with high glow and chaotic spread.",
                tags: "base, lightning, electric, blue, additive",
                emitter: { rate: 5, width: 2, widthUnit: "PX" },
                physics: { speedMin: 6, speedMax: 12, angle: 90, spread: 360, gravityY: 0, friction: 0.9, orbitalForce: 0 },
                visual: { sourceType: "shape", shapeMode: "shape", shape: "spark", sizeStart: 4, sizeEnd: 1, colors: ["#00a1d7", "#ffffff"], alphas: [1.0, 1.0], alphaStarts: [0.8, 1.0], alphaEnds: [0.4, 0.0], blur: 0, glow: 35, composite: "lighter" },
                life: { durationMin: 10, durationMax: 20 }
            }
        ],
        projectile: [
            {
                id: "fireball",
                effectType: "projectile",
                subType: "fireball",
                name: "Base · Fireball Core",
                description: "Warm glowing projectile core travelling horizontally with a small floating lift.",
                tags: "base, projectile, fire, core, orange, additive",
                emitter: { rate: 8, width: 1, widthUnit: "PX" },
                physics: { speedMin: 4, speedMax: 6, angle: 180, spread: 5, gravityY: -0.05, friction: 0.99, orbitalForce: 0 },
                visual: { sourceType: "shape", shapeMode: "shape", shape: "circle", sizeStart: 12, sizeEnd: 2, colors: ["#ef4444", "#ffd23f"], alphas: [1.0, 1.0], alphaStarts: [0.9, 1.0], alphaEnds: [0.35, 0.0], blur: 0, glow: 30, composite: "lighter" },
                life: { durationMin: 20, durationMax: 40 }
            }
        ],
        lensflare: [
            {
                id: "anamorphic-streak",
                effectType: "lensflare",
                subType: "anamorphic-streak",
                name: "Base · Lens Flare Spark",
                description: "Blue-white optical spark/glare placeholder. Needs final line/sprite flare tuning.",
                tags: "base, lensflare, flare, optical, blue, additive, needs-improvement",
                emitter: { rate: 2, width: 1, widthUnit: "PX" },
                physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 },
                visual: { sourceType: "shape", shapeMode: "shape", shape: "star", sizeStart: 1, sizeEnd: 30, colors: ["#00a1d7", "#ffffff"], alphas: [1.0, 1.0], alphaStarts: [0.35, 0.75], alphaEnds: [0.0, 0.0], blur: 0, glow: 40, composite: "lighter" },
                life: { durationMin: 20, durationMax: 45 }
            }
        ]
    };
})();

/*
 * Download filename policy.
 * This file is loaded before the editor script, so this small boot patch waits until
 * the editor has created downloadJSONPayload(), then wraps it so every exported file
 * defaults to the Effect Archetype ID instead of the display name.
 */
(function () {
    'use strict';

    function sanitizeArchetypeFilePart(value, fallback = 'fx-archetype') {
        return String(value || fallback)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || fallback;
    }

    function getPayloadArchetypeId(payload, fallback = 'fx-archetype') {
        if (!payload || typeof payload !== 'object') return sanitizeArchetypeFilePart(fallback, fallback);
        const direct = payload.archetypeId || payload.id;
        const nested = payload.composition?.id || payload.asset?.id || payload.source?.id;
        return sanitizeArchetypeFilePart(nested || direct || payload.name || payload.label || fallback, fallback);
    }

    function getDownloadExtension(requestedName = '', payload = null) {
        const lower = String(requestedName || '').toLowerCase();
        if (lower.endsWith('.composition.json') || lower.endsWith('-composition.json')) return 'composition.json';
        if (lower.endsWith('.fxproject.json')) return 'fxproject.json';
        if (lower.endsWith('.fxinstance.json')) return 'fxinstance.json';
        if (lower.endsWith('.fx.json')) return 'fx.json';
        if (payload?.schema === 'artifex.fxEditorProject.v1') return 'fxproject.json';
        if (payload?.schema === 'artifex.sceneFxInstance.v1') return 'fxinstance.json';
        if (payload?.schema === 'artifex.fxArchetype.v1') return 'fx.json';
        return 'json';
    }

    function buildArchetypeDownloadFileName(payload, requestedName = '', fallback = 'fx-archetype') {
        const id = getPayloadArchetypeId(payload, fallback);
        const extension = getDownloadExtension(requestedName, payload);
        return `${id}.${extension}`;
    }

    function installArchetypeFilenamePolicy() {
        const originalDownload = window.downloadJSONPayload;
        if (typeof originalDownload !== 'function' || originalDownload.__artifexArchetypeFilenamePolicy) return;

        const wrappedDownload = function(payload, fileName) {
            const finalName = buildArchetypeDownloadFileName(payload, fileName, 'fx-archetype');
            return originalDownload.call(this, payload, finalName);
        };
        wrappedDownload.__artifexArchetypeFilenamePolicy = true;
        wrappedDownload.__originalDownloadJSONPayload = originalDownload;
        window.downloadJSONPayload = wrappedDownload;
    }

    window.ArtifexFxFilenamePolicy = {
        sanitizeArchetypeFilePart,
        getPayloadArchetypeId,
        getDownloadExtension,
        buildArchetypeDownloadFileName,
        installArchetypeFilenamePolicy
    };

    window.addEventListener('load', installArchetypeFilenamePolicy);
})();
