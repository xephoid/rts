export default class Gfx {

  constructor(ctx, map) {
    this.ctx = ctx;
    this.map = map;
  }

  draw() {
    this.map.layers.forEach((layer) => {
      layer.forEach((object) => {
        this.ctx.fillStyle = object.color;
        this.ctx.fillRect(object.x, object.y, 1, 1);
      });
    });
  }
}