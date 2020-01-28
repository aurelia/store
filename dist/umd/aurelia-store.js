(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('aurelia-dependency-injection'), require('aurelia-logging'), require('aurelia-pal'), require('rxjs/operators')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rxjs', 'aurelia-dependency-injection', 'aurelia-logging', 'aurelia-pal', 'rxjs/operators'], factory) :
  (global = global || self, factory((global.au = global.au || {}, global.au.store = {}), global.rxjs, global.au, global.au.LogManager, global.au, global.rxjs));
}(this, function (exports, rxjs, aureliaDependencyInjection, aureliaLogging, aureliaPal, operators) { 'use strict';

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
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
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
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
      var newPast = past.concat([present], future.slice(0, index));
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
      var newFuture = past.slice(index + 1).concat([present], future);
      var newPresent = past[index];
      return { past: newPast, present: newPresent, future: newFuture };
  }
  function nextStateHistory(presentStateHistory, nextPresent) {
      return Object.assign({}, presentStateHistory, {
          past: presentStateHistory.past.concat([presentStateHistory.present]),
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
  (function (MiddlewarePlacement) {
      MiddlewarePlacement["Before"] = "before";
      MiddlewarePlacement["After"] = "after";
  })(exports.MiddlewarePlacement || (exports.MiddlewarePlacement = {}));
  function logMiddleware(state, _, settings) {
      var logType = settings && settings.logType && console.hasOwnProperty(settings.logType) ? settings.logType : "log";
      console[logType]("New state: ", state);
  }
  function localStorageMiddleware(state, _, settings) {
      if (aureliaPal.PLATFORM.global.localStorage) {
          var key = settings && settings.key || DEFAULT_LOCAL_STORAGE_KEY;
          aureliaPal.PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
      }
  }
  function rehydrateFromLocalStorage(state, key) {
      if (!aureliaPal.PLATFORM.global.localStorage) {
          return state;
      }
      var storedState = aureliaPal.PLATFORM.global.localStorage.getItem(key || DEFAULT_LOCAL_STORAGE_KEY);
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
  var LoggerIndexed = /** @class */ (function (_super) {
      __extends(LoggerIndexed, _super);
      function LoggerIndexed() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      return LoggerIndexed;
  }(aureliaLogging.Logger));
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
          this.logger = aureliaLogging.getLogger("aurelia-store");
          this.devToolsAvailable = false;
          this.actions = new Map();
          this.middlewares = new Map();
          this.dispatchQueue = [];
          this.options = options || {};
          var isUndoable = this.options.history && this.options.history.undoable === true;
          this._state = new rxjs.BehaviorSubject(initialState);
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
          return dispatchPipe.pipe.apply(dispatchPipe, [reducer].concat(params));
      };
      Store.prototype.lookupAction = function (reducer) {
          if (typeof reducer === "string") {
              var result = Array.from(this.actions).find(function (_a) {
                  var _ = _a[0], action = _a[1];
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
                          aureliaPal.PLATFORM.performance.mark("dispatch-start");
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
                              this.logger[getLogType(this.options, "dispatchedActions", exports.LogLevel.info)]("Dispatching: " + callingAction.name);
                          }
                          return [4 /*yield*/, this.executeMiddlewares(this._state.getValue(), exports.MiddlewarePlacement.Before, callingAction)];
                      case 1:
                          beforeMiddleswaresResult = _a.sent();
                          if (beforeMiddleswaresResult === false) {
                              aureliaPal.PLATFORM.performance.clearMarks();
                              aureliaPal.PLATFORM.performance.clearMeasures();
                              return [2 /*return*/];
                          }
                          result = beforeMiddleswaresResult;
                          _i = 0, pipedActions_1 = pipedActions;
                          _a.label = 2;
                      case 2:
                          if (!(_i < pipedActions_1.length)) return [3 /*break*/, 5];
                          action = pipedActions_1[_i];
                          return [4 /*yield*/, action.reducer.apply(action, [result].concat(action.params))];
                      case 3:
                          result = _a.sent();
                          if (result === false) {
                              aureliaPal.PLATFORM.performance.clearMarks();
                              aureliaPal.PLATFORM.performance.clearMeasures();
                              return [2 /*return*/];
                          }
                          aureliaPal.PLATFORM.performance.mark("dispatch-after-reducer-" + action.type);
                          if (!result && typeof result !== "object") {
                              throw new Error("The reducer has to return a new state");
                          }
                          _a.label = 4;
                      case 4:
                          _i++;
                          return [3 /*break*/, 2];
                      case 5: return [4 /*yield*/, this.executeMiddlewares(result, exports.MiddlewarePlacement.After, callingAction)];
                      case 6:
                          resultingState = _a.sent();
                          if (resultingState === false) {
                              aureliaPal.PLATFORM.performance.clearMarks();
                              aureliaPal.PLATFORM.performance.clearMeasures();
                              return [2 /*return*/];
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
                              measures = aureliaPal.PLATFORM.performance.getEntriesByName("startEndDispatchDuration");
                              this.logger[getLogType(this.options, "performanceLog", exports.LogLevel.info)]("Total duration " + measures[0].duration + " of dispatched action " + callingAction.name + ":", measures);
                          }
                          else if (this.options.measurePerformance === exports.PerformanceMeasurement.All) {
                              marks = aureliaPal.PLATFORM.performance.getEntriesByType("mark");
                              totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
                              this.logger[getLogType(this.options, "performanceLog", exports.LogLevel.info)]("Total duration " + totalDuration + " of dispatched action " + callingAction.name + ":", marks);
                          }
                          aureliaPal.PLATFORM.performance.clearMarks();
                          aureliaPal.PLATFORM.performance.clearMeasures();
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
                          aureliaPal.PLATFORM.performance.mark("dispatch-" + placement + "-" + curr[0].name);
                          return [7 /*endfinally*/];
                      case 8: return [2 /*return*/];
                  }
              });
          }); }, state);
      };
      Store.prototype.setupDevTools = function () {
          var _this = this;
          if (aureliaPal.PLATFORM.global.devToolsExtension) {
              this.logger[getLogType(this.options, "devToolsStatus", exports.LogLevel.debug)]("DevTools are available");
              this.devToolsAvailable = true;
              this.devTools = aureliaPal.PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
              this.devTools.init(this.initialState);
              this.devTools.subscribe(function (message) {
                  _this.logger[getLogType(_this.options, "devToolsStatus", exports.LogLevel.debug)]("DevTools sent change " + message.type);
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
      return Store;
  }());
  function dispatchify(action) {
      var store = aureliaDependencyInjection.Container.instance.get(Store);
      return function () {
          var params = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              params[_i] = arguments[_i];
          }
          return store.dispatch.apply(store, [action].concat(params));
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
                          store.state.pipe(operators.skip(currentStep), operators.take(1), operators.delay(0)).subscribe(tryStep(logStep(step, currentStep), reject));
                          currentStep++;
                      });
                      store.state.pipe(operators.skip(currentStep), operators.take(1)).subscribe(lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
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
          var store = $store || ($store = aureliaDependencyInjection.Container.instance.get(Store));
          var source = selector(store);
          if (source instanceof rxjs.Observable) {
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
      var initState = options.initialState;
      if (options && options.history && options.history.undoable && !isStateHistory(options.initialState)) {
          initState = { past: [], present: options.initialState, future: [] };
      }
      delete options.initialState;
      aurelia.container
          .registerInstance(Store, new Store(initState, options));
  }

  exports.configure = configure;
  exports.UnregisteredActionError = UnregisteredActionError;
  exports.Store = Store;
  exports.dispatchify = dispatchify;
  exports.executeSteps = executeSteps;
  exports.jump = jump;
  exports.nextStateHistory = nextStateHistory;
  exports.applyLimits = applyLimits;
  exports.isStateHistory = isStateHistory;
  exports.DEFAULT_LOCAL_STORAGE_KEY = DEFAULT_LOCAL_STORAGE_KEY;
  exports.logMiddleware = logMiddleware;
  exports.localStorageMiddleware = localStorageMiddleware;
  exports.rehydrateFromLocalStorage = rehydrateFromLocalStorage;
  exports.LoggerIndexed = LoggerIndexed;
  exports.getLogType = getLogType;
  exports.connectTo = connectTo;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
