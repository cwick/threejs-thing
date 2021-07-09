export default class {
  constructor(editor) {
    this.marker = editor.debug.addMarker(0, 0, 0);
    this.editor = editor;
  }

  onMouseMove(movement) {
    movement.consume();
  }

  onAction(actions) {
    if (actions.consume("PointerLocked")) {
      this.editor.controls.stack.pop();
      return;
    }

    if (actions.consume("RightClick")) {
      this.editor.controls.requestPointerLock();
    }

    if (actions.peek("LeftClick")) {
      const { x, y } = actions.consume("LeftClick");
      const worldPosition = this.editor.camera.unproject(x, y);
      this.marker.position.set(
        worldPosition.x,
        worldPosition.y,
        worldPosition.z
      );
    }

    if (actions.peek("LeftMouseDown")) {
      const mousePosition = actions.consume("LeftMouseDown");
      const orbitPoint = this.editor.camera.unproject(
        mousePosition.x,
        mousePosition.y
      );
      this.editor.controls.stack.push("orbit", { orbitPoint });
    }
  }
}
