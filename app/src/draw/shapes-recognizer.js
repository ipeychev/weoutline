import Utils from '../utils/utils';

class ShapesRecognizer {
  constructor(config) {
    this._config = config;

    let shapesContainerElement = document.getElementById(config.srcNode);
    this._shapesListElement = shapesContainerElement.querySelector('#shapesList');
    this._shapesInputElement = shapesContainerElement.querySelector('#shapesInput');
    this._addShapeElement = shapesContainerElement.querySelector('#add');
    this._outputElement = shapesContainerElement.querySelector('#output');

    this._recognizer = new DollarRecognizer();

    this._drawShapesList();

    this._attachListeners();
  }

  destroy() {
    this._detachListeners();
  }

  recognize(points) {
    this._lastShapePoints = points.map((point) => {return {X: point[0], Y: point[1]};});

    return this._recognizer.Recognize(this._lastShapePoints);
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._touchendListener = this._onClick.bind(this);

    if (Utils.isTouchDevice()) {
      this._addShapeElement.addEventListener('touchend', this._touchendListener);
    } else {
      this._addShapeElement.addEventListener('click', this._clickListener);
    }
  }

  _detachListeners() {
    this._addShapeElement.removeEventListener('touchend', this._touchendListener);
    this._addShapeElement.removeEventListener('click', this._clickListener);
  }

  _drawShapesList() {
    this._shapesListElement.innerHTML = '';

    let shapesList = this._recognizer.Unistrokes.sort((a, b) => {
      if (a.Name < b.Name) {
        return -1;
      } else if (a.Name > b.Name) {
        return 1;
      } else {
        return 0;
      }
    });

    for (let i = 0; i < shapesList.length; i++) {
      let shapeElement = document.createElement('option');
      shapeElement.setAttribute('value', shapesList[i].Name);

      this._shapesListElement.appendChild(shapeElement);
    }
  }

  _onClick() {
    let targetShapeName = this._shapesInputElement.value;

    if (targetShapeName) {
      let res = this._recognizer.AddGesture(targetShapeName, this._lastShapePoints);

      this._outputElement.innerHTML = targetShapeName + ' added. Shape points list: ' + res;

      if (!this._shapesListElement.querySelector('option[value=' + targetShapeName + ']')) {
        this._drawShapesList();
      }
    }
  }
}

export default ShapesRecognizer;