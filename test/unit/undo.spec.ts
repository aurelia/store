import "rxjs/add/operator/skip";

import { executeSteps } from "../../src/test-helpers";
import { Store, NextState } from "../../src/store";
import { createTestStore, testState } from "./helpers";
import { jump, StateHistory } from "../../src/history";

describe("an undoable store", () => {
  it("should accept an initial state", done => {
    const { initialState, store } = createTestStore(true);

    store.state.subscribe((state: StateHistory<testState>) => {
      expect(state.present).toEqual(initialState);
      done();
    });
  });

  it("should only accept reducers taking at least one parameter", () => {
    const { initialState, store } = createTestStore(true);
    const fakeAction = () => { };

    expect(() => {
      store.registerAction("FakeAction", fakeAction as any);
    }).toThrowError();
  });

  it("should force reducers to return a new state", () => {
    const { initialState, store } = createTestStore(true);
    const fakeAction = (currentState) => { };

    store.registerAction("FakeAction", fakeAction as any);

    expect(() => {
      store.dispatch(fakeAction as any);
    }).toThrowError();
  });

  it("should accept reducers taking multiple parameters", done => {
    const { initialState, store } = createTestStore(true);
    const fakeAction = (currentState, param1, param2) => {
      return Object.assign({}, currentState, { present: { foo: param1 + param2 } });
    };

    store.registerAction("FakeAction", fakeAction as any);
    store.dispatch(fakeAction, "A", "B");

    store.state.subscribe((state: StateHistory<testState>) => {
      expect(state.present.foo).toEqual("AB");
      done();
    });
  });

  it("should queue the next state after dispatching an action", done => {
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: StateHistory<testState>) => {
      return Object.assign({}, currentState, { present: modifiedState });
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.subscribe((state: StateHistory<testState>) => {
      expect(state.present).toEqual(modifiedState);
      done();
    });
  });

  it("should support promised actions", done => {
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState) => Promise.resolve({ past: [], present: modifiedState, future: [] });

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    // since the async action is coming at a later time we need to skip the initial state
    store.state.skip(1).subscribe((state: StateHistory<testState>) => {
      expect(state.present).toEqual(modifiedState);
      done();
    });
  });

  it("should provide easy means to test sequences", async () => {
    expect.assertions(3);
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };

    const actionA = (currentState) => Promise.resolve({ past: [], present: { foo: "A" }, future: [] });
    const actionB = (currentState) => Promise.resolve({ past: [], present: { foo: "B" }, future: [] });
    const actionC = (currentState) => Promise.resolve({ past: [], present: { foo: "C" }, future: [] });
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      (res) => store.dispatch(actionA),
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res: StateHistory<testState>) => { expect(res.present.foo).toBe("B"); store.dispatch(actionC); },
      (res: StateHistory<testState>) => expect(res.present.foo).toBe("C")
    );
  });

  it("should jump back and forth in time", async () => {    
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };

    const actionA = (currentState) => Promise.resolve(Object.assign({}, currentState, { past: [...currentState.past, currentState.present], present: { foo: "A" }, future: [] }));
    const actionB = (currentState) => Promise.resolve(Object.assign({}, currentState, { past: [...currentState.past, currentState.present], present: { foo: "B" }, future: [] }));
    const actionC = (currentState) => Promise.resolve(Object.assign({}, currentState, { past: [...currentState.past, currentState.present], present: { foo: "C" }, future: [] }));
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
