export type Middleware<T> = (state: T, originalState?: T, settings?: any) => T | Promise<T | undefined> | void;
export enum MiddlewarePlacement {
  Before = "before",
  After = "after"
}

export function logMiddleware<T>(state: T) {
  console.log("New state: ", state);
}

export function localStorageMiddleware<T>(state: T) {
  if (window.localStorage) {
    window.localStorage.setItem("aurelia-store-state", JSON.stringify(state));
  }
}

export function rehydrateFromLocalStorage<T>(state: T) {
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
