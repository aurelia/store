var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { autoinject, Container, LogManager } from "aurelia-framework";
import { jump, applyLimits, isStateHistory } from "./history";
import { MiddlewarePlacement } from "./middleware";
import { LogLevel, getLogType } from "./logging";
export var PerformanceMeasurement;
(function (PerformanceMeasurement) {
    PerformanceMeasurement["StartEnd"] = "startEnd";
    PerformanceMeasurement["All"] = "all";
})(PerformanceMeasurement || (PerformanceMeasurement = {}));
var Store = /** @class */ (function () {
    function Store(initialState, options) {
        this.initialState = initialState;
        this.logger = LogManager.getLogger("aurelia-store");
        this.devToolsAvailable = false;
        this.actions = new Map();
        this.middlewares = new Map();
        this.dispatchQueue = [];
        this.options = options || {};
        var isUndoable = this.options.history && this.options.history.undoable === true;
        this._state = new BehaviorSubject(initialState);
        this.state = this._state.asObservable();
        this.setupDevTools();
        if (isUndoable) {
            this.registerHistoryMethods();
        }
    }
    Store.prototype.registerMiddleware = function (reducer, placement) {
        this.middlewares.set(reducer, { placement: placement, reducer: reducer });
    };
    Store.prototype.unregisterMiddleware = function (reducer) {
        if (this.middlewares.has(reducer)) {
            this.middlewares.delete(reducer);
        }
    };
    Store.prototype.registerAction = function (name, reducer) {
        if (reducer.length === 0) {
            throw new Error("The reducer is expected to have one or more parameters, where the first will be the present state");
        }
        this.actions.set(reducer, { name: name, reducer: reducer });
    };
    Store.prototype.dispatch = function (reducer) {
        var _this = this;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var result = new Promise(function (resolve, reject) {
            _this.dispatchQueue.push({ reducer: reducer, params: params, resolve: resolve, reject: reject });
            if (_this.dispatchQueue.length === 1) {
                _this.handleQueue();
            }
        });
        return result;
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
            var _this = this;
            var action, beforeMiddleswaresResult, result, apply, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.actions.has(reducer)) {
                            throw new Error("Tried to dispatch an unregistered action " + reducer.name);
                        }
                        performance.mark("dispatch-start");
                        if (this.options.logDispatchedActions) {
                            this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)]("Dispatching: " + reducer.name);
                        }
                        action = this.actions.get(reducer);
                        return [4 /*yield*/, this.executeMiddlewares(this._state.getValue(), MiddlewarePlacement.Before)];
                    case 1:
                        beforeMiddleswaresResult = _c.sent();
                        result = (_b = action).reducer.apply(_b, [beforeMiddleswaresResult].concat(params));
                        performance.mark("dispatch-after-reducer-" + reducer.name);
                        if (!result && typeof result !== "object") {
                            throw new Error("The reducer has to return a new state");
                        }
                        apply = function (newState) { return __awaiter(_this, void 0, void 0, function () {
                            var resultingState, measures, marks, totalDuration;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.executeMiddlewares(newState, MiddlewarePlacement.After)];
                                    case 1:
                                        resultingState = _a.sent();
                                        if (isStateHistory(resultingState) &&
                                            this.options.history &&
                                            this.options.history.limit) {
                                            resultingState = applyLimits(resultingState, this.options.history.limit);
                                        }
                                        this._state.next(resultingState);
                                        performance.mark("dispatch-end");
                                        if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
                                            performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
                                            measures = performance.getEntriesByName("startEndDispatchDuration");
                                            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)]("Total duration " + measures[0].duration + " of dispatched action " + reducer.name + ":", measures);
                                        }
                                        else if (this.options.measurePerformance === PerformanceMeasurement.All) {
                                            marks = performance.getEntriesByType("mark");
                                            totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
                                            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)]("Total duration " + totalDuration + " of dispatched action " + reducer.name + ":", marks);
                                        }
                                        performance.clearMarks();
                                        performance.clearMeasures();
                                        this.updateDevToolsState(action.name, newState);
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        if (!(typeof result.then === "function")) return [3 /*break*/, 4];
                        _a = apply;
                        return [4 /*yield*/, result];
                    case 2: return [4 /*yield*/, _a.apply(void 0, [_c.sent()])];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, apply(result)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Store.prototype.executeMiddlewares = function (state, placement) {
        var _this = this;
        return Array.from(this.middlewares.values())
            .filter(function (middleware) { return middleware.placement === placement; })
            .map(function (middleware) { return middleware.reducer; })
            .reduce(function (prev, curr, _, _arr) { return __awaiter(_this, void 0, void 0, function () {
            var result, _a, _b, e_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, 7, 8]);
                        _a = curr;
                        return [4 /*yield*/, prev];
                    case 1: return [4 /*yield*/, _a.apply(void 0, [_c.sent(), (placement === MiddlewarePlacement.After) ? this._state.getValue() : undefined])];
                    case 2:
                        result = _c.sent();
                        _b = result;
                        if (_b) return [3 /*break*/, 4];
                        return [4 /*yield*/, prev];
                    case 3:
                        _b = (_c.sent());
                        _c.label = 4;
                    case 4: return [2 /*return*/, _b];
                    case 5:
                        e_2 = _c.sent();
                        if (this.options.propagateError) {
                            _arr = [];
                            throw e_2;
                        }
                        return [4 /*yield*/, prev];
                    case 6: return [2 /*return*/, _c.sent()];
                    case 7:
                        performance.mark("dispatch-" + placement + "-" + curr.name);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); }, state);
    };
    Store.prototype.setupDevTools = function () {
        var _this = this;
        if (window.devToolsExtension) {
            this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
            this.devTools.init(this.initialState);
            this.devTools.subscribe(function (message) {
                _this.logger[getLogType(_this.options, "devToolsStatus", LogLevel.debug)]("DevTools sent change " + message.type);
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
        this.registerAction("jump", jump);
    };
    Store = __decorate([
        autoinject()
    ], Store);
    return Store;
}());
export { Store };
export function dispatchify(action) {
    var store = Container.instance.get(Store);
    return function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        store.dispatch.apply(store, [action].concat(params));
    };
}
