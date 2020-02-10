import GameObject from "../object";

export default class GameExplorer extends GameObject {
  constructor(player, x, y, targetRegionX, targetRegionY) {
    super(player, x, y, 2, 10, "EXPLORER", 
      player.number == 1 ? "https://zeke-rts.s3.amazonaws.com/flying_human16x16.png" : "https://zeke-rts.s3.amazonaws.com/snake_flying16x16.png",
      3, 1, 2);
    this.targetRegionX = targetRegionX;
    this.targetRegionY = targetRegionY;
  }
}