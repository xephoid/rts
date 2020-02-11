export default class Gfx {

  constructor(ctx, map, tileSize) {
    this.ctx = ctx;
    this.map = map;
    this.tileSize = tileSize;
    this.loaded = false;
    this.images = {};
  }

  load() {
    const self = this;
    this.background = new Image();
    this.background.onload = () => {
      self.loaded = true;
    }
    this.background.src = 'https://zeke-rts.s3.amazonaws.com/background.png';

    const units = [
      "https://zeke-rts.s3.amazonaws.com/wood_cutter16x16.png",
      "https://zeke-rts.s3.amazonaws.com/knight16x16.png",
      "https://zeke-rts.s3.amazonaws.com/flying_human16x16.png",
      "https://zeke-rts.s3.amazonaws.com/snake_wood_cutter16x16.png",
      "https://zeke-rts.s3.amazonaws.com/snake_knight16x16.png",
      "https://zeke-rts.s3.amazonaws.com/snake_flying16x16.png"
    ];

    units.forEach((imgSrc) => {
      const img = new Image();
      img.src = imgSrc;
      self.images[imgSrc] = img;
    });

    this.map.layers.forEach((layer) => {
      layer.forEach((object) => {
        if (!self.images[object.img]) {
          const img = new Image();
          img.onload = () => {
            // TODO?
          }
          img.src = object.img;
          self.images[object.img] = img;
        }
      });
    });
  }

  draw() {
    if (this.loaded) {
      this.ctx.drawImage(this.background, 0, 0);
      const fog = [];
      for (var i=0; i < this.map.width; i++) {
        fog[i] = [];
        for (var j=0; j < this.map.width; j++) {
          fog[i][j] = 0;
        }
      }
      this.map.layers.forEach((layer) => {
        layer.forEach((object) => {
          if (object.isAlive()) {
            this.ctx.drawImage(this.images[object.img], object.x * this.tileSize, object.y * this.tileSize);
            
            if (object.player && object.player.number === 1) {
              for (var i=-Math.ceil(object.sight/2); i < Math.ceil(object.sight/2); i++) {
                for (var j=-Math.ceil(object.sight/2); j < Math.ceil(object.sight/2); j++) {
                  if (object.x + i >= 0 && object.x + i < this.map.width && object.y + j >= 0 && object.y + j < this.map.height 
                    && this.map.distance(object.x, object.y, object.x + i, object.y + j) <= object.sight) {
                    fog[object.x + i][object.y + j] = 1;
                  }
                }
              }
            }
          }
        });
      });

      for (var i=0; i < this.map.width; i++) {
        for (var j=0; j < this.map.width; j++) {
          if (fog[i][j] === 0) {
            this.ctx.fillRect(i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);
          }
        }
      }
    }
  }
}