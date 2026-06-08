# Artifex Assets Library

This folder is for reusable Artifex / Forever Bound assets.

## Folder structure

```text
artifex/assets-library/
  static-images/
  animation-frames/
  animated/
```

## static-images

Use this for single still images:

```text
PNG
JPG / JPEG
WebP
SVG
AVIF, if browser support is acceptable for the target
```

Recommended defaults:

```text
PNG = UI, transparent images, sprites, icons, characters, props
JPG / JPEG = large painted backgrounds without transparency
WebP = compressed web-ready replacement for PNG/JPG when quality is acceptable
SVG = simple vector placeholders, icons, diagrams, test assets
```

## animation-frames

Use this for animation frame sequences, especially character or effect frames.

Recommended naming:

```text
character_mel_idle_0001.png
character_mel_idle_0002.png
character_mel_idle_0003.png

fx_magic_spark_0001.png
fx_magic_spark_0002.png
fx_magic_spark_0003.png
```

Recommended format:

```text
PNG or WebP
```

PNG is safest for transparent frame-by-frame animation. WebP is smaller but check quality and browser behaviour.

## animated

Use this for ready-made animated assets:

```text
GIF
WebP animated
APNG
MP4
WebM
```

Recommended defaults:

```text
GIF = simple preview only, not ideal for final game assets
Animated WebP / APNG = small looping transparent effects, if transparency is needed
MP4 = video-style animation with no transparency requirement
WebM = video-style animation, possible transparency workflows depending on encoding/browser support
```

## MP4 vs GIF

Do not automatically convert MP4 to GIF.

Use MP4 when:

```text
the asset is a video/loop without transparency
file size matters
smooth motion matters
it can be rendered through a video element or canvas/video layer
```

Use GIF only when:

```text
it is a tiny simple loop
quality is not important
large file size is acceptable
transparency is very simple
```

For game sprites or character animation, frame sequences are usually better than GIF/video because the editor/game can control exact frame timing, state changes, hit boxes, and layering.

## Future metadata

Later, assets should be indexed with tags, probably through a JSON manifest such as:

```text
asset-library.json
```

Each asset can eventually include:

```json
{
  "id": "mel_idle_front",
  "name": "Mel idle front",
  "type": "character_animation_frames",
  "folder": "animation-frames/characters/mel/idle-front/",
  "tags": ["mel", "character", "idle", "front", "transparent", "png"]
}
```
