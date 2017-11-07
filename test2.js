const readline = require('readline')
var node = require("./test.js");
const readlineSync = require('readline-sync');
var stdin = process.openStdin();
const blockchain = require('./blockchain.js');
const prettyPrintBlockchain = require('./table.js');

printmenu();

stdin.addListener("data", function(d) {
	var input = d.toString();
	var choice = input.charAt(0);
	var options = input.substring(1).trim();
	console.log('CHOICE IS ' + choice);
	console.log('OPTIONS IS ' + options);
	choice = Number(choice);
	switch (choice) {
		case 1:
			node.portInUse(8000, function(returnValue) {
				// console.log(returnValue);
				if(returnValue) {
					console.log('Connecting to the network....');
					node.connectToPeer('localhost', 8000);
					node.updateBlockchain();
				}
				else {
					console.log('Starting the network....');
					node.startServer(8000);
				}
			});
			break;
		case 2:
			console.log('MINING >>>>>>>>>>>>>>>>');
			options = options.split(' ');
			var option_name = options[0];
			var option_publickey = options[1];
			// console.log(`Option Name is ${option_name} and type ${typeof option_name}`);
			// console.log(`Option Public Key is ${option_publickey} and type ${typeof option_publickey}`);
			node.mine(option_name, option_publickey);
			node.broadcastLatest();
			break;
		case 3:
			console.log('Printing current chain.....');
			// node.printBlockchain();
			prettyPrintBlockchain(blockchain.blockchain);
			break;
		case 4:
			node.updateBlockchain();
			break;
		case 5:
			console.log('Querying for name ' + options);
			node.queryName(options);
			break;
		case 6:
			console.log('Querying for key ' + options);
			node.queryKey(options);
			break;
		case 7:
			break;
		case 8:
			console.log('Exiting.....');
			node.closeConnection();
			break;
		default:
			console.log('Sorry, unrecognized option, please enter a valid choice');
			break;
	}
	printmenu();
});

function printmenu() {
	console.log('========================================');
	console.log('ENTER A CHOICE');
	console.log('1 - Start Blockchain');
	console.log('2 - Mine a block');
	console.log('3 - Print Current Blockchain');
	console.log('4 - Update Blockchain');
	console.log('5 - Query a name');
	console.log('6 - Query a public key');
	console.log('7 - ');
	console.log('8 - Exit');
	console.log('========================================');
	process.stdout.write('Choice: ');
}