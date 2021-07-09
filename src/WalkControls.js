import * as THREE from "/lib/three.js";

export default class {
  constructor(editor) {
    this.editor = editor;
    this.camera = editor.camera;

    this.mouseMovement = new THREE.Vector2();
    this.moveSpeed = 10;
  }

  onAction(actions) {
    this.moveForward = actions.consume("KeyW");
    this.moveBackward = actions.consume("KeyS");
    this.moveLeft = actions.consume("KeyA");
    this.moveRight = actions.consume("KeyD");
    this.moveUp = actions.consume("KeyE");
    this.moveDown = actions.consume("KeyQ");

    if (actions.consume("LeftClick")) {
      this.editor.controls.exitPointerLock();
    }
    if (actions.consume("PointerUnlocked")) {
      this.editor.controls.stack.push("interact");
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
    moveDirection.applyEuler(new THREE.Euler(0, this.camera.yaw, 0));
    this.camera.position.addScaledVector(moveDirection, this.moveSpeed * delta);
  }

  handleRotation() {
    const { preferences } = this.editor.controls;
    this.camera.yaw -= this.mouseMovement.x * preferences.lookSensitivity;
    this.camera.pitch -=
      this.mouseMovement.y *
      preferences.lookSensitivity *
      (preferences.invertLook ? -1 : 1);
  }
}
