function Player(settings) {
  DisplayContainer.apply(this, arguments);
  var s = extend({
    world: null
  }, settings || {});
  this.aabb = new AABB(0, 0, 5, 5);
  this.vel = {
    x: 0,
    y: 0
  };
  this.world = s.world;
  
  var rect = this.rect = new DisplayRect({
    x: -5,
    y: -5,
    w: 10,
    h: 10,
    color: 'blue'
  });
  this.addChild(rect);
}
Player.prototype = extendPrototype(DisplayContainer.prototype, {
  updateAABB: function () {
    this.aabb.set(this.x, this.y);
  },
  step: function (dts) {
    this.x += this.vel.x * dts;
    this.y += this.vel.y * dts;
    this.updateAABB();
    
    var cells = this.world.getCellsAroundPos(this.x, this.y), i, cell;
    var relX, relY;
    for (i = 0; i < cells.length; i += 1) {
      cell = cells[i];
      if (cell.aabb && cell.aabb.intersectsWith(this.aabb)) {
        relX = this.aabb.x - cell.aabb.x;
        relY = this.aabb.y - cell.aabb.y;
        if (Math.abs(relX) > Math.abs(relY)) {
          if (relX > 0) {
            this.x = cell.aabb.getRight() + this.aabb.hw;
          } else {
            this.x = cell.aabb.getLeft() - this.aabb.hw;
          }
        } else {
          if (relY > 0) {
            this.y = cell.aabb.getBottom() + this.aabb.hh;
          } else {
            this.y = cell.aabb.getTop() - this.aabb.hh;
          }
        }
        this.updateAABB();
      }
    }
  }
});
