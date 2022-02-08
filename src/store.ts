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
  history?: Partial<HistoryOptions>;
  logDispatchedActions?: boolean;
  measurePerformance?: PerformanceMeasurement;
  propagateError?: boolean;
  logDefinitions?: LogDefinitions;
  devToolsOptions?: DevToolsOptions;
}

export interface PipedDispatch<T> {
  pipe: <P extends any[]>(reducer: Reducer<T, P> | string, ...params: P) => PipedDispatch<T>;
  dispatch: () => Promise<void>;
}

interface DispatchAction<T> {
  reducer: Reducer<T>;
  params: any[];
}

interface DispatchQueueItem<T> {
  actions: DispatchAction<T>[];
  resolve: any;
  reject: any;
}

export class UnregisteredActionError<T, P extends any[]> extends Error {
  constructor(reducer?: string | Reducer<T, P>) {
    super(`Tried to dispatch an unregistered action ${reducer && (typeof reducer === "string" ? reducer : reducer.name)}`);
  }
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
  private _markNames: Set<string> = new Set<string>();
  private _measureNames: Set<string> = new Set<string>();

  private dispatchQueue: DispatchQueueItem<T>[] = [];

  constructor(private initialState: T, options?: Partial<StoreOptions>) {
    this.options = options || {};
    const isUndoable = this.options.history && this.options.history.undoable === true;
    this._state = new BehaviorSubject<T>(initialState);
    this.state = this._state.asObservable();

    if (!this.options.devToolsOptions || (this.options.devToolsOptions as any).disable !== true) {
      this.setupDevTools();
    }

    if (isUndoable) {
      this.registerHistoryMethods();
    }
  }

  public registerMiddleware<S extends undefined>(reducer: Middleware<T, undefined>, placement: MiddlewarePlacement): void;
  public registerMiddleware<S extends NonNullable<any>>(reducer: Middleware<T, S>, placement: MiddlewarePlacement, settings: S): void;
  public registerMiddleware<S>(reducer: Middleware<T, S>, placement: MiddlewarePlacement, settings?: S) {
    this.middlewares.set(reducer, { placement, settings });
  }

  public unregisterMiddleware(reducer: Middleware<T, any>) {
    if (this.middlewares.has(reducer)) {
      this.middlewares.delete(reducer);
    }
  }

  public isMiddlewareRegistered(middleware: Middleware<T, any>) {
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

  public dispatch<P extends any[]>(reducer: Reducer<T, P> | string, ...params: P): Promise<void> {
    const action = this.lookupAction(reducer as Reducer<T> | string);
    if (!action) {
      return Promise.reject(new UnregisteredActionError(reducer));
    }

    return this.queueDispatch([{
      reducer: action,
      params
    }]);
  }

  public pipe<P extends any[]>(reducer: Reducer<T, P> | string, ...params: P): PipedDispatch<T> {
    const pipeline: DispatchAction<T>[] = [];

    const dispatchPipe: PipedDispatch<T> = {
      dispatch: () => this.queueDispatch(pipeline),
      pipe: <NextP extends any[]>(nextReducer: Reducer<T, NextP> | string, ...nextParams: NextP) => {
        const action = this.lookupAction(nextReducer as Reducer<T> | string);
        if (!action) {
          throw new UnregisteredActionError(reducer);
        }
        pipeline.push({ reducer: action, params: nextParams });
        return dispatchPipe;
      }
    };

    return dispatchPipe.pipe(reducer, ...params);
  }

  private lookupAction(reducer: Reducer<T> | string): Reducer<T> | undefined {
    if (typeof reducer === "string") {
      const result = Array.from(this.actions).find(([_, action]) => action.type === reducer);
      if (result) {
        return result[0];
      }
    } else if (this.actions.has(reducer)) {
      return reducer;
    }

    return undefined;
  }

  private queueDispatch(actions: DispatchAction<T>[]) {
    return new Promise<void>((resolve, reject) => {
      this.dispatchQueue.push({ actions, resolve, reject });
      if (this.dispatchQueue.length === 1) {
        this.handleQueue();
      }
    });
  }

  private async handleQueue() {
    if (this.dispatchQueue.length > 0) {
      const queueItem = this.dispatchQueue[0];

      try {
        await this.internalDispatch(queueItem.actions);
        queueItem.resolve();
      } catch (e) {
        queueItem.reject(e);
      }

      this.dispatchQueue.shift();
      this.handleQueue();
    }
  }

  private async internalDispatch(actions: DispatchAction<T>[]) {
    const unregisteredAction = actions.find((a) => !this.actions.has(a.reducer));
    if (unregisteredAction) {
      throw new UnregisteredActionError(unregisteredAction.reducer);
    }

    this.mark("dispatch-start");

    const pipedActions = actions.map((a) => ({
      type: this.actions.get(a.reducer)!.type,
      params: a.params,
      reducer: a.reducer
    }));

    const callingAction: CallingAction = {
      name: pipedActions.map((a) => a.type).join("->"),
      params: pipedActions.reduce<any[]>((p, a) => p.concat(a.params), []),
      pipedActions: pipedActions.map((a) => ({
        name: a.type,
        params: a.params
      }))
    };

    if (this.options.logDispatchedActions) {
      this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)](`Dispatching: ${callingAction.name}`);
    }

    const beforeMiddleswaresResult = await this.executeMiddlewares(
      this._state.getValue(),
      MiddlewarePlacement.Before,
      callingAction
    );

    if (beforeMiddleswaresResult === false) {
      this.clearMarks();
      this.clearMeasures();

      return;
    }

    let result: T | false = beforeMiddleswaresResult;
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

    let resultingState = await this.executeMiddlewares(
      result,
      MiddlewarePlacement.After,
      callingAction
    );

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
      this.measure(
        "startEndDispatchDuration",
        "dispatch-start",
        "dispatch-end"
      );

      const measures = PLATFORM.performance.getEntriesByName("startEndDispatchDuration", "measure");
      this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
        `Total duration ${measures[0].duration} of dispatched action ${callingAction.name}:`,
        measures
      );
    } else if (this.options.measurePerformance === PerformanceMeasurement.All) {
      const marks = PLATFORM.performance.getEntriesByType("mark");
      const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
      this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
        `Total duration ${totalDuration} of dispatched action ${callingAction.name}:`,
        marks
      );
    }

    this.clearMarks();
    this.clearMeasures();

    this.updateDevToolsState({ type: callingAction.name, params: callingAction.params }, resultingState);
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
          this.mark(`dispatch-${placement}-${curr[0].name}`);
        }
      }, state);
  }

  private setupDevTools() {
    if (PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__) {
      this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
      this.devToolsAvailable = true;
      this.devTools = PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
      this.devTools.init(this.initialState);

      this.devTools.subscribe((message: any) => {
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

          this.dispatch(action, ...message.payload.args.slice(1).map((arg: string) => JSON.parse(arg)));
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

  private updateDevToolsState(action: Action<string>, state: T) {
    if (this.devToolsAvailable) {
      this.devTools.send(action, state);
    }
  }

  private registerHistoryMethods() {
    this.registerAction("jump", jump as Reducer<T>);
  }

  private mark(markName: string) {
    this._markNames.add(markName);
    PLATFORM.performance.mark(markName);
  }

  private clearMarks() {
    this._markNames.forEach((markName: string) =>
      PLATFORM.performance.clearMarks(markName));
    this._markNames.clear();
  }

  private measure(measureName: string, startMarkName: string, endMarkName: string) {
    this._measureNames.add(measureName);
    PLATFORM.performance.measure(measureName, startMarkName, endMarkName)
  }

  private clearMeasures() {
    this._measureNames.forEach((measureName: string) =>
      PLATFORM.performance.clearMeasures(measureName));
    this._measureNames.clear();
  }
}

export function dispatchify<T, P extends any[]>(action: Reducer<T, P> | string) {
  const store: Store<T> = Container.instance.get(Store);

  return function (...params: P) {
    return store.dispatch(action, ...params);
  }
}
