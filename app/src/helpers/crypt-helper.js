class CryptHelper {
  static getId() {
    return Date.now().toString() + window.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  static getRandomBase64(length) {
    let ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    let str = '';

    for (var i = 0; i < length; i++) {
        let rand = Math.floor(Math.random() * ALPHABET.length);

        str += ALPHABET.substring(rand, rand + 1);
    }

    return str;
  }
}

export default CryptHelper;