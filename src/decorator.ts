import { Container } from "aurelia-dependency-injection";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

import { Store } from "./store";

export function connectTo<T>(settings?: (store: Store<T>) => Observable<T>) {
  const store = Container.instance.get(Store) as Store<T>;

  return function (target: any) {
    const originalBind = target.prototype.bind;
    const originalUnbind = target.prototype.unbind;

    target.prototype.bind = function () {
      let source = store.state;

      if (typeof settings === "function") {
        const selector = settings(store);

        if (selector instanceof Observable) {
          source = selector;
        }
      }

      this._stateSubscription = source.subscribe(state => this.state = state);

      if (originalBind) {
        originalBind.apply(this, arguments);
      }
    }

    target.prototype.unbind = function () {
      if (this._stateSubscription &&
        this._stateSubscription instanceof Subscription &&
        (this._stateSubscription as Subscription).closed === false) {
        this._stateSubscription.unsubscribe();
      }

      if (originalUnbind) {
        originalUnbind.apply(this, arguments);
      }
    }
  }
}
