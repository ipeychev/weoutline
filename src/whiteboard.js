import { Shape, ShapeType } from './shape';
import Draw from './draw';
import DrawLine from './draw-line';
import Utils from './utils';

const MODE = {
  ellipse: 1,
  eraser: 2,
  line: 3,
  polygon: 4
};

class Whiteboard {
  constructor() {
    this._penSizeValueElement = document.getElementById('penSizeValue');
    this._penColorElement = document.getElementById('penColor');

    this._shapes = [];
    this._offset = [0, 0];

    this._setupCanvas();
    this._setupContext();

    this._attachListeners();

    this._setMode(MODE.line);
  }

  _attachListeners() {
    if (Utils.isTouchDevice()) {
      this._canvasElement.addEventListener('touchmove', this._onTouchMove.bind(this));
    } else {
      this._canvasElement.addEventListener('wheel', this._onScroll.bind(this));
      this._canvasElement.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    }

    window.addEventListener('resize', this._onBrowserResize.bind(this));
  }

  _drawShapes() {
    this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);

    for (let i = 0; i < this._shapes.length; i++) {
      if (this._shapes[i].type === ShapeType.LINE) {
        let points = this._shapes[i].points.map((point) => {
          return Utils.getPointWithOffset(point, this._offset);
        });

        Draw.line(points, this._context, {
          color: this._shapes[i].color,
          size: this._shapes[i].size
        });
      }
    }
  }

  _onBrowserResize() {
    let canvasContainerEl = this._canvasElement.parentNode;

    this._canvasElement.setAttribute('height', canvasContainerEl.offsetHeight);
    this._canvasElement.setAttribute('width', canvasContainerEl.offsetWidth);

    this._drawShapes();
  }

  _onScroll(event) {
    if (event.deltaMode === 0) {
      this._offset[0] += event.deltaX;
      this._offset[1] += event.deltaY;

      console.log('DELTA', [event.deltaX, event.deltaY]);
      console.log('OFFSET', [this._offset[0], this._offset[1]]);

      this._drawShapes();

      event.preventDefault();
    }
  }

  _onShapeCreatedCallback(shape) {
    // change points coordinates according to 0,0
    for (let i = 0; i < shape.points.length; i++) {
      let point = shape.points[i];

      console.log('OLD POINT', point);
      point[0] += this._offset[0];
      point[1] += this._offset[1];
      console.log('NEW POINT', point);
    }

    this._shapes.push(shape);

    this._drawShapes();
  }

  _onTouchMove(event) {
    if (event.touches.length > 1) {
      this._onScroll(event);
    }
  }

  _resizeCanvas() {
    let canvasContainerEl = this._canvasElement.parentNode;

    this._canvasElement.setAttribute('height', canvasContainerEl.offsetHeight);
    this._canvasElement.setAttribute('width', canvasContainerEl.offsetWidth);
  }

  _setMode(mode) {
    if (mode === MODE.line) {
      this._mode = mode;

      this._drawer = new DrawLine({
        callback: this._onShapeCreatedCallback.bind(this),
        canvas: this._canvasElement,
        color: this._penColorElement.value,
        size: this._penSizeValueElement.textContent
      });
    }
  }

  _setupCanvas() {
    this._canvasElement = document.getElementById('canvas');

    this._resizeCanvas();
  }

  _setupContext() {
    this._context = this._canvasElement.getContext('2d');
  }
};

export default Whiteboard;