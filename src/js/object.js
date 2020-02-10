export default class GameObject {

  constructor(player, x, y, speed, sight, type, img, hp, dmg, threat) {
    this.player = player;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sight = sight;
    this.type = type;
    this.img = img;
    this.hp = hp;
    this.dmg = dmg;
    this.threat = threat;
    this.sides = [
      [null, null, null],
      [null, "X", null],
      [null, null, null]
    ]
  }

  isAlive() {
    return this.hp > 0;
  }

  damage(amount) {
    const actual = Math.min(this.hp, amount);
    this.hp -= actual;
    if (this.hp < 1) {
      console.log("DEATH!");
      if (this.type === "GATHERER") {
        if (this.behavior.target) {
          console.log("unclaim!");
          this.behavior.target.unclaim();
        }
      } else if (this.type == "SOLDIER") {
        if (this.behavior.target) {
          console.log("Disengage!");
          this.behavior.disengage();
        }
      }
    }
    return actual;
  }
}