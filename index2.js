const wrtc = require('wrtc');
const net = require('net');

const Exchange = require('peer-exchange');

const ex = new Exchange('peer-network', { wrtc: wrtc });

const socket = net.connect(8000, 'localhost', () => ex.connect(socket));

ex.on('connect', (conn) => {
	console.log('connection made');
	// ex.emit('data', "data!");
	conn.write('did this work 2?');
	conn.write(JSON.stringify('in the index2 connect'));
})

// ex.on('error', (err) => {
// 	console.log("ERROR");
// })

ex.on('data', function(data) {
	console.log('In the data function');
	console.log(data);
})