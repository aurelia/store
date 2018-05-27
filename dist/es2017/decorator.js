import { Container } from "aurelia-dependency-injection";
import { Observable, Subscription } from "rxjs";
import { Store } from "./store";
export function connectTo(settings) {
    const store = Container.instance.get(Store);
    function getSource() {
        if (typeof settings === "function") {
            const selector = settings(store);
            if (selector instanceof Observable) {
                return selector;
            }
        }
        else if (settings && typeof settings.selector === "function") {
            const selector = settings.selector(store);
            if (selector instanceof Observable) {
                return selector;
            }
        }
        return store.state;
    }
    return function (target) {
        const originalSetup = typeof settings === "object" && settings.setup
            ? target.prototype[settings.setup]
            : target.prototype.bind;
        const originalTeardown = typeof settings === "object" && settings.teardown
            ? target.prototype[settings.teardown]
            : target.prototype.unbind;
        target.prototype[typeof settings === "object" && settings.setup ? settings.setup : "bind"] = function () {
            const source = getSource();
            if (typeof settings == "object" &&
                typeof settings.onChanged === "string" &&
                !(settings.onChanged in this)) {
                throw new Error("Provided onChanged handler does not exist on target VM");
            }
            this._stateSubscription = source.subscribe(state => {
                // call onChanged first so that the handler has also access to the previous state
                if (typeof settings == "object" &&
                    typeof settings.onChanged === "string") {
                    this[settings.onChanged](state);
                }
                if (typeof settings === "object" && settings.target) {
                    this[settings.target] = state;
                }
                else {
                    this.state = state;
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