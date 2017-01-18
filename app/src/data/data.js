class Data {
  constructor(config) {
    this._config = config;

    this._data = WeDeploy.data(config.url);
  }

  deleteShapes(whiteboardId, shapes) {
    let deletePromises = [];

    for (let i = 0; i < shapes.length; i++) {
      deletePromises.push(this._data.delete(whiteboardId + '/' + shapes[i].id));
    }

    return Promise.all(deletePromises);
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
    return this._data.get(whiteboardId)
  }

  saveShapes(whiteboardId, shapes) {
    return this._data.create(whiteboardId, shapes);
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