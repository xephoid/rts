import GameGatherer from "./objects/gatherer";
import RandomMovementBehavior from "./behaviors/random";
import CollectResourcesBehavior from "./behaviors/collect";
import GameExplorer from "./objects/explorer";
import GameSoldier from "./objects/soldier";
import PatrolBehavior from "./behaviors/patrol";

export default class GameAgent {
  
  constructor(map) {
    this.map = map;
    this.home = null;
    this.player = null;

    this.soldiers = [];
    this.gatherers = [];
    this.explorers = [];
  }

  knowlegeArray() {
    const array = [];

    for(var i=0; i<this.map.height/10; i++) {
      array[i] = [];
      for (var j=0; j<this.map.width/10; j++) {
        array[i][j] = 0;
      }
    }
    return array;
  }

  act() {
    this.gatherers.filter(g => g.isAlive()).forEach(g => g.behavior.tick());
    this.explorers.filter(e => e.isAlive()).forEach(e => e.behavior.tick());
    this.soldiers.filter(s => s.isAlive()).forEach(s => s.behavior.tick());
  }

  setResourceRegion() {
    const trees = this.map.look(this.home.x, this.home.y, 0, this.home.sight, "TREE");
    this.soldiers.filter(s => s.isAlive()).forEach(s => trees.concat(this.map.look(s.x, s.y, 0, s.sight, "TREE")));
    this.gatherers.filter(g => g.isAlive()).forEach((s) => {
      const found = this.map.look(s.x, s.y, 0, s.sight, "TREE");
      trees.concat(found);
    });
    this.explorers.filter(e => e.isAlive()).forEach((s) => { 
      const found = this.map.look(s.x, s.y, 0, s.sight, "TREE");
      found.forEach((t) => trees.push(t));
      trees.concat(found);
    });
    
    const knownTrees = this.knowlegeArray();

    console.log(knownTrees);
    trees.forEach((t) => {
      knownTrees[Math.floor(t.y/10)][Math.floor(t.x/10)] += t.resources;
    });

    var densest = 0;
    for (var i=0; i < knownTrees.length; i++) {
      for (var j=0; j < knownTrees[i].length; j++) {
        if (knownTrees[i][j] > densest) {
          this.home.treesRegionX = j * 10;
          this.home.treesRegionY = i * 10;
          densest = knownTrees[i][j];
        }
      }
    }

    this.soldiers.forEach(s => {
      s.behavior.patrolX = this.home.treesRegionX;
      s.behavior.patrolY = this.home.treesRegionY;
    })
    console.log(this.home.treesRegionX, this.home.treesRegionY);
  }

  explore() {
    
  }

  createGatherer() {
    if (this.home.resources >= 50) {
      this.setResourceRegion();
      const gatherer = new GameGatherer(this.player, this.home.x, this.home.y);
      gatherer.behavior = new CollectResourcesBehavior(gatherer, this.map, this.home, this.regionX, this.regionY);
      this.gatherers.push(gatherer);
      this.map.layers[1].push(gatherer);
      this.home.resources -= 50;
    }
  }

  createSoldier() {
    if (this.home.resources >= 100) {
      const soldier = new GameSoldier(this.player, this.home);
      soldier.behavior = new PatrolBehavior(soldier, this.map, this.home.x, this.home.y, 10);
      this.soldiers.push(soldier);
      this.map.layers[1].push(soldier);
      this.home.resources -= 100;
    }
  }

  createExplorer() {
    if (this.home.resources >= 75) {
      const explorer = new GameExplorer(this.player, this.home.x, this.home.y);
      explorer.behavior = new RandomMovementBehavior(explorer, this.map);
      this.explorers.push(explorer);
      this.map.layers[1].push(explorer);
      this.home.resources -= 75;
    }
  }

  defendHome() {

  }

  defendResources() {

  }

  attack() {

  }
}