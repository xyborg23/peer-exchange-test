/**
* Blockchain class with functionality for adding, removing, updating blocks in the chain 
*
*/

const Block = require('./block/index.js');
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

  // Add new block to the chain
  mine (name, pk, minerID, revoked=false) {
    const newBlock = this.generateNextBlock(name, pk, minerID, revoked)
    if(this.addBlock(newBlock)) {
      console.log(colors.green("Congratulations! A new block was mined."));
    }
  }

  // Replace chain only if newBlocks is valid
  replaceChain (newBlocks) {
    if (!this.isValidChain(newBlocks)) {
      return null;
    }

    if (newBlocks.length == this.blockchain.length) {
      var newLastBlock = newBlocks[newBlocks.length - 1];
      var thisLastBlock = this.blockchain[this.blockchain.length - 1];
      if(newLastBlock.timestamp < thisLastBlock.timestamp) {
        this.blockchain = newBlocks.map(json => new Block(
          json.index, json.previousHash, json.timestamp, json.name, json.publickey, json.hash, json.nonce, json.minerID, json.revoked
        ));
        return null;
      } else {
        return null;
      }
    } else if (newBlocks.length < this.blockchain.length) {
      //console.log(colors.magenta("Replacement chain is shorter than original. Won't replace existing blockchain."));
      return null;
    }

    //console.log(colors.magenta('Received blockchain is valid. Replacing current blockchain with received blockchain'));
    this.blockchain = newBlocks.map(json => new Block(
      json.index, json.previousHash, json.timestamp, json.name, json.publickey, json.hash, json.nonce, json.minerID, json.revoked
    ));
  }

  // Check if each block's numbers and timestamps are greater than the previous ones
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

  // Add a new block to the chain
  addBlock (newBlock) {
    if (this.isValidNewBlock(newBlock, this.latestBlock)) {
      this.blockchain.push(newBlock);
      return true;
    }
    return false;
  }

  // Parse JSON and add the new block to the chain
  addBlockFromPeer(json) {
    if (this.isValidNewBlock(json, this.latestBlock)) {
      this.blockchain.push(new Block(
        json.index, json.previousHash, json.timestamp, json.name, json.publickey, json.hash, json.nonce, json.minerID, json.revoked
      ))
    }
  }

  calculateHashForBlock (block) {
    return this.calculateHash(block.index, block.previousHash, block.timestamp, block.name, block.publickey, block.nonce);
  }

  // Calculate hash using all the information on the block using SHA-256
  calculateHash (index, previousHash, timestamp, name, publickey, nonce) {
    return CryptoJS.SHA256(index + previousHash + timestamp + name + publickey + nonce).toString();
  }

  // Check if the block is valid wrt to previous block
  isValidNewBlock (newBlock, previousBlock) {
    const blockHash = this.calculateHashForBlock(newBlock);

    if (previousBlock.index + 1 !== newBlock.index) {
      //console.log(colors.red('New block has invalid index'));
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      //console.log(colors.red('new block has invalid previous hash'));
      return false;
    } else if (blockHash !== newBlock.hash) {
      //console.log(colors.red(`invalid hash: ${blockHash} ${newBlock.hash}`));
      return false;
    } else if (!this.isValidHashDifficulty(this.calculateHashForBlock(newBlock))) {
      //console.log(colors.red(`invalid hash does not meet difficulty requirements: ${this.calculateHashForBlock(newBlock)}`));
      return false;
    }
    return true
  }

  // Create a new block to add to the chain
  generateNextBlock (blockName, blockPublicKey, minerID, revoked) {
    const previousBlock = this.latestBlock;
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000;
    let nonce = 0;
    let nextHash = '';
    while(!this.isValidHashDifficulty(nextHash)) {     
      nonce = nonce + 1;
      nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockName, blockPublicKey, nonce);
    }
    const nextBlock = new Block(nextIndex, previousBlock.hash, nextTimestamp, blockName, blockPublicKey, nextHash, nonce, minerID, revoked);
    return nextBlock;
  }

  // Check if the hash is valid
  isValidHashDifficulty(hash) {
    for (var i = 0, b = hash.length; i < b; i ++) {
      if (hash[i] !== '0') {
        break;
      }
    }
    return i === this.difficulty;
  }

  // Get Miner ID for a particular name
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