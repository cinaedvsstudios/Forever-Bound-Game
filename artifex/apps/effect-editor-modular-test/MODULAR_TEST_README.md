# Effect Editor Modular Test Folder

This folder is an isolated copy for testing. It does not replace the live `artifex/apps/effect-editor/` folder.

Test this URL/path after upload:
`artifex/apps/effect-editor-modular-test/index.html`

First goal:
- prove the editor can be packaged and tested outside the production folder
- keep the live editor untouched
- use this folder for module-splitting experiments

Manual checks:
1. Page loads.
2. Grid appears.
3. Insert menu opens.
4. Insert > Base Layer / Standard Particle creates visible particles.
5. Menus still open.
6. Sliders still affect the active layer.
7. Side/bottom resize does not kill render.
