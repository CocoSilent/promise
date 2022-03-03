const { expect } = require('chai');


function abc() {
    const a = Promise.all();
    console.log(a)
}
abc();

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

// describe('Promises/A+ Tests', () => {
//     require('promises-aplus-tests').mocha(adapter);
// });


Promise.resolve().then(() => {
    console.log(0);
    return Promise.resolve(4);
}).then((res) => {
    console.log(res)
})

Promise.resolve().then(() => {
    console.log(1);
}).then(() => {
    console.log(2);
}).then(() => {
    console.log(3);
}).then(() => {
    console.log(5);
}).then(() =>{
    console.log(6);
})
