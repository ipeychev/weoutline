function distanceBetween(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}
function angleBetween(point1, point2) {
  return Math.atan2( point2.x - point1.x, point2.y - point1.y );
}

var el = document.getElementById('c');
var ctx = el.getContext('2d');
ctx.lineJoin = ctx.lineCap = 'round';

var isDrawing, lastPoint;

el.addEventListener('touchstart', function(e) {
  isDrawing = true;
  var touches = e.touches[0];
  lastPoint = { x: touches.pageX, y: touches.pageY };
});

el.addEventListener('touchmove', function(e) {
  if (!isDrawing) return;

  e.preventDefault();
  var touches = e.touches[0];

  var currentPoint = { x: touches.pageX, y: touches.pageY };
  var dist = distanceBetween(lastPoint, currentPoint);
  var angle = angleBetween(lastPoint, currentPoint);

  for (var i = 0; i < dist; i+=5) {
    var x = lastPoint.x + (Math.sin(angle) * i);
    var y = lastPoint.y + (Math.cos(angle) * i);

    var radgrad = ctx.createRadialGradient(x,y,10,x,y,20);

    radgrad.addColorStop(0, '#000');
    radgrad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
    radgrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = radgrad;
     ctx.fillRect(x-20, y-20, 40, 40);
  }

  lastPoint = currentPoint;
});

el.addEventListener('touchend', function() {
  isDrawing = false;
});