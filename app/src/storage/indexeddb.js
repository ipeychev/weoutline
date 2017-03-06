class IndexedDB {
  constructor(config) {
    this._config = config;
    this._db = null;
  }

  getAllItems(store) {
    return new Promise((resolve, reject) => {
      let items = [];

      let objectStore = this._db.transaction(store).objectStore(store);

      if (typeof objectStore.getAll === 'function') {
        let request = objectStore.getAll();

        request.onerror = (event) => {
          reject(event.target.errorCode);
        };

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      } else {
        let cursorRequest = objectStore.openCursor();

        cursorRequest.onerror = (event) => {
          reject(event.target.errorCode);
        };

        cursorRequest.onsuccess = (event) => {
          let cursor = event.target.result;

          if (cursor) {
            items.push(cursor.value);
            cursor.continue();
          }
          else {
            resolve(items);
          }
        };
      }
    });
  }

  deleteItem(store, key) {
    return new Promise((resolve, reject) => {
      let request = this._db.transaction(store, 'readwrite')
        .objectStore(store)
        .delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.errorCode);
      };
    });
  }

  getItem(store, key) {
    return new Promise((resolve, reject) => {
      let request = this._db.transaction(store, 'readwrite')
        .objectStore(store)
        .get(key);

      request.onerror = (event) => {
        reject(event.target.errorCode);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  open(dbName, version = 1) {
    return new Promise((resolve, reject) => {
      let dbOpenRequest = window.indexedDB.open(dbName, version);

      dbOpenRequest.onsuccess = () => {
        this._db = event.target.result;

        resolve(this._db);
      };

      dbOpenRequest.onerror = (event) => {
        reject(event.target.errorCode);
      };

      dbOpenRequest.onupgradeneeded = (event) => {
        let db = event.target.result;

        let createDb = () => {
          for (let i = 0; i < this._config.stores.length; i++) {
            let storeConfig = this._config.stores[i];
            let objectStore = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });

            for (let i = 0; i < storeConfig.indexes && storeConfig.indexes.length; i++) {
              let index = storeConfig.indexes[i];
              objectStore.createIndex(index.name, index.keyPath || index.name, { unique: index.unique || true });
            }
          }
        };

        if (typeof this._config.upgradeFn === 'function') {
          this._config.upgradeFn(db)
            .then(() => {
              createDb();
            });
        } else {
          createDb();
        }
      };
    });
  }

  setItem(store, item) {
    return new Promise((resolve, reject) => {
      let request = this._db.transaction(store, 'readwrite')
        .objectStore(store)
        .put(item);

      request.onerror = () => {
        reject(event.target.errorCode);
      };

      request.onsuccess = () => {
        resolve(item);
      };
    });
  }
}


export default IndexedDB;