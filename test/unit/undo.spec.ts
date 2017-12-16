import "rxjs/add/operator/skip";

import { executeSteps } from "../../src/test-helpers";
import { Store, NextState } from "../../src/store";
import { createTestStore, testState } from "./helpers";
import { jump, StateHistory, nextStateHistory } from "../../src/history";

describe("an undoable store", () => {
  it("should jump back and forth in time", async () => {
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };

    const actionA = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));
    const actionC = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "C" }));
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      (res) => store.dispatch(actionA),
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("B"); store.dispatch(actionC); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("C"); store.dispatch(jump, -1); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, 1); },
      (res: StateHistory<testState>) => expect(res.present.foo).toBe("C")
    );
  });
});
