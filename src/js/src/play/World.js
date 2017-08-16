
function World() {
  DisplayContainer.apply(this, arguments);
  this.grid = {};
  this.cellSize = 50;
}

World.prototype = extendPrototype(DisplayContainer.prototype, {
  generate: function () {
    for (var i = 0; i < 20; i += 1) {
      var x = Math.floor(Math.random() * 10);
      var y = Math.floor(Math.random() * 10);
      this.setPos(x, y, Math.random() < 0.5 ? 0 : 1);
    }
  },
  createCell: function (x, y, type) {
    var color = '#000000';
    switch (type) {
    case 0: // wall
      color = '#000000'
      break;
    case 1: // floor
      color = '#dddddd';
      break;
    }
    var item = new DisplayRect({
      x: x * this.cellSize,
      y: y * this.cellSize,
      w: this.cellSize,
      h: this.cellSize,
      color: color 
    });
    return {
      type: type,
      item: item,
      aabb: null
    };
  },
  setPos: function (x, y, type) {
    if (!this.grid[x]) {
      this.grid[x] = {};
    }
    var cell = this.createCell(x, y, type);
    this.grid[x][y] = cell;
    this.addChild(cell.item);
  }
});
