import { Tools } from './tools';
import Whiteboard from './whiteboard';

new Whiteboard({
  activeTool: Tools.line,
  color: '#000000',
  height: 4096,
  penSize: 6,
  rulerFontSize: 10,
  width: 4096,
});