'use strict';

class Sequence {
    constructor(maxLength) {
        this.map = new Map();
        this.maxLength = maxLength;
        this.maxKey = undefined;
    }

    add(num) {
        if (this.map.has(num)) {
            return;
        }
        this.map.set(num);

        if ('undefined' === typeof this.maxKey) {
            this.maxKey = num;
        } else {
            this.maxKey = Math.max(this.maxKey, num);
        }

        if (this.map.size > this.maxLength) {
            this.removeOne();
        }
    }

    removeOne() {
        this.map.delete(this.map.keys().next().value);
    }
}

module.exports = Sequence;

