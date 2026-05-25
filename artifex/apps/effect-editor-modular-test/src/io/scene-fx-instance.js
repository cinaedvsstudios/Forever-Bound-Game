/* Scene Editor adapter helpers for placing FX assets as scene FX instances. */

export function createSceneFxInstanceFromAsset(fxAsset, placement) {
    placement = placement || {};

    if (!fxAsset || !fxAsset.id) {
        throw new Error('A valid FX asset with an id is required.');
    }

    return {
        id: placement.id || fxAsset.id + '_instance_' + Date.now().toString(36),
        type: 'fxInstance',
        archetypeId: fxAsset.id,
        asset: placement.asset || 'data/fx/archetypes/' + fxAsset.id + '.json',
        enabled: placement.enabled !== false,
        x: Number(placement.x) || 0,
        y: Number(placement.y) || 0,
        scale: placement.scale === undefined ? 1 : Number(placement.scale),
        rotation: Number(placement.rotation) || 0,
        opacity: placement.opacity === undefined ? 1 : Number(placement.opacity),
        layer: placement.layer || fxAsset.defaultLayer || 'frontOfCharacters',
        attachTo: placement.attachTo || null,
        trigger: placement.trigger || null,
        overrides: placement.overrides || {}
    };
}

export function appendFxInstanceToScene(sceneJson, fxInstance) {
    const scene = Object.assign({}, sceneJson || {});
    const effects = Array.isArray(scene.effects) ? scene.effects.slice() : [];
    effects.push(fxInstance);
    scene.effects = effects;
    return scene;
}

export function removeFxInstanceFromScene(sceneJson, fxInstanceId) {
    const scene = Object.assign({}, sceneJson || {});
    scene.effects = Array.isArray(scene.effects)
        ? scene.effects.filter(function(effect) { return effect.id !== fxInstanceId; })
        : [];
    return scene;
}
