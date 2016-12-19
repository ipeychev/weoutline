import Draw from './draw';
import Shape from './shape';
import Utils from './utils';

class Whiteboard {
  constructor() {
    this._penSizeValueElement = document.getElementById('penSizeValue');
    this._penColorElement = document.getElementById('penColor');

    this._points = [];
    this._shapes = [];

    this._setupCanvas();
    this._setupContext();

    this._attachListeners();
  }

  _attachListeners() {
    if (Utils.isTouchDevice()) {
      this._canvasElement.addEventListener('touchstart', this._startDraw.bind(this), {passive: true});
      this._canvasElement.addEventListener('touchcancel', this._cancelDraw.bind(this), {passive: true});
      this._canvasElement.addEventListener('touchmove', this._draw.bind(this));
      this._canvasElement.addEventListener('touchend', this._finishDraw.bind(this), {passive: true});
    } else {
      this._canvasElement.addEventListener('mousedown', this._startDraw.bind(this));
      this._canvasElement.addEventListener('mouseup', this._finishDraw.bind(this));
      this._canvasElement.addEventListener('mousemove', this._draw.bind(this));
    }
  }

  _cancelDraw() {
    if (!this._isDrawing) {
      return;
    }

    this._points.length = 0;

    this._finishDraw(event);
  }

  _draw(event) {
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

      this._finishDraw(event);
      return;
    }

    event.preventDefault();

    let curPoint = this._getPointFromEvent(event);
    this._lastPoint = Draw.drawLineToMidPoint(this._lastPoint, curPoint, this._context, {
      color: this._penColorElement.value,
      size: this._penSizeValueElement.textContent
    });
    this._points.push(curPoint);
  }

  _finishDraw() {
    if (!this._isDrawing) {
      return;
    }

    this._isDrawing = false;

    // In case of draw canceling, there won't be any points
    // Creating a shape is not needed in this case
    if (this._points.length) {
      let shape = new Shape({
        color: this._penColorElement.value,
        points: this._points.slice(0),
        size: this._penSizeValueElement.textContent
      });

      this._shapes.push(shape);

      this._points.length = 0;
    }

    this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);

    for (var i = 0; i < this._shapes.length; i++) {
      Draw.drawLine(this._shapes[i].points, this._context, {
        color: this._shapes[i].color,
        size: this._shapes[i].size
      });
    }
  }

  _getPointFromEvent(event) {
    let point;

    if (event.touches) {
      let touches = event.touches[0];
      let rect = this._canvasElement.getBoundingClientRect();

      point = [touches.clientX - rect.left, touches.clientY - rect.top];
    } else {
      point = [event.offsetX, event.offsetY];
    }

    return point;
  }

  _setupCanvas() {
    this._canvasElement = document.getElementById('canvas');

    this._canvasElement.setAttribute('width', window.innerWidth);
    this._canvasElement.setAttribute('height', window.innerHeight);
  }

  _setupContext() {
    this._context = this._canvasElement.getContext('2d');

    this._context.lineJoin = this._context.lineCap = 'round';
    this._context.globalCompositeOperation = 'source-over';
  }

  _startDraw(event) {
    this._isDrawing = true;

    this._context.lineWidth = this._penSizeValueElement.textContent;
    this._context.strokeStyle = this._penColorElement.value;

    this._lastPoint = this._getPointFromEvent(event);

    this._points.push(this._lastPoint);
  }
};

export default Whiteboard;
