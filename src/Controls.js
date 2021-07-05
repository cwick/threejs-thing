import * as THREE from "/lib/three.js";
import State from "./State.js";

export default class extends State {
  constructor(domElement) {
    super();
    this.domElement = domElement;

    domElement.addEventListener("click", this._onClick.bind(this));
    domElement.addEventListener("contextmenu", this._onClick.bind(this));
    domElement.addEventListener("keydown", this._onKeyDown.bind(this));
    domElement.addEventListener("keyup", this._onKeyUp.bind(this));
    domElement.addEventListener("mousemove", this._onMouseMove.bind(this));
    domElement.ownerDocument.addEventListener(
      "pointerlockchange",
      this._onPointerLockChange.bind(this)
    );

    domElement.focus();
  }

  _onKeyDown(e) {
    if (!this._active) return;
    if (this.onKeyDown(e)) {
      e.preventDefault();
    }
  }

  onKeyDown(e) {
    return false;
  }

  _onKeyUp(e) {
    if (!this._active) return;
    if (this.onKeyUp(e)) {
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    return false;
  }

  _onMouseMove(e) {
    if (!this._active) return;
    this.onMouseMove(e);
  }

  onMouseMove(e) {}

  _onClick(e) {
    if (!this._active) return;
    this.onClick(e);
    e.preventDefault();
  }

  onClick(e) {}

  _onPointerLockChange() {
    if (!this._active) return;
    if (document.pointerLockElement === this.domElement) {
      this.onPointerLocked?.();
    } else if (!document.pointerLockElement) {
      this.onPointerUnlocked?.();
    }
  }

  requestPointerLock() {
    this.domElement.requestPointerLock();
  }
}
