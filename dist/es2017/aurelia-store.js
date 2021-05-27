import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { Container } from 'aurelia-dependency-injection';
import { Logger, getLogger } from 'aurelia-logging';
import { PLATFORM } from 'aurelia-pal';
import { skip, take, delay } from 'rxjs/operators';

/* istanbul ignore next */
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill
if (!Object.entries) {
    Object.entries = function (obj) {
        var ownProps = Object.keys(obj), i = ownProps.length, resArray = new Array(i); // preallocate the Array
        while (i--) {
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        }
        return resArray;
    };
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

const DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";
var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement || (MiddlewarePlacement = {}));
function logMiddleware(state, _, settings) {
    const logType = settings && settings.logType && console.hasOwnProperty(settings.logType) ? settings.logType : "log";
    console[logType]("New state: ", state);
}
function localStorageMiddleware(state, _, settings) {
    if (PLATFORM.global.localStorage) {
        const key = settings && settings.key || DEFAULT_LOCAL_STORAGE_KEY;
        PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
    }
}
function rehydrateFromLocalStorage(state, key) {
    if (!PLATFORM.global.localStorage) {
        return state;
    }
    const storedState = PLATFORM.global.localStorage.getItem(key || DEFAULT_LOCAL_STORAGE_KEY);
    if (!storedState) {
        return state;
    }
    try {
        return JSON.parse(storedState);
    }
    catch (e) { }
    return state;
}

var LogLevel;
(function (LogLevel) {
    LogLevel["trace"] = "trace";
    LogLevel["debug"] = "debug";
    LogLevel["info"] = "info";
    LogLevel["log"] = "log";
    LogLevel["warn"] = "warn";
    LogLevel["error"] = "error";
})(LogLevel || (LogLevel = {}));
class LoggerIndexed extends Logger {
}
function getLogType(options, definition, defaultLevel) {
    if (definition &&
        options.logDefinitions &&
        options.logDefinitions.hasOwnProperty(definition) &&
        options.logDefinitions[definition] &&
        Object.values(LogLevel).includes(options.logDefinitions[definition])) {
        return options.logDefinitions[definition];
    }
    return defaultLevel;
}

var PerformanceMeasurement;
(function (PerformanceMeasurement) {
    PerformanceMeasurement["StartEnd"] = "startEnd";
    PerformanceMeasurement["All"] = "all";
})(PerformanceMeasurement || (PerformanceMeasurement = {}));
class UnregisteredActionError extends Error {
    constructor(reducer) {
        super(`Tried to dispatch an unregistered action ${reducer && (typeof reducer === "string" ? reducer : reducer.name)}`);
    }
}
class Store {
    constructor(initialState, options) {
        this.initialState = initialState;
        this.logger = getLogger("aurelia-store");
        this.devToolsAvailable = false;
        this.actions = new Map();
        this.middlewares = new Map();
        this._markNames = new Set();
        this._measureNames = new Set();
        this.dispatchQueue = [];
        this.options = options || {};
        const isUndoable = this.options.history && this.options.history.undoable === true;
        this._state = new BehaviorSubject(initialState);
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
        const action = this.lookupAction(reducer);
        if (!action) {
            return Promise.reject(new UnregisteredActionError(reducer));
        }
        return this.queueDispatch([{
                reducer: action,
                params
            }]);
    }
    pipe(reducer, ...params) {
        const pipeline = [];
        const dispatchPipe = {
            dispatch: () => this.queueDispatch(pipeline),
            pipe: (nextReducer, ...nextParams) => {
                const action = this.lookupAction(nextReducer);
                if (!action) {
                    throw new UnregisteredActionError(reducer);
                }
                pipeline.push({ reducer: action, params: nextParams });
                return dispatchPipe;
            }
        };
        return dispatchPipe.pipe(reducer, ...params);
    }
    lookupAction(reducer) {
        if (typeof reducer === "string") {
            const result = Array.from(this.actions).find(([_, action]) => action.type === reducer);
            if (result) {
                return result[0];
            }
        }
        else if (this.actions.has(reducer)) {
            return reducer;
        }
        return undefined;
    }
    queueDispatch(actions) {
        return new Promise((resolve, reject) => {
            this.dispatchQueue.push({ actions, resolve, reject });
            if (this.dispatchQueue.length === 1) {
                this.handleQueue();
            }
        });
    }
    async handleQueue() {
        if (this.dispatchQueue.length > 0) {
            const queueItem = this.dispatchQueue[0];
            try {
                await this.internalDispatch(queueItem.actions);
                queueItem.resolve();
            }
            catch (e) {
                queueItem.reject(e);
            }
            this.dispatchQueue.shift();
            this.handleQueue();
        }
    }
    async internalDispatch(actions) {
        const unregisteredAction = actions.find((a) => !this.actions.has(a.reducer));
        if (unregisteredAction) {
            throw new UnregisteredActionError(unregisteredAction.reducer);
        }
        this.mark("dispatch-start");
        const pipedActions = actions.map((a) => ({
            type: this.actions.get(a.reducer).type,
            params: a.params,
            reducer: a.reducer
        }));
        const callingAction = {
            name: pipedActions.map((a) => a.type).join("->"),
            params: pipedActions.reduce((p, a) => p.concat(a.params), []),
            pipedActions: pipedActions.map((a) => ({
                name: a.type,
                params: a.params
            }))
        };
        if (this.options.logDispatchedActions) {
            this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)](`Dispatching: ${callingAction.name}`);
        }
        const beforeMiddleswaresResult = await this.executeMiddlewares(this._state.getValue(), MiddlewarePlacement.Before, callingAction);
        if (beforeMiddleswaresResult === false) {
            this.clearMarks();
            this.clearMeasures();
            return;
        }
        let result = beforeMiddleswaresResult;
        for (const action of pipedActions) {
            result = await action.reducer(result, ...action.params);
            if (result === false) {
                this.clearMarks();
                this.clearMeasures();
                return;
            }
            this.mark("dispatch-after-reducer-" + action.type);
            if (!result && typeof result !== "object") {
                throw new Error("The reducer has to return a new state");
            }
        }
        let resultingState = await this.executeMiddlewares(result, MiddlewarePlacement.After, callingAction);
        if (resultingState === false) {
            this.clearMarks();
            this.clearMeasures();
            return;
        }
        if (isStateHistory(resultingState) &&
            this.options.history &&
            this.options.history.limit) {
            resultingState = applyLimits(resultingState, this.options.history.limit);
        }
        this._state.next(resultingState);
        this.mark("dispatch-end");
        if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
            this.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
            const measures = PLATFORM.performance.getEntriesByName("startEndDispatchDuration", "measure");
            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](`Total duration ${measures[0].duration} of dispatched action ${callingAction.name}:`, measures);
        }
        else if (this.options.measurePerformance === PerformanceMeasurement.All) {
            const marks = PLATFORM.performance.getEntriesByType("mark");
            const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](`Total duration ${totalDuration} of dispatched action ${callingAction.name}:`, marks);
        }
        this.clearMarks();
        this.clearMeasures();
        this.updateDevToolsState({ type: callingAction.name, params: callingAction.params }, resultingState);
    }
    executeMiddlewares(state, placement, action) {
        return Array.from(this.middlewares)
            .filter((middleware) => middleware[1].placement === placement)
            .reduce(async (prev, curr, _, _arr) => {
            try {
                const result = await curr[0](await prev, this._state.getValue(), curr[1].settings, action);
                if (result === false) {
                    _arr = [];
                    return false;
                }
                return result || await prev;
            }
            catch (e) {
                if (this.options.propagateError) {
                    _arr = [];
                    throw e;
                }
                return await prev;
            }
            finally {
                this.mark(`dispatch-${placement}-${curr[0].name}`);
            }
        }, state);
    }
    setupDevTools() {
        if (PLATFORM.global.devToolsExtension) {
            this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe((message) => {
                this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)](`DevTools sent change ${message.type}`);
                if (message.type === "ACTION" && message.payload) {
                    const byName = Array.from(this.actions).find(function ([reducer]) {
                        return reducer.name === message.payload.name;
                    });
                    const action = this.lookupAction(message.payload.name) || byName && byName[0];
                    if (!action) {
                        throw new Error("Tried to remotely dispatch an unregistered action");
                    }
                    if (!message.payload.args || message.payload.args.length < 1) {
                        throw new Error("No action arguments provided");
                    }
                    this.dispatch(action, ...message.payload.args.slice(1).map((arg) => JSON.parse(arg)));
                    return;
                }
                if (message.type === "DISPATCH" && message.payload) {
                    switch (message.payload.type) {
                        case "JUMP_TO_STATE":
                        case "JUMP_TO_ACTION":
                            this._state.next(JSON.parse(message.state));
                            return;
                        case "COMMIT":
                            this.devTools.init(this._state.getValue());
                            return;
                        case "RESET":
                            this.devTools.init(this.initialState);
                            this.resetToState(this.initialState);
                            return;
                        case "ROLLBACK":
                            const parsedState = JSON.parse(message.state);
                            this.resetToState(parsedState);
                            this.devTools.init(parsedState);
                            return;
                    }
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
    mark(markName) {
        this._markNames.add(markName);
        PLATFORM.performance.mark(markName);
    }
    clearMarks() {
        this._markNames.forEach((markName) => PLATFORM.performance.clearMarks(markName));
        this._markNames.clear();
    }
    measure(measureName, startMarkName, endMarkName) {
        this._measureNames.add(measureName);
        PLATFORM.performance.measure(measureName, startMarkName, endMarkName);
    }
    clearMeasures() {
        this._measureNames.forEach((measureName) => PLATFORM.performance.clearMeasures(measureName));
        this._measureNames.clear();
    }
}
function dispatchify(action) {
    const store = Container.instance.get(Store);
    return function (...params) {
        return store.dispatch(action, ...params);
    };
}

async function executeSteps(store, shouldLogResults, ...steps) {
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
            store.state.pipe(skip(currentStep), take(1), delay(0)).subscribe(tryStep(logStep(step, currentStep), reject));
            currentStep++;
        });
        store.state.pipe(skip(currentStep), take(1)).subscribe(lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
    });
}

const defaultSelector = (store) => store.state;
function connectTo(settings) {
    let $store;
    // const store = Container.instance.get(Store) as Store<T>;
    const _settings = Object.assign({ selector: typeof settings === "function" ? settings : defaultSelector }, settings);
    function getSource(selector) {
        // if for some reason getSource is invoked before setup (bind lifecycle, typically)
        // then we have no choice but to get the store instance from global container instance
        // otherwise, assume that $store variable in the closure would be already assigned the right
        // value from created callback
        // Could also be in situation where it doesn't come from custom element, or some exotic setups/scenarios
        const store = $store || ($store = Container.instance.get(Store));
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

export { DEFAULT_LOCAL_STORAGE_KEY, LogLevel, LoggerIndexed, MiddlewarePlacement, PerformanceMeasurement, Store, UnregisteredActionError, applyLimits, configure, connectTo, dispatchify, executeSteps, getLogType, isStateHistory, jump, localStorageMiddleware, logMiddleware, nextStateHistory, rehydrateFromLocalStorage };
