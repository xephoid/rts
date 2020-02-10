import GameObject from "../object";

export default class GameSoldier extends GameObject {
  constructor(player, home) {
    super(player, home.x, home.y, 1, 7, "SOLDIER", player.number === 1 ? "https://zeke-rts.s3.amazonaws.com/knight16x16.png" : "https://zeke-rts.s3.amazonaws.com/snake_knight16x16.png", 5, 2, 5);
  }
}