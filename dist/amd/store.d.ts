import { Observable } from "rxjs";
import { HistoryOptions } from "./history";
import { Middleware, MiddlewarePlacement } from "./middleware";
import { LogDefinitions } from "./logging";
export declare type Reducer<T, P extends any[] = any[]> = (state: T, ...params: P) => T | false | Promise<T | false>;
export declare enum PerformanceMeasurement {
    StartEnd = "startEnd",
    All = "all"
}
export interface DevToolsOptions {
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
}
export interface StoreOptions {
    history: Partial<HistoryOptions>;
    logDispatchedActions?: boolean;
    measurePerformance?: PerformanceMeasurement;
    propagateError?: boolean;
    logDefinitions?: LogDefinitions;
    devToolsOptions?: DevToolsOptions;
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
    isMiddlewareRegistered(middleware: Middleware<T>): boolean;
    registerAction(name: string, reducer: Reducer<T>): void;
    unregisterAction(reducer: Reducer<T>): void;
    isActionRegistered(reducer: Reducer<T> | string): boolean;
    dispatch<P extends any[]>(reducer: Reducer<T, P> | string, ...params: P): Promise<void>;
    private handleQueue;
    private internalDispatch;
    private executeMiddlewares;
    private setupDevTools;
    private updateDevToolsState;
    private registerHistoryMethods;
}
export declare function dispatchify<T, P extends any[]>(action: Reducer<T, P> | string): (...params: P) => Promise<void>;
