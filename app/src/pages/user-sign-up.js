require('../assets/user-sign-up/user-sign-up-structure.scss');
require('../assets/user-sign-up/user-sign-up-skin.scss');

import UserSignUp from '../user/sign-up';

window.addEventListener('load', () => {
  let auth = WeDeploy.auth('auth.weoutline.wedeploy.io');

  new UserSignUp({
    auth: auth
  });
}, {
  once: true
});