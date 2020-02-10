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
      trees.forEach((tree) => {
        if (tree.resources > 0 && !tree.claimed) {
          if (!self.target) {
            self.target = tree;
            self.notfound = 0;
            self.target.claim(self);
          }
        }
      });
      if (!this.target) {
        //console.log("not found", this.home.treesRegionX, this.home.treesRegionY);
        this.notfound++;
        this.moveTowards(this.home.treesRegionX, this.home.treesRegionY);
      } else {
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