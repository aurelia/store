import { Observable } from "rxjs/Observable";
export declare class Store<T> {
    logger: any;
    devToolsAvailable: boolean;
    devTools: any;
    initialState: T;
    actions: Map<(state: T) => T, {
        name: string;
        reducer: (state: T) => T;
    }>;
    readonly state: Observable<T>;
    private _state;
    constructor(initialState: T);
    registerAction(name: string, reducer: (state: T) => T): void;
    dispatch(reducer: (state: T) => T): void;
    private setupDevTools();
    private updateDevToolsState(action, state);
}
