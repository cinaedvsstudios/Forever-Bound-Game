# Effect Editor To-Do and Confirmed Visual References

## Status

These items are Effect Editor-specific implementation targets confirmed during Index2 review on 2026-06-01. They supplement the shared machine-readable backlog in `artifex/shared/todo-guide/all-apps-todos.json` and should be reconciled into it during the next planned to-do maintenance pass, rather than triggering another runtime edit now.

## Confirmed missing/restorable UI

### Restore My Settings / favourite pinned controls panel

Restore the accepted behaviour from the existing inactive source reference `artifex/apps/effect-editor/v3/src/v327-my-settings.js` as a normal Index2-owned module, not by reactivating a legacy patch layer.

Required behaviour:

- floating `My Settings` panel over the workspace;
- subtitle/empty state explaining that favourite controls may be pinned there;
- draggable and collapsible panel;
- Edit mode adds pin controls beside eligible left-panel and Effect Specific Controls inputs;
- pinned controls remain live copies of the real editor controls;
- selected controls and floating-panel position persist locally;
- integrate cleanly with accepted Index2 layout and version/cache rules.

## Confirmed FX visual references

| Target effect / engine | Approved reference URL | Required interpretation for Forever Bound / Artifex |
|---|---|---|
| Lens flare / light glint overlay | `https://threejs.org/examples/webgl_lensflares.html` | Use this as the visual/motion reference and combine it with the user's existing circle overlay asset to complete the lens flare effect. |
| Underworld oil droplets / living black oil | `https://threejs.org/examples/webgl_marchingcubes.html` | Treat the blob/droplet look as the Underworld oil effect target, regardless of the Three.js example's technical `marching cubes` name. |
| Futuristic HUD bloom | `https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html` | Keep as a general Artifex FX option even if it is not specifically Forever Bound-themed. Also support a user-uploaded PNG/image version that can receive a similar luminous bloom treatment. |
| Sunlight rays | `https://threejs.org/examples/webgl_postprocessing_godrays.html` | Preserve a God Rays/sunlight engine target, presented as sunlight/light shafts rather than only a generic post-processing label. |
| Interactive water surface | `https://threejs.org/examples/webgl_gpgpu_water.html` | Prefer this water reference over earlier water options; use it as the target for disturbed/rippled interactive water behaviour. |
| Shockwave / impact ring | `https://filters.pixijs.download/main/examples/index.html?enabled=Shockwave` | Keep as the visual target for a shockwave/radial impact effect. |
| Ground fog | `https://playcanvas.vercel.app/#/shaders/ground-fog` | Use this as the target reference for low ground-level drifting fog/mist. |

## Requested effect targets still needing a chosen reference

### Explosion

Add a proper explosion effect/engine target. It should be capable of a game-usable impact burst rather than only a screen filter, likely combining expanding flash/core, particles/embers, smoke and optional shockwave. Select a final visual reference before implementation.

### Storm

Add a storm/weather effect target. It should be capable of storm atmosphere such as rain, wind-driven particles/mist and lightning/flashes where appropriate. Select a final visual reference before implementation.

## Already represented in shared backlog

The shared to-do list already tracks the following, and these confirmed references should guide those tasks rather than create competing implementations:

- real FX engines including mist/fog, rain/weather, lens flare, heat warping and distortion;
- Effect Library browser with thumbnails/previews;
- visible Save action in Effect Archetype Assets;
- emitter-width markers and live Degree Range cone guides;
- brush/overlay/icon asset loader completion.
