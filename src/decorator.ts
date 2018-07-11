import { Container } from "aurelia-dependency-injection";
import { Observable, Subscription } from "rxjs";

import { Store } from "./store";

export interface ConnectToSettings<T, R = T | any> {
  onChanged?: string;
  selector: ((store: Store<T>) => Observable<R>) | MultipleSelector<T, R>;
  setup?: string;
  target?: string;
  teardown?: string;
}

export interface MultipleSelector<T, R = T | any> {
  [key: string]: ((store: Store<T>) => Observable<R>);
}

interface MultipleSelected {
  [key: string]: Observable<any>;
}

export function connectTo<T, R = any>(settings?: ((store: Store<T>) => Observable<R>) | ConnectToSettings<T, R>) {
  const store = Container.instance.get(Store) as Store<T>;

  function getSources(): MultipleSelected {
    const targetName = (settings && (settings as ConnectToSettings<T, R>).target) || "";

    if (typeof settings === "function") {
      const selector = settings(store);

      if (selector instanceof Observable) {
        return { [targetName]: selector };
      }
    } else if (settings && typeof settings.selector === "function") {
      const selector = settings.selector(store);

      if (selector instanceof Observable) {
        return { [targetName]: selector };
      }
    } else if (settings && Object.keys(settings.selector).length) {
      return Object.entries(settings.selector).reduce((accu, curr) => ({
        ...accu,
        [curr[0]]: curr[1](store)
      }), { });
    }

    return { [targetName]: store.state };
  }

  return function (target: any) {
    const originalSetup = typeof settings === "object" && settings.setup
      ? target.prototype[settings.setup]
      : target.prototype.bind
    const originalTeardown = typeof settings === "object" && settings.teardown
      ? target.prototype[settings.teardown]
      : target.prototype.unbind;

    target.prototype[typeof settings === "object" && settings.setup ? settings.setup : "bind"] = function () {
      if (typeof settings == "object" &&
        typeof settings.onChanged === "string" &&
        !(settings.onChanged in this)) {
        throw new Error("Provided onChanged handler does not exist on target VM");
      }

      this._stateSubscriptions = Object.entries(getSources()).map(entry => entry[1].subscribe((state: any) => {
        const targetName = entry[0];
        const target = this[targetName] || this.state;

        // call onChanged first so that the handler has also access to the previous state
        const changeHandler = `${targetName}Changed`;

        // like the @observable decorator
        if (changeHandler in this) {
          this[changeHandler](state, target);
        } else if ("propertyChanged" in this) {
          this.propertyChanged(targetName, state, target);
        }

        if (typeof settings == "object" &&
          typeof settings.onChanged === "string") {
          this[settings.onChanged](state);
        }

        if (targetName) {
          this[targetName] = state;
        } else {
          this.state = state;
        }
      }));

      if (originalSetup) {
        return originalSetup.apply(this, arguments);
      }
    }

    target.prototype[typeof settings === "object" && settings.teardown ? settings.teardown : "unbind"] = function () {
      if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) {
        this._stateSubscriptions.forEach((sub: Subscription) => {
          if (sub instanceof Subscription && sub.closed === false) {
            sub.unsubscribe();
          }
        });
      }

      if (originalTeardown) {
        return originalTeardown.apply(this, arguments);
      }
    }
  }
}
