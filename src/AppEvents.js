export default class AppEvents {
  constructor(app) {
    app.dispatcher.addEventListener("pickPoint", this.onPickPoint.bind(this));
  }

  onPickPoint({ x, y }) {
    console.log("pick", x, y);
  }
}
