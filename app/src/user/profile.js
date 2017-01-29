import Data from '../data/data';

class UserProfile {
  constructor(config) {
    this._config = config;

    if (this._config.auth.currentUser) {
      this._auth = this._config.auth;
      this._data = new Data(this._config.dataURL);

      this._fetchUserData();
      this._fetchWhiteboardBookmarks();
    }
  }

  _fetchUserData() {
    this._config.auth
      .getUser(this._config.auth.currentUser.id)
        .then(function(user) {
          document.getElementById('loadingProfile').classList.add('hidden');

          let userProfileForm = document.getElementById('userProfile');
          userProfileForm.name.value = user.name;
          userProfileForm.email.value = user.email;

          userProfileForm.classList.remove('hidden');
        })
        .catch(function() {
          document.getElementById('loadingProfile').classList.add('hidden');

          let messageErrorNode = document.getElementById('profileMessageError');
          messageErrorNode.classList.remove('hidden');
        });
  }

  _fetchWhiteboardBookmarks() {
    this._data.fetchWhiteboardBookmarks(this._config.auth.currentUser.id)
      .then((data) => {
        document.getElementById('loadingBookmarks').classList.add('hidden');

        this._populateWhiteboardBookmarks(data);

        let bookmarksListContainer = document.getElementById('bookmarksListContainer');
        bookmarksListContainer.classList.remove('hidden');
      })
      .catch(() => {
        document.getElementById('loadingProfile').classList.add('hidden');

        let messageErrorNode = document.getElementById('bookmarksMessageError');
        messageErrorNode.classList.remove('hidden');
      });
  }

  _populateWhiteboardBookmarks(data) {
    let bookmarksListEl = document.getElementById('bookmarksList');
    bookmarksListEl.innerHTML = '';

    let bookmarks = [];

    for (let i = 0; i < data.length; i++) {
      bookmarks.push(
        `<li class="bookmark-item">
          <a href="/wb/${data[i].whiteboardId}">${data[i].whiteboardName}</a>
        </li>`
      );
    }

    bookmarksListEl.innerHTML = bookmarks.join('');
  }
}

export default UserProfile;