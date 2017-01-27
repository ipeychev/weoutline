class UserReset {
  constructor(config) {
    this._config = config;

    this._setupContainer();
    this._attachListeners();
    this._setupAuth();
  }

  destroy() {
    this._detachListeners();
  }

  _attachListeners() {
  }

  _detachListeners() {
  }

  _setupAuth() {
    this._auth = this._config.auth;
  }

  _setupContainer() {
  }
}

export default UserReset;