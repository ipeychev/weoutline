import BrowserHelper from '../helpers/browser-helper';
import DrawHelper from '../helpers/draw-helper';
import Draggable from '../draggable/draggable';
import Toolbar from './toolbar';
import Tools from '../draw/tools';

class ToolbarTools extends Toolbar {
  constructor(config) {
    super();

    config = config || {};

    this._config = config;

    this._setupContainer();

    this._draggable = new Draggable(this._element);

    this._attachListeners();
    this._positionToolbar();
    this._initItems();
    this._updateUI();

    this._element.classList.remove('hidden');
  }

  destroy() {
    this._detachListeners();
    this._draggable.destroy();

    window.clearTimeout(this._hideMenuTimeout);
  }

  getConfig() {
    let values = {
      activeTool: this._getActiveTool(),
      color: this._getColor(),
      fullscreen: this._getFullscreen(),
      mapVisible: this._getMapVisible(),
      penSize: this._getPenSize()
    };

    return values;
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._documentInteractionListener = this._onDocumentInteraction.bind(this);
    this._orientationChangeListener = () => {window.setTimeout(this._onResize.bind(this), 100);};
    this._resizeListener = this._onResize.bind(this);
    this._stateChangeListener = this._onStateChange.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (BrowserHelper.getTouchEventsSupport()) {
      this._element.addEventListener('touchend', this._touchEndListener, { passive: true });
      document.addEventListener('touchstart', this._documentInteractionListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
      document.addEventListener('mousedown', this._documentInteractionListener);
    }

    window.addEventListener('orientationchange', this._orientationChangeListener);
    window.addEventListener('resize', this._resizeListener);

    this._config.stateHolder.on('stateChange', this._stateChangeListener);
  }

  _detachListeners() {
    document.removeEventListener('mousedown', this._documentInteractionListener);
    document.removeEventListener('touchstart', this._documentInteractionListener);
    this._config.stateHolder.off('stateChange', this._stateChangeListener);
    this._element.removeEventListener('click', this._clickListener);
    this._element.removeEventListener('touchend', this._touchEndListener, { passive: true });
    window.removeEventListener('orientationchange', this._orientationChangeListener);
    window.removeEventListener('resize', this._resizeListener);
  }

  _getActiveTool() {
    let activeNode = this._element.querySelector('.toolbar-item-value.active').parentNode;

    if (activeNode === this._penNode) {
      return Tools.line;
    } else if (activeNode === this._eraserNode) {
      return Tools.eraser;
    }
  }

  _getColor() {
    let node = this._colorNode.querySelector('.toolbar-item-option.active .icon');
    let style = window.getComputedStyle(node);

    return DrawHelper.colorToHex(style.getPropertyValue('color'));
  }

  _getPenSize() {
    return this._getToolSize(this._penNode);
  }

  _getToolSize(rootNode) {
    let node = rootNode.querySelector('.toolbar-item-option.active .icon');
    let style = window.getComputedStyle(node);

    return parseInt(style.getPropertyValue('font-size'), 10);
  }

  _initItems() {
    if (BrowserHelper.isFullScreenSupported()) {
      this._fullScreenNode.classList.remove('hidden');
    }
  }

  _onClick(event) {
    let targetNode = event.target;

    window.clearTimeout(this._hideMenuTimeout);

    if (this._penNode.contains(targetNode)) {
      this._updateToolbarView(this._penNode, targetNode, {
        activateMenuItem: true,
        activateValueItem: true
      });

      this._config.valueChange('penSize', this._getPenSize());
    } else if (this._eraserNode.contains(targetNode)) {
      this._updateToolbarView(this._eraserNode, targetNode, {
        activateMenuItem: true,
        activateValueItem: true
      });
      this._config.valueChange('activeTool', Tools.eraser);
    } else if (this._colorNode.contains(targetNode)) {
      this._updateToolbarView(this._colorNode, targetNode, {
        activateMenuItem: true,
        activateValueItem: false,
        setCurrentValue: {
          source: 'style',
          nodeSelector: '.icon',
          transformFn: DrawHelper.colorToHex,
          property: 'color'
        }
      });

      this._config.valueChange('color', this._getColor());
    } else if (this._clearNode.contains(targetNode)) {
      this._config.clearWhiteboardCallback();
    } else if (this._showMapNode.contains(targetNode)) {
      this._config.showMapCallback();
    } else if (this._shareNode.contains(targetNode)) {
      this._updateToolbarView(this._shareNode, targetNode, {
        activateMenuItem: false,
        activateValueItem: false
      });

      if (this._shareWhiteboardLinkNode.contains(targetNode)) {
        this._config.shareWhiteboardLinkCallback();
      } else if (this._shareWhiteboardImageNode.contains(targetNode)) {
        this._config.shareWhiteboardImageCallback();
      }
    } else if (this._fullScreenNode.contains(targetNode)) {
      this._config.fullscreenCallback();
    } else {
      return;
    }

    this._hideMenuTimeout = window.setTimeout(this._hideMenu.bind(this), 5000);
  }

  _onResize() {
    this._positionToolbar();
  }

  _onStateChange(params) {
    if (params.prop === 'activeTool') {
      if (params.value === Tools.line) {
        this._penNode.querySelector('.toolbar-item-value').classList.add('active');
      } else if (params.value === Tools.eraser) {
        this._eraserNode.querySelector('.toolbar-item-value').classList.add('active');
      }
    } else if (params.prop === 'penSize') {
      this._setToolSize();
    } else if (params.prop === 'color') {
      this._setColor();
    } else if (params.prop === 'fullscreen') {
      this._setFullscreen();
    } else if (params.prop === 'mapVisible') {
      this._setMapVisible();
    }
  }

  _setColor() {
    this._deactivateOptions(this._colorNode);

    let nodes = this._colorNode.querySelectorAll('.toolbar-item-option .icon');

    let state = this._config.stateHolder.getState();

    for (let i = 0; nodes && i < nodes.length; i++) {
      let optionNode = nodes.item(i);

      let style = window.getComputedStyle(optionNode);

      if (DrawHelper.colorToHex(style.getPropertyValue('color')) === state.color) {
        optionNode.parentNode.classList.add('active');

        this._setItemValue(optionNode.parentNode, this._colorNode, {
          setCurrentValue: {
            source: 'style',
            nodeSelector: '.icon',
            transformFn: DrawHelper.colorToHex,
            property: 'color'
          }
        });
      }
    }
  }

  _setFullscreen() {
    let fullScreenExpandNode = this._fullScreenNode.querySelector('.icon-expand');
    let fullScreenCompressNode = this._fullScreenNode.querySelector('.icon-compress');

    let state = this._config.stateHolder.getState();

    if (state.fullscreen) {
      fullScreenExpandNode.classList.add('hidden');
      fullScreenCompressNode.classList.remove('hidden');
    } else {
      fullScreenExpandNode.classList.remove('hidden');
      fullScreenCompressNode.classList.add('hidden');
    }
  }

  _setMapVisible() {
    let state = this._config.stateHolder.getState();

    if (state.mapVisible) {
      this._showMapNode.classList.add('hidden');
    } else {
      this._showMapNode.classList.remove('hidden');
    }
  }

  _setToolSize() {
    this._deactivateOptions(this._penNode);

    let nodes = this._penNode.querySelectorAll('.toolbar-item-option .icon');

    let state = this._config.stateHolder.getState();

    for (let i = 0; nodes && i < nodes.length; i++) {
      let optionNode = nodes.item(i);

      let style = window.getComputedStyle(optionNode);

      if (parseInt(style.getPropertyValue('font-size'), 10) === state.penSize) {
        optionNode.parentNode.classList.add('active');
        break;
      }
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._clearNode = this._element.querySelector('#toolClear');
    this._colorNode = this._element.querySelector('#toolColor');
    this._eraserNode = this._element.querySelector('#toolEraser');
    this._fullScreenNode = this._element.querySelector('#toolFullscreen');
    this._penNode = this._element.querySelector('#toolPen');
    this._shareNode = this._element.querySelector('#toolShareWhiteboard');
    this._shareWhiteboardImageNode = this._element.querySelector('#toolShareWhiteboardImage');
    this._shareWhiteboardLinkNode = this._element.querySelector('#toolShareWhiteboardLink');
    this._showMapNode = this._element.querySelector('#toolMap');
  }

  _updateUI() {
    let state = this._config.stateHolder.getState();

    this._deactivateValues();

    if (state.activeTool === Tools.line) {
      this._penNode.querySelector('.toolbar-item-value').classList.add('active');
    } else if (state.activeTool === Tools.eraser) {
      this._eraserNode.querySelector('.toolbar-item-value').classList.add('active');
    }

    this._setToolSize();
    this._setColor();
    this._setFullscreen();
    this._setMapVisible();
  }
}

export default ToolbarTools;