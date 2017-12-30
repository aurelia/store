import { Observable } from "rxjs/Observable";
import { Middleware, MiddlewarePlacement } from "./middleware";
import { HistoryOptions } from "./aurelia-store";
export declare type Reducer<T> = (state: T, ...params: any[]) => T | Promise<T>;
export declare enum PerformanceMeasurement {
    StartEnd = "startEnd",
    All = "all",
}
export interface StoreOptions {
    history: Partial<HistoryOptions>;
    logDispatchedActions?: boolean;
    measurePerformance?: PerformanceMeasurement;
    propagateError?: boolean;
}
export declare class Store<T> {
    private initialState;
    private options;
    readonly state: Observable<T>;
    private logger;
    private devToolsAvailable;
    private devTools;
    private actions;
    private middlewares;
    private _state;
    private dispatchQueue;
    constructor(initialState: T, options?: Partial<StoreOptions> | undefined);
    registerMiddleware(reducer: Middleware<T>, placement: MiddlewarePlacement): void;
    unregisterMiddleware(reducer: Middleware<T>): void;
    registerAction(name: string, reducer: Reducer<T>): void;
    dispatch(reducer: Reducer<T>, ...params: any[]): Promise<{}>;
    private handleQueue();
    private internalDispatch(reducer, ...params);
    private executeMiddlewares(state, placement);
    private setupDevTools();
    private updateDevToolsState(action, state);
    private registerHistoryMethods();
}
export declare function dispatchify<T>(action: Reducer<T>): (...params: any[]) => void;
