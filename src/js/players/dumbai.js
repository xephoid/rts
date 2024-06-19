import GamePlayer from "../player";

export default class DumbAIPlayer extends GamePlayer {

  constructor(number, agent, opponent) {
    super(number, agent, "DUMB_AI", opponent);
  }

  think() {
    if (this.agent.home.resources >= 15 && this.agent.gatherers.filter(g => g.isAlive()).length < 12) {
      this.agent.setResourceRegion();
      this.agent.createGatherer();
      this.lastAction = 'Gatherer';
    } else if (this.agent.home.resources >= 20 && this.agent.explorers.filter(e => e.isAlive()).length < 4) {
      this.agent.createExplorer();
      this.lastAction = 'Explorer';
    } else if (this.agent.home.resources >= 50 && this.agent.soldiers.filter(s => s.isAlive()).length < 20) {
      this.agent.createSoldier();
      this.lastAction = 'Soldier';
    } else if (this.agent.soldiers.filter(s => s.isAlive()).length >= 15) {
      this.agent.attack();
      this.lastAction = 'Attack!';
    } else {
      this.agent.setResourceRegion();
      this.lastAction = 'Region';
    }

    if (this.agent.home.hp < 300) {
      this.agent.defendHome();
    }
  }

}