import { NextState } from "./store";

export interface StateHistory<T> {
  past: T[];
  present: T;
  future: T[];
}

export function jump<T>(state: NextState<T>, n: number) {
  if (n > 0) return jumpToFuture(state, n - 1)
  if (n < 0) return jumpToPast(state, (state as StateHistory<T>).past.length + n)

  return state;
}

function jumpToFuture<T>(state: NextState<T>, index: number): NextState<T> {
  if (index < 0 || index >= (state as StateHistory<T>).future.length) {
    return state;
  }

  const { past, future, present } = (state as StateHistory<T>);

  const newPast = [...past, present, ...future.slice(0, index)];
  const newPresent = future[index];
  const newFuture = future.slice(index + 1);

  return { past: newPast, present: newPresent, future: newFuture };
}

function jumpToPast<T>(state: NextState<T>, index: number): NextState<T> {
  if (index < 0 || index >= (state as StateHistory<T>).past.length) {
    return state;
  }

  const { past, future, present } = (state as StateHistory<T>);

  const newPast = past.slice(0, index);
  const newFuture = [...past.slice(index + 1), present, ...future];
  const newPresent = past[index];

  return { past: newPast, present: newPresent, future: newFuture } ;
}
