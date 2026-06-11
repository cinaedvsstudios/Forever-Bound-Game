# Maze Module

This folder now uses `index.html` as a self-contained fixed standalone maze module.

The original recovered V1.35 maze shell that was rendering incorrectly in the isolated package has been preserved as:

`recovered-original-index-broken.html`

The fixed module keeps maze generation, blank maze, solution plotting, overview, image-reference parsing, visual controls, texture use, import JSON, copy JSON, and download JSON in one isolated page so it does not depend on the old shared Artifex launcher/runtime wiring.
