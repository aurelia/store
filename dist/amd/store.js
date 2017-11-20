var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "rxjs/BehaviorSubject", "aurelia-framework"], function (require, exports, BehaviorSubject_1, aurelia_framework_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Store = /** @class */ (function () {
        // extract implementations into a simple service
        // this way you can leverage both a observable and traditional style
        function Store(initialState) {
            // Aurelia logging helper
            this.logger = aurelia_framework_1.LogManager.getLogger("aurelia-store");
            // Redux-DevTools? Hell yeah
            this.devToolsAvailable = false;
            this.actions = new Map();
            this.initialState = initialState;
            this._state = new BehaviorSubject_1.BehaviorSubject(this.initialState);
            this.state = this._state.asObservable();
            this.setupDevTools();
        }
        Store.prototype.registerAction = function (name, reducer) {
            this.actions.set(reducer, { name: name, reducer: reducer });
        };
        Store.prototype.dispatch = function (reducer) {
            if (this.actions.has(reducer)) {
                var action = this.actions.get(reducer);
                var newState = action.reducer(this._state.getValue());
                this._state.next(newState);
                this.updateDevToolsState(action.name, newState);
            }
        };
        /* ACTIONS */
        Store.prototype.setupDevTools = function () {
            var _this = this;
            // check whether the user has the Redux-DevTools browser extension installed
            if (window.devToolsExtension) {
                this.logger.info("DevTools are available");
                this.devToolsAvailable = true;
                // establish a connection with the DevTools
                this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
                // set the initial state
                this.devTools.init(this.initialState);
                // subscribe to changes, e.g navigation from within the DevTools
                this.devTools.subscribe(function (message) {
                    _this.logger.debug("DevTools sent change " + message.type);
                    if (message.type === "DISPATCH") {
                        // the state is sent as string, so don't forget to parse it :)
                        _this._state.next(JSON.parse(message.state));
                    }
                });
            }
        };
        Store.prototype.updateDevToolsState = function (action, state) {
            // if the Redux-DevTools are available, sync the states
            if (this.devToolsAvailable) {
                this.devTools.send(action, state);
            }
        };
        Store = __decorate([
            aurelia_framework_1.autoinject()
        ], Store);
        return Store;
    }());
    exports.Store = Store;
});
