class Data {
  constructor(config) {
    this._config = config;

    this._data = WeDeploy.data(config.url);
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

  fetchAllWhiteboards() {
    this._data
      .aggregate('whiteboards', 'board', 'terms')
      .get('shapes')
      .then(function(whiteboards) {
        console.log(whiteboards);
      });
  }

  fetchShapes(whiteboardId) {
    return this._data
      .limit(10000)
      .get(whiteboardId);
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

  watch(whiteboardId, sessionId, successCallback, errorCallback) {
    this._data
      .limit(1)
      .orderBy('id', 'desc')
      .where('board', whiteboardId)
      .where('sessionId', '!=', sessionId)
      .watch('shapes')
      .on('changes', successCallback)
      .on('fail', errorCallback);
  }
}

export default Data;