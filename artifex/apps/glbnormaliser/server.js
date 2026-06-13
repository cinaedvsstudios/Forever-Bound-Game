/*
  GLB Asset Normaliser
  Local HDD web app for static GLB assets.

  No external dependencies are required. This app:
  - serves a local browser UI
  - browses a chosen root folder
  - parses GLB 2.0 files enough to inspect static mesh POSITION data
  - previews vertices/bounds in a simple canvas view
  - normalises pivot/origin to bottom-centre by wrapping scene roots
  - sets a uniform root scale transform
  - saves copy or overwrite-with-backup
*/

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const childProcess = require('child_process');

const PORT = Number(process.env.PORT || 4787);
const APP_DIR = __dirname;
const START_ROOT = process.argv.slice(2).join(' ').trim() || process.env.GLB_ROOT || process.cwd();
const ROOT_DIR = path.resolve(stripOuterQuotes(START_ROOT));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.ico': 'image/x-icon',
};

function stripOuterQuotes(value) {
  if (!value) return value;
  let out = String(value).trim();
  if ((out.startsWith('"') && out.endsWith('"')) || (out.startsWith("'") && out.endsWith("'"))) {
    out = out.slice(1, -1);
  }
  return out;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 20 * 1024 * 1024) {
        reject(new Error('Request body too large.'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function safeJoin(root, rel) {
  const cleanRel = decodeURIComponent(rel || '').replace(/^[\\/]+/, '');
  const target = path.resolve(root, cleanRel);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (target !== root && !target.startsWith(rootWithSep)) {
    throw new Error('Blocked path outside the selected root folder.');
  }
  return target;
}

function toRel(absPath) {
  return path.relative(ROOT_DIR, absPath).split(path.sep).join('/');
}

function pad4Buffer(buffer, padByte = 0x20) {
  const mod = buffer.length % 4;
  if (mod === 0) return buffer;
  const out = Buffer.alloc(buffer.length + (4 - mod), padByte);
  buffer.copy(out, 0);
  return out;
}

function parseGLB(glbBuffer) {
  if (glbBuffer.length < 20) throw new Error('File is too small to be a GLB.');
  const magic = glbBuffer.readUInt32LE(0);
  const version = glbBuffer.readUInt32LE(4);
  const totalLength = glbBuffer.readUInt32LE(8);
  if (magic !== 0x46546c67) throw new Error('Not a GLB file. Magic header does not match glTF.');
  if (version !== 2) throw new Error(`Unsupported GLB version ${version}. This tool expects GLB 2.0.`);
  if (totalLength > glbBuffer.length) throw new Error('GLB declares a longer length than the file contains.');

  const chunks = [];
  let offset = 12;
  let json = null;
  while (offset + 8 <= totalLength) {
    const chunkLength = glbBuffer.readUInt32LE(offset);
    const chunkType = glbBuffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;
    if (chunkEnd > glbBuffer.length) throw new Error('GLB chunk extends beyond file length.');
    const data = glbBuffer.subarray(chunkStart, chunkEnd);
    chunks.push({ type: chunkType, data });
    if (chunkType === 0x4e4f534a) {
      const jsonText = data.toString('utf8').replace(/[\u0000\u0020\t\r\n]+$/g, '');
      json = JSON.parse(jsonText);
    }
    offset = chunkEnd;
  }
  if (!json) throw new Error('GLB does not contain a JSON chunk.');
  return { json, chunks };
}

function writeGLB(json, originalChunks) {
  const jsonBuffer = pad4Buffer(Buffer.from(JSON.stringify(json), 'utf8'), 0x20);
  const chunks = [{ type: 0x4e4f534a, data: jsonBuffer }];
  for (const chunk of originalChunks) {
    if (chunk.type === 0x4e4f534a) continue;
    chunks.push({ type: chunk.type, data: pad4Buffer(Buffer.from(chunk.data), 0x00) });
  }

  const totalLength = 12 + chunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
  const out = Buffer.alloc(totalLength);
  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(totalLength, 8);
  let offset = 12;
  for (const chunk of chunks) {
    out.writeUInt32LE(chunk.data.length, offset);
    out.writeUInt32LE(chunk.type, offset + 4);
    chunk.data.copy(out, offset + 8);
    offset += 8 + chunk.data.length;
  }
  return out;
}

function getBinChunk(parsed) {
  const bin = parsed.chunks.find(c => c.type === 0x004e4942);
  if (!bin) return null;
  return bin.data;
}

function componentSize(componentType) {
  switch (componentType) {
    case 5120:
    case 5121:
      return 1;
    case 5122:
    case 5123:
      return 2;
    case 5125:
    case 5126:
      return 4;
    default:
      throw new Error(`Unsupported accessor component type ${componentType}.`);
  }
}

function numComponents(type) {
  switch (type) {
    case 'SCALAR': return 1;
    case 'VEC2': return 2;
    case 'VEC3': return 3;
    case 'VEC4': return 4;
    case 'MAT2': return 4;
    case 'MAT3': return 9;
    case 'MAT4': return 16;
    default: throw new Error(`Unsupported accessor type ${type}.`);
  }
}

function readComponent(buffer, offset, componentType) {
  switch (componentType) {
    case 5120: return buffer.readInt8(offset);
    case 5121: return buffer.readUInt8(offset);
    case 5122: return buffer.readInt16LE(offset);
    case 5123: return buffer.readUInt16LE(offset);
    case 5125: return buffer.readUInt32LE(offset);
    case 5126: return buffer.readFloatLE(offset);
    default: throw new Error(`Unsupported component type ${componentType}.`);
  }
}

function getAccessorReader(json, bin, accessorIndex) {
  const accessor = json.accessors?.[accessorIndex];
  if (!accessor) throw new Error(`Missing accessor ${accessorIndex}.`);
  const view = json.bufferViews?.[accessor.bufferView];
  if (!view) throw new Error(`Accessor ${accessorIndex} has no bufferView.`);
  if (view.buffer && view.buffer !== 0) throw new Error('This tool currently expects embedded GLB binary buffer 0.');

  const compSize = componentSize(accessor.componentType);
  const comps = numComponents(accessor.type);
  const stride = view.byteStride || (compSize * comps);
  const baseOffset = (view.byteOffset || 0) + (accessor.byteOffset || 0);

  return {
    accessor,
    view,
    count: accessor.count || 0,
    comps,
    read(index) {
      const p = baseOffset + index * stride;
      const out = [];
      for (let c = 0; c < comps; c++) {
        out.push(readComponent(bin, p + c * compSize, accessor.componentType));
      }
      return out;
    },
  };
}

function mat4Identity() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

function mat4Translation(x, y, z) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1,
  ];
}

function mat4Scale(x, y, z) {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1,
  ];
}

function mat4FromQuat(q) {
  const [x, y, z, w] = q;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;
  return [
    1 - (yy + zz), xy + wz, xz - wy, 0,
    xy - wz, 1 - (xx + zz), yz + wx, 0,
    xz + wy, yz - wx, 1 - (xx + yy), 0,
    0, 0, 0, 1,
  ];
}

function mat4Multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function nodeLocalMatrix(node, overrideScale) {
  if (Array.isArray(node.matrix) && node.matrix.length === 16) {
    return node.matrix.slice();
  }
  const t = node.translation || [0, 0, 0];
  const r = node.rotation || [0, 0, 0, 1];
  const s = overrideScale || node.scale || [1, 1, 1];
  return mat4Multiply(mat4Multiply(mat4Translation(t[0], t[1], t[2]), mat4FromQuat(r)), mat4Scale(s[0], s[1], s[2]));
}

function transformPoint(m, p) {
  const x = p[0], y = p[1], z = p[2];
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

function detectNormalisedRoot(json, scene) {
  const nodes = scene?.nodes || [];
  if (nodes.length !== 1) return null;
  const idx = nodes[0];
  const node = json.nodes?.[idx];
  if (!node || node.name !== 'FB_NormalisedRoot') return null;
  return { index: idx, node };
}

function getScene(json) {
  const sceneIndex = Number.isInteger(json.scene) ? json.scene : 0;
  const scene = json.scenes?.[sceneIndex];
  if (!scene) throw new Error('GLB has no readable scene.');
  if (!Array.isArray(scene.nodes) || scene.nodes.length === 0) throw new Error('Scene has no root nodes.');
  return { sceneIndex, scene };
}

function computeStatsAndPreview(json, bin, options = {}) {
  const maxPreviewVertices = options.maxPreviewVertices || 9000;
  const axis = options.axis || 'Y';
  const { scene } = getScene(json);
  const normalisedRoot = detectNormalisedRoot(json, scene);
  const preview = [];
  const bbox = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };

  let vertexCount = 0;
  let primitiveCount = 0;
  let meshNodeCount = 0;
  let skippedPrimitives = 0;
  let sampleEvery = 1;

  // First pass estimates count to downsample deterministically.
  function countNode(nodeIndex) {
    const node = json.nodes?.[nodeIndex];
    if (!node) return;
    if (Number.isInteger(node.mesh)) {
      const mesh = json.meshes?.[node.mesh];
      for (const primitive of mesh?.primitives || []) {
        const posIdx = primitive.attributes?.POSITION;
        if (Number.isInteger(posIdx)) {
          const accessor = json.accessors?.[posIdx];
          if (accessor?.count) vertexCount += accessor.count;
        }
      }
    }
    for (const child of node.children || []) countNode(child);
  }
  for (const n of scene.nodes || []) countNode(n);
  sampleEvery = Math.max(1, Math.ceil(vertexCount / maxPreviewVertices));
  vertexCount = 0;

  function visit(nodeIndex, parentMatrix, isNormalisedRoot = false) {
    const node = json.nodes?.[nodeIndex];
    if (!node) return;
    // For analysis/preview, honour existing root scale because that is what the GLB displays as.
    const local = nodeLocalMatrix(node);
    const world = mat4Multiply(parentMatrix, local);

    if (Number.isInteger(node.mesh)) {
      meshNodeCount++;
      const mesh = json.meshes?.[node.mesh];
      for (const primitive of mesh?.primitives || []) {
        primitiveCount++;
        const posIdx = primitive.attributes?.POSITION;
        if (!Number.isInteger(posIdx)) {
          skippedPrimitives++;
          continue;
        }
        try {
          const reader = getAccessorReader(json, bin, posIdx);
          for (let i = 0; i < reader.count; i++) {
            const localPosition = reader.read(i);
            if (localPosition.length < 3) continue;
            const p = transformPoint(world, localPosition);
            bbox.min[0] = Math.min(bbox.min[0], p[0]);
            bbox.min[1] = Math.min(bbox.min[1], p[1]);
            bbox.min[2] = Math.min(bbox.min[2], p[2]);
            bbox.max[0] = Math.max(bbox.max[0], p[0]);
            bbox.max[1] = Math.max(bbox.max[1], p[1]);
            bbox.max[2] = Math.max(bbox.max[2], p[2]);
            if (vertexCount % sampleEvery === 0) preview.push(roundPoint(p));
            vertexCount++;
          }
        } catch (err) {
          skippedPrimitives++;
        }
      }
    }
    for (const child of node.children || []) visit(child, world, false);
  }

  for (const n of scene.nodes || []) visit(n, mat4Identity(), normalisedRoot?.index === n);

  if (!Number.isFinite(bbox.min[0])) throw new Error('No readable POSITION geometry found in this GLB.');

  const size = [
    bbox.max[0] - bbox.min[0],
    bbox.max[1] - bbox.min[1],
    bbox.max[2] - bbox.min[2],
  ];
  const center = [
    (bbox.min[0] + bbox.max[0]) / 2,
    (bbox.min[1] + bbox.max[1]) / 2,
    (bbox.min[2] + bbox.max[2]) / 2,
  ];
  const bottomCenter = bottomCenterForAxis(bbox, axis);

  return {
    bbox: { min: roundPoint(bbox.min), max: roundPoint(bbox.max), size: roundPoint(size), center: roundPoint(center), bottomCenter: roundPoint(bottomCenter) },
    preview,
    counts: {
      vertices: vertexCount,
      previewVertices: preview.length,
      meshes: json.meshes?.length || 0,
      meshNodes: meshNodeCount,
      primitives: primitiveCount,
      skippedPrimitives,
      nodes: json.nodes?.length || 0,
      materials: json.materials?.length || 0,
      images: json.images?.length || 0,
      animations: json.animations?.length || 0,
      skins: json.skins?.length || 0,
    },
    normalisedRoot: normalisedRoot ? {
      found: true,
      scale: normalisedRoot.node.scale || [1, 1, 1],
      children: normalisedRoot.node.children || [],
    } : { found: false },
  };
}

function computeBottomCenterIgnoringNormalisedScale(json, bin, axis) {
  const { scene } = getScene(json);
  const normalisedRoot = detectNormalisedRoot(json, scene);
  let oldScale = null;
  if (normalisedRoot) {
    oldScale = normalisedRoot.node.scale;
    normalisedRoot.node.scale = [1, 1, 1];
    delete normalisedRoot.node.matrix;
  }
  const stats = computeStatsAndPreview(json, bin, { maxPreviewVertices: 1, axis });
  if (normalisedRoot) {
    if (oldScale) normalisedRoot.node.scale = oldScale;
  }
  return stats.bbox.bottomCenter;
}

function bottomCenterForAxis(bbox, axis) {
  if (axis === 'Z') return [(bbox.min[0] + bbox.max[0]) / 2, (bbox.min[1] + bbox.max[1]) / 2, bbox.min[2]];
  if (axis === 'X') return [bbox.min[0], (bbox.min[1] + bbox.max[1]) / 2, (bbox.min[2] + bbox.max[2]) / 2];
  return [(bbox.min[0] + bbox.max[0]) / 2, bbox.min[1], (bbox.min[2] + bbox.max[2]) / 2];
}

function roundPoint(p) {
  return p.map(v => Math.abs(v) < 1e-10 ? 0 : Number(v.toFixed(6)));
}

function setNodeMatrix(node, matrix) {
  node.matrix = matrix.map(v => Math.abs(v) < 1e-12 ? 0 : Number(v.toFixed(12)));
  delete node.translation;
  delete node.rotation;
  delete node.scale;
}

function leftMultiplyNodeMatrix(node, leftMatrix) {
  const current = nodeLocalMatrix(node);
  setNodeMatrix(node, mat4Multiply(leftMatrix, current));
}

function ensureNormalisedRootAndApply(json, bin, { scale = 1, axis = 'Y' }) {
  const { scene } = getScene(json);
  let root = detectNormalisedRoot(json, scene);

  if (!root) {
    const originalRoots = (scene.nodes || []).slice();
    const rootNode = {
      name: 'FB_NormalisedRoot',
      children: originalRoots,
      translation: [0, 0, 0],
      scale: [1, 1, 1],
      extras: {
        fbTool: 'GLB Asset Normaliser',
        note: 'Root origin is used as bottom-centre pivot. Child nodes hold the pivot offset.',
      },
    };
    json.nodes = json.nodes || [];
    const rootIndex = json.nodes.length;
    json.nodes.push(rootNode);
    scene.nodes = [rootIndex];
    root = { index: rootIndex, node: rootNode };
  }

  // Calculate bottom centre with the normalised root scale ignored, so a previous scale does not compound.
  const oldScale = root.node.scale;
  const oldMatrix = root.node.matrix;
  delete root.node.matrix;
  root.node.translation = [0, 0, 0];
  root.node.rotation = [0, 0, 0, 1];
  root.node.scale = [1, 1, 1];
  const bottomCenter = computeStatsAndPreview(json, bin, { maxPreviewVertices: 1, axis }).bbox.bottomCenter;

  const shift = [-bottomCenter[0], -bottomCenter[1], -bottomCenter[2]];
  const shiftMagnitude = Math.hypot(shift[0], shift[1], shift[2]);
  if (shiftMagnitude > 1e-9) {
    const t = mat4Translation(shift[0], shift[1], shift[2]);
    for (const childIndex of root.node.children || []) {
      const child = json.nodes?.[childIndex];
      if (child) leftMultiplyNodeMatrix(child, t);
    }
  }

  delete root.node.matrix;
  root.node.translation = [0, 0, 0];
  root.node.rotation = [0, 0, 0, 1];
  root.node.scale = [scale, scale, scale];
  root.node.extras = Object.assign({}, root.node.extras || {}, {
    fbNormalised: true,
    fbNormalisedAt: new Date().toISOString(),
    fbBottomAxis: axis,
    fbRootScale: scale,
  });

  return { shift: roundPoint(shift), scale, axis };
}

function analyseFile(absPath, axis = 'Y') {
  const parsed = parseGLB(fs.readFileSync(absPath));
  const bin = getBinChunk(parsed);
  if (!bin) throw new Error('GLB has no embedded BIN chunk.');
  const stats = computeStatsAndPreview(parsed.json, bin, { axis });
  const warnings = [];
  if (stats.counts.animations > 0) warnings.push('Animations detected. This tool is intended for static assets.');
  if (stats.counts.skins > 0) warnings.push('Skins detected. This tool is intended for non-skinned static assets.');
  if (stats.counts.skippedPrimitives > 0) warnings.push(`${stats.counts.skippedPrimitives} primitive(s) could not be inspected.`);
  return {
    file: path.basename(absPath),
    rel: toRel(absPath),
    bytes: fs.statSync(absPath).size,
    sha1: crypto.createHash('sha1').update(fs.readFileSync(absPath)).digest('hex'),
    ...stats,
    warnings,
  };
}

function saveNormalised(absPath, options) {
  const original = fs.readFileSync(absPath);
  const parsed = parseGLB(original);
  const bin = getBinChunk(parsed);
  if (!bin) throw new Error('GLB has no embedded BIN chunk.');
  const warnings = [];
  if (parsed.json.animations?.length) warnings.push('Animations detected. This file was still processed, but static assets are safer.');
  if (parsed.json.skins?.length) warnings.push('Skins detected. This file was still processed, but static assets are safer.');

  const result = ensureNormalisedRootAndApply(parsed.json, bin, options);
  const newBuffer = writeGLB(parsed.json, parsed.chunks);

  const mode = options.mode || 'copy';
  const backup = options.backup !== false;
  let outputPath = absPath;
  let backupPath = null;

  if (mode === 'copy') {
    outputPath = absPath.replace(/\.glb$/i, '.normalised.glb');
  } else if (mode === 'overwrite') {
    if (backup) {
      backupPath = absPath.replace(/\.glb$/i, `.bak-${timestampForFile()}.glb`);
      fs.writeFileSync(backupPath, original);
    }
  } else {
    throw new Error(`Unknown save mode: ${mode}`);
  }

  fs.writeFileSync(outputPath, newBuffer);
  const after = analyseFile(outputPath, options.axis || 'Y');
  return {
    mode,
    outputRel: toRel(outputPath),
    backupRel: backupPath ? toRel(backupPath) : null,
    result,
    warnings,
    after,
  };
}

function timestampForFile() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function listDirectory(rel = '') {
  const abs = safeJoin(ROOT_DIR, rel);
  const stat = fs.statSync(abs);
  if (!stat.isDirectory()) throw new Error('Requested path is not a directory.');
  const entries = fs.readdirSync(abs, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith('.'))
    .map(entry => {
      const entryAbs = path.join(abs, entry.name);
      const st = fs.statSync(entryAbs);
      return {
        name: entry.name,
        rel: toRel(entryAbs),
        type: entry.isDirectory() ? 'dir' : 'file',
        ext: path.extname(entry.name).toLowerCase(),
        size: st.size,
        mtime: st.mtime.toISOString(),
      };
    })
    .filter(e => e.type === 'dir' || e.ext === '.glb')
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

  const parentRel = rel ? toRel(path.dirname(abs)) : '';
  return { root: ROOT_DIR, rel: toRel(abs), parentRel, entries };
}

async function handleApi(req, res, parsedUrl) {
  try {
    const pathname = parsedUrl.pathname;
    const q = parsedUrl.query || {};

    if (req.method === 'GET' && pathname === '/api/root') {
      return sendJson(res, 200, { root: ROOT_DIR, port: PORT });
    }

    if (req.method === 'GET' && pathname === '/api/list') {
      return sendJson(res, 200, listDirectory(q.rel || ''));
    }

    if (req.method === 'GET' && pathname === '/api/analyse') {
      const abs = safeJoin(ROOT_DIR, q.rel || '');
      if (!/\.glb$/i.test(abs)) throw new Error('Only .glb files can be analysed.');
      return sendJson(res, 200, analyseFile(abs, q.axis || 'Y'));
    }

    if (req.method === 'GET' && pathname === '/api/preview') {
      const abs = safeJoin(ROOT_DIR, q.rel || '');
      if (!/\.glb$/i.test(abs)) throw new Error('Only .glb files can be previewed.');
      const parsed = parseGLB(fs.readFileSync(abs));
      const bin = getBinChunk(parsed);
      if (!bin) throw new Error('GLB has no embedded BIN chunk.');
      const stats = computeStatsAndPreview(parsed.json, bin, { axis: q.axis || 'Y', maxPreviewVertices: 12000 });
      return sendJson(res, 200, stats);
    }

    if (req.method === 'POST' && pathname === '/api/save') {
      const body = JSON.parse(await readBody(req));
      const abs = safeJoin(ROOT_DIR, body.rel || '');
      if (!/\.glb$/i.test(abs)) throw new Error('Only .glb files can be saved.');
      const scale = Number(body.scale);
      if (!Number.isFinite(scale) || scale <= 0) throw new Error('Scale must be a positive number.');
      const output = saveNormalised(abs, {
        scale,
        axis: body.axis || 'Y',
        mode: body.mode || 'copy',
        backup: body.backup !== false,
      });
      return sendJson(res, 200, output);
    }

    if (req.method === 'POST' && pathname === '/api/batch') {
      const body = JSON.parse(await readBody(req));
      const scale = Number(body.scale);
      if (!Number.isFinite(scale) || scale <= 0) throw new Error('Scale must be a positive number.');
      const rels = Array.isArray(body.rels) ? body.rels : [];
      const results = [];
      for (const rel of rels) {
        try {
          const abs = safeJoin(ROOT_DIR, rel);
          if (!/\.glb$/i.test(abs)) throw new Error('Skipped non-GLB file.');
          results.push({ rel, ok: true, output: saveNormalised(abs, {
            scale,
            axis: body.axis || 'Y',
            mode: body.mode || 'copy',
            backup: body.backup !== false,
          }) });
        } catch (err) {
          results.push({ rel, ok: false, error: err.message });
        }
      }
      return sendJson(res, 200, { count: rels.length, results });
    }

    return sendJson(res, 404, { error: 'Unknown API route.' });
  } catch (err) {
    return sendJson(res, 400, { error: err.message || String(err) });
  }
}

function serveStatic(req, res, parsedUrl) {
  let pathname = parsedUrl.pathname;
  if (pathname === '/') pathname = '/index.html';
  const abs = safeJoin(APP_DIR, pathname);
  if (!abs.startsWith(APP_DIR)) return sendText(res, 403, 'Forbidden');
  fs.readFile(abs, (err, data) => {
    if (err) return sendText(res, 404, 'Not found');
    const ext = path.extname(abs).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname.startsWith('/api/')) return handleApi(req, res, parsedUrl);
  return serveStatic(req, res, parsedUrl);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('GLB Asset Normaliser');
  console.log('--------------------');
  console.log(`Root folder: ${ROOT_DIR}`);
  console.log(`Open: http://127.0.0.1:${PORT}`);
  console.log('');
  if (process.platform === 'win32') {
    try { childProcess.exec(`start http://127.0.0.1:${PORT}`); } catch {}
  } else if (process.platform === 'darwin') {
    try { childProcess.exec(`open http://127.0.0.1:${PORT}`); } catch {}
  } else {
    try { childProcess.exec(`xdg-open http://127.0.0.1:${PORT}`); } catch {}
  }
});
