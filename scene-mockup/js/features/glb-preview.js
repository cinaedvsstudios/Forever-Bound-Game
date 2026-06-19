let threeLoaderPromise = null;

async function loadThree() {
  if (!threeLoaderPromise) {
    threeLoaderPromise = Promise.all([
      import('https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js'),
      import('https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/loaders/GLTFLoader.js')
    ]).then(([THREE, loaders]) => ({ THREE, GLTFLoader: loaders.GLTFLoader }));
  }
  return threeLoaderPromise;
}

function fallbackThumbnail() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const context = canvas.getContext('2d');
  context.fillStyle = '#101b2b';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#54c7ff';
  context.lineWidth = 8;
  context.strokeRect(150, 85, 300, 230);
  context.beginPath();
  context.moveTo(150, 85); context.lineTo(300, 22); context.lineTo(450, 85);
  context.moveTo(450, 315); context.lineTo(300, 375); context.lineTo(150, 315);
  context.moveTo(300, 22); context.lineTo(300, 375);
  context.stroke();
  context.fillStyle = '#e7f5ff';
  context.textAlign = 'center';
  context.font = '700 38px system-ui';
  context.fillText('GLB', 300, 220);
  return canvas.toDataURL('image/png');
}

export async function createGlbThumbnail(file) {
  try {
    const { THREE, GLTFLoader } = await loadThree();
    const width = 700;
    const height = 500;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 2000);
    const ambient = new THREE.HemisphereLight(0xcceeff, 0x281f45, 2.1);
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(4, 7, 8);
    const rim = new THREE.DirectionalLight(0x58cfff, 1.3);
    rim.position.set(-6, 4, -7);
    scene.add(ambient, key, rim);

    const loader = new GLTFLoader();
    const objectUrl = URL.createObjectURL(file);
    const gltf = await new Promise((resolve, reject) => loader.load(objectUrl, resolve, undefined, reject));
    URL.revokeObjectURL(objectUrl);
    const model = gltf.scene;
    scene.add(model);

    const bounds = new THREE.Box3().setFromObject(model);
    const centre = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z, 0.001);
    model.position.sub(centre);
    camera.position.set(largest * 1.55, largest * 1.1, largest * 1.75);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    const image = renderer.domElement.toDataURL('image/png');
    renderer.dispose();
    return image;
  } catch (error) {
    console.warn('GLB preview could not be rendered.', error);
    return fallbackThumbnail();
  }
}
