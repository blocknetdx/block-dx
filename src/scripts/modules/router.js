/* global $ */
const _ = require('lodash');

const briefTimeout = () => new Promise(resolve => setTimeout(resolve, 0));

class Router {

  constructor(options) { // options { target: Element, state: Map }
    this._$target = options.$target;
    this._state = options.state;
    this._routes = new Map();
    this._currentView = null;
  }

  registerRoute(name, View) {
    if(!name || typeof name !== 'string') throw new Error('You must pass a name string as the first argument to registerRoute');
    const view = new View({});
    if(!View || view instanceof RouterView === false) throw new Error('You must pass an instance of RouterView  as the second argument to registerRoute');
    if(typeof view.render !== 'function') throw new Error(`The ${name} RouterView needs a render function`);
    this._routes = this._routes.set(name, View);
  }

  async goTo(name) {
    const View = this._routes.get(name);
    if(!View) throw new Error(`Route ${name} does not exist`);
    const view = new View({ $target: this._$target });
    const { _state: state } = this;
    if(this._currentView) this._currentView.onDismount(state, this);
    await briefTimeout();
    this._currentView = view;
    view.onBeforeMount(state, this);
    view.render(state, this);
    await briefTimeout();
    view.onMount(state, this);
  }

}

class RouterView {

  constructor(options = {}) {
    const { $target } = options;
    this.$target = $target;
    _.bindAll(this, [
      '$'
    ]);
  }

  $(selector) {
    return this.$target.find(selector);
  }

  onBeforeMount() {
  }

  onMount() {
  }

  onDismount() {
  }

}

module.exports = {
  Router,
  RouterView
};
