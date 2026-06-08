# Legacy Object Creator Patches

These files were removed from the live `v1/src/` folder during the V1.31 cleanup because they were old patch-layer files and were no longer imported by the active app entry point.

The code is still preserved in Git history and can be recovered by looking at the blob SHAs or the commit immediately before removal.

## Removed from live source

| Former live path | Blob SHA | Status |
| --- | --- | --- |
| `artifex/apps/archetype-object-creator/v1/src/square-icon-cards-patch.js` | `02e3a83c89b60209ab01b70cd4bdaa7909f8c7a0` | Superseded by `object-template-icons.js` |
| `artifex/apps/archetype-object-creator/v1/src/object-build-checklist-wizard-patch.js` | `3ce57aeaef2e11359fbb71820499bdd53baaba79` | Superseded by `object-wizard-step5.js`, `object-wizard-frame-correction.js`, `object-wizard-reference-panel.js`, and `object-wizard-asset-package.js` |
| `artifex/apps/archetype-object-creator/v1/src/template-card-patch.js` | `43771ae1573f16ca6b458dfcb8aba889225c0f81` | Superseded by `object-template-icons.js` |
| `artifex/apps/archetype-object-creator/v1/src/icon-atlas-crop-patch.js` | `808aaf4d005377fe30e1dec9ce7d8c3295518269` | Superseded by `object-template-icons.js` |
| `artifex/apps/archetype-object-creator/v1/src/right-panel-layout-patch.js` | `406f400f96b5f2f35f81b19ca379be06173849dd` | Superseded by the normal layout files and current wizard modules |
| `artifex/apps/archetype-object-creator/v1/src/template-card-enhancements.js` | `5c2787be249f98ebfd9529b133d9e97ccd5f6d72` | Retired in V1.31 after duplicated template-card, icon, Step 5, reference, frame-correction, and asset-package behaviour was superseded by normal modules. |
| `artifex/apps/archetype-object-creator/v1/src/object-creator-workflows.js` | `f8967b0b357dd52b6171e032051c5daeeb9e97ec` | Removed from live source in V1.32 as an inactive predecessor of the split workflow modules. |
| `artifex/apps/archetype-object-creator/v1/src/object-creator-workflows-stable.js` | `877b89290fbaadbf5cf1cc6acaa624ef196f7ad5` | Retired in V1.32 after wizard flow, sessions, and shell styles were split into `object-wizard-flow.js`, `object-wizard-sessions.js`, and `object-wizard.css`. |

## Rule

Do not restore these files into `v1/src/` as patch files. If any behaviour is needed again, rebuild it as a properly named module and import it from `editor-app.js`.
