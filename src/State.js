export default class {
  constructor() {}

  enter(args) {}

  exit() {}

  transitionTo(name, args) {
    this._stateManager.transitionTo(name, args);
  }
}
