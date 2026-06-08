# Phase 8 — Import / Library Expansion

This pass adds the first practical library expansion features to the Effect Editor.

## Added

- Custom saved effects now render as thumbnail cards in the Custom Effect accordion.
- Saved thumbnails appear in the library card when present.
- Missing thumbnails fall back to a sparkle icon.
- File menu now includes `Import Effekseer Draft`.
- `.efkproj`, `.efk`, `.xml`, and `.txt` Effekseer-style project files can be imported as editable Artifex draft compositions.
- Effekseer texture references are detected and stored in `importedFrom.textureReferences`.
- Imported drafts include conversion notes so it is clear they are approximations.
- Artifex FX Asset export now lists texture dependencies from textureSprite layers in `assets.textures`.

## Test checklist

1. Open the editor.
2. Confirm no red console errors.
3. Open Insert > Custom Effect.
4. Confirm saved custom effects show as cards, with thumbnails when available.
5. Save a new custom effect with a captured thumbnail and confirm the card shows it.
6. Import an Effekseer `.efkproj` file from File > Import Effekseer Draft.
7. Confirm an editable draft composition loads.
8. Export the imported draft as Artifex FX Asset.
9. Confirm `conversionNotes`, `importedFrom`, and `assets.textures` appear where relevant.
