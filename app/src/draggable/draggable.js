import Utils from '../utils/utils';

class Draggable {
  constructor(target) {
    if (typeof target === 'string') {
      this._dragElement = document.querySelector(target);
    } else {
      this._dragElement = target;
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
    this._dragElement.removeEventListener('touchstart', this._touchStartListener, {passive: true});
  }

  _onDragStart(event) {
      let targetRect = event.target.getBoundingClientRect();

      this._draggedElement = event.target;

      event.dataTransfer.setData('text/plain',
        (targetRect.left - event.clientX) + ',' +
        (targetRect.top - event.clientY));

      event.dataTransfer.effectAllowed = 'move';
  }

  _onDragOver(event) {
      event.dataTransfer.dropEffect = 'move';
      event.preventDefault();
      return false;
  }

  _onDrop(event) {
    if (this._dragElement !== this._draggedElement) {
      return;
    }

    this._draggedElement = null;

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

      let targetRect = event.target.getBoundingClientRect();

      this._elementHeight = targetRect.height;
      this._elementWidth = targetRect.width;

      this._startOffsetX = (targetRect.left + this._elementWidth - touch.pageX);
      this._startOffsetY = (targetRect.top + this._elementHeight - touch.pageY);
    }
  }
}

export default Draggable;