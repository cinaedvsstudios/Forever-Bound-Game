// Horse Forest Ride layout patch V3
// Middle panel and right panel now scroll independently; overview stays under the main viewer.

const PATCH_ID = 'horse-forest-layout-patch-v3';
let layoutObserver = null;

function injectLayoutPatchStyles() {
  document.getElementById('horse-forest-layout-patch-v1')?.remove();
  document.getElementById('horse-forest-layout-patch-v2')?.remove();
  if (document.getElementById(PATCH_ID)) return;
  const style = document.createElement('style');
  style.id = PATCH_ID;
  style.textContent = `
    body.is-obstacle-course .left-panel{flex:0 0 250px!important;width:250px!important;min-width:240px!important;max-width:260px!important}
    body.is-obstacle-course #obstacle-course-stage{height:calc(100vh - 92px)!important;overflow:hidden!important;padding:12px 14px 14px!important;box-sizing:border-box!important}
    body.is-obstacle-course .obstacle-workspace{grid-template-columns:minmax(560px,1fr) 320px!important;height:100%!important;min-height:0!important;align-items:stretch!important}
    body.is-obstacle-course .obstacle-view-card{min-height:0!important;height:100%!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;scrollbar-gutter:stable!important;position:sticky!important;top:0!important;display:flex!important;flex-direction:column!important}
    body.is-obstacle-course .obstacle-three-wrap{flex:0 0 auto!important;min-height:0!important}
    body.is-obstacle-course .obstacle-side-card{min-height:0!important;height:100%!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;scrollbar-gutter:stable!important;position:sticky!important;top:0!important}
    body.is-obstacle-course .hf-overview-middle{flex:0 0 auto!important;min-height:300px!important;display:block!important;margin-top:10px!important;padding:10px!important;border:1px solid rgba(238,196,90,.42)!important;border-radius:14px!important;background:rgba(0,0,0,.18)!important;box-sizing:border-box!important;overflow:hidden!important}
    body.is-obstacle-course .hf-overview-middle>.hf-overview-row{display:grid!important;grid-template-columns:86px minmax(0,1fr)!important;gap:10px!important;align-items:stretch!important;width:100%!important;height:100%!important;min-height:280px!important}
    body.is-obstacle-course .hf-overview-middle .hf-key{height:auto!important;align-self:stretch!important}
    body.is-obstacle-course .hf-overview-middle .hf-overview-scroll{height:280px!important;min-height:280px!important;max-height:280px!important;overflow-y:auto!important;overflow-x:hidden!important}
    body.is-obstacle-course .hf-overview-middle .hf-overview{width:100%!important}
    body.is-obstacle-course .obstacle-side-card>.hf-overview-row{display:none!important}
    body.is-obstacle-course .obstacle-side-card .hf-button-row:first-child{position:sticky!important;top:0!important;z-index:5!important;padding-bottom:8px!important;background:rgba(7,14,22,.96)!important}
    @media(max-width:1120px){body.is-obstacle-course .left-panel{flex-basis:230px!important;width:230px!important;min-width:220px!important}body.is-obstacle-course .obstacle-workspace{grid-template-columns:1fr!important}body.is-obstacle-course .obstacle-side-card{height:360px!important;max-height:360px!important}}
  `;
  document.head.appendChild(style);
}

function moveOverviewToMiddle() {
  const stage = document.getElementById('obstacle-course-stage');
  if (!stage || stage.hidden) return false;
  const viewCard = stage.querySelector('.obstacle-view-card');
  const viewer = stage.querySelector('#obstacle-three-host');
  const sourceOverview = stage.querySelector('.hf-overview-row');
  if (!viewCard || !viewer || !sourceOverview) return false;
  let overviewShell = stage.querySelector('#hf-overview-middle-shell');
  if (!overviewShell) {
    overviewShell = document.createElement('div');
    overviewShell.id = 'hf-overview-middle-shell';
    overviewShell.className = 'hf-overview-middle';
  }
  if (overviewShell.parentElement !== viewCard) viewer.insertAdjacentElement('afterend', overviewShell);
  if (sourceOverview.parentElement !== overviewShell) overviewShell.appendChild(sourceOverview);
  const canvas = overviewShell.querySelector('#hf-overview');
  if (canvas) canvas.style.width = '100%';
  return true;
}

function bootLayoutPatch() {
  injectLayoutPatchStyles();
  if (!layoutObserver) {
    layoutObserver = new MutationObserver(() => {
      if (document.body.classList.contains('is-obstacle-course')) moveOverviewToMiddle();
    });
    layoutObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  }
  document.addEventListener('click', () => requestAnimationFrame(moveOverviewToMiddle), true);
  setInterval(() => { if (document.body.classList.contains('is-obstacle-course')) moveOverviewToMiddle(); }, 500);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootLayoutPatch, { once: true });
else bootLayoutPatch();
