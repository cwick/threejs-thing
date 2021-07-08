export default class {
  constructor(editor) {
    this.marker = editor.debug.addMarker(0, 0, 0);
    this.editor = editor;
  }

  onMouseMove(movement) {
    movement.consume();
  }

  onAction(actions) {
    if (actions.consume("RightClick")) {
      this.editor.controls.requestPointerLock();
    }

    if (actions.consume("PointerLocked")) {
      this.editor.controls.stack.pop();
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
  }
}
