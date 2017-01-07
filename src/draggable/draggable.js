import Utils from '../utils/utils';

class Draggable {
  constructor(element) {
    if (typeof element === 'string') {
      this._dragElement = document.querySelector(element);
    } else {
      this._dragElement = element;
    }

    this._dragElement.setAttribute('draggable', 'true');

    this._dragOverListener = this._onDragOver.bind(this);
    this._dragStartListener = this._onDragStart.bind(this);
    this._dropListener = this._onDrop.bind(this);
    this._touchMoveListener = this._onTouchMove.bind(this);
    this._touchStartListener = this._onTouchStart.bind(this);

    if (Utils.isTouchDevice()) {
      this._dragElement.addEventListener('touchstart', this._touchStartListener, {passive: true});
      this._dragElement.addEventListener('touchmove', this._touchMoveListener);
    } else {
      this._dragElement.addEventListener('dragstart', this._dragStartListener);
      document.body.addEventListener('dragover', this._dragOverListener);
      document.body.addEventListener('drop', this._dropListener);
    }
  }

  destroy() {
    document.body.removeEventListener('dragover', this._dragOverListener);
    document.body.removeEventListener('drop', this._dropListener);
    this._dragElement.removeEventListener('dragstart', this._dragStartListener);
    this._dragElement.removeEventListener('touchmove', this._touchMoveListener);
    this._dragElement.removeEventListener('touchstart', this._touchStartListener);
  }

  _onDragStart(event) {
      let style = window.getComputedStyle(event.target);

      event.dataTransfer.setData('text/plain',
        (parseInt(style.getPropertyValue('left'), 10) - event.clientX) + ',' +
        (parseInt(style.getPropertyValue('top'), 10) - event.clientY));
  }

  _onDragOver(event) {
      event.preventDefault();
      return false;
  }

  _onDrop(event) {
      let offset = event.dataTransfer.getData('text/plain').split(',');

      this._dragElement.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
      this._dragElement.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
      event.preventDefault();
      return false;
  }

  _onTouchMove(event) {
    if (event.targetTouches.length === 1) {
      event.preventDefault();

      let touch = event.targetTouches[0];

      this._dragElement.style.left = touch.pageX - this._elementWidth + this._startOffsetX + 'px';
      this._dragElement.style.top = touch.pageY - this._elementHeight + this._startOffsetY + 'px';
    }
  }

  _onTouchStart(event) {
    if (event.targetTouches.length === 1) {
      let touch = event.targetTouches[0];

      let style = window.getComputedStyle(event.target);

      let elementLeft = parseInt(style.getPropertyValue('left'), 10);
      let elementTop = parseInt(style.getPropertyValue('top'), 10);
      this._elementWidth = parseInt(style.getPropertyValue('width'), 10);
      this._elementHeight = parseInt(style.getPropertyValue('height'), 10);

      this._startOffsetX = (elementLeft + this._elementWidth - touch.pageX);
      this._startOffsetY = (elementTop + this._elementHeight - touch.pageY);
    }
  }
}

export default Draggable;