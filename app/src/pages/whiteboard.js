require('../assets/whiteboard/structure.scss');
require('../assets/whiteboard/skin.scss');

import Tools from '../draw/tools';
import Whiteboard from '../whiteboard/whiteboard';

window.addEventListener('load', () => {
  let auth = WeDeploy.auth('auth.weoutline.wedeploy.io');

  let whiteboard;

  function createWhiteboard() {
    let whiteboardHeight = 3000;
    let whiteboardWidth = 3000;

    let state = {
      activeTool: Tools.line,
      color: '#000000',
      fullscreen: false,
      mapVisible: true,
      offset: [0, 0],
      penSize: 4,
      scale: 1,
      shapes: [],
      whiteboardId: getWhiteboardId(),
      zoomModeEnabled: false
    };

    whiteboard = new Whiteboard({
      map: {
        container: 'mapContainer',
        height: whiteboardHeight,
        rectColor: '#000000',
        rectLineWidth: 1,
        srcNode: 'map',
        width: whiteboardWidth
      },
      state: state,
      toolbarTools: {
        srcNode: 'toolbarTools'
      },
      toolbarUser: {
        currentUser: auth.currentUser,
        srcNode: 'toolbarUser'
      },
      toolbarZoom: {
        srcNode: 'toolbarZoom'
      },
      whiteboard: {
        currentUser: auth.currentUser,
        dataURL: 'data.weoutline.wedeploy.io',
        height: whiteboardHeight,
        loadSpinnerId: 'loadSpinner',
        mainContainer: 'mainContainer',
        minPointDistance: 3,
        rulerFontSize: 10,
        signOutCallback: userSignOut,
        srcNode: 'canvas',
        width: whiteboardWidth
      }
    });
  }

  function getWhiteboardId() {
    let whiteboardURLRegex = /\/wb\/([a-zA-Z0-9-_]*)$/;

    let match = whiteboardURLRegex.exec(document.location);

    if (match) {
      return match[1];
    }
  }

  function userSignOut() {
    auth.signOut()
      .then(() => {
        location.reload();
      });
  }

  window.onpopstate = () => {
    if (whiteboard) {
      whiteboard.destroy();
    }

    createWhiteboard();
  };

  createWhiteboard();
}, {
  once: true
});