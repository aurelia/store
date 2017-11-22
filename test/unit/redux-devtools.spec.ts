import { createTestStore } from "./helpers";

describe("redux devtools", () => {
  it("should update Redux DevTools", done => {
    const { initialState, store } = createTestStore();

    const spy = jest.spyOn(store, "updateDevToolsState" as any);

    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState) => {
      return Object.assign({}, currentState, modifiedState);
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.subscribe((state) => {
      expect(spy).toHaveBeenCalled();

      spy.mockReset();
      spy.mockRestore();

      done();
    });
  });
});
