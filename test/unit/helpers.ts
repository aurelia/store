import { Store } from "../../src/store";

export type testState = {
  foo: string
};

export function createTestStore(withUndo: boolean = false) {
  const initialState = { foo: "bar" };
  const options = withUndo ? { history: { undoable: true }} : {};
  const store: Store<testState> = new Store(initialState, options);

  return { initialState, store };
}

export function createStoreWithState<T>(state: T, withUndo = false) {
  const options = withUndo ? { history: { undoable: true }} : {};
  return new Store<T>(state, options);
}

export function createStoreWithStateAndOptions<T>(state: T, options) {
  return new Store<T>(state, options);
}
