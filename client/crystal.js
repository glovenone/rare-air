import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

const colors = [0x747978, 0xbbd6d5, 0x80bc9c, 0x9b96f0, 0xffc372];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const container = document.getElementById("specimen-stage");
const canvas = document.getElementById("crystal-canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
camera.position.set(0, 0.1, 8.5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "low-power",
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x000000, 0);
const environment = new RoomEnvironment();
const generator = new THREE.PMREMGenerator(renderer);
const environmentMap = generator.fromScene(environment, 0.05);
scene.environment = environmentMap.texture;
environment.dispose();
generator.dispose();
new HDRLoader().load("/textures/studio.hdr", (texture) => {
  const studioGenerator = new THREE.PMREMGenerator(renderer);
  const studioMap = studioGenerator.fromEquirectangular(texture);
  scene.environment = studioMap.texture;
  texture.dispose();
  studioGenerator.dispose();
  environmentMap.dispose();
});

const assembly = new THREE.Group();
scene.add(assembly);
const cluster = new THREE.Group();
assembly.add(cluster);
const physicalMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffc372,
  metalness: 0.08,
  roughness: 0.06,
  transmission: 0.93,
  thickness: 1.2,
  ior: 2.1,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  attenuationColor: 0xffa126,
  attenuationDistance: 1.3,
  envMapIntensity: 1.8,
  emissive: 0x612a03,
  emissiveIntensity: 0.06,
  flatShading: true,
});

// Unequal hexagonal facets produce a mineral specimen with a natural profile.
function crystalGeometry(radius, height, seed) {
  const vertices = [];
  const rings = [
    { y: -height * 0.51, radius: radius * 0.1 },
    { y: -height * 0.27, radius: radius * 0.87 },
    { y: height * 0.24, radius },
    { y: height * 0.52, radius: radius * 0.03 },
  ];
  const point = (ring, side) => {
    const angle = (side * Math.PI) / 3 + seed;
    const distortion = 1 + Math.sin(side * 4.7 + seed) * 0.1;
    return [
      Math.cos(angle) * ring.radius * distortion,
      ring.y,
      Math.sin(angle) * ring.radius * distortion,
    ];
  };
  for (let level = 0; level < rings.length - 1; level++) {
    for (let side = 0; side < 6; side++) {
      const a = point(rings[level], side);
      const b = point(rings[level], side + 1);
      const c = point(rings[level + 1], side + 1);
      const d = point(rings[level + 1], side);
      vertices.push(...a, ...c, ...b, ...a, ...d, ...c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

const specimens = [
  {
    radius: 0.65,
    height: 3.4,
    position: [0, 0.1, 0],
    rotation: [0.1, 0.3, -0.23],
  },
  {
    radius: 0.4,
    height: 2.25,
    position: [-0.55, -0.4, 0.16],
    rotation: [-0.13, 0.7, 0.38],
  },
  {
    radius: 0.42,
    height: 2.5,
    position: [0.61, -0.28, -0.1],
    rotation: [0.2, 0.2, -0.62],
  },
  {
    radius: 0.29,
    height: 1.5,
    position: [0.15, -0.62, 0.58],
    rotation: [0.36, 0.5, -0.06],
  },
  {
    radius: 0.23,
    height: 1.25,
    position: [-0.65, -0.7, -0.25],
    rotation: [-0.3, -0.1, 0.6],
  },
];
const mineralMeshes = [];
for (const [index, specimen] of specimens.entries()) {
  const geometry = crystalGeometry(
    specimen.radius,
    specimen.height,
    index * 0.43,
  );
  const material = physicalMaterial.clone();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...specimen.position);
  mesh.rotation.set(...specimen.rotation);
  mesh.userData.restPosition = mesh.position.clone();
  cluster.add(mesh);
  mineralMeshes.push(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 20),
    new THREE.LineBasicMaterial({
      color: 0xffe2a2,
      transparent: true,
      opacity: 0.13,
    }),
  );
  mesh.add(edges);
}
cluster.rotation.set(-0.08, -0.4, -0.16);

const innerLight = new THREE.PointLight(0xff9900, 10, 6, 2);
innerLight.position.set(-0.2, 0.3, -1.2);
assembly.add(innerLight);
const key = new THREE.DirectionalLight(0xffe3b3, 2.2);
key.position.set(-3, 4, 5);
scene.add(key);
const rim = new THREE.DirectionalLight(0xff8e24, 3);
rim.position.set(3, 1, -2);
scene.add(rim);
const fill = new THREE.DirectionalLight(0xd2e7ff, 1.1);
fill.position.set(-4, -1, -2);
scene.add(fill);
scene.add(new THREE.AmbientLight(0xdad5c5, 0.15));

const orbit = new THREE.Group();
assembly.add(orbit);
for (let index = 0; index < 2; index++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.08 + index * 0.22, 0.003, 3, 180),
    new THREE.MeshBasicMaterial({
      color: 0xb39c64,
      transparent: true,
      opacity: 0.24 - index * 0.07,
    }),
  );
  ring.rotation.set(1.12 + index * 0.37, 0.25, index * 0.7);
  orbit.add(ring);
}

const particlePositions = new Float32Array(110 * 3);
const particleSeeds = [];
for (let index = 0; index < 110; index++) {
  const angle = index * 2.399;
  const radius = 1.2 + (index % 17) * 0.12;
  particleSeeds.push({ angle, radius, height: Math.sin(index * 1.7) * 2.2 });
  particlePositions[index * 3] = Math.cos(angle) * radius;
  particlePositions[index * 3 + 1] = Math.sin(index * 1.7) * 2.2;
  particlePositions[index * 3 + 2] = Math.sin(angle) * radius;
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3),
);
const sparkleCanvas = document.createElement("canvas");
sparkleCanvas.width = 32;
sparkleCanvas.height = 32;
const sparkleContext = sparkleCanvas.getContext("2d");
const sparkleGradient = sparkleContext.createRadialGradient(
  16,
  16,
  0,
  16,
  16,
  15,
);
sparkleGradient.addColorStop(0, "#ffffff");
sparkleGradient.addColorStop(0.12, "#ffffffdd");
sparkleGradient.addColorStop(0.35, "#ffffff22");
sparkleGradient.addColorStop(1, "#ffffff00");
sparkleContext.fillStyle = sparkleGradient;
sparkleContext.fillRect(0, 0, 32, 32);
const sparkleTexture = new THREE.CanvasTexture(sparkleCanvas);
const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    map: sparkleTexture,
    color: 0xffd389,
    size: 0.045,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
assembly.add(particles);

let currentMode = "home";
let currentTier = 4;
let desiredRotation = -0.22;
let pointerX = 0;
let pointerY = 0;
let dragging = false;
let previousPointerX = 0;
let burst = 0;
let targetScale = 1;
let previousTime = 0;

function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  camera.position.z = width < 450 ? 9 : 8.5;
}
const observer = new ResizeObserver(resize);
observer.observe(container);
resize();

container.addEventListener("pointerdown", (event) => {
  dragging = true;
  previousPointerX = event.clientX;
  container.setPointerCapture(event.pointerId);
});
container.addEventListener("pointermove", (event) => {
  const bounds = container.getBoundingClientRect();
  pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
  pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
  if (dragging) {
    desiredRotation += (event.clientX - previousPointerX) * 0.009;
    previousPointerX = event.clientX;
  }
});
container.addEventListener("pointerup", () => {
  dragging = false;
});
container.addEventListener("pointercancel", () => {
  dragging = false;
});
container.addEventListener("pointerleave", () => {
  pointerX = 0;
  pointerY = 0;
});
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  container.classList.remove("scene-ready");
});
canvas.addEventListener("webglcontextrestored", () => {
  container.classList.add("scene-ready");
});

function render(time) {
  requestAnimationFrame(render);
  if (
    document.hidden ||
    currentMode === "result" ||
    time - previousTime < (reducedMotion.matches ? 100 : 30)
  )
    return;
  const delta = Math.min((time - previousTime) / 1000, 0.1);
  previousTime = time;
  const elapsed = reducedMotion.matches ? 0 : time / 1000;
  burst = Math.max(0, burst - delta * 0.55);
  if (!reducedMotion.matches && !dragging) desiredRotation += delta * 0.013;
  assembly.rotation.y +=
    (desiredRotation + pointerX * 0.17 - assembly.rotation.y) * 0.045;
  assembly.rotation.x += (pointerY * 0.12 - assembly.rotation.x) * 0.045;
  assembly.position.y = Math.sin(elapsed * 0.65) * 0.08;
  const scale = targetScale * (1 + Math.sin(elapsed) * 0.008);
  assembly.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.07);
  orbit.rotation.y = elapsed * 0.035;
  particles.rotation.y = -elapsed * 0.02;
  innerLight.intensity = (currentTier === 4 ? 9 : 5) + burst * 12;
  for (const mesh of mineralMeshes) {
    const distance = reducedMotion.matches ? 0 : burst * 1.1;
    mesh.position.copy(mesh.userData.restPosition).multiplyScalar(1 + distance);
  }
  for (let index = 0; index < particleSeeds.length; index++) {
    const seed = particleSeeds[index];
    const radius = seed.radius + burst * 1.7;
    particlePositions[index * 3] = Math.cos(seed.angle) * radius;
    particlePositions[index * 3 + 1] =
      seed.height + Math.sin(elapsed * 0.35 + index) * 0.12;
    particlePositions[index * 3 + 2] = Math.sin(seed.angle) * radius;
  }
  particleGeometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}
requestAnimationFrame(render);
container.classList.add("scene-ready");

export function setSpecimen({
  mode = currentMode,
  tier = currentTier,
  celebrate = false,
} = {}) {
  currentMode = mode;
  currentTier = tier;
  targetScale =
    mode === "play"
      ? 0.78
      : mode === "home" && container.clientWidth > 450
        ? 0.84
        : 1;
  const color = new THREE.Color(colors[tier]);
  for (const [index, mesh] of mineralMeshes.entries()) {
    mesh.visible = index < Math.max(1, tier + 1);
    mesh.material.color.copy(color);
    mesh.material.attenuationColor.copy(color);
    mesh.material.emissive
      .copy(color)
      .multiplyScalar(tier === 0 ? 0.005 : 0.035);
    mesh.material.transmission = tier === 0 ? 0.08 : 0.93;
    mesh.material.roughness = tier === 0 ? 0.7 : 0.06;
  }
  particles.material.color.copy(color);
  innerLight.color.copy(color);
  rim.color.copy(color);
  if (celebrate && !reducedMotion.matches) burst = 1;
}
