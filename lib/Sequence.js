'use strict';

class Sequence extends Map {
    constructor(maxLength) {
        super();
        this.maxLength = maxLength;
        this.maxKey = undefined;
    }

    set(key, value) {
        super.set(key, value);

        if ('undefined' === typeof this.maxKey) {
            this.maxKey = key;
        } else {
            this.maxKey = Math.max(this.maxKey, key);
        }

        if (this.size > this.maxLength) {
            this.removeOne();
        }
    }

    removeOne() {
        this.delete(this.keys().next().value);
    }
}

module.exports = Sequence;

