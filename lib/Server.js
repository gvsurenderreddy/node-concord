'use strict';

var dgram = require('dgram');

class Server {
    constructor() {
        this.clients = {};
    }

    listen(port, ip) {
        this.socket = dgram.createSocket({
            type: 'udp4',
            reuseAddr: false
        });
        let promise = new Promise((resolve) => {
            this.setupListeners();
            this.socket.bind(port, ip || '0.0.0.0', () => {
                resolve();
            });
        });
        return promise;
    }

    setupListeners() {
        this.socket.on('error', (err) => {
            console.error(`Server socket error: ${err.message}\n${err.stack}`);
        });

        this.socket.on('message', (raw, rinfo) => {
            console.log(`Server: ${getClientName(rinfo)} => ${raw}`);
            this.handleMessage(raw, rinfo);
        });
    }

    handleMessage(raw, rinfo) {
        let from = getClientName(rinfo);
        if (!this.isClientConnected(from)) {
            this.handleNewClient(from, rinfo);
        }
        let client = this.getClient(from);
        clearTimeout(client.disconnectTimeout);
        client.disconnectTimeout = setTimeout(() => {
            console.log(`Server: client ${client.name} timed out.`);
            this.removeClient(client);
        }, 2000);

        switch (raw.toString()) {
            case 'hello':
            this.send(client, 'hi there');
            break;
            default:
            console.log(`Server: unknown message ${raw}.`);
            break;
        }
    }

    isClientConnected(name) {
        return !!this.getClient[name];
    }

    handleNewClient(name, rinfo) {
        this.clients[name] = {
            name: name,
            address: rinfo.address,
            port: rinfo.port
        };
    }

    getClient(name) {
        return this.clients[name];
    }

    removeClient(client) {
        delete this.clients[client.name];
    }

    send(client, msg) {
        var data = new Buffer(msg);
        this.socket.send(data, 0, data.length, client.port, client.address);
    }
}

function getClientName(rinfo) {
    return `${rinfo.address}:${rinfo.port}`;
}

module.exports = Server;

