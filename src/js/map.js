export default class GameMap {

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.layers = [];
    this.objects = [];
    this.map = [];
    for (var i=0; i<height; i++) {
      this.map[i] = [];
      for (var j=0;j<width; j++) {
        this.map[i][j] = null;
      }
    }
  }

  isOccupied(x, y) {
    return this.map[x][y];
  }

  look(x, y, range) {
    const result = [];
    this.objects.forEach((obj) => {
      if (this.distance(x, y, obj.x, obj.y) <= range) {
        result.push(obj);
      }
    });
    return result;
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
  }
}