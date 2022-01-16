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

    var Promise$1 = /** @class */ (function () {
        function Promise(executor) {
            this.PromiseState = null;
            this.resolve = function (value) {
                this.PromiseState = PromiseState.FULLFILLED;
                this.PromiseResult = value;
            };
            this.reject = function (reason) {
                this.PromiseState = PromiseState.REJECTED;
                this.PromiseResult = reason;
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
            var promise2 = new Promise(function (resolve, reject) {
                if (_this.PromiseState === PromiseState.FULLFILLED) {
                    onFulfilled(_this.PromiseResult);
                }
                else if (_this.PromiseState === PromiseState.REJECTED) {
                    onRejected(_this.PromiseResult);
                }
                else if (_this.PromiseState === PromiseState.PENDING) ;
            });
            return promise2;
        };
        return Promise;
    }());

    return Promise$1;

}));
//# sourceMappingURL=promise.js.map
