import {Executor, Onfulfilled, Onrejected, PromiseState, Reject, Resolve} from './type2';

// 重新实现Promise
// 注意点

// resolvePromise  y要重新调用resolvePromise   then方法一定要用call


function asyncTask(callback:any) {
    if (process && process.nextTick) {
        process.nextTick(callback)
    } else {
        setTimeout(callback)
    }
}

function resolvePromise(promise2:Promise, x: any, resolve:Resolve, reject: Reject) {
    if (promise2 === x) {
        reject(new TypeError('promise2 === x'))
        return
    } else if (x instanceof Promise) {
        x.then((y) => {
            resolvePromise(promise2, y, resolve, reject);
        }, reject)
        return
    } else if (x && (typeof x === 'function' || typeof x === 'object')) {
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
                then.call(x, (y: any) => {
                    if (called) {
                        return
                    }
                    called = true;
                    resolvePromise(promise2, y, resolve, reject);
                }, (reason: any) => {
                    if (called) {
                        return
                    }
                    called = true;
                    reject(reason);
                });
            } catch (e) {
                if (called) {
                    return
                }
                called = true;
                reject(e);
            }
            return
        }
    }
    resolve(x);
}

export default class Promise {
    private promiseState: PromiseState;
    private promiseResult: any;
    private resolve: Resolve;
    private reject: Reject;
    private onfulfilledList: Onfulfilled[];
    private onrejectedList: Onrejected[];

    constructor(executor:Executor) {
        this.promiseState = PromiseState.pending;
        this.promiseResult = undefined;
        this.onfulfilledList = [];
        this.onrejectedList = [];
        this.resolve = (value?: any) => {
            if (this.promiseState !== PromiseState.pending) {
                return
            }
            this.promiseState = PromiseState.fullfilled;
            this.promiseResult = value;
            for (let i=0; i<this.onfulfilledList.length;i++) {
                const cb = this.onfulfilledList[i];
                cb(value);
            }
        }
        this.reject = (reson?: any) => {
            if (this.promiseState !== PromiseState.pending) {
                return
            }
            this.promiseState = PromiseState.rejected;
            this.promiseResult = reson;
            for (let i=0; i<this.onrejectedList.length;i++) {
                const cb = this.onrejectedList[i];
                cb(reson);
            }
        }
        try {
            executor(this.resolve, this.reject);
        } catch (e) {
            this.reject(e)
        }
    }

    then(onfulfilled?:Onfulfilled, onrejected?:Onrejected) {
        if (!onfulfilled || typeof onfulfilled !== 'function') {
            onfulfilled = (value) => value;
        }
        if (!onrejected || typeof onrejected !== 'function') {
            onrejected = (reason) => {
                throw reason;
            };
        }
        if (this.promiseState === PromiseState.fullfilled) {
            const promise2 = new Promise((resolve, reject) => {
                asyncTask(() => {
                    try {
                        const result = onfulfilled?.(this.promiseResult);
                        resolvePromise(promise2, result, resolve, reject);
                    } catch (e) {
                        reject(e)
                    }
                })
            })
            return promise2;
        }
        if (this.promiseState === PromiseState.rejected) {
            const promise2 = new Promise((resolve, reject) => {
                asyncTask(() => {
                    try {
                        const result = onrejected?.(this.promiseResult);
                        resolvePromise(promise2, result, resolve, reject);
                    } catch (e) {
                        reject(e)
                    }
                })
            })
            return promise2;
        }
        if (this.promiseState === PromiseState.pending) {
            const promise2 = new Promise((resolve, reject) => {
                this.onfulfilledList.push(() => {
                    asyncTask(() => {
                        try {
                            const result = onfulfilled?.(this.promiseResult);
                            resolvePromise(promise2, result, resolve, reject);
                        } catch (e) {
                            reject(e)
                        }
                    });
                });
                this.onrejectedList.push(() => {
                    asyncTask(() => {
                        try {
                            const result = onrejected?.(this.promiseResult);
                            resolvePromise(promise2, result, resolve, reject);
                        } catch (e) {
                            reject(e)
                        }
                    });
                });
            })
            return promise2;
        }
    }
}
