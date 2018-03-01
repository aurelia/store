define(["require", "exports", "./store", "aurelia-dependency-injection", "rxjs/Observable"], function (require, exports, store_1, aurelia_dependency_injection_1, Observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function connectTo(settings) {
        var store = aurelia_dependency_injection_1.Container.instance.get(store_1.Store);
        return function (target) {
            var originalBind = target.prototype.bind;
            var originalUnbind = target.prototype.unbind;
            target.prototype.bind = function () {
                var _this = this;
                var source = store.state;
                if (typeof settings === "function") {
                    var selector = settings(store);
                    if (selector instanceof Observable_1.Observable) {
                        source = selector;
                    }
                }
                this._stateSubscription = source.subscribe(function (state) { return _this.state = state; });
                if (originalBind) {
                    originalBind.apply(this, arguments);
                }
            };
            target.prototype.unbind = function () {
                if (this._stateSubscription && typeof this._stateSubscription.unsubscribe === "function") {
                    this._stateSubscription.unsubscribe();
                }
                if (originalUnbind) {
                    originalUnbind.apply(this, arguments);
                }
            };
        };
    }
    exports.connectTo = connectTo;
});
//# sourceMappingURL=decorator.js.map