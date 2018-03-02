System.register(["aurelia-dependency-injection", "rxjs/Observable", "rxjs/Subscription", "./store"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
                if (this._stateSubscription &&
                    this._stateSubscription instanceof Subscription_1.Subscription &&
                    this._stateSubscription.closed === false) {
                    this._stateSubscription.unsubscribe();
                }
                if (originalUnbind) {
                    originalUnbind.apply(this, arguments);
                }
            };
        };
    }
    exports_1("connectTo", connectTo);
    var aurelia_dependency_injection_1, Observable_1, Subscription_1, store_1;
    return {
        setters: [
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (Subscription_1_1) {
                Subscription_1 = Subscription_1_1;
            },
            function (store_1_1) {
                store_1 = store_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=decorator.js.map