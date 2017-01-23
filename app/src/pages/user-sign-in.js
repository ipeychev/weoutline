require('../assets/user-sign-in/user-sign-in-structure.scss');
require('../assets/user-sign-in/user-sign-in-skin.scss');

import UserSignIn from '../user/sign-in';

window.addEventListener('load', () => {
  let auth = WeDeploy.auth('auth.weoutline.wedeploy.io');

  new UserSignIn({
    auth: auth
  });
}, {
  once: true
});