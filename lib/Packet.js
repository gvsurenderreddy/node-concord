'use strict';

class Packet {
    constructor(raw) {
        if ('object' === typeof raw) {
            this.raw = raw;
        } else if ('string' === typeof raw) {
            this.raw = new Buffer(raw);
        } else {
            throw new Error(`Unknown raw type ${typeof raw} ${raw}`);
        }
    }

    get message() {
        return this.raw.toString();
    }

    get length() {
        return this.raw.length + Packet.PROTOCOL_BUFFER.length;
    }

    get buffer() {
        return Buffer.concat([Packet.PROTOCOL_BUFFER, this.raw]);
    }

    static getPacket(raw) {
        return new Packet(raw.slice(Packet.PROTOCOL_BUFFER.length, raw.length));
    }

    static isValid(raw) {
        return Buffer.compare(
            raw.slice(0, Packet.PROTOCOL_BUFFER.length),
            Packet.PROTOCOL_BUFFER
        ) === 0;
    }

    static get HELLO() {
        return Packet.newBuffer;
    }

    static get newBuffer() {
        return Packet.fromHex(Packet.PROTOCOL_VERSION);
    }

    static fromHex(hex) {
        return new Buffer(hex.replace(':', ''), 'hex');
    }
}

Packet.PROTOCOL_VERSION = '1111';
Packet.PROTOCOL_BUFFER = Packet.newBuffer;

module.exports = Packet;
