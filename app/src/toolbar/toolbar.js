import Draggable from '../draggable/draggable';
import Tools from '../draw/tools';
import Utils from '../utils/utils';

class Toolbar {
  constructor(config) {
    config = config || {};

    this._config = config;

    this._setupContainer();
    this._attachListeners();
    this._positionToolbar();
    this._initItems();
    this.setValues(config);

    this._draggable = new Draggable(this._element);

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
    this._orientationChangeListener = () => {setTimeout(this._onResize.bind(this), 100)};
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (Utils.isTouchDevice()) {
      this._element.addEventListener('touchend', this._touchEndListener, { passive: true });
      document.addEventListener('touchstart', this._documentInteractionListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
      document.addEventListener('mousedown', this._documentInteractionListener);
    }

    window.addEventListener('orientationchange', this._orientationChangeListener);
    window.addEventListener('resize', this._resizeListener);
  }

  _deactivateOptions(rootNode) {
    var nodes = rootNode.querySelectorAll('.toolbar-item-option');

    for (let i = 0; nodes && i < nodes.length; i++) {
      nodes.item(i).classList.remove('active');
    }
  }

  _deactivateValues() {
    var nodes = this._element.querySelectorAll('.toolbar-item-value');

    for (let i = 0; nodes && i < nodes.length; i++) {
      nodes.item(i).classList.remove('active');
    }
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
    let node = this._colorNode.querySelector('.toolbar-item-option.active .fa');
    let style = window.getComputedStyle(node);

    return Utils.rgbToHex(style.getPropertyValue('color'));
  }

  _getPenSize() {
    return this._getToolSize(this._penNode);
  }

  _getToolSize(rootNode) {
    let node = rootNode.querySelector('.toolbar-item-option.active .fa');
    let style = window.getComputedStyle(node);

    return parseInt(style.getPropertyValue('font-size'), 10);
  }

  _hideMenu() {
    let nodes = this._element.querySelectorAll('.toolbar-item-options');

    for (let i = 0; nodes && i < nodes.length; i++) {
      nodes.item(i).classList.add('hidden');
    }
  }

  _initItems() {
    if (Utils.isFullScreenSupported()) {
      this._fullScreenNode.classList.remove('hidden');
    }
  }

  _onClick(event) {
    let targetNode = event.target;

    if (this._penNode.contains(targetNode)) {
      this._updateToolbarView(this._penNode, targetNode, {
        activateTool: true
      });
    } else if (this._eraserNode.contains(targetNode)) {
      this._updateToolbarView(this._eraserNode, targetNode, {
        activateTool: true
      });
    } else if (this._colorNode.contains(targetNode)) {
      this._updateToolbarView(this._colorNode, targetNode, {
        activateTool: false,
        setCurrentValue: {
          source: 'style',
          nodeSelector: '.fa',
          transformFn: Utils.rgbToHex,
          property: 'color'
        }
      });
    } else if (this._clearNode.contains(targetNode)) {
      this._config.clearWhiteboardCallback();
    } else if (this._shareNode.contains(targetNode)) {
      this._config.shareWhiteboardCallback();
    } else if (this._fullScreenNode.contains(targetNode)) {
      this._config.fullscreenCallback();
    } else {
      this._hideMenu();
    }

    let values = this.getValues();

    this._config.valuesCallback(values);
  }

  _onColorChange() {
    let values = this.getValues();

    this._config.valuesCallback(values);
  }

  _onDocumentInteraction(event) {
    if (!this._element.contains(event.target)) {
      this._hideMenu();
    }
  }

  _onResize() {
    this._positionToolbar();
  }

  _onTouchEnd(event) {
    if (event.changedTouches.length === 1) {
      this._onClick(event);
    }
  }

  _setColor(value) {
    this._deactivateOptions(this._colorNode);

    let nodes = this._colorNode.querySelectorAll('.toolbar-item-option .fa');

    for (let i = 0; nodes && i < nodes.length; i++) {
      let optionNode = nodes.item(i);

      let style = window.getComputedStyle(optionNode);

      if (Utils.rgbToHex(style.getPropertyValue('color')) === value) {
        optionNode.parentNode.classList.add('active');

        this._setItemValue(optionNode.parentNode, this._colorNode, {
          setCurrentValue: {
            source: 'style',
            nodeSelector: '.fa',
            transformFn: Utils.rgbToHex,
            property: 'color'
          }
        });
      }
    }
  }

  _positionToolbar() {
    let bodyBoundingRect = document.body.getBoundingClientRect();

    if (bodyBoundingRect.width > bodyBoundingRect.height) {
      this._element.classList.remove('vertical');
    } else {
      this._element.classList.add('vertical');
    }
  }

  _setFullscreen(fullscreen) {
    let node = this._fullScreenNode.querySelector('.fa');

    if (fullscreen) {
      node.classList.remove('fa-expand');
      node.classList.add('fa-compress');
    } else {
      node.classList.remove('fa-compress');
      node.classList.add('fa-expand');
    }
  }

  _setItemValue(optionNode, rootNode, config) {
    if (config.setCurrentValue.source === 'style') {
      let style = window.getComputedStyle(optionNode.querySelector(config.setCurrentValue.nodeSelector));

      let value = config.setCurrentValue.transformFn ? config.setCurrentValue.transformFn(style.getPropertyValue(config.setCurrentValue.property)) :
        style.getPropertyValue(config.setCurrentValue.property);

      rootNode.querySelector('.toolbar-item-value').querySelector(config.setCurrentValue.nodeSelector).style[config.setCurrentValue.property] = value;
    }
  }

  _setToolSize(rootNode, value) {
    this._deactivateOptions(rootNode);

    let nodes = rootNode.querySelectorAll('.toolbar-item-option .fa');

    for (let i = 0; nodes && i < nodes.length; i++) {
      let optionNode = nodes.item(i);

      let style = window.getComputedStyle(optionNode);

      if (parseInt(style.getPropertyValue('font-size'), 10) === value) {
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

  _updateToolbarView(rootNode, targetNode, config) {
    let optionsNode = rootNode.querySelector('.toolbar-item-options');

    if (optionsNode) {
      let isMenuShown = !optionsNode.classList.contains('hidden');

      this._hideMenu();

      if (config.activateTool) {
        this._deactivateValues();
        rootNode.querySelector('.toolbar-item-value').classList.add('active');
      }

      if (optionsNode.contains(targetNode)) {
        this._deactivateOptions(rootNode);

        while (!targetNode.matches('.toolbar-item-option')) {
          targetNode = targetNode.parentNode;
        }

        targetNode.classList.add('active');

        if (config.setCurrentValue) {
          this._setItemValue(targetNode, rootNode, config);
        }
      } else if (!isMenuShown) {
        optionsNode.classList.remove('hidden');
      }
    } else {
      this._hideMenu();

      if (config.activateTool) {
        this._deactivateValues();
        rootNode.querySelector('.toolbar-item-value').classList.add('active');
      }
    }
  }
}

export default Toolbar;