import GameObjectBehavior from "../behavior";

const PATROL = 1;
const ATTACKING = 2;

export default class PatrolBehavior extends GameObjectBehavior {
  constructor(obj, map, regionX, regionY, regionSize) {
    super(obj, map);
    this.regionX = regionX;
    this.regionY = regionY;
    this.regionSize = regionSize;
    this.state = PATROL;
    this.patrolX = regionX;
    this.patrolY = regionY;
  }

  tick() {
    if (this.state === PATROL) {
      this.moveTowards(this.patrolX, this.patrolY);
      if (this.obj.x == this.patrolX && this.obj.y == this.patrolY) {
        this.randomPointInRegion();
      }
      this.map.look(this.obj.x, this.obj.y, 1, this.obj.sight).forEach((obj) => {
        if (this.state === PATROL && obj.player && obj.player.number !== this.obj.player.number) {
          if (this.pickAttackSide(obj)) {
            this.state = ATTACKING;
          }
        }
      });
    } else if (this.state === ATTACKING) {
      if (this.target) {
        if (!this.target.isAlive() || this.map.distance(this.obj.x, this.obj.y, this.target.x, this.target.y) > this.obj.sight) {
          this.disengage();
        } else if (this.map.distance(this.obj.x, this.obj.y, this.target.x, this.target.y) < 2) {
          this.target.damage(this.obj.dmg);
          if (this.target.hp < 1) {
            this.obj.kills++;
          }
        } else {
          this.moveTowards(this.target.x + this.sideX, this.target.y + this.sideY);
        }
      }
    }
  }

  disengage() {
    if (this.target) {
      this.target.sides[this.sideX + 1][this.sideY + 1] = null;
      this.target = null;
    }
    this.state = PATROL;
  }

  pickAttackSide(target) {
    this.sideX = null;
    this.sideY = null;
    var pickedX = null;
    var pickedY = null;
    var distance = 1000;
    for (var i=0; i < target.sides.length; i++) {
      for (var j=0; j < target.sides[0].length; j++) {
        if (target.sides[i][j] === null && ((pickedX == null && pickedY == null) || this.map.distance(this.obj.x, this.obj.y, target.x + (i - 1), target.y + (j - 1)) < distance)) {
          pickedX = i - 1;
          pickedY = j - 1;
          distance = this.map.distance(this.obj.x, this.obj.y, target.x + pickedX, target.y + pickedY);
        }
      }
    }
    if (pickedX !== null && pickedY !== null) {
      this.sideX = pickedX;
      this.sideY = pickedY;
      target.sides[pickedX + 1][pickedY + 1] = this.obj;
      this.target = target;
    }
    return this.sideX !== null && this.sideY !== null;
  }

  randomPointInRegion() {
    this.patrolX = this.regionX + Math.floor(Math.random() * this.regionSize) - (this.regionSize / 2);
    this.patrolY = this.regionY + Math.floor(Math.random() * this.regionSize) - (this.regionSize / 2);
  }
}