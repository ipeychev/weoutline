var el = document.getElementById('c');
var ctx = el.getContext('2d');

ctx.lineWidth = 10;
ctx.lineJoin = ctx.lineCap = 'round';

var isDrawing, points = [ ];
var rect;

el.onmousedown = function(e) {
  rect = c.getBoundingClientRect();

  isDrawing = true;
  points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
};

el.onmousemove = function(e) {
  if (!isDrawing) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  points.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
};

el.onmouseup = function() {
  isDrawing = false;
  points.length = 0;
};