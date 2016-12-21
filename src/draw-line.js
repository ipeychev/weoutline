import Draw from './draw';
import { Shape, ShapeType }  from './shape';
import Utils from './utils';

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

    this.finishDraw(event);
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

      this.finishDraw(event);
      return;
    }

    event.preventDefault();

    let curPoint = Utils.getPointFromEvent(event, this._canvasElement);

    this._lastPoint = Draw.lineToMidPoint(this._lastPoint, curPoint, this._context, {
      color: this._config.color,
      size: this._config.size
    });

    this._points.push(curPoint);
  }

  finishDraw() {
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
        size: this._config.size,
        type: ShapeType.LINE
      });

      this._config.callback(shape);

      this._points.length = 0;
    }
  }

  setConfig(config) {
    this._config = config;
  }

  start(event) {
    this._isDrawing = true;

    this._context.lineWidth = this._config.size;
    this._context.strokeStyle = this._config.color;

    this._lastPoint = Utils.getPointFromEvent(event, this._canvasElement);

    this._points.push(this._lastPoint);
  }

  _attachListeners() {
    this._startListener = this.start.bind(this);
    this._cancelListener = this.cancel.bind(this);
    this._drawListener = this.draw.bind(this);
    this._finishDrawListener = this.finishDraw.bind(this);

    if (Utils.isTouchDevice()) {
      this._canvasElement.addEventListener('touchcancel', this._cancelListener, {passive: true});
      this._canvasElement.addEventListener('touchend', this._finishDrawListener, {passive: true});
      this._canvasElement.addEventListener('touchmove', this._drawListener);
      this._canvasElement.addEventListener('touchstart', this._startListener, {passive: true});
    } else {
      this._canvasElement.addEventListener('mousedown', this._startListener);
      this._canvasElement.addEventListener('mousemove', this._drawListener);
      this._canvasElement.addEventListener('mouseup', this._finishDrawListener);
    }
  }

  _detachListeners() {
    this._canvasElement.removeEventListener('mousedown', this._startListener);
    this._canvasElement.removeEventListener('mousemove', this._drawListener);
    this._canvasElement.removeEventListener('mouseup', this._finishDrawListener);
    this._canvasElement.removeEventListener('touchcancel', this._cancelListener);
    this._canvasElement.removeEventListener('touchend', this._finishDrawListener);
    this._canvasElement.removeEventListener('touchmove', this._drawListener);
    this._canvasElement.removeEventListener('touchstart', this._startListener);
  }

  _setupCanvas() {
    this._canvasElement = this._config.canvas;
  }

  _setupContext() {
    this._context = this._canvasElement.getContext('2d');

    this._context.lineJoin = this._context.lineCap = 'round';
    this._context.globalCompositeOperation = 'source-over';
  }
}

export default DrawLine;