'use strict';

var should = require('should');
should = should || should;
var concord = require('../index.js');

const PORT = 44044;

describe('server', () => {
    it('should announce client connection', (done) => {
        let server = new concord.Server();
        server.listen(PORT).then(() => {
            let client = new concord.Client();
            client.connect(PORT);
            server.on('client connected', (cl) => {
                should.exist(server.getClient(cl.name));
                server.clients.size.should.equal(1);
                done();
            });
        });
    });

    it('should receive message from client', (done) => {
        getServerClient().then((members) => {
            let server = members.server;
            let client = members.client;
            let message = 'test123';
            server.on('message', (msg) => {
                msg.should.equal(message);
                done();
            });
            client.sendMessage(message);
        });
        done();
    });
});

describe('client', () => {
    it('should connect to server', (done) => {
        let server = new concord.Server();
        server.listen(PORT).then(() => {
            let client = new concord.Client();
            client.connect(PORT);
            server.on('client connected', (cl) => {
                should.exist(client.connection);
                should.exist(client.disconnectTimeout);
                should.exist(cl.disconnectTimeout);
                done();
            });
        });
    });
});

function getServerClient() {
    let server = new concord.Server();
    return server.listen(PORT).then(() => {
        let client = new concord.Client();
        return client.connect(PORT).then(() => {
            return {
                server: server,
                client: client
            };
        });
    });
}

