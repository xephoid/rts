import GameObject from "../object";

export default class GameTree extends GameObject {

  constructor(x, y) {
    super(null, x, y, 0, 0, "TREE", "https://zeke-rts.s3.amazonaws.com/tree16x16.png");
    this.resources = 10;
  }

  claim(obj) {
    this.player = obj.player;
    this.claimed = true;
  }

  unclaim() {
    this.claimed = false;
  }

  collect(amount) {
    const actual = Math.min(amount, this.resources);
    this.resources -= actual;
    return actual;
  }

  isAlive() {
    return this.resources > 0;
  }
}