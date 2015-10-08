'use strict';

var dgram = require('dgram');
var should = require('should');
should = should || should;
var Connection = require('../lib/Connection.js');
var Packet = require('../lib/Packet.js');

const PORT = 44044;
const testmsg = 'test123';

describe('connection', () => {
    describe('when listening', () => {
        it('should accept packets with its protocol', (done) => {
            let listener = new Connection();
            listener.listen(PORT).then(() => {
                let socket = dgram.createSocket({
                    type: 'udp4',
                    reuseAddr: false
                });
                let buffer = new Buffer(`${Packet.PROTOCOL_VERSION}0000${getHex(testmsg)}`, 'hex');
                socket.send(buffer, 0, buffer.length, PORT, 'localhost');
                listener._socket.on('message', (raw) => {
                    raw.slice(0, 2).toString('hex').should.equal(Packet.PROTOCOL_VERSION);
                });
                listener.on('message', (msg) => {
                    msg.should.equal(testmsg);
                    done();
                });
            });
        });

        it('should not accept packets with unknown protocol', (done) => {
            let listener = new Connection();
            listener.listen(PORT).then(() => {
                let socket = dgram.createSocket({
                    type: 'udp4',
                    reuseAddr: false
                });
                let buffer = new Buffer(`${Number(Packet.PROTOCOL_VERSION) + 1}0000${getHex(testmsg)}`, 'hex');
                socket.send(buffer, 0, buffer.length, PORT, 'localhost');
                listener._socket.on('message', (raw) => {
                    raw.slice(0, 2).toString('hex').should.equal(String(Number(Packet.PROTOCOL_VERSION) + 1));
                    done();
                });
                listener.on('message', () => {
                    throw new Error('This message should not be received');
                });
            });
        });
    });

    describe('when sending', () => {
        it('should send the protocol version', (done) => {
            getListeningSocket().then((socket) => {
                let connection = new Connection(null, PORT, '127.0.0.1');
                connection.send(testmsg);
                socket.on('message', (raw) => {
                    raw.slice(0, Packet.PROTOCOL_BUFFER.length).toString('hex').should.equal(Packet.PROTOCOL_VERSION);
                    done();
                });
            });
        });

        it.skip('should send the sequence', (done) => {
            getListeningSocket().then((socket) => {
                let connection = new Connection(null, PORT, '127.0.0.1');
                connection.send(testmsg);
                socket.on('message', (raw) => {
                    raw.slice(0, Packet.PROTOCOL_BUFFER.length).toString('hex').should.equal(Packet.PROTOCOL_VERSION);
                    done();
                });
            });
        });

        it('should send the payload', (done) => {
            getListeningSocket().then((socket) => {
                let connection = new Connection(null, PORT, '127.0.0.1');
                connection.send(testmsg);
                socket.on('message', (raw) => {
                    raw.slice(Packet.PROTOCOL_BUFFER.length + 2, raw.length).toString().should.equal(testmsg);
                    done();
                });
            });
        });
    });
});

function getListeningSocket() {
    return new Promise((resolve) => {
        let socket = dgram.createSocket({
            type: 'udp4',
            reuseAddr: true
        });
        socket.bind(PORT, '0.0.0.0', () => {
            resolve(socket);
        });
    });
}

function getHex(str) {
    return str.split('').map((char) => char.charCodeAt(0).toString(16)).join('');
}

