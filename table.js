const Table = require('cli-table2');
const blockchain = require('./blockchain.js');
const colors = require('colors/safe');

function prettyPrintBlockchain(blockchain) {
	blockchain.forEach((block, index) => {
		const table = new Table({
			style: {
				border: [],
				header: []
			},
			wordWrap: true,
			colWidths: [18, 40]
		});
		const object = JSON.parse(JSON.stringify(block))
		for (let key in object) {
			const obj = {}
			if (key === 'index') {
				table.push([{
					colSpan: 2,
					content: colors.green.bold(`Block #${object[key]}`),
					hAlign: 'center'
				}])
			} else {
				if (key === 'previousHash') {
					obj[`${colors.blue('Previous Hash')}`] = object[key]
				} else if (key === 'timestamp') {
					obj[`${colors.blue('Timestamp')}`] = new Date(object[key] * 1000).toUTCString()
				} else if (key === 'name') {
					obj[`${colors.blue('Name')}`] = object[key]
				} else if (key === 'publickey') {
					obj[`${colors.blue('Public Key')}`] = object[key]
				} else if (key === 'hash') {
					obj[`${colors.blue('Hash')}`] = object[key]
				} else if (key === 'nonce') {
					obj[`${colors.blue('Nonce')}`] = object[key]
				} else if (key === 'minerID') {
					obj[`${colors.blue('Miner ID')}`] = object[key]
				}
				table.push(obj)
			}
		}
		console.log(table.toString())
	})
}

module.exports = prettyPrintBlockchain;