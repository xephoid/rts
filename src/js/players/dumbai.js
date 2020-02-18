import GamePlayer from "../player";

export default class DumbAIPlayer extends GamePlayer {

  constructor(number, agent) {
    super(number, agent, "DUMB_AI");
  }

  think() {
    if (this.agent.home.resources >= 15 && this.agent.gatherers.filter(g => g.isAlive()).length < 12) {
      this.agent.setResourceRegion();
      this.agent.createGatherer();

    } else if (this.agent.home.resources >= 20 && this.agent.explorers.filter(e => e.isAlive()).length < 4) {
      this.agent.createExplorer();
    } else if (this.agent.home.resources >= 50 && this.agent.soldiers.filter(s => s.isAlive()).length < 20) {
      this.agent.createSoldier();
    } else if (this.agent.soldiers.filter(s => s.isAlive()).length >= 15) {
      this.agent.attack();
    } else {
      this.agent.setResourceRegion();
    }

    if (this.agent.home.hp < 300) {
      this.agent.defendHome();
    }
  }

}