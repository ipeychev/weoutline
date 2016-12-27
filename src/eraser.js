import Utils from './utils';

class Eraser {
  constructor(config) {
    this._config = config;

    this._setupCanvas();
    this._setupContext();

    this._attachListeners();
  }

  cancel() {
    if (!this._isErasing) {
      return;
    }

    this._isErasing = false;
  }

  destroy() {
    this._detachListeners();
  }

  draw(event) {
    if (!this._isErasing) {
      return;
    }

    if (event.touches && event.touches.length > 1) {
      this._isErasing = false;
      return;
    }

    event.preventDefault();

    let curPoint = Utils.getPointFromEvent(event, this._canvasElement);

    let matchingShapes = this._getMatchingShapes(curPoint);

    if (matchingShapes.length) {
      this._config.callback(matchingShapes);
    }
  }

  finish() {
    if (!this._isErasing) {
      return;
    }

    this._isErasing = false;
  }

  setConfig(config) {
    this._config = Object.assign(this._config, config);
  }

  start(event) {
    this._isErasing = true;

    this._lastPoint = Utils.getPointFromEvent(event, this._canvasElement);
  }

  _attachListeners() {
    this._startListener = this.start.bind(this);
    this._cancelListener = this.cancel.bind(this);
    this._drawListener = this.draw.bind(this);
    this._finishListener = this.finish.bind(this);

    if (Utils.isTouchDevice()) {
      this._canvasElement.addEventListener('touchcancel', this._cancelListener, {passive: true});
      this._canvasElement.addEventListener('touchend', this._finishListener, {passive: true});
      this._canvasElement.addEventListener('touchmove', this._drawListener);
      this._canvasElement.addEventListener('touchstart', this._startListener, {passive: true});
    } else {
      this._canvasElement.addEventListener('mousedown', this._startListener);
      this._canvasElement.addEventListener('mousemove', this._drawListener);
      this._canvasElement.addEventListener('mouseup', this._finishListener);
    }
  }

  _checkShapeMatching(curPoint, shape) {
    let points = shape.points;

    for (let i = 0, j = 1; i < points.length; i++, j++) {
      let point1 = points[i];
      let point2 = points[j];

      if (!point2) {
        point2 = point1;
      }

      let res;

      let dxc = curPoint[0] - point1[0];
      let dyc = curPoint[1] - point1[1];

      let dxl = point2[0] - point1[0];
      let dyl = point2[1] - point1[1];

      let cross = dxc * dyl - dyc * dxl;


      res = Math.abs(cross) <= 0.5;

      if (!res) {
        continue;
      }

      console.log(Math.abs(cross));
      if (Math.abs(dxl) >= Math.abs(dyl)) {
        res = dxl > 0 ?
          point1[0] <= curPoint[0] && curPoint[0] <= point2[0] :
          point2[0] <= curPoint[0] && curPoint[0] <= point1[0];
      }
      else {
        res = dyl > 0 ?
          point1[1] <= curPoint[1] && curPoint[1] <= point2[1] :
          point2[1] <= curPoint[1] && curPoint[1] <= point1[1];
      }

      if (res) {
        return true;
      }
    }
  }

  _detachListeners() {
    this._canvasElement.removeEventListener('mousedown', this._startListener);
    this._canvasElement.removeEventListener('mousemove', this._drawListener);
    this._canvasElement.removeEventListener('mouseup', this._finishListener);
    this._canvasElement.removeEventListener('touchcancel', this._cancelListener);
    this._canvasElement.removeEventListener('touchend', this._finishListener);
    this._canvasElement.removeEventListener('touchmove', this._drawListener);
    this._canvasElement.removeEventListener('touchstart', this._startListener);
  }

  _getMatchingShapes(curPoint) {
    let matchingShapes = [];

    for (let i = 0; i < this._config.shapes.length; i++) {
      let matchedShape = this._checkShapeMatching(curPoint, this._config.shapes[i]);

      if (matchedShape) {
        matchingShapes.push(this._config.shapes[i]);
      }
    }

    return matchingShapes;
  }

  _setupCanvas() {
    this._canvasElement = this._config.canvas;
  }

  _setupContext() {
    this._context = this._canvasElement.getContext('2d');
  }
}

export default Eraser;