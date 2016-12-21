export default class Utils {
  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
  }

  static getPointFromEvent(event, canvas) {
    let point;

    if (event.touches) {
      let touches = event.touches[0];
      let rect = canvas.getBoundingClientRect();

      point = [touches.clientX - rect.left, touches.clientY - rect.top];
    } else {
      point = [event.offsetX, event.offsetY];
    }

    return point;
  }

  static getPointWithOffset(point, offset) {
    if (point) {
      return [
        point[0] - offset[0],
        point[1] - offset[1]
      ];
    }

    return point;
  }

  static getPointWithoutOffset(point, offset) {
    if (point) {
      return [
        point[0] + offset[0],
        point[1] + offset[1]
      ];
    }

    return point;
  }
}