import GamePlayer from "./player";
import GameAgent from "./agent";
import GamePortal from "./objects/portal";
import DumbAIPlayer from "./players/dumbai";
import TensorPlayer from "./players/tensorai";
import GameMap from "./map";
import GeneticAlgorithm from './genetic';

const HIDDEN_LAYERS = 1;
const HIDDEN_NUERONS = 16;
const KERNEL = 'leCunNormal';
const ACTIVATION = 'tanh';
export default class GameController {

  constructor(gfx) {
    this.gfx = gfx;
    this.gameOver = false;

    this.generation = 0;
    this.winners = [];
    this.population = [];
    this.oldPlayers = [];
    
    for (let i = 0; i < 10; i++) {
      this.population.push(this.createModel());
    }

    this.ga = new GeneticAlgorithm(this.population);

    this.setup();
    this.setupUI();
    this.gfx.load();
  }

  setup() {
    this.map = new GameMap(80, 60);
    this.gfx.map = this.map;
    this.ticks = 0;
    this.time = 0;
    this.gameOver = false;
    const [[home1X, home1Y],[home2X, home2Y]] = this.map.generate();

    this.agent1 = new GameAgent(this.map);
    this.agent2 = new GameAgent(this.map);
    this.shuffle(this.population);
    console.log(this.population);

    this.player1 = new TensorPlayer(1, this.agent1, this.population.pop());
    this.player2 = new TensorPlayer(2, this.agent2, this.population.pop());
    const home1 = new GamePortal(home1X, home1Y, this.player1);
    const home2 = new GamePortal(home2X, home2Y, this.player2);
    this.map.layers[1].push(home1);
    this.map.layers[1].push(home2);

    this.agent1.player = this.player1;
    this.agent2.player = this.player2;
    this.agent1.home = home1;
    this.agent2.home = home2;
    
    this.player1Fitness = 0;
    this.player2Fitness = 0;
    this.winnersByFitness = {};
    this.totalUnits = 0;
    this.idleTime = 0;
  }

  setupUI() {
    const div = document.getElementById("interaction1");
    // this.createButton(div, "Defend", () => this.agent1.defendHome());
    // this.createButton(div, "Resources", () => this.agent1.defendResources());
    // this.createButton(div, "Gatherer (15)", () => this.agent1.createGatherer());
    // this.createButton(div, "Explorer (20)", () => this.agent1.createExplorer());
    // this.createButton(div, "Soldier (50)", () => this.agent1.createSoldier());
    // this.createButton(div, "Attack!", () => this.agent1.attack());

    const div2 = document.getElementById("interaction2");
    // this.createButton(div2, "Region", () => this.agent2.setResourceRegion());
    // this.createButton(div2, "Gatherer", () => this.agent2.createGatherer());
    // this.createButton(div2, "Explorer", () => this.agent2.createExplorer());
    // this.createButton(div2, "Soldier", () => this.agent2.createSoldier());
    // this.createButton(div2, "Attack!", () => this.agent2.attack());

    this.player1Info = document.createElement("div");
    this.player1Info.style.background = '#fff';
    this.player2Info = document.createElement("div");
    this.player2Info.style.background = '#fff';
    div.appendChild(this.player1Info);
    div2.appendChild(this.player2Info);
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
    return `Resources: ${resources} Gatherers: ${gatherers} Explorers: ${explorers} Soldiers: ${soldiers} Health: ${player.agent.home.hp}/350`;
  }

  tick() {
    if (!this.gameOver) {
      this.ticks++;
      if (this.ticks >= 1) {
        const prevUnitCount = this.totalUnits;
        this.totalUnits = this.player1.unitCount() + this.player2.unitCount() + this.player1.resourceCount() + this.player2.resourceCount() + this.player1.totalKills() + this.player2.totalKills();
        if (prevUnitCount === this.totalUnits) {
          this.idleTime++;
        } else {
          this.idleTime = 0;
        }
        if (!this.player1.agent.home.isAlive()) {
          //document.getElementById("player2wins").style.display = "block";
          this.gameOver = true;
        } else if (!this.player2.agent.home.isAlive()) {
          //document.getElementById("player1wins").style.display = "block";
          this.gameOver = true;
        } else if (this.idleTime > 300 || this.time > 800) {
          //document.getElementById("player1wins").innerHTML = "<h1>Time up!</h1>";
          //document.getElementById("player1wins").style.display = "block";
          this.gameOver = true;
        }
        
        this.player1Info.innerHTML = this.getPlayerInfo(this.player1) + ` Ticks: ${this.time}`;
        this.player2Info.innerHTML = this.getPlayerInfo(this.player2);
        this.ticks = 0;
        this.time++;
        this.player1.think(this.time);
        this.player2.think(this.time);
        this.agent1.act();
        this.agent2.act();
        this.gfx.draw();
      }
    } else {
      this.player1.name = "G"+ this.generation + "_P1_" + this.player1.characteristics()[0].name;
      this.player2.name = "G"+ this.generation + "_P2_" + this.player2.characteristics()[0].name;

      console.log(this.player1.name, this.player1.fitness(), this.player2.name, this.player2.fitness(), this.player1.characteristics(), this.player2.characteristics());

      this.oldPlayers.push(this.player1);
      this.oldPlayers.push(this.player2);
      if (this.population.length < 1) {
        this.winners = this.oldPlayers.sort((a, b) => a.fitness() - b.fitness()).reverse().slice(0, 4);
        console.log("winners", this.winners.map(w => w.name));
        this.shuffle(this.winners);
        this.evolvePopulation(this.winners.map(w => w.model));
        this.generation++;
        console.log("Generation " + this.generation);
      }
      
      this.setup();
    }
  }

  evolvePopulation(winners) {
    console.log("Evolving...", winners);
    const crossover1Tensors = this.crossOver2(winners[0], winners[1]);

    const crossover1 = this.createModel(null, 2);
    crossover1Tensors.forEach((w,i) => {
      crossover1.weights[i] = tf.tidy(() => crossover1.weights[i].write(w));
    });

    const crossover2Tensors = this.crossOver2(winners[2], winners[3]);
    const crossover2 = this.createModel(null, 2);
    crossover2Tensors.forEach((w,i) => {
      crossover2.weights[i] = tf.tidy(() => crossover2.weights[i].write(w));
    });
 
    const mutatedWinners = this.mutateBias(winners.slice(0, 4));
 
    this.population = [crossover1, crossover2, ...winners.slice(0, 4), ...mutatedWinners];
  }

  crossOver(a, b) {
    const biasA = a.layers[1].bias.read();
    const biasB = b.layers[1].bias.read();
 
    return this.setBias(a, this.exchangeBias(biasA, biasB));
  }

  exchangeBias(tensorA, tensorB) {
    const size = Math.ceil(tensorA.size / 2);
    return tf.tidy(() => {
        const a = tensorA.slice([0], [size]);
        const b = tensorB.slice([size], [size]);
 
        return a.concat(b);
    });
  }

  setBias(model, bias) {
    const newModel = Object.assign({}, model);
    newModel.predict = model.predict;
    newModel.layers[1].bias = newModel.layers[1].bias.write(bias);
 
    return newModel;
  }

  mutateBias(population) {
    return population.map(p => {
        const hiddenLayer = {
          units: HIDDEN_NUERONS,
          useBias: true,
          activation: ACTIVATION,
          kernelInitializer: KERNEL,
          biasInitializer: tf.initializers.randomUniform({minval: -1, maxval: 1}),
          //biasInitializer: tf.initializers.constant({
          //   value: this.random(-2, 2),
          // }),
        };
 
        return this.createModel(hiddenLayer);
    });
  }

  createLayer(params) {
    return tf.layers.dense(params || {
      units: HIDDEN_NUERONS,
      activation: ACTIVATION
    });
  }

  createModel(hidden, layers) {
    let model = tf.sequential();

    let inputLayer = this.createLayer({
      units: 131,
      useBias: true,
      activation: ACTIVATION,
      inputDim: 1, // 63 resources + 63 enemies + 3 unit counts + resources + home hp
      kernelInitializer: KERNEL,
      biasInitializer: 'randomNormal',
    });
    model.add(inputLayer);
    
    for (let i = 0; i < HIDDEN_LAYERS; i++) {
      // console.log(i);
      model.add(this.createLayer(hidden || {
        units: HIDDEN_NUERONS,
        useBias: true,
        activation: ACTIVATION,
        kernelInitializer: KERNEL,
        biasInitializer: 'randomNormal',
      }));
    }
    
    let outputLayer = this.createLayer({
      units: 7,
      useBias: true,
      activate: ACTIVATION
    });
  
    model.add(outputLayer);

    // const optimizer = tf.train.sgd(0.1);
    model.compile({
      loss: 'meanSquaredError',
      optimizer: 'adam',
    });

    return model;
  }

  random(min, max) {
		return Math.floor(Math.random()*(max-min+1) + min);
  }
  
  shuffle(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  // trainPopulation(population) {
  //   return population.map(async model => {
  //       await model.fit(tf.tensor2d(model.history),
  //         tf.tensor1d(model.outputHistory), {
  //           shuffle: true,
  //       });
  //   });
  // }

  crossOver2(parent1, parent2) {
    return tf.tidy(() => {
      const p1Layers = parent1.getWeights()
      const p2Layers = parent2.getWeights()
      const offspringLayers = p1Layers.map((p1Layer, i) => {
        const p2Layer = p2Layers[i]
        const pLayer = [p1Layer, p2Layer]

        const layerShape = p1Layer.shape
        if (layerShape.length == 1) { // those are biases
          // because there is only one variable for each weight, pick
          // randomly either one parents neuron bias at each index
          const neurons = [...new Array(layerShape[0])].map((d,i) => {
            const pickedParent = Math.random() < 0.5 ? 0 : 1
            return pLayer[pickedParent].slice([i], [1])
          })
          return tf.concat([...neurons])            
        } else if (layerShape.length == 2) {
          // for each index, construct a neuron by crossovering weights
          const neurons = [...new Array(layerShape[1])].map((d,i) => {
            const p1Weights = p1Layer.slice([0, i], [layerShape[0], 1])
            const p2Weights = p2Layer.slice([0, i], [layerShape[0], 1])
            // randomly choose which parent will give its weights to each part of the resulting neuron
            const pWeighs = Math.random() < 0.5
              ? [p1Weights, p2Weights] 
              : [p2Weights, p1Weights]
            // Pick an index to cut the weighs array at
            const idx = Math.floor(Math.random()*layerShape[0])
            const neuronWeightsPart1 = pWeighs[0].slice([0, 0], [idx, 1]) // there is only one col (nx1)
            const neuronWeightsPart2 = pWeighs[1].slice([idx, 0], [layerShape[0]-idx, 1])
            return tf.concat([neuronWeightsPart1, neuronWeightsPart2], 0)
          })
          return tf.concat([...neurons], 1)
        }
      })
      return offspringLayers
    })
  }
}