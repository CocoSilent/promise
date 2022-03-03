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

// describe('Promises/A+ Tests', () => {
//     require('promises-aplus-tests').mocha(adapter);
// });


// Promise.resolve().then(() => {
//     console.log(0);
//     return Promise.resolve(4);
// }).then((res) => {
//     console.log(res)
// })
//
// Promise.resolve().then(() => {
//     console.log(1);
// }).then(() => {
//     console.log(2);
// }).then(() => {
//     console.log(3);
// }).then(() => {
//     console.log(5);
// }).then(() =>{
//     console.log(6);
// })

function abc() {
    const promise1 = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1)
        }, 3000)
    })

    const promise2 = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(2)
        }, 2000)
    })

    const promise3 = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(3)
        }, 1000)
    })

    Promise.all([promise1, promise2, promise3]).then((res) => {
        console.log('all', res)
    })

    Promise.all([]).then(res => console.log('all2',res))
}
abc();
