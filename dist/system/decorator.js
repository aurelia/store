System.register(["aurelia-dependency-injection", "rxjs/Observable", "rxjs/Subscription", "./store"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function connectTo(settings) {
        var store = aurelia_dependency_injection_1.Container.instance.get(store_1.Store);
        function getSource() {
            if (typeof settings === "function") {
                var selector = settings(store);
                if (selector instanceof Observable_1.Observable) {
                    return selector;
                }
            }
            else if (settings && typeof settings.selector === "function") {
                var selector = settings.selector(store);
                if (selector instanceof Observable_1.Observable) {
                    return selector;
                }
            }
            return store.state;
        }
        return function (target) {
            var originalSetup = typeof settings === "object" && settings.setup
                ? target.prototype[settings.setup]
                : target.prototype.bind;
            var originalTeardown = typeof settings === "object" && settings.teardown
                ? target.prototype[settings.teardown]
                : target.prototype.unbind;
            target.prototype[typeof settings === "object" && settings.setup ? settings.setup : "bind"] = function () {
                var _this = this;
                var source = getSource();
                this._stateSubscription = source.subscribe(function (state) {
                    // call onChanged first so that the handler has also access to the previous state
                    if (typeof settings == "object" &&
                        typeof settings.onChanged === "string") {
                        if (!(settings.onChanged in _this)) {
                            throw new Error("Provided onChanged handler does not exist on target VM");
                        }
                        else {
                            _this[settings.onChanged](state);
                        }
                    }
                    if (typeof settings === "object" && settings.target) {
                        _this[settings.target] = state;
                    }
                    else {
                        _this.state = state;
                    }
                });
                if (originalSetup) {
                    return originalSetup.apply(this, arguments);
                }
            };
            target.prototype[typeof settings === "object" && settings.teardown ? settings.teardown : "unbind"] = function () {
                if (this._stateSubscription &&
                    this._stateSubscription instanceof Subscription_1.Subscription &&
                    this._stateSubscription.closed === false) {
                    this._stateSubscription.unsubscribe();
                }
                if (originalTeardown) {
                    return originalTeardown.apply(this, arguments);
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