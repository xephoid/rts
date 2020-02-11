import  Gfx from './gfx';
import GameMap from './map';
import GameController from './controller';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const map = new GameMap(80, 60);
//map.layers[0].push(new GameObject(10, 10, 1, 0, 'https://zeke-rts.s3.amazonaws.com/portal16x16.png'));

// const behaviors = [];
// for (var i = 0; i<1000; i++) {
//   const woodCutter = new GameObject(10, 10, 1, 5, 'https://zeke-rts.s3.amazonaws.com/wood_cutter16x16.png');
//   map.layers[1].push(woodCutter);
//   behaviors.push(new RandomMovementBehavior(woodCutter, map));
// }

const gfx = new Gfx(ctx, map, 16);
const controller = new GameController(gfx, map);

const main = () => {
  controller.tick();
}

controller.interval = setInterval(main, 1000/60);