export default class Draw {
  static line(points, context, config) {
    let p1 = points[0];
    let p2 = points[1];

    context.globalCompositeOperation = config.globalCompositeOperation;

    if (p1 && !p2) {
      context.fillStyle = config.color;

      context.beginPath();
      context.arc(p1[0], p1[1], config.lineWidth/2, 0, 2 * Math.PI, false);
      context.fill();
    } else {
      context.lineCap = config.lineCap;
      context.lineJoin = config.lineJoin;
      context.lineWidth = config.lineWidth;
      context.strokeStyle = config.color;

      context.beginPath();
      context.moveTo(p1[0], p1[1]);

      for (let i = 1, len = points.length; i < len; i++) {
        let midPoint = Draw.getMidPoint(p1, p2);
        context.quadraticCurveTo(p1[0], p1[1], midPoint[0], midPoint[1]);
        p1 = points[i];
        p2 = points[i + 1];
      }

      context.lineTo(p1[0], p1[1]);

      context.stroke();
    }
  }

  static lineToMidPoint(p1, p2, context, config) {
    context.globalCompositeOperation = config.globalCompositeOperation;
    context.lineCap = config.lineCap;
    context.lineJoin = config.lineJoin;
    context.lineWidth = config.lineWidth;
    context.strokeStyle = config.color;

    context.beginPath();
    context.moveTo(p1[0], p1[1]);

    let midPoint = Draw.getMidPoint(p1, p2);
    context.quadraticCurveTo(p1[0], p1[1], midPoint[0], midPoint[1]);

    context.stroke();

    return midPoint;
  }

  static getMidPoint(p1, p2) {
    return [
      p1[0] + (p2[0] - p1[0]) / 2,
      p1[1] + (p2[1] - p1[1]) / 2
    ];
  }
}