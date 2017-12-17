import { NextState } from "./store";
export interface StateHistory<T> {
    past: T[];
    present: T;
    future: T[];
}
export declare function jump<T>(state: NextState<T>, n: number): NextState<T>;
export declare function nextStateHistory<T>(presentStateHistory: StateHistory<T>, nextPresent: T): StateHistory<T>;
