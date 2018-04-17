/**
* Node class that handles peer to peer communication and adding to the chain
*
*/

const wrtc = require('wrtc');
const Exchange = require('peer-exchange');
const p2p = new Exchange('peer-network', { wrtc: wrtc });
const net = require('net');
const blockchain = require('./blockchain/index.js');
const responses = require('./responses')
const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  QUERY_PEERS,
  RESPONSE_PEERS,
  SEND_MINER_ID,
  RESPONSE_MINER_ID,
  UPDATE_BLOCK_MINER
} = require('./responses/response-type');

const colors = require('colors/safe');
const cli = require('clui');
const spinner = cli.spinner;

class PeerToPeer{
	constructor () {
		this.peers = [];
		this.minerID = -1;
		this.name_key = {};
	}

	// Start a network 
	startServer(port) {
		this.minerID = 0;
		const server = net.createServer(socket => p2p.accept(socket, (err, connection) => {
			if(err) {
				console.log(colors.red(`${err}`));
			}
			else {
				console.log(colors.green('A peer has connected to the network!'));
				this.initConnection.call(this, connection);
			}
		})).listen(port);
		// console.log(`Listening to peers on ${server.address().address}:${server.address().port}`);
	}

	// Connect to a network and update the blockchain
	connectToPeer(host, port) {
		const socket = net.connect(port, host, () => p2p.connect(socket, (err, connection) => {
			if (err) {
				console.log(colors.red(`${err}`));
			} else {
				console.log(colors.green('Successfully connected to a new peer!'));
				this.initConnection.call(this, connection);
				this.updateBlockchain();
			}
		}));
	}

	// Check if the default port is in use
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

	// Query the peers on the network
	discoverPeers() {
		var mainPeer = this.peers[0];
		this.write(mainPeer, responses.getQueryPeerList());
	}

	// Initialize a connection, and add peer to node's peer list
	initConnection(connection) {
		this.peers.push(connection);
		this.initMessageHandler(connection);
		this.initErrorHandler(connection);
		if(this.minerID == 0) {
			this.sendMinerID(connection);
		}
	}

	// Entry point for messages from other peers
	initMessageHandler(connection) {
		connection.on('data', data => {
			const message = JSON.parse(data.toString('utf8'));
			this.handleMessage(connection, message);
		})
	}

	// Send the miner's ID to the requesting peer
	sendMinerID(connection) {
		this.write(connection, responses.sendMinerID(this.peers.length));
	}

	// Set the miner's ID
	setMinerID(message) {
		this.minerID = Number(message.data);
	}

	// Handle the different types of messages received from peers
	handleMessage(peer, message) {
		switch (message.type) {
			case QUERY_LATEST:
				// console.log(colors.magenta('Peer requested for latest block.'));
				this.write(peer, responses.getResponseLatestMsg(blockchain));
				break;
			case QUERY_ALL:
				// console.log(colors.magenta('Peer requested for blockchain.'));
				this.write(peer, responses.getResponseChainMsg(blockchain));
				break;
			case RESPONSE_BLOCKCHAIN:
				this.handleBlockchainResponse(message);
				break;
			case QUERY_PEERS:
				// console.log(colors.magenta('Peer requested for peer list'));
				this.write(peer, responses.getResponsePeerList(this.peers));
				break;
			case RESPONSE_PEERS:
				this.handlePeerList(message);
				break;
			case RESPONSE_MINER_ID:
				// console.log(colors.magenta('Received miner ID from peer'));
				this.setMinerID(message);
				break;
			case UPDATE_BLOCK_MINER:
				// console.log(colors.magenta('Checking if this is the current Miner'));
				var obj = JSON.parse(message.data);
				this.mineUpdate2(obj.name, obj.publickey, obj.minerID);
				break;
			default:
				console.log(colors.red(`Received unknown message type ${message.type}`));
		}
	}

	// Set up error handling
	initErrorHandler(connection) {
		connection.on('error', error => console.log(colors.red(`${error}`)));
	}

	// Broadcast latest message to the other peers on the network
	broadcastLatest() {
		this.broadcast(responses.getResponseLatestMsg(blockchain));
	}

	// Broadcast message to all the other peers
	broadcast(message) {
		this.peers.forEach(peer => this.write(peer, message));
	}

	// Write a JSON message
	write(peer, message) {
		peer.write(JSON.stringify(message));
	}

	// Close the connection
	closeConnection() {
		process.exit();
	}

	// Handle peer list message
	handlePeerList(message) {
		// const receivedPeerList = JSON.parse(message.data);
		console.log(message.data);
	}

	// Add block or chain to node's chain
	handleBlockchainResponse(message) {
		const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
		const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
		const latestBlockHeld = blockchain.latestBlock;

		const blockOrChain = receivedBlocks.length === 1 ? 'single block' : 'blockchain';
		//console.log(colors.yellow(`Peer sent over ${blockOrChain}.`));

		if (latestBlockReceived.index == latestBlockHeld.index) {
			blockchain.replaceChain(receivedBlocks);
			return null;
		} else if (latestBlockReceived.index < latestBlockHeld.index) {
			//console.log(colors.yellow('Received latest block is not longer than current blockchain. Do nothing'));
			return null;
		}

		//console.log(colors.yellow(`Blockchain possibly behind. Received latest block is #${latestBlockReceived.index}. Current latest block is #${latestBlockHeld.index}.`));
		if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
			//console.log(colors.yellow('Previous hash received is equal to current hash. Append received block to blockchain.'));
			blockchain.addBlockFromPeer(latestBlockReceived);
			this.broadcast(responses.getResponseLatestMsg(blockchain));
		} else if (receivedBlocks.length === 1) {
			//console.log(colors.yellow('Received previous hash different from current hash. Get entire blockchain from peer.'));
			this.broadcast(responses.getQueryAllMsg());
		} else {
			//console.log(colors.green('Peer blockchain is longer than current blockchain.'));
			blockchain.replaceChain(receivedBlocks);
			this.broadcast(responses.getResponseLatestMsg(blockchain));
		}
	}

	// Broadcast query to get all blocks
	updateBlockchain() {
		this.broadcast(responses.getQueryAllMsg());
	}

	printBlockchain() {
		// console.log(JSON.stringify(blockchain));
		console.log(JSON.stringify(blockchain, null, 2));
	}

	// Mine a new block with name and public key
	mine(name, publickey) {
		blockchain.mine(name, publickey, this.minerID);
	}

	// Send message to miner to update block
	mineUpdate(name, publickey) {
		if(this.ensureBlockIsValid(name, publickey)) {
			var minerToUpdate = blockchain.findMinerID(name);
			this.mineUpdate2(name, publickey, minerToUpdate);
		} else {
			console.log(colors.red('Block does not exist! Enter a valid block'));
		}
	}

	mineUpdate2(name, publickey, minerToUpdate) {
		// minerToUpdate = blockchain.findMinerID(name);
		if (minerToUpdate == -1 ) {
			// TODO: Make this broadcast and have all miners mine
			blockchain.mine(name, publickey, this.minerID);
			this.broadcastLatest();
		} else if (this.minerID == minerToUpdate) {
			blockchain.mine(name, publickey, this.minerID);
			this.broadcastLatest();
		} else {
			this.broadcast(responses.updateBlock(name, publickey, minerToUpdate));
		}
	}

	// Mine a new block with the revoke flag on
	mineRevoke(name, publickey) {
		if(this.ensureBlockIsValid(name, publickey))
			blockchain.mine(name, publickey, this.minerID, true);
		else
			console.log(colors.red('Block does not exist! Enter a valid block'));
	}

	ensureBlockIsValid(name, publickey) {
		var chain = blockchain.get();
		var flag = true;
		for(var i = chain.length-1; i >= 0; i--) {
			var blockName = chain[i].name;
			var blockPublicKey = chain[i].publickey;
			var revoked = chain[i].revoked;
			if(blockName === name) {
				if(blockPublicKey == publickey && !revoked) {
					return true;
				}
				return false;
			}
		}
		return false;
	}

	// Given a name, public key pair, return if the pair is valid (i.e. the public key matches the latest entry for the name)
	validatePair(name, public_key) {
		this.ensureBlockIsValid(name, public_key) ? console.log(colors.green('The pair is valid!')) : console.log(colors.red('This pair is not valid.'));
	}

	// Query name from the blockchain
	queryName(queryName) {
		var chain = blockchain.get();
		var flag = true;
		// console.log(chain.length);
		for (var i = chain.length - 1; i >= 0; i--) {
			var name = chain[i].name;
			var public_key = chain[i].publickey;
			var revoked = chain[i].revoked;
			if(queryName === name) {
				if(revoked) {
					console.log(colors.red(`Name ${name} is revoked!`));
				} else {
					console.log(colors.magenta(`Name: ${name}, Public Key: ${public_key}`));
				}
				flag = false;
				break;
			}
		}
		if(flag) {
			console.log(colors.red('Could not find valid name in current blockchain'));
		}
	}

	// Query particular public key from blockchain
	queryKey(queryPK) {
		var chain = blockchain.get();
		var flag = true;
		// console.log(chain.length);
		var index = chain.length - 1;
		var name;
		var public_key;
		for (; index >= 0; index--) {
			name = chain[index].name;
			public_key = chain[index].publickey;
			var revoked = chain[index].revoked;
			if(queryPK == public_key) {
				if(revoked) {
					console.log(colors.red(`Public Key is revoked!`));
				} else {
					console.log(colors.magenta(`Name: ${name}, Public Key: ${public_key}`));
				}
				flag = false;
				break;
			}
		}
		if(flag) {
			console.log(colors.red('Could not find the public key in current blockchain'));
		}
		else {
			var indexName = this.checkLatestName(name);
			if(indexName > index) {
				console.log(colors.yellow('The queried public key is no longer valid'));
			}
		}
	}

	// Find latest block with name
	checkLatestName(queryName) {
		var chain = blockchain.get();
		for (let i = chain.length - 1; i >= 0; i--) {
			var name = chain[i].name;
			if(queryName === name) {
				return i;
			}
		}
		return -1;
	}

}

module.exports = new PeerToPeer();