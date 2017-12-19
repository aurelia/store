import { NextState } from "./store";
export declare type Middleware<T> = (state: NextState<T>, ...params: any[]) => NextState<T> | Promise<NextState<T>> | void;
export declare enum MiddlewarePlacement {
    Before = "before",
    After = "after",
}
export declare function logMiddleware<T>(state: NextState<T>): void;
export declare function localStorageMiddleware<T>(state: NextState<T>): void;
export declare function rehydrateFromLocalStorage<T>(state: NextState<T>): any;
