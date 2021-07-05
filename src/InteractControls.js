import Controls from "./Controls.js";
import WalkControls from "./WalkControls.js";

export default class extends WalkControls {
  constructor(camera, domElement) {
    super(camera, domElement);
  }

  enter() {}

  onClick(e) {
    if (e.button === 2) {
      this.transitionTo("walk");
    }
  }

  onMouseMove(e) {}

  onPointerUnlocked() {}
}
