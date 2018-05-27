import { skip, delay } from "rxjs/operators";

import {
  createTestStore,
  testState
} from "./helpers";

describe("redux devtools", () => {
  it("should update Redux DevTools", done => {
    const { store } = createTestStore();

    const spy = jest.spyOn(store, "updateDevToolsState" as any);

    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: testState) => {
      return Object.assign({}, currentState, modifiedState);
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.pipe(
      skip(1),
      delay(1)
    ).subscribe(() => {
      expect(spy).toHaveBeenCalled();

      spy.mockReset();
      spy.mockRestore();
      done();
    });
  });
});
