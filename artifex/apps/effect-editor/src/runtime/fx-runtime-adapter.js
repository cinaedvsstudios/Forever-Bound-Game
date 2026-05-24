/*
 * Runtime adapter scaffold for playing FX assets outside the editor UI.
 *
 * The long-term goal is for the FX Editor, Scene Editor, Playtest, and final game
 * runtime to share the same small rendering/runtime layer instead of loading the
 * whole editor interface.
 */

export class ArtifexFxRuntimeAdapter {
    constructor(canvas, options) {
        this.canvas = canvas;
        this.options = options || {};
        this.effectAsset = null;
        this.composition = null;
        this.isPlaying = false;
        this.time = 0;
    }

    loadEffectAsset(effectAsset) {
        this.effectAsset = effectAsset;
        this.composition = effectAsset && effectAsset.composition ? effectAsset.composition : effectAsset;
        this.time = 0;
        return this;
    }

    play() {
        this.isPlaying = true;
        return this;
    }

    pause() {
        this.isPlaying = false;
        return this;
    }

    stop() {
        this.isPlaying = false;
        this.time = 0;
        return this;
    }

    update(deltaSeconds) {
        if (!this.isPlaying) return;
        this.time += Number(deltaSeconds) || 0;
    }

    draw() {
        // Placeholder until the original Particle/engine renderer is extracted.
        // The adapter intentionally exists now so Scene Editor integration has a stable target.
        return {
            canvas: this.canvas,
            effectId: this.effectAsset && this.effectAsset.id,
            layerCount: this.composition && Array.isArray(this.composition.layers) ? this.composition.layers.length : 0,
            time: this.time
        };
    }
}
