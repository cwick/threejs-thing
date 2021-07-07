import * as THREE from "/lib/three.js";

export default class {
  constructor({ camera, controlStack }) {
    this.camera = camera;
    this.camera.lookAt(0, 0, 5);
    this.camera.rotation.reorder("YXZ");

    this.controlStack = controlStack;

    this.mouseMovement = new THREE.Vector2();
    this.moveSpeed = 10;
    this.lookSensitivity = 0.002;
    this.invertLook = true;
  }

  onAction(actions) {
    this.moveForward = actions.consume("KeyW");
    this.moveBackward = actions.consume("KeyS");
    this.moveLeft = actions.consume("KeyA");
    this.moveRight = actions.consume("KeyD");
    this.moveUp = actions.consume("KeyE");
    this.moveDown = actions.consume("KeyQ");

    if (actions.consume("LeftClick")) {
      this.controlStack.exitPointerLock();
    }
    if (actions.consume("PointerUnlocked")) {
      this.controlStack.push("interact");
    }
  }

  onMouseMove(movement) {
    const { x, y } = movement.consume();
    this.mouseMovement.x = x;
    this.mouseMovement.y = y;
  }

  onClick(e) {
    this.switchToInteractMode();
  }

  onPointerUnlocked() {
    this.transitionTo("interact");
  }

  update(delta) {
    this.handleMovement(delta);
    this.handleRotation();
  }

  switchToInteractMode() {
    document.exitPointerLock();
  }

  handleMovement(delta) {
    const moveDirection = new THREE.Vector3(0, 0, 0);

    if (this.moveForward) {
      moveDirection.z += -1;
    }
    if (this.moveBackward) {
      moveDirection.z += 1;
    }
    if (this.moveRight) {
      moveDirection.x += 1;
    }
    if (this.moveLeft) {
      moveDirection.x -= 1;
    }
    if (this.moveDown) {
      moveDirection.y -= 1;
    }
    if (this.moveUp) {
      moveDirection.y += 1;
    }

    moveDirection.normalize();
    moveDirection.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));

    this.camera.position.addScaledVector(moveDirection, this.moveSpeed * delta);
  }

  handleRotation() {
    this.camera.rotation.y -= this.mouseMovement.x * this.lookSensitivity;
    this.camera.rotation.x -=
      this.mouseMovement.y * this.lookSensitivity * (this.invertLook ? -1 : 1);

    this.camera.rotation.x = THREE.MathUtils.clamp(
      this.camera.rotation.x,
      -Math.PI / 2,
      Math.PI / 2
    );
  }
}
