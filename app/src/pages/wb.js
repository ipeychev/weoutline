import Tools from '../draw/tools';
import Whiteboard from '../whiteboard/whiteboard';

window.addEventListener('load', () => {
  function createWhiteboard() {
    whiteboard = new Whiteboard({
      activeTool: Tools.line,
      color: '#000000',
      dataURL: 'http://data.weoutline.wedeploy.io',
      fullscreen: false,
      height: 3000,
      penSize: 4,
      rulerFontSize: 10,
      whiteboardId: getWhiteboardId(),
      width: 3000
    });
  }

  function getWhiteboardId() {
    let whiteboardURLRegex = /\/wb\/([a-zA-Z0-9-_]*)$/;

    let match = whiteboardURLRegex.exec(document.location);

    if (match) {
      return match[1];
    }
  }

  let whiteboard;

  window.onpopstate = (event) => {
    if (whiteboard) {
      whiteboard.destroy();
    }

    createWhiteboard();
  };

  createWhiteboard();
}, {
  once: true
});