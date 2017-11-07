const CryptoJS = require('crypto-js')
var readlineSync = require('readline-sync');
 
// Wait for user's response. 
var name = readlineSync.question('What is the name you want to hash? ');
var pk = readlineSync.question('What is the public key you want to hash? ');
findGenesisHash(name, pk);

function findGenesisHash(name, pk) {
	let nonce = 0;
	let nextHash = '';
	while (!isValidHashDifficulty(nextHash)) {
		nonce = nonce + 1;
		timestamp = new Date().getTime() / 1000;
		nextHash = calculateHash(0, 0, timestamp, name, pk, nonce);
	}
	console.log(nonce);
	console.log(timestamp);
	console.log(name);
	console.log(pk);
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

function calculateHash(index, previousHash, timestamp, name, pk, nonce) {
	return CryptoJS.SHA256(index + previousHash + timestamp + name + pk + nonce).toString();
}