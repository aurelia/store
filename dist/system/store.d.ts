import { Observable } from "rxjs/Observable";
export declare type Reducer<T> = (state: T, ...params: any[]) => T | Promise<T>;
export declare class Store<T> {
    readonly state: Observable<T>;
    private logger;
    private devToolsAvailable;
    private devTools;
    private initialState;
    private actions;
    private _state;
    constructor(initialState: T);
    registerAction(name: string, reducer: Reducer<T>): void;
    dispatch(reducer: Reducer<T>, ...params: any[]): void;
    private setupDevTools();
    private updateDevToolsState(action, state);
}
