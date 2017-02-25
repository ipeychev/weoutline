import DrawHelper from '../helpers/draw-helper';

export default class Draw {
  static bezierCurve(curves, context, config) {

    context.lineCap = config.lineCap;
    context.lineJoin = config.lineJoin;
    context.lineWidth = config.lineWidth;
    context.strokeStyle = config.color;

    context.beginPath();

    for (let i = 0; i < curves.length; i++) {
      let curve = curves[i];
      context.moveTo(curve[0][0], curve[0][1]);
      context.bezierCurveTo(curve[1][0], curve[1][1], curve[2][0], curve[2][1], curve[3][0], curve[3][1]);
    }

    context.stroke();
  }

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
        let midPoint = DrawHelper.getMidPoint(p1, p2);
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

    let midPoint = DrawHelper.getMidPoint(p1, p2);
    context.quadraticCurveTo(p1[0], p1[1], midPoint[0], midPoint[1]);

    context.stroke();

    return midPoint;
  }
}