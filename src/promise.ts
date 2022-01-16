import {Executor, OnFulfilled, OnRejected, PromiseState} from './type';

// 异步任务，nodejs微任务  浏览器宏任务
const asyncTask = (fun: any) => {
    if (process && process.nextTick) {
        // microtask
        process.nextTick(fun)
    } else {
        // macrotask
        setTimeout(fun);
    }
}

export default class Promise {
    private PromiseState: PromiseState;
    private PromiseResult: any;
    private readonly resolve: OnFulfilled
    private readonly reject: OnRejected;
    private readonly onFulfilledCallbacks:OnFulfilled[]  = [];
    private readonly onRejectedCallbacks:OnRejected[] = [];
    constructor(executor: Executor) {
        this.PromiseState = PromiseState.PENDING;

        this.resolve = function (value: any) {
            this.PromiseState = PromiseState.FULLFILLED;
            this.PromiseResult = value;
        }

        this.reject = function (reason: any) {
            this.PromiseState = PromiseState.REJECTED;
            this.PromiseResult = reason;
        }

        try {
            executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (e) {
            this.reject(e);
        }
    }
    then(onFulfilled: OnFulfilled, onRejected:OnRejected) {
        const promise2 = new Promise((resolve, reject) => {
            if (this.PromiseState === PromiseState.FULLFILLED) {
                asyncTask(() => {
                    try {
                        const x = onFulfilled(this.PromiseResult);
                        resolve(x);
                    } catch (e) {
                        reject(e);
                    }
                });
            } else if (this.PromiseState === PromiseState.REJECTED) {
                asyncTask(() => {
                    try {
                        const x = onRejected(this.PromiseResult);
                        resolve(x);
                    } catch (e) {
                        reject(e);
                    }
                })
            } else if (this.PromiseState === PromiseState.PENDING) {
                this.onFulfilledCallbacks.push((value) => {
                    asyncTask(() => {
                        onFulfilled(value);
                    })
                });

                this.onRejectedCallbacks.push((reason) => {
                    asyncTask(() => {
                        onFulfilled(reason);
                    })
                })
            }
        });
        return promise2;
    }
}