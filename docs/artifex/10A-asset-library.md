# Asset Library Specification

Status: Active module specification draft.

Asset Library owns final registered assets.

It owns:
- `asset_` IDs
- `assets/asset-index.json`
- final files under `assets/`
- asset metadata and groups
- promotion from `intake/` to final indexed assets

No standalone Asset Library app route is verified yet.

`intake/` is staging only.

Other modules must reference final `asset_` IDs.