const SPEED_RUNTIME_SCALE = 0.22;
const GRAVITY_RUNTIME_SCALE = 0.0004;

export function toRuntimeLayer(layer) {
  if (!layer) return layer;
  const speedMin = toRuntimeSpeed(layer.speedMin);
  const speedMax = Math.max(speedMin, toRuntimeSpeed(layer.speedMax));
  return {
    ...layer,
    speedMin,
    speedMax,
    gravity: toRuntimeGravity(layer.gravity)
  };
}

export function toRuntimeSpeed(value) {
  return Math.max(0, finite(value, 0) * SPEED_RUNTIME_SCALE);
}

export function toRuntimeGravity(value) {
  const gravity = finite(value, 0);
  // Legacy saved files used tiny decimal values directly, e.g. 0.04.
  // New UI uses a readable gravity scale where 100 maps back to 0.04.
  if (Math.abs(gravity) <= 1) return gravity;
  return gravity * GRAVITY_RUNTIME_SCALE;
}

export function toGravityControlValue(value) {
  const gravity = finite(value, 0);
  if (Math.abs(gravity) <= 1) return Math.round(gravity / GRAVITY_RUNTIME_SCALE);
  return Math.round(gravity);
}

export function fromGravityControlValue(value) {
  return Math.round(finite(value, 0));
}

export function describeGravityScale(value) {
  const gravity = toGravityControlValue(value);
  if (gravity === 0) return '0 neutral';
  if (gravity === 100) return '100 earth';
  if (gravity > 0) return `${gravity} down`;
  return `${gravity} up`;
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
