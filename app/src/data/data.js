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
    return this._fetchAll((limit, offset) => {
      return this._data
        .limit(limit)
        .offset(offset)
        .where('userId', '=', userId)
        .where('whiteboardId', '=', whiteboardId)
        .search('user2whiteboard');
    }, 10000);
  }

  fetchShapes(whiteboardId) {
    return this._fetchAll((limit, offset) => {
      return this._data
        .limit(limit)
        .offset(offset)
        .search(whiteboardId);
    }, 10000);
  }

  fetchWhiteboardBookmarks(userId) {
    return this._fetchAll((limit, offset) => {
      return this._data
        .limit(limit)
        .offset(offset)
        .where('userId', '=', userId)
        .search('user2whiteboard');
    }, 10000);
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

  _fetchAll(queryFn, limit) {
    return new Promise((resolve) => {
      queryFn(limit, 0)
        .then((result) => {
          let total = result.total;

          if (result.documents.length < total) {
            let finalResult = [].concat(result.documents);

            let fetchPromises = [];

            for (let i = limit; i < total; i += limit) {
              fetchPromises.push(queryFn(limit, i));
            }

            Promise.all(fetchPromises)
              .then((results) => {
                for (let i = 0; i < results.length; i++) {
                  finalResult = finalResult.concat(results[i].documents);
                }

                resolve(finalResult);
              });
          } else {
            resolve(result.documents);
          }
        });
    });
  }
}

export default Data;