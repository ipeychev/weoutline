class UserProfile {
  constructor(config) {
    this._config = config;

    if (this._config.auth.currentUser) {
      this._config.auth
        .getUser(this._config.auth.currentUser.id)
          .then(function(user) {
            document.getElementById('loading').classList.add('hidden');

            let userProfileForm = document.getElementById('userProfile');
            userProfileForm.name.value = user.name;
            userProfileForm.email.value = user.email;

            userProfileForm.classList.remove('hidden');
          })
          .catch(function() {
            document.getElementById('loading').classList.add('hidden');

            let messageErrorNode = document.getElementById('messageError');
            messageErrorNode.classList.remove('hidden');
          });
    }
  }
}

export default UserProfile;