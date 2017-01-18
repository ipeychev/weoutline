const simplify = require('simplify-path');
import { ShapeType } from '../draw/shape';
import Draggable from '../draggable/draggable';
import Draw from '../draw/draw';
import Utils from '../utils/utils';

class Map {
  constructor(config) {
    if (typeof config.srcNode === 'string') {
      this._mapElement = document.querySelector(config.srcNode);
    } else {
      this._mapElement = config.srcNode;
    }

    let container;

    if (typeof config.container === 'string') {
      container = document.querySelector(config.container);
    } else {
      container = config.container;
    }

    this._mapContext = this._mapElement.getContext('2d');

    this._draggable = new Draggable(container);

    this._attachListeners();

    this._config = config;
  }

  destroy() {
    this._detachListeners();

    this._draggable.destroy();
  }

  draw(shapes, offset, srcCanvasSize) {
    this._mapContext.clearRect(0, 0, this._mapContext.canvas.width, this._mapContext.canvas.height);

    let ratioX = this._config.width / this._mapElement.width;
    let ratioY = this._config.height / this._mapElement.height;

    this._mapContext.strokeStyle = this._config.color;
    this._mapContext.lineWidth = this._config.lineWidth;
    this._mapContext.strokeRect(
      offset[0] / ratioX,
      offset[1] / ratioY,
      srcCanvasSize.width / ratioX,
      srcCanvasSize.height / ratioY
    );

    for (let i = 0; i < shapes.length; i++) {
      if (shapes[i].type === ShapeType.LINE) {
        let points = simplify(shapes[i].points, 10);

        points = points.map((point) => {
          return [point[0] / ratioX, point[1] / ratioY];
        });

        Draw.line(points, this._mapContext, {
          color: shapes[i].color,
          globalCompositeOperation: 'source-over',
          lineCap: 'round',
          lineJoin: 'round',
          lineWidth: Math.round(Utils.getPixelScaledNumber(shapes[i].lineWidth) / 4)
        });
      }
    }
  }

  _attachListeners() {
    this._clickListener = this._onClick.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);
    this._touchMoveListener = this._onTouchMove.bind(this);
    this._touchStartListener = this._onTouchStart.bind(this);

    if (Utils.isTouchDevice()) {
      this._mapElement.addEventListener('touchend', this._touchEndListener, { passive: true });
      this._mapElement.addEventListener('touchmove', this._touchMoveListener, { passive: true });
      this._mapElement.addEventListener('touchstart', this._touchStartListener, { passive: true });
    } else {
      this._mapElement.addEventListener('click', this._clickListener);
    }
  }

  _detachListeners() {
    this._mapElement.removeEventListener('click', this._clickListener);
    this._mapElement.removeEventListener('touchend', this._touchEndListener, { passive: true });
    this._mapElement.removeEventListener('touchmove', this._touchMoveListener, { passive: true });
    this._mapElement.removeEventListener('touchstart', this._touchStartListener, { passive: true });
  }

  _onClick(event) {
    this._setPoint(event.offsetX, event.offsetY);
  }

  _setPoint(pointX, pointY) {
    let ratioX = this._config.width / this._mapElement.width;
    let ratioY = this._config.height / this._mapElement.height;

    this._config.callback([pointX * ratioX, pointY * ratioY]);
  }

  _onTouchEnd(event) {
    if (event.changedTouches.length === 1 && !this._dragged) {
      let touch = event.changedTouches[0];

      let mapRect = this._mapElement.getBoundingClientRect();

      this._setPoint(touch.pageX - mapRect.left, touch.pageY -  mapRect.top);
    }
  }

  _onTouchMove() {
    this._dragged = true;
  }

  _onTouchStart(event) {
    this._dragged = false;
  }
}

export default Map;