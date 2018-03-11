import { Container } from "aurelia-dependency-injection";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

import { Store } from "./store";

export interface ConnectToSettings<T> {
  selector: (store: Store<T>) => Observable<T>;
  target?: string;
  setup?: string;
  teardown?: string;
}

export function connectTo<T>(settings?: ((store: Store<T>) => Observable<T>) | ConnectToSettings<T>) {
  const store = Container.instance.get(Store) as Store<T>;

  function getSource() {
    if (typeof settings === "function") {
      const selector = settings(store);

      if (selector instanceof Observable) {
        return selector;
      }
    } else if (settings && typeof settings.selector === "function") {
      const selector = settings.selector(store);

      if (selector instanceof Observable) {
        return selector;
      }
    }

    return store.state;
  }

  return function (target: any) {
    const originalSetup = typeof settings === "object" && settings.setup
      ? target.prototype[settings.setup]
      : target.prototype.bind
    const originalTeardown = typeof settings === "object" && settings.teardown
      ? target.prototype[settings.teardown]
      : target.prototype.unbind;

    target.prototype[typeof settings === "object" && settings.setup ? settings.setup : "bind"] = function () {
      const source = getSource();

      this._stateSubscription = source.subscribe(state => {
        if (typeof settings === "object" && settings.target) {
          this[settings.target] = state;
        } else {
          this.state = state;
        }
      });

      if (originalSetup) {
        originalSetup.apply(this, arguments);
      }
    }

    target.prototype[typeof settings === "object" && settings.teardown ? settings.teardown : "unbind"] = function () {
      if (this._stateSubscription &&
        this._stateSubscription instanceof Subscription &&
        (this._stateSubscription as Subscription).closed === false) {
        this._stateSubscription.unsubscribe();
      }

      if (originalTeardown) {
        originalTeardown.apply(this, arguments);
      }
    }
  }
}
