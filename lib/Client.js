'use strict';

var dgram = require('dgram');
var Packet = require('./Packet.js');

class Client {
    constructor() {
        this.socket = dgram.createSocket({
            type: 'udp4',
            reuseAddr: false
        });
    }

    connect(port, ip) {
        this.server = {
            port: port,
            ip: ip || '127.0.0.1'
        };
        let promise = new Promise((resolve, reject) => {
            this.setupListeners();
            this.socket.bind((err) => {
                if (err) {
                    return reject(err);
                }
                let message = Packet.HELLO;
                this.socket.send(message, 0, message.length, port, this.server.ip, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    this.resetTimeout();
                    resolve();
                });
            });
        });
        return promise;
    }

    setupListeners() {
        this.socket.on('error', (err) => {
            console.error(`Client socket error: ${err.message}\n${err.stack}`);
        });

        this.socket.on('message', (raw, rinfo) => {
            console.log(`Client: ${rinfo.address}:${rinfo.port} => ${raw}`);
            this.handleMessage(raw, rinfo);
        });
    }

    handleMessage(raw, rinfo) {
        if (rinfo.address === this.server.ip && rinfo.port === this.server.port) {
            this.handleServerMessage(raw);
            return;
        }
        console.log(`Client: got message from unknown sender ${rinfo.address}:${rinfo.port}.`);
    }

    handleServerMessage(raw) {
        if (!Packet.isValid(raw)) {
            console.warn(`Client: server protocol mismatch, expected ${Packet.HELLO.toString('hex')}, got ${raw.slice(0, 2).toString('hex')}.`);
        }
        this.resetTimeout();
    }

    resetTimeout() {
        clearTimeout(this.disconnectTimeout);
        this.disconnectTimeout = setTimeout(() => {
            console.log(`Client: server timed out.`);
        }, 2000);
    }
}

module.exports = Client;

