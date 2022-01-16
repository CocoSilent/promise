import {Executor, OnFulfilled, OnRejected, PromiseState} from './type';

// 异步任务，nodejs微任务  浏览器宏任务
const asyncTask = (fun) => {
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
    constructor(executor: Executor) {
        this.PromiseState = null;

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
                onFulfilled(this.PromiseResult);
            } else if (this.PromiseState === PromiseState.REJECTED) {
                onRejected(this.PromiseResult);
            } else if (this.PromiseState === PromiseState.PENDING) {

            }
        });
        return promise2;
    }
}