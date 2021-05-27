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

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
    var past = state.past, future = state.future, present = state.present;
    var newPast = __spreadArray(__spreadArray(__spreadArray([], past), [present]), future.slice(0, index));
    var newPresent = future[index];
    var newFuture = future.slice(index + 1);
    return { past: newPast, present: newPresent, future: newFuture };
}
function jumpToPast(state, index) {
    if (index < 0 || index >= state.past.length) {
        return state;
    }
    var past = state.past, future = state.future, present = state.present;
    var newPast = past.slice(0, index);
    var newFuture = __spreadArray(__spreadArray(__spreadArray([], past.slice(index + 1)), [present]), future);
    var newPresent = past[index];
    return { past: newPast, present: newPresent, future: newFuture };
}
function nextStateHistory(presentStateHistory, nextPresent) {
    return Object.assign({}, presentStateHistory, {
        past: __spreadArray(__spreadArray([], presentStateHistory.past), [presentStateHistory.present]),
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

var DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";
var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement || (MiddlewarePlacement = {}));
function logMiddleware(state, _, settings) {
    var logType = settings && settings.logType && console.hasOwnProperty(settings.logType) ? settings.logType : "log";
    console[logType]("New state: ", state);
}
function localStorageMiddleware(state, _, settings) {
    if (PLATFORM.global.localStorage) {
        var key = settings && settings.key || DEFAULT_LOCAL_STORAGE_KEY;
        PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
    }
}
function rehydrateFromLocalStorage(state, key) {
    if (!PLATFORM.global.localStorage) {
        return state;
    }
    var storedState = PLATFORM.global.localStorage.getItem(key || DEFAULT_LOCAL_STORAGE_KEY);
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
var LoggerIndexed = /** @class */ (function (_super) {
    __extends(LoggerIndexed, _super);
    function LoggerIndexed() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LoggerIndexed;
}(Logger));
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
var UnregisteredActionError = /** @class */ (function (_super) {
    __extends(UnregisteredActionError, _super);
    function UnregisteredActionError(reducer) {
        return _super.call(this, "Tried to dispatch an unregistered action " + (reducer && (typeof reducer === "string" ? reducer : reducer.name))) || this;
    }
    return UnregisteredActionError;
}(Error));
var Store = /** @class */ (function () {
    function Store(initialState, options) {
        this.initialState = initialState;
        this.logger = getLogger("aurelia-store");
        this.devToolsAvailable = false;
        this.actions = new Map();
        this.middlewares = new Map();
        this._markNames = new Set();
        this._measureNames = new Set();
        this.dispatchQueue = [];
        this.options = options || {};
        var isUndoable = this.options.history && this.options.history.undoable === true;
        this._state = new BehaviorSubject(initialState);
        this.state = this._state.asObservable();
        if (!this.options.devToolsOptions || this.options.devToolsOptions.disable !== true) {
            this.setupDevTools();
        }
        if (isUndoable) {
            this.registerHistoryMethods();
        }
    }
    Store.prototype.registerMiddleware = function (reducer, placement, settings) {
        this.middlewares.set(reducer, { placement: placement, settings: settings });
    };
    Store.prototype.unregisterMiddleware = function (reducer) {
        if (this.middlewares.has(reducer)) {
            this.middlewares.delete(reducer);
        }
    };
    Store.prototype.isMiddlewareRegistered = function (middleware) {
        return this.middlewares.has(middleware);
    };
    Store.prototype.registerAction = function (name, reducer) {
        if (reducer.length === 0) {
            throw new Error("The reducer is expected to have one or more parameters, where the first will be the present state");
        }
        this.actions.set(reducer, { type: name });
    };
    Store.prototype.unregisterAction = function (reducer) {
        if (this.actions.has(reducer)) {
            this.actions.delete(reducer);
        }
    };
    Store.prototype.isActionRegistered = function (reducer) {
        if (typeof reducer === "string") {
            return Array.from(this.actions).find(function (action) { return action[1].type === reducer; }) !== undefined;
        }
        return this.actions.has(reducer);
    };
    Store.prototype.resetToState = function (state) {
        this._state.next(state);
    };
    Store.prototype.dispatch = function (reducer) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var action = this.lookupAction(reducer);
        if (!action) {
            return Promise.reject(new UnregisteredActionError(reducer));
        }
        return this.queueDispatch([{
                reducer: action,
                params: params
            }]);
    };
    Store.prototype.pipe = function (reducer) {
        var _this = this;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var pipeline = [];
        var dispatchPipe = {
            dispatch: function () { return _this.queueDispatch(pipeline); },
            pipe: function (nextReducer) {
                var nextParams = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    nextParams[_i - 1] = arguments[_i];
                }
                var action = _this.lookupAction(nextReducer);
                if (!action) {
                    throw new UnregisteredActionError(reducer);
                }
                pipeline.push({ reducer: action, params: nextParams });
                return dispatchPipe;
            }
        };
        return dispatchPipe.pipe.apply(dispatchPipe, __spreadArray([reducer], params));
    };
    Store.prototype.lookupAction = function (reducer) {
        if (typeof reducer === "string") {
            var result = Array.from(this.actions).find(function (_a) {
                _a[0]; var action = _a[1];
                return action.type === reducer;
            });
            if (result) {
                return result[0];
            }
        }
        else if (this.actions.has(reducer)) {
            return reducer;
        }
        return undefined;
    };
    Store.prototype.queueDispatch = function (actions) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.dispatchQueue.push({ actions: actions, resolve: resolve, reject: reject });
            if (_this.dispatchQueue.length === 1) {
                _this.handleQueue();
            }
        });
    };
    Store.prototype.handleQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queueItem, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.dispatchQueue.length > 0)) return [3 /*break*/, 5];
                        queueItem = this.dispatchQueue[0];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.internalDispatch(queueItem.actions)];
                    case 2:
                        _a.sent();
                        queueItem.resolve();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        queueItem.reject(e_1);
                        return [3 /*break*/, 4];
                    case 4:
                        this.dispatchQueue.shift();
                        this.handleQueue();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Store.prototype.internalDispatch = function (actions) {
        return __awaiter(this, void 0, void 0, function () {
            var unregisteredAction, pipedActions, callingAction, beforeMiddleswaresResult, result, _i, pipedActions_1, action, resultingState, measures, marks, totalDuration;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        unregisteredAction = actions.find(function (a) { return !_this.actions.has(a.reducer); });
                        if (unregisteredAction) {
                            throw new UnregisteredActionError(unregisteredAction.reducer);
                        }
                        this.mark("dispatch-start");
                        pipedActions = actions.map(function (a) { return ({
                            type: _this.actions.get(a.reducer).type,
                            params: a.params,
                            reducer: a.reducer
                        }); });
                        callingAction = {
                            name: pipedActions.map(function (a) { return a.type; }).join("->"),
                            params: pipedActions.reduce(function (p, a) { return p.concat(a.params); }, []),
                            pipedActions: pipedActions.map(function (a) { return ({
                                name: a.type,
                                params: a.params
                            }); })
                        };
                        if (this.options.logDispatchedActions) {
                            this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)]("Dispatching: " + callingAction.name);
                        }
                        return [4 /*yield*/, this.executeMiddlewares(this._state.getValue(), MiddlewarePlacement.Before, callingAction)];
                    case 1:
                        beforeMiddleswaresResult = _a.sent();
                        if (beforeMiddleswaresResult === false) {
                            this.clearMarks();
                            this.clearMeasures();
                            return [2 /*return*/];
                        }
                        result = beforeMiddleswaresResult;
                        _i = 0, pipedActions_1 = pipedActions;
                        _a.label = 2;
                    case 2:
                        if (!(_i < pipedActions_1.length)) return [3 /*break*/, 5];
                        action = pipedActions_1[_i];
                        return [4 /*yield*/, action.reducer.apply(action, __spreadArray([result], action.params))];
                    case 3:
                        result = _a.sent();
                        if (result === false) {
                            this.clearMarks();
                            this.clearMeasures();
                            return [2 /*return*/];
                        }
                        this.mark("dispatch-after-reducer-" + action.type);
                        if (!result && typeof result !== "object") {
                            throw new Error("The reducer has to return a new state");
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.executeMiddlewares(result, MiddlewarePlacement.After, callingAction)];
                    case 6:
                        resultingState = _a.sent();
                        if (resultingState === false) {
                            this.clearMarks();
                            this.clearMeasures();
                            return [2 /*return*/];
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
                            measures = PLATFORM.performance.getEntriesByName("startEndDispatchDuration", "measure");
                            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)]("Total duration " + measures[0].duration + " of dispatched action " + callingAction.name + ":", measures);
                        }
                        else if (this.options.measurePerformance === PerformanceMeasurement.All) {
                            marks = PLATFORM.performance.getEntriesByType("mark");
                            totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
                            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)]("Total duration " + totalDuration + " of dispatched action " + callingAction.name + ":", marks);
                        }
                        this.clearMarks();
                        this.clearMeasures();
                        this.updateDevToolsState({ type: callingAction.name, params: callingAction.params }, resultingState);
                        return [2 /*return*/];
                }
            });
        });
    };
    Store.prototype.executeMiddlewares = function (state, placement, action) {
        var _this = this;
        return Array.from(this.middlewares)
            .filter(function (middleware) { return middleware[1].placement === placement; })
            .reduce(function (prev, curr, _, _arr) { return __awaiter(_this, void 0, void 0, function () {
            var result, _a, _b, _c, e_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 7, 8]);
                        _b = (_a = curr)[0];
                        return [4 /*yield*/, prev];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_d.sent(), this._state.getValue(), curr[1].settings, action])];
                    case 2:
                        result = _d.sent();
                        if (result === false) {
                            return [2 /*return*/, false];
                        }
                        _c = result;
                        if (_c) return [3 /*break*/, 4];
                        return [4 /*yield*/, prev];
                    case 3:
                        _c = (_d.sent());
                        _d.label = 4;
                    case 4: return [2 /*return*/, _c];
                    case 5:
                        e_2 = _d.sent();
                        if (this.options.propagateError) {
                            throw e_2;
                        }
                        return [4 /*yield*/, prev];
                    case 6: return [2 /*return*/, _d.sent()];
                    case 7:
                        this.mark("dispatch-" + placement + "-" + curr[0].name);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); }, state);
    };
    Store.prototype.setupDevTools = function () {
        var _this = this;
        if (PLATFORM.global.devToolsExtension) {
            this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe(function (message) {
                _this.logger[getLogType(_this.options, "devToolsStatus", LogLevel.debug)]("DevTools sent change " + message.type);
                if (message.type === "ACTION" && message.payload) {
                    var byName = Array.from(_this.actions).find(function (_a) {
                        var reducer = _a[0];
                        return reducer.name === message.payload.name;
                    });
                    var action = _this.lookupAction(message.payload.name) || byName && byName[0];
                    if (!action) {
                        throw new Error("Tried to remotely dispatch an unregistered action");
                    }
                    if (!message.payload.args || message.payload.args.length < 1) {
                        throw new Error("No action arguments provided");
                    }
                    _this.dispatch.apply(_this, __spreadArray([action], message.payload.args.slice(1).map(function (arg) { return JSON.parse(arg); })));
                    return;
                }
                if (message.type === "DISPATCH" && message.payload) {
                    switch (message.payload.type) {
                        case "JUMP_TO_STATE":
                        case "JUMP_TO_ACTION":
                            _this._state.next(JSON.parse(message.state));
                            return;
                        case "COMMIT":
                            _this.devTools.init(_this._state.getValue());
                            return;
                        case "RESET":
                            _this.devTools.init(_this.initialState);
                            _this.resetToState(_this.initialState);
                            return;
                        case "ROLLBACK":
                            var parsedState = JSON.parse(message.state);
                            _this.resetToState(parsedState);
                            _this.devTools.init(parsedState);
                            return;
                    }
                }
            });
        }
    };
    Store.prototype.updateDevToolsState = function (action, state) {
        if (this.devToolsAvailable) {
            this.devTools.send(action, state);
        }
    };
    Store.prototype.registerHistoryMethods = function () {
        this.registerAction("jump", jump);
    };
    Store.prototype.mark = function (markName) {
        this._markNames.add(markName);
        PLATFORM.performance.mark(markName);
    };
    Store.prototype.clearMarks = function () {
        this._markNames.forEach(function (markName) {
            return PLATFORM.performance.clearMarks(markName);
        });
        this._markNames.clear();
    };
    Store.prototype.measure = function (measureName, startMarkName, endMarkName) {
        this._measureNames.add(measureName);
        PLATFORM.performance.measure(measureName, startMarkName, endMarkName);
    };
    Store.prototype.clearMeasures = function () {
        this._measureNames.forEach(function (measureName) {
            return PLATFORM.performance.clearMeasures(measureName);
        });
        this._measureNames.clear();
    };
    return Store;
}());
function dispatchify(action) {
    var store = Container.instance.get(Store);
    return function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return store.dispatch.apply(store, __spreadArray([action], params));
    };
}

function executeSteps(store, shouldLogResults) {
    var steps = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        steps[_i - 2] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var logStep, tryStep, lastStep;
        return __generator(this, function (_a) {
            logStep = function (step, stepIdx) { return function (res) {
                if (shouldLogResults) {
                    console.group("Step " + stepIdx);
                    console.log(res);
                    console.groupEnd();
                }
                step(res);
            }; };
            tryStep = function (step, reject) {
                return function (res) {
                    try {
                        step(res);
                    }
                    catch (err) {
                        reject(err);
                    }
                };
            };
            lastStep = function (step, resolve) {
                return function (res) {
                    step(res);
                    resolve();
                };
            };
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var currentStep = 0;
                    steps.slice(0, -1).forEach(function (step) {
                        store.state.pipe(skip(currentStep), take(1), delay(0)).subscribe(tryStep(logStep(step, currentStep), reject));
                        currentStep++;
                    });
                    store.state.pipe(skip(currentStep), take(1)).subscribe(lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
                })];
        });
    });
}

var defaultSelector = function (store) { return store.state; };
function connectTo(settings) {
    var $store;
    // const store = Container.instance.get(Store) as Store<T>;
    var _settings = __assign({ selector: typeof settings === "function" ? settings : defaultSelector }, settings);
    function getSource(selector) {
        // if for some reason getSource is invoked before setup (bind lifecycle, typically)
        // then we have no choice but to get the store instance from global container instance
        // otherwise, assume that $store variable in the closure would be already assigned the right
        // value from created callback
        // Could also be in situation where it doesn't come from custom element, or some exotic setups/scenarios
        var store = $store || ($store = Container.instance.get(Store));
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
            var _b;
            var target = _a[0], selector = _a[1];
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
        var originalCreated = target.prototype.created;
        var originalSetup = typeof settings === "object" && settings.setup
            ? target.prototype[settings.setup]
            : target.prototype.bind;
        var originalTeardown = typeof settings === "object" && settings.teardown
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

function configure(aurelia, options) {
    if (!options || !options.initialState) {
        throw new Error("initialState must be provided via options");
    }
    var initState = options.initialState;
    if (options && options.history && options.history.undoable && !isStateHistory(options.initialState)) {
        initState = { past: [], present: options.initialState, future: [] };
    }
    delete options.initialState;
    aurelia.container
        .registerInstance(Store, new Store(initState, options));
}

export { DEFAULT_LOCAL_STORAGE_KEY, LogLevel, LoggerIndexed, MiddlewarePlacement, PerformanceMeasurement, Store, UnregisteredActionError, applyLimits, configure, connectTo, dispatchify, executeSteps, getLogType, isStateHistory, jump, localStorageMiddleware, logMiddleware, nextStateHistory, rehydrateFromLocalStorage };
