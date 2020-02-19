import GamePlayer from "./player";
import GameAgent from "./agent";
import GamePortal from "./objects/portal";
import DumbAIPlayer from "./players/dumbai";
import TensorPlayer from "./players/tensorai";
import GameMap from "./map";
import GeneticAlgorithm from './genetic';

const HIDDEN_LAYERS = 3;
const HIDDEN_NUERONS = 8;
const KERNEL = tf.initializers.randomUniform({minval: -1, maxval: 1});
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

    this.gfx.load();
  }

  start() {
    console.log("start!");
    if (this.player1.type === "TENSOR_AI" && this.player2.type === "TENSOR_AI") {
      for (let i = 0; i < 10; i++) {
        this.population.push(this.createModel(null, "O"));
      }
    }
  }

  async createPlayer(number, agent, type, files) {
    let player;
    switch (type) {
      case "DUMB_AI": player = new DumbAIPlayer(number, agent); player.name = "Idiot"; break;
      case "TENSOR_AI": {
        console.log(files, files[0].files[0], files[1].files[0]);
        const model = await tf.loadLayersModel(
          tf.io.browserFiles([files[0].files[0], files[1].files[0]]));
        model.breed = "L";
        player = new TensorPlayer(number, agent, model);
        break;
      }
      default: player = new GamePlayer(number, agent); player.name = "Puny Human"; break;
    }
    return player;
  }

  async setup(maxGenerations, speed, player1Type, player2Type, player1Files, player2Files) {
    this.map = new GameMap(80, 60);
    this.gfx.map = this.map;
    this.ticks = 0;
    this.time = 0;
    this.gameOver = false;
    this.speed = speed;
    this.maxGenerations = maxGenerations;
    const [[home1X, home1Y],[home2X, home2Y]] = this.map.generate();

    this.agent1 = new GameAgent(this.map);
    this.agent2 = new GameAgent(this.map);

    if (player1Type === "TENSOR_AI" && player2Type === "TENSOR_AI") {
      this.shuffle(this.population);
      this.player1 = new TensorPlayer(1, this.agent1, this.population.pop());
      this.player2 = new TensorPlayer(2, this.agent2, this.population.pop());
    } else {
      this.player1 = await this.createPlayer(1, this.agent1, player1Type, player1Files);
      this.player2 = await this.createPlayer(2, this.agent2, player2Type, player2Files);
    }

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


    if (this.player1.model && !this.player1.model.gameLoses) {
      this.player1.model.gameLoses = 0;
    }
    if (this.player2.model && !this.player2.model.gameLoses) {
      this.player2.model.gameLoses = 0;
    }
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
      if (this.ticks >= this.speed) {
        const prevUnitCount = this.totalUnits;
        this.totalUnits = this.player1.unitCount() + this.player2.unitCount() + this.player1.resourceCount() + this.player2.resourceCount() + this.player1.totalKills() + this.player2.totalKills();
        if (prevUnitCount === this.totalUnits) {
          this.idleTime++;
        } else {
          this.idleTime = 0;
        }
        if (!this.player1.agent.home.isAlive()) {
          //document.getElementById("player2wins").style.display = "block";
          console.log("Player 2 wins!");
          this.player1.model.gameLoses++;
          this.gameOver = true;
        } else if (!this.player2.agent.home.isAlive()) {
          //document.getElementById("player1wins").style.display = "block";
          console.log("Player 1 wins!");
          this.player2.model.gameLoses++;
          this.gameOver = true;
        } else if (this.idleTime > 300 || this.time > 600 + (this.generation * 50)) {
          //document.getElementById("player1wins").innerHTML = "<h1>Time up!</h1>";
          //document.getElementById("player1wins").style.display = "block";
          //if (this.player2.fitness() < this.player1.fitness()) {
            if (this.player2.model) {
              this.player2.model.gameLoses++;
            }
          //} else {
            if (this.player1.model) {
              this.player1.model.gameLoses++;
            }
          //}
          console.log("Time up!");
          this.gameOver = true;
        }
        
        this.ticks = 0;
        this.time++;
        this.player1.think(this.time);
        this.player2.think(this.time);
        this.agent1.act();
        this.agent2.act();
        this.gfx.draw();
      }
    } else {
      if (!this.player1.name) {
        this.player1.name = "G"
        + this.generation + "_P1_" 
        + this.player1.characteristics()[0].name + "_" 
        + this.player1.model.breed + "_" + this.player1.fitness();
      }
      if (!this.player2.name) {
        this.player2.name = "G"+ this.generation + "_P2_" + this.player2.characteristics()[0].name + "_" + this.player2.model.breed + "_" + this.player2.fitness();
      }

      console.log(this.player1.name, this.player2.name, this.player1.characteristics(), this.player2.characteristics());

      this.oldPlayers.push(this.player1);
      this.oldPlayers.push(this.player2);
      this.shuffle(this.oldPlayers);
      if (this.population.length < 1) {
        this.winners = this.oldPlayers.sort((a, b) => a.fitness() - b.fitness()).reverse().slice(0, 4);
        this.winners.filter(w => w.fitness() > 8.5).filter(w => !w.saved).forEach(w => {
          w.model.save("downloads://rts\/" + w.name)
          w.saved = true;
        });
        console.log("winners", this.winners.map(w => w.name));
        this.shuffle(this.winners);
        this.evolvePopulation(this.winners.map(w => w.model));
        this.generation++;
        console.log("Generation " + this.generation);
      }
      
      if (this.generation >= this.maxGenerations) {
        clearInterval(this.interval);
      } else {
        this.setup(this.maxGenerations, this.speed, this.player1.type, this.player2.type);
      }
    }
  }

  evolvePopulation(winners) {
    console.log("Evolving...", winners);
 
    const mutatedWinners = winners.slice(0, 2)
      .map(winner => winner.getWeights().map(w => this.ga.mutate(w)))
      .map(weights => {
        const m = this.createModel(null, "M");
        weights.forEach((w, i) => m.weights[i] = tf.tidy(() => m.weights[i].write(w)));
        return m;
      });
    //const mutatedWinners = this.mutateBias(winners);
 
    this.population = [
      this.crossOver(winners[0], winners[1]), 
      this.crossOver(winners[2], winners[3]), 
      this.createModel(null, "N"),
      this.createModel(null, "N"),
      ...winners.slice(0, 4), ...mutatedWinners];
  }

  crossOver(a, b) {
    const crossoverTensors = this.crossOver2(a, b).map(w => this.ga.mutate(w, { mutationThreshold: 1, mutationChangeVariance: 1 }));

    const crossover = this.createModel(null, 'C');
    crossoverTensors.forEach((w,i) => {
      crossover.weights[i] = tf.tidy(() => crossover.weights[i].write(w));
    });
    return crossover;
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
          biasInitializer: tf.initializers.randomNormal({minval: -1, maxval: 1}),
          //biasInitializer: tf.initializers.constant({
          //   value: this.random(-2, 2),
          // }),
        };
 
        return this.createModel(hiddenLayer, "M");
    });
  }

  createLayer(params) {
    return tf.layers.dense(params || {
      units: HIDDEN_NUERONS,
      activation: ACTIVATION
    });
  }

  createModel(hidden, breed) {
    let model = tf.sequential();
    model.breed = breed || "N";
    let inputLayer = this.createLayer({
      units: 131,
      useBias: true,
      activation: ACTIVATION,
      inputDim: 1, // 63 resources + 63 enemies + 3 unit counts + resources + home hp
    });
    model.add(inputLayer);
    
    for (let i = 0; i < HIDDEN_LAYERS; i++) {
      // console.log(i);
      model.add(this.createLayer(hidden || {
        units: HIDDEN_NUERONS,
        useBias: true,
        activation: ACTIVATION,
        kernelInitializer: KERNEL,
        biasInitializer: tf.initializers.randomNormal({minval: -1, maxval: 1}),
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