var concord = require('../');

const PORT = 44044;

var server = new concord.Server();
server.listen(PORT).then(() => {
    console.log('server should be listening');
    var client = new concord.Client();
    client.connect(PORT).then(() => {
        console.log('actual client should be connected');
        client.sendMessage('asd');
        client.on('message', (msg) => {
            console.log('actual client got', msg);
        });
        client.on('disconnect', (reason) => {
            console.log('actual client disconnected:', reason);
        });
    });
    server.on('client connected', (client) => {
        console.log('server client connected', client.name);
        client.on('message', (msg) => {
            console.log('server client got message', client.name, msg);
        });
        client.on('disconnect', (reason) => {
            console.log('server client disconnected', reason);
        });
        server.broadcast('got new client!');
    });
});

