const readline = require('readline')
var node = require("./test.js");
const readlineSync = require('readline-sync');
var stdin = process.openStdin();

printmenu();

stdin.addListener("data", function(d) {
	var choice = d.toString();
	if(choice.charAt(0) == '4'){
		var txt = choice.slice(1, choice.length).trim();
		choice = choice.charAt(0);
		console.log('MINING  >>>>>>>>>>>');
		node.mine(txt);
		node.broadcastLatest();
	}
	choice = choice.charAt(0);
	console.log('Choice is ' + choice);
	choice = Number(choice);
	switch (choice) {
		case 1:
			console.log('Creating network.....');
			node.startServer(8000);
			break;
		case 2:
			console.log('Connecting to peer.....');
			node.connectToPeer('localhost', 8000);
			break;
		case 3:
			console.log('Printing current chain.....');
			node.printBlockchain();
			break;
		case 4:
			// const rl = readline.createInterface({
			// 	input: process.stdin,
			// 	output: process.stdout
			// });
			// rl.on('line', (answer) => {
			// 		console.log(answer);
			// 		rl.close();
			// 	})
				// var text = readlineSync.question('Enter data for the block:');
			// node.mine(text);
			break;
		case 5:
			node.updateBlockchain();
			// node.discoverPeers();
			break;
		case 6:
			console.log('Exiting.....');
			node.closeConnection();
			break;
		case 7:
			node.portInUse(8000, function(returnValue) {
				console.log(returnValue);
				if(returnValue) {
					node.connectToPeer('localhost', 8000);
				}
				else {
					node.startServer(8000);
				}
			});
			break;
		case 8: 
			node.queryName('blah');
			break;
		case 9: 
			node.queryKey('blah');
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
	console.log('1 - Start Network');
	console.log('2 - Connect to peer');
	console.log('3 - Print Current Blockchain');
	console.log('4 - Mine a block');
	console.log('5 - Update Blockchain');
	console.log('6 - Exit');
	console.log('7 - Join Network');
	console.log('8 - Query a name');
	console.log('9 - Query a public key');
	console.log('========================================');
	process.stdout.write('Choice: ');
}