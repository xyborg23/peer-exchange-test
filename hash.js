const CryptoJS = require('crypto-js')
var readlineSync = require('readline-sync');
 
// Wait for user's response. 
var text = readlineSync.question('What is the text you want to hash? ');
findGenesisHash(text);

function findGenesisHash(text) {
	let nonce = 0;
	let nextHash = '';
	while (!isValidHashDifficulty(nextHash)) {
		nonce = nonce + 1;
		// old timestamp = 1501122600
		timestamp = new Date().getTime() / 1000;
		nextHash = calculateHash(0, 0, timestamp, text, nonce);
	}
	console.log(nonce);
	console.log(timestamp);
	console.log(text)
;	console.log(nextHash);
}

function isValidHashDifficulty(hash) {
	for (var i = 0, b = hash.length; i < b; i++) {
		if (hash[i] !== '0') {
			break;
		}
	}
	return i === 4;
}

function calculateHash(index, previousHash, timestamp, data, nonce) {
	return CryptoJS.SHA256(index + previousHash + timestamp + data + nonce).toString();
}