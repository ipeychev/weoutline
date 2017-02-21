const simplify = require('simplify-path');
import BrowserHelper from '../helpers/browser-helper';
import Draggable from '../draggable/draggable';
import Draw from '../draw/draw';
import DrawHelper from '../helpers/draw-helper';
import { ShapeType } from '../draw/shape';

class Map {
  constructor(config) {
    this._config = config;

    this._mapElement = document.getElementById(config.srcNode);

    this._mapContainer = document.getElementById(config.container);
    this._mapHideElement = this._mapContainer.querySelector('#mapHide');

    this._mapContext = this._mapElement.getContext('2d');

    this._initItems();

    this._attachListeners();

    this._draggable = new Draggable(this._mapContainer);
  }

  destroy() {
    this._detachListeners();

    this._draggable.destroy();
  }

  draw(shapes) {
    this._mapContext.clearRect(0, 0, this._mapContext.canvas.width, this._mapContext.canvas.height);

    let mapRect = this._mapElement.getBoundingClientRect();
    let srcCanvasRect = this._config.srcCanvas.getBoundingClientRect();

    let srcRectSize = {
      height: srcCanvasRect.height,
      width: srcCanvasRect.width
    };

    let ratioX = this._config.width / mapRect.width;
    let ratioY = this._config.height / mapRect.height;

    let mapViewportRect = this._getMapViewportRect(srcRectSize, [ratioX, ratioY], this._config.offset);

    this._mapContext.strokeStyle = this._config.color;
    this._mapContext.lineWidth = this._config.lineWidth;
    this._mapContext.strokeRect(
      mapViewportRect.x,
      mapViewportRect.y,
      mapViewportRect.width,
      mapViewportRect.height
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
          lineWidth: Math.round(DrawHelper.getPixelScaledNumber(shapes[i].lineWidth) / 4)
        });
      }
    }
  }

  setConfig(config) {
    this._config = Object.assign(this._config, config);

    this._setMapHidden(config.mapHidden);
  }

  _attachListeners() {
    this._mouseDownListener = this._onMouseDown.bind(this);
    this._mouseMoveListener = this._onMouseMove.bind(this);
    this._mouseUpListener = this._onMouseUp.bind(this);
    this._touchEndListener = this._onTouchEnd.bind(this);
    this._touchMoveListener = this._onTouchMove.bind(this);
    this._mapHideListener = this._onMapHideClick.bind(this);
    this._touchStartListener = this._onTouchStart.bind(this);

    if (BrowserHelper.getTouchEventsSupport()) {
      this._mapHideElement.addEventListener('touchend', this._mapHideListener, { passive: true });
      this._mapElement.addEventListener('touchend', this._touchEndListener, { passive: true });
      this._mapElement.addEventListener('touchmove', this._touchMoveListener);
      this._mapElement.addEventListener('touchstart', this._touchStartListener);
    } else {
      this._mapHideElement.addEventListener('click', this._mapHideListener);
      this._mapElement.addEventListener('mousedown', this._mouseDownListener);
      this._mapElement.addEventListener('mousemove', this._mouseMoveListener);
      this._mapElement.addEventListener('mouseup', this._mouseUpListener);
    }
  }

  _detachListeners() {
    this._mapHideElement.addEventListener('click', this._mapHideListener);
    this._mapHideElement.addEventListener('touchend', this._mapHideListener, { passive: true });
    this._mapElement.addEventListener('mousedown', this._mouseDownListener);
    this._mapElement.addEventListener('mousemove', this._mouseMoveListener);
    this._mapElement.addEventListener('mouseup', this._mouseUpListener);
    this._mapElement.addEventListener('touchend', this._touchEndListener, { passive: true });
    this._mapElement.addEventListener('touchmove', this._touchMoveListener);
    this._mapElement.addEventListener('touchstart', this._touchStartListener);
  }

  _getMapViewportRect() {
    let srcCanvasRect = this._config.srcCanvas.getBoundingClientRect();

    let srcCanvasSize = {
      height: srcCanvasRect.height / this._config.scale,
      width: srcCanvasRect.width / this._config.scale
    };

    let mapRect = this._mapElement.getBoundingClientRect();
    let whiteboardSize = {width: this._config.width, height: this._config.height};

    let ratioX = whiteboardSize.width / mapRect.width;
    let ratioY = whiteboardSize.height / mapRect.height;

    return {
      height: srcCanvasSize.height / ratioY,
      width: srcCanvasSize.width / ratioX,
      x: this._config.offset[0] / ratioX,
      y: this._config.offset[1] / ratioY
    };
  }

  _initItems() {
    this._setMapHidden(this._config.mapHidden);
  }

  _isPointInMapViewport(point, mapViewportRect) {
    mapViewportRect = mapViewportRect || this._getMapViewportRect();

    if (point[0] > mapViewportRect.x && point[0] < mapViewportRect.x + mapViewportRect.width &&
      point[1] > mapViewportRect.y && point[1] < mapViewportRect.y + mapViewportRect.height) {
      return true;
    } else {
      return false;
    }
  }

  _onMapHideClick() {
    this._mapContainer.classList.add('hidden');

    this._config.mapHideCallback();
  }

  _onMouseDown(event) {
    this._pointerDown = true;
    this._pointerMove = false;
    this._rectHit = false;

    let mapViewportRect = this._getMapViewportRect();

    if (this._isPointInMapViewport([event.offsetX, event.offsetY], mapViewportRect)) {
      this._rectHit = true;

      this._startOffsetX = event.offsetX - (mapViewportRect.x + (mapViewportRect.width/2));
      this._startOffsetY = event.offsetY - (mapViewportRect.y + (mapViewportRect.height/2));

      event.preventDefault();
      event.stopPropagation();
    }
  }

  _onMouseMove(event) {
    this._pointerMove = true;

    if (this._rectHit) {
      let mapRect = this._mapElement.getBoundingClientRect();

      this._setPoint([event.offsetX, event.offsetY], mapRect, {width: this._config.width, height: this._config.height});
    }
  }

  _onMouseUp(event) {
    if (!this._pointerMove) {
      let mapRect = this._mapElement.getBoundingClientRect();

      this._setPoint([event.offsetX, event.offsetY], mapRect, {width: this._config.width, height: this._config.height});
    }

    this._pointerDown = false;
    this._pointerMove = false;
    this._rectHit = false;
  }

  _onTouchEnd(event) {
    if (event.changedTouches.length === 1) {
      if (this._rectHit || !this._pointerMove) {
        let touch = event.changedTouches[0];

        let mapRect = this._mapElement.getBoundingClientRect();

        this._setPoint([touch.pageX - mapRect.left, touch.pageY - mapRect.top], mapRect, {width: this._config.width, height: this._config.height});
      }
    }
  }

  _onTouchMove() {
    this._pointerMove = true;

    if (this._rectHit) {
      if (event.changedTouches.length === 1) {
        let touch = event.changedTouches[0];

        event.preventDefault();
        event.stopPropagation();

        let mapRect = this._mapElement.getBoundingClientRect();

        this._setPoint([touch.pageX - mapRect.left, touch.pageY - mapRect.top], mapRect, {width: this._config.width, height: this._config.height});
      }
    }
  }

  _onTouchStart(event) {
    this._pointerDown = true;
    this._rectHit = false;
    this._pointerMove = false;

    if (event.changedTouches.length === 1) {
      let touch = event.changedTouches[0];

      let mapRect = this._mapElement.getBoundingClientRect();

      let pointX = touch.pageX - mapRect.left;
      let pointY = touch.pageY - mapRect.top;

      let mapViewportRect = this._getMapViewportRect();

      if (this._isPointInMapViewport([pointX, pointY], mapViewportRect)) {
        this._rectHit = true;

        this._startOffsetX = pointX - (mapViewportRect.x + (mapViewportRect.width/2));
        this._startOffsetY = pointY - (mapViewportRect.y + (mapViewportRect.height/2));

        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  _setMapHidden(mapHidden) {
    if (mapHidden) {
      this._mapContainer.classList.add('hidden');
    } else {
      this._mapContainer.classList.remove('hidden');
    }
  }

  _setPoint(point, mapRect, whiteboardSize) {
    let ratioX = whiteboardSize.width / mapRect.width;
    let ratioY = whiteboardSize.height / mapRect.height;

    this._config.setOffsetCallback([(point[0] - (this._startOffsetX || 0)) * ratioX, (point[1] - (this._startOffsetY || 0)) * ratioY]);
  }
}

export default Map;