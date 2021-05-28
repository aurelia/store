(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('aurelia-dependency-injection'), require('aurelia-logging'), require('aurelia-pal'), require('rxjs/operators')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rxjs', 'aurelia-dependency-injection', 'aurelia-logging', 'aurelia-pal', 'rxjs/operators'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.au = global.au || {}, global.au.store = {}), global.rxjs, global.au, global.au.LogManager, global.au, global.rxjs));
}(this, (function (exports, rxjs, aureliaDependencyInjection, aureliaLogging, aureliaPal, operators) { 'use strict';

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

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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

  const DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";
  exports.MiddlewarePlacement = void 0;
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
          const key = settings && settings.key || DEFAULT_LOCAL_STORAGE_KEY;
          aureliaPal.PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
      }
  }
  function rehydrateFromLocalStorage(state, key) {
      if (!aureliaPal.PLATFORM.global.localStorage) {
          return state;
      }
      const storedState = aureliaPal.PLATFORM.global.localStorage.getItem(key || DEFAULT_LOCAL_STORAGE_KEY);
      if (!storedState) {
          return state;
      }
      try {
          return JSON.parse(storedState);
      }
      catch (e) { }
      return state;
  }

  exports.LogLevel = void 0;
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

  exports.PerformanceMeasurement = void 0;
  (function (PerformanceMeasurement) {
      PerformanceMeasurement["StartEnd"] = "startEnd";
      PerformanceMeasurement["All"] = "all";
  })(exports.PerformanceMeasurement || (exports.PerformanceMeasurement = {}));
  class UnregisteredActionError extends Error {
      constructor(reducer) {
          super(`Tried to dispatch an unregistered action ${reducer && (typeof reducer === "string" ? reducer : reducer.name)}`);
      }
  }
  class Store {
      constructor(initialState, options) {
          this.initialState = initialState;
          this.logger = aureliaLogging.getLogger("aurelia-store");
          this.devToolsAvailable = false;
          this.actions = new Map();
          this.middlewares = new Map();
          this._markNames = new Set();
          this._measureNames = new Set();
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
      handleQueue() {
          return __awaiter(this, void 0, void 0, function* () {
              if (this.dispatchQueue.length > 0) {
                  const queueItem = this.dispatchQueue[0];
                  try {
                      yield this.internalDispatch(queueItem.actions);
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
      internalDispatch(actions) {
          return __awaiter(this, void 0, void 0, function* () {
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
                  this.logger[getLogType(this.options, "dispatchedActions", exports.LogLevel.info)](`Dispatching: ${callingAction.name}`);
              }
              const beforeMiddleswaresResult = yield this.executeMiddlewares(this._state.getValue(), exports.MiddlewarePlacement.Before, callingAction);
              if (beforeMiddleswaresResult === false) {
                  this.clearMarks();
                  this.clearMeasures();
                  return;
              }
              let result = beforeMiddleswaresResult;
              for (const action of pipedActions) {
                  result = yield action.reducer(result, ...action.params);
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
              let resultingState = yield this.executeMiddlewares(result, exports.MiddlewarePlacement.After, callingAction);
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
              if (this.options.measurePerformance === exports.PerformanceMeasurement.StartEnd) {
                  this.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
                  const measures = aureliaPal.PLATFORM.performance.getEntriesByName("startEndDispatchDuration", "measure");
                  this.logger[getLogType(this.options, "performanceLog", exports.LogLevel.info)](`Total duration ${measures[0].duration} of dispatched action ${callingAction.name}:`, measures);
              }
              else if (this.options.measurePerformance === exports.PerformanceMeasurement.All) {
                  const marks = aureliaPal.PLATFORM.performance.getEntriesByType("mark");
                  const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
                  this.logger[getLogType(this.options, "performanceLog", exports.LogLevel.info)](`Total duration ${totalDuration} of dispatched action ${callingAction.name}:`, marks);
              }
              this.clearMarks();
              this.clearMeasures();
              this.updateDevToolsState({ type: callingAction.name, params: callingAction.params }, resultingState);
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
                  this.mark(`dispatch-${placement}-${curr[0].name}`);
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
          aureliaPal.PLATFORM.performance.mark(markName);
      }
      clearMarks() {
          this._markNames.forEach((markName) => aureliaPal.PLATFORM.performance.clearMarks(markName));
          this._markNames.clear();
      }
      measure(measureName, startMarkName, endMarkName) {
          this._measureNames.add(measureName);
          aureliaPal.PLATFORM.performance.measure(measureName, startMarkName, endMarkName);
      }
      clearMeasures() {
          this._measureNames.forEach((measureName) => aureliaPal.PLATFORM.performance.clearMeasures(measureName));
          this._measureNames.clear();
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

  exports.DEFAULT_LOCAL_STORAGE_KEY = DEFAULT_LOCAL_STORAGE_KEY;
  exports.LoggerIndexed = LoggerIndexed;
  exports.Store = Store;
  exports.UnregisteredActionError = UnregisteredActionError;
  exports.applyLimits = applyLimits;
  exports.configure = configure;
  exports.connectTo = connectTo;
  exports.dispatchify = dispatchify;
  exports.executeSteps = executeSteps;
  exports.getLogType = getLogType;
  exports.isStateHistory = isStateHistory;
  exports.jump = jump;
  exports.localStorageMiddleware = localStorageMiddleware;
  exports.logMiddleware = logMiddleware;
  exports.nextStateHistory = nextStateHistory;
  exports.rehydrateFromLocalStorage = rehydrateFromLocalStorage;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
