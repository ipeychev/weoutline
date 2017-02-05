import BrowserHelper from '../helpers/browser-helper';
import Draggable from '../draggable/draggable';
import Toolbar from './toolbar';

class ToolbarUser extends Toolbar {
  constructor(config) {
    super();

    config = config || {};

    this._config = config;

    this._setupContainer();

    this._draggable = new Draggable(this._element);

    this._attachListeners();
    this._positionToolbar();

    this._initItems()
      .then(() => {
        this._element.classList.remove('hidden');
      });
  }

  destroy() {
    this._detachListeners();
    this._draggable.destroy();

    window.clearTimeout(this._hideMenuTimeout);
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._documentInteractionListener = this._onDocumentInteraction.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (BrowserHelper.isTouchDevice()) {
      this._element.addEventListener('touchend', this._touchEndListener);
      document.addEventListener('touchstart', this._documentInteractionListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
      document.addEventListener('mousedown', this._documentInteractionListener);
    }
  }

  _detachListeners() {
    document.removeEventListener('mousedown', this._documentInteractionListener);
    document.removeEventListener('touchstart', this._documentInteractionListener);
    this._element.removeEventListener('click', this._clickListener);
    this._element.removeEventListener('touchend', this._touchEndListener);
  }

  _initItems() {
    return new Promise((resolve) => {
      if (this._config.currentUser) {
        let signedInNode = this._element.querySelector('.icon-signed-in');

        if (this._config.currentUser.photoUrl) {
          signedInNode.src = this._config.currentUser.photoUrl;

          let removeEventListeners;

          let loadImgListener = () => {
            signedInNode.classList.remove('hidden');
            this._userSignInNode.classList.add('hidden');

            removeEventListeners();
            resolve();
          };

          let errorImgListener = () => {
            removeEventListeners();
            resolve();
          };

          removeEventListeners = () => {
            signedInNode.removeEventListener('load', loadImgListener);
            signedInNode.removeEventListener('error', errorImgListener);
          };

          signedInNode.addEventListener('load', loadImgListener);
          signedInNode.addEventListener('error', errorImgListener);
        } else {
          signedInNode.classList.remove('hidden');
          this._userSignInNode.classList.add('hidden');

          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  _onClick(event) {
    let targetNode = event.target;

    if (this._config.currentUser) {
      window.clearTimeout(this._hideMenuTimeout);

      if (this._userSignOutNode.contains(targetNode)) {
        event.preventDefault();
        this._config.signOutCallback();
      } else if (this._userSignedInNode.contains(targetNode)) {
        this._updateToolbarView(this._userNode, targetNode, {
          activateValue: false
        });
      }

      this._hideMenuTimeout = window.setTimeout(this._hideMenu.bind(this), 5000);
    } else {
      event.preventDefault();
      this._config.signInCallback(this._userSignInNode.getAttribute('href'));
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._userNode = this._element.querySelector('#user');
    this._userProfileNode = this._element.querySelector('#userProfile');
    this._userSignInNode = this._element.querySelector('#userSignIn');
    this._userSignedInNode = this._element.querySelector('#userSignedIn');
    this._userSignOutNode = this._element.querySelector('#userSignOut');
  }
}

export default ToolbarUser;