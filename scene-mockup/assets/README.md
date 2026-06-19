# Scene Mockup Asset Library

Put reusable scene assets directly into one of these folders:

- `backgrounds/` — full-frame location art, skies, rooms, forest plates, and landscape images.
- `people/` — character sprites, poses, creatures, and crowd figures.
- `objects/` — props, effects, furniture, vehicles, UI-ready objects, and GLB models.

Supported files are PNG, JPG, JPEG, WEBP, and GLB. Keep each category folder flat for now; Scene Mockup automatically reads those three repository folders when it opens. Use the refresh button in the asset panel after new files are committed to `main`.

Image files become normal scene layers. GLB files appear in the library with a 3D-model tile; upload a matching preview PNG beside a GLB when you want a custom gallery image.

`manifest.json` is only an offline fallback. Normally it does not need editing because the live asset browser queries the repository folders directly.
