System.register(["rxjs", "aurelia-dependency-injection", "aurelia-logging", "aurelia-pal", "./history", "./middleware", "./logging"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
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
    };
    var rxjs_1, aurelia_dependency_injection_1, aurelia_logging_1, aurelia_pal_1, history_1, middleware_1, logging_1, PerformanceMeasurement, Store;
    var __moduleName = context_1 && context_1.id;
    function dispatchify(action) {
        var store = aurelia_dependency_injection_1.Container.instance.get(Store);
        return function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            return store.dispatch.apply(store, [action].concat(params));
        };
    }
    exports_1("dispatchify", dispatchify);
    return {
        setters: [
            function (rxjs_1_1) {
                rxjs_1 = rxjs_1_1;
            },
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (aurelia_logging_1_1) {
                aurelia_logging_1 = aurelia_logging_1_1;
            },
            function (aurelia_pal_1_1) {
                aurelia_pal_1 = aurelia_pal_1_1;
            },
            function (history_1_1) {
                history_1 = history_1_1;
            },
            function (middleware_1_1) {
                middleware_1 = middleware_1_1;
            },
            function (logging_1_1) {
                logging_1 = logging_1_1;
            }
        ],
        execute: function () {
            (function (PerformanceMeasurement) {
                PerformanceMeasurement["StartEnd"] = "startEnd";
                PerformanceMeasurement["All"] = "all";
            })(PerformanceMeasurement || (PerformanceMeasurement = {}));
            exports_1("PerformanceMeasurement", PerformanceMeasurement);
            Store = /** @class */ (function () {
                function Store(initialState, options) {
                    this.initialState = initialState;
                    this.logger = aurelia_logging_1.getLogger("aurelia-store");
                    this.devToolsAvailable = false;
                    this.actions = new Map();
                    this.middlewares = new Map();
                    this.dispatchQueue = [];
                    this.options = options || {};
                    var isUndoable = this.options.history && this.options.history.undoable === true;
                    this._state = new rxjs_1.BehaviorSubject(initialState);
                    this.state = this._state.asObservable();
                    this.setupDevTools();
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
                    var _this = this;
                    var params = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        params[_i - 1] = arguments[_i];
                    }
                    var action;
                    if (typeof reducer === "string") {
                        var result = Array.from(this.actions)
                            .find(function (val) { return val[1].type === reducer; });
                        if (result) {
                            action = result[0];
                        }
                    }
                    else {
                        action = reducer;
                    }
                    return new Promise(function (resolve, reject) {
                        _this.dispatchQueue.push({ reducer: action, params: params, resolve: resolve, reject: reject });
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
                                    return [4 /*yield*/, this.internalDispatch.apply(this, [queueItem.reducer].concat(queueItem.params))];
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
                Store.prototype.internalDispatch = function (reducer) {
                    var params = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        params[_i - 1] = arguments[_i];
                    }
                    return __awaiter(this, void 0, void 0, function () {
                        var action, beforeMiddleswaresResult, result, resultingState, measures, marks, totalDuration;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!this.actions.has(reducer)) {
                                        throw new Error("Tried to dispatch an unregistered action" + (reducer ? " " + reducer.name : ""));
                                    }
                                    aurelia_pal_1.PLATFORM.performance.mark("dispatch-start");
                                    action = this.actions.get(reducer);
                                    if (this.options.logDispatchedActions) {
                                        this.logger[logging_1.getLogType(this.options, "dispatchedActions", logging_1.LogLevel.info)]("Dispatching: " + action.type);
                                    }
                                    return [4 /*yield*/, this.executeMiddlewares(this._state.getValue(), middleware_1.MiddlewarePlacement.Before, {
                                            name: action.type,
                                            params: params
                                        })];
                                case 1:
                                    beforeMiddleswaresResult = _a.sent();
                                    if (beforeMiddleswaresResult === false) {
                                        aurelia_pal_1.PLATFORM.performance.clearMarks();
                                        aurelia_pal_1.PLATFORM.performance.clearMeasures();
                                        return [2 /*return*/];
                                    }
                                    return [4 /*yield*/, reducer.apply(void 0, [beforeMiddleswaresResult].concat(params))];
                                case 2:
                                    result = _a.sent();
                                    if (result === false) {
                                        aurelia_pal_1.PLATFORM.performance.clearMarks();
                                        aurelia_pal_1.PLATFORM.performance.clearMeasures();
                                        return [2 /*return*/];
                                    }
                                    aurelia_pal_1.PLATFORM.performance.mark("dispatch-after-reducer-" + action.type);
                                    if (!result && typeof result !== "object") {
                                        throw new Error("The reducer has to return a new state");
                                    }
                                    return [4 /*yield*/, this.executeMiddlewares(result, middleware_1.MiddlewarePlacement.After, {
                                            name: action.type,
                                            params: params
                                        })];
                                case 3:
                                    resultingState = _a.sent();
                                    if (resultingState === false) {
                                        aurelia_pal_1.PLATFORM.performance.clearMarks();
                                        aurelia_pal_1.PLATFORM.performance.clearMeasures();
                                        return [2 /*return*/];
                                    }
                                    if (history_1.isStateHistory(resultingState) &&
                                        this.options.history &&
                                        this.options.history.limit) {
                                        resultingState = history_1.applyLimits(resultingState, this.options.history.limit);
                                    }
                                    this._state.next(resultingState);
                                    aurelia_pal_1.PLATFORM.performance.mark("dispatch-end");
                                    if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
                                        aurelia_pal_1.PLATFORM.performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
                                        measures = aurelia_pal_1.PLATFORM.performance.getEntriesByName("startEndDispatchDuration");
                                        this.logger[logging_1.getLogType(this.options, "performanceLog", logging_1.LogLevel.info)]("Total duration " + measures[0].duration + " of dispatched action " + action.type + ":", measures);
                                    }
                                    else if (this.options.measurePerformance === PerformanceMeasurement.All) {
                                        marks = aurelia_pal_1.PLATFORM.performance.getEntriesByType("mark");
                                        totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
                                        this.logger[logging_1.getLogType(this.options, "performanceLog", logging_1.LogLevel.info)]("Total duration " + totalDuration + " of dispatched action " + action.type + ":", marks);
                                    }
                                    aurelia_pal_1.PLATFORM.performance.clearMarks();
                                    aurelia_pal_1.PLATFORM.performance.clearMeasures();
                                    this.updateDevToolsState(action, resultingState);
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
                                        _arr = [];
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
                                        _arr = [];
                                        throw e_2;
                                    }
                                    return [4 /*yield*/, prev];
                                case 6: return [2 /*return*/, _d.sent()];
                                case 7:
                                    aurelia_pal_1.PLATFORM.performance.mark("dispatch-" + placement + "-" + curr[0].name);
                                    return [7 /*endfinally*/];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); }, state);
                };
                Store.prototype.setupDevTools = function () {
                    var _this = this;
                    if (aurelia_pal_1.PLATFORM.global.devToolsExtension) {
                        this.logger[logging_1.getLogType(this.options, "devToolsStatus", logging_1.LogLevel.debug)]("DevTools are available");
                        this.devToolsAvailable = true;
                        this.devTools = aurelia_pal_1.PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
                        this.devTools.init(this.initialState);
                        this.devTools.subscribe(function (message) {
                            _this.logger[logging_1.getLogType(_this.options, "devToolsStatus", logging_1.LogLevel.debug)]("DevTools sent change " + message.type);
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
                Store.prototype.registerHistoryMethods = function () {
                    this.registerAction("jump", history_1.jump);
                };
                return Store;
            }());
            exports_1("Store", Store);
        }
    };
});
//# sourceMappingURL=store.js.map