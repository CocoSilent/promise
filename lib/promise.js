(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Promise = factory());
})(this, (function () { 'use strict';

    var PromiseState;
    (function (PromiseState) {
        PromiseState[PromiseState["PENDING"] = 0] = "PENDING";
        PromiseState[PromiseState["FULLFILLED"] = 1] = "FULLFILLED";
        PromiseState[PromiseState["REJECTED"] = 2] = "REJECTED";
    })(PromiseState || (PromiseState = {}));

    // 异步任务，nodejs微任务  浏览器宏任务
    function asyncTask(fun) {
        if (process && process.nextTick) {
            // microtask
            process.nextTick(fun);
        }
        else {
            // macrotask
            setTimeout(fun);
        }
    }
    function resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            throw new TypeError('x不能等于promise2');
        }
        else if (x instanceof Promise$1) {
            if (x.PromiseState === PromiseState.PENDING) {
                x.then(function (y) {
                    resolvePromise(promise2, y, resolve, reject);
                }, reject);
            }
            else {
                x.then(resolve, reject);
            }
        }
        else if (x !== null && (typeof x === "object" || typeof x === 'function')) {
            var then = void 0;
            try {
                then = x.then;
            }
            catch (e) {
                reject(e);
                return;
            }
            if (typeof then === 'function') {
                var called_1 = false;
                try {
                    then.call(x, function (y) {
                        if (called_1) {
                            return;
                        }
                        called_1 = true;
                        resolvePromise(promise2, y, resolve, reject);
                    }, function (r) {
                        if (called_1) {
                            return;
                        }
                        called_1 = true;
                        reject(r);
                    });
                }
                catch (e) {
                    if (called_1) {
                        return;
                    }
                    called_1 = true;
                    reject(e);
                }
            }
            else {
                resolve(x);
            }
        }
        else {
            resolve(x);
        }
    }
    var Promise$1 = /** @class */ (function () {
        function Promise(executor) {
            this.onFulfilledCallbacks = [];
            this.onRejectedCallbacks = [];
            this.PromiseState = PromiseState.PENDING;
            this.resolve = function (value) {
                var _this = this;
                // 状态不能重复改变
                if (this.PromiseState === PromiseState.PENDING) {
                    asyncTask(function () {
                        _this.PromiseState = PromiseState.FULLFILLED;
                        _this.PromiseResult = value;
                        _this.onFulfilledCallbacks.forEach(function (callback) { return callback(_this.PromiseResult); });
                    });
                }
            };
            this.reject = function (reason) {
                var _this = this;
                // 状态不能重复改变
                if (this.PromiseState === PromiseState.PENDING) {
                    asyncTask(function () {
                        _this.PromiseState = PromiseState.REJECTED;
                        _this.PromiseResult = reason;
                        _this.onRejectedCallbacks.forEach(function (callback) { return callback(_this.PromiseResult); });
                    });
                }
            };
            try {
                executor(this.resolve.bind(this), this.reject.bind(this));
            }
            catch (e) {
                this.reject(e);
            }
        }
        Promise.prototype.then = function (onFulfilled, onRejected) {
            var _this = this;
            if (typeof onFulfilled !== 'function') {
                onFulfilled = function (value) { return value; };
            }
            if (typeof onRejected !== 'function') {
                onRejected = function (reason) {
                    throw reason;
                };
            }
            var promise2 = new Promise(function (resolve, reject) {
                if (_this.PromiseState === PromiseState.FULLFILLED) {
                    asyncTask(function () {
                        try {
                            var x = onFulfilled(_this.PromiseResult);
                            resolvePromise(promise2, x, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                }
                else if (_this.PromiseState === PromiseState.REJECTED) {
                    asyncTask(function () {
                        try {
                            var x = onRejected(_this.PromiseResult);
                            resolvePromise(promise2, x, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                }
                else if (_this.PromiseState === PromiseState.PENDING) {
                    _this.onFulfilledCallbacks.push(function (value) {
                        asyncTask(function () {
                            try {
                                var x = onFulfilled(value);
                                resolvePromise(promise2, x, resolve, reject);
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    });
                    _this.onRejectedCallbacks.push(function (reason) {
                        asyncTask(function () {
                            try {
                                var x = onRejected(reason);
                                resolvePromise(promise2, x, resolve, reject);
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    });
                }
            });
            return promise2;
        };
        return Promise;
    }());

    return Promise$1;

}));
//# sourceMappingURL=promise.js.map
