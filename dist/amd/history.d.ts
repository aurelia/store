import { NextState } from "./store";
export interface StateHistory<T> {
    past: T[];
    present: T;
    future: T[];
}
export interface HistoryOptions {
    undoable: boolean;
    limit?: number;
}
export declare function jump<T>(state: NextState<T>, n: number): NextState<T>;
export declare function nextStateHistory<T>(presentStateHistory: StateHistory<T>, nextPresent: T): StateHistory<T>;
export declare function applyLimits<T>(state: StateHistory<T>, limit: number): StateHistory<T>;
export declare function isStateHistory(history: any): boolean;
