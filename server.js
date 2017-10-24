const wrtc = require('wrtc');
const Exchange = require('peer-exchange');
const p2p = new Exchange('blockchain.js', { wrtc: wrtc });
const net = require('net');

class PeerToPeer {
  constructor() {
    this.peers = [];
  }

  startServer (port) {
    const server = net.createServer(socket => p2p.accept(socket, (err, connection) => {
      if (err) {
        console.log(`❗  ${err}`);
      } else {
        console.log('👥  A peer has connected to the server!')
        this.initConnection.call(this, connection)
      }
    })).listen(port);
    console.log(`📡  listening to peers on ${server.address().address}:${server.address().port}... `);
  }

  connectToPeer(host, port) {
    const socket = net.connect(port, host, () => p2p.connect(socket, (err, connection) => {
      if (err) {
        console.log(`❗  ${err}`);
      } else {
        console.log('👥  Successfully connected to a new peer!');
        this.initConnection.call(this, connection);
      }
    }));
  }

  discoverPeers() {
    p2p.getNewPeer((err) => {
      if (err) {
        console.log(`❗  ${err}`);
      } else {
        console.log('👀  Discovered new peers.') //todo
      }
    })
  }

  initConnection(connection) {
    this.peers.push(connection);
    this.initMessageHandler(connection);
    this.initErrorHandler(connection);
    this.write(connection, messages.getQueryChainLengthMsg());
  }

  initMessageHandler(connection) {
    connection.on('data', data => {
      const message = JSON.parse(data.toString('utf8'));
      this.handleMessage(connection, message);
    })
  }

  handleMessage(peer, message) {
    switch (message.type) {
      case QUERY_LATEST:
        console.log(`⬇  Peer requested for latest block.`);
        this.write(peer, messages.getResponseLatestMsg(blockchain))
        break
      case QUERY_ALL:
        console.log("⬇  Peer requested for blockchain.");
        this.write(peer, messages.getResponseChainMsg(blockchain))
        break
        break
      default:
        console.log(`❓  Received unknown message type ${message.type}`)
    }
  }

  initErrorHandler(connection) {
    connection.on('error', error => console.log(`❗  ${error}`));
  }

  broadcastLatest () {
    this.broadcast(messages.getResponseLatestMsg(blockchain))
  }

  broadcast(message) {
    this.peers.forEach(peer => this.write(peer, message))
  }

  write(peer, message) {
    peer.write(JSON.stringify(message));
  }

  closeConnection() {

  }

  handleBlockchainResponse(message) {
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = blockchain.latestBlock;

    const blockOrChain = receivedBlocks.length === 1 ? 'single block' : 'blockchain';
    console.log(`⬇  Peer sent over ${blockOrChain}.`);

    if (latestBlockReceived.index <= latestBlockHeld.index) {
      console.log(`💤  Received latest block is not longer than current blockchain. Do nothing`)
      return null;
    }

    console.log(`🐢  Blockchain possibly behind. Received latest block is #${latestBlockReceived.index}. Current latest block is #${latestBlockHeld.index}.`);
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      console.log(`👍  Previous hash received is equal to current hash. Append received block to blockchain.`)
      blockchain.addBlockFromPeer(latestBlockReceived)
      this.broadcast(messages.getResponseLatestMsg(blockchain))
    } else if (receivedBlocks.length === 1) {
      console.log(`🤔  Received previous hash different from current hash. Get entire blockchain from peer.`)
      this.broadcast(messages.getQueryAllMsg())
    } else {
      console.log(`⛓  Peer blockchain is longer than current blockchain.`)
      blockchain.replaceChain(receivedBlocks)
      this.broadcast(messages.getResponseLatestMsg(blockchain))
    }
  }
}


module.exports = new PeerToPeer();