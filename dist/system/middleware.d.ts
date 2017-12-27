export declare type Middleware<T> = (state: T, ...params: any[]) => T | Promise<T> | void;
export declare enum MiddlewarePlacement {
    Before = "before",
    After = "after",
}
export declare function logMiddleware<T>(state: T): void;
export declare function localStorageMiddleware<T>(state: T): void;
export declare function rehydrateFromLocalStorage<T>(state: T): any;
