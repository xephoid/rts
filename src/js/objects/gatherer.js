import GameObject from "../object";

export default class GameGatherer extends GameObject {
  constructor(player, x, y) {
    super(player, x, y, 1, 5, "GATHERER", 
    player.number == 1 ? "https://zeke-rts.s3.amazonaws.com/wood_cutter16x16.png": "https://zeke-rts.s3.amazonaws.com/snake_wood_cutter16x16.png",
    1, 1, 1);
    this.capacity = 5;
    this.carrying = 0;
  }
}