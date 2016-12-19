export default class Utils {
  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
  }
}