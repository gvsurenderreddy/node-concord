'use strict';

var EventEmitter = require('events').EventEmitter;
var Connection = require('./Connection.js');

class Client extends EventEmitter {
    constructor() {
        super();
    }

    setup(data) {
        this.connection = new Connection(data.socket, data.port, data.ip);
        this.name = data.name;
        this.ip = data.ip;
        this.port = data.port;
        this.disconnectTimeout = setTimeout(() => this.emit('disconnect', 'timeout'), 2000);
    }

    handleMessage(message) {
        this.resetTimeout();
        switch (message) {
            case '':
            this.sendMessage('hi there');
            break;
            default:
            this.emit('message', message);
            break;
        }
    }

    sendMessage(msg) {
        return this.connection.send(msg, this.port, this.ip);
    }

    resetTimeout() {
        clearTimeout(this.disconnectTimeout);
        this.disconnectTimeout = setTimeout(() => {
            this.emit('disconnect', 'timeout');
        }, 2000);
    }

    disconnect() {
        clearTimeout(this.disconnectTimeout);
        delete this.socket;
    }

    // ConnectableClient below

    connect(port, ip) {
        this.connection = new Connection();
        this.server = {
            port: port,
            ip: ip || '127.0.0.1'
        };
        return this.connection.connect(this.server.port, this.server.ip).then(() => {
            this.resetTimeout();
            this.setupListeners();
        });
    }

    setupListeners() {
        this.connection.on('error', (err) => {
            console.error(`Client socket error: ${err.message}\n${err.stack}`);
        });

        this.connection.on('message', (data) => {
            this.handleMessage(data);
        });
    }
}

module.exports = Client;

