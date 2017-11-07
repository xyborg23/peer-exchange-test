const {SHA256} = require('crypto-js');

module.exports = class Block {
  static get genesis() {
    return new Block(
      0,
      '0',
      1509989748.459,
      'Blockchain PKI',
      '0',
      '0000849f7250903ea57f1614e1d16fc750a6c451e48cf52f769214e0c27e38ba',
      113708
    )
  }

  constructor(
    index = 0,
    previousHash = '0',
    timestamp = new Date().getTime() / 1000,
    name = 'none',
    publickey = '0',
    hash = '',
    nonce = 0
  ) {
    this.index = index
    this.previousHash = previousHash.toString()
    this.timestamp = timestamp
    this.name = name
    this.publickey = publickey.toString()
    this.hash = hash.toString()
    this.nonce = nonce
  }
}