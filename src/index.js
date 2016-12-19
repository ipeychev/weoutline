function midPointBtw(p1, p2) {
  return [
    p1[0] + (p2[0] - p1[0]) / 2,
    p1[1] + (p2[1] - p1[1]) / 2
  ];
}

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints;
};

var el = document.getElementById('c');
el.setAttribute('width', window.innerWidth);
el.setAttribute('height', window.innerHeight);

var ctx = el.getContext('2d');

ctx.lineWidth = 4;
ctx.lineJoin = ctx.lineCap = 'round';
ctx.globalCompositeOperation = 'source-over';

var shapePoints = [];
var isDrawing, points = [];

if (isTouchDevice()) {
  el.addEventListener('touchstart', function(e) {
    isDrawing = true;

    ctx.lineWidth = document.getElementById('pencilSizeValue').textContent;
    ctx.strokeStyle = document.getElementById('pencilColor').value;

    var rect = el.getBoundingClientRect();
    var touches = e.touches[0];
    this.lastPoint = [touches.clientX - rect.left, touches.clientY - rect.top];

    points.push(this.lastPoint);
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

    var rect = el.getBoundingClientRect();
    var touches = e.touches[0];
    this.curPoint = [touches.clientX - rect.left, touches.clientY - rect.top];
    this.lastPoint = drawPoints([this.lastPoint, this.curPoint], ctx);
    points.push(this.curPoint);
  });

  el.addEventListener('touchend', function(e) {
    if (!isDrawing) {
      return;
    }

    endDrawing(e);
  }, {passive: true});
} else {
  el.onmousedown = function(e) {
    isDrawing = true;

    ctx.lineWidth = document.getElementById('pencilSizeValue').textContent;
    ctx.strokeStyle = document.getElementById('pencilColor').value;

    this.lastPoint = [e.offsetX, e.offsetY];

    points.push(this.lastPoint);
  };

  el.onmousemove = function(e) {
    if (!isDrawing) {
      return;
    }

    var curPoint = [e.offsetX, e.offsetY];

    points.push(curPoint);

    this.lastPoint = drawPoints([this.lastPoint, curPoint], ctx);
  };

  el.onmouseup = function(e) {
    if (!isDrawing) {
      return;
    }

    endDrawing(e);
  };
}

function drawPoints(points, ctx) {
  var p1 = points[0];
  var p2 = points[1];

  ctx.beginPath();
  ctx.moveTo(p1[0], p1[1]);

  for (var i = 1, len = points.length; i < len; i++) {
    var midPoint = midPointBtw(p1, p2);
    ctx.quadraticCurveTo(p1[0], p1[1], midPoint[0], midPoint[1]);
    p1 = points[i];
    p2 = points[i + 1];
  }

  ctx.stroke();

  return midPoint;
}

function endDrawing(e) {
  isDrawing = false;

  var shape = new Shape();

  if (points.length) {
    shapePoints.push(points.slice(0));
    points.length = 0;
  }

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (var i = 0; i < shapePoints.length; i++) {
    drawPoints(shapePoints[i], ctx);
  }
}