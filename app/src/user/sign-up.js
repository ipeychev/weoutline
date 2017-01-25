import URLHelper from '../helpers/url-helper';

class UserSignUp {
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
    this._submitListener = this._onFormSubmit.bind(this);
    this._tryAgainClickListener = this._onTryAgainClick.bind(this);

    this._signUpForm.addEventListener('submit', this._submitListener);
    this._tryAgainBtn.addEventListener('click', this._tryAgainClickListener);
  }

  _detachListeners() {
    this._signUpForm.removeEventListener('submit', this._submitListener);
    this._tryAgainBtn.removeEventListener('click', this._tryAgainClickListener);
  }

  _onFormSubmit(event) {
    event.preventDefault();

    this._registerUser({
      email: this._signUpForm.email.value,
      name: this._signUpForm.name.value,
      password: this._signUpForm.password.value
    })
    .then(() => {
      this._messageError.classList.add('hidden');
      this._messageSuccess.classList.remove('hidden');
      this._signUpForm.classList.add('hidden');
      this._tryAgainBtn.classList.add('hidden');
    })
    .catch(() => {
      this._messageError.classList.remove('hidden');
      this._messageSuccess.classList.add('hidden');
      this._signUpForm.classList.add('hidden');
      this._tryAgainBtn.classList.remove('hidden');
    });
  }

  _onTryAgainClick() {
    this._signUpForm.classList.remove('hidden');
    this._messageError.classList.add('hidden');
    this._messageSuccess.classList.add('hidden');
    this._tryAgainBtn.classList.add('hidden');
  }

  _registerUser(user) {
    return this._config.auth.createUser(user);
  }

  _setupAuth() {
    this._auth = this._config.auth;
  }

  _setupContainer() {
    this._messageError = document.getElementById('messageError');
    this._messageSuccess = document.getElementById('messageSuccess');
    this._signUpForm = document.getElementById('signUp');
    this._tryAgainBtn = document.getElementById('tryAgain');

    let returnURL = URLHelper.getPathAttributeValue('returnURL');

    if (returnURL) {
      let signInNode = document.getElementById('signIn');
      signInNode.href += '?returnURL=' + returnURL;
    }
  }
}

export default UserSignUp;