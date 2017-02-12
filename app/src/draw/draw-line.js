import BrowserHelper from '../helpers/browser-helper';
import Draw from './draw';
import DrawHelper from '../helpers/draw-helper';
import { Shape, ShapeType }  from './shape';

class DrawLine {
  constructor(config) {
    this._config = config;

    this._points = [];

    this._setupCanvas();
    this._setupContext();

    this._attachListeners();
  }

  cancel() {
    if (!this._isDrawing) {
      return;
    }

    this._points.length = 0;

    this.finish(event);
  }

  destroy() {
    this._detachListeners();
  }

  draw(event) {
    if (!this._isDrawing) {
      return;
    }

    if (event.touches && event.touches.length > 1) {
      // Less or equal to two points into the points array from
      // the start event and two fingers now means that the user
      // meant to scroll
      // in this case we won't draw anything
      if (this._points.length <= 2) {
        this._points.length = 0;
      }

      this.finish(event);
      return;
    }

    event.preventDefault();

    let curPoint = DrawHelper.getPointFromEvent(event, this._canvasElement);
    // set the point to the unscaled X and Y
    curPoint[0] = curPoint[0] / this._config.scale + this._config.origin[0];
    curPoint[1] = curPoint[1] / this._config.scale + this._config.origin[1];

    if (this._config.minPointDistance > 0) {
      let distance = Math.sqrt((this._lastPoint[0] - curPoint[0]) * (this._lastPoint[0] - curPoint[0]) +
        (this._lastPoint[1] - curPoint[1]) * (this._lastPoint[1] - curPoint[1]));

      if (distance < this._config.minPointDistance) {
        return;
      }
    }

    let tmpX = this._lastPoint[0] + this._config.offset[0];
    let tmpY = this._lastPoint[1] + this._config.offset[1];

    if (tmpX > 0 && tmpX < this._config.boardSize[0] && tmpY > 0 && tmpY < this._config.boardSize[1]) {
      this._lastPoint = Draw.lineToMidPoint(this._lastPoint, curPoint, this._context, {
        color: this._config.color,
        globalCompositeOperation: this._config.globalCompositeOperation,
        lineCap: this._config.lineCap,
        lineJoin: this._config.lineJoin,
        lineWidth: DrawHelper.getPixelScaledNumber(this._config.lineWidth)
      });

      this._points.push(curPoint);
    } else {
      this.finish(event);
      return;
    }
  }

  finish() {
    if (!this._isDrawing) {
      return;
    }

    this._isDrawing = false;

    // In case of draw canceling, there won't be any points
    // Creating a shape is not needed in this case
    if (this._points.length) {
      let shape = new Shape({
        color: this._config.color,
        points: this._points.slice(0),
        lineWidth: this._config.lineWidth,
        type: ShapeType.LINE
      });

      this._config.callback(shape);

      this._points.length = 0;
    }
  }

  setConfig(config) {
    this._config = Object.assign(this._config, config);
  }

  start(event) {
    this._lastPoint = DrawHelper.getPointFromEvent(event, this._canvasElement);

    // set the point to the unscaled X and Y
    this._lastPoint[0] = this._lastPoint[0] / this._config.scale + this._config.origin[0];
    this._lastPoint[1] = this._lastPoint[1] / this._config.scale + this._config.origin[1];

    let tmpX = this._lastPoint[0] + this._config.offset[0];
    let tmpY = this._lastPoint[1] + this._config.offset[1];

    if (tmpX > 0 && tmpX < this._config.boardSize[0] && tmpY > 0 && tmpY < this._config.boardSize[1]) {
      this._context.lineWidth = DrawHelper.getPixelScaledNumber(this._config.lineWidth);
      this._context.strokeStyle = this._config.color;

      this._points.push(this._lastPoint);

      this._isDrawing = true;
    }
  }

  _attachListeners() {
    this._startListener = this.start.bind(this);
    this._cancelListener = this.cancel.bind(this);
    this._drawListener = this.draw.bind(this);
    this._finishListener = this.finish.bind(this);

    if (BrowserHelper.isTouchDevice()) {
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

  _detachListeners() {
    this._canvasElement.removeEventListener('mousedown', this._startListener);
    this._canvasElement.removeEventListener('mousemove', this._drawListener);
    this._canvasElement.removeEventListener('mouseup', this._finishListener);
    this._canvasElement.removeEventListener('touchcancel', this._cancelListener, {passive: true});
    this._canvasElement.removeEventListener('touchend', this._finishListener, {passive: true});
    this._canvasElement.removeEventListener('touchmove', this._drawListener);
    this._canvasElement.removeEventListener('touchstart', this._startListener, {passive: true});
  }

  _setupCanvas() {
    this._canvasElement = this._config.canvas;
  }

  _setupContext() {
    this._context = this._canvasElement.getContext('2d');
  }
}

export default DrawLine;