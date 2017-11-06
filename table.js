const Table = require('cli-table2');
const blockchain = require('./blockchain.js');
const colors = require('colors/safe');

function prettyPrintBlockchain(blockchain) {
  blockchain.forEach((block, index) => {
    const table = new Table({
      style:{border:[],header:[]},
      wordWrap: true,
      colWidths:[18,40]
    });
    const object = JSON.parse(JSON.stringify(block))
    for(let key in object) {
      if (key === 'index') {
        const blockNumber = object[key]
        if (blockNumber === 0) {
          table.push([{colSpan:2,content:colors.green.bold("Genesis Block"), hAlign:'center'}])
        } else {
          table.push([{colSpan:2,content:colors.green.bold(`Block #${object[key]}`), hAlign:'center'}])
        }
      } else {
        const obj = {};
        if (key === 'previousHash') {
          obj[`${colors.red('Previous Hash')}`] = object[key]
        } else if (key === 'timestamp') {
          obj[`${colors.red('Timestamp')}`] = new Date(object[key] * 1000).toUTCString()
        } else if (key === 'data') {
           obj[`${colors.red('Data')}`] = object[key]
        } else if (key === 'hash') {
          obj[`${colors.red('Hash')}`] = object[key]
        } else if (key === 'nonce') {
          obj[`${colors.red('Nonce')}`] = object[key]
        }
        table.push(obj)
      }
    }
    console.log(table.toString())
  })
}

module.exports = prettyPrintBlockchain;