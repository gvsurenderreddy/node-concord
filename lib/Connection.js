'use strict';

var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;

var Packet = require('./Packet.js');

class Connection extends EventEmitter {
    constructor(socket, port, ip) {
        super();
        this._socket = socket || dgram.createSocket({
            type: 'udp4',
            reuseAddr: true
        });
        this.port = port;
        this.ip = ip;
        this.filter = true;
        this.sequence = 0;
    }

    listen(port, ip) {
        let promise = new Promise((resolve) => {
            this.setupListeners();
            this.filter = false;
            this._socket.bind(port, ip || '0.0.0.0', () => {
                resolve();
            });
        });
        return promise;
    }

    setupListeners() {
        this._socket.on('error', (err) => {
            this.emit('error', err);
        });
        this._socket.on('message', (raw, rinfo) => {
            if (!Packet.isValid(raw)) {
                return;
            }
            let self = this;
            let packet = Packet.getPacket(raw);
            if (this.filter) {
                if (this.port === rinfo.port && this.ip === rinfo.ip) {
                    this.remoteSequence = packet.sequence;
                    forward();
                }
            } else {
                forward();
            }
            function forward() {
                self.emit('message', packet.message, rinfo);
            }
        });
    }

    get socket() {
        return this._socket;
    }

    send(msg) {
        return new Promise((resolve, reject) => {
            let packet = new Packet(msg);
            packet.sequence = ++this.sequence;
            let buffer = packet.buffer;
            this._socket.send(buffer, 0, buffer.length, this.port, this.ip, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    connect(port, ip) {
        this.port = port;
        this.ip = ip;
        return new Promise((resolve, reject) => {
            this.filter = false;
            this._socket.bind((err) => {
                if (err) {
                    return reject(err);
                }
                this.setupListeners();
                resolve();
            });
        });
    }
}

module.exports = Connection;

