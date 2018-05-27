import { Container } from "aurelia-dependency-injection";
import { Observable, Subscription } from "rxjs";
import { Store } from "./store";
export function connectTo(settings) {
    var store = Container.instance.get(Store);
    function getSource() {
        if (typeof settings === "function") {
            var selector = settings(store);
            if (selector instanceof Observable) {
                return selector;
            }
        }
        else if (settings && typeof settings.selector === "function") {
            var selector = settings.selector(store);
            if (selector instanceof Observable) {
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
            if (typeof settings == "object" &&
                typeof settings.onChanged === "string" &&
                !(settings.onChanged in this)) {
                throw new Error("Provided onChanged handler does not exist on target VM");
            }
            this._stateSubscription = source.subscribe(function (state) {
                // call onChanged first so that the handler has also access to the previous state
                if (typeof settings == "object" &&
                    typeof settings.onChanged === "string") {
                    _this[settings.onChanged](state);
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
                this._stateSubscription instanceof Subscription &&
                this._stateSubscription.closed === false) {
                this._stateSubscription.unsubscribe();
            }
            if (originalTeardown) {
                return originalTeardown.apply(this, arguments);
            }
        };
    };
}
//# sourceMappingURL=decorator.js.map