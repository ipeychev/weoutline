require('../assets/whiteboard/whiteboard-structure.scss');
require('../assets/whiteboard/whiteboard-skin.scss');

import Tools from '../draw/tools';
import Whiteboard from '../whiteboard/whiteboard';

window.addEventListener('load', () => {
  function createWhiteboard() {
    let whiteboardSize = {
      height: 3000,
      width: 3000
    };

    let activeTool = Tools.line;
    let color = '#000000';
    let penSize = 4;

    whiteboard = new Whiteboard({
      map: {
        color: color,
        container: 'mapContainer',
        height: whiteboardSize.height,
        lineWidth: 1,
        srcNode: 'map',
        width: whiteboardSize.width
      },
      toolbarTools: {
        activeTool: activeTool,
        color: color,
        fullscreen: false,
        penSize: penSize,
        srcNode: 'toolbarTools'
      },
      toolbarUser: {
        currentUser: auth.currentUser,
        srcNode: 'toolbarUser'
      },
      whiteboard: {
        activeTool: activeTool,
        color: color,
        dataURL: 'http://data.weoutline.wedeploy.io',
        height: whiteboardSize.height,
        id: getWhiteboardId(),
        mainContainer: 'mainContainer',
        minPointDistance: 3,
        penSize: penSize,
        rulerFontSize: 10,
        signOutCallback: userSignOut,
        srcNode: 'canvas',
        width: whiteboardSize.width
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

  let auth = WeDeploy.auth('auth.weoutline.wedeploy.io');

  let whiteboard;

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