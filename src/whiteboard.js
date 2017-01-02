import { ShapeType } from './shape';
import Draw from './draw';
import Eraser from './eraser';
import DrawLine from './draw-line';
import Toolbar from './toolbar';
import { Tools } from './tools';
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

    this._setActiveTool();
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
          globalCompositeOperation: 'source-over',
          lineCap: 'round',
          lineJoin: 'round',
          size: this._shapes[i].size
        });
      }
    }
  }

  setConfig(config) {
    Object.assign(this._config, config);

    this._setActiveTool();
  }

  _attachListeners() {
    this._onTouchStartListener = this._onTouchStart.bind(this);
    this._onTouchMoveListener = this._onTouchMove.bind(this);
    this._onWheelListener = this._onScroll.bind(this);
    this._onContextMenuListener = function(e) { e.preventDefault(); };
    this._resizeListener = this._onResize.bind(this);
    this._onLoadListener = this._onLoad.bind(this);

    if (Utils.isTouchDevice()) {
      this._canvasElement.addEventListener('touchstart', this._onTouchStartListener);
      this._canvasElement.addEventListener('touchmove', this._onTouchMoveListener);
    } else {
      this._canvasElement.addEventListener('wheel', this._onWheelListener);
      this._canvasElement.addEventListener('contextmenu', this._onContextMenuListener);
    }

    window.addEventListener('load', this._onLoadListener, {
      once: true
    });
    window.addEventListener('orientationchange', this._resizeListener);
    window.addEventListener('resize', this._resizeListener);
  }

  _detachListeners() {
    this._canvasElement.removeEventListener('contextmenu', this._onContextMenuListener);
    this._canvasElement.removeEventListener('touchmove', this._onTouchMoveListener);
    this._canvasElement.removeEventListener('touchstart', this._onTouchStartListener);
    this._canvasElement.removeEventListener('wheel', this._onWheelListener);
    window.removeEventListener('load', this._onLoadListener);
    window.removeEventListener('orientationchange', this._resizeListener);
    window.removeEventListener('resize', this._resizeListener);
  }

  _getAllowedOffset(scrollData) {
    let tmpWidth = this._offset[0] + scrollData[0];
    let tmpHeight = this._offset[1] + scrollData[1];

    let allowedOffset = [];

    if (tmpWidth < 0) {
      allowedOffset[0] = 0;
    } else if (tmpWidth > this._config.width) {
      allowedOffset[0] = this._config.width - this._offset[0];
    } else {
      allowedOffset[0] = scrollData[0];
    }

    if (tmpHeight < 0) {
      allowedOffset[1] = 0;
    } else if (tmpHeight > this._config.height) {
      allowedOffset[1] = this._config.height - this._offset[1];
    } else {
      allowedOffset[1] = scrollData[1];
    }

    return allowedOffset;
  }

  _getToolSize() {
    let size;

    if (this._config.activeTool === Tools.line) {
      size = this._config.penSize;
    }

    return size;
  }

  _onLoad() {
    this._resizeCanvas();
  }

  _onResize() {
    let canvasContainerEl = this._canvasElement.parentNode;

    this._canvasElement.setAttribute('height', canvasContainerEl.offsetHeight);
    this._canvasElement.setAttribute('width', canvasContainerEl.offsetWidth);

    this.drawShapes();
  }

  _onScroll(event) {
    let allowedOffset;

    if (event.deltaMode === 0) {
      event.preventDefault();

      allowedOffset = this._getAllowedOffset([event.deltaX, event.deltaY]);

      this._offset[0] += allowedOffset[0];
      this._offset[1] += allowedOffset[1];

      this.drawShapes();
    } else if (event.touches.length > 1) {
      event.preventDefault();

      let curPoint = [event.touches[0].pageX, event.touches[0].pageY];

      allowedOffset = this._getAllowedOffset([
        (curPoint[0] - this._lastDragPoint[0]) * -1,
        (curPoint[1] - this._lastDragPoint[1]) * -1
      ]);

      this._offset[0] += allowedOffset[0];
      this._offset[1] += allowedOffset[1];

      this._lastDragPoint[0] = curPoint[0];
      this._lastDragPoint[1] = curPoint[1];

      this.drawShapes();
    }

    this._drawer.setConfig({
      offset: this._offset
    });
  }

  _onShapeCreatedCallback(shape) {
    // change points coordinates according to 0,0
    for (let i = 0; i < shape.points.length; i++) {
      let point = shape.points[i];
      point[0] += this._offset[0];
      point[1] += this._offset[1];
    }

    shape.id = Date.now().toString() + window.crypto.getRandomValues(new Uint32Array(1))[0];

    this._shapes.push(shape);

    this.drawShapes();
  }

  _onShapesErasedCallback(shapes) {
    for (let i = 0; i < shapes.length; i++) {
      let deletedShape = shapes[i];

      this._shapes = this._shapes.filter((oldShape) => {
        if (deletedShape.id === oldShape.id) {
          return false;
        }

        return true;
      });
    }

    this.drawShapes();

    this._drawer.setConfig({
      shapes: this._shapes
    });
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

  _setActiveTool() {
    if (this._drawer) {
      this._drawer.destroy();
    }

    if (this._config.activeTool === Tools.line) {
      this._drawer = new DrawLine({
        callback: this._onShapeCreatedCallback.bind(this),
        canvas: this._canvasElement,
        color: this._config.color,
        globalCompositeOperation: 'source-over',
        lineCap: 'round',
        lineJoin: 'round',
        offset: this._offset,
        size: this._getToolSize()
      });
    } else if (this._config.activeTool === Tools.eraser) {
      this._drawer = new Eraser({
        callback: this._onShapesErasedCallback.bind(this),
        canvas: this._canvasElement,
        offset: this._offset,
        shapes: this._shapes
      });
    }
  }

  _setupCanvas() {
    this._canvasElement = document.getElementById('canvas');
  }

  _setupContext() {
    this._context = this._canvasElement.getContext('2d');
  }

  _setupToolbar() {
    let config = {
      callback: this.setConfig.bind(this),
      srcNode: 'toolbar'
    };

    this._toolbar = new Toolbar(Object.assign(config, this._config));
  }
};

export default Whiteboard;