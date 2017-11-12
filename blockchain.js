const Block = require('./block');
const CryptoJS = require('crypto-js');
const colors = require('colors/safe');

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

  mine (name, pk, minerID) {
    const newBlock = this.generateNextBlock(name, pk, minerID)
    if(this.addBlock(newBlock)) {
      console.log(colors.green("Congratulations! A new block was mined."));
    }
  }

  replaceChain (newBlocks) {
    if (!this.isValidChain(newBlocks)) {
      console.log(colors.magenta("Replacement chain is not valid. Won't replace existing blockchain."));
      return null;
    }

    if (newBlocks.length <= this.blockchain.length) {
      console.log(colors.magenta("Replacement chain is shorter than original. Won't replace existing blockchain."));
      return null;
    }

    console.log(colors.magenta('Received blockchain is valid. Replacing current blockchain with received blockchain'));
    this.blockchain = newBlocks.map(json => new Block(
      json.index, json.previousHash, json.timestamp, json.name, json.publickey, json.hash, json.nonce, json.minerID
    ))
  }

  isValidChain (blockchainToValidate) {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(Block.genesis)) {
      return false;
    }

    const tempBlocks = [blockchainToValidate[0]]
    for (let i = 1; i < blockchainToValidate.length; i = i + 1) {
      if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
        tempBlocks.push(blockchainToValidate[i])
      } else {
        return false;
      }
    }
    return true;
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
        json.index, json.previousHash, json.timestamp, json.name, json.publickey, json.hash, json.nonce, json.minerID
      ))
    }
  }

  calculateHashForBlock (block) {
    return this.calculateHash(block.index, block.previousHash, block.timestamp, block.name, block.publickey, block.nonce);
  }

  calculateHash (index, previousHash, timestamp, name, publickey, nonce) {
    return CryptoJS.SHA256(index + previousHash + timestamp + name + publickey + nonce).toString();
  }

  isValidNewBlock (newBlock, previousBlock) {
    const blockHash = this.calculateHashForBlock(newBlock);

    if (previousBlock.index + 1 !== newBlock.index) {
      console.log(colors.red('New block has invalid index'));
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log(colors.red('new block has invalid previous hash'));
      return false;
    } else if (blockHash !== newBlock.hash) {
      console.log(colors.red(`invalid hash: ${blockHash} ${newBlock.hash}`));
      return false;
    } else if (!this.isValidHashDifficulty(this.calculateHashForBlock(newBlock))) {
      console.log(colors.red(`invalid hash does not meet difficulty requirements: ${this.calculateHashForBlock(newBlock)}`));
      return false;
    }
    return true
  }

  generateNextBlock (blockName, blockPublicKey, minerID) {
    const previousBlock = this.latestBlock;
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000;
    let nonce = 0;
    let nextHash = '';
    while(!this.isValidHashDifficulty(nextHash)) {     
      nonce = nonce + 1;
      nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockName, blockPublicKey, nonce);
    }
    const nextBlock = new Block(nextIndex, previousBlock.hash, nextTimestamp, blockName, blockPublicKey, nextHash, nonce, minerID);
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

  findMinerID(name) {
    for(let i = 0; i < this.blockchain.length; i ++) {
      if(this.blockchain[i].name == name) {
        return this.blockchain[i].minerID;
      }
    }
    return -1;
  }
}

module.exports = new Blockchain()