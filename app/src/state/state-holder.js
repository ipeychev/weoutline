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

    // It is up to the developer to provide a new value
    // if he is interested in the old value. If an Array,
    // that should be a completely new Array (new reference).
    // The same is with Object.
    let prevValue = this._state[prop];

    this._state[prop] = value;

    if (!params || !params.suppressChangeEmit) {
      this.emit('stateChange', {
        data: params ? params.data : null,
        prevValue: prevValue,
        prop: prop,
        value: value
      });
    }
  }
}

export default StateHolder;