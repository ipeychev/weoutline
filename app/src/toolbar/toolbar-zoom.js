import BrowserHelper from '../helpers/browser-helper';
import Toolbar from './toolbar';

class ToolbarZoom extends Toolbar {
  constructor(config) {
    super();

    config = config || {};

    this._config = config;

    this._setupContainer();

    this._attachListeners();

    this._updateUI();

    this._element.classList.remove('hidden');
  }

  destroy() {
    this._detachListeners();
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._stateChangeListener = this._onStateChange.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (BrowserHelper.getTouchEventsSupport()) {
      this._element.addEventListener('touchend', this._touchEndListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
    }

    this._config.stateHolder.on('stateChange', this._stateChangeListener);
  }

  _detachListeners() {
    this._config.stateHolder.off('stateChange', this._stateChangeListener);
    this._element.removeEventListener('click', this._clickListener);
    this._element.removeEventListener('touchend', this._touchEndListener);
  }

  _onClick(event) {
    event.preventDefault();

    let targetNode = event.target;

    if (this._zoomModeEnableNode.contains(targetNode)) {
      let nodeValue = this._zoomModeEnableNode.querySelector('.toolbar-item-value');
      let zoomModeEnabled = nodeValue.classList.contains('active');

      if (zoomModeEnabled) {
        nodeValue.classList.remove('active');
      } else {
        nodeValue.classList.add('active');
      }

      this._config.enableZoomModeCallback({
        zoomModeEnabled: !zoomModeEnabled
      });
    } else if (this._zoomDecreaseNode.contains(targetNode)) {
      this._config.decreaseZoomCallback();
    } else if (this._zoomIncreaseNode.contains(targetNode)) {
      this._config.increaseZoomCallback();
    } else if (this._zoomValueNode.contains(targetNode)) {
      this._config.normalizeZoomCallback();
    }
  }

  _onStateChange(params) {
    if (params.prop === 'scale') {
      this._setZoom();
    }
  }

  _updateUI() {
    this._setZoom();
    this._setZoomEnabled();
  }

  _setZoom() {
    let state = this._config.stateHolder.getState();

    this._zoomValueNode.querySelector('.icon').innerHTML = Math.round(100 * state.scale);
  }

  _setZoomEnabled() {
    let state = this._config.stateHolder.getState();

    let nodeValue = this._zoomModeEnableNode.querySelector('.toolbar-item-value');

    if (state.zoomModeEnabled) {
      nodeValue.classList.add('active');
    } else {
      nodeValue.classList.remove('active');
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._zoomDecreaseNode = this._element.querySelector('#zoomDecrease');
    this._zoomModeEnableNode = this._element.querySelector('#zoomModeEnable');
    this._zoomIncreaseNode = this._element.querySelector('#zoomIncrease');
    this._zoomValueNode = this._element.querySelector('#zoomValue');
  }
}

export default ToolbarZoom;