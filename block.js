const {SHA256} = require('crypto-js');

module.exports = class Block {
  static get genesis() {
    return new Block(
      0,
      '0',
      1501122600,
      'Blockchain PKI System',
      '000098dd0adb728d0dd7949784b577cdf2d5b4609c40138d70bbd6ddade12f05',
      98921
    )
  }

  constructor(
    index = 0,
    previousHash = '0',
    timestamp = new Date().getTime() / 1000,
    data = 'none',
    hash = '',
    nonce = 0
  ) {
    this.index = index
    this.previousHash = previousHash.toString()
    this.timestamp = timestamp
    this.data = data
    this.hash = hash.toString()
    this.nonce = nonce
  }
}