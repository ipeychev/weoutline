import { Mode } from './mode';
import Utils from './utils';

class Toolbar {
  constructor(config) {
    config = config || {};

    this._config = config;

    this.setValues(config);

    this._setupContainer()
    this._attachListeners();
  }

  destroy() {
    this._detachListeners();
  }

  getValues() {
    let values = {
      color: this._getColor(),
      eraserSize: this._getEraserSize(),
      penSize: this._getPenSize(),
      tool: this._getActiveTool()
    };

    return values;
  }

  setValues(values) {

  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (Utils.isTouchDevice()) {
      this._element.addEventListener('touchend', this._touchEndListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
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
    this._element.addEventListener('touchend', this._touchEndListener);
    this._element.addEventListener('click', this._clickListener);
  }

  _getActiveTool() {
    let activeNode = this._element.querySelector('.toolbar-item-value.active').parentNode;

    if (activeNode === this._penNode) {
      return Mode.line;
    } else if (activeNode === this._eraserNode) {
      return Mode.eraser;
    }
  }

  _getColor() {
    return this._element.querySelector('#penColor').value;
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

  _onTouchEnd(event) {
    if (event.touches.length === 1) {
      this._onClick(event);
    }
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._penNode = document.getElementById('pen');
    this._eraserNode = document.getElementById('eraser');
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