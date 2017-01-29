class Copy {
  constructor(config) {
    this._config = config;

    this._setupContainer();
    this._attachListeners();
  }

  destroy() {
    this._detachListeners();
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);

    this._element.addEventListener('click', this._clickListener);
  }

  _onClick(event) {
    event.preventDefault();

    this._targetEl.focus();
    this._targetEl.select();
    document.execCommand('copy');
    this._targetEl.setSelectionRange(0, 0);

    this._element.classList.add('copied');
    this._element.setAttribute('aria-label', 'Copied!');

    window.setTimeout(() => {
      this._element.classList.remove('copied');
      this._element.removeAttribute('aria-label', 'Copied!');
    }, 3000);
  }

  _detachListeners() {
    this._element.removeEventListener('click', this._clickListener);
  }

  _setupContainer() {
    this._element = document.querySelector(this._config.srcNode);
    this._targetEl = document.querySelector(this._config.targetEl);
  }
}

export default Copy;