import BrowserHelper from '../helpers/browser-helper';
import Toolbar from './toolbar';

class ToolbarZoom extends Toolbar {
  constructor(config) {
    super();

    config = config || {};

    this._config = config;

    this._setupContainer();

    this._attachListeners();

    this._initItems();

    this._element.classList.remove('hidden');
  }

  destroy() {
    this._detachListeners();
  }

  setValues(config) {
    Object.assign(this._config, config);

    this._zoomValueNode.querySelector('.icon').innerHTML = Math.round(100 * config.scale);
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (BrowserHelper.isTouchDevice()) {
      this._element.addEventListener('touchend', this._touchEndListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
    }
  }

  _detachListeners() {
    this._element.removeEventListener('click', this._clickListener);
    this._element.removeEventListener('touchend', this._touchEndListener);
  }

  _initItems() {
    this._zoomValueNode.querySelector('.icon').innerHTML = Math.round(100 * this._config.scale);
  }

  _onClick(event) {
    event.preventDefault();

    let targetNode = event.target;

    if (this._zoomDecreaseNode.contains(targetNode)) {
      this._config.decreaseZoomCallback();
    } else if (this._zoomIncreaseNode.contains(targetNode)) {
      this._config.increaseZoomCallback();
    } else if (this._zoomValueNode.contains(targetNode)) {
      this._config.normalizeZoomCallback();
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._zoomDecreaseNode = this._element.querySelector('#zoomDecrease');
    this._zoomIncreaseNode = this._element.querySelector('#zoomIncrease');
    this._zoomValueNode = this._element.querySelector('#zoomValue');
  }
}

export default ToolbarZoom;