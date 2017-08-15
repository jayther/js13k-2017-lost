function DisplayRect(options) {
  DisplayItem.apply(this, arguments);
  var opts = extend({
    width: 0,
    height: 0,
    fillStyle: 'black'
  }, options || {});
  this.width = opts.width;
  this.height = opts.height;
  this.fillStyle = opts.fillStyle;
}
DisplayRect.prototype = extendPrototype(DisplayItem.prototype, {
  render: function (context) {
    context.fillStyle = this.fillStyle;
    context.fillRect(0, 0, this.width, this.height);
  }
});
