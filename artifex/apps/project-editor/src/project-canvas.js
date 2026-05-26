// Artifex Project Editor canvas interaction controller
// Step 4 of the Project Editor real split.
//
// This module owns canvas-level interaction behaviour for the split shell.
// For this step it wires node dragging, selection-safe movement, and route
// redraw callbacks. Pan/zoom and route drawing can be expanded here next.

export function createProjectCanvasController({
  stateManager,
  canvasElement,
  onNodeMoved,
  onNodeSelected,
  onInteractionEnd
}) {
  if (!stateManager) {
    throw new Error('createProjectCanvasController requires a stateManager.');
  }

  const state = {
    activeDrag: null
  };

  function getCanvasPoint(event) {
    const canvasBox = canvasElement?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
    return {
      x: event.clientX - canvasBox.left,
      y: event.clientY - canvasBox.top
    };
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

      const point = getCanvasPoint(event);
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
      const point = getCanvasPoint(event);
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

  return {
    attachNodeDrag,
    isDragging
  };
}
