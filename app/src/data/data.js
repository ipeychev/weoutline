class Data {
  constructor(config) {
    this._config = config;

    this._data = WeDeploy.data(config.url);
  }

  destroy() {
    if (this._watchRefCreate) {
      this._watchRefCreate.off('create', this._onShapeActionListener);
      this._watchRefCreate.off('fail', this._onShapeWatchFailListener);
    }

    if (this._watchRefDelete) {
      this._watchRefDelete.off('delete', this._onShapeActionListener);
      this._watchRefDelete.off('fail', this._onShapeWatchFailListener);
    }
  }

  createOrUpdateWhiteboardBookmark(params) {
    if (params.id) {
      this.updateWhiteboardBookmark(params);
    } else {
      this.createWhiteboardBookmark(params);
    }
  }

  createWhiteboardBookmark(params) {
    this._data.create('user2whiteboard', {
      userId: params.userId,
      whiteboardId: params.whiteboardId,
      whiteboardName: params.whiteboardName
    });
  }

  deleteShapes(whiteboardId, shapes) {
    let deletePromises = [];

    for (let i = 0; i < shapes.length; i++) {
      deletePromises.push(this._data.delete(whiteboardId + '/' + shapes[i].id));
    }

    return Promise.all(deletePromises);
  }

  getWhiteboardBookmark(userId, whiteboardId) {
    return this._data
      .where('userId', '=', userId)
      .where('whiteboardId', '=', whiteboardId)
      .get('user2whiteboard');
  }

  fetchShapes(whiteboardId) {
    return this._data
      .limit(10000)
      .get(whiteboardId);
  }

  fetchWhiteboardBookmarks(userId) {
    return this._data
      .limit(10000)
      .where('userId', '=', userId)
      .get('user2whiteboard');
  }

  saveShapes(whiteboardId, shapes) {
    return this._data.create(whiteboardId, shapes);
  }

  updateWhiteboardBookmark(params) {
    this._data.update('user2whiteboard/' + params.id, {
      userId: params.userId,
      whiteboardId: params.whiteboardId,
      whiteboardName: params.whiteboardName
    });
  }

  watchShapes(whiteboardId, sessionId, callbacks) {
    this._onShapeActionListener = (event) => {
      if (event.type === 'create') {
        callbacks.onShapeCreated(event.document);
      } else if (event.type === 'delete') {
        callbacks.onShapeErased(event.document);
      }
    };

    this._onShapeWatchFailListener = (error) => {
      callbacks.onShapeWatchError(error);
    };

    this._watchRefCreate = this._data
      .where('sessionId', '!=', sessionId)
      .watch(whiteboardId)
      .on('create', this._onShapeActionListener)
      .on('fail', this._onShapeWatchFailListener);

    this._watchRefDelete = this._data
      .where('sessionId', '!=', sessionId)
      .watch(whiteboardId)
      .on('delete', this._onShapeActionListener)
      .on('fail', this._onShapeWatchFailListener);
  }
}

export default Data;