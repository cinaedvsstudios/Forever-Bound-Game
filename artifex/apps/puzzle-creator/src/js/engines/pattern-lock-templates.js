const paletteColors = {
  '☀️': '#eec45a', '🌙': '#8077d6', '🔥': '#d66c42', '💧': '#5ebfd2', '🍃': '#66aa65', '⭐': '#f2d875',
  '🪨': '#847668', '🌿': '#6caa69', '☁️': '#d6ddd9', '💎': '#6ccfd5', '✨': '#f3d373', '🔷': '#5289cb',
  '🌼': '#efcc63', '❄️': '#b5eaf1', '🌊': '#468dc4'
};

export const patternPaletteColor = (emoji) => paletteColors[emoji] || '#9ee6a4';

export const patternTemplates = {
  cube: {
    label: 'Cube',
    objective: 'Give each face one unbroken spirit: every point on a face must use its assigned emoji.',
    hint: 'Six spirits guard the relic. Give each spirit one unbroken side.',
    emojis: ['☀️', '🌙', '🔥', '💧', '🍃', '⭐'],
    makePoints: makeCubePoints
  },
  pyramid: {
    label: 'Pyramid',
    objective: 'Arrange the signs by height: stone below, leaves above stone, clouds near the summit, sun at the peak.',
    hint: 'Stone bears root, root bears sky, and the highest point receives the sun.',
    emojis: ['🪨', '🌿', '☁️', '☀️'],
    makePoints: makePyramidPoints
  },
  diamond: {
    label: 'Diamond',
    objective: 'Complete a crystal pattern whose left and right surfaces mirror one another.',
    hint: 'What shines on one side must answer from the other.',
    emojis: ['💎', '✨', '🌙', '⭐', '🔷'],
    makePoints: makeDiamondPoints
  },
  sphere: {
    label: 'Sphere',
    objective: 'Set warm day signs on the dawn hemisphere and cool night signs on the opposite hemisphere.',
    hint: 'Set warmth toward the dawn, and cold beneath the moon.',
    emojis: ['☀️', '🔥', '🌼', '🌙', '❄️', '🌊'],
    makePoints: makeSpherePoints
  }
};

function makeCubePoints() {
  const positions = [-1.35, -0.45, 0.45, 1.35];
  const points = [];
  const faces = [
    { axis: 'z', value: 2, emoji: '☀️', zone: 'front' }, { axis: 'z', value: -2, emoji: '🌙', zone: 'back' },
    { axis: 'x', value: 2, emoji: '🔥', zone: 'right' }, { axis: 'x', value: -2, emoji: '💧', zone: 'left' },
    { axis: 'y', value: 2, emoji: '🍃', zone: 'top' }, { axis: 'y', value: -2, emoji: '⭐', zone: 'bottom' }
  ];
  faces.forEach((face) => positions.forEach((u) => positions.forEach((v) => {
    const point = { x: u, y: v, z: 0, expected: face.emoji, zone: face.zone };
    if (face.axis === 'x') { point.x = face.value; point.z = u; point.y = v; }
    if (face.axis === 'y') { point.y = face.value; point.x = u; point.z = v; }
    if (face.axis === 'z') point.z = face.value;
    points.push(point);
  })));
  return points;
}

function makePyramidPoints() {
  const apex = { x: 0, y: 2.65, z: 0 };
  const corners = [
    { x: -2.45, y: -1.75, z: -2.45 }, { x: 2.45, y: -1.75, z: -2.45 },
    { x: 2.45, y: -1.75, z: 2.45 }, { x: -2.45, y: -1.75, z: 2.45 }
  ];
  const points = [{ ...apex, expected: '☀️', zone: 'summit' }];
  for (let face = 0; face < 4; face += 1) {
    const left = corners[face];
    const right = corners[(face + 1) % 4];
    for (let row = 1; row <= 5; row += 1) {
      const down = row / 5.45;
      const a = lerpPoint(apex, left, down);
      const b = lerpPoint(apex, right, down);
      for (let col = 1; col <= row; col += 1) {
        const position = lerpPoint(a, b, col / (row + 1));
        const expected = position.y < -0.25 ? '🪨' : position.y < 1.1 ? '🌿' : '☁️';
        points.push({ ...position, expected, zone: `side-${face}` });
      }
    }
  }
  return points;
}

function makeDiamondPoints() {
  const top = { x: 0, y: 2.7, z: 0 };
  const bottom = { x: 0, y: -2.7, z: 0 };
  const ring = [{ x: 2.45, y: 0, z: 0 }, { x: 0, y: 0, z: 2.45 }, { x: -2.45, y: 0, z: 0 }, { x: 0, y: 0, z: -2.45 }];
  const points = [{ ...top, expected: '💎', zone: 'tip-top' }, { ...bottom, expected: '💎', zone: 'tip-bottom' }];
  [top, bottom].forEach((tip, half) => {
    for (let face = 0; face < 4; face += 1) {
      const left = ring[face];
      const right = ring[(face + 1) % 4];
      [0.24, 0.44, 0.64, 0.84].forEach((down, row) => {
        const a = lerpPoint(tip, left, down);
        const b = lerpPoint(tip, right, down);
        for (let col = 1; col <= row + 1; col += 1) {
          const point = lerpPoint(a, b, col / (row + 2));
          const expected = Math.abs(point.y) > 1.18 ? '💎' : Math.abs(point.z) > 0.58 ? '🌙' : Math.abs(point.x) > 0.58 ? '✨' : '🔷';
          points.push({ ...point, expected, zone: `${half ? 'lower' : 'upper'}-${face}` });
        }
      });
    }
  });
  return points;
}

function makeSpherePoints() {
  const points = [];
  const radius = 2.55;
  [-67.5, -45, -22.5, 0, 22.5, 45, 67.5].forEach((latitude) => {
    const phi = latitude * Math.PI / 180;
    for (let longitude = 0; longitude < 360; longitude += 30) {
      const theta = longitude * Math.PI / 180;
      const x = radius * Math.cos(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.sin(theta);
      const warm = x >= 0;
      const expected = warm ? (y > 1.05 ? '☀️' : y < -1.05 ? '🔥' : '🌼') : (y > 1.05 ? '❄️' : y < -1.05 ? '🌊' : '🌙');
      points.push({ x, y, z, expected, zone: warm ? 'dawn' : 'night' });
    }
  });
  return points;
}

function lerpPoint(a, b, amount) {
  return { x: a.x + (b.x - a.x) * amount, y: a.y + (b.y - a.y) * amount, z: a.z + (b.z - a.z) * amount };
}
