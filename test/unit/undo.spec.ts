import "rxjs/add/operator/skip";

import { executeSteps } from "../../src/test-helpers";
import { createTestStore, testState, createStoreWithStateAndOptions } from "./helpers";
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

  it("should limit the resulting states past if option is passed", async () => {
    const initialState: testState = { foo: "bar" };
    const limit = 3;
    const store = createStoreWithStateAndOptions(initialState, { history: { undoable: true, limit } });
    const fakeAction = (currentState, idx) => Promise.resolve(nextStateHistory(currentState, { foo: idx.toString() }));

    store.registerAction("FakeAction", fakeAction);

    await executeSteps(
      store,
      false,
      ...Array.from(new Array(limit + limit)).map((a, idx) => {
        return (res: StateHistory<testState>) => {
          store.dispatch(fakeAction, idx + 1);

          expect(res.past.length).toBe(idx >= limit ? limit : idx);
        };
      }),
      (res: StateHistory<testState>) => {
        expect(res.past.length).toBe(limit)
        expect(res.past.map(i => i.foo)).toEqual(Array.from(new Array(limit)).map((a, idx) => (limit + idx).toString()));
      }
    );
  });

  it("should limit the resulting states future if option is passed", async () => {
    const initialState: testState = { foo: "bar" };
    const limit = 3;
    const store = createStoreWithStateAndOptions(initialState, { history: { undoable: true, limit } });
    const stateAfterInitial = {
      past: Array.from(new Array(limit)).map((a, idx) => ({ foo: idx.toString() })),
      present: { foo: "x" },
      future: Array.from(new Array(limit)).map((a, idx) => ({ foo: (limit + idx).toString() }))
    };

    const fakeAction = (currentState) => {
      return Promise.resolve(stateAfterInitial);
    };

    store.registerAction("FakeAction", fakeAction);

    await executeSteps(
      store,
      false,
      (res: StateHistory<testState>) => store.dispatch(fakeAction),
      (res: StateHistory<testState>) => { expect(res).toEqual(stateAfterInitial); store.dispatch(jump, - limit); },
      (res: StateHistory<testState>) => {
        expect(res.future.length).toBe(limit);
        expect(res.present).toEqual(stateAfterInitial.past[0]);
        expect(res.past).toEqual([]);
        expect(res.future).toEqual([ ...stateAfterInitial.past.slice(1), stateAfterInitial.present]);
      }
    );
  });
});
