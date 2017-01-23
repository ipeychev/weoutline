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

  static getConfigProps() {
    return {
      currentUser: 1,
      signInCallback: 1,
      signOutCallback: 1,
      srcNode: 1,
      userProfileCallback: 1
    };
  }

  destroy() {
    this._detachListeners();
    this._draggable.destroy();
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._documentInteractionListener = this._onDocumentInteraction.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (BrowserHelper.isTouchDevice()) {
      this._element.addEventListener('touchend', this._touchEndListener, { passive: true });
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
    this._element.removeEventListener('touchend', this._touchEndListener, { passive: true });
  }

  _initItems() {
    return new Promise((resolve) => {
      if (this._config.currentUser) {
        let signedInNode = this._element.querySelector('.icon-signed-in');

        if (this._config.currentUser.photoUrl) {
          signedInNode.src = this._config.currentUser.photoUrl;

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

          let removeEventListeners = () => {
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
      if (this._userSignOutNode.contains(targetNode)) {
         event.preventDefault();
        this._config.signOutCallback();
      } else {
        this._updateToolbarView(this._userNode, targetNode, {
          activateValue: false
        });
      }
    } else {
      event.preventDefault();
      this._config.signInCallback(this._userSignInNode.getAttribute('href'));
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._userNode = document.getElementById('user');
    this._userProfileNode = document.getElementById('userProfile');
    this._userSignInNode = document.getElementById('userSignIn');
    this._userSignOutNode = document.getElementById('userSignOut');
  }
}

export default ToolbarUser;