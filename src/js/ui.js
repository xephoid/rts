export default class GameUI {
  constructor(controller) {
    this.controller = controller;
  }

  createButton(div, label, onclick) {
    const button = document.createElement("button");
    button.innerText = label;
    button.onclick = onclick;
    div.appendChild(button);
  }

  initialUI() {
    const form = '<form id="gameSettings"> \
        <div>Max Generations: <input name="maxGenerations" value="1000" /></div> \
        <div>Speed: <input name="speed" value="10" /></div> \
        <div> \
        Player1: \
          <select name="player1Type"> \
            <option value="TENSOR_AI">Tensor AI</option> \
            <option value="HUMAN">Human</option> \
            <option value="DUMB_AI">Dumb AI</option> \
          </select> \
          <input type="file" name="player1json" /> \
          <input type="file" name="player1weights" /> \
        NUERONS? \
        LAYERS? \
        </div> \
        <div> \
        Player 2: \
          <select name="player2Type"> \
            <option value="TENSOR_AI">Tensor AI</option> \
            <option value="HUMAN">Human</option> \
            <option value="DUMB_AI">Dumb AI</option> \
          </select> \
          <input type="file" name="player2json" /> \
          <input type="file" name="player2weights" /> \
        </div> \
      </form> \
      <button id="startButton">Start</button>';

    const div = document.createElement('div');
    div.innerHTML = form;

    document.body.prepend(div);

    const startButton = document.getElementById("startButton");
    

    const gameSettings = document.getElementById("gameSettings");
    console.log(gameSettings.maxGenerations.value);
    startButton.onclick = async () => {
      
      await this.controller.setup(gameSettings.maxGenerations.value, 
        gameSettings.speed.value, 
        gameSettings.player1Type.value, 
        gameSettings.player2Type.value,
        [gameSettings.player1json, gameSettings.player1weights], 
        [gameSettings.player2json, gameSettings.player2weights]);

      this.gameUI();
      this.controller.start();
      

      const gameLoop = () => {
        this.updateUI();
        this.controller.tick();
      }

      this.controller.interval = setInterval(gameLoop, 1000/60);
    }
  }

  gameUI() {
    const div = document.getElementById("interaction1");
    div.innerHTML = '';
    if (this.controller.player1.type === "HUMAN") {
      this.createButton(div, "Defend", () => this.agent1.defendHome());
      this.createButton(div, "Resources", () => this.agent1.defendResources());
      this.createButton(div, "Gatherer (15)", () => this.agent1.createGatherer());
      this.createButton(div, "Explorer (20)", () => this.agent1.createExplorer());
      this.createButton(div, "Soldier (50)", () => this.agent1.createSoldier());
      this.createButton(div, "Attack!", () => this.agent1.attack());
    }

    const div2 = document.getElementById("interaction2");
    div2.innerHTML = '';
    if (this.controller.player2.type === "HUMAN") {
      this.createButton(div2, "Region", () => this.agent2.setResourceRegion());
      this.createButton(div2, "Gatherer", () => this.agent2.createGatherer());
      this.createButton(div2, "Explorer", () => this.agent2.createExplorer());
      this.createButton(div2, "Soldier", () => this.agent2.createSoldier());
      this.createButton(div2, "Attack!", () => this.agent2.attack());
    }

    this.player1Info = document.createElement("div");
    this.player1Info.style.background = '#fff';
    this.player2Info = document.createElement("div");
    this.player2Info.style.background = '#fff';
    div.appendChild(this.player1Info);
    div2.appendChild(this.player2Info);
  }

  updateUI() {
    this.player1Info.innerHTML = this.controller.getPlayerInfo(this.controller.player1) + ` Ticks: ${this.controller.time}`;
    this.player2Info.innerHTML = this.controller.getPlayerInfo(this.controller.player2);
  }
}