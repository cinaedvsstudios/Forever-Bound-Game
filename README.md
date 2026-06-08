# Forever Bound Game

A lightweight browser-based 2D companion game and Artifex authoring workspace for Forever Bound.

## Active Artifex documentation

The controlled Artifex documentation source of truth is:

```text
docs/artifex/00A-index.md
```

Use that index for the active `00A`–`23A` Artifex specifications, the universal project-file contract, and the global Artifex to-do list. Superseded module notes, audits, handoffs, local todos, and older README-style docs are retained under `docs/archive/` as historical evidence only.

## Running the prototype locally

Open `index.html` in a browser. If browser security blocks local JSON loading, serve the repository root with a local server instead:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Repository map

```text
artifex/      Artifex authoring apps, shared services, templates, and tool assets.
assets/       Runtime game assets.
data/         Runtime game data.
docs/artifex/ Active controlled Artifex documentation.
docs/archive/ Historical documentation archive.
src/          Runtime source code.
```
