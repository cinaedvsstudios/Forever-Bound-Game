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
    gravity: toRuntimeGravity(layer.gravity, layer.gravityBoost, layer.gravityScaleVersion)
  };
}

export function toRuntimeSpeed(value) {
  return Math.max(0, finite(value, 0) * SPEED_RUNTIME_SCALE);
}

export function toRuntimeGravity(value, boost = false, scaleVersion = '') {
  const gravity = finite(value, 0);
  if (scaleVersion === 'ui') {
    return gravity * (boost ? 2 : 1) * GRAVITY_RUNTIME_SCALE;
  }
  // Legacy compositions stored the runtime decimal directly, for example 0.04.
  // New edits are marked gravityScaleVersion='ui' and store -100..100 control values.
  if (Math.abs(gravity) <= 1) return gravity;
  return gravity * GRAVITY_RUNTIME_SCALE;
}

export function toGravityControlValue(value, scaleVersion = '') {
  const gravity = finite(value, 0);
  if (scaleVersion === 'ui') return clampControlValue(gravity);
  if (Math.abs(gravity) <= 1) return clampControlValue(Math.round(gravity / GRAVITY_RUNTIME_SCALE));
  return clampControlValue(gravity);
}

export function fromGravityControlValue(value) {
  return clampControlValue(value);
}

export function describeGravityScale(value, boost = false, scaleVersion = 'ui') {
  const gravity = toGravityControlValue(value, scaleVersion);
  const effective = gravity * (boost ? 2 : 1);
  if (effective === 0) return '0 neutral';
  if (effective === 100) return '100 earth';
  if (effective === -100) return '-100 reverse earth';
  return `${effective} ${effective > 0 ? 'down' : 'up'}`;
}

function clampControlValue(value) {
  return Math.max(-100, Math.min(100, Math.round(finite(value, 0))));
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
