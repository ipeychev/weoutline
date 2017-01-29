class EraseWhiteboardModal {
  constructor(config) {
    this._config = config;

    this._setupContainer();
  }

  destroy() {
    this._detachListeners();
  }

  hide() {
    this._detachListeners();
    this._element.classList.add('hidden');
  }

  show() {
    this._attachListeners();
    this._element.classList.remove('hidden');
  }

  _attachListeners() {
    this._hideClickListener = this.hide.bind(this);
    this._eraseClickListener = this._onErase.bind(this);
    this._onKeyDownListener = this._onKeyDown.bind(this);

    document.addEventListener('keydown', this._onKeyDownListener);
    this._eraseBtn.addEventListener('click', this._eraseClickListener);
    this._hideBtn.addEventListener('click', this._hideClickListener);
  }

  _detachListeners() {
    document.removeEventListener('keydown', this._onKeyDownListener);
    this._eraseBtn.removeEventListener('click', this._eraseClickListener);
    this._hideBtn.removeEventListener('click', this._hideClickListener);
  }

  _onErase() {
    this._config.eraseWhiteBoardCallback();

    this.hide();
  }

  _onKeyDown(event) {
    if (event.keyCode === 13) {
      this._onErase();
    } else if (event.keyCode === 27) {
      this.hide();
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._eraseBtn = this._element.querySelector('#eraseWhiteboardButton');

    this._hideBtn = this._element.querySelector('#eraseWhiteboardHide');
  }
}

export default EraseWhiteboardModal;