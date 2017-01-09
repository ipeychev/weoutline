import Tools from './draw/tools';
import Whiteboard from './whiteboard/whiteboard';

window.addEventListener('load', () => {
  new Whiteboard({
    activeTool: Tools.line,
    color: '#000000',
    fullscreen: false,
    height: 3000,
    penSize: 4,
    rulerFontSize: 10,
    width: 3000
  });
}, {
  once: true
});