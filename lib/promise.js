(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Promise = factory());
})(this, (function () { 'use strict';

    var PromiseState;
    (function (PromiseState) {
        PromiseState[PromiseState["pending"] = 0] = "pending";
        PromiseState[PromiseState["fullfilled"] = 1] = "fullfilled";
        PromiseState[PromiseState["rejected"] = 2] = "rejected";
    })(PromiseState || (PromiseState = {}));

    function asyncTask(callback) {
        if (process && process.nextTick) {
            process.nextTick(callback);
        }
        else {
            setTimeout(callback);
        }
    }
    function resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            reject(new TypeError('promise2 === x'));
            return;
        }
        else if (x instanceof Promise$1) {
            x.then(function (y) {
                resolvePromise(promise2, y, resolve, reject);
            }, reject);
            return;
        }
        else if (x && (typeof x === 'function' || typeof x === 'object')) {
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
                    }, function (reason) {
                        if (called_1) {
                            return;
                        }
                        called_1 = true;
                        reject(reason);
                    });
                }
                catch (e) {
                    if (called_1) {
                        return;
                    }
                    called_1 = true;
                    reject(e);
                }
                return;
            }
        }
        resolve(x);
    }
    var Promise$1 = /** @class */ (function () {
        function Promise(executor) {
            var _this = this;
            this.promiseState = PromiseState.pending;
            this.promiseResult = undefined;
            this.onfulfilledList = [];
            this.onrejectedList = [];
            this.resolve = function (value) {
                if (_this.promiseState !== PromiseState.pending) {
                    return;
                }
                _this.promiseState = PromiseState.fullfilled;
                _this.promiseResult = value;
                for (var i = 0; i < _this.onfulfilledList.length; i++) {
                    var cb = _this.onfulfilledList[i];
                    cb(value);
                }
            };
            this.reject = function (reson) {
                if (_this.promiseState !== PromiseState.pending) {
                    return;
                }
                _this.promiseState = PromiseState.rejected;
                _this.promiseResult = reson;
                for (var i = 0; i < _this.onrejectedList.length; i++) {
                    var cb = _this.onrejectedList[i];
                    cb(reson);
                }
            };
            try {
                executor(this.resolve, this.reject);
            }
            catch (e) {
                this.reject(e);
            }
        }
        Promise.prototype.then = function (onfulfilled, onrejected) {
            var _this = this;
            if (!onfulfilled || typeof onfulfilled !== 'function') {
                onfulfilled = function (value) { return value; };
            }
            if (!onrejected || typeof onrejected !== 'function') {
                onrejected = function (reason) {
                    throw reason;
                };
            }
            if (this.promiseState === PromiseState.fullfilled) {
                var promise2_1 = new Promise(function (resolve, reject) {
                    asyncTask(function () {
                        try {
                            var result = onfulfilled === null || onfulfilled === void 0 ? void 0 : onfulfilled(_this.promiseResult);
                            resolvePromise(promise2_1, result, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
                return promise2_1;
            }
            if (this.promiseState === PromiseState.rejected) {
                var promise2_2 = new Promise(function (resolve, reject) {
                    asyncTask(function () {
                        try {
                            var result = onrejected === null || onrejected === void 0 ? void 0 : onrejected(_this.promiseResult);
                            resolvePromise(promise2_2, result, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
                return promise2_2;
            }
            if (this.promiseState === PromiseState.pending) {
                var promise2_3 = new Promise(function (resolve, reject) {
                    _this.onfulfilledList.push(function () {
                        asyncTask(function () {
                            try {
                                var result = onfulfilled === null || onfulfilled === void 0 ? void 0 : onfulfilled(_this.promiseResult);
                                resolvePromise(promise2_3, result, resolve, reject);
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    });
                    _this.onrejectedList.push(function () {
                        asyncTask(function () {
                            try {
                                var result = onrejected === null || onrejected === void 0 ? void 0 : onrejected(_this.promiseResult);
                                resolvePromise(promise2_3, result, resolve, reject);
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    });
                });
                return promise2_3;
            }
        };
        return Promise;
    }());

    return Promise$1;

}));
//# sourceMappingURL=promise.js.map
