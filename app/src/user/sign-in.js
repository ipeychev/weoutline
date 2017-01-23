import URLHelper from '../helpers/url-helper';

class UserSignIn {
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
    this._signGitHubListener = this._signInWithGithub.bind(this);
    this._signGoogleListener = this._signInWithGoogle.bind(this);
    this._submitListener = this._onFormSubmit.bind(this);
    this._tryAgainClickListener = this._onTryAgainClick.bind(this);

    this._signGitHubBtn.addEventListener('click', this._signGitHubListener);
    this._signGoogleBtn.addEventListener('click', this._signGoogleListener);
    this._signInForm.addEventListener('submit', this._submitListener);
    this._tryAgainBtn.addEventListener('click', this._tryAgainClickListener);
  }

  _detachListeners() {
    this._signGitHubBtn.removeEventListener('click', this._signGitHubListener);
    this._signGoogleBtn.removeEventListener('click', this._signGoogleListener);
    this._signInForm.removeEventListener('submit', this._submitListener);
    this._tryAgainBtn.removeEventListener('click', this._tryAgainClickListener);
  }

  _onFormSubmit(event) {
    event.preventDefault();

    this._signInWithEmailAndPassword();
  }

  _navigateAfterSuccess() {
    let returnURL = URLHelper.getPathAttributeValue('returnURL');

    returnURL = returnURL ? decodeURIComponent(returnURL) : '/';

    window.location.href = returnURL;
  }

  _onTryAgainClick() {
    this._signInForm.classList.remove('hidden');
    this._messageError.classList.add('hidden');
    this._tryAgainBtn.classList.add('hidden');
  }

  _setupAuth() {
    this._auth = this._config.auth;

    this._auth.onSignIn(() => {
      this._navigateAfterSuccess();
    });
  }

  _setupContainer() {
    this._messageError = document.getElementById('messageError');
    this._signGitHubBtn = document.getElementById('signGitHub');
    this._signGoogleBtn = document.getElementById('signGoogle');
    this._signInForm = document.getElementById('signIn');
    this._tryAgainBtn = document.getElementById('tryAgain');

    let returnURL = URLHelper.getPathAttributeValue('returnURL');

    if (returnURL) {
      let signUpNode = document.getElementById('signUp');
      signUpNode.href += '?' + 'returnURL=' + returnURL;

      let resetNode = document.getElementById('reset');
      resetNode.href += '?returnURL=' + returnURL;
    }
  }

  _signInWithEmailAndPassword() {
    this._auth.signInWithEmailAndPassword(this._signInForm.email.value, this._signInForm.password.value)
    .then(() => {
      this._navigateAfterSuccess();
    })
    .catch(() => {
      this._messageError.classList.remove('hidden');
      this._signInForm.classList.add('hidden');
      this._tryAgainBtn.classList.remove('hidden');
    });
  }

  _signInWithGithub() {
    var githubProvider = new this._auth.provider.Github();
    githubProvider.setProviderScope('user:email');
    this._auth.signInWithRedirect(githubProvider);
  }

  _signInWithGoogle() {
    var googleProvider = new this._auth.provider.Google();
    googleProvider.setProviderScope('email');
    this._auth.signInWithRedirect(googleProvider);
  }
}

export default UserSignIn;