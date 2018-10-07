import { Container } from "aurelia-dependency-injection";
import { Observable } from "rxjs/internal/Observable";
import { Subscription } from "rxjs/internal/Subscription"

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

const defaultSelector = <T>(store: Store<T>) => store.state;

export function connectTo<T, R = any>(settings?: ((store: Store<T>) => Observable<R>) | ConnectToSettings<T, R>) {
  if (!Object.entries) {
    throw new Error("You need a polyfill for Object.entries for browsers like Internet Explorer. Example: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill")
  }

  const store = Container.instance.get(Store) as Store<T>;
  const _settings: ConnectToSettings<T, any> = {
    selector: typeof settings === "function" ? settings : defaultSelector,
    ...settings
  };

  function getSource(selector: (((store: Store<T>) => Observable<R>))): Observable<any> {
    const source = selector(store);

      if (source instanceof Observable) {
        return source;
      }

    return store.state;
  }

  function createSelectors() {
    const isSelectorObj = typeof _settings.selector === "object"; 
    const fallbackSelector = {
      [_settings.target || "state"]: _settings.selector || defaultSelector
    };
      
    return Object.entries({
      ...((isSelectorObj  ? _settings.selector : fallbackSelector) as MultipleSelector<T, any>)
    }).map(([target, selector]) => ({
      targets: _settings.target && isSelectorObj ? [_settings.target, target] : [target],
      selector,
      // numbers are the starting index to slice all the change handling args, 
      // which are prop name, new state and old state
      changeHandlers: {
        [_settings.onChanged || ""]: 1,
        [`${_settings.target || target}Changed`]: _settings.target ? 0 : 1,
        ["propertyChanged"]: 0
      }
    }));
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

      this._stateSubscriptions = createSelectors().map(s => getSource(s.selector).subscribe((state: any) => {
        const lastTargetIdx = s.targets.length - 1;
        const oldState = s.targets.reduce((accu = {}, curr) => accu[curr], this);

        Object.entries(s.changeHandlers).forEach(([handlerName, args]) => {
          if (handlerName in this) {
            this[handlerName](...[ s.targets[lastTargetIdx], state, oldState ].slice(args, 3))
          }
        });

        s.targets.reduce((accu, curr, idx) => {
          accu[curr] = idx === lastTargetIdx ? state : accu[curr] || {};
          return accu[curr];
        }, this);
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
