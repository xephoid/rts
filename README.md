# rts game for experimenting with ai
I wrote this to learn TensorFlow.js because I wass really interested in teaching AI to play games using a genetic algorithm.
The game is a very simple Real Time Strategy game where you or the AI can give very simple commands. There are two factions: Player 1 is always the humans and Player 2 is always the Syltaar (snake people). Each faction has 3 basic units:

Gatherers ![Human Gatherer](https://zeke-rts.s3.amazonaws.com/wood_cutter16x16.png "Human Gatherer")
![Syltaar Gatherer](https://zeke-rts.s3.amazonaws.com/snake_wood_cutter16x16.png "Syltaar Gatherer") - Gather wood ![Tree](https://zeke-rts.s3.amazonaws.com/tree16x16.png "Wood (resource)")


Explorers ![Human Explorer](https://zeke-rts.s3.amazonaws.com/flying_human16x16.png "Human Explorer") 
![Syltaar Explorer](https://zeke-rts.s3.amazonaws.com/snake_flying16x16.png "Syltaar Explorer") - Explore the map and help find resources and the enemy. They move faster and can see farther than other units

Soldiers ![Human Soldier](https://zeke-rts.s3.amazonaws.com/knight16x16.png "Human Soldier") ![Syltaar Soldier](https://zeke-rts.s3.amazonaws.com/snake_knight16x16.png "Syltaar Soldier") - Protect the base and resources. Attack the enemy

Units can not be controlled directly. Instead they have defined behaviors. Some of which can be influenced. Players are allowed the following commands:

- Create Gatherer (15): Create a new Gatherer unit. Costs 15 wood.
- Create Explorer (20): Create a new Explorer unit. Costs 20 wood.
- Create Soldier (50): Create a new Soldier unit. Costs 50 wood.
- Assess Units: Hard to explain, but for the AI a strategic assessment of resources and enemies each unit can see so it can assess the most dense area of resources and where the most threatening enemies are clustered.
- Explore: Similar to Assess Units...
- Attack: Send soldiers to attack the enemey portal. Only works if the enemy portal has been seen by one of your units. Usually requires explorers.
- Defend Home: Marshall soldiers to defend your home portal.
- Defend Resources: Send soldiers to protect the area where most Gatherers are collecting wood.
- Set Resource Region: Based on known resource density select the best area to collect resources. Requires Explore to work

Each faction comes to the map via a portal (![Human Portal](https://zeke-rts.s3.amazonaws.com/portal16x16.png "Human Portal"), ![Syltaar Portal](https://zeke-rts.s3.amazonaws.com/snake_portal16x16.png "Syltaar Portal")) which must be destroyed in order for the opponent to win.

I created 3 types of players:
- Human Player: You can controll the basic actions of the faction
- Dumb AI Player: Has very simple instructions to win. Is pretty effective!
- Tensor AI Player: An AI player that starts off random, but will learn after each game using a genetic algorith.

## Requirements

* Node v13.14.0
* or just a browser. If you open the index.html file in the dist folder in a broswer it should work

## Install

npm i // lol!

## Usage

Probably the easiest way to use is to just run it with the two AIs. For that just click the Start button and enjoy!

Options:
- Max Generations: The way genetic algorithms work is you generate a bunch of random nueral networks (NNs) and have them compete and then give each a "fitness" rating. The "fittest" NNs get "promoted" to the next generation of NNs along with corssbread and mutated versions of the "fittest". You can use this to limit the number of generations you want to see. OR you can just close the window...
- Speed: Depending on the number of hidden layers the AIs can go prettys fast and it can be hard to see what is happening. This helps slow things down. Higher is slower. You probably don't need to go higher than 10 to play against the AI. Less than 1 won't work.
- Player 1/2: Pretty self explaianatory. You pick which type of player. Technically you can do Human vs Human, but doesn't work great since you need to share the mouse. Maybe could work on a touch screen?
- Player "Choose File" inputs: If the AIs reach a certain level of fitness it will ask if you want to save them. TensorJS generates two files for each model a json file and a weights.bin file. You can load them for each player using these inputs. Left to right the first one is for the json file and the second is for the weights.bin file. There are some sample winners in the repo.
- Hidden layers: The "magic" of nueral nets is that the more layers there are the "smarter" the AI can be, but it also has a performance cost. I don't recommend going above 100.

## Findings
Genetic algorithms are slooooooooow. It takes many generations for it to develop interesting behavior let alone actually win. I spent a lot of time tweaking the fitness function to help select for optimal behavior. The one thing that sped things up was to have the Tensor AI play against the Dumb AI. The name is very missleading since the Dumb AI is actually the hardest to beat. It will ruthlessly murder it's opponent with very basic rules (make 12 gatherers, make 4 explorers, make 15 soldiers then attack!). However, I was able to train the Tensor AI to beat it consistently after about 30 generations. However x2, I was able to beat the trained Tensor AI pretty easily because it would randomly send it's soldiers away from it's base to protect resources, which Dumb AI couldn't detect, but was very easy for a human to exploit. I have been experimenting with training the winners against each other with what feels like diminishing returns. Although I have seen a couple interesting behaviors. For eaxmple, I programmed the soldiers to all follow orders together, but one AI seemed to take advantage of the fact that new soldiers always default to protecting the base. So it made a group of soldiers protect its resources and then makes a second group to protect the base. It's random, I know, but it turned out to be a good strategy that it did multiple times and worked.

The best strategy in the game seems to be to switch back and forth between protecting home and protecting resources with a big group of soldiers (20 or so). Since players will often end up contesting for resources having an army defending them means they will usually attack gatherers which will lead them back to the enemy base.

## Dev stuff

#### `npm run build`

Build a production version of `bundle.js` into `dist/`.

#### `npm run watch`

Watch files in `src/` for changes, recompile on change.

#### `npm run dev`

Run a development server at `http://localhost:8080/`. This also will watch & recompile on file changes.

## License
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)

## Notes
You can open the index.html file in a browser and it should work
