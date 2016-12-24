import { Tools } from './tools';
import Utils from './utils';

class Toolbar {
  constructor(config) {
    config = config || {};

    this._config = config;

    this._setupContainer()
    this.setValues(config);
    this._attachListeners();
  }

  destroy() {
    this._detachListeners();
  }

  getValues() {
    let values = {
      activeTool: this._getActiveTool(),
      color: this._getColor(),
      eraserSize: this._getEraserSize(),
      penSize: this._getPenSize()
    };

    return values;
  }

  setValues() {
    if (this._config.activeTool === Tools.line) {
      this._penNode.querySelector('.toolbar-item-value').classList.add('active');
    } else if (this._config.activeTool === Tools.eraser) {
      this._eraserNode.querySelector('.toolbar-item-value').classList.add('active');
    }

    this._setToolSize(this._penNode, this._config.penSize);
    this._setToolSize(this._eraserNode, this._config.eraserSize);

    this._setColor();
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._documentInteractionListener = this._onDocumentInteraction.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);
    this._colorNodeChangeListener = this._onColorChange.bind(this);

    if (Utils.isTouchDevice()) {
      this._element.addEventListener('touchend', this._touchEndListener);
      document.addEventListener('touchstart', this._documentInteractionListener);
      this._colorNode.addEventListener('change', this._colorNodeChangeListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
      document.addEventListener('mousedown', this._documentInteractionListener);
      this._colorNode.addEventListener('change', this._colorNodeChangeListener);
    }
  }

  _deactivateOptions(rootNode) {
    rootNode.querySelectorAll('.toolbar-item-option').forEach((valueNode) => {
      valueNode.classList.remove('active');
    });
  }

  _deactivateValues() {
    this._element.querySelectorAll('.toolbar-item-value').forEach((valueNode) => {
      valueNode.classList.remove('active');
    });
  }

  _detachListeners() {
    document.removeEventListener('mousedown', this._documentInteractionListener);
    document.removeEventListener('touchstart', this._documentInteractionListener);
    this._element.removeEventListener('click', this._clickListener);
    this._element.removeEventListener('touchend', this._touchEndListener);
    this._colorNode.removeEventListener('change', this._colorNodeChangeListener);
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
    return this._colorNode.value;
  }

  _getPenSize() {
    return this._getToolSize(this._penNode);
  }

  _getEraserSize() {
    return this._getToolSize(this._eraserNode);
  }

  _getToolSize(rootNode) {
    let node = rootNode.querySelector('.toolbar-item-option.active .fa');
    let style = window.getComputedStyle(node);

    return parseInt(style.getPropertyValue('font-size'), 10);
  }

  _hideMenu() {
    this._element.querySelectorAll('.toolbar-item-options').forEach((optionNode) => {
      optionNode.classList.add('hidden');
    });
  }

  _onClick(event) {
    let targetNode = event.target;

    if (this._penNode.contains(targetNode)) {
      this._updateToolbarView(this._penNode, targetNode);
    } else if (this._eraserNode.contains(targetNode)) {
      this._updateToolbarView(this._eraserNode, targetNode);
    } else {
      this._hideMenu();
    }

    let values = this.getValues();

    this._config.callback(values);
  }

  _onColorChange() {
    let values = this.getValues();

    this._config.callback(values);
  }

  _onDocumentInteraction(event) {
    if (!this._element.contains(event.target)) {
      this._hideMenu();
    }
  }

  _onTouchEnd(event) {
    if (event.touches.length === 1) {
      this._onClick(event);
    }
  }

  _setColor() {
    this._colorNode.value = this._config.color;
  }

  _setToolSize(rootNode, value) {
    this._deactivateOptions(rootNode);

    rootNode.querySelectorAll('.toolbar-item-option .fa').forEach((optionNode) => {
      let style = window.getComputedStyle(optionNode);

      if (parseInt(style.getPropertyValue('font-size'), 10) === value) {
        optionNode.parentNode.classList.add('active');
      }
    })
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._penNode = document.getElementById('pen');
    this._eraserNode = document.getElementById('eraser');
    this._colorNode = this._element.querySelector('#penColor');
  }

  _updateToolbarView(rootNode, targetNode) {
    let optionsNode = rootNode.querySelector('.toolbar-item-options');
    let isMenuShown = !optionsNode.classList.contains('hidden');

    this._hideMenu();
    this._deactivateValues();

    rootNode.querySelector('.toolbar-item-value').classList.add('active');

    if (optionsNode.contains(targetNode)) {
      this._deactivateOptions(rootNode);

      while (!targetNode.matches('.toolbar-item-option')) {
        targetNode = targetNode.parentNode;
      }

      targetNode.classList.add('active');
    } else if (!isMenuShown) {
      optionsNode.classList.remove('hidden');
    }
  }
}

export default Toolbar;