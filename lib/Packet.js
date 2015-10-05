'use strict';

class Packet {
    constructor(raw) {
        if ('object' === typeof raw) {
            this._sequence = raw.slice(0, 2);
            this._payload = raw.slice(2, raw.length);
        } else if ('string' === typeof raw) {
            this._sequence = new Buffer(2);
            this._sequence.fill(0);
            this._payload = new Buffer(raw);
        } else {
            throw new Error(`Unknown raw type ${typeof raw} ${raw}`);
        }
    }

    set sequence(seq) {
        var s = seq.toString(16);
        if (s.length % 2) {
            // Workaround for bug where hex string is invalid when odd number of chars
            s = '0' + s;
        }
        if (s.length <= 2) {
            s = '00' + s;
        }
        this._sequence.write(s, 0, 2, 'hex');
    }

    get sequence() {
        return parseInt(this._sequence.toString('hex'), 16);
    }

    get message() {
        return this._payload.toString();
    }

    get length() {
        return this._payload.length + this._sequence.length + Packet.PROTOCOL_BUFFER.length;
    }

    get buffer() {
        return Buffer.concat([Packet.PROTOCOL_BUFFER, this._sequence, this._payload]);
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
