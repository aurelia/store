export interface CallingAction {
    name: string;
    params?: any[];
}
export declare type Middleware<T> = (state: T, originalState?: T, settings?: any, action?: CallingAction) => T | Promise<T | undefined | false> | void | false;
export declare enum MiddlewarePlacement {
    Before = "before",
    After = "after",
}
export declare function logMiddleware<T>(state: T, _: T, settings?: any): void;
export declare function localStorageMiddleware<T>(state: T, _: T, settings?: any): void;
export declare function rehydrateFromLocalStorage<T>(state: T, key?: string): any;
