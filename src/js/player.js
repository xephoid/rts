export default class GamePlayer {

  constructor(number, agent) {
    this.number = number;
    this.agent = agent;
    this.name = null;
    this.loses = 0;
  }

  think() {
  }

  act() {
    this.agent.act();
  }

  unitCount() {
    return this.agent.soldiers.length + this.agent.gatherers.length + this.agent.explorers.length;
  }

  totalKills() {
    return this.agent.soldiers.reduce((acc, s) => s.kills + acc, 0);
  }

  resourceCount() {
    return this.agent.home.resources;
  }

  fitness() {
    return -100;
  }

  characteristics() {
    return ["None"];
  }

  total(twoDarray) {
    let total = 0;
    for(let i = 0 ; i< twoDarray.length; i++) {
      for (let j = 0; j < twoDarray[i].length; j++) {
        total += twoDarray[i][j];
      }
    }
    return total;
  }

}