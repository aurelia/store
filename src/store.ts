import { BehaviorSubject, Observable } from "rxjs";

import {
  autoinject,
  Container,
  LogManager,
  PLATFORM
} from "aurelia-framework";

import { jump, applyLimits, HistoryOptions, isStateHistory } from "./history";
import { Middleware, MiddlewarePlacement, CallingAction } from "./middleware";
import { LogDefinitions, LogLevel, getLogType, LoggerIndexed } from "./logging";

export type Reducer<T> = (state: T, ...params: any[]) => T | false | Promise<T | false>;

export enum PerformanceMeasurement {
  StartEnd = "startEnd",
  All = "all"
}

export interface Action<T = any> {
  type: T;
}

export interface ActionCreator<T> {
  (...args: any[]): T;
}


export interface DevToolsOptions {
  /**
   * the instance name to be showed on the monitor page. Default value is `document.title`.
   * If not specified and there's no document title, it will consist of `tabId` and `instanceId`.
   */
  name?: string;
  /**
   * action creators functions to be available in the Dispatcher.
   */
  actionCreators?: ActionCreator<any>[] | {[key: string]: ActionCreator<any>};
  /**
   * if more than one action is dispatched in the indicated interval, all new actions will be collected and sent at once.
   * It is the joint between performance and speed. When set to `0`, all actions will be sent instantly.
   * Set it to a higher value when experiencing perf issues (also `maxAge` to a lower value).
   *
   * @default 500 ms.
   */
  latency?: number;
  /**
   * (> 1) - maximum allowed actions to be stored in the history tree. The oldest actions are removed once maxAge is reached. It's critical for performance.
   *
   * @default 50
   */
  maxAge?: number;
  /**
   * - `undefined` - will use regular `JSON.stringify` to send data (it's the fast mode).
   * - `false` - will handle also circular references.
   * - `true` - will handle also date, regex, undefined, error objects, symbols, maps, sets and functions.
   * - object, which contains `date`, `regex`, `undefined`, `error`, `symbol`, `map`, `set` and `function` keys.
   *   For each of them you can indicate if to include (by setting as `true`).
   *   For `function` key you can also specify a custom function which handles serialization.
   *   See [`jsan`](https://github.com/kolodny/jsan) for more details.
   */
  serialize?: boolean | {
    date?: boolean;
    regex?: boolean;
    undefined?: boolean;
    error?: boolean;
    symbol?: boolean;
    map?: boolean;
    set?: boolean;
    function?: boolean | Function;
  };
  /**
   * function which takes `action` object and id number as arguments, and should return `action` object back.
   */
  actionSanitizer?: <A extends Action>(action: A, id: number) => A;
  /**
   * function which takes `state` object and index as arguments, and should return `state` object back.
   */
  stateSanitizer?: <S>(state: S, index: number) => S;
  /**
   * *array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsWhitelist` specified, `actionsBlacklist` is ignored.
   */
  actionsBlacklist?: string[];
  /**
   * *array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsWhitelist` specified, `actionsBlacklist` is ignored.
   */
  actionsWhitelist?: string[];
  /**
   * called for every action before sending, takes `state` and `action` object, and returns `true` in case it allows sending the current data to the monitor.
   * Use it as a more advanced version of `actionsBlacklist`/`actionsWhitelist` parameters.
   */
  predicate?: <S, A extends Action>(state: S, action: A) => boolean;
  /**
   * if specified as `false`, it will not record the changes till clicking on `Start recording` button.
   * Available only for Redux enhancer, for others use `autoPause`.
   *
   * @default true
   */
  shouldRecordChanges?: boolean;
  /**
   * if specified, whenever clicking on `Pause recording` button and there are actions in the history log, will add this action type.
   * If not specified, will commit when paused. Available only for Redux enhancer.
   *
   * @default "@@PAUSED""
   */
  pauseActionType?: string;
  /**
   * auto pauses when the extension’s window is not opened, and so has zero impact on your app when not in use.
   * Not available for Redux enhancer (as it already does it but storing the data to be sent).
   *
   * @default false
   */
  autoPause?: boolean;
  /**
   * if specified as `true`, it will not allow any non-monitor actions to be dispatched till clicking on `Unlock changes` button.
   * Available only for Redux enhancer.
   *
   * @default false
   */
  shouldStartLocked?: boolean;
  /**
   * if set to `false`, will not recompute the states on hot reloading (or on replacing the reducers). Available only for Redux enhancer.
   *
   * @default true
   */
  shouldHotReload?: boolean;
  /**
   * if specified as `true`, whenever there's an exception in reducers, the monitors will show the error message, and next actions will not be dispatched.
   *
   * @default false
   */
  shouldCatchErrors?: boolean;
  /**
   * If you want to restrict the extension, specify the features you allow.
   * If not specified, all of the features are enabled. When set as an object, only those included as `true` will be allowed.
   * Note that except `true`/`false`, `import` and `export` can be set as `custom` (which is by default for Redux enhancer), meaning that the importing/exporting occurs on the client side.
   * Otherwise, you'll get/set the data right from the monitor part.
   */
  features?: {
    /**
     * start/pause recording of dispatched actions
     */
    pause?: boolean;
    /**
     * lock/unlock dispatching actions and side effects
     */
    lock?: boolean;
    /**
     * persist states on page reloading
     */
    persist?: boolean;
    /**
     * export history of actions in a file
     */
    export?: boolean | "custom";
    /**
     * import history of actions from a file
     */
    import?: boolean | "custom";
    /**
     * jump back and forth (time travelling)
     */
    jump?: boolean;
    /**
     * skip (cancel) actions
     */
    skip?: boolean;
    /**
     * drag and drop actions in the history list
     */
    reorder?: boolean;
    /**
     * dispatch custom actions or action creators
     */
    dispatch?: boolean;
    /**
     * generate tests for the selected actions
     */
    test?: boolean;
  };
}

export interface StoreOptions {
  history: Partial<HistoryOptions>;
  logDispatchedActions?: boolean;
  measurePerformance?: PerformanceMeasurement;
  propagateError?: boolean;
  logDefinitions?: LogDefinitions;
  devToolsOptions?: DevToolsOptions;
}

interface DispatchQueueItem<T> {
  reducer: Reducer<T>;
  params: any[];
  resolve: any;
  reject: any;
}

@autoinject()
export class Store<T> {
  public readonly state: Observable<T>;

  private logger = LogManager.getLogger("aurelia-store") as LoggerIndexed;
  private devToolsAvailable: boolean = false;
  private devTools: any;
  private actions: Map<Reducer<T>, Action<string>> = new Map();
  private middlewares: Map<Middleware<T>, { placement: MiddlewarePlacement, settings?: any }> = new Map();
  private _state: BehaviorSubject<T>;
  private options: Partial<StoreOptions>;

  private dispatchQueue: DispatchQueueItem<T>[] = [];

  constructor(private initialState: T, options?: Partial<StoreOptions>) {
    this.options = options || {};
    const isUndoable = this.options.history && this.options.history.undoable === true;
    this._state = new BehaviorSubject<T>(initialState);
    this.state = this._state.asObservable();

    this.setupDevTools();

    if (isUndoable) {
      this.registerHistoryMethods();
    }
  }

  public registerMiddleware(reducer: Middleware<T>, placement: MiddlewarePlacement, settings?: any) {
    this.middlewares.set(reducer, { placement, settings });
  }

  public unregisterMiddleware(reducer: Middleware<T>) {
    if (this.middlewares.has(reducer)) {
      this.middlewares.delete(reducer);
    }
  }

  public isMiddlewareRegistered(middleware: Middleware<T>) {
    return this.middlewares.has(middleware);
  }

  public registerAction(name: string, reducer: Reducer<T>) {
    if (reducer.length === 0) {
      throw new Error("The reducer is expected to have one or more parameters, where the first will be the present state");
    }

    this.actions.set(reducer, { type: name });
  }

  public unregisterAction(reducer: Reducer<T>) {
    if (this.actions.has(reducer)) {
      this.actions.delete(reducer);
    }
  }

  public isActionRegistered(reducer: Reducer<T> | string) {
    if (typeof reducer === "string") {
      return Array.from(this.actions).find((action) => action[1].type === reducer) !== undefined;
    }

    return this.actions.has(reducer);
  }

  public dispatch(reducer: Reducer<T> | string, ...params: any[]) {
    let action: Reducer<T>;

    if (typeof reducer === "string") {
      const result = Array.from(this.actions)
        .find((val) => val[1].type === reducer);

      if (result) {
        action = result[0];
      }
    } else {
      action = reducer;
    }

    return new Promise<void>((resolve, reject) => {
      this.dispatchQueue.push({ reducer: action, params, resolve, reject });
      if (this.dispatchQueue.length === 1) {
        this.handleQueue();
      }
    });
  }

  private async handleQueue() {
    if (this.dispatchQueue.length > 0) {
      const queueItem = this.dispatchQueue[0];

      try {
        await this.internalDispatch(queueItem.reducer, ...queueItem.params);
        queueItem.resolve();
      } catch (e) {
        queueItem.reject(e);
      }

      this.dispatchQueue.shift();
      this.handleQueue();
    }
  }

  private async internalDispatch(reducer: Reducer<T>, ...params: any[]) {
    if (!this.actions.has(reducer)) {
      throw new Error(`Tried to dispatch an unregistered action${reducer ? " " + reducer.name : ""}`);
    }
    PLATFORM.performance.mark("dispatch-start");

    const action = this.actions.get(reducer);

    if (this.options.logDispatchedActions) {
      this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)](`Dispatching: ${action!.type}`);
    }

    const beforeMiddleswaresResult = await this.executeMiddlewares(
      this._state.getValue(),
      MiddlewarePlacement.Before,
      {
        name: action!.type,
        params
      }
    );

    if (beforeMiddleswaresResult === false) {
      PLATFORM.performance.clearMarks();
      PLATFORM.performance.clearMeasures();

      return;
    }

    const result = await reducer(beforeMiddleswaresResult, ...params);
    if (result === false) {
      PLATFORM.performance.clearMarks();
      PLATFORM.performance.clearMeasures();

      return;
    }
    PLATFORM.performance.mark("dispatch-after-reducer-" + action!.type);

    if (!result && typeof result !== "object") {
      throw new Error("The reducer has to return a new state");
    }

    let resultingState = await this.executeMiddlewares(
      result,
      MiddlewarePlacement.After,
      {
        name: action!.type,
        params
      }
    );

    if (resultingState === false) {
      PLATFORM.performance.clearMarks();
      PLATFORM.performance.clearMeasures();

      return;
    }

    if (isStateHistory(resultingState) &&
      this.options.history &&
      this.options.history.limit) {
      resultingState = applyLimits(resultingState, this.options.history.limit);
    }

    this._state.next(resultingState);
    PLATFORM.performance.mark("dispatch-end");

    if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
      PLATFORM.performance.measure(
        "startEndDispatchDuration",
        "dispatch-start",
        "dispatch-end"
      );

      const measures = PLATFORM.performance.getEntriesByName("startEndDispatchDuration");
      this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
        `Total duration ${measures[0].duration} of dispatched action ${action!.type}:`,
        measures
      );
    } else if (this.options.measurePerformance === PerformanceMeasurement.All) {
      const marks = PLATFORM.performance.getEntriesByType("mark");
      const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
      this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
        `Total duration ${totalDuration} of dispatched action ${action!.type}:`,
        marks
      );
    }

    PLATFORM.performance.clearMarks();
    PLATFORM.performance.clearMeasures();

    this.updateDevToolsState(action!, resultingState);
  }

  private executeMiddlewares(state: T, placement: MiddlewarePlacement, action: CallingAction): T | false {
    return Array.from(this.middlewares)
      .filter((middleware) => middleware[1].placement === placement)
      .reduce(async (prev: any, curr, _, _arr) => {
        try {
          const result = await curr[0](await prev, this._state.getValue(), curr[1].settings, action);

          if (result === false) {
            _arr = [];

            return false;
          }

          return result || await prev;
        } catch (e) {
          if (this.options.propagateError) {
            _arr = [];
            throw e;
          }

          return await prev;
        } finally {
          PLATFORM.performance.mark(`dispatch-${placement}-${curr[0].name}`);
        }
      }, state);
  }

  private setupDevTools() {
    if (PLATFORM.global.devToolsExtension) {
      this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
      this.devToolsAvailable = true;
      this.devTools = PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
      this.devTools.init(this.initialState);

      this.devTools.subscribe((message: any) => {
        this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)](`DevTools sent change ${message.type}`);

        if (message.type === "DISPATCH") {
          this._state.next(JSON.parse(message.state));
        }
      });
    }
  }

  private updateDevToolsState(action: Action<string>, state: T) {
    if (this.devToolsAvailable) {
      this.devTools.send(action, state);
    }
  }

  private registerHistoryMethods() {
    this.registerAction("jump", jump as any as Reducer<T>);
  }
}

export function dispatchify<T>(action: Reducer<T> | string) {
  const store = Container.instance.get(Store);

  return function (...params: any[]) {
    return store.dispatch(action, ...params) as Promise<void>;
  }
}
