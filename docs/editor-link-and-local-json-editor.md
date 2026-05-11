# Scene Editor Patch

This patch adds a Scene Editor button to the Forever Bound title screen and fixes the editor page so it can run directly on GitHub Pages without a build step.

Upload these files into the same paths in the repository:

- `src/main.js`
- `editor.html`
- `src/editor.js`
- `src/editor.css`

Then open the front page and press Ctrl+F5. The title screen should show a Scene Editor button before Start Game.

The editor is local-only. It does not write to GitHub. Import a scene JSON, drag things around, download the edited JSON, then upload that JSON back to GitHub manually.
