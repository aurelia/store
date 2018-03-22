import { PLATFORM } from "aurelia-pal";

export type Middleware<T> = (state: T, originalState?: T, settings?: any) => T | Promise<T | undefined | false> | void | false;
export enum MiddlewarePlacement {
  Before = "before",
  After = "after"
}

export function logMiddleware<T>(state: T, _: T, settings?: any) {
  if (settings && settings.logType && console.hasOwnProperty(settings.logType)) {
    (console as any)[settings.logType]("New state: ", state);
  } else {
    console.log("New state: ", state);
  }
}

export function localStorageMiddleware<T>(state: T, _: T, settings?: any) {
  if (PLATFORM.global.localStorage) {
    const key = settings && settings.key && typeof settings.key === "string"
      ? settings.key
      : "aurelia-store-state";

    PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
  }
}

export function rehydrateFromLocalStorage<T>(state: T, key?: string) {
  if (!PLATFORM.global.localStorage) {
    return state;
  }

  const storedState = PLATFORM.global.localStorage.getItem(key || "aurelia-store-state");
  if (!storedState) {
    return state;
  }

  try {
    return JSON.parse(storedState!);
  } catch (e) { }

  return state;
}
