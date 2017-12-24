import { Observable } from "rxjs/Observable";
import { StateHistory } from "./history";
import { Middleware, MiddlewarePlacement } from "./middleware";
export declare type NextState<T> = T | StateHistory<T>;
export declare type Reducer<T> = (state: NextState<T>, ...params: any[]) => NextState<T> | Promise<NextState<T>>;
export declare class Store<T> {
    private initialState;
    private undoable;
    readonly state: Observable<NextState<T>>;
    private logger;
    private devToolsAvailable;
    private devTools;
    private actions;
    private middlewares;
    private _state;
    constructor(initialState: T, undoable?: boolean);
    registerMiddleware(reducer: Middleware<T>, placement: MiddlewarePlacement): void;
    unregisterMiddleware(reducer: Middleware<T>): void;
    registerAction(name: string, reducer: Reducer<T>): void;
    dispatch(reducer: Reducer<T>, ...params: any[]): Promise<void>;
    private executeMiddlewares(state, placement);
    private setupDevTools();
    private updateDevToolsState(action, state);
    private registerHistoryMethods();
}
export declare function dispatchify<T>(action: Reducer<T>): (...params: any[]) => void;
