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

    this._setColor(this._config.color);
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._documentInteractionListener = this._onDocumentInteraction.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);

    if (Utils.isTouchDevice()) {
      this._element.addEventListener('touchend', this._touchEndListener, { passive: true });
      document.addEventListener('touchstart', this._documentInteractionListener);
    } else {
      this._element.addEventListener('click', this._clickListener);
      document.addEventListener('mousedown', this._documentInteractionListener);
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
    this._element.querySelectorAll('.toolbar-item-options').forEach((optionNode) => {
      optionNode.classList.add('hidden');
    });
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
          from: 'style',
          nodeSelector: '.fa',
          transformFn: Utils.rgbToHex,
          property: 'color'
        }
      });
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
    if (event.changedTouches.length === 1) {
      this._onClick(event);
    }
  }

  _setColor(value) {
    this._deactivateOptions(this._colorNode);

    this._colorNode.querySelectorAll('.toolbar-item-option .fa').forEach((optionNode) => {
      let style = window.getComputedStyle(optionNode);

      if (Utils.rgbToHex(style.getPropertyValue('color')) === value) {
        optionNode.parentNode.classList.add('active');

        this._setItemValue(optionNode.parentNode, this._colorNode, {
          setCurrentValue: {
            from: 'style',
            nodeSelector: '.fa',
            transformFn: Utils.rgbToHex,
            property: 'color'
          }
        });
      }
    });
  }

  _setItemValue(optionNode, rootNode, config) {
    if (config.setCurrentValue.from === 'style') {
      let style = window.getComputedStyle(optionNode.querySelector(config.setCurrentValue.nodeSelector));

      let value = config.setCurrentValue.transformFn ?  config.setCurrentValue.transformFn(style.getPropertyValue(config.setCurrentValue.property)) :
        style.getPropertyValue(config.setCurrentValue.property);

      rootNode.querySelector('.toolbar-item-value').querySelector(config.setCurrentValue.nodeSelector).style[config.setCurrentValue.property] = value;
    }
  }

  _setToolSize(rootNode, value) {
    this._deactivateOptions(rootNode);

    rootNode.querySelectorAll('.toolbar-item-option .fa').forEach((optionNode) => {
      let style = window.getComputedStyle(optionNode);

      if (parseInt(style.getPropertyValue('font-size'), 10) === value) {
        optionNode.parentNode.classList.add('active');
      }
    });
  }

  _setupContainer() {
    this._element = document.getElementById(this._config.srcNode);

    this._penNode = document.getElementById('pen');
    this._eraserNode = document.getElementById('eraser');
    this._colorNode = document.getElementById('color');
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