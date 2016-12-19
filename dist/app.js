(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["app"] = factory();
	else
		root["app"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _whiteboard = __webpack_require__(1);
	
	var _whiteboard2 = _interopRequireDefault(_whiteboard);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	new _whiteboard2.default();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _draw2 = __webpack_require__(2);
	
	var _draw3 = _interopRequireDefault(_draw2);
	
	var _shape = __webpack_require__(3);
	
	var _shape2 = _interopRequireDefault(_shape);
	
	var _utils = __webpack_require__(4);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Whiteboard = function () {
	  function Whiteboard() {
	    _classCallCheck(this, Whiteboard);
	
	    this._penSizeValueElement = document.getElementById('penSizeValue');
	    this._penColorElement = document.getElementById('penColor');
	
	    this._points = [];
	    this._shapes = [];
	
	    this._setupCanvas();
	    this._setupContext();
	
	    this._attachListeners();
	  }
	
	  _createClass(Whiteboard, [{
	    key: '_attachListeners',
	    value: function _attachListeners() {
	      if (_utils2.default.isTouchDevice()) {
	        this._canvasElement.addEventListener('touchstart', this._startDraw.bind(this), { passive: true });
	        this._canvasElement.addEventListener('touchcancel', this._cancelDraw.bind(this), { passive: true });
	        this._canvasElement.addEventListener('touchmove', this._draw.bind(this));
	        this._canvasElement.addEventListener('touchend', this._finishDraw.bind(this), { passive: true });
	      } else {
	        this._canvasElement.addEventListener('mousedown', this._startDraw.bind(this));
	        this._canvasElement.addEventListener('mouseup', this._finishDraw.bind(this));
	        this._canvasElement.addEventListener('mousemove', this._draw.bind(this));
	      }
	    }
	  }, {
	    key: '_cancelDraw',
	    value: function _cancelDraw() {
	      if (!this._isDrawing) {
	        return;
	      }
	
	      this._points.length = 0;
	
	      this._finishDraw(event);
	    }
	  }, {
	    key: '_draw',
	    value: function _draw(event) {
	      if (!this._isDrawing) {
	        return;
	      }
	
	      if (event.touches && event.touches.length > 1) {
	        // Less or equal to two points into the points array from
	        // the start event and two fingers now means that the user
	        // meant to scroll
	        // in this case we won't draw anything
	        if (this._points.length <= 2) {
	          this._points.length = 0;
	        }
	
	        this._finishDraw(event);
	        return;
	      }
	
	      event.preventDefault();
	
	      var curPoint = this._getPointFromEvent(event);
	      this._lastPoint = _draw3.default.drawLineToMidPoint(this._lastPoint, curPoint, this._context, {
	        color: this._penColorElement.value,
	        size: this._penSizeValueElement.textContent
	      });
	      this._points.push(curPoint);
	    }
	  }, {
	    key: '_finishDraw',
	    value: function _finishDraw() {
	      if (!this._isDrawing) {
	        return;
	      }
	
	      this._isDrawing = false;
	
	      // In case of draw canceling, there won't be any points
	      // Creating a shape is not needed in this case
	      if (this._points.length) {
	        var shape = new _shape2.default({
	          color: this._penColorElement.value,
	          points: this._points.slice(0),
	          size: this._penSizeValueElement.textContent
	        });
	
	        this._shapes.push(shape);
	
	        this._points.length = 0;
	      }
	
	      this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
	
	      for (var i = 0; i < this._shapes.length; i++) {
	        _draw3.default.drawLine(this._shapes[i].points, this._context, {
	          color: this._shapes[i].color,
	          size: this._shapes[i].size
	        });
	      }
	    }
	  }, {
	    key: '_getPointFromEvent',
	    value: function _getPointFromEvent(event) {
	      var point = void 0;
	
	      if (event.touches) {
	        var touches = event.touches[0];
	        var rect = this._canvasElement.getBoundingClientRect();
	
	        point = [touches.clientX - rect.left, touches.clientY - rect.top];
	      } else {
	        point = [event.offsetX, event.offsetY];
	      }
	
	      return point;
	    }
	  }, {
	    key: '_setupCanvas',
	    value: function _setupCanvas() {
	      this._canvasElement = document.getElementById('canvas');
	
	      this._canvasElement.setAttribute('width', window.innerWidth);
	      this._canvasElement.setAttribute('height', window.innerHeight);
	    }
	  }, {
	    key: '_setupContext',
	    value: function _setupContext() {
	      this._context = this._canvasElement.getContext('2d');
	
	      this._context.lineJoin = this._context.lineCap = 'round';
	      this._context.globalCompositeOperation = 'source-over';
	    }
	  }, {
	    key: '_startDraw',
	    value: function _startDraw(event) {
	      this._isDrawing = true;
	
	      this._context.lineWidth = this._penSizeValueElement.textContent;
	      this._context.strokeStyle = this._penColorElement.value;
	
	      this._lastPoint = this._getPointFromEvent(event);
	
	      this._points.push(this._lastPoint);
	    }
	  }]);
	
	  return Whiteboard;
	}();
	
	;
	
	exports.default = Whiteboard;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Draw = function () {
	  function Draw() {
	    _classCallCheck(this, Draw);
	  }
	
	  _createClass(Draw, null, [{
	    key: "drawLine",
	    value: function drawLine(points, context, config) {
	      var p1 = points[0];
	      var p2 = points[1];
	
	      if (p1 && !p2) {
	        context.fillStyle = config.color;
	
	        context.beginPath();
	        context.arc(p1[0], p1[1], context.lineWidth / 2, 0, 2 * Math.PI, false);
	        context.fill();
	      } else {
	        context.lineWidth = config.size;
	        context.strokeStyle = config.color;
	
	        context.beginPath();
	        context.moveTo(p1[0], p1[1]);
	
	        for (var i = 1, len = points.length; i < len; i++) {
	          var midPoint = Draw.getMidPoint(p1, p2);
	          context.quadraticCurveTo(p1[0], p1[1], midPoint[0], midPoint[1]);
	          p1 = points[i];
	          p2 = points[i + 1];
	        }
	
	        context.lineTo(p1[0], p1[1]);
	
	        context.stroke();
	      }
	    }
	  }, {
	    key: "drawLineToMidPoint",
	    value: function drawLineToMidPoint(p1, p2, context, config) {
	      context.lineWidth = config.size;
	      context.strokeStyle = config.color;
	
	      context.beginPath();
	      context.moveTo(p1[0], p1[1]);
	
	      var midPoint = Draw.getMidPoint(p1, p2);
	      context.quadraticCurveTo(p1[0], p1[1], midPoint[0], midPoint[1]);
	
	      context.stroke();
	
	      return midPoint;
	    }
	  }, {
	    key: "getMidPoint",
	    value: function getMidPoint(p1, p2) {
	      return [p1[0] + (p2[0] - p1[0]) / 2, p1[1] + (p2[1] - p1[1]) / 2];
	    }
	  }]);
	
	  return Draw;
	}();
	
	exports.default = Draw;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Shape = function Shape(config) {
	  _classCallCheck(this, Shape);
	
	  this.points = config.points;
	  this.color = config.color;
	  this.size = config.size;
	};
	
	exports.default = Shape;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Utils = function () {
	  function Utils() {
	    _classCallCheck(this, Utils);
	  }
	
	  _createClass(Utils, null, [{
	    key: 'isTouchDevice',
	    value: function isTouchDevice() {
	      return 'ontouchstart' in window || navigator.maxTouchPoints;
	    }
	  }]);
	
	  return Utils;
	}();
	
	exports.default = Utils;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=app.js.map