# Asset Library Specification

Status: Active module/service specification draft during documentation consolidation
Owning module/service: Asset Library
Active route: no finished standalone Asset Library app route verified in current `main` as of 6 June 2026
Current baseline: final registered asset ownership exists as a project-file/index contract and shared registered-content dependency, not as a complete user-facing app.
Governing contract: `docs/artifex/1A-project-file-contracts.md`
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Asset Library owns final registered project assets. It is the authority for stable `asset_` records, final asset metadata, final project-relative asset files, asset groups and promotion of approved source material from `intake/` into `assets/`.

## Ownership

Asset Library owns:
- `assets/asset-index.json` records and stable `asset_` IDs.
- Final asset files under `assets/`.
- Asset metadata such as name, type, asset kind, file path, source filename, tags, status and grouping.
- Promotion of approved supplied files