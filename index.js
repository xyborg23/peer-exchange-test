const wrtc = require('wrtc');
const net = require('net');

var Exchange = require('peer-exchange');

var ex = new Exchange('peer-network', { wrtc: wrtc });

const peers = [];

var server = net.createServer((socket) => ex.accept(socket));
server.listen(8000);

const socket = net.connect(8000, 'localhost', () => ex.connect(socket, (err, connection) => {
    if (err) {
    	console.log(`❗  ${err}`);
    } else {
	    console.log('👥  Successfully connected to a new peer!');
	    connection.write('in the socket code');
    }
}));

ex.on('connect', (conn) => {
	// conn.pipe(socket).pipe(conn);
	console.log('connection made 1!');
	// console.log(conn);
	var str = 'did this work?';
	var message = JSON.parse(str.toString('utf8'));
    initConnection(conn);
	conn.write(message);
	// socket.write('Echo server \r\n');
})

// ex.on('error', (err) => {
// 	console.log("ERROR");
// })

ex.on('data', function(data) {
	console.log('In the data function');
	console.log(data);
})

function initConnection(connection) {
	peers.push(connection);
	initMessageHandler(connection);
	write(connection, 'write1');
}

function initMessageHandler(connection) {
	connection.on('data', data => {
		const message = JSON.parse(data.toString('utf8'));
		handleMessage(connection, message);
	})
}

function handleMessage(peer, message) {
	write(peer, 'write2');
}

function write(peer, message) {
	peer.write(JSON.stringify(message));
}
