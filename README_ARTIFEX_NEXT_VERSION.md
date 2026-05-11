# Artifex Next Version Files

Copy these files into the matching locations in your Forever Bound Game GitHub repository.

## What changed

- Static Screen / Travel Mode / UI Screen mode toggle.
- Scene Mode and Battle Mode visible but disabled for later.
- Current title screen moved into `data/screens/title_screen.json`.
- Editor settings moved into `data/editor/editor_settings.json`.
- Help guide expanded, draggable, and resizable.
- Tutorial mode for Editor, Travel Mode, and UI Editor.
- Image URL fields live-preview by changing placeholder visuals.
- Audio fields include Play, Stop, Loop, Volume, and load status.
- Eye button shows/hides editor guides.
- Toggle buttons turn purple when active.
- JSON preview can be shown/hidden.
- JSON export/download remains the safe manual GitHub workflow.

## Workflow

1. Put PNG/MP3/OGG files into GitHub folders.
2. Paste the path into Artifex.
3. Preview the image/audio.
4. Download the edited JSON.
5. Replace the JSON file in GitHub manually.
6. Refresh the game.

## Launch

Normal game: `npm run dev`

Artifex editor: click `Artifex Editor` on the title screen, or add `?editor=1` to the URL.
