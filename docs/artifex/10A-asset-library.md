# Asset Library Specification

Status: Active module specification draft.

Asset Library owns final registered `asset_` records.

It owns `assets/asset-index.json`, final files under `assets/`, asset metadata, asset groups, and promotion from `intake/` into final indexed project assets.

No finished standalone Asset Library app route was verified in current `main` as of 6 June 2026.

`intake/` is staging only.

Authoring modules must reference final registered `asset_` IDs, not intake paths or browser-only data.

Asset Library does not own scene layout, object definitions, effect definitions, quests,