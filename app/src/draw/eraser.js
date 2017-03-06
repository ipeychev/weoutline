import BrowserHelper from '../helpers/browser-helper';
import DrawHelper from '../helpers/draw-helper';

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

  erase(event) {
    if (!this._isErasing) {
      return;
    }

    if (event.touches && event.touches.length > 1) {
      this.finish();
      return;
    }

    event.preventDefault();

    let curPoint = DrawHelper.getPointFromEvent(event, this._canvasElement);

    let state = this._config.stateHolder.getState();

    // set the point to the unscaled X and Y
    curPoint[0] = curPoint[0] / state.scale;
    curPoint[1] = curPoint[1] / state.scale;

    let tmpX = curPoint[0] + state.offset[0];
    let tmpY = curPoint[1] + state.offset[1];

    if (tmpX > 0 && tmpX < this._config.boardSize[0] && tmpY > 0 && tmpY < this._config.boardSize[1]) {
      curPoint = DrawHelper.getPointWithoutOffset(curPoint, state.offset);

      let matchingShapes = this._getMatchingShapes(curPoint);

      if (matchingShapes.length) {
        this._config.callback(matchingShapes);
      }
    } else {
      this.finish();
      return;
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
    this._canvasSize = {
      height: this._canvasElement.height,
      width: this._canvasElement.width
    };

    let curPoint = DrawHelper.getPointFromEvent(event, this._canvasElement);

    let state = this._config.stateHolder.getState();

    // set the point to the unscaled X and Y
    curPoint[0] = curPoint[0] / state.scale;
    curPoint[1] = curPoint[1] / state.scale;

    let tmpX = curPoint[0] + state.offset[0];
    let tmpY = curPoint[1] + state.offset[1];

    if (tmpX > 0 && tmpX < this._config.boardSize[0] && tmpY > 0 && tmpY < this._config.boardSize[1]) {
      curPoint = DrawHelper.getPointWithoutOffset(curPoint, state.offset);

      let matchingShapes = this._getMatchingShapes(curPoint);

      if (matchingShapes.length) {
        this._config.callback(matchingShapes);
      }

      this._isErasing = true;
    }
  }

  _attachListeners() {
    this._cancelListener = this.cancel.bind(this);
    this._eraseListener = this.erase.bind(this);
    this._finishListener = this.finish.bind(this);
    this._startListener = this.start.bind(this);

    if (BrowserHelper.getTouchEventsSupport()) {
      this._canvasElement.addEventListener('touchcancel', this._cancelListener, {passive: true});
      this._canvasElement.addEventListener('touchend', this._finishListener, {passive: true});
      this._canvasElement.addEventListener('touchmove', this._eraseListener);
      this._canvasElement.addEventListener('touchstart', this._startListener, {passive: true});
    } else {
      this._canvasElement.addEventListener('mousedown', this._startListener);
      this._canvasElement.addEventListener('mousemove', this._eraseListener);
      this._canvasElement.addEventListener('mouseup', this._finishListener);
    }
  }

  _checkShapeMatching(curPoint, shape) {
    let points = shape.points;

    let p1 = [curPoint[0] - 10, curPoint[1]];
    let p2 = [curPoint[0] + 10, curPoint[1]];
    let p3 = [curPoint[0], curPoint[1] - 10];
    let p4 = [curPoint[0], curPoint[1] + 10];
    let point1;
    let point2;

    let i = 0, j = 1;

    do {
      if (points.length === 1) {
        point1 = [points[0][0] - 5, points[0][1] - 5];
        point2 = [points[0][0] + 5, points[0][1] + 5];
      } else {
        point1 = points[i];
        point2 = points[j];
      }

      let intersection = this._isIntersecting(p1, p2, point1, point2);

      if (!intersection) {
        intersection = this._isIntersecting(p3, p4, point1, point2);
      }

      if (intersection) {
        return true;
      }

      i++, j++;
    } while (i < points.length - 1);

    return false;
  }

  _counterClockwise(p1, p2, p3) {
    return (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0]);
  }

  _detachListeners() {
    this._canvasElement.removeEventListener('mousedown', this._startListener);
    this._canvasElement.removeEventListener('mousemove', this._eraseListener);
    this._canvasElement.removeEventListener('mouseup', this._finishListener);
    this._canvasElement.removeEventListener('touchcancel', this._cancelListener, {passive: true});
    this._canvasElement.removeEventListener('touchend', this._finishListener, {passive: true});
    this._canvasElement.removeEventListener('touchmove', this._eraseListener);
    this._canvasElement.removeEventListener('touchstart', this._startListener, {passive: true});
  }

  _getMatchingShapes(curPoint) {
    let matchingShapes = [];

    let state = this._config.stateHolder.getState();

    for (let i = 0; i < state.shapes.length; i++) {
      if (DrawHelper.checkPointsInViewport(state.shapes[i].points, state.offset, state.scale, this._canvasSize)) {
        let matchedShape = this._checkShapeMatching(curPoint, state.shapes[i]);

        if (matchedShape) {
          matchingShapes.push(state.shapes[i]);
        }
      }
    }

    return matchingShapes;
  }

  _isIntersecting(p1, p2, p3, p4) {
    return (this._counterClockwise(p1, p3, p4) !== this._counterClockwise(p2, p3, p4)) &&
      (this._counterClockwise(p1, p2, p3) != this._counterClockwise(p1, p2, p4));
  }

  _setupCanvas() {
    this._canvasElement = this._config.canvas;
  }

  _setupContext() {
    this._context = this._canvasElement.getContext('2d');
  }
}

export default Eraser;