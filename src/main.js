import * as THREE from "/lib/three.js";
import { Sky } from "/lib/objects.js";
import { RoomEnvironment } from "/lib/environments.js";
import { EffectComposer, RenderPass, ShaderPass } from "/lib/postprocessing.js";
import { GammaCorrectionShader } from "/lib/shaders.js";

import ControlStack from "./ControlStack.js";
import WalkControls from "./WalkControls.js";
import InteractControls from "./InteractControls.js";
import DepthReadPass from "./DepthReadPass.js";

const app = {};
app.clock = new THREE.Clock();
app.scene = new RoomEnvironment();
app.camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.5,
  100
);
app.camera.position.y = 5;
app.camera.position.x = 10;

// Sky
const sky = new Sky();
sky.scale.setScalar(450000);
sky.material.uniforms["sunPosition"].value.copy(
  new THREE.Vector3(0.1, 0.02, 0.1)
);
app.scene.add(sky);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("render-canvas"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);
app.renderer = renderer;

// Controls
app.controlStack = new ControlStack(renderer.domElement);
const walkControls = new WalkControls(app);
const interactControls = new InteractControls(app);
app.controlStack.registerControl("walk", walkControls);
app.controlStack.registerControl("interact", interactControls);
app.controlStack.push("walk");
app.controlStack.push("interact");

// Ground
const groundGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);
groundGeometry.rotateX(THREE.MathUtils.degToRad(-90));

const plane = new THREE.Mesh(
  groundGeometry,
  new THREE.MeshBasicMaterial({ color: 0xeeeeee })
);

// Debug
app.scene.add(new THREE.AxesHelper(5));

const renderTarget = new THREE.WebGLRenderTarget(
  renderer.domElement.width,
  renderer.domElement.height,
  {
    encoding: THREE.LinearEncoding,
    type: THREE.FloatType,
  }
);
renderTarget.depthTexture = new THREE.DepthTexture();
renderTarget.depthTexture.type = THREE.UnsignedIntType;

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.addPass(new RenderPass(app.scene, app.camera));
effectComposer.addPass(new DepthReadPass());
effectComposer.addPass(new ShaderPass(GammaCorrectionShader));

const animate = function () {
  requestAnimationFrame(animate);

  app.controlStack.update(app.clock.getDelta());
  effectComposer.render();
};

animate();
