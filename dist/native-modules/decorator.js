var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Container } from "aurelia-dependency-injection";
import { Observable, Subscription } from "rxjs";
import { Store } from "./store";
var defaultSelector = function (store) { return store.state; };
export function connectTo(settings) {
    if (!Object.entries) {
        throw new Error("You need a polyfill for Object.entries for browsers like Internet Explorer. Example: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill");
    }
    var store = Container.instance.get(Store);
    var _settings = __assign({ selector: typeof settings === "function" ? settings : defaultSelector }, settings);
    function getSource(selector) {
        var source = selector(store);
        if (source instanceof Observable) {
            return source;
        }
        return store.state;
    }
    function createSelectors() {
        var _a;
        var isSelectorObj = typeof _settings.selector === "object";
        var fallbackSelector = (_a = {},
            _a[_settings.target || "state"] = _settings.selector || defaultSelector,
            _a);
        return Object.entries(__assign({}, (isSelectorObj ? _settings.selector : fallbackSelector))).map(function (_a) {
            var target = _a[0], selector = _a[1];
            var _b;
            return ({
                targets: _settings.target && isSelectorObj ? [_settings.target, target] : [target],
                selector: selector,
                // numbers are the starting index to slice all the change handling args, 
                // which are prop name, new state and old state
                changeHandlers: (_b = {},
                    _b[_settings.onChanged || ""] = 1,
                    _b[(_settings.target || target) + "Changed"] = _settings.target ? 0 : 1,
                    _b["propertyChanged"] = 0,
                    _b)
            });
        });
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
            if (typeof settings == "object" &&
                typeof settings.onChanged === "string" &&
                !(settings.onChanged in this)) {
                throw new Error("Provided onChanged handler does not exist on target VM");
            }
            this._stateSubscriptions = createSelectors().map(function (s) { return getSource(s.selector).subscribe(function (state) {
                var lastTargetIdx = s.targets.length - 1;
                var oldState = s.targets.reduce(function (accu, curr) {
                    if (accu === void 0) { accu = {}; }
                    return accu[curr];
                }, _this);
                Object.entries(s.changeHandlers).forEach(function (_a) {
                    var handlerName = _a[0], args = _a[1];
                    if (handlerName in _this) {
                        _this[handlerName].apply(_this, [s.targets[lastTargetIdx], state, oldState].slice(args, 3));
                    }
                });
                s.targets.reduce(function (accu, curr, idx) {
                    accu[curr] = idx === lastTargetIdx ? state : accu[curr] || {};
                    return accu[curr];
                }, _this);
            }); });
            if (originalSetup) {
                return originalSetup.apply(this, arguments);
            }
        };
        target.prototype[typeof settings === "object" && settings.teardown ? settings.teardown : "unbind"] = function () {
            if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) {
                this._stateSubscriptions.forEach(function (sub) {
                    if (sub instanceof Subscription && sub.closed === false) {
                        sub.unsubscribe();
                    }
                });
            }
            if (originalTeardown) {
                return originalTeardown.apply(this, arguments);
            }
        };
    };
}
//# sourceMappingURL=decorator.js.map