import GameObjectBehavior from "../behavior";

export default class CollectResourcesBehavior extends GameObjectBehavior {

  constructor(obj, map, home,) {
    super(obj, map);
    this.home = home;
    this.target = null;
    this.notfound = 0;
  }

  tick() {
    const self = this;
    if (!this.target) {
      const trees = this.map.look(this.obj.x, this.obj.y, 0, this.obj.sight, "TREE");
      var closest = 1000;
      trees.forEach((tree) => {
        if (tree.resources > 0 && !tree.claimed && (!this.target || this.map.distance(this.obj.x, this.obj.y, tree.x, tree.y) < closest)) {
          this.target = tree;
          this.notfound = 0;
          closest = this.map.distance(this.obj.x, this.obj.y, tree.x, tree.y);
        }
      });

      if (!this.target) {
        //console.log("not found", this.home.treesRegionX, this.home.treesRegionY);
        this.notfound++;
        this.moveTowards(this.home.treesRegionX, this.home.treesRegionY);
      } else {
        this.target.claim(this);
      }
    } else {
      if (this.obj.carrying === this.obj.capacity) {
        if (this.obj.x == this.home.x && this.obj.y == this.home.y) {
          this.home.resources += this.obj.carrying;
          this.obj.carrying = 0;
        } else {
          this.moveTowards(this.home.x, this.home.y);
        }
      } else if(this.obj.carrying < this.obj.capacity) {
        if (this.obj.x == this.target.x && this.obj.y == this.target.y) {
          this.obj.carrying += this.target.collect(1);
          if (this.target.resources < 1) { // target is depleeted. need to find a new one!
            this.target.unclaim();
            this.target = null;
          }
        } else {
          this.moveTowards(this.target.x, this.target.y);
        }
      }
    }
  }
}