const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  QUERY_PEERS,
  RESPONSE_PEERS,
  SEND_MINER_ID,
  RESPONSE_MINER_ID,
  UPDATE_BLOCK_MINER
} = require('./response-type');

class Responses {
  getQueryChainLengthMsg () {
    console.log('Asking peer for latest block');
    return {
      type: QUERY_LATEST
    }
  }

  getQueryAllMsg () {
    console.log('Asking peer for entire blockchain');
    return {
      type: QUERY_ALL
    }
  }

  getResponseChainMsg (blockchain) {
    console.log('Sending peer entire blockchain');
    return {
      type: RESPONSE_BLOCKCHAIN,
      data: JSON.stringify(blockchain.get())
    }
  }

  getResponseLatestMsg (blockchain) {
    console.log('Sending peer latest block');
    return {
      type: RESPONSE_BLOCKCHAIN,
      data: JSON.stringify([
        blockchain.latestBlock
      ])
    }
  }

  getQueryPeerList() {
    console.log('Asking peer for peer list');
    return {
      type:QUERY_PEERS
    }
  }

  getResponsePeerList(peerList) {
    console.log('Sending peer list');
    return {
      type: RESPONSE_PEERS,
      data: peerList.toString()
    }
  }

  sendMinerID(minerID) {
    console.log('Sending Miner ID = ' + minerID);
    return {
      type: RESPONSE_MINER_ID,
      data: minerID.toString()
    }
  }

  updateBlock(name, publickey, minerID){
    console.log('Updating Block for Miner ID = ' + minerID);
    var obj = {};
    obj.name = name;
    obj.publickey = publickey;
    obj.minerID = minerID;
    return {
      type: UPDATE_BLOCK_MINER,
      data: JSON.stringify(obj)
    }
  }
}

const responses = new Responses()
module.exports = responses