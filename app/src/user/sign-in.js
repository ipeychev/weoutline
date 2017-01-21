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

    this._signInForm.addEventListener('submit', this._submitListener);
    this._signGitHubBtn.addEventListener('click', this._signGitHubListener);
    this._signGoogleBtn.addEventListener('click', this._signGoogleListener);
  }

  _detachListeners() {
    this._signInForm.removeEventListener('submit', this._submitListener);
    this._signGitHubBtn.removeEventListener('click', this._signGitHubListener);
    this._signGoogleBtn.removeEventListener('click', this._signGoogleListener);
  }

  _onFormSubmit(event) {
    event.preventDefault();

    this._signInWithEmailAndPassword();
  }

  _setupAuth() {
    this._auth = this._config.auth;

    this._auth.onSignIn(function(user) {
      let match = /\?returnUrl=([^&]+|.+$)/.exec(window.location.href);

      if (match) {
        window.location.href = decodeURIComponent(match[1]) || '/';
      }
    });
  }

  _setupContainer() {
    this._signInForm = document.getElementById('signIn');
    this._signGitHubBtn = document.getElementById('signGitHub');
    this._signGoogleBtn = document.getElementById('signGoogle');
  }

  _signInWithEmailAndPassword() {
    this._auth.signInWithEmailAndPassword(this._signInForm.email.value, this._signInForm.password.value)
      .then(function() {
        alert('Sign-in successfully.');
        this._signInForm.reset();
      })
      .catch(function() {
        alert('Sign-in failed.');
        this._signInForm.reset();
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