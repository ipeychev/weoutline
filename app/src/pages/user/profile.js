require('../../assets/user/profile/structure.scss');
require('../../assets/user/profile/skin.scss');

import UserProfile from '../../user/profile';

window.addEventListener('load', () => {
  let auth = WeDeploy.auth('auth.weoutline.wedeploy.io');

  new UserProfile({
    auth: auth,
    dataURL: 'http://data.weoutline.wedeploy.io'
  });
}, {
  once: true
});