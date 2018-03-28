import { Observable } from "rxjs/Observable";
import { HistoryOptions } from "./history";
import { Middleware, MiddlewarePlacement } from "./middleware";
import { LogDefinitions } from "./logging";
export declare type Reducer<T> = (state: T, ...params: any[]) => T | false | Promise<T | false>;
export declare enum PerformanceMeasurement {
    StartEnd = "startEnd",
    All = "all",
}
export interface StoreOptions {
    history: Partial<HistoryOptions>;
    logDispatchedActions?: boolean;
    measurePerformance?: PerformanceMeasurement;
    propagateError?: boolean;
    logDefinitions?: LogDefinitions;
}
export declare class Store<T> {
    private initialState;
    readonly state: Observable<T>;
    private logger;
    private devToolsAvailable;
    private devTools;
    private actions;
    private middlewares;
    private _state;
    private options;
    private dispatchQueue;
    constructor(initialState: T, options?: Partial<StoreOptions>);
    registerMiddleware(reducer: Middleware<T>, placement: MiddlewarePlacement, settings?: any): void;
    unregisterMiddleware(reducer: Middleware<T>): void;
    registerAction(name: string, reducer: Reducer<T>): void;
    unregisterAction(reducer: Reducer<T>): void;
    dispatch(reducer: Reducer<T>, ...params: any[]): Promise<void>;
    private handleQueue();
    private internalDispatch(reducer, ...params);
    private executeMiddlewares(state, placement, action);
    private setupDevTools();
    private updateDevToolsState(action, state);
    private registerHistoryMethods();
}
export declare function dispatchify<T>(action: Reducer<T>): (...params: any[]) => void;
