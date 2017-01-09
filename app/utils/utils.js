export default class Utils {
  static componentToHex(c) {
    let hex = c.toString(16);

    return hex.length == 1 ? '0' + hex : hex;
  }

  static exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  static getFullscreenChangeEventName(element) {
    if (element.requestFullscreen) {
      return 'fullscreenchange';
    } else if (element.mozRequestFullScreen) {
      return 'mozfullscreenchange';
    } else if (element.webkitRequestFullscreen) {
      return 'webkitfullscreenchange';
    } else if (element.msRequestFullscreen) {
      return 'msfullscreenchange';
    }
  }

  static getFullScreenModeValue() {
    if (document.fullscreen) {
      return document.fullscreen;
    } else if (document.mozFullScreen) {
      return document.mozFullScreen;
    } else if (document.webkitIsFullScreen) {
      return document.webkitIsFullScreen;
    } else if (document.msIsFullScreen) {
      return document.msIsFullScreen;
    }
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

  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
  }

  static requestFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  static rgbToHex(value) {
    let result = /rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/.exec(value);
    let r = parseInt(result[1], 10);
    let g = parseInt(result[2], 10);
    let b = parseInt(result[3], 10);

    return "#" + Utils.componentToHex(r) + Utils.componentToHex(g) + Utils.componentToHex(b);
  }
}