// Artifex Project Editor canvas interaction controller
// Step 5 of the Project Editor real split.
//
// This module owns canvas-level interaction behaviour for the split shell:
// node dragging, third-button / scrollwheel-click panning, mouse-wheel zooming,
// viewport transform application, and camera reset.

export function createProjectCanvasController({
  stateManager,
  canvasElement,
  viewportElement,
  onNodeMoved,
  onNodeSelected,
  onInteractionEnd,
  onCameraChanged
}) {
  if (!stateManager) {
    throw new Error('createProjectCanvasController requires a stateManager.');
  }

  const state = {
    activeDrag: null,
    activePan: null,
    canvasBindingsAttached: false
  };

  function getCanvasPoint(event) {
    const canvasBox = canvasElement?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
    return {
      x: event.clientX - canvasBox.left,
      y: event.clientY - canvasBox.top
    };
  }

  function screenToWorld(point) {
    const camera = stateManager.camera;
    return {
      x: (point.x - camera.panX) / camera.zoom,
      y: (point.y - camera.panY) / camera.zoom
    };
  }

  function applyViewportTransform() {
    if (!viewportElement) return;
    const camera = stateManager.camera;
    viewportElement.style.transform = `translate(${camera.panX}px, ${camera.panY}px) scale(${camera.zoom})`;
  }

  function zoomByFactor(factor, originPoint = null) {
    const camera = stateManager.camera;
    const origin = originPoint ?? {
      x: canvasElement.clientWidth / 2,
      y: canvasElement.clientHeight / 2
    };
    const worldBefore = screenToWorld(origin);
    const nextZoom = Math.max(0.3, Math.min(2.5, camera.zoom * factor));

    stateManager.updateCamera({
      zoom: nextZoom,
      panX: origin.x - worldBefore.x * nextZoom,
      panY: origin.y - worldBefore.y * nextZoom
    });

    applyViewportTransform();
    onCameraChanged?.(stateManager.camera);
  }

  function resetViewport() {
    stateManager.resetCamera();
    applyViewportTransform();
    onCameraChanged?.(stateManager.camera);
  }

  function attachCanvasPanAndZoom() {
    if (!canvasElement || state.canvasBindingsAttached) return;
    state.canvasBindingsAttached = true;

    canvasElement.addEventListener('mousedown', (event) => {
      if (event.button === 1) event.preventDefault();
    }, { capture: true });

    canvasElement.addEventListener('auxclick', (event) => {
      if (event.button === 1) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, { capture: true });

    canvasElement.addEventListener('pointerdown', (event) => {
      const clickedNode = event.target.closest?.('[data-node-id]');
      const clickedPanel = event.target.closest?.('#splitInspectorPreview, #splitDataPreview');
      if (clickedNode || clickedPanel) return;

      // Canvas pan is intentionally only the third mouse button / scrollwheel click.
      if (event.button !== 1) return;

      event.preventDefault();
      event.stopPropagation();

      const camera = stateManager.camera;
      state.activePan = {
        pointerId: event.pointerId,
        startPointer: getCanvasPoint(event),
        startCamera: {
          panX: camera.panX,
          panY: camera.panY,
          zoom: camera.zoom
        }
      };
      canvasElement.setPointerCapture?.(event.pointerId);
      canvasElement.classList.add('cursor-grabbing');
    }, { capture: true });

    canvasElement.addEventListener('pointermove', (event) => {
      const active = state.activePan;
      if (!active || active.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();

      const point = getCanvasPoint(event);
      stateManager.updateCamera({
        zoom: active.startCamera.zoom,
        panX: active.startCamera.panX + (point.x - active.startPointer.x),
        panY: active.startCamera.panY + (point.y - active.startPointer.y)
      }, { persist: false });
      applyViewportTransform();
      onCameraChanged?.(stateManager.camera);
    }, { capture: true });

    canvasElement.addEventListener('pointerup', (event) => endPan(event), { capture: true });
    canvasElement.addEventListener('pointercancel', (event) => endPan(event), { capture: true });

    canvasElement.addEventListener('wheel', (event) => {
      if (event.target.closest?.('#splitInspectorPreview, #splitDataPreview')) return;
      event.preventDefault();
      event.stopPropagation();
      const factor = event.deltaY < 0 ? 1.08 : 0.92;
      zoomByFactor(factor, getCanvasPoint(event));
    }, { passive: false, capture: true });
  }

  function endPan(event) {
    const active = state.activePan;
    if (!active || active.pointerId !== event.pointerId) return;

    event.preventDefault?.();
    event.stopPropagation?.();
    canvasElement?.releasePointerCapture?.(event.pointerId);
    canvasElement?.classList.remove('cursor-grabbing');
    state.activePan = null;
    stateManager.saveToStorage();
    onInteractionEnd?.(active);
  }

  function attachNodeDrag(nodeElement, nodeId) {
    if (!nodeElement || !nodeId) return;

    nodeElement.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('button, input, textarea, select, a')) return;

      const layoutNode = stateManager.getNodeLayout(nodeId);
      if (!layoutNode) return;

      event.preventDefault();
      event.stopPropagation();

      const point = screenToWorld(getCanvasPoint(event));
      state.activeDrag = {
        nodeId,
        pointerId: event.pointerId,
        startPointer: point,
        startPosition: {
          x: layoutNode.position.x,
          y: layoutNode.position.y
        },
        moved: false
      };

      nodeElement.setPointerCapture?.(event.pointerId);
      nodeElement.classList.add('neon-card-active');
      nodeElement.classList.add('cursor-grabbing');
      stateManager.selectNode(nodeId);
      onNodeSelected?.(nodeId);
    });

    nodeElement.addEventListener('pointermove', (event) => {
      const active = state.activeDrag;
      if (!active || active.nodeId !== nodeId || active.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();

      const point = screenToWorld(getCanvasPoint(event));
      const nextPosition = {
        x: active.startPosition.x + (point.x - active.startPointer.x),
        y: active.startPosition.y + (point.y - active.startPointer.y)
      };

      active.moved = true;
      stateManager.updateNodePosition(nodeId, nextPosition);
      nodeElement.style.transform = `translate(${Math.round(nextPosition.x)}px, ${Math.round(nextPosition.y)}px)`;
      onNodeMoved?.(nodeId, nextPosition);
    });

    nodeElement.addEventListener('pointerup', (event) => {
      endDrag(event, nodeElement);
    });

    nodeElement.addEventListener('pointercancel', (event) => {
      endDrag(event, nodeElement);
    });
  }

  function endDrag(event, nodeElement) {
    const active = state.activeDrag;
    if (!active || active.pointerId !== event.pointerId) return;

    nodeElement?.releasePointerCapture?.(event.pointerId);
    nodeElement?.classList.remove('cursor-grabbing');
    state.activeDrag = null;
    onInteractionEnd?.(active);
  }

  function isDragging() {
    return Boolean(state.activeDrag);
  }

  function isPanning() {
    return Boolean(state.activePan);
  }

  applyViewportTransform();
  attachCanvasPanAndZoom();

  return {
    attachNodeDrag,
    applyViewportTransform,
    zoomByFactor,
    resetViewport,
    isDragging,
    isPanning
  };
}
