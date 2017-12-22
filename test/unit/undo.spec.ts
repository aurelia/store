import "rxjs/add/operator/skip";

import { executeSteps } from "../../src/test-helpers";
import { createTestStore, testState } from "./helpers";
import { jump, StateHistory, nextStateHistory } from "../../src/history";

describe("an undoable store", () => {
  it("should jump back and forth in time", async () => {
    const { store } = createTestStore(true);

    const actionA = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));
    const actionC = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "C" }));
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("B"); store.dispatch(actionC); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("C"); store.dispatch(jump, -1); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, 1); },
      (res: StateHistory<testState>) => expect(res.present.foo).toBe("C")
    );
  });

  it("should return the same state if jumping zero times", async () => {
    const { store } = createTestStore(true);
    const actionA = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, 0); },
      (res: StateHistory<testState>) => expect(res.present.foo).toBe("B")
    );
  });

  it("should return the same state if jumping too far into future", async () => {
    const { store } = createTestStore(true);
    const actionA = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, 3); },
      (res: StateHistory<testState>) => expect(res.present.foo).toBe("B")
    );
  });

  it("should return the same state if jumping too far into past", async () => {
    const { store } = createTestStore(true);
    const actionA = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, -3); },
      (res: StateHistory<testState>) => expect(res.present.foo).toBe("B")
    );
  });
});
