class Actions {
  constructor(actions) {
    this.actions = new Set(actions.values());
  }

  consume(code) {
    const result = this.actions.has(code);
    this.actions.delete(code);
    return result;
  }
}

class MouseMovements {
  constructor({ x, y }) {
    this.movement = { x, y };
  }

  consume() {
    const result = this.movement;
    this.movement = { x: 0, y: 0 };
    return result;
  }
}

export default class {
  constructor(domElement) {
    this.domElement = domElement;
    domElement.addEventListener("click", this._onClick.bind(this));
    domElement.addEventListener("contextmenu", this._onContextMenu.bind(this));
    domElement.addEventListener("keydown", this._onKeyDown.bind(this));
    domElement.addEventListener("keyup", this._onKeyUp.bind(this));
    domElement.addEventListener("mousemove", this._onMouseMove.bind(this));
    domElement.ownerDocument.addEventListener(
      "pointerlockchange",
      this._onPointerLockChange.bind(this)
    );

    domElement.focus();
  }

  controls = [];
  controlRegistry = {};
  actions = new Set();
  mouseMovement = { x: 0, y: 0 };

  registerControl(name, control) {
    this.controlRegistry[name] = control;
  }

  push(name) {
    const control = this.controlRegistry[name];
    if (control) {
      this.controls.unshift(control);
    }
  }

  pop() {
    this._numberToPop += 1;
  }

  update(delta) {
    const actions = new Actions(this.actions);
    const mouseMovement = new MouseMovements(this.mouseMovement);
    this._numberToPop = 0;
    this.controls.forEach((c) => c.onAction?.(actions));
    this.controls.forEach((c) => c.onMouseMove?.(mouseMovement));
    this.controls.forEach((c) => c.update?.(delta));

    this.mouseMovement.x = this.mouseMovement.y = 0;
    this.actions.delete("LeftClick");
    this.actions.delete("RightClick");
    this.actions.delete("PointerLocked");
    this.actions.delete("PointerUnlocked");

    for (let i = 0; i < this._numberToPop; i++) {
      this.controls.shift();
    }
    this._numberToPop = 0;
  }

  requestPointerLock() {
    this.domElement.requestPointerLock();
  }

  exitPointerLock() {
    document.exitPointerLock();
  }

  _onKeyDown(e) {
    this.actions.add(e.code);
  }

  _onKeyUp(e) {
    this.actions.delete(e.code);
  }

  _onMouseMove(e) {
    this.mouseMovement.x += e.movementX;
    this.mouseMovement.y += e.movementY;
  }

  _onClick(e) {
    if (e.button === 0) {
      this.actions.add("LeftClick");
    } else if (e.button === 2) {
      this.actions.add("RightClick");
    }
  }

  _onContextMenu(e) {
    e.preventDefault();
    this._onClick(e);
  }

  _onPointerLockChange(e) {
    if (document.pointerLockElement === this.domElement) {
      this.actions.add("PointerLocked");
    } else if (!document.pointerLockElement) {
      this.actions.add("PointerUnlocked");
    }
  }
}
