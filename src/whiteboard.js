import { ShapeType } from './shape';
import Draw from './draw';
import DrawLine from './draw-line';
import Toolbar from './toolbar';
import { Mode } from './mode';
import Utils from './utils';

class Whiteboard {
  constructor(config) {
    config = config || {};

    this._config = config;

    this._shapes = config.shapes || [];
    this._offset = config.offset || [0, 0];

    this._setupCanvas();
    this._setupContext();
    this._setupToolbar();

    this._attachListeners();

    this._setMode(config.mode || Mode.line);
  }

  destroy() {
    this._detachListeners();
  }

  drawShapes() {
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

  setConfig(config) {
    this._config = config;
  }

  _attachListeners() {
    this._onTouchStartListener = this._onTouchStart.bind(this);
    this._onTouchMoveListener = this._onTouchMove.bind(this);
    this._onWheelListener = this._onScroll.bind(this);
    this._onContextMenuListener = function(e) { e.preventDefault(); };

    if (Utils.isTouchDevice()) {
      this._canvasElement.addEventListener('touchstart', this._onTouchStartListener);
      this._canvasElement.addEventListener('touchmove', this._onTouchMoveListener);
    } else {
      this._canvasElement.addEventListener('wheel', this._onWheelListener);
      this._canvasElement.addEventListener('contextmenu', this._onContextMenuListener);
    }

    window.addEventListener('resize', this._onBrowserResize.bind(this));
  }

  _detachListeners() {
    this._canvasElement.removeEventListener('touchstart', this._onTouchStartListener);
    this._canvasElement.removeEventListener('touchmove', this._onTouchMoveListener);
    this._canvasElement.removeEventListener('wheel', this._onWheelListener);
    this._canvasElement.removeEventListener('contextmenu', this._onContextMenuListener);
  }

  _onBrowserResize() {
    let canvasContainerEl = this._canvasElement.parentNode;

    this._canvasElement.setAttribute('height', canvasContainerEl.offsetHeight);
    this._canvasElement.setAttribute('width', canvasContainerEl.offsetWidth);

    this.drawShapes();
  }

  _onScroll(event) {
    if (event.deltaMode === 0) {
      event.preventDefault();

      this._offset[0] += event.deltaX;
      this._offset[1] += event.deltaY;

      this.drawShapes();
    } else if (event.touches.length > 1) {
      event.preventDefault();

      let curPoint = [event.touches[0].pageX, event.touches[0].pageY];

      this._offset[0] += (curPoint[0] - this._lastDragPoint[0]) * -1;
      this._offset[1] += (curPoint[1] - this._lastDragPoint[1]) * -1;

      this._lastDragPoint[0] = curPoint[0];
      this._lastDragPoint[1] = curPoint[1];

      this.drawShapes();
    }
  }

  _onShapeCreatedCallback(shape) {
    // change points coordinates according to 0,0
    for (let i = 0; i < shape.points.length; i++) {
      let point = shape.points[i];
      point[0] += this._offset[0];
      point[1] += this._offset[1];
    }

    this._shapes.push(shape);

    this.drawShapes();
  }

  _onTouchMove(event) {
    if (event.touches.length > 1) {
      this._onScroll(event);
    }
  }

  _onTouchStart(event) {
    if (event.touches.length > 1) {
      this._lastDragPoint = [event.touches[0].pageX, event.touches[0].pageY];
    }
  }

  _resizeCanvas() {
    let canvasContainerEl = this._canvasElement.parentNode;

    this._canvasElement.setAttribute('height', canvasContainerEl.offsetHeight);
    this._canvasElement.setAttribute('width', canvasContainerEl.offsetWidth);
  }

  _setMode(mode) {
    if (mode === Mode.line) {
      this._mode = mode;

      this._drawer = new DrawLine({
        callback: this._onShapeCreatedCallback.bind(this),
        canvas: this._canvasElement,
        color: '#000000',
        size: 4
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

  _setupToolbar() {
    this._toolbar = new Toolbar({
      callback: this.setConfig.bind(this),
      srcNode: 'toolbar'
    });
  }
};

export default Whiteboard;