class EventEmitter {
  constructor() {
    this._events = {};
  }

  destroy() {
    this._events = null;
  }

  on(event, callback) {
    let listeners = this._events[event] = this._events[event] || [];

    listeners.push(callback);
  }

  off(event, callback) {
    let listeners = this._events[event];

    if (listeners) {
      let callbackIndex = listeners.indexOf(callback);

      if (callbackIndex > -1) {
        listeners.splice(callbackIndex, 1);
      }
    }
  }

  emit(event, args) {
    let listeners = this._events[event];

    if (listeners) {
      listeners = listeners.slice(0);

      for (let i = 0; i < listeners.length; i++) {
        let listener = listeners[i];

        listener.call(listener, args);
      }
    }
  }
};

export default EventEmitter;