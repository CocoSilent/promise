const { expect } = require('chai');

const Promise = require('../lib/promise');

const adapter = {
    deferred: () => {
        let resolve;
        let reject;

        const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });

        return {
            promise,
            resolve,
            reject,
        };
    },
};

function resolveVal(ms, val) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(val);
        }, ms);
    });
}

function rejectErr(ms, err) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(err);
        }, ms);
    });
}

describe('Promises/A+ Tests', () => {
    require('promises-aplus-tests').mocha(adapter);
});