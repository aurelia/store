import { NextState } from "./store";

export type Middleware<T> = (state: NextState<T>, ...params: any[]) => NextState<T> | Promise<NextState<T>> | void;
export enum MiddlewarePlacement {
  Before = "before",
  After = "after"
}

export function logMiddleware<T>(state: NextState<T>) {
  console.log("New state: ", state);
}

export function localStorageMiddleware<T>(state: NextState<T>) {
  if (window.localStorage) {
    window.localStorage.setItem("aurelia-store-state", JSON.stringify(state));
  }
}

export function rehydrateFromLocalStorage<T>(state: NextState<T>) {
  if (!window.localStorage) {
    return state;
  }

  const storedState = window.localStorage.getItem("aurelia-store-state");
  if (!storedState) {
    return state;
  }

  try {
    return JSON.parse(storedState!);
  } catch (e) { }

  return state;
}
