# Effect Editor Route Decision Audit — Accepted Index2 Baseline

## Status

Date recorded: 2026-06-01.

This record captures the read-only Effect Editor route comparison, the user's deployed-browser review, and the approved minimal Hub route cutover. It is a decision and planning record only. It does not authorise feature implementation, route deletion, archive movement or save-contract work.

## Decision summary

Accepted good Effect Editor baseline:

```text
artifex/apps/effect-editor/index2.html
Visible label: INDEX2-CLEAN-0.2.3
```

Old emergency route retained as reference/rollback material:

```text
artifex/apps/effect-editor/index.html
Observed deployed label during user review: V3.35-EMERGENCY
```

The clean `index2.html` route is accepted as the route for continued Effect Editor work because the user manually reviewed both deployed pages and confirmed that index2 is the good complete-rewrite version, while the old default route is the emergency/repair version.

## Evidence and route audit finding

Before manual review, the read-only route audit established:

```text
- The Hub was still directing users to apps/effect-editor/?from=hub, which resolved to the old default index route.
- The default route loads active emergency/rescue debt, including lower-panel cleanup and menu-grid rescue behaviour.
- index2 loads a cleaner modular route based around index2-app and named functional owners.
- index2 retained the core Effect Editor purpose and presented a materially more complete usable editor surface.
- Neither route should be treated as completing later connected-project save/effect-index contract work.
```

The user's deployed-browser comparison then confirmed:

```text
- index2 is the good rewritten Effect Editor interface.
- The old default route is the visibly inferior emergency interface.
- The rewrite has not been lost; it had simply not been the route opened from the Hub/default navigation.
```

## Completed route cutover

PR #25, **Route Effect Editor hub link to accepted index2 baseline**, was reviewed and merged into `main` on 1 June 2026.

```text
PR: #25
Merge commit: a4a1bc9f03fe1c3e9ed08c066851adb8743bc520
Scope: Hub-link-only route cutover; no Effect Editor implementation files changed.
```

Changed navigation target:

```text
FROM: apps/effect-editor/?from=hub
TO:   apps/effect-editor/index2.html?from=hub
```

Files changed by PR #25:

```text
artifex/index.html
```

Files and behaviours explicitly not changed by PR #25:

```text
- artifex/apps/effect-editor/index.html
- artifex/apps/effect-editor/index2.html
- artifex/apps/effect-editor/v3/**
- emergency/rescue files
- save/import/export behaviour
- connected-project or effect-index behaviour
- parity feature implementation
```

## Known missing parity features identified by the user

The user reviewed index2 and identified only three main missing feature areas to port later:

```text
1. Rotation-direction controls:
   - random rotation;
   - within degree range;
   - lock direction.

2. Orbital control.

3. Convert text to ALL CAPS.
```

These are now the accepted Effect Editor parity backlog. They were not included in the route cutover and require a separate scoped implementation pass.

## Current Effect Editor position

| Area | Accepted current status |
|---|---|
| Continued UI/runtime baseline | `index2.html` / `INDEX2-CLEAN-0.2.3`. |
| Hub navigation | Now directs to `apps/effect-editor/index2.html?from=hub`. |
| Old emergency route | Retained untouched for reference/rollback until later separate decision. |
| Emergency/rescue archive work | Not authorised. Must not occur merely because index2 is now accepted. |
| Connected-project save/effect-index contract work | Still separate future work; not resolved by baseline choice. |
| Global display/branding alignment | Still separate later UI/design work. |
| Missing parity features | Rotation-direction controls, orbital control, ALL CAPS text action. |

## Recommended next Effect Editor pass

Before Codex implements parity features, run a narrow read-only feature-location/mapping pass to determine where the three missing behaviours exist in the old route or repository history, how they should map into index2's permanent functional modules, and whether any of them are already partially implemented but hidden or unbound.

That analysis should produce one implementation brief for a later pass limited to the three accepted missing features. It must not reopen emergency-route repair work, archive rescue files or bundle in save-contract/global-branding work.

## Out of scope unless separately approved

```text
- Removing, redirecting, rewriting or archiving the old emergency route.
- Moving old rescue files into archive.
- Connected-folder saving or canonical effect-index integration.
- Broad Effect Editor redesign.
- Global aspect/logo conversion.
- Work in any other app.
```
