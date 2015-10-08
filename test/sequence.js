'use strict';

var should = require('should');
should = should || should;
var Sequence = require('../lib/Sequence.js');

describe.only('sequence', () => {
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
});

