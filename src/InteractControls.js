import Controls from "./Controls.js";
import WalkControls from "./WalkControls.js";

export default class extends WalkControls {
  enter() {}

  onClick(e) {
    if (e.button === 0) {
      this.dispatcher.dispatchEvent("pickPoint", {
        x: e.offsetX,
        y: e.offsetY,
      });
    } else if (e.button === 2) {
      this.transitionTo("walk");
    }
  }

  onMouseMove(e) {}

  onPointerUnlocked() {}
}
