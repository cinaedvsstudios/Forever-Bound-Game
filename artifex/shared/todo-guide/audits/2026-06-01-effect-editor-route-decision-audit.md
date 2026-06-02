# Effect Editor Route Decision Audit — Accepted Index2 Baseline and Later Refresh

## Status

Date originally recorded: 2026-06-01.  
Current-main refresh recorded: 2026-06-02.

This record captures the read-only Effect Editor route comparison, the user's deployed-browser review, the approved minimal Hub route cutover, and the later accepted Index2 work now merged on GitHub `main`.

It is a status and planning record only. It does not authorise new feature implementation, route deletion, archive movement or save-contract work.

## Decision summary — current accepted baseline

Accepted Effect Editor baseline now on current `main`:

```text
Active route: artifex/apps/effect-editor/index2.html
Visible/cache label: INDEX2-CLEAN-0.2.6
Hub route: artifex/apps/effect-editor/index2.html?from=hub
```

Old emergency route retained as reference/rollback material, not as the accepted continued editor route:

```text
artifex/apps/effect-editor/index.html
```

The clean `index2.html` route remains accepted because the user manually reviewed both deployed pages and confirmed that Index2 is the good complete-rewrite version, while the old default route is the emergency/repair version. Later merged Index2 work has since repaired and extended that accepted route; the original `INDEX2-CLEAN-0.2.3` label is now historical, not current.

## Original route audit finding and completed cutover

Before manual review, the read-only route audit established:

```text
- The Hub was directing users to apps/effect-editor/?from=hub, which resolved to the old default index route.
- The default route loaded active emergency/rescue debt.
- index2 loaded a cleaner modular route based around index2-app and named functional owners.
- index2 retained the core Effect Editor purpose and presented a materially more complete usable editor surface.
- Neither route completed connected-project save/effect-index contract work.
```

The user's deployed-browser comparison confirmed:

```text
- index2 is the good rewritten Effect Editor interface.
- The old default route is the visibly inferior emergency interface.
- The rewrite had not been lost; it had simply not been the route opened from Hub/default navigation.
```

PR #25, **Route Effect Editor hub link to accepted index2 baseline**, was reviewed and merged into `main` on 1 June 2026.

```text
PR: #25
Merge commit: a4a1bc9f03fe1c3e9ed08c066851adb8743bc520
Scope: Hub-link-only route cutover; no Effect Editor implementation files changed.
FROM: apps/effect-editor/?from=hub
TO:   apps/effect-editor/index2.html?from=hub
```

## Later accepted Index2 work now merged on current main

The original route decision identified three missing parity feature areas: Rotation Direction modes, Orbital Force and ALL CAPS text. Those gaps have since been implemented and are no longer pending work.

| PR | Merged current-main outcome |
|---|---|
| #27 | Ported Rotation Direction modes, Orbital Force and ALL CAPS text control into accepted Index2 permanent modules. |
| #28 | Repaired Index2 text-layer and inline layer-delete behaviour; later user corrections to layout/text defaults were applied in #29. |
| #29 | Restored required Effect Specific Controls placement, bottom-right diagnostics behaviour and intended Rising Spell Text sample; retained the deletion repair. |
| #30 | Added the missing local `finite` helper needed by Dynamics/Orbital Force display synchronisation and Quick Edit helpers. |
| #31 | Added the missing `setText` helper in Dynamics controls. |
| #32 | Restored the ARTIFEX rune/header toolbar grouping and corrected Rotate/Degree Range wiring to emitter direction/spread ownership. |
| #33 | Restored the already-existing Brush / Shape Library to Index2 and advanced the visible/cache label to `INDEX2-CLEAN-0.2.6`. |
| #34 | Added Effect Editor backlog items for library browsing, visible Save and emission-guide work. |
| #35 | Recorded confirmed visual/reference examples and future My Settings / pinned-controls restoration. |
| #36 | Updated the current-main baseline matrix to recognise the accepted Index2 0.2.6 position. |

Confirmed from the current `index2.html` entry point:

```text
- visible badge: INDEX2-CLEAN-0.2.6;
- ARTIFEX rune mark and grouped toolbar markup;
- Rotation Direction and Degree Range controls;
- Orbital Force control;
- Effect Specific Controls retained in the left settings panel;
- Brush / Shape Library loaded by the accepted Index2 route through the merged restoration work.
```

## Current Effect Editor position

| Area | Accepted current status |
|---|---|
| Continued UI/runtime baseline | `index2.html` / `INDEX2-CLEAN-0.2.6`. |
| Hub navigation | Directs to `apps/effect-editor/index2.html?from=hub`. |
| Original missing parity features | Implemented through merged PR #27 and retained through later repairs. |
| Header/emitter/brush-library repairs | Implemented through merged PRs #32–#33. |
| Old emergency route | Retained as reference/rollback material; it is not the accepted implementation baseline. |
| Emergency/rescue archive work | Not automatically authorised merely because Index2 is accepted. |
| Connected-project save/effect-index contract work | Still separate future work; not resolved by baseline choice or local Save behaviour. |
| Effect Library thumbnails/previews | Recorded future work. |
| Emission marker/cone guides | Recorded future work. |
| Additional FX engines and preset-quality work | Recorded future work. |
| My Settings / pinned-control restoration | Recorded future work. |

## Recommended future Effect Editor scope

Any later Effect Editor work must start from current `main` and select a fresh bounded feature/save/polish pass. It must not be framed as implementing the original route decision or the three original missing parity behaviours, because those are already present in the accepted Index2 baseline.

Potential later separately approved lanes include:

```text
- Effect Library browser with thumbnails/previews;
- visible Effect Archetype Assets save/status and connected-project effect-index integration;
- emitter width and degree-range visual guides;
- additional real FX engines and preset quality work;
- My Settings / pinned-control restoration;
- separately verified cleanup of legacy/emergency debt where that gives a clear benefit.
```

## Out of scope unless separately approved

```text
- Removing, redirecting, rewriting or archiving the old emergency route.
- Moving old rescue files into archive.
- Connected-folder saving or canonical effect-index integration.
- Broad Effect Editor redesign.
- Global aspect/logo conversion beyond already merged accepted Index2 changes.
- Work in any other app.
```
