var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { autoinject, LogManager } from "aurelia-framework";
var Store = /** @class */ (function () {
    function Store(initialState) {
        this.logger = LogManager.getLogger("aurelia-store");
        this.devToolsAvailable = false;
        this.actions = new Map();
        this.initialState = initialState;
        this._state = new BehaviorSubject(this.initialState);
        this.state = this._state.asObservable();
        this.setupDevTools();
    }
    Store.prototype.registerAction = function (name, reducer) {
        if (reducer.length === 0) {
            throw new Error("The reducer is expected to have one or more parameters, where the first will be the current state");
        }
        this.actions.set(reducer, { name: name, reducer: reducer });
    };
    Store.prototype.dispatch = function (reducer) {
        var _this = this;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        if (this.actions.has(reducer)) {
            var action_1 = this.actions.get(reducer);
            var result = (_a = action_1).reducer.apply(_a, [this._state.getValue()].concat(params));
            if (!result && typeof result !== "object") {
                throw new Error("The reducer has to return a new state");
            }
            var apply_1 = function (newState) {
                _this._state.next(newState);
                _this.updateDevToolsState(action_1.name, newState);
            };
            if (typeof result.then === "function") {
                result.then(function (resolvedState) { return apply_1(resolvedState); });
            }
            else {
                apply_1(result);
            }
        }
        var _a;
    };
    Store.prototype.setupDevTools = function () {
        var _this = this;
        if (window.devToolsExtension) {
            this.logger.info("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
            this.devTools.init(this.initialState);
            this.devTools.subscribe(function (message) {
                _this.logger.debug("DevTools sent change " + message.type);
                if (message.type === "DISPATCH") {
                    _this._state.next(JSON.parse(message.state));
                }
            });
        }
    };
    Store.prototype.updateDevToolsState = function (action, state) {
        if (this.devToolsAvailable) {
            this.devTools.send(action, state);
        }
    };
    Store = __decorate([
        autoinject()
    ], Store);
    return Store;
}());
export { Store };
