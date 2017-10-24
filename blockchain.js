const Block = require('./block')
const CryptoJS = require('crypto-js')

class Blockchain {
  constructor () {
    this.blockchain = [Block.genesis]
    this.difficulty = 4
  }

  get () {
    return this.blockchain
  }

  get latestBlock () {
    return this.blockchain[this.blockchain.length - 1]
  }

  mine (seed) {
    const newBlock = this.generateNextBlock(seed)
    if(this.addBlock(newBlock)) {
      console.log("Congratulations! A new block was mined.")
    }
  }

  replaceChain (newBlocks) {
    if (!this.isValidChain(newBlocks)) {
      console.log("Replacement chain is not valid. Won't replace existing blockchain.")
      return null;
    }

    if (newBlocks.length <= this.blockchain.length) {
      console.log("Replacement chain is shorter than original. Won't replace existing blockchain.")
      return null;
    }

    console.log('Received blockchain is valid. Replacing current blockchain with received blockchain')
    this.blockchain = newBlocks.map(json => new Block(
      json.index, json.previousHash, json.timestamp, json.data, json.hash, json.nonce
    ))
  }

  isValidChain (blockchainToValidate) {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(Block.genesis)) {
      return false
    }

    const tempBlocks = [blockchainToValidate[0]]
    for (let i = 1; i < blockchainToValidate.length; i = i + 1) {
      if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
        tempBlocks.push(blockchainToValidate[i])
      } else {
        return false
      }
    }
    return true
  }

  addBlock (newBlock) {
    if (this.isValidNewBlock(newBlock, this.latestBlock)) {
      this.blockchain.push(newBlock);
      return true;
    }
    return false;
  }

  addBlockFromPeer(json) {
    if (this.isValidNewBlock(json, this.latestBlock)) {
      this.blockchain.push(new Block(
        json.index, json.previousHash, json.timestamp, json.data, json.hash, json.nonce
      ))
    }
  }

  calculateHashForBlock (block) {
    return this.calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.nonce)
  }

  calculateHash (index, previousHash, timestamp, data, nonce) {
    return CryptoJS.SHA256(index + previousHash + timestamp + data + nonce).toString()
  }

  isValidNewBlock (newBlock, previousBlock) {
    const blockHash = this.calculateHashForBlock(newBlock);

    if (previousBlock.index + 1 !== newBlock.index) {
      console.log('new block has invalid index')
      return false
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log('new block has invalid previous hash')
      return false
    } else if (blockHash !== newBlock.hash) {
      console.log('invalid hash: ${blockHash} ${newBlock.has}')
      return false
    } else if (!this.isValidHashDifficulty(this.calculateHashForBlock(newBlock))) {
      console.log('invalid hash does not meet difficulty requirements: ${this.calculateHashForBlock(newBlock)}');
      return false;
    }
    return true
  }

  generateNextBlock (blockData) {
    const previousBlock = this.latestBlock;
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000
    let nonce = 0;
    let nextHash = '';
    while(!this.isValidHashDifficulty(nextHash)) {     
      nonce = nonce + 1;
      nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData, nonce);
    }
    const nextBlock = new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash, nonce);
    return nextBlock;
  }

  isValidHashDifficulty(hash) {
    for (var i = 0, b = hash.length; i < b; i ++) {
      if (hash[i] !== '0') {
        break;
      }
    }
    return i === this.difficulty;
  }
}

module.exports = new Blockchain()