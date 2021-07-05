export default class {
  _listeners = {};

  addEventListener(name, callback) {
    const eventListeners = (this._listeners[name] ??= []);
    eventListeners.push(callback);
  }

  dispatchEvent(name, args) {
    const eventListeners = this._listeners[name] ?? [];
    eventListeners.forEach((f) => f(args));
  }
}
