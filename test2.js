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
	console.log('========================================');
}