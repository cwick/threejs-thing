import * as THREE from "/lib/three.js";

import { Sky } from "/lib/objects.js";
import { OrbitControls } from "/lib/controls.js";
import { RoomEnvironment } from "/lib/environments.js";

const clock = new THREE.Clock();
const scene = new RoomEnvironment();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 5;
camera.position.x = 10;

// Sky
const sky = new Sky();
sky.scale.setScalar(450000);
sky.material.uniforms["sunPosition"].value.copy(
  new THREE.Vector3(0.1, 0.02, 0.1)
);
scene.add(sky);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("render-canvas"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

// Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);

// Ground
const groundGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);
groundGeometry.rotateX(THREE.MathUtils.degToRad(-90));

const plane = new THREE.Mesh(
  groundGeometry,
  new THREE.MeshBasicMaterial({ color: 0xeeeeee })
);
// scene.add(plane);

// Debug
scene.add(new THREE.AxesHelper(5));

const animate = function () {
  requestAnimationFrame(animate);
  orbitControls.update(clock.getDelta());

  renderer.render(scene, camera);
};

animate();
