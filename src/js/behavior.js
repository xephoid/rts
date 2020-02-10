export default class GameObjectBehavior {

  constructor(obj, map) {
    this.obj = obj;
    this.map = map;
  }

  tick() {
    
  }

  moveTowards(x, y) {
    if (this.obj.x < x) {
      this.obj.x += this.obj.speed;
    } else if (this.obj.x > x) {
      this.obj.x -= this.obj.speed;
    }
    if (this.obj.y < y) {
      this.obj.y += this.obj.speed;
    } else if (this.obj.y > y) {
      this.obj.y -= this.obj.speed;
    }
  }

}