import { Observable } from "rxjs/Observable";
export interface StateHistory<T> {
    past: T[];
    current: T;
    future: T[];
}
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
    private _state;
    constructor(initialState: T, undoable?: boolean);
    registerAction(name: string, reducer: Reducer<T>): void;
    dispatch(reducer: Reducer<T>, ...params: any[]): void;
    private setupDevTools();
    private updateDevToolsState(action, state);
    private registerHistoryMethods();
}
export declare function jump<T>(state: NextState<T>, n: number): NextState<T>;
export declare function jumpToFuture<T>(state: NextState<T>, index: number): NextState<T>;
export declare function jumpToPast<T>(state: NextState<T>, index: number): NextState<T>;
