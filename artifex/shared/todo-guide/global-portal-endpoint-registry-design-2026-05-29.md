# Global Portal Endpoint Registry · Design Decision

Status: approved design direction, not yet implemented
Date: 2026-05-29
Owner: shared project model / Project Manager
Related apps: Puzzle Creator, Scene Editor, Quest Builder, Project Manager, Build Game

## Why this is global

A Portal is not a Maze-only mechanic. A Portal can begin in a maze, a scene, a travel route, a quest location or another future playable space, then send the player to an endpoint created somewhere else in the same game project.

Therefore Portal data must not live only inside Puzzle Creator JSON. Puzzle Creator may create and edit local portal endpoints, but global linking needs a shared project registry that every relevant app can read.

## Connection types are separate mechanics

### Door

A Door is a visible in-maze connection.

- It has two placed cells inside the current maze: entry and exit.
- It transfers the player from one placed cell to the other during play testing.
- It uses a visible door image selected from the asset library or uploaded into the project asset library.
- It belongs to the maze puzzle definition, not the global Portal registry unless later promoted into a scene transition system.

### Traboule

A Traboule is a hidden passage through an apparently solid wall.

- It is not a paired teleport.
- It is placed on one wall cell or a small wall segment.
- The wall continues to render normally, but collision is disabled so the player can walk through it.
- It belongs to the maze puzzle definition.
- It should have its own placement tool and must not appear as a Door/Portal type in a paired-connection dropdown.

### Portal

A Portal is a global endpoint connection.

- It is visible or effect-rendered, with an image/effect selected from library assets or uploaded assets.
- It may link to another Portal in the same maze, another puzzle, a scene, a travel location, or any future playable destination that supports Portal endpoints.
- One-way and two-way linking must be supported.
- It is created locally by the app that owns the source placement, then registered in the shared project registry so another app can select it as a destination.

## Recommended shared project file

```text
projects/<project-id>/connections/portal-registry.json
```

Recommended schema direction:

```json
{
  "schemaVersion": "artifex.portalRegistry.v1",
  "projectId": "project_forever_bound",
  "updatedAt": "2026-05-29T00:00:00Z",
  "endpoints": [
    {
      "portalId": "portal_underworld_gate_a",
      "label": "Underworld Gate A",
      "owner": {
        "app": "puzzle-creator",
        "resourceType": "maze_puzzle",
        "resourceId": "puzzle_labyrinth_001"
      },
      "placement": {
        "cell": { "x": 14, "y": 9 },
        "sceneAnchorId": null,
        "travelNodeId": null
      },
      "visual": {
        "assetId": "asset_portal_underworld",
        "effectId": "fx_portal_underworld"
      },
      "link": {
        "destinationPortalId": "portal_catacombs_return_a",
        "direction": "two_way"
      },
      "state": {
        "enabledByFlag": null,
        "lockedUntilFlag": null
      }
    }
  ]
}
```

The final schema can change during implementation, but these concepts must remain: stable endpoint ID, owner resource, local placement, visual asset/effect, linked destination, direction, and optional game-state conditions.

## App responsibilities

### Puzzle Creator

- Creates Portal endpoints placed inside a maze.
- Allows a destination to be selected from the shared endpoint registry.
- May create an unlinked endpoint first, with a visible warning until a destination is assigned.
- Exports the local endpoint reference inside the puzzle definition and registers or updates the shared endpoint record when saving to the project.
- Keeps Doors and Traboules local to the maze rather than forcing them into the Portal registry.

### Scene Editor

- Places Portal endpoints in rooms/scenes.
- Reads the registry to link a scene portal to a maze endpoint or another scene endpoint.
- Renders the assigned visual asset/effect.

### Quest Builder

- May require or activate Portals through quest flags or objectives.
- References `portalId` values; it should not duplicate endpoint placement data.

### Project Manager

- Owns the global linking/validation view or shared connection inspector.
- Displays all Portal endpoints and links across the project.
- Reports unlinked endpoints, missing destinations, duplicate IDs, invalid owner resources and circular/one-way link concerns.

### Build Game / Health Guide

- Validates every referenced `portalId` and destination before build.
- Blocks or warns on unresolved Portal endpoints according to build rules.

## Editor behaviour required later

In any app that can place a Portal:

1. Create Portal Endpoint.
2. Select/upload its image and optional FX.
3. Place it in the owning editor surface.
4. Select destination type:
   - Unlinked / set later
   - Existing Portal endpoint in this project
   - Create paired endpoint in the current editor when appropriate
5. Choose one-way or two-way behaviour.
6. Save/update the project registry.

## Validation rules

- Every Portal endpoint must have a stable unique `portalId`.
- A linked destination must exist in the registry.
- The owning resource and local placement must exist.
- A two-way Portal must either create the reciprocal link or be flagged as incomplete.
- Deleting a Portal endpoint must warn about incoming links from other resources.
- Local editors may show an unresolved Portal, but Build Game must warn or block unresolved required links.

## Required global implementation task

Add an all-apps task for a shared Portal endpoint registry and linking contract. This affects at minimum Project Manager, Puzzle Creator, Scene Editor, Quest Builder and Build Game, and should be reflected in `docs/artifex/19-project-file-contracts.md` when the contract is implemented.
