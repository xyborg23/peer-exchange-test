const vorpal = require('vorpal')();
const node = require('./test.js');
const blockchain = require('./blockchain.js');
const prettyPrintBlockchain = require('./table.js');
const colors = require('colors/safe');
const cli = require('clui');
const Spinner = cli.Spinner;

vorpal
	.command('start [port]', 'Start or connect to the network')
	.action(function(args, callback) {
		var port = 8000; // default port
		if(args.port) {
			if(typeof args.port === 'number') {
				port = args.port;
			}
			else {
				console.log(colors.red('Invalid port!'));
				console.log(colors.yellow('Using default port 8000'));
			}
		}
		node.portInUse(port, function(returnValue) {
			if (returnValue) {
				console.log('Connecting to the network....');
				node.connectToPeer('localhost', port);
				node.updateBlockchain();
			} else {
				console.log('Starting the network....');
				node.startServer(port);
			}
		});
		callback();
	});

vorpal
	.command('mine <name> <public_key>', 'Mine a new block')
	.action(function(args, callback) {
		if(args.name && args.public_key) {
			var mine_progress = new Spinner('Mining a block, please wait...');
			mine_progress.start();
			node.mine(args.name, args.public_key);
			node.broadcastLatest();
			mine_progress.stop();
		}
		else {
			console.log(colors.red('The arguments are invalid!'));
			console.log(colors.red('Enter both a name and public key'));
		}
		callback();
	});

vorpal
	.command('printchain', 'Print the current blockchain')
	.action(function(args, callback) {
		prettyPrintBlockchain(blockchain.blockchain);
		callback();
	});

vorpal
	.command('update', 'Update the blockchain with the latest blockchain')
	.action(function(args, callback) {
		node.updateBlockchain();
		callback();
	});

vorpal
	.command('queryname <name>', 'Query the blockchain for a name')
	.action(function(args, callback) {
		if(args.name) {
			node.queryName(args.name.toString());
		}
		else {
			console.log(colors.red('Invalid arguments!'));
		}
		callback();
	});

vorpal
	.command('querypk <public_key>', 'Query the blockchain for a public key')
	.action(function(args, callback) {
		if(args.public_key) {
			node.queryKey(args.public_key.toString());
		}
		else {
			console.log(colors.red('Invalid arguments!'));
		}
		callback();
	});

vorpal
	.command('stop', 'Exit the network')
	.action(function(args, callback) {
		node.closeConnection();
		callback();
	});

vorpal
	.delimiter('blockchainPKI$')
	.show();