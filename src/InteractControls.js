export default class {
  constructor({ controlStack }) {
    this.controlStack = controlStack;
  }

  onMouseMove(movement) {
    movement.consume();
  }

  onAction(actions) {
    if (actions.consume("RightClick")) {
      this.controlStack.requestPointerLock();
    }

    if (actions.consume("PointerLocked")) {
      this.controlStack.pop();
    }

    if (actions.consume("LeftClick")) {
      console.log("Pick");
    }
  }
}
