import { Store } from "../../src/store";

export type testState = {
  foo: string
};

export function createTestStore(withUndo: boolean = false) {
  const initialState = { foo: "bar" };
  const store: Store<testState> = new Store(initialState, withUndo);

  return { initialState, store };
}

export function createStoreWithState<T>(state: T, withUndo = false) {
  return new Store<T>(state, withUndo);
}
