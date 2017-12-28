export declare type Middleware<T> = (state: T, originalState?: T) => T | Promise<T | undefined> | void;
export declare enum MiddlewarePlacement {
    Before = "before",
    After = "after",
}
export declare function logMiddleware<T>(state: T): void;
export declare function localStorageMiddleware<T>(state: T): void;
export declare function rehydrateFromLocalStorage<T>(state: T): any;
