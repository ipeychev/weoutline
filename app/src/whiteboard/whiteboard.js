import BrowserHelper from '../helpers/browser-helper';
import CryptHelper from '../helpers/crypt-helper';
import Data from '../data/data';
import Draw from '../draw/draw';
import DrawHelper from '../helpers/draw-helper';
import DrawLine from '../draw/draw-line';
import EraseWhiteboardModal from './erase-whiteboard';
import Eraser from '../draw/eraser';
import IndexedDB from '../storage/indexeddb';
import Map from '../map/map';
import ShareWhiteboardModal from './share-whiteboard';
import StateHolder from '../state/state-holder';
import ToolbarTools from '../toolbar/toolbar-tools';
import ToolbarUser from '../toolbar/toolbar-user';
import ToolbarZoom from '../toolbar/toolbar-zoom';
import Tools from '../draw/tools';
import { ShapeType } from '../draw/shape';

class Whiteboard {
  constructor(config) {
    config = config || {};

    this._config = config;

    this._loadSpinner = document.getElementById(this._config.whiteboard.loadSpinnerId);
    this._sessionId = this._generateSessionId();

    this._setupIndexedDb()
      .then(() => {
        this._fetchState()
          .then((state) => {
            this._stateHolder = new StateHolder({
              state: state
            });

            this._setupCanvas();
            this._setupContext();
            this._setupData();
            this._setupMap();
            this._setupToolbarTools();
            this._setupToolbarUser();
            this._setupToolbarZoom();

            this._attachListeners();

            this._resizeCanvas();
            this._setScale();

            this._setActiveTool();

            this._fetchShapes()
              .then((shapes) => {
                this._stateHolder.setProp('shapes', shapes);

                this._loadSpinner.classList.add('hidden');
              })
              .catch((error) => {
                alert('Error fetching shapes!');
                console.error('Error fetching shapes', error);
              });

            if (state.whiteboardId) {
              this._data.watchShapes(state.whiteboardId, this._sessionId, {
                onShapeCreated: this._onShapeCreatedRemotelyCallback.bind(this),
                onShapeErased: this._onShapeErasedRemotelyCallback.bind(this),
                onShapeWatchError: this._onShapeWatchError.bind(this)
              });
            }
          });
      });
  }

  destroy() {
    if (this._drawer) {
      this._drawer.destroy();
    }

    this._map.destroy();
    this._toolbarTools.destroy();
    this._toolbarUser.destroy();
    this._toolbarZoom.destroy();

    this._detachListeners();

    window.clearTimeout(this._saveStateTimeout);

    this._data.destroy();
  }

  drawRulers() {
    this._drawHorizontalRuler();

    this._drawVerticalRuler();
  }

  drawShapes() {
    let canvasSize = {
      height: this._canvasElement.height,
      width: this._canvasElement.width
    };

    let shapes = [];
    let state = this._stateHolder.getState();

    for (let i = 0; i < state.shapes.length; i++) {
      if (state.shapes[i].type === ShapeType.LINE) {
        if (DrawHelper.checkPointsInViewport(state.shapes[i].points, state.offset, state.scale, canvasSize)) {
          let points = state.shapes[i].points.map((point) => {
            return DrawHelper.getPointWithOffset(point, state.offset);
          });

          shapes.push(Object.assign({}, state.shapes[i], {
            points: points
          }));
        }
      }
    }

    this._drawShapes(shapes, {
      context: this._context
    });
  }

  redraw() {
    let state = this._stateHolder.getState();

    this._context.clearRect(0, 0, this._context.canvas.width/state.scale, this._context.canvas.height/state.scale);

    this.drawRulers();

    this.drawShapes();

    this._map.draw(state.shapes);
  }

  _addShapesToCollection(shapesList, shapes) {
    return shapesList.concat(shapes);
  }

  _applyZoom(zoomPoint, zoom) {
    let zoomPointX = zoomPoint[0];
    let zoomPointY = zoomPoint[1];

    let state = this._stateHolder.getState();

    this._context.scale(zoom, zoom);

    let newOffset = [
      ((zoomPointX / state.scale) + state.offset[0]) - (zoomPointX / (state.scale * zoom)),
      ((zoomPointY / state.scale) + state.offset[1]) - (zoomPointY / (state.scale * zoom))
    ];

    this._stateHolder.setProp('offset', newOffset, {
      suppressChangeEmit: true
    });

    this._stateHolder.setProp('scale', state.scale * zoom);
  }

  _attachListeners() {
    this._onContextMenuListener = function(e) { e.preventDefault(); };
    this._onFullscreenChangeListener = this._onFullscreenChange.bind(this);
    this._onTouchMoveListener = this._onTouchMove.bind(this);
    this._onTouchStartListener = this._onTouchStart.bind(this);
    this._onWheelListener = this._onScroll.bind(this);
    this._orientationChangeListener = () => {setTimeout(this._onResize.bind(this), 100);};
    this._resizeListener = this._onResize.bind(this);
    this._stateChangeListener = this._onStateChange.bind(this);

    if (BrowserHelper.getTouchEventsSupport()) {
      this._canvasElement.addEventListener('touchstart', this._onTouchStartListener, { passive: true });
      this._canvasElement.addEventListener('touchmove', this._onTouchMoveListener);
    } else {
      this._canvasElement.addEventListener('wheel', this._onWheelListener);
      this._canvasElement.addEventListener('contextmenu', this._onContextMenuListener);
    }

    document.addEventListener(BrowserHelper.getFullscreenChangeEventName(this._canvasElement), this._onFullscreenChangeListener);

    window.addEventListener('orientationchange', this._orientationChangeListener);
    window.addEventListener('resize', this._resizeListener);

    this._stateHolder.on('stateChange', this._stateChangeListener);
  }

  _clearWhiteboard() {
    if (!this._eraseWhiteboardModal) {
      let state = this._stateHolder.getState();

      this._eraseWhiteboardModal = new EraseWhiteboardModal({
        srcNode: 'eraseWhiteboard',
        eraseWhiteBoardCallback: () => {
          let newShapes = [];

          this._deleteShapes(state.shapes);

          this._stateHolder.setProp('shapes', newShapes);

          this._resetState();
        }
      });
    }

    this._eraseWhiteboardModal.show();
  }

  _decreaseZoomCallback() {
    let state = this._stateHolder.getState();

    let scaleMultiplier = (state.scale - 0.1) / state.scale;
    let tmpScale = state.scale * scaleMultiplier;

    if (tmpScale < 0.1 || tmpScale > 10) {
      return;
    }

    let viewportMidPoint = [this._canvasElement.width / state.scale / 2, this._canvasElement.height / state.scale / 2];

    this._applyZoom(viewportMidPoint, scaleMultiplier);
  }

  _increaseZoomCallback() {
    let state = this._stateHolder.getState();

    let scaleMultiplier = (state.scale + 0.1) / state.scale;
    let tmpScale = state.scale * scaleMultiplier;

    if (tmpScale < 0.1 || tmpScale > 10) {
      return;
    }

    let viewportMidPoint = [this._canvasElement.width / state.scale / 2, this._canvasElement.height / state.scale / 2];

    this._applyZoom(viewportMidPoint, scaleMultiplier);
  }

  _normalizeZoomCallback() {
    this._resetState();
  }

  _detachListeners() {
    document.removeEventListener(BrowserHelper.getFullscreenChangeEventName(this._canvasElement), this._onFullscreenChangeListener);
    this._canvasElement.removeEventListener('contextmenu', this._onContextMenuListener);
    this._canvasElement.removeEventListener('touchmove', this._onTouchMoveListener);
    this._canvasElement.removeEventListener('touchstart', this._onTouchStartListener, { passive: true });
    this._canvasElement.removeEventListener('wheel', this._onWheelListener);
    this._stateHolder.off('stateChange', this._stateChangeListener);
    window.removeEventListener('orientationchange', this._orientationChangeListener);
    window.removeEventListener('resize', this._resizeListener);
  }

  _deleteShapes(shapes) {
    let state = this._stateHolder.getState();

    if (state.whiteboardId) {
      this._deleteShapesOnWhiteboard(state.whiteboardId, shapes);
    } else {
      this._deleteShapesLocally(shapes);
    }
  }

  _deleteShapesLocally(shapes) {
    let shapesPromises = [];

    for (let i = 0; i < shapes.length; i++) {
      shapesPromises.push(this._indexedDb.deleteItem('shapes', shapes[i].id));
    }

    Promise.all(shapesPromises)
      .catch((error) => {
        console.log('Error deleting shapes locally', error);
      });
  }

  _deleteShapesOnWhiteboard(whiteboardId, shapes) {
    this._data.deleteShapes(whiteboardId, shapes)
      .then(() => {
        console.log('Shapes deleted successfully on whiteboard', whiteboardId);
      })
      .catch((error) => {
        alert('Deleting the shapes failed!');
        console.error(error);
      });
  }

  _drawHorizontalRuler() {
    let state = this._stateHolder.getState();

    let posY = state.offset[1] < 0 ? Math.abs(state.offset[1]) : 0;

    for (let i = 0; i <= this._config.whiteboard.width; i += 20) {
      this._context.beginPath();
      this._context.strokeStyle = '#000000';
      this._context.lineWidth = 1;
      this._context.moveTo(i - state.offset[0], posY);

      if (i % 100 === 0) {
        this._context.lineTo(i - state.offset[0], posY + 10);
      } else {
        this._context.lineTo(i - state.offset[0], posY + 5);
      }
      this._context.stroke();

      if (i % 500 === 0 && i > 0) {
        this._context.strokeStyle = '#000000';
        this._context.textAlign = i + 20 < this._config.whiteboard.width ? 'center' : 'end';
        this._context.textBaseline = 'alphabetic';
        this._context.font = this._config.whiteboard.rulerFontSize + 'px';
        this._context.fillStyle = '#000000';
        this._context.fillText(i, i - state.offset[0], posY + 20);
      }
    }
  }

  _drawShapes(shapes, params) {
    for (let i = 0; i < shapes.length; i++) {
      if (shapes[i].type === ShapeType.LINE) {
        Draw.line(shapes[i].points, params.context, {
          color: shapes[i].color,
          globalCompositeOperation: 'source-over',
          lineCap: 'round',
          lineJoin: 'round',
          lineWidth: DrawHelper.getPixelScaledNumber(shapes[i].lineWidth)
        });
      }
    }
  }

  _drawVerticalRuler() {
    let state = this._stateHolder.getState();

    let posX = state.offset[0] < 0 ? Math.abs(state.offset[0]) : 0;

    for (let i = 20; i <= this._config.whiteboard.height; i += 20) {
      this._context.beginPath();
      this._context.strokeStyle = '#000000';
      this._context.lineWidth = 1;
      this._context.moveTo(posX, i - state.offset[1]);

      if (i % 100 === 0) {
        this._context.lineTo(posX + 10, i - state.offset[1]);
      } else {
        this._context.lineTo(posX + 5, i - state.offset[1]);
      }
      this._context.stroke();

      if (i % 500 === 0) {
        this._context.strokeStyle = '#000000';
        this._context.textAlign = 'start';
        this._context.textBaseline = i + 20 < this._config.whiteboard.height ? 'middle' : 'bottom';
        this._context.font = this._config.whiteboard.rulerFontSize + 'px';
        this._context.fillStyle = '#000000';
        this._context.fillText(i, posX + 12, i - state.offset[1]);
      }
    }
  }

  _enableZoomModeCallback(data) {
    this._stateHolder.setProp('zoomModeEnabled', data.zoomModeEnabled);
  }

  _fetchShapes() {
    let state = this._stateHolder.getState();

    if (state.whiteboardId) {
      return this._data.fetchShapes(state.whiteboardId);
    } else {
      return this._indexedDb.getAllItems('shapes');
    }
  }

  _fetchState() {
    let whiteboardId = this._config.state.whiteboardId;

    return this._indexedDb.getItem('state', whiteboardId || 'local')
      .then((state) => {
        return state || this._config.state;
      });
  }

  _generateSessionId() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  _generateWhiteboardId() {
    return CryptHelper.getRandomBase64(12);
  }

  _getAllowedOffset(scrollData) {
    let state = this._stateHolder.getState();

    let tmpOffsetWidth = state.offset[0] + scrollData[0];
    let tmpOffsetHeight = state.offset[1] + scrollData[1];

    let allowedOffset = [];

    if ((scrollData[0] < 0 && tmpOffsetWidth < 0) ||
      (scrollData[0] > 0 && tmpOffsetWidth + this._canvasElement.width > this._config.whiteboard.width)) {
      allowedOffset[0] = 0;
    } else {
      allowedOffset[0] = scrollData[0];
    }

    if ((scrollData[1] < 0 && tmpOffsetHeight < 0) ||
      (scrollData[1] > 0 && tmpOffsetHeight + this._canvasElement.height > this._config.whiteboard.height)) {
      allowedOffset[1] = 0;
    } else {
      allowedOffset[1] = scrollData[1];
    }

    return allowedOffset;
  }

  _getLineWidth() {
    let lineWidth;

    let state = this._stateHolder.getState();

    if (state.activeTool === Tools.line) {
      lineWidth = this._config.whiteboard.penSize;
    }

    return lineWidth;
  }

  _getShareWhiteboardData() {
    let data;
    let whiteboardBookmark;
    let state = this._stateHolder.getState();
    let whiteboardId = state.whiteboardId || this._generateWhiteboardId();

    let url = window.location.origin + '/wb/' + whiteboardId;

    if (this._config.whiteboard.currentUser && state.whiteboardId) {
      return this._data.getWhiteboardBookmark(this._config.whiteboard.currentUser.id, state.whiteboardId)
        .then((data) => {
          whiteboardBookmark = data ? data[0] : null;

          if (whiteboardBookmark) {
            data = {
              action: 'logged user + existing bookmark',
              url: url,
              whiteboardBookmark: whiteboardBookmark,
              whiteboardId: whiteboardId
            };
          } else {
            data = {
              action: 'logged user + new bookmark',
              url: url,
              whiteboardId: whiteboardId
            };
          }

          return data;
        });
    } else {
      if (this._config.whiteboard.currentUser) {
        data = {
          action: 'logged user + new bookmark',
          url: url,
          whiteboardId: whiteboardId
        };
      } else if (state.whiteboardId) {
        data = {
          action: 'anonymous user + existing whiteboard',
          url: url,
          whiteboardId: whiteboardId
        };
      } else {
        data = {
          action: 'anonymous user + new whiteboard',
          url: url,
          whiteboardId: whiteboardId
        };
      }

      return Promise.resolve(data);
    }
  }

  _getShareWhiteboardModal() {
    if (!this._shareWhiteboardModal) {
      this._shareWhiteboardModal = new ShareWhiteboardModal({
        srcNode: 'shareWhiteboard'
      });
    }

    return this._shareWhiteboardModal;
  }

  _handleFullscreen() {
    let mainContainerNode = document.getElementById(this._config.whiteboard.mainContainer);

    let inFullscreen = BrowserHelper.getFullScreenModeValue();

    if (inFullscreen) {
      BrowserHelper.exitFullscreen(mainContainerNode);
    } else {
      BrowserHelper.requestFullscreen(mainContainerNode);
    }
  }

  _onFullscreenChange() {
    let fullscreen = BrowserHelper.getFullScreenModeValue();

    this._stateHolder.setProp('fullscreen', fullscreen);
  }

  _onMapHideCallback() {
    this._stateHolder.setProp('mapVisible', false);
  }

  _onMapSetOffsetCallback(point) {
    let state = this._stateHolder.getState();

    let canvasHeight = this._canvasElement.height / state.scale;
    let canvasWidth = this._canvasElement.width / state.scale;

    let x = point[0] - canvasWidth / 2;
    let y = point[1] - canvasHeight / 2;

    if (state.scale >= 1) {
      if (x + canvasWidth > this._config.whiteboard.width) {
        x = this._config.whiteboard.width - canvasWidth;
      } else if (x < 0) {
        x = 0;
      }

      if (y + canvasHeight > this._config.whiteboard.height) {
        y = this._config.whiteboard.height - canvasHeight;
      } else if (y < 0) {
        y = 0;
      }
    }

    state.offset[0] = x;
    state.offset[1] = y;

    this.redraw();

    this._saveState();
  }

  _onMapShowCallback() {
    this._stateHolder.setProp('mapVisible', true);
  }

  _onResize() {
    let canvasSize = this._resizeCanvas();

    this._setScale();

    this._updateOffset({
      canvasHeight: canvasSize.height,
      canvasWidth: canvasSize.width,
      height: this._config.whiteboard.height,
      width: this._config.whiteboard.width
    });

    this.redraw();
  }

  _onScroll(event) {
    event.preventDefault();

    let state = this._stateHolder.getState();

    if (event.deltaMode === 0) {
      if (state.zoomModeEnabled) {
        let mouseX = event.offsetX;
        let mouseY = event.offsetY;

        let wheel = event.wheelDelta / 120;

        let zoom = 1 - wheel/2;

        let tmpScale = state.scale * zoom;

        if (tmpScale < 0.1 || tmpScale > 10) {
          return;
        }

        this._applyZoom([mouseX, mouseY], zoom);
      } else {
        let allowedOffset = this._getAllowedOffset([event.deltaX, event.deltaY]);

        state.offset[0] += allowedOffset[0];
        state.offset[1] += allowedOffset[1];

        this.redraw();

        this._saveStateWithTimeout();
      }
    } else if (event.touches.length > 1) {
      if (!this._dragModeSet) {
        this._setDragMode(event);
      } else if (this._dragMode === 'pan') {
        this._onPan(event);
      } else {
        this._onZoom(event);
      }
    }
  }

  _onPan(event) {
    let curPoint = [event.touches[0].pageX, event.touches[0].pageY];

    let allowedOffset = this._getAllowedOffset([
      (curPoint[0] - this._lastPoint0[0]) * -1,
      (curPoint[1] - this._lastPoint0[1]) * -1
    ]);

    let state = this._stateHolder.getState();

    let newOffset = [state.offset[0] + allowedOffset[0], state.offset[1] + allowedOffset[1]];
    this._stateHolder.setProp('offset', newOffset);

    this._lastPoint0[0] = curPoint[0];
    this._lastPoint0[1] = curPoint[1];
  }

  _onShapeCreatedLocallyCallback(shape) {
    let state = this._stateHolder.getState();

    // change points coordinates according to 0,0
    shape.points = shape.points.map((point) => {
      return DrawHelper.getPointWithoutOffset(point, state.offset);
    });

    shape.id = CryptHelper.getId();

    shape.sessionId = this._sessionId;

    let newShapes = this._addShapesToCollection(state.shapes, [shape]);

    this._saveShapes([shape]);

    this._stateHolder.setProp('shapes', newShapes);
  }

  _onShapeCreatedRemotelyCallback(shape) {
    let state = this._stateHolder.getState();
    let newShapes = this._addShapesToCollection(state.shapes, [shape]);

    this._stateHolder.setProp('shapes', newShapes);
  }

  _onShapeErasedRemotelyCallback(shape) {
    let state = this._stateHolder.getState();
    let newShapes = this._removeShapesFromCollection(state.shapes, [shape]);

    this._stateHolder.setProp('shapes', newShapes);
  }

  _onShapeWatchError(error) {
    alert('On shape watch error ' + error.message);
  }

  _onShapesErasedLocallyCallback(shapes) {
    let state = this._stateHolder.getState();
    let newShapes = this._removeShapesFromCollection(state.shapes, shapes);

    this._deleteShapes(shapes);

    this._stateHolder.setProp('shapes', newShapes);
  }

  _onShareWhiteboardImageCallback() {
    let canvasElement = document.createElement('canvas');
    canvasElement.height = this._config.whiteboard.height;
    canvasElement.width = this._config.whiteboard.width;

    let context = canvasElement.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, this._config.whiteboard.width, this._config.whiteboard.height);

    let state = this._stateHolder.getState();

    this._drawShapes(state.shapes, {
      context: context
    });

    window.location = canvasElement.toDataURL('image/png');
  }

  _onShareWhiteboardLinkCallback() {
    let shareWhiteboardModal = this._getShareWhiteboardModal();
    shareWhiteboardModal.show();

    this._getShareWhiteboardData()
      .then((data) => {
        shareWhiteboardModal.setConfig({
          shareWhiteboardCallback: (payload) => {
            let state = this._stateHolder.getState();

            this._shareWhiteboard({
              createWhiteboardBookmark: payload.createBookmark,
              id: data.whiteboardBookmark ? data.whiteboardBookmark.id : null,
              saveShapes: state.whiteboardId !== payload.whiteboardId,
              whiteboardId: payload.whiteboardId,
              whiteboardName: payload.whiteboardName
            });

            if (state.whiteboardId !== payload.whiteboardId) {
              this._stateHolder.setProp('whiteboardId', payload.whiteboardId);

              this._data.watchShapes(payload.whiteboardId, this._sessionId, {
                onShapeCreated: this._onShapeCreatedRemotelyCallback.bind(this),
                onShapeErased: this._onShapeErasedRemotelyCallback.bind(this),
                onShapeWatchError: this._onShapeWatchError.bind(this)
              });
            }
          }
        });

        shareWhiteboardModal.setData(data);
      })
      .catch((error) => {
        alert('Error retrieving whiteboard bookmark');
        console.error(error);
        shareWhiteboardModal.hide();
      });
  }

  _onTouchMove(event) {
    if (event.touches.length > 1) {
      this._onScroll(event);
    }
  }

  _onTouchStart(event) {
    if (event.touches.length > 1) {
      this._dragModeSet = false;

      let state = this._stateHolder.getState();

      if (state.zoomModeEnabled) {
        this._dragModeSet = true;
        this._dragMode = 'zoom';
      }

      this._lastPoint0 = [event.touches[0].pageX, event.touches[0].pageY];
      this._lastPoint1 = [event.touches[1].pageX, event.touches[1].pageY];
    }
  }

  _onUserSignInCallback(href) {
    href += '?returnURL=' + encodeURIComponent(location.href);
    location.href = href;
  }

  _onZoom(event) {
    let curPoint0 = [event.touches[0].pageX, event.touches[0].pageY];
    let curPoint1 = [event.touches[1].pageX, event.touches[1].pageY];

    let curDistance = DrawHelper.getPointsDistance(curPoint0, curPoint1);
    let lastDistance = DrawHelper.getPointsDistance(this._lastPoint0, this._lastPoint1);

    let scaleMultiplier = 0;

    let state = this._stateHolder.getState();

    if (Math.abs(curDistance - lastDistance) >= 3) {
      if (curDistance > lastDistance) {
        scaleMultiplier = (state.scale + 0.1) / state.scale;
      } else if (curDistance < lastDistance) {
        scaleMultiplier = (state.scale - 0.1) / state.scale;
      }
    }

    if (scaleMultiplier !== 0) {
      let tmpScale = state.scale * scaleMultiplier;

      if (tmpScale < 0.1 || tmpScale > 10) {
        return;
      }

      let zoomPoint = DrawHelper.getMidPoint(curPoint0, curPoint1);

      this._applyZoom(zoomPoint, scaleMultiplier);
    }

    this._lastPoint0 = curPoint0;
    this._lastPoint1 = curPoint1;
  }

  _removeShapesFromCollection(shapesList, shapes) {
    return shapesList.filter((curShape) => {
      for (let i = 0; i < shapes.length; i++) {
        let deletedShape = shapes[i];

        if (deletedShape.id === curShape.id) {
          return false;
        }
      }

      return true;
    });
  }

  _resetState() {
    this._context.setTransform(1, 0, 0, 1, 0, 0);

    this._stateHolder.setProp('offset', [0, 0], {
      suppressChangeEmit: true
    });

    this._stateHolder.setProp('scale', 1);
  }

  _resizeCanvas() {
    let canvasContainerEl = this._canvasElement.parentNode;

    let canvasSize = {
      height: canvasContainerEl.offsetHeight,
      width: canvasContainerEl.offsetWidth
    };

    this._canvasElement.setAttribute('height', canvasSize.height);
    this._canvasElement.setAttribute('width', canvasSize.width);

    return canvasSize;
  }

  _saveState() {
    let state = this._stateHolder.getState();

    let stateForSaving = {};

    let keys = Object.keys(state);

    keys.forEach((key) => {
      if (key !== 'shapes') {
        stateForSaving[key] = state[key];
      }
    });

    this._indexedDb.setItem('state', Object.assign({}, stateForSaving, {
      id: state.whiteboardId || 'local'
    }))
      .catch((error) => {
        console.log('Error saving state', error);
      });
  }

  _saveStateWithTimeout() {
    window.clearTimeout(this._saveStateTimeout);

    this._saveStateTimeout = window.setTimeout(() => {

      this._saveState();
    }, 300);
  }

  _saveShapes(shapes) {
    let state = this._stateHolder.getState();

    if (state.whiteboardId) {
      this._saveShapesOnWhiteboard(state.whiteboardId, shapes);
    } else {
      this._saveShapesLocally(shapes);
    }
  }

  _saveShapesOnWhiteboard(whiteboardId, shapes) {
    this._data.saveShapes(whiteboardId, shapes)
      .then(() => {
        console.log('Shapes saved successfully on whiteboard', whiteboardId);
      })
      .catch((error) => {
        alert('Creating whiteboard and saving shapes failed!');
        console.error(error);
      });
  }

  _saveShapesLocally(shapes) {
    let shapesPromises = [];

    for (let i = 0; i < shapes.length; i++) {
      shapesPromises.push(this._indexedDb.setItem('shapes', shapes[i]));
    }

    Promise.all(shapesPromises)
      .catch((error) => {
        console.log('Error saving shapes locally', error);
      });
  }

  _setActiveTool() {
    if (this._drawer) {
      this._drawer.destroy();
    }

    let state = this._stateHolder.getState();

    if (state.activeTool === Tools.line) {
      this._drawer = new DrawLine({
        boardSize: [this._config.whiteboard.width, this._config.whiteboard.height],
        callback: this._onShapeCreatedLocallyCallback.bind(this),
        canvas: this._canvasElement,
        globalCompositeOperation: 'source-over',
        lineCap: 'round',
        lineJoin: 'round',
        lineWidth: this._getLineWidth(),
        minPointDistance: this._config.whiteboard.minPointDistance,
        stateHolder: this._stateHolder
      });
    } else if (state.activeTool === Tools.eraser) {
      this._drawer = new Eraser({
        boardSize: [this._config.whiteboard.width, this._config.whiteboard.height],
        callback: this._onShapesErasedLocallyCallback.bind(this),
        canvas: this._canvasElement,
        stateHolder: this._stateHolder
      });
    }
  }

  _setDragMode(event) {
    let curPoint0 = [event.touches[0].pageX, event.touches[0].pageY];
    let curPoint1 = [event.touches[1].pageX, event.touches[1].pageY];

    if (Math.abs(curPoint0[0] - this._lastPoint0[0]) >= 10 || Math.abs(curPoint0[1] - this._lastPoint0[1]) >= 10 ||
      Math.abs(curPoint1[0] - this._lastPoint1[0]) >= 10 || Math.abs(curPoint1[1] - this._lastPoint1[1]) >= 10) {

      this._dragModeSet = true;

      if ((curPoint0[0] < this._lastPoint0[0] && curPoint1[0] < this._lastPoint1[0]) ||
          (curPoint0[0] > this._lastPoint0[0] && curPoint1[0] > this._lastPoint1[0]) ||
        (curPoint0[1] < this._lastPoint0[1] && curPoint1[1] < this._lastPoint1[1]) ||
        (curPoint0[1] > this._lastPoint0[1] && curPoint1[1] > this._lastPoint1[1])) {
          this._dragMode = 'pan';
        } else {
          this._dragMode = 'zoom';
        }
      }
  }

  _setScale() {
    let state = this._stateHolder.getState();

    this._context.scale(state.scale, state.scale);
  }

  _setupCanvas() {
    this._canvasElement = document.getElementById(this._config.whiteboard.srcNode);
  }

  _setupContext() {
    this._context = this._canvasElement.getContext('2d');
  }

  _setupData() {
    this._data = new Data({
      url: this._config.whiteboard.dataURL
    });
  }

  _setupIndexedDb() {
    this._indexedDb = new IndexedDB({
      stores: [
        {
          name: 'shapes',
          keyPath: 'id'
        },
        {
          name: 'state',
          keyPath: 'id'
        }
      ]
    });

    return this._indexedDb.open('weoutline');
  }

  _setupMap() {
    let config = {
      mapHideCallback: this._onMapHideCallback.bind(this),
      setOffsetCallback: this._onMapSetOffsetCallback.bind(this),
      srcCanvas: this._canvasElement,
      stateHolder: this._stateHolder
    };

    Object.assign(config, this._config.map);

    this._map = new Map(config);
  }

  _setupToolbarTools() {
    let config = {
      clearWhiteboardCallback: this._clearWhiteboard.bind(this),
      fullscreenCallback: this._handleFullscreen.bind(this),
      shareWhiteboardImageCallback: this._onShareWhiteboardImageCallback.bind(this),
      shareWhiteboardLinkCallback: this._onShareWhiteboardLinkCallback.bind(this),
      showMapCallback: this._onMapShowCallback.bind(this),
      stateHolder: this._stateHolder,
      valueChange: this._onToolsValueChangeCallback.bind(this)
    };

    Object.assign(config, this._config.toolbarTools);

    this._toolbarTools = new ToolbarTools(config);
  }

  _setupToolbarUser() {
    let config = {
      currentUser: this._config.whiteboard.currentUser,
      signInCallback: this._onUserSignInCallback.bind(this),
      signOutCallback: this._config.whiteboard.signOutCallback,
      stateHolder: this._stateHolder
    };

    Object.assign(config, this._config.toolbarUser);

    this._toolbarUser = new ToolbarUser(config);
  }

  _setupToolbarZoom() {
    let config = {
      decreaseZoomCallback: this._decreaseZoomCallback.bind(this),
      enableZoomModeCallback: this._enableZoomModeCallback.bind(this),
      increaseZoomCallback: this._increaseZoomCallback.bind(this),
      normalizeZoomCallback: this._normalizeZoomCallback.bind(this),
      stateHolder: this._stateHolder
    };

    Object.assign(config, this._config.toolbarZoom);

    this._toolbarZoom = new ToolbarZoom(config);
  }

  _shareWhiteboard(params) {
    if (params.saveShapes) {
      history.pushState(null, null, window.location.origin + '/wb/' + params.whiteboardId);

      let state = this._stateHolder.getState();

      if (state.shapes.length) {
        this._data.saveShapes(params.whiteboardId, state.shapes)
          .then(() => {
            console.log('Shapes saved successfully on whiteboard', params.whiteboardId);
          })
          .catch((error) => {
            alert('Creating whiteboard and saving shapes failed!');
            console.error(error);
          });
      }
    }

    if (params.createWhiteboardBookmark) {
      this._data.createOrUpdateWhiteboardBookmark({
        id: params.id,
        userId: this._config.whiteboard.currentUser.id,
        whiteboardName: params.whiteboardName,
        whiteboardId: params.whiteboardId
      });
    }
  }

  _onToolsValueChangeCallback(prop, value) {
    if (prop === 'penSize') {
      this._stateHolder.setProp('penSize', value, {
        suppressChangeEmit: true
      });
      this._stateHolder.setProp('activeTool', Tools.line);
    } else {
      this._stateHolder.setProp(prop, value);
    }
  }

  _onStateChange(params) {
    let state = this._stateHolder.getState();

    if (params.prop === 'activeTool') {
      this._setActiveTool();
    } else if (params.prop === 'mapVisible') {
      this._map.draw(state.shapes);
    } else if (params.prop === 'offset' || params.prop === 'scale' || params.prop === 'shapes') {
      this.redraw();
    }

    this._saveState();
  }

  _updateOffset(params) {
    let state = this._stateHolder.getState();

    if (params.height > params.canvasHeight && params.height - state.offset[1] < params.canvasHeight) {
      state.offset[1] += params.height - state.offset[1] - params.canvasHeight;
    }

    if (params.width > params.canvasWidth && params.width - state.offset[0] < params.canvasWidth) {
      state.offset[0] += params.width - state.offset[0] - params.canvasWidth;
    }
  }
};

export default Whiteboard;