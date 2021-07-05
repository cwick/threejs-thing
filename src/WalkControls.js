import * as THREE from "/lib/three.js";
import Controls from "./Controls.js";

export default class extends Controls {
  constructor(app) {
    super(app);
    this.camera = app.camera;
    this.camera.lookAt(0, 0, 5);
    this.camera.rotation.reorder("YXZ");

    this.mouseMovement = new THREE.Vector2();
    this.moveSpeed = 10;
    this.lookSensitivity = 0.002;
    this.invertLook = true;
  }

  enter() {
    this.requestPointerLock();
  }

  onKeyDown(e) {
    let handled = false;
    switch (e.code) {
      case "KeyW":
        this.moveForward = true;
        handled = true;
        break;
      case "KeyS":
        this.moveBackward = true;
        handled = true;
        break;
      case "KeyA":
        this.moveLeft = true;
        handled = true;
        break;
      case "KeyD":
        this.moveRight = true;
        handled = true;
        break;
      case "KeyE":
        this.moveUp = true;
        handled = true;
        break;
      case "KeyQ":
        this.moveDown = true;
        handled = true;
        break;
    }

    return handled;
  }

  onKeyUp(e) {
    let handled = false;
    switch (e.code) {
      case "KeyW":
        this.moveForward = false;
        handled = true;
        break;
      case "KeyS":
        this.moveBackward = false;
        handled = true;
        break;
      case "KeyA":
        this.moveLeft = false;
        handled = true;
        break;
      case "KeyD":
        this.moveRight = false;
        handled = true;
        break;
      case "KeyE":
        this.moveUp = false;
        handled = true;
        break;
      case "KeyQ":
        this.moveDown = false;
        handled = true;
        break;
    }

    return handled;
  }

  onMouseMove(e) {
    this.mouseMovement.x += e.movementX;
    this.mouseMovement.y += e.movementY;
    this.handleRotation();
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
    if (document.pointerLockElement) {
      this.camera.rotation.y -= this.mouseMovement.x * this.lookSensitivity;
      this.camera.rotation.x -=
        this.mouseMovement.y *
        this.lookSensitivity *
        (this.invertLook ? -1 : 1);

      this.camera.rotation.x = THREE.MathUtils.clamp(
        this.camera.rotation.x,
        -Math.PI / 2,
        Math.PI / 2
      );
    }

    this.mouseMovement.x = this.mouseMovement.y = 0;
  }
}
