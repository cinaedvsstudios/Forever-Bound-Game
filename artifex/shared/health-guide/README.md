# Artifex Shared Health Guide

This folder contains shared project validation checks for Artifex.

Project Manager, Creation Guide, and Build Game should use this shared source instead of duplicating the same project setup checks in separate apps.

## First supported checks

- Project manifest present
- Start screen assigned
- Input map expected
- Library links expected
- Flatplan contains nodes
- Routes resolve to existing nodes
- Nodes link to scenes/screens
- Orphaned nodes reviewed

## Intended project outputs

```text
projects/<project-id>/health/latest-health-report.json
projects/<project-id>/todos/project-manager-todos.json
```

## Next work

- Add split package file checks.
- Add input-map action mapping checks.
- Add real library index checks.
- Add missing scene, quest, puzzle, archetype object, archetype effect, and asset reference checks.
