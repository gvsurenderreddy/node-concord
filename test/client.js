'use strict';

var should = require('should');
should = should || should;
var concord = require('../');

const PORT = 44044;

describe('client', () => {
    it('should connect to server', (done) => {
        let server = new concord.Server();
        server.listen(PORT).then(() => {
            let client = new concord.Client();
            client.connect(PORT);
            server.on('client connected', (c) => {
                should.exist(client.connection);
                should.exist(client.disconnectTimeout);
                should.exist(c.disconnectTimeout);
                server.getClient(c.name).port.should.equal(client.connection._socket.address().port);
                done();
            });
        });
    });
});

