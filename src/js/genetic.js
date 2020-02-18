export default class GeneticAlgorithm {
  constructor(population){
    this.population = population
  }
  
  // evolves the population by performing selection, crossover and mutations on the units
  evolvePopulation(opts={}){
    const {keepTop=0.4, type='NeuronSwap'} = opts
    
    if (keepTop * this.population.length >=2) {
      const elites = this.getElites({keepTop:keepTop})
    
      console.log(
        `## Average fitness of generation:`,
        this.population.map(agent => agent.fitness).reduce((a, b) => a + b )/this.population.length
      )
      console.log(
        `## Average fitness of elites:`,
        elites.map(agent => agent.fitness).reduce((a, b) => a + b )/elites.length
      )

      const elitesWeights = elites.map(elite => elite.brain.getWeights())
      // maintain population size
      const numberOfOffsprings = this.population.length - elites.length
      const offspringsWeigths = this.generateOffspringsWeightsFrom(elites, numberOfOffsprings, type)

      const newGenerationWeights = [...elitesWeights, ...offspringsWeigths]
      this.population.forEach((agent, i) => {
        agent.setWeights(newGenerationWeights[i])
        // reset fitness and redistribute agent randomly in plane
        agent.resetParameters()
      })
    }
  }
  
  drawRandomUniform (min, max) {
    return Math.random() * (max - min) + min
  }
  
  // selects the best units from the current population
  getElites(opts={}){
    const { keepTop=0.4 } = opts
    const nToKeep = Math.floor(keepTop*this.population.length)
    const top = this.population
      .map((agent, i) => ([i, agent.fitness]))
      .sort((a,b) => b[1] - a[1])
      .map(d => this.population[d[0]])
    return top.slice(0, nToKeep)
  }
  
  generateOffspringsWeightsFrom(group, n, type='NeuronSwap'){
    const size = group.length
    const offspringsWeigths = []
    
    // generate a mutation form top two elites
    let offspringTopTwo = this.generateNewWeigthsFrom(group[0], group[1], type)
    offspringTopTwo = offspringTopTwo.map(w => this.mutate(w))
    offspringsWeigths.push(offspringTopTwo)
    
    for (let i=0; i<n-1; i++){
      // randomly pick two parents and ensure they are different
      let indices = [...new Array(2)].map(d => Math.floor(Math.random()*size))
      while (indices[0] == indices[1]){
        indices = [...new Array(2)].map(d => Math.floor(Math.random()*size))
      }
      let newWeights = this.generateNewWeigthsFrom(group[indices[0]], group[indices[1]], type)
      // randomly mutate some weights
      newWeights = newWeights.map(w => this.mutate(w, {mutationThreshold:0.2, mutationChangeVariance:0.1}))
      offspringsWeigths.push(newWeights)
    }
    return offspringsWeigths
  }
  
  generateNewWeigthsFrom(parent1, parent2, type='NeuronSwap') {
    let generatedWeights
    switch (type) {
      case 'WeightedContribution':
        // Each neuron's weights/biases is the result of a weighted
        // contribution of the corresponding neuron of each parent.
        // The contribution factor is randomly picked for each layer.
        generatedWeights = tf.tidy(() => {
          const p1Layers = parent1.brain.getWeights()
          const p2Layers = parent2.brain.getWeights()
          const offspringLayers = p1Layers.map((p1Layer, i) => {
            const p2Layer = p2Layers[i]
            // random contribution of each parent 
            // (their contribution weights adds to 1) 
            const p1ContributionWeight = Math.random()
            const p2ContributionWeight = 1 - p1ContributionWeight
            const p1Contribution = p1Layer.mul(p1ContributionWeight)
            const p2Contribution = p2Layer.mul(p2ContributionWeight)
            return p1Contribution.add(p2Contribution)
          })
          return offspringLayers
        })
        break;
        
      case 'LayerCrossOver':
        // Each layer of neurons is the result of the n first neurons of one parent
        // and (layer length - n) last neurons of the other parent.
        // The crossover point is randomly drawn for each layer.
        generatedWeights = tf.tidy(() => {
          const p1Layers = parent1.brain.getWeights()
          const p2Layers = parent2.brain.getWeights()
          const offspringLayers = p1Layers.map((p1Layer, i) => {
            const p2Layer = p2Layers[i]
            // randomly choose which parent will give its neuron to each part of the resulting layer
            const pLayers = Math.random() < 0.5 ? [p1Layer, p2Layer] : [p2Layer, p1Layer]
            
            const layerShape = p1Layer.shape
            if (layerShape.length == 1) { // those are biases
              // Choose an index to cut the layer of neurons at
              const idx = Math.floor(Math.random()*layerShape[0])
              const layerPart1 = pLayers[0].slice(0, idx)
              const layerPart2 = pLayers[1].slice(idx)
              return tf.concat([layerPart1, layerPart2])            
            } else if (layerShape.length == 2) {
              // Choose an index to cut the layer of neurons at
              const idx = Math.floor(Math.random()*layerShape[1])
              const layerPart1 = pLayers[0].slice([0, 0], [layerShape[0], idx])
              const layerPart2 = pLayers[1].slice([0, idx], [layerShape[0], layerShape[1]-idx])
              return tf.concat([layerPart1, layerPart2], 1)
            }
          })
          return offspringLayers
        })
        break;
      
      case 'NeuronSwap':
        // Each neuron in a layer is a random pick of the corresponding neuron of either parents
        generatedWeights = tf.tidy(() => {
          const p1Layers = parent1.brain.getWeights()
          const p2Layers = parent2.brain.getWeights()
          const offspringLayers = p1Layers.map((p1Layer, i) => {
            const p2Layer = p2Layers[i]
            const pLayer = [p1Layer, p2Layer]
 
            const layerShape = p1Layer.shape
            if (layerShape.length == 1) { // those are biases
              // for each index, randomly pick either one parents neuron
              const neurons = [...new Array(layerShape[0])].map((d,i) => {
                const pickedParent = Math.random() < 0.5 ? 0 : 1
                return pLayer[pickedParent].slice([i], [1])
              })
              return tf.concat([...neurons])            
            } else if (layerShape.length == 2) {
              // for each index, randomly pick either one parents neuron
              const neurons = [...new Array(layerShape[1])].map((d,i) => {
                const pickedParent = Math.random() < 0.5 ? 0 : 1
                return pLayer[pickedParent].slice([0, i], [layerShape[0], 1])
              })
              return tf.concat([...neurons], 1)
            }
          })
          return offspringLayers
        })
        break;
      
      case 'NeuronCrossOver':
        // Each neuron in a layer is the result of the n first weights of the corresponding neuron
        // of one parent and (neuron weights length - n) last weights of the corresponding neuron
        // of the other parent.
        // The crossover point is randomly drawn for each neuron.
        generatedWeights = tf.tidy(() => {
          const p1Layers = parent1.brain.getWeights()
          const p2Layers = parent2.brain.getWeights()
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
        break;
    }
    return generatedWeights
  }
  
  // performs random mutations on the offspring
  mutate(weights, opts={}){
    const {mutationThreshold=0.2, mutationChangeVariance=0.1} = opts
    const mutate = Math.random() < mutationThreshold
    let finalWeights = weights
    if (mutate) {
      finalWeights =  tf.tidy(() => {
        // The mutated weights are a copy of the weights in which a specific location 
        // is multiplied by a factor in the interval [1-mutationVariance, 1+mutationVariance].
        // A safety check at the end ensure that the weights are capped 
        // to [-1, 1] after mutation.

        // the change in value that will be applied at the mutation point
        let mutationChange = this.drawRandomUniform(1-mutationChangeVariance, 1+mutationChangeVariance)
        
        // construct multiplier tensor. Multiplier shape = weights shape.
        // Multiplier is filled with ones, except for a randomly drawn coordinate
        // for which it's filled with the mutation change.
        let multiplierCoefs
        const shape = weights.shape
        if (shape.length == 1) { // those are biases (1 dimension, [n])
          // random coordinate x to mutate
          const mutIdx = Math.floor(Math.random()*shape[0])          
          // construct multiplier tensor
          multiplierCoefs = [...new Array(shape[0])].map((d, i) =>(
            i == mutIdx
              ? mutationChange
              : 1
          ))        
        } else if (shape.length == 2) { // those are weights (2 dimensions, [m x n])
          // random coordinate [x, y] to mutate
          const mutRow = Math.floor(Math.random()*shape[0])
          const mutCol = Math.floor(Math.random()*shape[1])    
          // construct the multiplier tensor
          multiplierCoefs = [...new Array(shape[0])].map((d, i) => {
            const row = [...new Array(shape[1])].fill(1)
            if (i == mutRow) row[mutCol] = mutationChange
            return row
          })
        } 
        const multiplierTensor = tf.tensor(multiplierCoefs, shape)
        let mutatedWeights = weights.mul(multiplierTensor)
        // ensure weights are in interval [-1, 1]
        const lowLim = tf.onesLike(weights).mul(-1)
        const highLim = tf.onesLike(weights)
        mutatedWeights = mutatedWeights.where(mutatedWeights.greater(-1), lowLim)
        mutatedWeights = mutatedWeights.where(mutatedWeights.less(1), highLim)
      
        return mutatedWeights
      })
    }
    return finalWeights
  }
}