# Effect Editor Phase 1B Scope — Insert Menu + Performance Note

Branch: `effect-editor-reapply-phase1b`
Base: `effect-editor-reapply-phase1`

## Confirmed Phase 1 result

Manual test showed the restored render baseline is alive again:

- grid renders
- effects render visibly
- the restored/pre-resolution render path produces better-looking effects than the broken resolution branch
- effects can be loaded from the left panel

## Remaining Phase 1 issue

The Insert menu is empty / not usable in the browser test.

This must be fixed before the branch is merged forward because normal workflow depends on Insert -> Base Layer.

## Phase 1B allowed code changes

Only these changes are allowed:

1. Repair top dropdown visibility/click/hover behaviour if needed.
2. Repair `initPresetLists()` so `acc-base`, `acc-comp`, and `acc-cust` visibly populate.
3. Keep current wording:
   - Base Layer
   - Effect Archetype Assets
   - Custom Effect temporarily, until the proper library browser returns.
4. Do not change particle rendering.
5. Do not change canvas scale or resolution.
6. Do not change particle coordinate conversion.
7. Do not add hidden repair scripts in preset files.

## Insert menu acceptance test

1. Open Phase 1B URL.
2. Click or hover Insert.
3. Base Layer section must show entries.
4. Click Standard Particle / first base entry.
5. A visible effect/layer should be added.
6. Effect Archetype Assets section should show Verdant Spell Burst / Ember Projectile or equivalent current composites.
7. Resize side and bottom panels.
8. Particles must remain visible.

## Performance observation from Phase 1 test

The effect looked good, but performance was very slow. Screenshot showed around 568 particles and about 2 FPS.

Likely causes, in order:

1. Heavy glow/shadowBlur on many particles and ring layers.
2. Blurred gas/smoke layer (`blur` around 8–10) plus large particle size.
3. High particle count across 3 visible layers.
4. High-DPI canvas scale around 1.38x.
5. Blue glowing splitters/header are visually loud, but probably not the main render cost compared with canvas blur/glow.

## Performance handling rule

Do not fix performance in Phase 1B unless it is purely UI-only. First fix Insert menu. Performance gets its own controlled pass after Insert works.

Later performance pass should add:

- Low Performance Mode back into View menu.
- Particle cap per layer and global cap.
- Blur/glow safety caps.
- Option to pause preview after loading an effect.
- Default composites tuned to lower particle counts.
- Prefer brush PNGs over expensive canvas blur for smoke/fire texture.

## Do not do in Phase 1B

- Do not reintroduce the broken resolution preset system.
- Do not rebuild the side panel cards yet.
- Do not add brush sequence animation yet.
- Do not modularise the renderer yet.
- Do not change particle math.
