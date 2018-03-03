import { Container } from "aurelia-dependency-injection";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
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
        var originalBind = target.prototype.bind;
        var originalUnbind = target.prototype.unbind;
        target.prototype.bind = function () {
            var _this = this;
            var source = getSource();
            this._stateSubscription = source.subscribe(function (state) {
                if (typeof settings === "object" && settings.target) {
                    _this[settings.target] = state;
                }
                else {
                    _this.state = state;
                }
            });
            if (originalBind) {
                originalBind.apply(this, arguments);
            }
        };
        target.prototype.unbind = function () {
            if (this._stateSubscription &&
                this._stateSubscription instanceof Subscription &&
                this._stateSubscription.closed === false) {
                this._stateSubscription.unsubscribe();
            }
            if (originalUnbind) {
                originalUnbind.apply(this, arguments);
            }
        };
    };
}
//# sourceMappingURL=decorator.js.map