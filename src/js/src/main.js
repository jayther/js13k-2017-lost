function Main(){
  this.root = DOM.get('root');
  this.rawr = '';
  this.init();
}
Main.prototype = {
  init: function () {
    this.rawr = 'rawr';
  }
};

window.game = new Main();
