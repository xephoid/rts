import GameObject from "../object";

export default class GamePortal extends GameObject {
  constructor(x, y, player) {
    super(player, x, y, 0, 10, "PORTAL", 
      player.number == 1 ? "https://zeke-rts.s3.amazonaws.com/portal16x16.png" : "https://zeke-rts.s3.amazonaws.com/snake_portal16x16.png",
      350, 0, 1000);
    this.regionX = x;
    this.regionY = y;
    this.resources = 50;
  }
}