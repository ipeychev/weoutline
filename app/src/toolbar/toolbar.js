import BrowserHelper from '../helpers/browser-helper';

class Toolbar {
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

  _hideMenu() {
    let nodes = this._element.querySelectorAll('.toolbar-item-options');

    for (let i = 0; nodes && i < nodes.length; i++) {
      nodes.item(i).classList.add('hidden');
    }
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

  _positionToolbar() {
    let bodyBoundingRect = document.body.getBoundingClientRect();

    if (bodyBoundingRect.width > bodyBoundingRect.height) {
      this._element.classList.remove('vertical');
    } else {
      this._element.classList.add('vertical');
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

  _updateToolbarView(rootNode, targetNode, config) {
    let menuNode = rootNode.querySelector('.toolbar-item-options');

    // there is a menu, process the menu items
    if (menuNode) {
      // user clicked on the menu itself, ignore this
      if (menuNode === targetNode) {
        return;
      }

      // user clicked on a main item (tool)
      if (!menuNode.contains(targetNode)) {
        let isMenuShown = !menuNode.classList.contains('hidden');

        this._hideMenu();
        if (!isMenuShown) {
          menuNode.classList.remove('hidden');
        }

        // the main item (tool) should be activated, deactivate the others, activate current one
        if (config.activateValueItem) {
          this._deactivateValues();
          rootNode.querySelector('.toolbar-item-value').classList.add('active');
        }
      } else {
        // user clicked on an item inside the menu, get the option and hide the menu
        if (config.activateValueItem) {
          this._deactivateValues();
          rootNode.querySelector('.toolbar-item-value').classList.add('active');
        }

        this._deactivateOptions(rootNode);

        let matches = BrowserHelper.getNodeMatches(targetNode);

        while (!matches.call(targetNode, '.toolbar-item-option')) {
          targetNode = targetNode.parentNode;
        }

        if (config.activateMenuItem) {
          targetNode.classList.add('active');
        }

        if (config.setCurrentValue) {
          this._setItemValue(targetNode, rootNode, config);
        }

        this._hideMenu();
      }
    } else {
      // user clicked on main item (tool) without a menu, hide other item menus
      // and activate the current menu
      this._hideMenu();

      if (config.activateValueItem) {
        this._deactivateValues();
        rootNode.querySelector('.toolbar-item-value').classList.add('active');
      }
    }
  }
}

export default Toolbar;