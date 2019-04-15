(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('aurelia-dependency-injection'), require('aurelia-logging'), require('aurelia-pal'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define(['exports', 'rxjs', 'aurelia-dependency-injection', 'aurelia-logging', 'aurelia-pal', 'rxjs/operators'], factory) :
    (global = global || self, factory((global.au = global.au || {}, global.au.store = {}), global.rxjs, global.au, global.au.LogManager, global.au, global.rxjs));
}(this, function (exports, rxjs, aureliaDependencyInjection, aureliaLogging, aureliaPal, operators) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function jump(state, n) {
        if (!isStateHistory(state)) {
            return state;
        }
        if (n > 0)
            return jumpToFuture(state, n - 1);
        if (n < 0)
            return jumpToPast(state, state.past.length + n);
        return state;
    }
    function jumpToFuture(state, index) {
        if (index < 0 || index >= state.future.length) {
            return state;
        }
        const { past, future, present } = state;
        const newPast = [...past, present, ...future.slice(0, index)];
        const newPresent = future[index];
        const newFuture = future.slice(index + 1);
        return { past: newPast, present: newPresent, future: newFuture };
    }
    function jumpToPast(state, index) {
        if (index < 0 || index >= state.past.length) {
            return state;
        }
        const { past, future, present } = state;
        const newPast = past.slice(0, index);
        const newFuture = [...past.slice(index + 1), present, ...future];
        const newPresent = past[index];
        return { past: newPast, present: newPresent, future: newFuture };
    }
    function nextStateHistory(presentStateHistory, nextPresent) {
        return Object.assign({}, presentStateHistory, {
            past: [...presentStateHistory.past, presentStateHistory.present],
            present: nextPresent,
            future: []
        });
    }
    function applyLimits(state, limit) {
        if (isStateHistory(state)) {
            if (state.past.length > limit) {
                state.past = state.past.slice(state.past.length - limit);
            }
            if (state.future.length > limit) {
                state.future = state.future.slice(0, limit);
            }
        }
        return state;
    }
    function isStateHistory(history) {
        return typeof history.present !== "undefined" &&
            typeof history.future !== "undefined" &&
            typeof history.past !== "undefined" &&
            Array.isArray(history.future) &&
            Array.isArray(history.past);
    }

    (function (MiddlewarePlacement) {
        MiddlewarePlacement["Before"] = "before";
        MiddlewarePlacement["After"] = "after";
    })(exports.MiddlewarePlacement || (exports.MiddlewarePlacement = {}));
    function logMiddleware(state, _, settings) {
        const logType = settings && settings.logType && console.hasOwnProperty(settings.logType) ? settings.logType : "log";
        console[logType]("New state: ", state);
    }
    function localStorageMiddleware(state, _, settings) {
        if (aureliaPal.PLATFORM.global.localStorage) {
            const key = settings && settings.key && typeof settings.key === "string"
                ? settings.key
                : "aurelia-store-state";
            aureliaPal.PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
        }
    }
    function rehydrateFromLocalStorage(state, key) {
        if (!aureliaPal.PLATFORM.global.localStorage) {
            return state;
        }
        const storedState = aureliaPal.PLATFORM.global.localStorage.getItem(key || "aurelia-store-state");
        if (!storedState) {
            return state;
        }
        try {
            return JSON.parse(storedState);
        }
        catch (e) { }
        return state;
    }

    (function (LogLevel) {
        LogLevel["trace"] = "trace";
        LogLevel["debug"] = "debug";
        LogLevel["info"] = "info";
        LogLevel["log"] = "log";
        LogLevel["warn"] = "warn";
        LogLevel["error"] = "error";
    })(exports.LogLevel || (exports.LogLevel = {}));
    class LoggerIndexed extends aureliaLogging.Logger {
    }
    function getLogType(options, definition, defaultLevel) {
        if (definition &&
            options.logDefinitions &&
            options.logDefinitions.hasOwnProperty(definition) &&
            options.logDefinitions[definition] &&
            Object.values(exports.LogLevel).includes(options.logDefinitions[definition])) {
            return options.logDefinitions[definition];
        }
        return defaultLevel;
    }

    (function (PerformanceMeasurement) {
        PerformanceMeasurement["StartEnd"] = "startEnd";
        PerformanceMeasurement["All"] = "all";
    })(exports.PerformanceMeasurement || (exports.PerformanceMeasurement = {}));
    class Store {
        constructor(initialState, options) {
            this.initialState = initialState;
            this.logger = aureliaLogging.getLogger("aurelia-store");
            this.devToolsAvailable = false;
            this.actions = new Map();
            this.middlewares = new Map();
            this.dispatchQueue = [];
            this.options = options || {};
            const isUndoable = this.options.history && this.options.history.undoable === true;
            this._state = new rxjs.BehaviorSubject(initialState);
            this.state = this._state.asObservable();
            if (!this.options.devToolsOptions || this.options.devToolsOptions.disable !== true) {
                this.setupDevTools();
            }
            if (isUndoable) {
                this.registerHistoryMethods();
            }
        }
        registerMiddleware(reducer, placement, settings) {
            this.middlewares.set(reducer, { placement, settings });
        }
        unregisterMiddleware(reducer) {
            if (this.middlewares.has(reducer)) {
                this.middlewares.delete(reducer);
            }
        }
        isMiddlewareRegistered(middleware) {
            return this.middlewares.has(middleware);
        }
        registerAction(name, reducer) {
            if (reducer.length === 0) {
                throw new Error("The reducer is expected to have one or more parameters, where the first will be the present state");
            }
            this.actions.set(reducer, { type: name });
        }
        unregisterAction(reducer) {
            if (this.actions.has(reducer)) {
                this.actions.delete(reducer);
            }
        }
        isActionRegistered(reducer) {
            if (typeof reducer === "string") {
                return Array.from(this.actions).find((action) => action[1].type === reducer) !== undefined;
            }
            return this.actions.has(reducer);
        }
        resetToState(state) {
            this._state.next(state);
        }
        dispatch(reducer, ...params) {
            let action;
            if (typeof reducer === "string") {
                const result = Array.from(this.actions)
                    .find((val) => val[1].type === reducer);
                if (result) {
                    action = result[0];
                }
            }
            else {
                action = reducer;
            }
            return new Promise((resolve, reject) => {
                this.dispatchQueue.push({ reducer: action, params, resolve, reject });
                if (this.dispatchQueue.length === 1) {
                    this.handleQueue();
                }
            });
        }
        handleQueue() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.dispatchQueue.length > 0) {
                    const queueItem = this.dispatchQueue[0];
                    try {
                        yield this.internalDispatch(queueItem.reducer, ...queueItem.params);
                        queueItem.resolve();
                    }
                    catch (e) {
                        queueItem.reject(e);
                    }
                    this.dispatchQueue.shift();
                    this.handleQueue();
                }
            });
        }
        internalDispatch(reducer, ...params) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.actions.has(reducer)) {
                    throw new Error(`Tried to dispatch an unregistered action${reducer ? " " + reducer.name : ""}`);
                }
                aureliaPal.PLATFORM.performance.mark("dispatch-start");
                const action = Object.assign({}, this.actions.get(reducer), { params });
                if (this.options.logDispatchedActions) {
                    this.logger[getLogType(this.options, "dispatchedActions", exports.LogLevel.info)](`Dispatching: ${action.type}`);
                }
                const beforeMiddleswaresResult = yield this.executeMiddlewares(this._state.getValue(), exports.MiddlewarePlacement.Before, {
                    name: action.type,
                    params
                });
                if (beforeMiddleswaresResult === false) {
                    aureliaPal.PLATFORM.performance.clearMarks();
                    aureliaPal.PLATFORM.performance.clearMeasures();
                    return;
                }
                const result = yield reducer(beforeMiddleswaresResult, ...params);
                if (result === false) {
                    aureliaPal.PLATFORM.performance.clearMarks();
                    aureliaPal.PLATFORM.performance.clearMeasures();
                    return;
                }
                aureliaPal.PLATFORM.performance.mark("dispatch-after-reducer-" + action.type);
                if (!result && typeof result !== "object") {
                    throw new Error("The reducer has to return a new state");
                }
                let resultingState = yield this.executeMiddlewares(result, exports.MiddlewarePlacement.After, {
                    name: action.type,
                    params
                });
                if (resultingState === false) {
                    aureliaPal.PLATFORM.performance.clearMarks();
                    aureliaPal.PLATFORM.performance.clearMeasures();
                    return;
                }
                if (isStateHistory(resultingState) &&
                    this.options.history &&
                    this.options.history.limit) {
                    resultingState = applyLimits(resultingState, this.options.history.limit);
                }
                this._state.next(resultingState);
                aureliaPal.PLATFORM.performance.mark("dispatch-end");
                if (this.options.measurePerformance === exports.PerformanceMeasurement.StartEnd) {
                    aureliaPal.PLATFORM.performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
                    const measures = aureliaPal.PLATFORM.performance.getEntriesByName("startEndDispatchDuration");
                    this.logger[getLogType(this.options, "performanceLog", exports.LogLevel.info)](`Total duration ${measures[0].duration} of dispatched action ${action.type}:`, measures);
                }
                else if (this.options.measurePerformance === exports.PerformanceMeasurement.All) {
                    const marks = aureliaPal.PLATFORM.performance.getEntriesByType("mark");
                    const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
                    this.logger[getLogType(this.options, "performanceLog", exports.LogLevel.info)](`Total duration ${totalDuration} of dispatched action ${action.type}:`, marks);
                }
                aureliaPal.PLATFORM.performance.clearMarks();
                aureliaPal.PLATFORM.performance.clearMeasures();
                this.updateDevToolsState(action, resultingState);
            });
        }
        executeMiddlewares(state, placement, action) {
            return Array.from(this.middlewares)
                .filter((middleware) => middleware[1].placement === placement)
                .reduce((prev, curr, _, _arr) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield curr[0](yield prev, this._state.getValue(), curr[1].settings, action);
                    if (result === false) {
                        _arr = [];
                        return false;
                    }
                    return result || (yield prev);
                }
                catch (e) {
                    if (this.options.propagateError) {
                        _arr = [];
                        throw e;
                    }
                    return yield prev;
                }
                finally {
                    aureliaPal.PLATFORM.performance.mark(`dispatch-${placement}-${curr[0].name}`);
                }
            }), state);
        }
        setupDevTools() {
            if (aureliaPal.PLATFORM.global.devToolsExtension) {
                this.logger[getLogType(this.options, "devToolsStatus", exports.LogLevel.debug)]("DevTools are available");
                this.devToolsAvailable = true;
                this.devTools = aureliaPal.PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
                this.devTools.init(this.initialState);
                this.devTools.subscribe((message) => {
                    this.logger[getLogType(this.options, "devToolsStatus", exports.LogLevel.debug)](`DevTools sent change ${message.type}`);
                    if (message.type === "DISPATCH") {
                        this._state.next(JSON.parse(message.state));
                    }
                });
            }
        }
        updateDevToolsState(action, state) {
            if (this.devToolsAvailable) {
                this.devTools.send(action, state);
            }
        }
        registerHistoryMethods() {
            this.registerAction("jump", jump);
        }
    }
    function dispatchify(action) {
        const store = aureliaDependencyInjection.Container.instance.get(Store);
        return function (...params) {
            return store.dispatch(action, ...params);
        };
    }

    function executeSteps(store, shouldLogResults, ...steps) {
        return __awaiter(this, void 0, void 0, function* () {
            const logStep = (step, stepIdx) => (res) => {
                if (shouldLogResults) {
                    console.group(`Step ${stepIdx}`);
                    console.log(res);
                    console.groupEnd();
                }
                step(res);
            };
            // tslint:disable-next-line:no-any
            const tryStep = (step, reject) => (res) => {
                try {
                    step(res);
                }
                catch (err) {
                    reject(err);
                }
            };
            const lastStep = (step, resolve) => (res) => {
                step(res);
                resolve();
            };
            return new Promise((resolve, reject) => {
                let currentStep = 0;
                steps.slice(0, -1).forEach((step) => {
                    store.state.pipe(operators.skip(currentStep), operators.take(1), operators.delay(0)).subscribe(tryStep(logStep(step, currentStep), reject));
                    currentStep++;
                });
                store.state.pipe(operators.skip(currentStep), operators.take(1)).subscribe(lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
            });
        });
    }

    const defaultSelector = (store) => store.state;
    function connectTo(settings) {
        if (!Object.entries) {
            throw new Error("You need a polyfill for Object.entries for browsers like Internet Explorer. Example: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill");
        }
        let $store;
        // const store = Container.instance.get(Store) as Store<T>;
        const _settings = Object.assign({ selector: typeof settings === "function" ? settings : defaultSelector }, settings);
        function getSource(selector) {
            // if for some reason getSource is invoked before setup (bind lifecycle, typically)
            // then we have no choice but to get the store instance from global container instance
            // otherwise, assume that $store variable in the closure would be already assigned the right
            // value from created callback
            // Could also be in situation where it doesn't come from custom element, or some exotic setups/scenarios
            const store = $store || ($store = aureliaDependencyInjection.Container.instance.get(Store));
            const source = selector(store);
            if (source instanceof rxjs.Observable) {
                return source;
            }
            return store.state;
        }
        function createSelectors() {
            const isSelectorObj = typeof _settings.selector === "object";
            const fallbackSelector = {
                [_settings.target || "state"]: _settings.selector || defaultSelector
            };
            return Object.entries(Object.assign({}, (isSelectorObj ? _settings.selector : fallbackSelector))).map(([target, selector]) => ({
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
        return function (target) {
            const originalCreated = target.prototype.created;
            const originalSetup = typeof settings === "object" && settings.setup
                ? target.prototype[settings.setup]
                : target.prototype.bind;
            const originalTeardown = typeof settings === "object" && settings.teardown
                ? target.prototype[settings.teardown]
                : target.prototype.unbind;
            // only override if prototype callback is a function
            if (typeof originalCreated === "function" || originalCreated === undefined) {
                target.prototype.created = function created(_, view) {
                    // here we relies on the fact that the class Store
                    // has not been registered somewhere in one of child containers, instead of root container
                    // if there is any issue with this approach, needs to walk all the way up to resolve from root
                    // typically like invoking from global Container.instance
                    $store = view.container.get(Store);
                    if (originalCreated !== undefined) {
                        return originalCreated.call(this, _, view);
                    }
                };
            }
            target.prototype[typeof settings === "object" && settings.setup ? settings.setup : "bind"] = function () {
                if (typeof settings == "object" &&
                    typeof settings.onChanged === "string" &&
                    !(settings.onChanged in this)) {
                    throw new Error("Provided onChanged handler does not exist on target VM");
                }
                this._stateSubscriptions = createSelectors().map(s => getSource(s.selector).subscribe((state) => {
                    const lastTargetIdx = s.targets.length - 1;
                    const oldState = s.targets.reduce((accu = {}, curr) => accu[curr], this);
                    Object.entries(s.changeHandlers).forEach(([handlerName, args]) => {
                        if (handlerName in this) {
                            this[handlerName](...[s.targets[lastTargetIdx], state, oldState].slice(args, 3));
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
            };
            target.prototype[typeof settings === "object" && settings.teardown ? settings.teardown : "unbind"] = function () {
                if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) {
                    this._stateSubscriptions.forEach((sub) => {
                        if (sub instanceof rxjs.Subscription && sub.closed === false) {
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

    function configure(aurelia, options) {
        if (!options || !options.initialState) {
            throw new Error("initialState must be provided via options");
        }
        let initState = options.initialState;
        if (options && options.history && options.history.undoable && !isStateHistory(options.initialState)) {
            initState = { past: [], present: options.initialState, future: [] };
        }
        delete options.initialState;
        aurelia.container
            .registerInstance(Store, new Store(initState, options));
    }

    exports.configure = configure;
    exports.Store = Store;
    exports.dispatchify = dispatchify;
    exports.executeSteps = executeSteps;
    exports.jump = jump;
    exports.nextStateHistory = nextStateHistory;
    exports.applyLimits = applyLimits;
    exports.isStateHistory = isStateHistory;
    exports.logMiddleware = logMiddleware;
    exports.localStorageMiddleware = localStorageMiddleware;
    exports.rehydrateFromLocalStorage = rehydrateFromLocalStorage;
    exports.LoggerIndexed = LoggerIndexed;
    exports.getLogType = getLogType;
    exports.connectTo = connectTo;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
