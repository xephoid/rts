import TreeObject from './objects/tree';

export default class GameMap {

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.layers = [];
    this.layers[0] = [];
    this.layers[1] = [];
    this.objects = [];
    this.map = [];
    for (var i=0; i<height; i++) {
      this.map[i] = [];
      for (var j=0;j<width; j++) {
        this.map[i][j] = null;
      }
    }
  }

  generate() {
    for(var n=0; n<10; n++) {
      const [x, y] = this.randomPoint();
      const r = Math.floor(Math.random() * 10);
      for (var i = x - r; i < x + r; i++) {
        for (var j = y - r; j < y + r; j++) {
          if (i > 0 && i < this.width && j > 0 && j < this.width && this.distance(x, y, i, j) <= r) {
            this.layers[0].push(new TreeObject(i, j));
          }
        }
      }
    }
    const [firstHomeX, firstHomeY] = this.pickHome();
    return [[firstHomeX, firstHomeY], this.pickHome(firstHomeX, firstHomeY)];
  }

  pickHome(notNearX, notNearY) {
    const nnx = notNearX || 1000;
    const nny = notNearY || 1000;
    do {
      var  [x, y] = this.randomPoint();
      console.log("distance", this.distance(nnx, nny, x, y), "trees", this.look(x, y, 0, 5, "TREE").length);
    } while (this.distance(nnx, nny, x, y) < 20 || this.look(x, y, 0, 5, "TREE").length < 50);
    return [x, y];
  }

  isOccupied(x, y) {
    return this.map[x][y];
  }

  look(x, y, layer, range, type) {
    const result = [];
    this.layers[layer].forEach((obj) => {
      if (obj.isAlive() && this.distance(x, y, obj.x, obj.y) <= range && (!type || type && obj.type === type)) {
        result.push(obj);
      }
    });
    return result;
  }

  randomPoint() {
    return [Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)];
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
  }
}