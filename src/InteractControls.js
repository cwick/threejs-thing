import * as THREE from "/lib/three.js";

export default class {
  constructor({ controlStack, depthReader, renderer, camera, scene }) {
    this.controlStack = controlStack;
    this.depthReader = depthReader;
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    const geometry = new THREE.SphereGeometry(0.1, 4, 4);
    const material = new THREE.MeshBasicMaterial({
      fog: false,
      toneMapped: false,
      color: 0xff0000,
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.scene.add(sphere);
    this.marker = sphere;
  }

  onMouseMove(movement) {
    movement.consume();
  }

  onAction(actions) {
    if (actions.consume("RightClick")) {
      this.controlStack.requestPointerLock();
    }

    if (actions.consume("PointerLocked")) {
      this.controlStack.pop();
    }

    if (actions.peek("LeftClick")) {
      const { x, y } = actions.consume("LeftClick");
      const depth = this.depthReader.readDepth(x, y);
      const size = this.renderer.getSize(new THREE.Vector2());
      const ndcX = (x / size.x) * 2 - 1;
      const ndcY = ((size.y - y - 1) / size.y) * 2 - 1;
      const ndcDepth = depth * 2 - 1;
      console.log("Pick", ndcX, ndcY, ndcDepth);
      const worldPosition = new THREE.Vector3(ndcX, ndcY, ndcDepth).unproject(
        this.camera
      );
      console.log(worldPosition);

      this.marker.position.copy(worldPosition);
    }
  }
}
