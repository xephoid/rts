export default class GamePlayer {

  constructor(number, agent) {
    this.number = number;
    this.agent = agent;
  }

  think() {
  }

  act() {
    this.agent.act();
  }

}