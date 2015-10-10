'use strict';

var should = require('should');
should = should || should;
var Sequence = require('../lib/Sequence.js');

describe('sequence', () => {
    it('should hold keys', (done) => {
        let seq = new Sequence(1);
        seq.set(1, '1');
        seq.size.should.equal(1);
        seq.get(1).should.equal('1');
        done();
    });

    it('should not exceed its maximum length', (done) => {
        let seq = new Sequence(2);
        seq.set(1, '1');
        seq.set(2, '2');
        seq.set(3, '3');
        seq.size.should.equal(2);
        done();
    });

    it('should only keep the latest data', (done) => {
        let seq = new Sequence(2);
        seq.set(1, '1');
        seq.set(2, '2');
        seq.set(3, '3');
        let entries = seq.entries();
        let values = entries.next().value;
        values[0].should.equal(2);
        values[1].should.equal('2');
        values = entries.next().value;
        values[0].should.equal(3);
        values[1].should.equal('3');
        values = entries.next().value;
        should.not.exist(values);
        done();
    });

    describe('ack', () => {
        it('sorted consecutive numbers', (done) => {
            let seq = new Sequence(5);
            seq.set(1, '1');
            seq.set(2, '2');
            seq.set(3, '3');
            seq.set(4, '4');
            seq.set(5, '5');
            seq.ack[0].should.equal(5);
            seq.ack.slice(1, 4).forEach((bit) => {
                bit.should.equal(1);
            });
            done();
        });

        it('sorted numbers with holes', (done) => {
            let seq = new Sequence(5);
            seq.set(1, '1');
            seq.set(2, '2');
            seq.set(4, '4');
            seq.set(6, '6');
            seq.set(7, '7');
            seq.ack[0].should.equal(7);
            seq.ack[1].should.equal(1);
            seq.ack[2].should.equal(0);
            seq.ack[3].should.equal(1);
            seq.ack[4].should.equal(0);
            done();
        });

        it('sorted numbers with holes and separate extremes', (done) => {
            let seq = new Sequence(5);
            seq.set(1, '1');
            seq.set(3, '3');
            seq.set(5, '5');
            seq.set(8, '8');
            seq.set(11, '11');
            seq.ack[0].should.equal(11);
            seq.ack[1].should.equal(0);
            seq.ack[2].should.equal(0);
            seq.ack[3].should.equal(1);
            seq.ack[4].should.equal(0);
            done();
        });

        it('reverse sorted consecutive numbers', (done) => {
            let seq = new Sequence(5);
            seq.set(1, '1');
            seq.set(2, '2');
            seq.set(3, '3');
            seq.set(4, '4');
            seq.set(5, '5');
            seq.ack[0].should.equal(5);
            seq.ack.slice(1, 4).forEach((bit) => {
                bit.should.equal(1);
            });
            done();
        });

        it('unsorted consecutive numbers', (done) => {
            let seq = new Sequence(5);
            seq.set(4, '4');
            seq.set(2, '2');
            seq.set(1, '1');
            seq.set(5, '5');
            seq.set(3, '3');
            seq.ack[0].should.equal(5);
            seq.ack.slice(1, 4).forEach((bit) => {
                bit.should.equal(1);
            });
            done();
        });

        it('unsorted consecutive numbers with last largest', (done) => {
            let seq = new Sequence(5);
            seq.set(4, '4');
            seq.set(2, '2');
            seq.set(1, '1');
            seq.set(3, '3');
            seq.set(5, '5');
            seq.ack[0].should.equal(5);
            seq.ack.slice(1, 4).forEach((bit) => {
                bit.should.equal(1);
            });
            done();
        });

        it('unsorted numbers with holes', (done) => {
            let seq = new Sequence(5);
            seq.set(2, '2');
            seq.set(4, '4');
            seq.set(1, '1');
            seq.set(7, '7');
            seq.set(6, '6');
            seq.ack[0].should.equal(7);
            seq.ack[1].should.equal(1);
            seq.ack[2].should.equal(0);
            seq.ack[3].should.equal(1);
            seq.ack[4].should.equal(0);
            done();
        });

        it('unsorted numbers with holes and separate extremes', (done) => {
            let seq = new Sequence(5);
            seq.set(3, '3');
            seq.set(5, '5');
            seq.set(11, '11');
            seq.set(1, '1');
            seq.set(8, '8');
            seq.ack[0].should.equal(11);
            seq.ack[1].should.equal(0);
            seq.ack[2].should.equal(0);
            seq.ack[3].should.equal(1);
            seq.ack[4].should.equal(0);
            done();
        });
    });
});

