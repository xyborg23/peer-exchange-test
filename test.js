const wrtc = require('wrtc');
const Exchange = require('peer-exchange');
const p2p = new Exchange('peer-network', { wrtc: wrtc });
const net = require('net');
const blockchain = require('./blockchain.js');
const responses = require('./responses')
const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  QUERY_PEERS,
  RESPONSE_PEERS
} = require('./responses/response-type');

const colors = require('colors/safe');

class PeerToPeer{
	constructor () {
		this.peers = [];
	}

	startServer(port) {
		const server = net.createServer(socket => p2p.accept(socket, (err, connection) => {
			if(err) {
				console.log(`${err}`);
			}
			else {
				console.log('A peer has connected to the server!');
				this.initConnection.call(this, connection);
			}
		})).listen(port);
		// console.log(`Listening to peers on ${server.address().address}:${server.address().port}`);
	}

	connectToPeer(host, port) {
		const socket = net.connect(port, host, () => p2p.connect(socket, (err, connection) => {
			if (err) {
				console.log(`${err}`);
			} else {
				console.log('Successfully connected to a new peer!');
				this.initConnection.call(this, connection);
			}
		}));
	}

	portInUse(port, callback) {
		var server = net.createServer(function(socket) {
			socket.write('Echo server\r\n');
			socket.pipe(socket);
		});

		server.listen(port);
		server.on('error', function(e) {
			callback(true);
		});
		server.on('listening', function(e) {
			server.close();
			callback(false);
		});
	};

	discoverPeers() {
		// p2p.getNewPeer((err) => {
		// 	if (err) {
		// 		console.log(`${err}`);
		// 	} else {
		// 		console.log('Discovered new peers.');
		// 		console.log(this.peers.length);
		// 	}
		// })
		var mainPeer = this.peers[0];
		this.write(mainPeer, responses.getQueryPeerList());
	}

	initConnection(connection) {
		this.peers.push(connection);
		this.initMessageHandler(connection);
		this.initErrorHandler(connection);
	}

	initMessageHandler(connection) {
		connection.on('data', data => {
			const message = JSON.parse(data.toString('utf8'));
			this.handleMessage(connection, message);
		})
	}

	handleMessage(peer, message) {
		console.log('Handle Message reached');
		switch (message.type) {
			case QUERY_LATEST:
				console.log('Peer requested for latest block.');
				this.write(peer, responses.getResponseLatestMsg(blockchain));
				break;
			case QUERY_ALL:
				console.log('Peer requested for blockchain.');
				this.write(peer, responses.getResponseChainMsg(blockchain));
				break;
			case RESPONSE_BLOCKCHAIN:
				this.handleBlockchainResponse(message);
				break;
			case QUERY_PEERS:
				console.log('Peer requested for peer list');
				this.write(peer, responses.getResponsePeerList(this.peers));
				break;
			case RESPONSE_PEERS:
				this.handlePeerList(message);
				break;
			default:
				console.log('Received unknown message type ${message.type}');
		}
	}

	initErrorHandler(connection) {
		connection.on('error', error => console.log('${error}'));
	}

	broadcastLatest() {
		this.broadcast(responses.getResponseLatestMsg(blockchain));
	}

	broadcast(message) {
		this.peers.forEach(peer => this.write(peer, message));
	}

	write(peer, message) {
		peer.write(JSON.stringify(message));
	}

	closeConnection() {
		process.exit();
	}

	handlePeerList(message) {
		// const receivedPeerList = JSON.parse(message.data);
		console.log(message.data);
	}

	handleBlockchainResponse(message) {
		const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
		const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
		const latestBlockHeld = blockchain.latestBlock;

		const blockOrChain = receivedBlocks.length === 1 ? 'single block' : 'blockchain';
		console.log('Peer sent over ${blockOrChain}.');

		if (latestBlockReceived.index <= latestBlockHeld.index) {
			console.log('Received latest block is not longer than current blockchain. Do nothing');
			return null;
		}

		console.log('Blockchain possibly behind. Received latest block is #${latestBlockReceived.index}. Current latest block is #${latestBlockHeld.index}.');
		if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
			console.log('Previous hash received is equal to current hash. Append received block to blockchain.');
			blockchain.addBlockFromPeer(latestBlockReceived);
			this.broadcast(responses.getResponseLatestMsg(blockchain));
		} else if (receivedBlocks.length === 1) {
			console.log('Received previous hash different from current hash. Get entire blockchain from peer.');
			this.broadcast(responses.getQueryAllMsg());
		} else {
			console.log('Peer blockchain is longer than current blockchain.');
			blockchain.replaceChain(receivedBlocks);
			this.broadcast(responses.getResponseLatestMsg(blockchain));
		}
	}

	updateBlockchain() {
		this.broadcast(responses.getQueryAllMsg());
	}

	printBlockchain() {
		// console.log(JSON.stringify(blockchain));
		console.log(JSON.stringify(blockchain, null, 2));
	}

	mine(text){
		blockchain.mine(text);
	}

	queryName(query) {
		var chain = blockchain.get();
		var flag = true;
		// console.log(chain.length);
		for (var i = chain.length - 1; i >= 0; i--) {
			var chain_data = chain[i].data;
			var words = chain_data.split(" ");
			var name = words[0];
			var public_key = words[1];
			if(query === name) {
				console.log(public_key);
				flag = false;
				break;
			}
		}
		if(flag) {
			console.log(colors.red('Could not find the query in current blockchain'));
		}
	}

	queryKey(query) {
		var chain = blockchain.get();
		var flag = true;
		// console.log(chain.length);
		for (var i = chain.length - 1; i >= 0; i--) {
			var chain_data = chain[i].data;
			var words = chain_data.split(" ");
			var name = words[0];
			var public_key = words[1];
			if(query === public_key) {
				console.log(name);
				flag = false;
				break;
			}
		}
		if(flag) {
			console.log(colors.red('Could not find the query in current blockchain'));
		}
	}

}

module.exports = new PeerToPeer();