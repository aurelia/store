import { Store } from "../../src/store";

export function createTestStore() {
  type testState = {
    foo: string
  };

  const initialState = { foo: "bar" };
  const store: Store<testState> = new Store(initialState);

  return { initialState, store };
}
