import * as THREE from "/lib/three.js";

export default class {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.camera.lookAt(0, 0, 5);
    this.camera.rotation.reorder("YXZ");

    domElement.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    domElement.addEventListener("keydown", this.onKeyDown.bind(this));
    domElement.addEventListener("keyup", this.onKeyUp.bind(this));
    domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
    domElement.focus();

    domElement.addEventListener("click", this.onClick.bind(this));

    domElement.ownerDocument.addEventListener("pointerlockchange", (e) => {
      // Do something here?
    });

    this.mouseMovement = new THREE.Vector2();
    this.moveSpeed = 10;
    this.lookSensitivity = 0.001;
    this.invertLook = true;
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

    if (handled) {
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case "KeyW":
        this.moveForward = false;
        break;
      case "KeyS":
        this.moveBackward = false;
        break;
      case "KeyA":
        this.moveLeft = false;
        break;
      case "KeyD":
        this.moveRight = false;
        break;
      case "KeyE":
        this.moveUp = false;
        break;
      case "KeyQ":
        this.moveDown = false;
        break;
    }
  }

  onMouseMove(e) {
    this.mouseMovement.x += e.movementX;
    this.mouseMovement.y += e.movementY;
    this.#handleRotation();
  }

  onClick(e) {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    } else {
      this.domElement.requestPointerLock();
    }
  }

  update(delta) {
    this.#handleMovement(delta);
    this.#handleRotation();
  }

  #handleMovement(delta) {
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

  #handleRotation() {
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
