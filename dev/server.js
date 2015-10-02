var concord = require('../');

const PORT = 44044;

var server = new concord.Server();
server.listen(PORT).then(() => {
    console.log('should be listening');
    var client = new concord.Client();
    client.connect(PORT).then(() => {
        console.log('sent smth');
    });
});

