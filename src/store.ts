import { BehaviorSubject, Observable } from "rxjs";

import { Container } from "aurelia-dependency-injection"
import { getLogger } from "aurelia-logging"
import { PLATFORM } from "aurelia-pal";

import { jump, applyLimits, HistoryOptions, isStateHistory } from "./history";
import { Middleware, MiddlewarePlacement, CallingAction } from "./middleware";
import { LogDefinitions, LogLevel, getLogType, LoggerIndexed } from "./logging";
import { DevToolsOptions, Action } from "./devtools";

export type Reducer<T, P extends any[] = any[]> = (state: T, ...params: P) => T | false | Promise<T | false>;

export enum PerformanceMeasurement {
  StartEnd = "startEnd",
  All = "all"
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

export class Store<T> {
  public readonly state: Observable<T>;

  private logger = getLogger("aurelia-store") as LoggerIndexed;
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
      
    if (!this.options.devToolsOptions || this.options.devToolsOptions.disable !== true) {
      this.setupDevTools();
    }

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

  public resetToState(state: T) {
    this._state.next(state);
  }

  public dispatch<P extends any[]>(reducer: Reducer<T, P> | string, ...params: P) {
    let action: Reducer<T, P>;

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
      this.dispatchQueue.push({ reducer: action, params, resolve, reject } as any);
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

    const action = {
      type: this.actions.get(reducer)!.type,
      params
    };

    if (this.options.logDispatchedActions) {
      this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)](`Dispatching: ${action.type}`);
    }

    const beforeMiddleswaresResult = await this.executeMiddlewares(
      this._state.getValue(),
      MiddlewarePlacement.Before,
      {
        name: action.type,
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
    PLATFORM.performance.mark("dispatch-after-reducer-" + action.type);

    if (!result && typeof result !== "object") {
      throw new Error("The reducer has to return a new state");
    }

    let resultingState = await this.executeMiddlewares(
      result,
      MiddlewarePlacement.After,
      {
        name: action.type,
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
        `Total duration ${measures[0].duration} of dispatched action ${action.type}:`,
        measures
      );
    } else if (this.options.measurePerformance === PerformanceMeasurement.All) {
      const marks = PLATFORM.performance.getEntriesByType("mark");
      const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
      this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
        `Total duration ${totalDuration} of dispatched action ${action.type}:`,
        marks
      );
    }

    PLATFORM.performance.clearMarks();
    PLATFORM.performance.clearMeasures();

    this.updateDevToolsState(action, resultingState);
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

export function dispatchify<T, P extends any[]>(action: Reducer<T, P> | string) {
  const store = Container.instance.get(Store);

  return function (...params: P) {
    return store.dispatch(action, ...params) as Promise<void>;
  }
}
