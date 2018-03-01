import { Store } from './store';
import { Container } from "aurelia-dependency-injection";
import { Observable } from 'rxjs/Observable';
export function connectTo(settings) {
    var store = Container.instance.get(Store);
    return function (target) {
        var originalBind = target.prototype.bind;
        var originalUnbind = target.prototype.unbind;
        target.prototype.bind = function () {
            var _this = this;
            var source = store.state;
            if (typeof settings === "function") {
                var selector = settings(store);
                if (selector instanceof Observable) {
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
//# sourceMappingURL=decorator.js.map