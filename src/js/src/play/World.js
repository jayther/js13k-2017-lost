
function World() {
  DisplayContainer.apply(this, arguments);
  this.grid = {};
  this.cellSize = 20;
  this.gridRange = {
    minWidth: 50,
    maxWidth: 60,
    minHeight: 50,
    maxHeight: 60
  };
  this.hallwayMinChunkArea = 1000;
  this.hallwayMinChunkWidth = 20;
  this.hallwayMinChunkHeight = 20;
  this.minChunkArea = 100;
  this.minChunkWidth = 10;
  this.minChunkHeight = 10;
  this.hallwaySize = 2;
  this.gridWidth = 0;
  this.gridHeight = 0;
  this.rooms = [];
  
  this.bg = new CachedContainer();
  this.addChild(this.bg);
}
World.cellTypes = {
  ground: 1,
  outerWall: 2,
  door: 3,
  roomGround: 4
};
World.relativePos = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 }
];

World.prototype = extendPrototype(DisplayContainer.prototype, {
  generate: function () {
    var w = Random.rangeInt(this.gridRange.minWidth, this.gridRange.maxWidth);
    var h = Random.rangeInt(this.gridRange.minHeight, this.gridRange.maxHeight);
    this.bg.setDimensions(w * this.cellSize, h * this.cellSize);
    
    // building walls
    this.bg.addChild(new DisplayRect({
      x: 0 * this.cellSize,
      y: 0 * this.cellSize,
      w: w * this.cellSize,
      h: h * this.cellSize,
      color: '#000000'
    }));
    
    // hallway floor
    this.bg.addChild(new DisplayRect({
      x: 1 * this.cellSize,
      y: 1 * this.cellSize,
      w: (w - 2) * this.cellSize,
      h: (h - 2) * this.cellSize,
      color: '#656565'
    }));
    
    var i, j, x, y;
    
    this.gridWidth = w;
    this.gridHeight = h;
    
    // walls for entire floor
    for (i = 0; i < w; i += 1) {
      this.setPos(i, 0, World.cellTypes.outerWall);
      this.setPos(i, h - 1, World.cellTypes.outerWall);
    }
    for (i = 0; i < h; i += 1) {
      this.setPos(0, i, World.cellTypes.outerWall);
      this.setPos(w - 1, i, World.cellTypes.outerWall);
    }
    
    // entire floor (without walls) as first chunk
    var splitDir = Random.rangeInt(0, 2); // 0-1
    var chunk = {
      left: 1,
      top: 1,
      right: w - 1,
      bottom: h - 1,
      splitDir: splitDir
    };
    
    var chunkPool = [chunk],
      hallways = [],
      finalChunks = [],
      splitNum,
      splitPos,
      chunkA,
      chunkB,
      hallway,
      upperBoundSide,
      lowerBoundSide,
      splitCount = 0,
      pass = 0; // 0 = hallways and big chunks; 1 = chunks into rooms
    
    // partition the floor
    
    // start with hallways first
    var minWidth = this.hallwayMinChunkWidth
    var minHeight = this.hallwayMinChunkHeight;
    var minArea = this.hallwayMinChunkArea;
    while (chunkPool.length > 0 && splitCount < 10000) {
      chunk = chunkPool.shift();
      chunkA = extend({}, chunk);
      chunkB = null;
      splitDir = chunk.splitDir;
      
      if (splitDir === 0) { // split vertically
        upperBoundSide = 'right';
        lowerBoundSide = 'left';
      } else { // split horizontally
        upperBoundSide = 'bottom';
        lowerBoundSide = 'top';
      }
      
      if (pass === 0) {
        hallway = extend({}, chunk);
        
        /*if (chunk.right - chunk.left > minWidth) {
          splitNum = Random.rangeInt(2, 4);
        } else {
          splitNum = 2;
        }*/
        splitNum = 3;
        if (splitNum === 2) { // hallway and chunk
          if (Random.rangeInt(0, 2) === 0) {
            splitPos = chunk[upperBoundSide] - this.hallwaySize;
            chunkA[upperBoundSide] = splitPos - 1;
            hallway[lowerBoundSide] = splitPos;
          } else {
            splitPos = chunk[lowerBoundSide] + this.hallwaySize;
            chunkA[lowerBoundSide] = splitPos + 1;
            hallway[upperBoundSide] = splitPos;
          }
        } else { // two chunks with a hallway in between
          chunkB = extend({}, chunk);
          splitPos = Random.rangeInt(chunk[lowerBoundSide] + minWidth / 2, chunk[upperBoundSide] - minWidth / 2);
          chunkA[upperBoundSide] = splitPos - this.hallwaySize / 2 - 1;
          chunkB[lowerBoundSide] = splitPos + this.hallwaySize / 2 + 1;
          hallway[upperBoundSide] = splitPos + this.hallwaySize / 2;
          hallway[lowerBoundSide] = splitPos - this.hallwaySize / 2;
        }
        hallways.push(hallway);
      } else { // split chunks into 2
        chunkB = extend({}, chunk);
        splitPos = Random.rangeInt(chunk[lowerBoundSide] + minWidth / 2, chunk[upperBoundSide] - minWidth / 2);
        chunkA[upperBoundSide] = splitPos;
        chunkB[lowerBoundSide] = splitPos + 1;
      }
      
      // if more than minChunkArea, put back into chunk pool for further partitioning
      x = chunkA.right - chunkA.left;
      y = chunkA.bottom - chunkA.top;
      if (x > minWidth && y > minHeight && x * y > minArea) {
        chunkA.splitDir = splitDir ? 0 : 1;
        chunkPool.push(chunkA);
      } else {
        finalChunks.push(chunkA);
      }
      if (chunkB){
        x = chunkB.right - chunkB.left;
        y = chunkB.bottom - chunkB.top;
        if (x > minWidth && y > minHeight && x * y > minHeight) {
          chunkB.splitDir = splitDir ? 0 : 1;
          chunkPool.push(chunkB);
        } else {
          finalChunks.push(chunkB);
        }
      }
      splitCount += 1;
      
      if (pass === 0 && chunkPool.length === 0) {
        pass += 1;
        minWidth = this.minChunkWidth;
        minHeight = this.minChunkHeight;
        minArea = this.minChunkArea;
        // recheck chunk sizes against new limits
        for (i = finalChunks.length - 1; i >= 0; i -= 1) {
          chunkA = finalChunks[i];
          x = chunkA.right - chunkA.left;
          y = chunkA.bottom - chunkA.top;
          if (x > minWidth && y > minHeight && x * y > minArea) {
            // try to split based on which direction is longer
            chunkA.splitDir = x > y ? 0 : 1;
            chunkPool.push(chunkA);
            finalChunks.splice(i, 1);
          }
        }
      }
    }
    if (splitCount >= 10000) {
      throw new Error('Infinite loop');
    }
    var islandRooms = [], rectCheck;
    for (i = 0; i < finalChunks.length; i += 1) {
      chunk = finalChunks[i];
      // room walls
      this.bg.addChild(new DisplayRect({
        x: (chunk.left - 1) * this.cellSize,
        y: (chunk.top - 1) * this.cellSize,
        w: (chunk.right - chunk.left + 2) * this.cellSize,
        h: (chunk.bottom - chunk.top + 2) * this.cellSize,
        color: '#000000'
      }));
      
      // room floor graphic
      this.bg.addChild(new DisplayRect({
        x: chunk.left * this.cellSize,
        y: chunk.top * this.cellSize,
        w: (chunk.right - chunk.left) * this.cellSize,
        h: (chunk.bottom - chunk.top) * this.cellSize,
        color: '#999999'
      }));
      // put walls around final chunks
      for (x = chunk.left - 1; x < chunk.right + 1; x += 1) {
        this.setPos(x, chunk.top - 1, World.cellTypes.outerWall);
        this.setPos(x, chunk.bottom, World.cellTypes.outerWall);
      }
      for (y = chunk.top - 1; y < chunk.bottom + 1; y += 1) {
        this.setPos(chunk.left - 1, y, World.cellTypes.outerWall);
        this.setPos(chunk.right, y, World.cellTypes.outerWall);
      }
      // set room cells as room ground
      for (x = chunk.left; x < chunk.right; x += 1) {
        for (y = chunk.top; y < chunk.bottom; y += 1) {
          this.setPos(x, y, World.cellTypes.roomGround);
        }
      }
      // connect rooms to hallways
      // check left/right separate from top/bottom
      var neighbors = [];
      rectCheck = extend({}, chunk);
      // check for hallways in left or right of room
      rectCheck.left -= 2;
      rectCheck.right += 2;
      for (j = 0; j < hallways.length; j += 1) {
        hallway = hallways[j];
        if (JMath.intersectRectRect(rectCheck, hallway)) {
          neighbors.push(hallway);
        }
      }
      // check for hallways in top or bottom of room
      rectCheck.top -= 2;
      rectCheck.bottom += 2;
      for (j = 0; j < hallways.length; j += 1) {
        hallway = hallways[j];
        if (neighbors.indexOf(hallway) < 0 && JMath.intersectRectRect(rectCheck, hallway)) {
          neighbors.push(hallway);
        }
      }
      if (neighbors.length > 0) { // has a hallway neighbor
        hallway = Random.pick(neighbors);
        // reset rectCheck
        rectCheck.left = chunk.left;
        rectCheck.top = chunk.top;
        rectCheck.right = chunk.right;
        rectCheck.bottom = chunk.bottom;
        // determine direction
        rectCheck.left -= 2;
        var found = false;
        if (JMath.intersectRectRect(rectCheck, hallway)) {
          found = true;
          x = hallway.right;
          y = Random.rangeInt(chunk.top, chunk.bottom);
        }
        if (!found) {
          rectCheck.left = chunk.left;
          rectCheck.top -= 2;
          if (JMath.intersectRectRect(rectCheck, hallway)) {
            found = true;
            x = Random.rangeInt(chunk.left, chunk.right);
            y = hallway.bottom;
          }
        }
        if (!found) {
          rectCheck.top = chunk.top;
          rectCheck.right += 2;
          if (JMath.intersectRectRect(rectCheck, hallway)) {
            found = true;
            x = hallway.left - 1;
            y = Random.rangeInt(chunk.top, chunk.bottom);
          }
        }
        if (!found) {
          x = Random.rangeInt(chunk.left, chunk.right);
          y = hallway.top - 1;
        }
        this.setPos(x, y, World.cellTypes.door);
        chunk.connected = true;
        this.rooms.push(chunk);
      } else {
        // island room
        chunk.connected = false;
        islandRooms.push(chunk);
      }
    }
    // keep connecting island rooms, it should eventually run out
    splitCount = 0;
    while (islandRooms.length > 0 && splitCount < 10000) {
      chunk = islandRooms.shift();
      rectCheck = extend({}, chunk);
      neighbors = [];
      // check for left and right of room
      rectCheck.left -= 2;
      rectCheck.right += 2;
      for (j = 0; j < this.rooms.length; j += 1) {
        chunkA = this.rooms[j];
        if (JMath.intersectRectRect(rectCheck, chunkA)) {
          neighbors.push(chunkA);
        }
      }
      // check for top and bottom of room
      rectCheck.left = chunk.left;
      rectCheck.right = chunk.right;
      rectCheck.top -= 2;
      rectCheck.bottom += 2;
      for (j = 0; j < this.rooms.length; j += 1) {
        chunkA = this.rooms[j];
        if (neighbors.indexOf(chunkA) < 0 && JMath.intersectRectRect(rectCheck, chunkA)) {
          neighbors.push(chunkA);
        }
      }
      if (neighbors.length > 0) { // has a connected neighbor
        chunkA = Random.pick(neighbors);
        // reset rectCheck
        rectCheck.left = chunk.left;
        rectCheck.top = chunk.top;
        rectCheck.right = chunk.right;
        rectCheck.bottom = chunk.bottom;
        // determine direction
        rectCheck.left -= 2;
        var found = false;
        if (JMath.intersectRectRect(rectCheck, chunkA)) {
          found = true;
          x = chunkA.right;
          y = Random.rangeInt(chunk.top, chunk.bottom);
        }
        if (!found) {
          rectCheck.left = chunk.left;
          rectCheck.top -= 2;
          if (JMath.intersectRectRect(rectCheck, chunkA)) {
            found = true;
            x = Random.rangeInt(chunk.left, chunk.right);
            y = chunkA.bottom;
          }
        }
        if (!found) {
          rectCheck.top = chunk.top;
          rectCheck.right += 2;
          if (JMath.intersectRectRect(rectCheck, chunkA)) {
            found = true;
            x = chunkA.left - 1;
            y = Random.rangeInt(chunk.top, chunk.bottom);
          }
        }
        if (!found) {
          x = Random.rangeInt(chunk.left, chunk.right);
          y = chunkA.top - 1;
        }
        this.setPos(x, y, World.cellTypes.door);
        chunk.connected = true;
        this.rooms.push(chunk);
      } else {
        // this is currently surrounded by other island rooms
        chunk.connected = false;
        islandRooms.push(chunk);
      }
      splitCount += 1;
    }
    if (splitCount >= 10000) {
      throw new Error('Infinite loop');
    }
  },
  createCell: function (x, y, type) {
    var color = null,
      aabb = null,
      halfSize = this.cellSize / 2,
      item = null;
    switch (type) {
    case World.cellTypes.outerWall: // wall
      aabb = new AABB(
        (x * this.cellSize + halfSize),
        (y * this.cellSize + halfSize),
        halfSize,
        halfSize
      );
      break;
    case World.cellTypes.ground: // floor
      break;
    case World.cellTypes.door:
      color = '#00aa00';
      break;
    case World.cellTypes.roomGround:
      break;
    }
    if (color) {
      item = new DisplayRect({
        x: x * this.cellSize,
        y: y * this.cellSize,
        w: this.cellSize,
        h: this.cellSize,
        color: color 
      });
    }
    return {
      type: type,
      item: item,
      aabb: aabb
    };
  },
  getCell: function (x, y) {
    if (!this.grid[x] || !this.grid[x][y]) {
      return null;
    }
    return this.grid[x][y];
  },
  setPos: function (x, y, type) {
    if (!this.grid[x]) {
      this.grid[x] = {};
    }
    var cell = this.grid[x][y];
    if (cell && cell.item) {
      this.removeChild(cell.item);
    }
    cell = this.createCell(x, y, type);
    this.grid[x][y] = cell;
    if (cell.item) {
      this.addChild(cell.item);
    }
  },
  getCellsAroundPos: function (x, y) {
    var cells = [];
    var cellX = Math.floor(x / this.cellSize);
    var cellY = Math.floor(y / this.cellSize);
    var cell = null;
    var relativePos = World.relativePos;
    var pos, i;
    for (i = 0; i < relativePos.length; i += 1) {
      pos = relativePos[i];
      cell = this.getCell(cellX + pos.x, cellY + pos.y);
      if (cell) {
        cells.push(cell);
      }
    }
    
    return cells;
  }
});
