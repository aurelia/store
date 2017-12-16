import { NextState } from "./store";

export type Middleware<T> = (state: NextState<T>, ...params: any[]) => NextState<T> | Promise<NextState<T>> | void;
export enum MiddlewarePlacement {
  Before = "before",
  After = "after"
}

export function logMiddleware<T>(state: NextState<T>) {
  console.log("New state: ", state);
}
