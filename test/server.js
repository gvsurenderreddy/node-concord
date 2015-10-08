'use strict';

var should = require('should');
should = should || should;
var concord = require('../');

const PORT = 44044;
const testmsg = 'test123';

describe('server', () => {
    it('should announce client connection', (done) => {
        let server = new concord.Server();
        server.listen(PORT).then(() => {
            let client = new concord.Client();
            client.connect(PORT);
            server.on('client connected', (c) => {
                should.exist(server.getClient(c.name));
                server.clients.size.should.equal(1);
                server.getClient(c.name).port.should.equal(client.connection._socket.address().port);
                done();
            });
        });
    });

    it('should receive message from client', (done) => {
        getServerClient().then((members) => {
            let server = members.server;
            let client = members.client;
            server.on('message', (msg) => {
                msg.should.equal(testmsg);
                done();
            });
            client.sendMessage(testmsg);
        });
        done();
    });

    it('should support multiple client connections', (done) => {
        getServerClient().then((members) => {
            let server = members.server;
            let todo = [];
            for (let i = 0; i < 20; ++i) {
                let client = new concord.Client();
                todo.push(new Promise((resolve) => {
                    return client.connect(PORT).then(resolve);
                }));
            }
            Promise.all(todo).then(() => {
                server.clients.size.should.equal(todo.length + 1);
            });
            let count = 0;
            server.on('client connected', () => {
                if (++count !== todo.length) {
                    return;
                }
                server.clients.size.should.equal(todo.length + 1);
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

