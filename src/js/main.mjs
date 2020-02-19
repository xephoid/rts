import  Gfx from './gfx';
import GameMap from './map';
import GameController from './controller';
import GameUI from './ui';

Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const map = new GameMap(80, 60);

const gfx = new Gfx(ctx, map, 16);
const controller = new GameController(gfx, map);
const ui = new GameUI(controller);
ui.initialUI();