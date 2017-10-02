
function AnimManager() {
  this.time = 0;
  this.anims = [];
}
AnimManager.prototype = {
  add: function (anim) {
    anim.start(this.time);
    this.anims.push(anim);
  },
  step: function (dts) {
    var i, anim;
    for (i = 0; i < this.anims.length; i += 1) {
      anim = this.anims[i];
      anim.step(this.time);
      if (this.time >= anim.endTime) {
        if (anim.settings.onEnd) {
          anim.settings.onEnd();
        }
        this.anims.splice(i, 1);
        i -= 1;
      }
    }
    this.time += dts;
  }
};
