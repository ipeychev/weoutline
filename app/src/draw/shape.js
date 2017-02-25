export class Shape {
  constructor(config) {
    this.color = config.color;
    this.curves = config.curves;
    this.id = config.id;
    this.lineWidth = config.lineWidth;
    this.points = config.points;
    this.sessionId = config.sessionId;
    this.type = config.type;
  }
}

export const ShapeType = {
  CIRCLE: 1,
  LINE: 1,
  RECTANGLE: 2
};