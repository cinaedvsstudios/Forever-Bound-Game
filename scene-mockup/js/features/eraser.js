import { imageFromSource } from '../core/utils.js';

export async function createMaskSession(layer) {
  const image = await imageFromSource(layer.dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return { canvas, context, width: canvas.width, height: canvas.height };
}

export function eraseAt(session, point, radius, previousPoint = null) {
  const { context } = session;
  context.save();
  context.globalCompositeOperation = 'destination-out';
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = radius * 2;
  context.beginPath();
  if (previousPoint) {
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
  } else {
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

export function commitMaskSession(session) {
  return session.canvas.toDataURL('image/png');
}
