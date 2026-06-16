import { OC, ACCEL, DECEL, BACK_SPEED, SLOW_TROT_SPEED, START_DISTANCE } from './obstacle-course-state.js';
import { clamp } from './obstacle-course-utils.js';
import { pathStatus, playerWorldX, ensurePathCoverage } from './obstacle-course-ground-path.js';
import { updateWorldTransform, applyBackgroundPlate, startRenderLoop } from './obstacle-course-scene.js';
import { updateHorseSprite } from './obstacle-course-horse.js';
import { updateHud, updateOffPathWarning } from './obstacle-course-hud.js';
import { checkCollectibles } from './obstacle-course-collectibles.js';
import { checkObstacles } from './obstacle-course-obstacles.js';
import { makeResult } from './obstacle-course-scoring.js';
import { setResult } from './obstacle-course-ui.js';
import { scheduleOverviewDraw } from './obstacle-course-overview.js?v=3.0.38';
import { ensureAudio, updateAudio, playJumpSound, playLandSound } from './obstacle-course-audio.js';

export function startRun() {
  document.activeElement?.blur?.();
  OC.stage?.focus?.();
  if (!OC.requiredReady) {
    setResult('Cannot start: required obstacle-course assets are missing.', 'failure');
    updateHud();
    return;
  }
  ensureAudio();
  OC.active = true;
  OC.running = true;
  OC.paused = false;
  OC.complete = false;
  OC.targetSpeed = 0;
  startRenderLoop();
  updateHud();
  scheduleOverviewDraw();
}

export function pauseRun() {
  if (!OC.active && !OC.running && OC.distance <= START_DISTANCE) return;
  OC.running = !OC.running;
  OC.paused = !OC.running;
  updateHud();
  scheduleOverviewDraw();
}

export function resetRun(silent = false) {
  OC.active = false;
  OC.running = false;
  OC.paused = false;
  OC.complete = false;
  OC.currentSpeed = 0;
  OC.targetSpeed = 0;
  OC.distance = START_DISTANCE;
  OC.score = 0;
  OC.hits = 0;
  OC.jumps = 0;
  OC.collected = 0;
  OC.offPathTime = 0;
  Object.assign(OC.player, { x: 0, y: 0, vy: 0, grounded: true, jumpHoldTime: 0, jumpWasDown: false, duck: false });
  OC.backgroundJumpShift = 0;
  OC.objects.forEach((obj) => {
    if (obj.userData.kind === 'collectible') { obj.visible = true; obj.userData.collected = false; }
    if (obj.userData.kind === 'obstacle') obj.userData.hit = false;
  });
  ensurePathCoverage(OC.distance);
  updateWorldTransform(playerWorldX());
  applyBackgroundPlate();
  updateHud();
  scheduleOverviewDraw();
  if (!silent) setResult('Run reset.', 'success');
}

export function completeRun() {
  OC.complete = true;
  OC.active = false;
  OC.running = false;
  OC.currentSpeed = 0;
  OC.targetSpeed = 0;
  updateHud();
  scheduleOverviewDraw();
  setResult(`Complete. Score ${OC.score}, collectibles ${OC.collected}, hits ${OC.hits}.`, 'success');
  OC.lastResult = makeResult();
}

export function updateMovement(dt) {
  if (!OC.active) return;
  const steer = (OC.keys.has('right') ? 1 : 0) - (OC.keys.has('left') ? 1 : 0);
  if (steer) OC.player.x += steer * 7.2 * dt;
  OC.player.x = clamp(OC.player.x, -OC.pathVisualWidth * 0.55, OC.pathVisualWidth * 0.55);

  const jumpDown = OC.keys.has('jump');
  if (OC.player.grounded && jumpDown && !OC.player.jumpWasDown) {
    OC.player.grounded = false;
    OC.player.vy = 10.5;
    OC.player.jumpHoldTime = 0;
    OC.jumps += 1;
    playJumpSound();
  }
  OC.player.jumpWasDown = jumpDown;

  if (!OC.player.grounded) {
    const canExtendJump = jumpDown && OC.player.vy > 0 && OC.player.jumpHoldTime < OC.player.maxJumpHoldTime;
    const holdLift = canExtendJump ? 38 : 0;
    if (canExtendJump) OC.player.jumpHoldTime += dt;
    OC.player.vy += (-44 + holdLift) * dt;
    OC.player.y += OC.player.vy * dt;
    if (OC.player.y <= 0) {
      const wasAirborne = !OC.player.grounded;
      OC.player.y = 0;
      OC.player.vy = 0;
      OC.player.grounded = true;
      OC.player.jumpHoldTime = 0;
      if (wasAirborne) playLandSound();
    }
  }

  OC.backgroundJumpShift = 0;
  const status = pathStatus();
  OC.offPathTime = status === 'off' ? OC.offPathTime + dt : 0;
  let desired = 0;
  if (OC.running && !OC.paused && OC.keys.has('forward')) desired = OC.speed;
  if (OC.running && !OC.paused && OC.keys.has('back')) desired = BACK_SPEED;
  if (status === 'off' && desired > SLOW_TROT_SPEED) desired = SLOW_TROT_SPEED;
  if (status === 'edge' && desired > OC.speed * 0.65) desired = OC.speed * 0.65;
  OC.targetSpeed = desired;
  const rate = Math.abs(OC.targetSpeed) > Math.abs(OC.currentSpeed) ? ACCEL : DECEL;
  OC.currentSpeed += clamp(OC.targetSpeed - OC.currentSpeed, -rate * dt, rate * dt);
  if (Math.abs(OC.currentSpeed) < 0.05) OC.currentSpeed = 0;
  if (OC.running && !OC.paused) OC.distance += OC.currentSpeed * dt;
  ensurePathCoverage(OC.distance);
  updateWorldTransform(playerWorldX());
  checkCollectibles();
  checkObstacles();
  updateHorseSprite();
  updateOffPathWarning();
  updateHud();
  updateAudio(dt);
  scheduleOverviewDraw();
}
