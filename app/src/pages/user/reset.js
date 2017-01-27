require('../../assets/user/reset/structure.scss');
require('../../assets/user/reset/skin.scss');

import UserReset from '../../user/reset';

window.addEventListener('load', () => {
  let auth = WeDeploy.auth('auth.weoutline.wedeploy.io');

  new UserReset({
    auth: auth
  });
}, {
  once: true
});