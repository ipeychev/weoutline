class BrowserHelper {
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

  static isFullScreenSupported() {
    let res = BrowserHelper.getFullScreenModeValue();

    return (typeof res === 'boolean');
  }

  static getFullScreenModeValue() {
    if (typeof document.fullscreen === 'boolean') {
      return document.fullscreen;
    } else if (typeof document.mozFullScreen === 'boolean') {
      return document.mozFullScreen;
    } else if (typeof document.webkitIsFullScreen === 'boolean') {
      return document.webkitIsFullScreen;
    } else if (typeof document.msIsFullScreen === 'boolean') {
      return document.msIsFullScreen;
    }
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
}

export default BrowserHelper;