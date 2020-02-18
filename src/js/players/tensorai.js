import GamePlayer from "../player";

const ACTION_NAMES = {
  0: "Assess",
  1: "Gatherer",
  2: "Explorer",
  3: "Soldier",
  4: "Attack!",
  5: "Defend_Home",
  6: "Defend_Resources",
  7: "???"
}

export default class TensorPlayer extends GamePlayer {

  constructor(number, agent, model) {
    super(number, agent);
    this.model = model;
    this.baseFitness = [0,0,0,0,0,0,0];
    this.useRates = [0,0,0,0,0,0,0,0];
  }

  normalize(array, max) {
    return array.map(row => row.map(v => v / max));
  }

  think(time) {
    this.lifespan = time;
    if (Array.isArray(this.agent.home.knownTrees) && Array.isArray(this.agent.home.knownEnemies)) {
      tf.tidy(() => {
        const normalizedResoures = tf.tensor2d(this.normalize(this.agent.home.knownTrees, 1500)).flatten();
        const normalizedEnemies = tf.tensor2d(this.normalize(this.agent.home.knownEnemies, 200)).flatten();
        const units = tf.tensor1d([this.agent.soldiers.length/100, this.agent.gatherers.length/100, this.agent.explorers.length/100]);
        const input = tf.concat([tf.tensor1d([time/1000, this.agent.home.hp/350, this.agent.home.resources / 1000]), units, normalizedResoures, normalizedEnemies]);
        const output = this.model.predict(input).dataSync();
        let highest = -200, index = 0;
        for (let i = 0; i < 7; i++) {
          if (output[i] > highest) {
            highest = output[i];
            index = i;
          }
        }
        // console.log(index, highest);
        let itWorked;
        switch(index) {
          case 0: itWorked = this.agent.assesstUnits(); break;
          case 1: itWorked = this.agent.createGatherer(); break;
          case 2: itWorked = this.agent.createExplorer(); break;
          case 3: itWorked = this.agent.createSoldier(); break;
          case 4: itWorked = this.agent.attack(); break;
          case 5: itWorked = this.agent.defendHome(); break;
          case 6: itWorked = this.agent.defendResources(); break;
          default: break;
        }
        
        if (itWorked) this.baseFitness[index]++;

        this.useRates[index]++;
      });
    } else {
      this.agent.setResourceRegion();
      this.agent.explore();
      this.agent.assesstUnits();
    }
  }

  characteristics() {
    return this.useRates.map((r, i) => {
      return { name: ACTION_NAMES[i] + "_" + r, value: r }
    }).sort((a, b) => a.value - b.value)
    .reverse();
  }

  fitness() {
    //console.log(this.agent.home.knownEnemies.reduce( (acc, row) => row.reduce((a, v) => parseInt(a) + parseInt(v)) + acc));
    this.agent.assesstUnits();
    // return (this.agent.home.hp/350) 
    //   + this.agent.soldiers.reduce((acc, s) => s.kills + acc, 0)
    //   + parseFloat((this.agent.home.resources/10000).toFixed(2))
    //   + (this.agent.soldiers.length > 0 ? 1 : 0) 
    //   + (this.agent.gatherers.length > 0 ? 1: 0) 
    //   + (this.agent.explorers.length > 0 ? 1 : 0);
      //+ this.total(this.agent.home.knownEnemies) 
      // + this.total(this.agent.home.knownForces) 
      //+ this.total(this.agent.home.knownTrees)
    // return this.lifespan / 1000
    //   + this.agent.soldiers.reduce((acc, s) => s.kills + acc, 0)
    return this.baseFitness.reduce((acc, v) => acc += (v > 0 ? 1 : 0), 0)
      + this.useRates.reduce((acc, v) => acc += (v > 0 ? 0.1 : 0), 0)
      + (this.agent.home.hp/350) 
      + (this.agent.soldiers.length > 0 ? 1 : 0) 
      + (this.agent.gatherers.length > 0 ? 1: 0) 
      + (this.agent.explorers.length > 0 ? 1 : 0)
      + (this.agent.soldiers.reduce((acc, s) => s.kills + acc, 0) > 100 ? 1 : 0)
      - this.model.gameLoses;
  }
}