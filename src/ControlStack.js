class Actions {
  constructor(actions) {
    this.actions = Object.assign({}, actions);
  }

  consume(code) {
    const result = this.actions[code];
    delete this.actions[code];
    return result;
  }

  peek(code) {
    return this.actions[code];
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
    domElement.addEventListener("mousedown", this._onMouseDown.bind(this));
    domElement.addEventListener("mouseup", this._onMouseUp.bind(this));
    domElement.ownerDocument.addEventListener(
      "pointerlockchange",
      this._onPointerLockChange.bind(this)
    );

    domElement.focus();
  }

  controls = [];
  controlRegistry = {};
  actions = {};
  mouseMovement = { x: 0, y: 0 };

  registerControl(name, control) {
    this.controlRegistry[name] = control;
  }

  push(name, args) {
    const control = this.controlRegistry[name];
    if (control) {
      this.controls.unshift(control);
      control.onPush?.(args);
    }
  }

  pop() {
    this._numberToPop += 1;
  }

  update(delta) {
    this._dispatchEvents();
    this._updateControls(delta);
    this._postUpdate();
  }

  _dispatchEvents() {
    const actions = new Actions(this.actions);
    const mouseMovement = new MouseMovements(this.mouseMovement);
    this._numberToPop = 0;

    this.controls.forEach((c) => c.onAction?.(actions));
    this.controls.forEach((c) => c.onMouseMove?.(mouseMovement));
  }

  _updateControls(delta) {
    this.controls.forEach((c) => c.update?.(delta));
  }

  _postUpdate() {
    this.mouseMovement.x = this.mouseMovement.y = 0;
    delete this.actions["LeftClick"];
    delete this.actions["LeftMouseDown"];
    delete this.actions["LeftMouseUp"];
    delete this.actions["RightMouseDown"];
    delete this.actions["RightMouseUp"];
    delete this.actions["RightClick"];
    delete this.actions["PointerLocked"];
    delete this.actions["PointerUnlocked"];

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
    this.actions[e.code] = true;
  }

  _onKeyUp(e) {
    delete this.actions[e.code];
  }

  _onMouseMove(e) {
    this.mouseMovement.x += e.movementX;
    this.mouseMovement.y += e.movementY;
  }

  _onMouseDown(e) {
    const point = this._getMousePositionFromEvent(e);
    if (e.button === 0) {
      this.actions["LeftMouseDown"] = point;
    } else if (e.button === 2) {
      this.actions["RightMouseDown"] = point;
    }
  }

  _onMouseUp(e) {
    const point = this._getMousePositionFromEvent(e);
    if (e.button === 0) {
      this.actions["LeftMouseUp"] = point;
    } else if (e.button === 2) {
      this.actions["RightMouseUp"] = point;
    }
  }

  _onClick(e) {
    const point = this._getMousePositionFromEvent(e);
    if (e.button === 0) {
      this.actions["LeftClick"] = point;
    } else if (e.button === 2) {
      this.actions["RightClick"] = point;
    }
  }

  _onContextMenu(e) {
    e.preventDefault();
    this._onClick(e);
  }

  _onPointerLockChange(e) {
    if (document.pointerLockElement === this.domElement) {
      this.actions["PointerLocked"] = true;
    } else if (!document.pointerLockElement) {
      this.actions["PointerUnlocked"] = true;
    }
  }

  _getMousePositionFromEvent(e) {
    return { x: e.offsetX, y: e.offsetY };
  }
}
