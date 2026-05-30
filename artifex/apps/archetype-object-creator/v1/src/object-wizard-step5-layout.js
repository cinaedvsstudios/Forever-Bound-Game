let step5LayoutObserver = null;
let step5LayoutQueued = false;

export function initStep5ColumnLayout() {
  injectStep5ColumnStyles();
  startStep5LayoutObserver();
  scheduleStep5Layout();
}

function injectStep5ColumnStyles() {
  if (document.getElementById('object-creator-step5-column-layout')) return;
  const style = document.createElement('style');
  style.id = 'object-creator-step5-column-layout';
  style.textContent = `
    #quickstart-dialog .wizard-step5-toolbar{display:flex!important;flex-wrap:wrap!important;gap:6px!important;margin:0 0 10px!important}
    #quickstart-dialog .wizard-step5-toolbar button{min-height:28px!important;padding:4px 9px!important;font-size:11px!important;white-space:nowrap!important}
    #quickstart-dialog .wizard-build-nav button{grid-template-columns:auto auto minmax(0,1fr) auto!important;gap:7px!important;padding:7px 8px!important;min-width:0!important;font-size:11px!important}
    #quickstart-dialog .wizard-task-copy{display:block!important;min-width:0!important;overflow:hidden!important}
    #quickstart-dialog .wizard-task-copy strong{display:block!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.25!important;font-size:11px!important}
    #quickstart-dialog .wizard-task-copy small{display:block!important;margin-top:2px!important;color:rgba(255,240,206,.58)!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.2!important;font-size:9px!important}
    #quickstart-dialog .wizard-build-nav em{white-space:nowrap!important;align-self:center!important;font-size:9px!important}
    #quickstart-dialog .wizard-build-detail-panel{display:grid!important;grid-template-columns:minmax(250px,.82fr) minmax(0,1.18fr)!important;grid-auto-rows:min-content!important;align-items:start!important;align-content:start!important;column-gap:12px!important;row-gap:10px!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;overflow:visible!important}
    #quickstart-dialog .wizard-step5-left,#quickstart-dialog .wizard-step5-right{display:grid!important;grid-template-columns:1fr!important;align-content:start!important;gap:8px!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin:0!important}
    #quickstart-dialog .wizard-step5-left{grid-column:1!important;grid-row:1!important}
    #quickstart-dialog .wizard-step5-right{grid-column:2!important;grid-row:1!important}
    #quickstart-dialog .wizard-step5-right>h3,#quickstart-dialog .wizard-step5-right>.wizard-build-title{grid-column:1!important;grid-row:auto!important;margin:0 0 4px!important;display:flex!important;align-items:center!important;gap:8px!important;min-width:0!important;max-width:100%!important}
    #quickstart-dialog .wizard-step5-right .wizard-right-stack,#quickstart-dialog .wizard-step5-right .wizard-build-fields,#quickstart-dialog .wizard-step5-right .wizard-action-behaviour-panel,#quickstart-dialog .wizard-step5-right .wizard-sound-list,#quickstart-dialog .wizard-step5-right .wizard-notes-field{grid-column:1!important;grid-row:auto!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin-left:0!important;margin-right:0!important}
    #quickstart-dialog .wizard-step5-right .wizard-right-stack{margin:0!important;gap:8px!important;align-self:start!important}
    #quickstart-dialog .wizard-step5-right .wizard-build-fields{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin:8px 0!important}
    #quickstart-dialog .wizard-step5-right .wizard-field-asset-path,#quickstart-dialog .wizard-step5-right .wizard-notes-field{grid-column:1/-1!important}
    #quickstart-dialog .wizard-step5-right label{min-width:0!important;max-width:100%!important;box-sizing:border-box!important;font-size:11px!important}
    #quickstart-dialog .wizard-step5-right input:not([type='checkbox']):not([type='range']),#quickstart-dialog .wizard-step5-right select,#quickstart-dialog .wizard-step5-right textarea{width:100%!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;padding:5px 7px!important;font-size:11px!important}
    #quickstart-dialog .wizard-step5-right textarea{resize:vertical!important}
    #quickstart-dialog .wizard-step5-right .wizard-action-meta,#quickstart-dialog .wizard-step5-right .wizard-action-info-text{font-size:10px!important;line-height:1.3!important}
    #quickstart-dialog .wizard-step5-right button{min-height:28px!important;padding:4px 8px!important;font-size:11px!important}
    #quickstart-dialog .wizard-step5-right .wizard-behaviour-grid{gap:7px!important}
    #quickstart-dialog .wizard-step5-right .wizard-sound-row{grid-template-columns:20px minmax(0,1.35fr) minmax(64px,.72fr) repeat(3,minmax(45px,.48fr)) 27px!important;gap:4px!important}
    #quickstart-dialog .wizard-step5-right .wizard-frame-event-row{grid-template-columns:20px minmax(48px,.42fr) minmax(78px,.72fr) minmax(0,1fr) 27px!important;gap:4px!important}
    #quickstart-dialog .wizard-step5-right .wizard-sound-row>*,#quickstart-dialog .wizard-step5-right .wizard-frame-event-row>*{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}
    #quickstart-dialog .wizard-step5-left .wizard-preview-stage,#quickstart-dialog .wizard-step5-left [data-preview-stage]{grid-column:1!important;grid-row:auto!important;width:100%!important;max-width:none!important;height:clamp(250px,34vh,330px)!important;min-height:250px!important;max-height:330px!important;margin:0!important;align-self:start!important}
    #quickstart-dialog .wizard-step5-left .wizard-preview-controls{grid-column:1!important;grid-row:auto!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;margin:2px 0 0!important;position:relative!important;min-width:0!important}
    #quickstart-dialog .wizard-step5-left .wizard-preview-controls button,#quickstart-dialog .wizard-step5-left .wizard-frame-correct-button{min-height:28px!important;padding:4px 8px!important;font-size:11px!important}
    #quickstart-dialog .wizard-step5-left .wizard-reference-panel{grid-column:1!important;grid-row:auto!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin:2px 0 0!important;padding-top:8px!important;border-top:1px solid rgba(226,204,167,.18)!important}
    #quickstart-dialog .wizard-step5-left .wizard-reference-panel h4{margin:0 0 5px!important}
    #quickstart-dialog .wizard-step5-left .wizard-reference-scroll{height:92px!important;min-height:92px!important;max-height:92px!important;overflow:auto!important}
    #quickstart-dialog .wizard-build-detail-panel>.wizard-frame-strip,#quickstart-dialog .wizard-build-detail-panel>.wizard-build-actions,#quickstart-dialog .wizard-build-detail-panel>.wizard-frame-file-table-wrap{grid-column:1/-1!important;grid-row:auto!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important}
    #quickstart-dialog .wizard-build-detail-panel>.wizard-frame-strip{margin-top:2px!important}
    #quickstart-dialog .wizard-build-detail-panel>.wizard-build-actions{margin-top:0!important}
    @media(max-width:1100px){#quickstart-dialog .wizard-build-detail-panel{grid-template-columns:1fr!important}#quickstart-dialog .wizard-step5-left,#quickstart-dialog .wizard-step5-right,#quickstart-dialog .wizard-build-detail-panel>.wizard-frame-strip,#quickstart-dialog .wizard-build-detail-panel>.wizard-build-actions,#quickstart-dialog .wizard-build-detail-panel>.wizard-frame-file-table-wrap{grid-column:1!important;grid-row:auto!important}}
    @media(max-width:680px){#quickstart-dialog .wizard-step5-right .wizard-build-fields,#quickstart-dialog .wizard-step5-right .wizard-behaviour-grid,#quickstart-dialog .wizard-step5-right .wizard-sound-row,#quickstart-dialog .wizard-step5-right .wizard-frame-event-row{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(style);
}

function startStep5LayoutObserver() {
  if (step5LayoutObserver) return;
  step5LayoutObserver = new MutationObserver(() => scheduleStep5Layout());
  step5LayoutObserver.observe(document.body, { childList: true, subtree: true });
}

function scheduleStep5Layout() {
  if (step5LayoutQueued) return;
  step5LayoutQueued = true;
  window.requestAnimationFrame(() => {
    step5LayoutQueued = false;
    applyStep5ColumnLayout();
  });
}

function applyStep5ColumnLayout() {
  const panel = document.querySelector('#quickstart-dialog .wizard-build-detail-panel');
  if (!panel) return;

  let left = panel.querySelector(':scope > .wizard-step5-left');
  if (!left) {
    left = document.createElement('section');
    left.className = 'wizard-step5-left';
    panel.prepend(left);
  }

  let right = panel.querySelector(':scope > .wizard-step5-right');
  if (!right) {
    right = document.createElement('section');
    right.className = 'wizard-step5-right';
    left.after(right);
  }

  const preview = panel.querySelector(':scope > .wizard-preview-stage, :scope > [data-preview-stage]');
  if (preview && preview.parentElement !== left) left.appendChild(preview);

  const controls = panel.querySelector(':scope > .wizard-preview-controls');
  if (controls && controls.parentElement !== left) left.appendChild(controls);

  const reference = panel.querySelector(':scope > .wizard-reference-panel');
  if (reference && reference.parentElement !== left) left.appendChild(reference);

  const title = panel.querySelector(':scope > h3');
  if (title && title.parentElement !== right) right.prepend(title);

  const info = panel.querySelector(':scope > .wizard-action-info-text');
  if (info && info.parentElement !== right) {
    const titleInRight = right.querySelector('h3');
    if (titleInRight) titleInRight.after(info);
    else right.prepend(info);
  }

  const rightStack = panel.querySelector(':scope > .wizard-right-stack');
  if (rightStack && rightStack.parentElement !== right) right.appendChild(rightStack);
}
