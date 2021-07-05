export default class {
  states = {};

  transitionTo(name, args) {
    const oldState = this.activeState;
    this.activeState = this.states[name];

    if (oldState) oldState._active = false;
    if (this.activeState) this.activeState._active = true;

    oldState?.exit?.();
    this.activeState?.enter?.(args);
  }

  registerState(name, stateObject) {
    this.states[name] = stateObject;
    stateObject._stateManager = this;
  }

  update(delta) {
    this.activeState?.update?.(delta);
  }
}
