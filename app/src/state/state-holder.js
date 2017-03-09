import EventEmitter from '../event/event-emitter';

class StateHolder extends EventEmitter {
  constructor(config) {
    super(config);

    this._config = config;

    this._state = config.state;
  }

  destroy() {
    super.destroy();

    this._state = null;
  }

  getState() {
    return this._state;
  }

  setProp(prop, value, params) {
    this.emit('beforeStateChange', this._state);

    this._state[prop] = value;

    if (!params || !params.suppressChangeEmit) {
      this.emit('stateChange', {
        data: params ? params.data : null,
        prop: prop,
        value: value
      });
    }
  }
}

export default StateHolder;