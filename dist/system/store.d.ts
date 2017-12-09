import { Observable } from "rxjs/Observable";
import { StateHistory } from "./history";
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
