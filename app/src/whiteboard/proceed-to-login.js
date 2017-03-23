class ProceedToLoginModal {
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
    this._body.innerHTML = `<h1>${this._config.msg}<h1>`;
    this._element.classList.remove('hidden');
  }

  _attachListeners() {
    this._hideClickListener = this.hide.bind(this);
    this._proceedToLoginListener = this._onProceedToLogin.bind(this);
    this._onKeyDownListener = this._onKeyDown.bind(this);

    document.addEventListener('keydown', this._onKeyDownListener);
    this._proceedToLoginBtn.addEventListener('click', this._proceedToLoginListener);

    if (this._config.enableHide) {
      this._hideBtn.addEventListener('click', this._hideClickListener);
    }
  }

  _detachListeners() {
    document.removeEventListener('keydown', this._onKeyDownListener);
    this._proceedToLoginBtn.removeEventListener('click', this._eraseClickListener);

    if (this._config.enableHide) {
      this._hideBtn.removeEventListener('click', this._hideClickListener);
    }
  }

  _onProceedToLogin() {
    this._config.proceedToLoginCallback();

    this.hide();
  }

  _onKeyDown(event) {
    if (event.keyCode === 13) {
      this._onProceedToLogin();
    } else if (this._config.enableHide && event.keyCode === 27) {
      this.hide();
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._body = this._element.querySelector('#proceedToLoginBody');
    this._proceedToLoginBtn = this._element.querySelector('#proceedToLoginButton');

    let hideBtn = this._element.querySelector('#proceedToLoginHide');

    if (this._config.enableHide) {
      hideBtn.classList.remove('hidden');
      this._hideBtn = hideBtn;
    } else {
      hideBtn.classList.add('hidden');
      this._hideBtn = null;
    }
  }
}

export default ProceedToLoginModal;