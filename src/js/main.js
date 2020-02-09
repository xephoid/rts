import  Gfx from './gfx';
import GameMap from './map';
import GameObject from './object';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const map = new GameMap(640, 480);
map.layers[0] = [];
map.layers[0].push(new GameObject(10, 10, 1, 5, 'red'));
const gfx = new Gfx(ctx, map);
var tick = 0;

const main = () => {
  tick++;
  if (tick >= 60) {
    gfx.draw();
    tick = 0;
  }
}

setInterval(main, 1000/60)