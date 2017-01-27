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
    this.setValues(config);

    this._element.classList.remove('hidden');
  }

  destroy() {
    this._detachListeners();
    this._draggable.destroy();
  }

  getValues() {
    let values = {
      activeTool: this._getActiveTool(),
      color: this._getColor(),
      penSize: this._getPenSize()
    };

    return values;
  }

  setValues(config) {
    this._deactivateValues();

    if (config.activeTool === Tools.line) {
      this._penNode.querySelector('.toolbar-item-value').classList.add('active');
    } else if (config.activeTool === Tools.eraser) {
      this._eraserNode.querySelector('.toolbar-item-value').classList.add('active');
    }

    this._setToolSize(this._penNode, config.penSize);
    this._setColor(config.color);
    this._setFullscreen(config.fullscreen);
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._documentInteractionListener = this._onDocumentInteraction.bind(this);
    this._resizeListener = this._onResize.bind(this);
    this._orientationChangeListener = () => {setTimeout(this._onResize.bind(this), 100);};
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (BrowserHelper.isTouchDevice()) {
      this._element.addEventListener('touchend', this._touchEndListener, { passive: true });
      document.addEventListener('touchstart', this._documentInteractionListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
      document.addEventListener('mousedown', this._documentInteractionListener);
    }

    window.addEventListener('orientationchange', this._orientationChangeListener);
    window.addEventListener('resize', this._resizeListener);
  }

  _detachListeners() {
    document.removeEventListener('mousedown', this._documentInteractionListener);
    document.removeEventListener('touchstart', this._documentInteractionListener);
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

    return DrawHelper.rgbToHex(style.getPropertyValue('fill'));
  }

  _getPenSize() {
    return this._getToolSize(this._penNode);
  }

  _getToolSize(rootNode) {
    let node = rootNode.querySelector('.toolbar-item-option.active .icon');
    let style = window.getComputedStyle(node);

    return parseInt(style.getPropertyValue('width'), 10);
  }

  _initItems() {
    if (BrowserHelper.isFullScreenSupported()) {
      this._fullScreenNode.classList.remove('hidden');
    }
  }

  _onClick(event) {
    let targetNode = event.target;

    if (this._penNode.contains(targetNode)) {
      this._updateToolbarView(this._penNode, targetNode, {
        activateValue: true
      });
    } else if (this._eraserNode.contains(targetNode)) {
      this._updateToolbarView(this._eraserNode, targetNode, {
        activateValue: true
      });
    } else if (this._colorNode.contains(targetNode)) {
      this._updateToolbarView(this._colorNode, targetNode, {
        activateValue: false,
        setCurrentValue: {
          source: 'style',
          nodeSelector: '.icon',
          transformFn: DrawHelper.rgbToHex,
          property: 'fill'
        }
      });
    } else if (this._clearNode.contains(targetNode)) {
      this._config.clearWhiteboardCallback();
    } else if (this._shareNode.contains(targetNode)) {
      this._config.shareWhiteboardCallback();
    } else if (this._fullScreenNode.contains(targetNode)) {
      this._config.fullscreenCallback();
    } else {
      return;
    }

    let values = this.getValues();

    this._config.valuesCallback(values);
  }

  _onColorChange() {
    let values = this.getValues();

    this._config.valuesCallback(values);
  }

  _onResize() {
    this._positionToolbar();
  }

  _setColor(value) {
    this._deactivateOptions(this._colorNode);

    let nodes = this._colorNode.querySelectorAll('.toolbar-item-option .icon');

    for (let i = 0; nodes && i < nodes.length; i++) {
      let optionNode = nodes.item(i);

      let style = window.getComputedStyle(optionNode);

      if (DrawHelper.rgbToHex(style.getPropertyValue('fill')) === value) {
        optionNode.parentNode.classList.add('active');

        this._setItemValue(optionNode.parentNode, this._colorNode, {
          setCurrentValue: {
            source: 'style',
            nodeSelector: '.icon',
            transformFn: DrawHelper.rgbToHex,
            property: 'fill'
          }
        });
      }
    }
  }

  _setFullscreen(fullscreen) {
    let fullScreenExpandNode = this._fullScreenNode.querySelector('.icon-expand');
    let fullScreenCompressNode = this._fullScreenNode.querySelector('.icon-compress');

    if (fullscreen) {
      fullScreenExpandNode.classList.add('hidden');
      fullScreenCompressNode.classList.remove('hidden');
    } else {
      fullScreenExpandNode.classList.remove('hidden');
      fullScreenCompressNode.classList.add('hidden');
    }
  }

  _setToolSize(rootNode, value) {
    this._deactivateOptions(rootNode);

    let nodes = rootNode.querySelectorAll('.toolbar-item-option .icon');

    for (let i = 0; nodes && i < nodes.length; i++) {
      let optionNode = nodes.item(i);

      let style = window.getComputedStyle(optionNode);

      if (parseInt(style.getPropertyValue('width'), 10) === value) {
        optionNode.parentNode.classList.add('active');
      }
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._clearNode = this._element.querySelector('#clear');
    this._colorNode = this._element.querySelector('#color');
    this._eraserNode = this._element.querySelector('#eraser');
    this._fullScreenNode = this._element.querySelector('#fullscreen');
    this._penNode = this._element.querySelector('#pen');
    this._shareNode = this._element.querySelector('#share');
  }
}

export default ToolbarTools;