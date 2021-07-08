import * as THREE from "/lib/three.js";
import { RoomEnvironment } from "/lib/environments.js";
import { Sky } from "/lib/objects.js";
import { EffectComposer, RenderPass, ShaderPass } from "/lib/postprocessing.js";
import { GammaCorrectionShader } from "/lib/shaders.js";

import ControlStack from "./ControlStack.js";
import DepthReadPass from "./DepthReadPass.js";
import InteractControls from "./InteractControls.js";
import WalkControls from "./WalkControls.js";

class Camera {
  constructor(editor) {
    const { canvas } = editor;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.5;
    const farPlane = 100;
    this.#camera = new THREE.PerspectiveCamera(
      75,
      aspectRatio,
      nearPlane,
      farPlane
    );
    this.#camera.rotation.reorder("YXZ");
    this.#camera.position.set(4, 8, 8);
    this.#camera.lookAt(0, 0, 0);
    this.#editor = editor;
    this.#canvas = canvas;
  }

  unproject(x, y) {
    const depth = this.#editor.renderer.readDepth(x, y);
    const clientWidth = this.#canvas.clientWidth;
    const clientHeight = this.#canvas.clientHeight;
    const ndcX = (x / clientWidth) * 2 - 1;
    const ndcY = ((clientHeight - y - 1) / clientHeight) * 2 - 1;
    const ndcDepth = depth * 2 - 1;
    return new THREE.Vector3(ndcX, ndcY, ndcDepth).unproject(this.#camera);
  }

  changeHeadingBy(radians) {}

  changePitchBy(radians) {}

  changePositionBy(x, y) {}

  get yaw() {
    return this.#camera.rotation.y;
  }

  set yaw(value) {
    this.#camera.rotation.y = value;
  }

  get pitch() {
    return this.#camera.rotation.x;
  }

  set pitch(value) {
    this.#camera.rotation.x = value;
    this.#camera.rotation.x = THREE.MathUtils.clamp(
      this.#camera.rotation.x,
      -Math.PI / 2,
      Math.PI / 2
    );
  }

  get position() {
    return {
      addScaledVector: (v, c) => {
        this.#camera.position.addScaledVector(v, c);
      },
    };
  }

  get rotation() {
    return {
      x: 0,
      y: 0,
    };
  }

  _getCamera() {
    return this.#camera;
  }

  #camera;
  #editor;
  #canvas;
}

class Debug {
  constructor({ scene }) {
    this.#scene = scene;
  }

  addMarker(x, y, z) {
    const geometry = new THREE.SphereGeometry(0.1, 4, 4);
    const material = new THREE.MeshBasicMaterial({
      fog: false,
      toneMapped: false,
      color: 0xff0000,
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.#scene.add(sphere);

    return {
      position: {
        set(x, y, z) {
          sphere.position.set(x, y, z);
        },
      },
    };
  }

  #scene;
}

class Clock {
  constructor() {
    this.#clock = new THREE.Clock();
  }

  getDelta() {
    return this.#clock.getDelta();
  }

  #clock;
}

class Scene {
  constructor() {
    this.#scene = new RoomEnvironment();
    const sky = new Sky();
    sky.scale.setScalar(450000);
    sky.material.uniforms["sunPosition"].value.copy(
      new THREE.Vector3(0.1, 0.02, 0.1)
    );
    this.#scene.add(sky);
    this.#scene.add(new THREE.AxesHelper(5));
  }

  add(obj) {
    this.#scene.add(obj);
  }

  _getScene() {
    return this.#scene;
  }

  #scene;
}

class Renderer {
  constructor({ canvas, scene, camera }) {
    const renderer = this.#createRenderer(canvas);
    const renderTarget = this.#createRenderTarget(renderer);
    const effectComposer = new EffectComposer(renderer, renderTarget);
    const depthReadPass = new DepthReadPass();

    effectComposer.addPass(
      new RenderPass(scene._getScene(), camera._getCamera())
    );
    effectComposer.addPass(depthReadPass);
    effectComposer.addPass(new ShaderPass(GammaCorrectionShader));

    this.#depthReader = depthReadPass;
    this.#effectComposer = effectComposer;
  }

  render() {
    this.#effectComposer.render();
  }

  readDepth(x, y) {
    return this.#depthReader.readDepth(x, y);
  }

  #createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    return renderer;
  }

  #createRenderTarget(renderer) {
    const renderTarget = new THREE.WebGLRenderTarget(
      renderer.domElement.width,
      renderer.domElement.height,
      {
        encoding: THREE.LinearEncoding,
        // Important to avoid banding issues due to lack
        // of precision.
        type: THREE.FloatType,
      }
    );
    renderTarget.depthTexture = new THREE.DepthTexture();
    renderTarget.depthTexture.type = THREE.UnsignedIntType;
    return renderTarget;
  }

  #depthReader;
  #effectComposer;
}

class Controls {
  constructor(editor) {
    this.#controlStack = new ControlStack(editor.canvas);
    const walkControls = new WalkControls(editor);
    const interactControls = new InteractControls(editor);
    this.#controlStack.registerControl("walk", walkControls);
    this.#controlStack.registerControl("interact", interactControls);
    this.#controlStack.push("walk");
    this.#controlStack.push("interact");
  }

  update(delta) {
    this.#controlStack.update(delta);
  }

  exitPointerLock() {
    this.#controlStack.exitPointerLock();
  }

  requestPointerLock() {
    this.#controlStack.requestPointerLock();
  }

  get stack() {
    return this.#controlStack;
  }

  #controlStack;
}

export default class Editor {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new Clock(this);
    this.scene = new Scene(this);
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.debug = new Debug(this);
    this.controls = new Controls(this);
  }

  start() {
    requestAnimationFrame(this.start.bind(this));
    this.controls.update(this.clock.getDelta());
    this.renderer.render();
  }
}
