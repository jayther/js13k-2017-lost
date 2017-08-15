function Main(){
  this.root = document.getElementById('root');
  this.rawr = '';
  this.init();
}
Main.prototype = {
  init: function () {
    this.rawr = 'rawr';
  }
};

window.game = new Main();
