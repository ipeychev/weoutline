export class Shape {
  constructor(config) {
    this.color = config.color;
    this.id = config.id;
    this.points = config.points;
    this.sessionId = config.sessionId;
    this.lineWidth = config.lineWidth;
    this.type = config.type;
  }
}

export const ShapeType = {
  CIRCLE: 1,
  LINE: 1,
  RECTANGLE: 2
};