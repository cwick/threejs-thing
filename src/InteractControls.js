import * as THREE from "/lib/three.js";

export default class {
  constructor({ controlStack, depthReader, renderer, camera }) {
    this.controlStack = controlStack;
    this.depthReader = depthReader;
    this.renderer = renderer;
    this.camera = camera;
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
      const ndcX = (x / (size.x - 1)) * 2 - 1;
      const ndcY = (y / (size.y - 1)) * 2 - 1;
      const ndcDepth = depth * 2 - 1;
      console.log("Pick", x / (size.x - 1), y / (size.y - 1), depth);
      console.log(
        new THREE.Vector3(ndcX, ndcY, ndcDepth).unproject(this.camera)
      );
    }
  }
}
