export default class {
  constructor(editor) {
    this.editor = editor;
  }

  onPush({ orbitPoint }) {
    this.orbitPoint = orbitPoint;
  }

  onMouseMove(movement) {
    this.mouseMovement = movement.consume();
  }

  onAction(actions) {
    actions.consume("LeftMouseDown");

    if (actions.consume("LeftMouseUp")) {
      this.editor.controls.stack.pop();
    }
  }

  update(delta) {
    const { x, y } = this.mouseMovement;
    const { preferences } = this.editor.controls;
    if (x) {
      this.editor.camera.orbitAroundPoint(
        this.orbitPoint,
        x * preferences.lookSensitivity
      );
    }
  }
}
