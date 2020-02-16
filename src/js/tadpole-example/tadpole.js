class Tadpole {

  constructor(props={}) {
    const { world = {width: 500, height: 500, agentVMax: 3}, weights=null, x, y, vx, vy } = props
    this.world = world
    this.x = x || tf.tidy(() => tf.randomUniform([]).mul(world.width))   // position (x)
    this.y = y || tf.tidy(() => tf.randomUniform([]).mul(world.height))  // position (y)
    this.vx = vx || tf.tidy(() => tf.randomUniform([], -1, 1).mul(world.agentVMax))  // velocity (x direction)
    this.vy = vy || tf.tidy(() => tf.randomUniform([], -1, 1).mul(world.agentVMax))  // velocity (y direction)
    this.fitness = 0 // fitness (food count)
    this.nearestFood = null // nearest food particle
    
    // for swimming behavior
    this.px = new Array(10).fill(Math.random() * world.width),
    this.py = new Array(10).fill(Math.random() * world.height)
    this.count = 0
    
    // utilities tensors to prevent recreation each time
    this.utils = {
      move: {
        xMin: tf.tidy(() => tf.zeros([])),
        xMax: tf.tidy(() => tf.ones([]).mul(world.width)),
        yMin: tf.tidy(() => tf.zeros([])),
        yMax: tf.tidy(() => tf.ones([]).mul(world.height))
      },
    }
    
    //////////////////////////////////////////////////////
    // simple multilayer perceptron as brain
    // 1 variables as input (angle to nearest food)
    // 1 hidden layer with n perceptrons
    // output layer with 2 perceptrons (change in vx, change in vy)
    //////////////////////////////////////////////////////
    this.brainStructure = [2, 10, 2]
    this.brain = this.buildModel(this.brainStructure)
    if (simStart == 'trained') this.loadTrainedWeights()
    if (weights) {
      // assign given weights to brain
      weights.forEach((w,i) => {
        this.brain.weights[i] = this.brain.weights[i].write(w)
      })  
    }    
  }
  
  ///////////////////////////////
  // The brain!!!
  ///////////////////////////////

  buildModel([input, ...layers]){
    // declare sequential model
    const model = tf.sequential();
    model.add(tf.layers.dense({
        units: layers[0],
        inputShape: [input],
        activation: 'tanh',
        // biasInitializer: tf.initializers.randomUniform({minval: -1, maxval: 1})
      }))
    layers.slice(1).forEach(layer => 
      model.add(tf.layers.dense({
        units:layer, 
        activation: 'tanh',
        // biasInitializer: tf.initializers.randomUniform({minval: -1, maxval: 1})
      }))
    )
    // prepare the model for training: Specify the loss and the optimizer.
    model.compile({optimizer: 'sgd', loss: 'meanSquaredError', lr: 0.1})
    return model
  }
  
  think(){
    // process the input information and return an action
    return tf.tidy(() => {
      const input = this.getXYDistancesToNearestFood() // 2 inputs, dx/dy
      return this.brain.predict(input)
    })
  }
  
  loadTrainedWeights(){
    // load saveWeights and mutates them randomly so every agent is a bit different
    const trainedWeights = savedModel.getWeights()
      .map(w => {
        const ga = new GeneticAlgorithm()
        return ga.mutate(w, {mutationThreshold:0.2, mutationChangeVariance:0.1})
      }) 
    this.setWeights(trainedWeights)
  }
  
  ///////////////////////////////
  // Utilities functions
  ///////////////////////////////
  
  move(){
    this.x = tf.tidy(() => { 
      let newX = this.x.add(this.vx)
      // ensure x is in space boundaries
      newX = newX.where(newX.greater(0), this.utils.move.xMin)
      newX = newX.where(newX.less(this.world.width), this.utils.move.xMax)
      return newX
    })
    this.y = tf.tidy(() => { 
      let newY = this.y.add(this.vy)
      // ensure x is in space boundaries
      newY = newY.where(newY.greater(0), this.utils.move.yMin)
      newY = newY.where(newY.less(this.world.height), this.utils.move.yMax)
      return newY
    })
  }
  
  updateHeading(i, updatePeriod=10){
    if (i % updatePeriod == 0) {
      const [newvx, newvy] = tf.tidy(()=> {
        const action = this.think()
        const dv = action.mul(this.world.agentVMax)
        let response = tf.stack([this.vx, this.vy]).add(dv)
        return response.split(2, 1)
      })
      // ensure the new velocities are within vMax boundaries
      this.vx = tf.tidy(() => tf.scalar(newvx.get(0, 0) % this.world.agentVMax))
      this.vy = tf.tidy(() => tf.scalar(newvy.get(0, 0) % this.world.agentVMax))
    }
  }
  
  getDistanceToNearestFood(){
    return tf.tidy(() => {
      const distance = tf.sqrt( 
        tf.add( 
          tf.square(this.x.sub(this.nearestFood.x)),
          tf.square(this.y.sub(this.nearestFood.y)) 
        ) 
      )
      return distance
    })
  }
  
  getXYDistancesToNearestFood(){
    return tf.tidy(() => {
      let dx = this.nearestFood.x.sub(this.x)
      let dy = this.nearestFood.y.sub(this.y)
      return tf.stack([dx, dy]).reshape([1, 2]) // need shape [1, 2] as input for brain
    })
  }
  
  setWeights(weights){
    weights.forEach((w,i) => {
      this.brain.weights[i] = tf.tidy(() => this.brain.weights[i].write(w))
    })   
  }
  
  resetParameters(relocate=false){
    this.fitness = 0
    this.vx = tf.tidy(() => tf.randomUniform([], -1, 1).mul(this.world.agentVMax))
    this.vy = tf.tidy(() => tf.randomUniform([], -1, 1).mul(this.world.agentVMax))
    if (relocate) {
      this.x = tf.tidy(() => tf.randomUniform([]).mul(this.world.width))
      this.y = tf.tidy(() => tf.randomUniform([]).mul(this.world.height)) 
    }
  }
}