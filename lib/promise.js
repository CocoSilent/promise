(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Promise = factory());
})(this, (function () { 'use strict';

	var Promise$1 = /** @class */ (function () {
	    function Promise() {
	    }
	    return Promise;
	}());

	return Promise$1;

}));
//# sourceMappingURL=promise.js.map
