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

    get ack() {
        let array = [];
        for (let key of this.keys()) {
            array.push(key);
        }

        let map = array.sort((a, b) => a - b).reduce((map, key) => {
            map.set(key, 1);
            if (map.size === 1) {
                return map;
            }
            while (!map.has(--key)) {
                map.set(key, 0);
            }
            return map;
        }, new Map());

        array = [];
        for (let key of map.keys()) {
            array.push(key);
        }
        return array.sort((a, b) => b - a).map((key) => {
            return map.get(key);
        }).slice(1).reverse().concat([this.maxKey]).reverse().slice(0, this.maxLength);
    }
}

module.exports = Sequence;

