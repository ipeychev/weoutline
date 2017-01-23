class URLHelper {
  static getPathAttributeValue(attributeName, uri) {
    uri = uri || window.location.href;

    let regex = new RegExp('(?:&|\\?)' + attributeName + '=([^&]+|.+$)');

    let match = regex.exec(uri);

    return match ? match[1] : null;
  }
}


export default URLHelper;