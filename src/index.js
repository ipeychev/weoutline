function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints;
};

var el = document.getElementById('c');
var ctx = el.getContext('2d');

ctx.lineWidth = 8;
ctx.lineJoin = ctx.lineCap = 'round';

var shapePoints = [];
var isDrawing, points = [];

if (isTouchDevice()) {
  el.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      return;
    }

    isDrawing = true;

    ctx.beginPath();
    var touches = e.touches[0];
    points.push({ x: touches.pageX, y: touches.pageY});

    var p1 = points[0];
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }, {passive: true});

  el.addEventListener('touchcancel', function(e) {
    if (!isDrawing) {
      return;
    }

    points.length = 0;

    endDrawing(e);
  });

  el.addEventListener('touchmove', function(e) {
    if (!isDrawing) {
      return;
    }

    if (e.touches.length > 1) {
      endDrawing(e);
      return;
    }

    e.preventDefault();

    var touches = e.touches[0];
    points.push({ x: touches.pageX, y: touches.pageY});

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawPoints(points, ctx);

    for (var i = 0; i < shapePoints.length; i++) {
      drawPoints(shapePoints[i], ctx);
    }
  });

  el.addEventListener('touchend', function(e) {
    if (!isDrawing) {
      return;
    }

    endDrawing(e);
  }, {passive: true});

  function endDrawing(e) {
    isDrawing = false;

    if (points.length) {
      shapePoints.push(points.slice(0));
      points.length = 0;
    }
  }
} else {
  el.onmousedown = function(e) {
    isDrawing = true;

    ctx.beginPath();
    points.push({ x: e.offsetX, y: e.offsetY});

    var p1 = points[0];
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  };

  el.onmousemove = function(e) {
    if (!isDrawing) {
      return;
    }

    points.push({ x: e.offsetX, y: e.offsetY });

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawPoints(points, ctx);

    for (var i = 0; i < shapePoints.length; i++) {
      drawPoints(shapePoints[i], ctx);
    }
  };

  el.onmouseup = function() {
    isDrawing = false;

    shapePoints.push(points.slice(0));

    points.length = 0;
  };
}

function drawPoints(points, ctx) {
  var p1 = points[0];
  var p2 = points[1];

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);

  for (var i = 1, len = points.length; i < len; i++) {
    // we pick the point between pi+1 & pi+2 as the
    // end point and p1 as our control point
    var midPoint = midPointBtw(p1, p2);
    ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
    p1 = points[i];
    p2 = points[i+1];
  }
  // Draw last line as a straight line while
  // we wait for the next point to be able to calculate
  // the bezier control point
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
}