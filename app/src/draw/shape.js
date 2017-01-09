export class Shape {
  constructor(config) {
    this.color = config.color;
    this.points = config.points;
    this.size = config.size;
    this.type = config.type;
  }
}

export const ShapeType = {
  CIRCLE: 1,
  LINE: 1,
  RECTANGLE: 2
};