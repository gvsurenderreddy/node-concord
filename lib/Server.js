'use strict';

var EventEmitter = require('events').EventEmitter;
var Client = require('./Client.js');
var Connection = require('./Connection.js');

class Server extends EventEmitter {
    constructor() {
        super();
        this.clients = new Map();
    }

    listen(port, ip) {
        this.listener = new Connection();
        return this.listener.listen(port, ip || '0.0.0.0').then(() => {
            this.setupListeners();
        });
    }

    setupListeners() {
        this.listener.on('error', (err) => {
            console.error(`Server error: ${err.message}\n${err.stack}`);
        });

        this.listener.on('message', (data, rinfo) => {
            this.handleMessage(data, rinfo);
        });
    }

    handleMessage(data, rinfo) {
        let name = getClientName(rinfo);
        if (!this.isClientConnected(name)) {
            this.handleClientConnect(name, rinfo);
        }
        let client = this.getClient(name);
        client.handleMessage(data);
    }

    isClientConnected(name) {
        return !!this.getClient(name);
    }

    handleClientConnect(name, rinfo) {
        let client = new Client();
        client.setup({
            socket: this.listener.socket,
            name: name,
            ip: rinfo.address,
            port: rinfo.port
        });
        client.on('disconnect', (reason) => this.handleClientDisconnect(client, reason));
        this.clients.set(name, client);
        this.emit('client connected', client);
    }

    handleClientDisconnect(client) {
        this.clients.delete(client.name);
        client.disconnect();
        client.removeAllListeners('disconnect');
    }

    getClient(name) {
        return this.clients.get(name);
    }

    removeClient(client) {
        this.clients.delete(client.name);
    }

    broadcast(msg) {
        this.clients.forEach((client) => {
            client.sendMessage(msg);
        });
    }
}

function getClientName(rinfo) {
    return `${rinfo.address}:${rinfo.port}`;
}

module.exports = Server;

