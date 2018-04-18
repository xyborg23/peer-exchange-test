/**
* Command Line Interface class to handle commands from terminal 
*
*/

const vorpal = require('vorpal')();
const node = require('./node.js');
const blockchain = require('./blockchain/index.js');
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
				// node.updateBlockchain();
			} else {
				console.log('Starting the network....');
				node.startServer(port);
			}
		});
		callback();
	});

vorpal
	.command('register <name> <public_key>', 'Register a name with a public key')
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
	.command('update <name> <public_key>', 'Update an existing name with a new public key')
	.action(function(args, callback) {
		if(args.name && args.public_key) {
			var mine_progress = new Spinner('Mining a block, please wait...');
			mine_progress.start();
			node.mineUpdate(args.name, args.public_key);
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
	.command('revoke <name> <public_key>', 'Revoke a name and public key')
	.action(function(args, callback) {
		if(args.name && args.public_key) {
			var mine_progress = new Spinner('Mining a block, please wait...');
			mine_progress.start();
			node.mineRevoke(args.name, args.public_key);
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
	.command('validate <name> <public_key>', 'Check if a given name and public key pair is valid')
	.action(function(args, callback) {
		if(args.name && args.public_key) {
			node.validatePair(args.name, args.public_key);
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
	.command('updatechain', 'Update the blockchain with the latest blockchain')
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
	.delimiter('BC-PKM$')
	.show();