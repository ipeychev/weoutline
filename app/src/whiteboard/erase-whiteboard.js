class EraseWhiteboardModal {
  constructor(config) {
    this._config = config;

    this._setupContainer();
    this._attachListeners();
  }

  destroy() {
    this._detachListeners();
  }

  hide() {
    this._element.classList.add('hidden');
  }

  show() {
    this._element.classList.remove('hidden');
  }

  _attachListeners() {
    this._hideClickListener = this.hide.bind(this);
    this._eraseClickListener = this._onEraseClick.bind(this);

    this._eraseBtn.addEventListener('click', this._eraseClickListener);
    this._hideBtn.addEventListener('click', this._hideClickListener);
  }

  _detachListeners() {
    this._eraseBtn.removeEventListener('click', this._onEraseClickListener);
    this._hideBtn.removeEventListener('click', this._hideClickListener);
  }

  _onEraseClick() {
    this._config.eraseWhiteBoardCallback();

    this.hide();
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._eraseBtn = this._element.querySelector('#eraseWhiteboardButton');

    this._hideBtn = this._element.querySelector('#eraseWhiteboardHide');
  }
}

export default EraseWhiteboardModal;