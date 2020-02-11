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

    for(var i=0; i< (this.map.height/10) + 1; i++) {
      array[i] = [];
      for (var j=0; j< (this.map.width/10) + 1; j++) {
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
    this.soldiers.filter(s => s.isAlive()).forEach(s => this.map.look(s.x, s.y, 0, s.sight, "TREE").forEach(t => trees.push(t)));
    this.gatherers.filter(g => g.isAlive()).forEach((s) => {
      const found = this.map.look(s.x, s.y, 0, s.sight, "TREE");
      found.forEach((t) => trees.push(t));
    });
    this.explorers.filter(e => e.isAlive()).forEach((s) => { 
      const found = this.map.look(s.x, s.y, 0, s.sight, "TREE");
      found.forEach((t) => trees.push(t));
    });

    if (!this.home.knownTrees) {
      this.home.knownTrees = this.knowlegeArray();
    }
    const knownTrees = this.knowlegeArray();
    try {
      trees.forEach((t) => {
        knownTrees[Math.floor(t.y/10)][Math.floor(t.x/10)] += t.resources;
      });
    } catch(e) {
      console.log("Exception!", e, knownTrees);
    }

    var densest = 0;
    for (var i=0; i < knownTrees.length; i++) {
      for (var j=0; j < knownTrees[i].length; j++) {
        this.home.knownTrees[i][j] = (knownTrees[i][j] + this.home.knownTrees[i][j]) / 2;
        if (this.home.knownTrees[i][j] > densest) {
          this.home.treesRegionX = (j * 10) + 5;
          this.home.treesRegionY = (i * 10) + 5;
          densest = this.home.knownTrees[i][j];
        }
      }
    }
  }

  explore() {
    const enemies = this.map.look(this.home.x, this.home.y, 1, this.home.sight).filter(e => e.player.number != this.player.number);
    this.soldiers.filter(s => s.isAlive()).forEach(s => this.map.look(s.x, s.y, 1, s.sight).filter(e => e.player.number != this.player.number).forEach(e => enemies.push(e)));
    this.gatherers.filter(g => g.isAlive()).forEach((s) => {
      const found = this.map.look(s.x, s.y, 1, s.sight).filter(e => e.player.number != this.player.number);
      found.forEach(e => enemies.push(e));
    });
    this.explorers.filter(e => e.isAlive()).forEach((s) => { 
      const found = this.map.look(s.x, s.y, 1, s.sight).filter(e => e.player.number != this.player.number);
      found.forEach((t) => enemies.push(t));
    });

    if (!this.home.knownEnemies) {
      this.home.knownEnemies = this.knowlegeArray();
    }
    const knownEnemies = this.knowlegeArray();
    try {
      enemies.forEach((t) => {
        knownEnemies[Math.floor(t.y/10)][Math.floor(t.x/10)] += t.threat;
      });
    } catch(e) {
      console.log("Exception!", e, knownEnemies);
    }

    var densest = 0;
    for (var i=0; i < knownEnemies.length; i++) {
      for (var j=0; j < knownEnemies[i].length; j++) {
        this.home.knownEnemies[i][j] = (knownEnemies[i][j] + this.home.knownEnemies[i][j]) / 2;
        if (this.home.knownEnemies[i][j] > densest) {
          this.home.enemiesRegionX = (j * 10) + 5;
          this.home.enemiesRegionY = (i * 10) + 5;
          densest = this.home.knownEnemies[i][j];
        }
      }
    }
  }

  createGatherer() {
    if (this.home.resources >= 15) {
      const gatherer = new GameGatherer(this.player, this.home.x, this.home.y);
      gatherer.behavior = new CollectResourcesBehavior(gatherer, this.map, this.home, this.regionX, this.regionY);
      this.gatherers.push(gatherer);
      this.map.layers[1].push(gatherer);
      this.home.resources -= 15;
    }
  }

  createSoldier() {
    if (this.home.resources >= 50) {
      const soldier = new GameSoldier(this.player, this.home);
      soldier.behavior = new PatrolBehavior(soldier, this.map, this.home.x, this.home.y, 10);
      this.soldiers.push(soldier);
      this.map.layers[1].push(soldier);
      this.home.resources -= 50;
    }
  }

  createExplorer() {
    if (this.home.resources >= 20) {
      const explorer = new GameExplorer(this.player, this.home.x, this.home.y);
      explorer.behavior = new RandomMovementBehavior(explorer, this.map);
      this.explorers.push(explorer);
      this.map.layers[1].push(explorer);
      this.home.resources -= 20;
    }
  }

  defendHome() {
    this.soldiers.forEach(s => {
      s.behavior.regionX = this.home.x;
      s.behavior.regionY = this.home.y;
    });
  }

  defendResources() {
    this.soldiers.forEach(s => {
      s.behavior.regionX = this.home.treesRegionX;
      s.behavior.regionY = this.home.treesRegionY;
    });
  }

  attack() {
    this.soldiers.forEach(s => {
      s.behavior.patrolX = this.home.enemiesRegionX;
      s.behavior.patrolY = this.home.enemiesRegionY;
    });
  }
}