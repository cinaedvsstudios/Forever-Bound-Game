const SIDES = ['left', 'right', 'top', 'bottom'];
const ENDPOINT_RADIUS = 55;

export function resolveSmartConnections(connections = [], positions = {}, start, finish, cardWidth, cardHeight) {
  return connections.map((connection) => {
    const sourceBounds = nodeBounds(connection.sourceNodeId, positions, start, finish, cardWidth, cardHeight);
    const targetBounds = nodeBounds(connection.targetNodeId, positions, start, finish, cardWidth, cardHeight);
    if (!sourceBounds || !targetBounds || connection.routingMode === 'manual') return connection;
    return { ...connection, ...shortestSides(sourceBounds, targetBounds), routingMode: 'smart-shortest' };
  });
}

export function attachmentPoint(bounds, side, offset = 0) {
  if (!bounds) return null;
  if (side === 'top') return { x: bounds.x + bounds.w / 2 + offset, y: bounds.y };
  if (side === 'bottom') return { x: bounds.x + bounds.w / 2 + offset, y: bounds.y + bounds.h };
  if (side === 'right') return { x: bounds.x + bounds.w, y: bounds.y + bounds.h / 2 + offset };
  return { x: bounds.x, y: bounds.y + bounds.h / 2 + offset };
}

export function nodeBounds(nodeId, positions, start, finish, cardWidth, cardHeight) {
  if (nodeId === 'START') return { x: start.x - ENDPOINT_RADIUS, y: start.y - ENDPOINT_RADIUS, w: ENDPOINT_RADIUS * 2, h: ENDPOINT_RADIUS * 2 };
  if (nodeId === 'END') return { x: finish.x - ENDPOINT_RADIUS, y: finish.y - ENDPOINT_RADIUS, w: ENDPOINT_RADIUS * 2, h: ENDPOINT_RADIUS * 2 };
  const position = positions[nodeId];
  return position ? { x: position.x, y: position.y, w: cardWidth, h: cardHeight } : null;
}

function shortestSides(sourceBounds, targetBounds) {
  let best = { sourceSide: 'right', targetSide: 'left', distance: Infinity };
  SIDES.forEach((sourceSide) => {
    SIDES.forEach((targetSide) => {
      const source = attachmentPoint(sourceBounds, sourceSide);
      const target = attachmentPoint(targetBounds, targetSide);
      const distance = Math.hypot(target.x - source.x, target.y - source.y);
      if (distance < best.distance) best = { sourceSide, targetSide, distance };
    });
  });
  return { sourceSide: best.sourceSide, targetSide: best.targetSide };
}
