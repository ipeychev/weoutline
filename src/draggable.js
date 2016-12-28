class Draggable {
  constructor(element) {
    if (typeof element === 'string') {
      this._dragElement = document.querySelector(element);
    } else {
      this._dragElement = element;
    }

    this._dragElement.setAttribute('draggable', 'true');

    this._dragStartListener = this._onDragStart.bind(this);
    this._dragOverListener = this._onDragOver.bind(this);
    this._dropListener = this._onDrop.bind(this);

    this._dragElement.addEventListener('dragstart', this._dragStartListener);
    document.body.addEventListener('dragover', this._dragOverListener);
    document.body.addEventListener('drop', this._dropListener);
  }

  destroy() {
    this._dragElement.removeEventListener('dragstart', this._dragStartListener);
    document.body.removeEventListener('dragover', this._dragOverListener);
    document.body.removeEventListener('drop', this._dropListener);
  }

  _onDragStart(event) {
      let style = window.getComputedStyle(event.target, null);
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

      this._dragElement.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
      this._dragElement.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
      event.preventDefault();
      return false;
  }
}

export default Draggable;