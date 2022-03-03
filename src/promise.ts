import {Executor, OnFulfilled, OnRejected, PromiseState} from './type';

// 异步任务，nodejs微任务  浏览器宏任务
function asyncTask(fun: any) {
    if (typeof process !== 'undefined' && process.nextTick) {
        // microtask
        process.nextTick(fun);
        // queueMicrotask(fun);
    } else {
        // macrotask
        // setTimeout(fun);
        // Microtask
        queueMicrotask(fun);
    }
}

function resolvePromise(promise2: Promise, x: any, resolve: OnFulfilled, reject: OnRejected) {
    if (promise2 === x) {
        throw new TypeError('x不能等于promise2');
    } else if (x instanceof Promise) {
        if (x.PromiseState === PromiseState.PENDING) {
            x.then((y) => {
                resolvePromise(promise2, y, resolve, reject);
            }, reject);
        } else {
            x.then(resolve, reject);
        }
    } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        let then;
        try {
            then = x.then;
        } catch (e) {
            reject(e);
            return;
        }
        if (typeof then === 'function') {
            let called = false;
            try {
                then.call(x,
                    (y: any) => {
                        if (called) {
                            return;
                        }
                        called = true;
                        resolvePromise(promise2, y, resolve, reject);
                    },
                    (r: any) => {
                        if (called) {
                            return;
                        }
                        called = true;
                        reject(r);
                    });
            } catch (e) {
                if (called) {
                    return;
                }
                called = true;
                reject(e);
            }
        } else {
            resolve(x);
        }
    } else {
        resolve(x);
    }
}

export default class Promise {
    // tslint:disable-next-line:variable-name
    PromiseState: PromiseState;
    // tslint:disable-next-line:variable-name
    private PromiseResult: any;
    private readonly resolve: OnFulfilled;
    private readonly reject: OnRejected;
    private readonly onFulfilledCallbacks: OnFulfilled[] = [];
    private readonly onRejectedCallbacks: OnRejected[] = [];

    constructor(executor: Executor) {
        this.PromiseState = PromiseState.PENDING;

        this.resolve = function (value: any) {
            // 状态不能重复改变
            if (this.PromiseState === PromiseState.PENDING) {
                asyncTask(() => {
                    this.PromiseState = PromiseState.FULLFILLED;
                    this.PromiseResult = value;
                    this.onFulfilledCallbacks.forEach(callback => callback(this.PromiseResult));
                });
            }
        };

        this.reject = function (reason: any) {
            // 状态不能重复改变
            if (this.PromiseState === PromiseState.PENDING) {
                asyncTask(() => {
                    this.PromiseState = PromiseState.REJECTED;
                    this.PromiseResult = reason;
                    this.onRejectedCallbacks.forEach(callback => callback(this.PromiseResult));
                });
            }
        };

        try {
            executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (e) {
            this.reject(e);
        }
    }

    then(onFulfilled: OnFulfilled, onRejected?: OnRejected) {
        if (typeof onFulfilled !== 'function') {
            onFulfilled = value => value;
        }
        if (!onRejected || typeof onRejected !== 'function') {
            onRejected = reason => {
                throw reason;
            };
        }
        const promise2 = new Promise((resolve, reject) => {
            if (this.PromiseState === PromiseState.FULLFILLED) {
                asyncTask(() => {
                    try {
                        const x = onFulfilled(this.PromiseResult);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            } else if (this.PromiseState === PromiseState.REJECTED) {
                asyncTask(() => {
                    try {
                        const x = (onRejected as OnRejected)(this.PromiseResult);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            } else if (this.PromiseState === PromiseState.PENDING) {
                this.onFulfilledCallbacks.push((value) => {
                    asyncTask(() => {
                        try {
                            const x = onFulfilled(value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                });

                this.onRejectedCallbacks.push((reason) => {
                    asyncTask(() => {
                        try {
                            const x = (onRejected as OnRejected)(reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            }
        });
        return promise2;
    }

    static resolve(value: any) {
        return new Promise(resovle => {
            resovle();
        }).then(() => {
            return value;
        });
    }

    static reject(reason: any) {
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }

    static all(promises: any) {
        if (!promises || !promises[Symbol.iterator]) {
            throw new TypeError('promises必须是可迭代对象');
        }
        const result: any[] = [];
        let count = 0;
        let iteratorIndex = 0;
        return new Promise((resolve, reject) => {
            let hasComplete = false;
            for (const promise of promises) {
                const index = iteratorIndex;
                iteratorIndex = iteratorIndex + 1;
                Promise.resolve(promise).then((value) => {
                    count = count + 1;
                    result[index] = value;
                    if (hasComplete && count === iteratorIndex) {
                        resolve(result);
                    }
                }, (reason) => {
                    reject(reason);
                });
            }
            hasComplete = true;
            if (iteratorIndex === 0) {
                resolve(result);
            }
        });
    }
 }


