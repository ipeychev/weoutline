import { Tools } from './tools';
import Whiteboard from './whiteboard';

new Whiteboard({
  activeTool: Tools.line,
  color: '#000000',
  fullscreen: false,
  height: 3000,
  penSize: 6,
  rulerFontSize: 10,
  width: 3000
});