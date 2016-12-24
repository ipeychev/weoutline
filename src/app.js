import { Tools } from './tools';
import Whiteboard from './whiteboard';

new Whiteboard({
  activeTool: Tools.line,
  color: '#000000',
  eraserSize: 22,
  penSize: 8
});