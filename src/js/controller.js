import GamePlayer from "./player";
import GameAgent from "./agent";
import GamePortal from "./objects/portal";

export default class GameController {

  constructor(gfx, map) {
    this.gfx = gfx;
    this.map = map;
    this.setup();
  }

  setup() {
    this.ticks = 0;
    const [[home1X, home1Y],[home2X, home2Y]] = this.map.generate();

    this.agent1 = new GameAgent(this.map);
    this.agent2 = new GameAgent(this.map);
    this.player1 = new GamePlayer(1, this.agent1);
    this.player2 = new GamePlayer(2, this.agent2);
    const home1 = new GamePortal(home1X, home1Y, this.player1);
    const home2 = new GamePortal(home2X, home2Y, this.player2);
    this.map.layers[1].push(home1);
    this.map.layers[1].push(home2);

    this.agent1.player = this.player1;
    this.agent2.player = this.player2;
    this.agent1.home = home1;
    this.agent2.home = home2;

    const div = document.getElementById("interaction1");
    this.createButton(div, "Region", () => this.agent1.setResourceRegion());
    this.createButton(div, "Gatherer", () => this.agent1.createGatherer());
    this.createButton(div, "Explorer", () => this.agent1.createExplorer());
    this.createButton(div, "Soldier", () => this.agent1.createSoldier());
    this.createButton(div, "Attack!", () => this.agent1.attack());

    const div2 = document.getElementById("interaction2");
    this.createButton(div2, "Region", () => this.agent2.setResourceRegion());
    this.createButton(div2, "Gatherer", () => this.agent2.createGatherer());
    this.createButton(div2, "Explorer", () => this.agent2.createExplorer());
    this.createButton(div2, "Soldier", () => this.agent2.createSoldier());
    this.createButton(div2, "Attack!", () => this.agent2.attack());

    this.player1Info = document.createElement("div");
    this.player1Info.style.background = '#fff';
    this.player2Info = document.createElement("div");
    this.player2Info.style.background = '#fff';
    div.appendChild(this.player1Info);
    div2.appendChild(this.player2Info);


    this.gfx.load();
  }

  createButton(div, label, onclick) {
    const button = document.createElement("button");
    button.innerText = label;
    button.onclick = onclick;
    div.appendChild(button);
  }

  getPlayerInfo(player) {
    const resources = player.agent.home.resources;
    const gatherers = player.agent.gatherers.filter(g => g.isAlive()).length;
    const explorers = player.agent.explorers.filter(e => e.isAlive()).length;
    const soldiers = player.agent.soldiers.filter(s => s.isAlive()).length;
    return `Resources: ${resources} Gatherers: ${gatherers}<br/> Explorers: ${explorers} Soldiers: ${soldiers}`;
  }

  tick() {
    this.ticks++;
    if (this.ticks >= 10) {
      this.player1Info.innerHTML = this.getPlayerInfo(this.player1);
      this.player2Info.innerHTML = this.getPlayerInfo(this.player2);
      this.ticks = 0;
      this.player1.think();
      this.player2.think();
      this.agent1.act();
      this.agent2.act();
      this.gfx.draw();
    }
  }
}