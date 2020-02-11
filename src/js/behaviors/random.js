import GameObjectBehavior from '../behavior';

export default class RandomMovementBehavior extends GameObjectBehavior {

  constructor(obj, map) {
    super(obj, map);
    this.setRandomTarget();
  }

  tick() {
    if (this.obj.x < this.targetX) {
      this.obj.x += this.obj.speed;
    } else if (this.obj.x > this.targetX) {
      this.obj.x -= this.obj.speed;
    }
    if (this.obj.y < this.targetY) {
      this.obj.y += this.obj.speed;
    } else if (this.obj.y > this.targetY) {
      this.obj.y -= this.obj.speed;
    }

    if (this.map.distance(this.obj.x, this.obj.y, this.targetX, this.targetY) <= this.obj.speed) {
      this.obj.player.agent.setResourceRegion();
      this.obj.player.agent.explore();
      this.setRandomTarget();
    }
  }

  setRandomTarget() {
    this.targetX = Math.floor(Math.random() * this.map.width);
    this.targetY = Math.floor(Math.random() * this.map.height);
  }
}