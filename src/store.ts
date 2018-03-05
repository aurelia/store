import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import {
  autoinject,
  Container,
  LogManager,
  PLATFORM
} from "aurelia-framework";

import { jump, applyLimits, HistoryOptions, isStateHistory } from "./history";
import { Middleware, MiddlewarePlacement } from "./middleware";
import { LogDefinitions, LogLevel, getLogType } from "./logging";

export type Reducer<T> = (state: T, ...params: any[]) => T | Promise<T>;

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

  private logger = LogManager.getLogger("aurelia-store");
  private devToolsAvailable: boolean = false;
  private devTools: any;
  private actions: Map<Reducer<T>, { name: string }> = new Map();
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

  public registerAction(name: string, reducer: Reducer<T>) {
    if (reducer.length === 0) {
      throw new Error("The reducer is expected to have one or more parameters, where the first will be the present state");
    }

    this.actions.set(reducer, { name });
  }

  public unregisterAction(reducer: Reducer<T>) {
    if (this.actions.has(reducer)) {
      this.actions.delete(reducer);
    }
  }

  public dispatch(reducer: Reducer<T>, ...params: any[]) {
    const result = new Promise((resolve, reject) => {
      this.dispatchQueue.push({ reducer, params, resolve, reject });
      if (this.dispatchQueue.length === 1) {
        this.handleQueue();
      }
    });

    return result;
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
    performance.mark("dispatch-start");

    const action = this.actions.get(reducer);

    if (this.options.logDispatchedActions) {
      this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)](`Dispatching: ${action!.name}`);
    }

    const beforeMiddleswaresResult = await this.executeMiddlewares(
      this._state.getValue(),
      MiddlewarePlacement.Before
    );
    const result = reducer(beforeMiddleswaresResult, ...params);
    performance.mark("dispatch-after-reducer-" + action!.name);

    if (!result && typeof result !== "object") {
      throw new Error("The reducer has to return a new state");
    }

    const apply = async (newState: T) => {
      let resultingState = await this.executeMiddlewares(
        newState,
        MiddlewarePlacement.After
      );

      if (isStateHistory(resultingState) &&
        this.options.history &&
        this.options.history.limit) {
        resultingState = applyLimits(resultingState, this.options.history.limit);
      }

      this._state.next(resultingState);
      performance.mark("dispatch-end");

      if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
        performance.measure(
          "startEndDispatchDuration",
          "dispatch-start",
          "dispatch-end"
        );

        const measures = performance.getEntriesByName("startEndDispatchDuration");
        this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
          `Total duration ${measures[0].duration} of dispatched action ${action!.name}:`,
          measures
        );
      } else if (this.options.measurePerformance === PerformanceMeasurement.All) {
        const marks = performance.getEntriesByType("mark");
        const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
        this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
          `Total duration ${totalDuration} of dispatched action ${action!.name}:`,
          marks
        );
      }

      performance.clearMarks();
      performance.clearMeasures();

      this.updateDevToolsState(action!.name, newState);
    }

    if (typeof (result as Promise<T>).then === "function") {
      await apply(await result);
    } else {
      await apply(result as T);
    }

  }

  private executeMiddlewares(state: T, placement: MiddlewarePlacement): T {
    return Array.from(this.middlewares)
      .filter((middleware) => middleware[1].placement === placement)
      .reduce(async (prev: any, curr, _, _arr) => {
        try {
          const result = await curr[0](await prev, this._state.getValue(), curr[1].settings);
          return result || await prev;
        } catch (e) {
          if (this.options.propagateError) {
            _arr = [];
            throw e;
          }

          return await prev;
        } finally {
          performance.mark(`dispatch-${placement}-${curr[0].name}`);
        }
      }, state);
  }

  private setupDevTools() {
    if (PLATFORM.global.devToolsExtension) {
      this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
      this.devToolsAvailable = true;
      this.devTools = PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect();
      this.devTools.init(this.initialState);

      this.devTools.subscribe((message: any) => {
        this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)](`DevTools sent change ${message.type}`);

        if (message.type === "DISPATCH") {
          this._state.next(JSON.parse(message.state));
        }
      });
    }
  }

  private updateDevToolsState(action: string, state: T) {
    if (this.devToolsAvailable) {
      this.devTools.send(action, state);
    }
  }

  private registerHistoryMethods() {
    this.registerAction("jump", jump as any as Reducer<T>);
  }
}

export function dispatchify<T>(action: Reducer<T>) {
  const store = Container.instance.get(Store);

  return function (...params: any[]) {
    store.dispatch(action, ...params);
  }
}
